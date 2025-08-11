using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Groups;

namespace TeachPanel.Application.Contracts;

public interface IGroupService
{
    Task<GroupModel> CreateAsync(CreateGroupRequest request);
    Task<GroupModel> GetByIdAsync(Guid id);
    Task<PagingResponse<GroupModel>> GetAllAsync(PagingRequest request);
    Task<GroupModel> UpdateAsync(Guid id, UpdateGroupRequest request);
    Task DeleteAsync(Guid id);
} 