using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Sessions;

namespace TeachPanel.Application.Contracts;

public interface ISessionService
{
    Task<SessionModel> CreateAsync(CreateSessionRequest request);
    Task<SessionModel?> GetByIdAsync(Guid id);
    Task<PagingResponse<SessionModel>> GetAllAsync(PagingRequest request);
    Task<SessionModel> UpdateAsync(Guid id, UpdateSessionRequest request);
    Task DeleteAsync(Guid id);
} 