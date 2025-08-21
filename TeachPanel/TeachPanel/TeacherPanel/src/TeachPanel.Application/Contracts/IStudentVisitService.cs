using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Visits;

namespace TeachPanel.Application.Contracts;

public interface IStudentVisitService
{
    Task<StudentVisitModel> CreateAsync(CreateStudentVisitRequest request);
    Task<StudentVisitModel> GetByIdAsync(Guid id);
    Task<PagingResponse<StudentVisitModel>> GetAllAsync(GetVisitsRequest request);
    Task<StudentVisitModel> UpdateAsync(Guid id, UpdateStudentVisitRequest request);
    Task DeleteAsync(Guid id);
    Task<List<StudentVisitModel>> BulkCreateOrUpdateAsync(BulkVisitRequest request);
    Task<List<GroupVisitSummaryModel>> GetGroupVisitSummariesAsync(DateOnly? fromDate = null, DateOnly? toDate = null);
    Task<GroupVisitSummaryModel> GetGroupVisitSummaryAsync(Guid groupId, DateOnly visitDate);
}

