using TeachPanel.Core.Models.Enums;

namespace TeachPanel.Application.Models.Sessions;

public sealed class CreateSessionRequest
{
    public string Name { get; set; } = string.Empty;
    public SessionState State { get; set; }
    public Guid? QuestionnaireId { get; set; }
    public Guid TableLayoutId { get; set; }
    public Guid? CommentaryId { get; set; }
} 