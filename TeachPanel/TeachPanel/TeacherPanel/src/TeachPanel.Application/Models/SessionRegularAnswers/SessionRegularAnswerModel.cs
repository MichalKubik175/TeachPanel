using TeachPanel.Application.Models.SessionRegularStudents;
using TeachPanel.Core.Models.Enums;

namespace TeachPanel.Application.Models.SessionRegularAnswers;

public sealed class SessionRegularAnswerModel
{
    public Guid Id { get; set; }
    public Guid SessionRegularStudentId { get; set; }
    public SessionRegularStudentModel? SessionRegularStudent { get; set; }
    public SessionRegularAnswerState State { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
} 