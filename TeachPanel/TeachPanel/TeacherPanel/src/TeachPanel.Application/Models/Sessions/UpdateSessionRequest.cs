using TeachPanel.Core.Models.Enums;

namespace TeachPanel.Application.Models.Sessions;

public sealed class UpdateSessionRequest
{
    public string Name { get; set; } = string.Empty;
    public SessionState State { get; set; }
    public Guid? QuestionnaireId { get; set; }
    public Guid? CommentaryId { get; set; }
    public Guid? CurrentSelectedQuestionId { get; set; }
    public Guid? CurrentSelectedSessionStudentId { get; set; }
    public int? CurrentQuestionNumber { get; set; }
} 