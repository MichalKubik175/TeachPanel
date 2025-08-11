using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.SessionHomeworkStudents;

namespace TeachPanel.Application.Contracts;

public interface ISessionHomeworkStudentService
{
    Task<SessionHomeworkStudentModel> CreateAsync(CreateSessionHomeworkStudentRequest request);
    Task<SessionHomeworkStudentModel?> GetByIdAsync(Guid id);
    Task<PagingResponse<SessionHomeworkStudentModel>> GetAllAsync(PagingRequest request);
    Task<SessionHomeworkStudentModel> UpdateAsync(Guid id, UpdateSessionHomeworkStudentRequest request);
    Task DeleteAsync(Guid id);
} 