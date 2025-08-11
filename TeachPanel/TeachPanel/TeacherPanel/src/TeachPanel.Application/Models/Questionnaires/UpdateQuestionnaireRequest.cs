using TeachPanel.Application.Models.Questions;

namespace TeachPanel.Application.Models.Questionnaires;

public sealed class UpdateQuestionnaireRequest
{
    public string Name { get; set; }
    public ICollection<CreateQuestionRequest> Questions { get; set; } = new List<CreateQuestionRequest>();
} 