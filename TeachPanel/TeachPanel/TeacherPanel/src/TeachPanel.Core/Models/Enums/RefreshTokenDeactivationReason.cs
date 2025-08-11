using NetEscapades.EnumGenerators;

namespace TeachPanel.Core.Models.Enums;

[EnumExtensions]
public enum RefreshTokenDeactivationReason
{
    None = 0,
    Refreshed = 1,
    LoggedOut = 2,
    PasswordChanged = 3,
    Revoked = 4,
}