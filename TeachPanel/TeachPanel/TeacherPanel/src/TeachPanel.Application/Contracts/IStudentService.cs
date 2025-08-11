using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Students;

namespace TeachPanel.Application.Contracts;

public interface IStudentService
{
    Task<StudentModel> CreateAsync(CreateStudentRequest request);
    Task<StudentModel> GetByIdAsync(Guid id);
    Task<PagingResponse<StudentModel>> GetAllAsync(PagingRequest request);
    Task<StudentModel> UpdateAsync(Guid id, UpdateStudentRequest request);
    Task DeleteAsync(Guid id);
} 