using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.SessionRegularStudents;

namespace TeachPanel.Application.Contracts;

public interface ISessionRegularStudentService
{
    Task<SessionRegularStudentModel> CreateAsync(CreateSessionRegularStudentRequest request);
    Task<SessionRegularStudentModel?> GetByIdAsync(Guid id);
    Task<PagingResponse<SessionRegularStudentModel>> GetAllAsync(PagingRequest request);
    Task<SessionRegularStudentModel> UpdateAsync(Guid id, UpdateSessionRegularStudentRequest request);
    Task DeleteAsync(Guid id);
} 