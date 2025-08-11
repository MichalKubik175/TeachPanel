using TeachPanel.Core.Models.Enums;

namespace TeachPanel.Core.Models.Entities;

public sealed class Session : AuditEntity<Guid>
{
    private Session()
        : base(Guid.CreateVersion7())
    {
    }
    
    public string Name { get; set; } = string.Empty;
    public SessionState State { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; }
    public Guid? QuestionnaireId { get; set; }
    public Questionnaire? Questionnaire { get; set; }
    public Guid TableLayoutId { get; set; }
    public TableLayout TableLayout { get; set; }
    public Guid? CommentaryId { get; set; }
    public Commentary? Commentary { get; set; }
    public Guid? CurrentSelectedQuestionId { get; set; }
    public Guid? CurrentSelectedSessionStudentId { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    
    public ICollection<SessionHomeworkStudent> SessionHomeworkStudents { get; set; } = new List<SessionHomeworkStudent>();
    public ICollection<SessionRegularStudent> SessionRegularStudents { get; set; } = new List<SessionRegularStudent>();

    public static Session Create(string name, SessionState state, Guid userId, Guid tableLayoutId, Guid? questionnaireId = null, Guid? commentaryId = null)
    {
        var session = new Session
        {
            Name = name,
            State = state,
            UserId = userId,
            TableLayoutId = tableLayoutId,
            QuestionnaireId = questionnaireId,
            CommentaryId = commentaryId,
            CreatedAtLocal = DateTimeOffset.Now
        };
        
        return session;
    }

    public void Update(string name, SessionState state, Guid? questionnaireId, Guid? commentaryId, Guid? currentSelectedQuestionId, Guid? currentSelectedSessionStudentId)
    {
        Name = name;
        State = state;
        QuestionnaireId = questionnaireId;
        CommentaryId = commentaryId;
        CurrentSelectedQuestionId = currentSelectedQuestionId;
        CurrentSelectedSessionStudentId = currentSelectedSessionStudentId;
    }
} 