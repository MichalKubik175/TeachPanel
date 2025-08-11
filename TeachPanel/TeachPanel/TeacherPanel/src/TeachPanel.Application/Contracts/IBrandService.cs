using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Brands;

namespace TeachPanel.Application.Contracts;

public interface IBrandService
{
    Task<BrandModel> CreateAsync(CreateBrandRequest request);
    Task<BrandModel> GetByIdAsync(Guid id);
    Task<PagingResponse<BrandModel>> GetAllAsync(PagingRequest request);
    Task<BrandModel> UpdateAsync(Guid id, UpdateBrandRequest request);
    Task DeleteAsync(Guid id);
} 