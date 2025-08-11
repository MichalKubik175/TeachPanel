using Microsoft.EntityFrameworkCore;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Mapping;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Commentaries;
using TeachPanel.Application.Security;
using TeachPanel.Core.Exceptions;
using TeachPanel.Core.Models.Entities;
using TeachPanel.DataAccess.Connection;
using TeachPanel.DataAccess.DataManipulation;

namespace TeachPanel.Application.Services;

public sealed class CommentaryService : ICommentaryService
{
    private readonly DatabaseContext _databaseContext;
    private readonly ISecurityContext _securityContext;

    public CommentaryService(DatabaseContext databaseContext, ISecurityContext securityContext)
    {
        _databaseContext = databaseContext;
        _securityContext = securityContext;
    }

    public async Task<CommentaryModel> CreateAsync(CreateCommentaryRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var commentary = Commentary.Create(request.Text, currentUserId);
        _databaseContext.Commentaries.Add(commentary);
        await _databaseContext.SaveChangesAsync();

        return commentary.ToCommentaryModel();
    }

    public async Task<CommentaryModel> GetByIdAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var commentary = await _databaseContext.Commentaries
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == currentUserId);

        if (commentary == null)
        {
            throw new ResourceNotFoundException($"Commentary with ID {id}");
        }

        return commentary.ToCommentaryModel();
    }

    public async Task<PagingResponse<CommentaryModel>> GetAllAsync(PagingRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var pageFilter = new PageFilter<Commentary>
        {
            PageNumber = request.Page,
            PageSize = request.PageSize
        };

        var query = _databaseContext.Commentaries
            .Where(c => c.UserId == currentUserId)
            .AsQueryable();

        var page = await pageFilter.ApplyToQueryable(query);
        var commentaries = page.Items.Select(c => c.ToCommentaryModel()).ToArray();

        return new PagingResponse<CommentaryModel>
        {
            Items = commentaries,
            Meta = new PageMetadataModel(page.PageCount, page.PageNumber, page.ItemsCount)
        };
    }

    public async Task<CommentaryModel> UpdateAsync(Guid id, UpdateCommentaryRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var commentary = await _databaseContext.Commentaries
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == currentUserId);

        if (commentary == null)
        {
            throw new ResourceNotFoundException($"Commentary with ID {id}");
        }

        commentary.UpdateText(request.Text);
        await _databaseContext.SaveChangesAsync();

        return commentary.ToCommentaryModel();
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var commentary = await _databaseContext.Commentaries
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == currentUserId);

        if (commentary == null)
        {
            throw new ResourceNotFoundException($"Commentary with ID {id}");
        }

        _databaseContext.Commentaries.Remove(commentary);
        await _databaseContext.SaveChangesAsync();
    }
} 