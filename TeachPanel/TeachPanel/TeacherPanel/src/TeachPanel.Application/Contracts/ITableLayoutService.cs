using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.TableLayouts;

namespace TeachPanel.Application.Contracts;

public interface ITableLayoutService
{
    Task<TableLayoutModel> CreateAsync(CreateTableLayoutRequest request);
    Task<TableLayoutModel?> GetByIdAsync(Guid id);
    Task<PagingResponse<TableLayoutModel>> GetAllAsync(PagingRequest request);
    Task<TableLayoutModel> UpdateAsync(Guid id, UpdateTableLayoutRequest request);
    Task DeleteAsync(Guid id);
} 