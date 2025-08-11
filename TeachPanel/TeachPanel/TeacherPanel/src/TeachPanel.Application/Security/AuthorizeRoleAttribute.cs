using TeachPanel.Core.Models.Enums;

namespace TeachPanel.Application.Security;

public sealed class AuthorizeRoleAttribute : Attribute
{
    public AuthorizeRoleAttribute(Role role)
    {
        Role = role;
    }

    public Role Role { get; }
}