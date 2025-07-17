using System;
using FluentMigrator;
using Shesha.Domain;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20240517000000), MsSqlOnly]
    public class M20240517000000 : Migration
    {
        /// <summary>
        /// Adds StringArray column to Core_Organisations table for Bus entity
        /// </summary>
        public override void Up()
        {
            if (!Schema.Table("Core_Organisations").Column("SheshaFunctionalTests_StringArray").Exists())
            {
                Alter.Table("Core_Organisations")
                    .AddColumn("SheshaFunctionalTests_StringArray").AsStringMax().Nullable();
            }
        }

        /// <summary>
        /// 
        /// </summary>
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
} 