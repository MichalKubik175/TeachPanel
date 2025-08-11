using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Questions;

namespace TeachPanel.Application.Contracts;

public interface IQuestionService
{
    Task<QuestionModel> CreateAsync(CreateQuestionRequest request, Guid questionnaireId);
    Task<QuestionModel> GetByIdAsync(Guid id);
    Task<PagingResponse<QuestionModel>> GetAllAsync(PagingRequest request);
    Task<PagingResponse<QuestionModel>> GetByQuestionnaireIdAsync(Guid questionnaireId, PagingRequest request);
    Task<QuestionModel> UpdateAsync(Guid id, UpdateQuestionRequest request);
    Task DeleteAsync(Guid id);
} 