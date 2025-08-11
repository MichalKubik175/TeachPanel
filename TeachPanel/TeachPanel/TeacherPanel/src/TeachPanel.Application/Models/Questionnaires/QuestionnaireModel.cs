using TeachPanel.Application.Models.Questions;

namespace TeachPanel.Application.Models.Questionnaires;

public sealed class QuestionnaireModel
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public ICollection<QuestionModel> Questions { get; set; } = new List<QuestionModel>();
} 