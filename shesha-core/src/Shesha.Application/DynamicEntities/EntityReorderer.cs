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
                
                // Step 3: FIRST - Handle null initialization for entities NOT in the reorder request
                // This ensures user's reordering intent is never overridden
                await HandleNullEntitiesNotInRequest(allEntities, entitiesWithOrder, entitiesWithoutOrder, requestedEntityIds, partialType, orderIndexProperty, result);
                
                // Step 4: SECOND - Apply the user's specific reordering request with absolute priority
                // This preserves the exact order the user intended
                await ApplyUserReorderingRequest(passedItems, partialType, orderIndexProperty, result);
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
        /// Initializes ordering for all entities when none have order indices (starting from 1)
        /// </summary>
        private async Task InitializeCompleteOrdering(List<ReorderingItem<TId, TOrderIndex>> allEntities, Type partialType, PropertyInfo orderIndexProperty, ReorderResponse<TId, TOrderIndex> result)
        {
            var currentOrder = TOrderIndex.One;
            
            foreach (var entity in allEntities.OrderBy(e => e.Id)) // Consistent ordering by ID
            {
                var query = _repository.GetAll().Where(GetFindByIdExpression(entity.Id));
                query.Update(GetUpdateExpression(partialType, orderIndexProperty.Name, currentOrder));
                
                result.ReorderedItems[entity.Id] = currentOrder;
                currentOrder += TOrderIndex.One;
            }
        }

        /// <summary>
        /// Integrates entities with null orderIndex into existing ordered structure
        /// </summary>
        private async Task IntegrateNullEntitiesIntoExistingOrder(
            List<ReorderingItem<TId, TOrderIndex>> entitiesWithOrder,
            List<ReorderingItem<TId, TOrderIndex>> entitiesWithoutOrder,
            Type partialType,
            PropertyInfo orderIndexProperty,
            ReorderResponse<TId, TOrderIndex> result)
        {
            if (!entitiesWithoutOrder.Any()) return;

            // Find the maximum existing order index
            var maxExistingOrder = entitiesWithOrder.Max(e => e.OrderIndex);
            var nextAvailableOrder = maxExistingOrder + TOrderIndex.One;

            // Handle gaps in existing ordering (industry best practice: maintain gaps for flexibility)
            var existingOrders = entitiesWithOrder.Select(e => e.OrderIndex).OrderBy(o => o).ToList();
            var gaps = FindOrderingGaps(existingOrders);
            
            var nullEntitiesList = entitiesWithoutOrder.OrderBy(e => e.Id).ToList(); // Consistent ordering
            var gapIndex = 0;
            
            foreach (var entity in nullEntitiesList)
            {
                TOrderIndex assignedOrder;
                
                // Try to fill gaps first, then append at the end
                if (gapIndex < gaps.Count)
                {
                    assignedOrder = gaps[gapIndex];
                    gapIndex++;
                }
                else
                {
                    assignedOrder = nextAvailableOrder;
                    nextAvailableOrder += TOrderIndex.One;
                }
                
                var query = _repository.GetAll().Where(GetFindByIdExpression(entity.Id));
                query.Update(GetUpdateExpression(partialType, orderIndexProperty.Name, assignedOrder));
                
                result.ReorderedItems[entity.Id] = assignedOrder;
            }
        }

        /// <summary>
        /// Applies the user's reordering request with absolute priority
        /// The user's intended order sequence is preserved exactly as specified
        /// </summary>
        private async Task ApplyUserReorderingRequest(
            List<ReorderingItem<TId, TOrderIndex>> passedItems,
            Type partialType,
            PropertyInfo orderIndexProperty,
            ReorderResponse<TId, TOrderIndex> result)
        {
            // CRITICAL: Maintain the exact order the user specified in their request
            // The order of items in the input.Items array represents the user's intended final sequence
            
            for (int i = 0; i < passedItems.Count; i++)
            {
                var passedItem = passedItems[i];
                var userIntendedOrder = passedItem.OrderIndex;
                
                var query = _repository.GetAll().Where(GetFindByIdExpression(passedItem.Id));
                query.Update(GetUpdateExpression(partialType, orderIndexProperty.Name, userIntendedOrder));

                // Track the change - this will override any previous null initialization
                result.ReorderedItems[passedItem.Id] = userIntendedOrder;
            }
        }

        /// <summary>
        /// Handles null orderIndex values for entities NOT in the user's reorder request
        /// This ensures we don't interfere with the user's intended ordering
        /// </summary>
        private async Task HandleNullEntitiesNotInRequest(
            List<ReorderingItem<TId, TOrderIndex>> allEntities,
            List<ReorderingItem<TId, TOrderIndex>> entitiesWithOrder,
            List<ReorderingItem<TId, TOrderIndex>> entitiesWithoutOrder,
            HashSet<TId> requestedEntityIds,
            Type partialType,
            PropertyInfo orderIndexProperty,
            ReorderResponse<TId, TOrderIndex> result)
        {
            // Only handle null entities that are NOT part of the user's reorder request
            var nullEntitiesNotInRequest = entitiesWithoutOrder
                .Where(entity => !requestedEntityIds.Contains(entity.Id))
                .OrderBy(e => e.Id) // Consistent ordering
                .ToList();

            if (!nullEntitiesNotInRequest.Any()) return;

            if (!entitiesWithOrder.Any() && requestedEntityIds.Count == 0)
            {
                // Case 1: All entities have null orderIndex and no specific reorder request
                await InitializeCompleteOrdering(nullEntitiesNotInRequest, partialType, orderIndexProperty, result);
            }
            else
            {
                // Case 2: Some entities have order, integrate null entities appropriately
                await IntegrateNullEntitiesIntoExistingOrder(entitiesWithOrder, nullEntitiesNotInRequest, partialType, orderIndexProperty, result);
            }
        }

        /// <summary>
        /// Finds gaps in the ordering sequence for optimal space utilization
        /// </summary>
        private List<TOrderIndex> FindOrderingGaps(List<TOrderIndex> existingOrders)
        {
            var gaps = new List<TOrderIndex>();
            
            for (int i = 0; i < existingOrders.Count - 1; i++)
            {
                var current = existingOrders[i];
                var next = existingOrders[i + 1];
                
                // Check if there's a gap larger than 1 between consecutive orders
                var difference = next - current;
                var two = TOrderIndex.One + TOrderIndex.One;
                
                if (difference > two) // Gap > 2
                {
                    // Fill the gap with a simple increment from current
                    var gapValue = current + TOrderIndex.One;
                    gaps.Add(gapValue);
                }
            }
            
            return gaps;
        }
    }
}
