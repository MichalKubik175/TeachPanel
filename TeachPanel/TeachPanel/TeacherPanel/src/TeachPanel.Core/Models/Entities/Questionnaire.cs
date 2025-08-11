namespace TeachPanel.Core.Models.Entities;

public sealed class Questionnaire : AuditEntity<Guid>
{
    private Questionnaire()
        : base(Guid.CreateVersion7())
    {
    }
    
    public string Name { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    public bool IsDeleted { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; }

    // Navigation property - Questions collection
    public ICollection<Question> Questions { get; set; } = new List<Question>();

    public static Questionnaire Create(string name, Guid userId)
    {
        var questionnaire = new Questionnaire
        {
            Name = name,
            UserId = userId,
            CreatedAtLocal = DateTimeOffset.Now, // Local time when questionnaire is created
        };
        
        return questionnaire;
    }

    public void UpdateInfo(string name)
    {
        Name = name;
    }

    public void MarkAsDeleted()
    {
        IsDeleted = true;
        DeletedAtUtc = DateTime.UtcNow;
    }
} 