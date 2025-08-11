using NetEscapades.EnumGenerators;

namespace TeachPanel.Core.Models.Enums;

[EnumExtensions]
public enum SessionState
{
    None = 0,
    Homework = 1,
    Regular = 2,
}