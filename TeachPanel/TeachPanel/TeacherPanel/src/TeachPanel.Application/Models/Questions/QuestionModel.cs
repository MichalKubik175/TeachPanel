namespace TeachPanel.Application.Models.Questions;

public sealed class QuestionModel
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Answer { get; set; }
    public Guid QuestionnaireId { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
} 