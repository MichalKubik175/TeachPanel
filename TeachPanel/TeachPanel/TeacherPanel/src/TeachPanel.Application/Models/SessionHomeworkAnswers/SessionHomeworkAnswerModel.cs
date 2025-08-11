using TeachPanel.Application.Models.SessionHomeworkStudents;
using TeachPanel.Application.Models.Questions;
using TeachPanel.Core.Models.Enums;

namespace TeachPanel.Application.Models.SessionHomeworkAnswers;

public sealed class SessionHomeworkAnswerModel
{
    public Guid Id { get; set; }
    public Guid SessionHomeworkStudentId { get; set; }
    public SessionHomeworkStudentModel? SessionHomeworkStudent { get; set; }
    public Guid QuestionId { get; set; }
    public QuestionModel? Question { get; set; }
    public SessionHomeworkAnswerState State { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
} 