﻿using FluentMigrator;
using FluentMigrator.Expressions;

namespace Shesha.FluentMigrator.Notifications
{
    /// <summary>
    /// NotificationTemplate update expression
    /// </summary>
    public class UpdateNotificationTemplateExpression : SheshaMigrationExpressionBase
    {
        /// <summary>
        /// Template Id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Template settings
        /// </summary>
        public NotificationTemplateDefinition Template { get; set; } = new NotificationTemplateDefinition();

        public override void ExecuteWith(IMigrationProcessor processor)
        {
            var exp = new PerformDBOperationExpression() { Operation = (connection, transaction) => 
                {
                    var helper = new NotificationDbHelper(DbmsType, connection, transaction, QuerySchema);

                    if (Template.Name.IsSet)
                        helper.UpdateTemplateName(Id, Template.Name.Value);
                    if (Template.Subject.IsSet)
                        helper.UpdateTemplateSubject(Id, Template.Subject.Value);
                    if (Template.Body.IsSet)
                        helper.UpdateTemplateBody(Id, Template.Body.Value);
                    if (Template.BodyFormat.IsSet)
                        helper.UpdateTemplateBodyFormat(Id, Template.BodyFormat.Value);
                    if (Template.SendType.IsSet)
                        helper.UpdateTemplateSendType(Id, Template.SendType.Value);
                    if (Template.IsEnabled.IsSet)
                        helper.UpdateTemplateIsEnabled(Id, Template.IsEnabled.Value);
                }
            };
            processor.Process(exp);
        }

        public UpdateNotificationTemplateExpression(DbmsType dbmsType, IQuerySchema querySchema) : base(dbmsType, querySchema)
        {
            
        }
    }
}
