using Abp.Authorization;
using Abp.ObjectMapping;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Shesha.Application.Services.Dto;
using Shesha.Authorization;
using Shesha.Configuration.Runtime;
using Shesha.Configuration.Runtime.Exceptions;
using Shesha.Excel;
using Shesha.Extensions;
using Shesha.Permissions;
using Shesha.Reflection;
using Shesha.Specifications;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Shesha.DynamicEntities
{
    public class ChartsAppService : SheshaAppServiceBase
    {
        private readonly IEntityConfigurationStore _entityConfigStore;
        private readonly IExcelUtility _excelUtility;
        private readonly IObjectPermissionChecker _objectPermissionChecker;
        private readonly ISpecificationsFinder _specificationsFinder;
        private readonly IConfiguration _configuration;

        public IObjectMapper AutoMapper { get; set; }

        public ChartsAppService(
            IEntityConfigurationStore entityConfigStore,
            IExcelUtility excelUtility,
            IObjectPermissionChecker objectPermissionChecker,
            ISpecificationsFinder specificationsFinder,
            IConfiguration configuration
            )
        {
            _entityConfigStore = entityConfigStore;
            _excelUtility = excelUtility;
            _objectPermissionChecker = objectPermissionChecker;
            _specificationsFinder = specificationsFinder;
            _configuration = configuration;
        }

        protected async Task CheckPermissionAsync(EntityConfiguration entityConfig, string method)
        {
            var crudMethod = PermissionedObjectManager.GetCrudMethod(method, method);
            await _objectPermissionChecker.AuthorizeAsync(false, entityConfig.EntityType.GetRequiredFullName(), crudMethod.NotNull(), ShaPermissionedObjectsTypes.EntityAction, AbpSession.UserId != null);
        }

        // Changed the accessibility of AllDataResponseDto to public to fix CS0050
        public class AllDataResponseDto
        {
            public IEnumerable<object>? AllColumns { get; set; }
            public long TotalCount { get; set; }
            public List<Dictionary<string, object?>> Items { get; set; }
            public TimeSpan ElapsedTime { get; set; }
        }

        /*
         *         
            var schemaName = StringHelper.ToCamelCase(typeof(TEntity).Name);

            var schema = await SchemaContainer.GetOrDefaultAsync(schemaName);
            var httpContext = AppContextHelper.Current;

            var properties = string.IsNullOrWhiteSpace(input.Properties)
                ? await GetGqlTopLevelPropertiesAsync(true)
                : await CleanupPropertiesAsync(input.Properties);

            var query = $@"query getAll($filter: String, $quickSearch: String, $quickSearchProperties: [String], $sorting: String, $skipCount: Int, $maxResultCount: Int, $specifications: [String]){{
              {schemaName}List(input: {{ filter: $filter, quickSearch: $quickSearch, quickSearchProperties: $quickSearchProperties, sorting: $sorting, skipCount: $skipCount, maxResultCount: $maxResultCount, specifications: $specifications }}){{
                totalCount
                items {{
                    {properties}
                }}
              }}
            }}";

            var result = await DocumentExecuter.ExecuteAsync(s =>
            {
                s.Schema = schema;

                s.Query = query;
                s.Variables = new Inputs(new Dictionary<string, object?> {
                    { "filter", input.Filter },
                    { "specifications", input.Specifications },
                    { "quickSearch", input.QuickSearch },
                    { "quickSearchProperties", ExtractProperties(properties) },
                    { "sorting", input.Sorting },
                    { "skipCount", input.SkipCount },
                    { "maxResultCount", input.MaxResultCount },
                });

                if (httpContext != null)
                {
                    s.RequestServices = httpContext.RequestServices;
                    s.UserContext = new GraphQLUserContext
                    {
                        User = httpContext.User,
                    };
                    s.CancellationToken = httpContext.RequestAborted;
                }
            });

            if (result.Errors != null)
            {
                var validationResults = result.Errors.Select(e => new ValidationResult(e.FullMessage())).ToList();
                throw new AbpValidationException(string.Join("\r\n", validationResults.Select(r => r.ErrorMessage)), validationResults);
            }

            return new GraphQLDataResult<PagedResultDto<TEntity>>(result);
         */

        [AbpAllowAnonymous]
        [HttpGet]
        public virtual async Task<AllDataResponseDto> GetAllDataAsync(string entityType, GetDynamicEntityInput<string> input)
        {
            var startTime = DateTime.UtcNow;
            var data = new List<Dictionary<string, object?>>();
            IEnumerable<object>? relevantEntityProperties = new List<object>();
            try
            {
                var entityConfig = _entityConfigStore.Get(entityType);
                if (entityConfig == null)
                    throw new EntityTypeNotFoundException(entityType);

                var connectionString = _configuration.GetDefaultConnectionString();
                var tableName = entityConfig?.TableName;
                var properties = input?.Properties?.ToLower() ?? "id, creationTime";

                var reqPropertiesList = properties.Split(',').Select(p => p.Trim());
                var nestedReqProperties = reqPropertiesList.Where(p => p.Contains(".")); 
                // reference list properties
                var referenceListProperties = entityConfig?.Properties
                    .Where(p => p.Value.ReferenceListName != null && reqPropertiesList?.Contains(p.Key.ToLower()) == true);
                // find those that are just normal properties
                var normalProperties = entityConfig?.Properties
                    .Where(p => p.Value.EntityReferenceType == null && p.Value.ReferenceListName == null && reqPropertiesList?.Contains(p.Key.ToLower()) == true);
                var normalProperiesList = normalProperties?.Select(p => p.Key.ToLower()).ToList();
                var referenceListPropertiesList = referenceListProperties?.Select(p => p.Key.ToLower() + "Lkp").ToList();

                var allPropertiesList = normalProperiesList?.Union(referenceListPropertiesList ?? Enumerable.Empty<string>()).ToList();
                allPropertiesList = allPropertiesList != null ? allPropertiesList : new List<string>();

                string query = $"SELECT ";
                if (referenceListPropertiesList != null)
                {
                    query += string.Join(", ", allPropertiesList.Select(p => $"[{tableName}].{p}"));
                }
                else if (normalProperiesList != null)
                {
                    query += string.Join(", ", normalProperiesList.Select(p => $"[{tableName}].{p}"));
                }

                var nestedReqPropertiesTableNames = nestedReqProperties.Select(nrp => nrp.Split('.')[0]).Distinct();
                var entityProperties = entityConfig?.Properties.Where(p => p.Value.EntityReferenceType != null && nestedReqPropertiesTableNames?.Contains(p.Key.ToLower()) == true) ?? [];
                
                // assumes all entity references have this shape [entity].[some-property]
                foreach (var entityProperty in entityProperties)
                {
                    // use the table name once more to retrieve the property from the nested property
                    var entityName = entityProperty.Key.ToLower();  
                    var foreignKeyProperty  = nestedReqProperties.First(p => p.Split(".")[0] == entityName).Split(".")[1];
                    var entityPropertyType = entityProperty.Value.EntityReferenceType;
                    if (entityPropertyType == null)
                        continue;
                    var entityConfig2 = _entityConfigStore.Get(entityPropertyType);
                    if (entityConfig2 != null)
                    {
                        var tableName2 = entityConfig2.TableName;
                        if (tableName2 != null)
                        {
                            // append the property name to the query using the table name and the column name
                            query += $", [{tableName2}].{foreignKeyProperty} as [{entityName}.{foreignKeyProperty}]";
                        }
                    }
                }

                query += $" FROM [{tableName}]";

                // we need to add the tables inner joins
                foreach (var entityProperty in entityProperties)
                {
                    var entityName = entityProperty.Key.ToLower();
                    var entityPropertyType = entityProperty.Value.EntityReferenceType;
                    if (entityPropertyType == null)
                        continue;
                    var entityConfig2 = _entityConfigStore.Get(entityPropertyType);
                    if (entityConfig2 != null)
                    {
                        var tableName2 = entityConfig2.TableName;
                        if (tableName2 != null)
                        {
                            query += $" LEFT JOIN [{tableName2}] ON [{tableName}].{entityName}Id = [{tableName2}].Id";
                        }
                    }
                }

                if (tableName != null)
                {
                    using (SqlConnection connection = new SqlConnection(connectionString))
                    {
                        await connection.OpenAsync();
                        using (SqlCommand command = new SqlCommand(query, connection))
                        {
                            command.CommandTimeout = 230; 
                            using (SqlDataReader reader = await command.ExecuteReaderAsync())
                            {
                                while (await reader.ReadAsync())
                                {
                                    var row = new Dictionary<string, object?>();
                                    for (int i = 0; i < reader.FieldCount; i++)
                                    {
                                        var columnName = reader.GetName(i);
                                        if (columnName.EndsWith("Lkp", StringComparison.OrdinalIgnoreCase))
                                        {
                                            columnName = columnName.Substring(0, columnName.Length - 3);
                                        }
                                        var columnValue = await reader.IsDBNullAsync(i) ? null : reader.GetValue(i);
                                        row.Add(columnName, columnValue);
                                    }
                                    data.Add(row);
                                }
                            }
                        }
                    }
                }
                else
                {
                    throw new Exception("Table name could not be derived from the entity type.");
                }
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while fetching data.", ex);
            }

            return await Task.FromResult(new AllDataResponseDto
            {
                TotalCount = data.Count,
                Items = data,
                ElapsedTime = DateTime.UtcNow - startTime,
                AllColumns = relevantEntityProperties
            });
        }
    }
}