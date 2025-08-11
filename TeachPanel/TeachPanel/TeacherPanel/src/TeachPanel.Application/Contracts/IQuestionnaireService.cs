using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Questionnaires;

namespace TeachPanel.Application.Contracts;

public interface IQuestionnaireService
{
    Task<QuestionnaireModel> CreateAsync(CreateQuestionnaireRequest request);
    Task<QuestionnaireModel> GetByIdAsync(Guid id);
    Task<PagingResponse<QuestionnaireModel>> GetAllAsync(PagingRequest request);
    Task<QuestionnaireModel> UpdateAsync(Guid id, UpdateQuestionnaireRequest request);
    Task DeleteAsync(Guid id);
} 