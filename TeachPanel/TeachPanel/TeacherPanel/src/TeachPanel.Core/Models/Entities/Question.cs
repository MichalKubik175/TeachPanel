namespace TeachPanel.Core.Models.Entities;

public sealed class Question : AuditEntity<Guid>
{
    private Question()
        : base(Guid.CreateVersion7())
    {
    }
    
    public string Name { get; set; }
    public string Answer { get; set; }
    public Guid QuestionnaireId { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    public bool IsDeleted { get; set; }

    // Navigation property
    public Questionnaire Questionnaire { get; set; }

    public static Question Create(string name, string answer, Guid questionnaireId)
    {
        var question = new Question
        {
            Name = name,
            Answer = answer,
            QuestionnaireId = questionnaireId,
            CreatedAtLocal = DateTimeOffset.Now, // Local time when question is created
        };
        
        return question;
    }

    public void UpdateInfo(string name, string answer)
    {
        Name = name;
        Answer = answer;
    }

    public void MarkAsDeleted()
    {
        IsDeleted = true;
        DeletedAtUtc = DateTime.UtcNow;
    }
} 