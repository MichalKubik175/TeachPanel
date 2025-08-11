using Riok.Mapperly.Abstractions;
using TeachPanel.Application.Models.Users;
using TeachPanel.Core.Models.Enums;

namespace TeachPanel.Application.Mapping;

[Mapper(RequiredEnumMappingStrategy = RequiredMappingStrategy.Source)]
public static partial class EnumMapper
{
    [MapEnum(EnumMappingStrategy.ByName)]
    public static partial RoleModel ToRoleModel(Role role);
    
    [MapEnum(EnumMappingStrategy.ByName)]
    public static partial Role ToRole(RoleModel permission);
}