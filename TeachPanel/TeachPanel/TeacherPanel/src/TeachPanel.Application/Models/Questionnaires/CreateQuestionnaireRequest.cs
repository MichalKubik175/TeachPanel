using TeachPanel.Application.Models.Questions;

namespace TeachPanel.Application.Models.Questionnaires;

public sealed class CreateQuestionnaireRequest
{
    public string Name { get; set; }
    public ICollection<CreateQuestionRequest> Questions { get; set; } = new List<CreateQuestionRequest>();
} 