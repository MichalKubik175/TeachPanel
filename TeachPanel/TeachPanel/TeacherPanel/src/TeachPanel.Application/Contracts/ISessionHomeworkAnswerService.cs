using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.SessionHomeworkAnswers;

namespace TeachPanel.Application.Contracts;

public interface ISessionHomeworkAnswerService
{
    Task<SessionHomeworkAnswerModel> CreateAsync(CreateSessionHomeworkAnswerRequest request);
    Task<SessionHomeworkAnswerModel?> GetByIdAsync(Guid id);
    Task<PagingResponse<SessionHomeworkAnswerModel>> GetAllAsync(PagingRequest request);
    Task<SessionHomeworkAnswerModel> UpdateAsync(Guid id, UpdateSessionHomeworkAnswerRequest request);
    Task DeleteAsync(Guid id);
} 