using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus;
using NHibernate.Linq;
using Shesha.Configuration.Runtime;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Linq.Expressions;
using System.Numerics;
using System.Reflection;
using System.Reflection.Emit;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Entities reorderer
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <typeparam name="TId"></typeparam>
    /// <typeparam name="TOrderIndex"></typeparam>
    public class EntityReorderer<T, TId, TOrderIndex> : IEntityReorderer<T, TId, TOrderIndex>, ITransientDependency 
        where T : Entity<TId> 
        where TId: IEquatable<TId>, IComparable<TId> 
        where TOrderIndex: IComparable<TOrderIndex>, INumber<TOrderIndex>
    {
        private readonly IRepository<T, TId> _repository;
        private readonly IEntityConfigurationStore _entityConfigStore;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        public IEventBus EventBus { get; set; }

        public EntityReorderer(IUnitOfWorkManager unitOfWorkManager, IRepository<T, TId> repository, IEntityConfigurationStore entityConfigStore)
        {
            _repository = repository;
            _entityConfigStore = entityConfigStore;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public async Task<IReorderResponse> ReorderAsync(ReorderRequest input, PropertyInfo orderIndexProperty)
        {
            var entityConfig = _entityConfigStore.Get(typeof(T));
            
            var idConverter = System.ComponentModel.TypeDescriptor.GetConverter(typeof(TId));
            if (!idConverter.CanConvertFrom(typeof(string)))
                throw new NotSupportedException($"Conversion of string to type `{typeof(TId).FullName}` is not supported");

            var passedItems = input.Items.Select(item => 
                {
                    var id = idConverter.ConvertFrom(item.Id);
                
                    return new ReorderingItem<TId, TOrderIndex>
                    {
                        OrderIndex = convertOrderIndex(item.OrderIndex),
                        Id = id != null ? (TId)id : throw new Exception($"Failed to convert id = '{item.Id}' to type '{typeof(TId).FullName}'")
                    };
                })
                .ToList();
            
            var ids = passedItems.Select(item => item.Id).ToList();

            var result = new ReorderResponse<TId, TOrderIndex>();

            // Note: SoftDelete should be disabled to speed-up the query and to prevent wrong calculations. We load entities by Id, so it's safe
            using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete)) 
            {
                var selectExpression = CreateSelectExpression(orderIndexProperty);
                
                // Step 1: Load ALL entities in the dataset to assess the complete ordering state
                var allEntities = await _repository.GetAll()
                    .Select(selectExpression)
                    .ToListAsync();
                
                // Step 2: Analyze the current ordering state  
                var entitiesWithOrder = allEntities.Where(item => !IsNullOrDefault(item.OrderIndex)).ToList();
                var entitiesWithoutOrder = allEntities.Where(item => IsNullOrDefault(item.OrderIndex)).ToList();
                var requestedEntityIds = new HashSet<TId>(ids);
                
                var partialType = CreatePartialType(orderIndexProperty.Name, orderIndexProperty.PropertyType);
                
                // Step 3: CRITICAL - Detect and resolve duplicate conflicts
                var conflictResolution = await DetectAndResolveDuplicateConflicts(
                    allEntities, entitiesWithOrder, entitiesWithoutOrder, 
                    passedItems, requestedEntityIds, partialType, orderIndexProperty);
                
                // Step 4: Apply resolved ordering (guaranteed duplicate-free)
                await ApplyResolvedOrdering(conflictResolution, partialType, orderIndexProperty, result);
            }

            _unitOfWorkManager.Current.Completed += (sender, args) => EventBus.Trigger<EntityReorderedEventData<T, TId>>(this, new EntityReorderedEventData<T, TId>(ids));

            return result;
        }

        private TOrderIndex convertOrderIndex(double orderIndex)
        {
            if (typeof(TOrderIndex) == typeof(int))
                return (TOrderIndex)(Convert.ToInt32(orderIndex) as object);

            if (typeof(TOrderIndex) == typeof(Int64))
                return (TOrderIndex)(Convert.ToInt64(orderIndex) as object);

            if (typeof(TOrderIndex) == typeof(Single))
                return (TOrderIndex)(Convert.ToSingle(orderIndex) as object);

            if (typeof(TOrderIndex) == typeof(decimal))
                return (TOrderIndex)(Convert.ToDecimal(orderIndex) as object);

            if (typeof(TOrderIndex) == typeof(double))
                return (TOrderIndex)(orderIndex as object);

            throw new NotSupportedException($"Conversion of double to `{typeof(TOrderIndex).FullName}` type is not supported");
        }

        private Expression<Func<T, bool>> GetFindByIdExpression(TId id) 
        {
            var entParam = Expression.Parameter(typeof(T), "ent");
            var equalityExpression = Expression.Equal(Expression.PropertyOrField(entParam, nameof(IEntity.Id)), Expression.Constant(id, typeof(TId)));
            var lambda = Expression.Lambda<Func<T, bool>>(equalityExpression, entParam);
            return lambda;
        }

        private Expression<Func<T, object>> GetUpdateExpression(Type partialType, string orderIndexPropertyName, object orderIndex)
        {
            var entParam = Expression.Parameter(typeof(T), "ent");

            // new statement "new {}"
            var constructor = partialType.GetConstructors().Where(c => c.GetParameters().Any()).Single();

            var orderIndexProperty = partialType.GetRequiredProperty(orderIndexPropertyName);
            var newExpression = Expression.New(constructor, new Expression[] { Expression.Constant(orderIndex) }, orderIndexProperty);

            var lambda = Expression.Lambda<Func<T, object>>(newExpression, entParam);
            return lambda;
        }

        private Expression<Func<T, ReorderingItem<TId, TOrderIndex>>> CreateSelectExpression(PropertyInfo orderIndexProperty)
        {
            // input parameter "ent"
            var entParam = Expression.Parameter(typeof(T), "ent");

            // new statement "new ReorderingItem()"
            var newExpression = Expression.New(typeof(ReorderingItem<TId, TOrderIndex>));

            var bindings = new MemberBinding[]{
                Expression.Bind(typeof(ReorderingItem<TId, TOrderIndex>).GetRequiredProperty(nameof(ReorderingItem<TId, TOrderIndex>.Id)), Expression.Property(entParam, typeof(T).GetRequiredProperty("Id"))),
                Expression.Bind(typeof(ReorderingItem<TId, TOrderIndex>).GetRequiredProperty(nameof(ReorderingItem<TId, TOrderIndex>.OrderIndex)), Expression.Property(entParam, orderIndexProperty)),
            };
            var initExpression = Expression.MemberInit(newExpression, bindings);

            // expression "ent => new Data { Id = ent.Id, OrderIndex = ent.OrderIndex }"
            var lambda = Expression.Lambda<Func<T, ReorderingItem<TId, TOrderIndex>>>(initExpression, entParam);

            return lambda;
        }

        private static ModuleBuilder _moduleBuilder;
        protected static ModuleBuilder ModuleBuilder { 
            get 
            {
                if (_moduleBuilder == null) 
                {
                    var dynamicAssemblyName = new AssemblyName("Dynamic.EntityReordering");
                    var dynamicAssembly = AssemblyBuilder.DefineDynamicAssembly(dynamicAssemblyName, AssemblyBuilderAccess.Run);
                    _moduleBuilder = dynamicAssembly.DefineDynamicModule("DynamicModule");
                }
                return _moduleBuilder;
            }  
        }

        public static Type CreatePartialType(string propertyName, Type propertyType)
        {
            var typeName = $"{typeof(T)}.{propertyName}";
            var type = ModuleBuilder.GetType(typeName);
            if (type == null) 
            {
                var typeBuilder = ModuleBuilder.DefineType(typeName, TypeAttributes.Public | TypeAttributes.Class, typeof(object), new Type[] { typeof(IHasOrderIndex) });
                typeBuilder.DefineDefaultConstructor(MethodAttributes.Public | MethodAttributes.SpecialName | MethodAttributes.RTSpecialName);

                var fieldBuilder = TypeBuilderHelper.CreateAutoProperty(typeBuilder, propertyName, propertyType);

                var field = fieldBuilder;

                #region constructor

                var constructorBuilder = typeBuilder.DefineConstructor(
                    MethodAttributes.Public | MethodAttributes.HideBySig | MethodAttributes.SpecialName | MethodAttributes.RTSpecialName,
                    CallingConventions.Standard,
                    new Type[] { propertyType }
                );
                var ctorIL = constructorBuilder.GetILGenerator();

                ctorIL.Emit(OpCodes.Ldarg_0); // Loads the argument at index 0 onto the evaluation stack.
                ctorIL.Emit(OpCodes.Ldarg_S, 1);
                ctorIL.Emit(OpCodes.Stfld, field); // Replaces the value stored in the field of an object reference or pointer with a new value.

                ctorIL.Emit(OpCodes.Ret);

                #endregion

                type = typeBuilder.CreateType();
            }
            return type;
        }

        /// <summary>
        /// Checks if the orderIndex value is null or default
        /// </summary>
        private bool IsNullOrDefault(TOrderIndex orderIndex)
        {
            return EqualityComparer<TOrderIndex>.Default.Equals(orderIndex, default(TOrderIndex));
        }

        public interface IHasOrderIndex 
        { 
        }

        /// <summary>
        /// Comprehensive duplicate detection and conflict resolution
        /// </summary>
        private async Task<OrderingResolution> DetectAndResolveDuplicateConflicts(
            List<ReorderingItem<TId, TOrderIndex>> allEntities,
            List<ReorderingItem<TId, TOrderIndex>> entitiesWithOrder,
            List<ReorderingItem<TId, TOrderIndex>> entitiesWithoutOrder,
            List<ReorderingItem<TId, TOrderIndex>> passedItems,
            HashSet<TId> requestedEntityIds,
            Type partialType,
            PropertyInfo orderIndexProperty)
        {
            var resolution = new OrderingResolution();
            
            // Step 1: Detect duplicates within user's request
            var userOrderGroups = passedItems.GroupBy(p => p.OrderIndex).ToList();
            var userDuplicates = userOrderGroups.Where(g => g.Count() > 1).ToList();
            
            // Step 2: Resolve user request duplicates by sequential assignment
            var resolvedUserItems = new List<ReorderingItem<TId, TOrderIndex>>();
            var usedOrderIndices = new HashSet<TOrderIndex>();
            
            foreach (var group in userOrderGroups)
            {
                if (group.Count() == 1)
                {
                    // No duplicate - keep original
                    var item = group.First();
                    resolvedUserItems.Add(item);
                    usedOrderIndices.Add(item.OrderIndex);
                }
                else
                {
                    // Duplicate found - resolve by creating sequence starting from intended value
                    var baseOrder = group.Key;
                    var duplicateItems = group.OrderBy(i => i.Id).ToList(); // Consistent ordering
                    
                    for (int i = 0; i < duplicateItems.Count; i++)
                    {
                        var resolvedOrder = FindNextAvailableOrder(baseOrder, i, usedOrderIndices, entitiesWithOrder);
                        resolvedUserItems.Add(new ReorderingItem<TId, TOrderIndex>
                        {
                            Id = duplicateItems[i].Id,
                            OrderIndex = resolvedOrder
                        });
                        usedOrderIndices.Add(resolvedOrder);
                    }
                }
            }
            
            // Step 3: Check for conflicts between resolved user items and existing entities
            var existingOrders = entitiesWithOrder
                .Where(e => !requestedEntityIds.Contains(e.Id))
                .Select(e => e.OrderIndex)
                .ToHashSet();
            
            var finalUserItems = new List<ReorderingItem<TId, TOrderIndex>>();
            foreach (var userItem in resolvedUserItems)
            {
                if (existingOrders.Contains(userItem.OrderIndex))
                {
                    // Conflict with existing entity - find alternative
                    var alternativeOrder = FindNextAvailableOrder(userItem.OrderIndex, 0, usedOrderIndices, entitiesWithOrder);
                    finalUserItems.Add(new ReorderingItem<TId, TOrderIndex>
                    {
                        Id = userItem.Id,
                        OrderIndex = alternativeOrder
                    });
                    usedOrderIndices.Add(alternativeOrder);
                }
                else
                {
                    finalUserItems.Add(userItem);
                }
            }
            
            resolution.ResolvedUserItems = finalUserItems;
            resolution.UsedOrderIndices = usedOrderIndices;
            
            // Step 4: Handle null entities (those not in user request)
            var nullEntitiesNotInRequest = entitiesWithoutOrder
                .Where(entity => !requestedEntityIds.Contains(entity.Id))
                .OrderBy(e => e.Id)
                .ToList();
            
            resolution.NullEntitiesAssignments = AssignOrderToNullEntities(
                nullEntitiesNotInRequest, usedOrderIndices, entitiesWithOrder);
            
            return resolution;
        }

        /// <summary>
        /// Finds the next available orderIndex value to avoid duplicates
        /// </summary>
        private TOrderIndex FindNextAvailableOrder(
            TOrderIndex baseOrder, 
            int offset,
            HashSet<TOrderIndex> usedIndices,
            List<ReorderingItem<TId, TOrderIndex>> existingEntities)
        {
            var allUsedIndices = new HashSet<TOrderIndex>(usedIndices);
            foreach (var entity in existingEntities)
            {
                allUsedIndices.Add(entity.OrderIndex);
            }
            
            var candidate = baseOrder;
            for (int i = 0; i <= offset; i++)
            {
                candidate += TOrderIndex.One;
            }
            
            // Find next available slot
            while (allUsedIndices.Contains(candidate))
            {
                candidate += TOrderIndex.One;
            }
            
            return candidate;
        }

        /// <summary>
        /// Assigns orderIndex values to null entities ensuring no duplicates
        /// </summary>
        private List<ReorderingItem<TId, TOrderIndex>> AssignOrderToNullEntities(
            List<ReorderingItem<TId, TOrderIndex>> nullEntities,
            HashSet<TOrderIndex> usedIndices,
            List<ReorderingItem<TId, TOrderIndex>> entitiesWithOrder)
        {
            var assignments = new List<ReorderingItem<TId, TOrderIndex>>();
            
            if (!nullEntities.Any()) return assignments;
            
            // Find the starting point for null entity assignments
            TOrderIndex startingOrder;
            if (!entitiesWithOrder.Any() && !usedIndices.Any())
            {
                // All entities are null and no user request
                startingOrder = TOrderIndex.One;
            }
            else
            {
                // Find max order and start after it
                var maxUsed = TOrderIndex.Zero;
                if (usedIndices.Any())
                    maxUsed = usedIndices.Max();
                if (entitiesWithOrder.Any())
                {
                    var maxExisting = entitiesWithOrder.Max(e => e.OrderIndex);
                    if (maxExisting > maxUsed)
                        maxUsed = maxExisting;
                }
                startingOrder = maxUsed + TOrderIndex.One;
            }
            
            var currentOrder = startingOrder;
            foreach (var nullEntity in nullEntities)
            {
                // Ensure we don't create duplicates
                while (usedIndices.Contains(currentOrder))
                {
                    currentOrder += TOrderIndex.One;
                }
                
                assignments.Add(new ReorderingItem<TId, TOrderIndex>
                {
                    Id = nullEntity.Id,
                    OrderIndex = currentOrder
                });
                
                usedIndices.Add(currentOrder);
                currentOrder += TOrderIndex.One;
            }
            
            return assignments;
        }

        /// <summary>
        /// Applies the resolved ordering to the database
        /// </summary>
        private async Task ApplyResolvedOrdering(
            OrderingResolution resolution,
            Type partialType,
            PropertyInfo orderIndexProperty,
            ReorderResponse<TId, TOrderIndex> result)
        {
            // Apply user's resolved reordering
            foreach (var item in resolution.ResolvedUserItems)
            {
                var query = _repository.GetAll().Where(GetFindByIdExpression(item.Id));
                query.Update(GetUpdateExpression(partialType, orderIndexProperty.Name, item.OrderIndex));
                result.ReorderedItems[item.Id] = item.OrderIndex;
            }
            
            // Apply null entity assignments
            foreach (var item in resolution.NullEntitiesAssignments)
            {
                var query = _repository.GetAll().Where(GetFindByIdExpression(item.Id));
                query.Update(GetUpdateExpression(partialType, orderIndexProperty.Name, item.OrderIndex));
                result.ReorderedItems[item.Id] = item.OrderIndex;
            }
        }

        /// <summary>
        /// Contains the resolution of all ordering conflicts
        /// </summary>
        private class OrderingResolution
        {
            public List<ReorderingItem<TId, TOrderIndex>> ResolvedUserItems { get; set; } = new();
            public List<ReorderingItem<TId, TOrderIndex>> NullEntitiesAssignments { get; set; } = new();
            public HashSet<TOrderIndex> UsedOrderIndices { get; set; } = new();
        }
    }
}
