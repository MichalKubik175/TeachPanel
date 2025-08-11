using Microsoft.EntityFrameworkCore;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Mapping;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.TableLayouts;
using TeachPanel.Application.Security;
using TeachPanel.Core.Exceptions;
using TeachPanel.Core.Models.Entities;
using TeachPanel.DataAccess.Connection;
using TeachPanel.DataAccess.DataManipulation;

namespace TeachPanel.Application.Services;

public class TableLayoutService : ITableLayoutService
{
    private readonly DatabaseContext _context;
    private readonly ISecurityContext _securityContext;

    public TableLayoutService(DatabaseContext context, ISecurityContext securityContext)
    {
        _context = context;
        _securityContext = securityContext;
    }

    public async Task<TableLayoutModel> CreateAsync(CreateTableLayoutRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var rows = request.Rows.Select(r => new TableRow
        {
            RowNumber = r.RowNumber,
            TablesCount = r.TablesCount
        }).ToList();

        var tableLayout = TableLayout.Create(request.Name, rows, currentUserId);

        _context.TableLayouts.Add(tableLayout);
        await _context.SaveChangesAsync();

        return tableLayout.ToTableLayoutModel();
    }

    public async Task<TableLayoutModel?> GetByIdAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var tableLayout = await _context.TableLayouts
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUserId);

        return tableLayout?.ToTableLayoutModel();
    }

    public async Task<PagingResponse<TableLayoutModel>> GetAllAsync(PagingRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var pageFilter = new PageFilter<TableLayout>
        {
            PageNumber = request.Page,
            PageSize = request.PageSize
        };

        var query = _context.TableLayouts
            .Where(x => x.UserId == currentUserId)
            .AsQueryable();
        var page = await pageFilter.ApplyToQueryable(query);
        
        var tableLayouts = page.Items.Select(x => x.ToTableLayoutModel()).ToArray();

        return new PagingResponse<TableLayoutModel>
        {
            Items = tableLayouts,
            Meta = new PageMetadataModel(page.PageCount, page.PageNumber, page.ItemsCount)
        };
    }

    public async Task<TableLayoutModel> UpdateAsync(Guid id, UpdateTableLayoutRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var tableLayout = await _context.TableLayouts
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUserId);

        if (tableLayout is null)
        {
            throw new ResourceNotFoundException($"Table layout with id {id} not found");
        }

        var rows = request.Rows.Select(r => new TableRow
        {
            RowNumber = r.RowNumber,
            TablesCount = r.TablesCount
        }).ToList();

        tableLayout.Update(request.Name, rows);
        await _context.SaveChangesAsync();

        return tableLayout.ToTableLayoutModel();
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var tableLayout = await _context.TableLayouts
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUserId);

        if (tableLayout is null)
        {
            throw new ResourceNotFoundException($"Table layout with id {id} not found");
        }

        _context.TableLayouts.Remove(tableLayout);
        await _context.SaveChangesAsync();
    }
} 