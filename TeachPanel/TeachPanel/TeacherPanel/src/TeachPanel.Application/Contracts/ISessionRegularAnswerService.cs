using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.SessionRegularAnswers;

namespace TeachPanel.Application.Contracts;

public interface ISessionRegularAnswerService
{
    Task<SessionRegularAnswerModel> CreateAsync(CreateSessionRegularAnswerRequest request);
    Task<SessionRegularAnswerModel?> GetByIdAsync(Guid id);
    Task<PagingResponse<SessionRegularAnswerModel>> GetAllAsync(PagingRequest request);
    Task<SessionRegularAnswerModel> UpdateAsync(Guid id, UpdateSessionRegularAnswerRequest request);
    Task DeleteAsync(Guid id);
} 