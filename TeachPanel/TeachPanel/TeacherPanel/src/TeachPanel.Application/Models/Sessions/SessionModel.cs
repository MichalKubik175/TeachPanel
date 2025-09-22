using TeachPanel.Application.Models.Commentaries;
using TeachPanel.Application.Models.Questionnaires;
using TeachPanel.Application.Models.SessionHomeworkStudents;
using TeachPanel.Application.Models.SessionRegularStudents;
using TeachPanel.Application.Models.TableLayouts;
using TeachPanel.Application.Models.Users;
using TeachPanel.Core.Models.Enums;

namespace TeachPanel.Application.Models.Sessions;

public sealed class SessionModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public SessionState State { get; set; }
    public Guid UserId { get; set; }
    public CurrentUserDataResponse? User { get; set; }
    public Guid? QuestionnaireId { get; set; }
    public QuestionnaireModel? Questionnaire { get; set; }
    public Guid TableLayoutId { get; set; }
    public TableLayoutModel? TableLayout { get; set; }
    public Guid? CommentaryId { get; set; }
    public CommentaryModel? Commentary { get; set; }
    public Guid? CurrentSelectedQuestionId { get; set; }
    public Guid? CurrentSelectedSessionStudentId { get; set; }
    public int? CurrentQuestionNumber { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public List<SessionHomeworkStudentModel> SessionHomeworkStudents { get; set; } = new();
    public List<SessionRegularStudentModel> SessionRegularStudents { get; set; } = new();
} 