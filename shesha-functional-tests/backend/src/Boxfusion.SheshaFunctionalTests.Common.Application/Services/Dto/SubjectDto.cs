﻿using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto
{
    public class SubjectDto: EntityDto<Guid>
    {
        public virtual string Name { get; set; }
        public virtual string Description { get; set; }
    }
}
