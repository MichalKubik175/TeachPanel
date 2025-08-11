using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.BrandGroups;

namespace TeachPanel.Application.Contracts;

public interface IBrandGroupService
{
    Task<BrandGroupModel> CreateAsync(CreateBrandGroupRequest request);
    Task<BrandGroupModel> CreateGroupInBrandAsync(CreateGroupInBrandRequest request);
    Task<BrandGroupModel> GetByIdAsync(Guid id);
    Task<PagingResponse<BrandGroupModel>> GetAllAsync(PagingRequest request);
    Task<BrandGroupModel> UpdateAsync(Guid id, UpdateBrandGroupRequest request);
    Task DeleteAsync(Guid id);
} 