using TeachPanel.Application.Models.Students;

namespace TeachPanel.Application.Models.Sessions;

public sealed class StudentWithAnswersModel
{
    public Guid StudentId { get; set; }
    public StudentModel? Student { get; set; }
    public bool HasHomeworkAnswers { get; set; }
    public bool HasRegularAnswers { get; set; }
    public int HomeworkAnswerCount { get; set; }
    public int RegularAnswerCount { get; set; }
}
