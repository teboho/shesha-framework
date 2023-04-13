﻿using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230411130200)]
    public class M20230411130200 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            //RemoveForeignKeyColumn("SheshaFunctionalTests_EmployeeAccounts", "AccountId", "SheshaFunctionalTests_Accounts");

            Rename.Table("SheshaFunctionalTests_Accounts").To("SheshaFunctionalTests_TestAccounts");

            //Alter.Table("SheshaFunctionalTests_EmployeeAccounts").AddForeignKeyColumn("AccountId", "SheshaFunctionalTests_TestAccounts");
        }
        //private void RemoveForeignKeyColumn(string table, string column, string masterTable)
        //{
        //    Delete.ForeignKey($"FK_{table}_{column}_{masterTable}_Id").OnTable(table);
        //    Delete.Index($"IX_{table}_{column}").OnTable(table);
        //    Delete.Column(column).FromTable(table);
        //}
    }
}