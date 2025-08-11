using Microsoft.EntityFrameworkCore;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Mapping;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Groups;
using TeachPanel.Application.Security;
using TeachPanel.Application.Utils;
using TeachPanel.Application.Validators;
using TeachPanel.Core.Exceptions;
using TeachPanel.Core.Models.Entities;
using TeachPanel.DataAccess.Connection;
using TeachPanel.DataAccess.DataManipulation;

namespace TeachPanel.Application.Services;

public sealed class GroupService : IGroupService
{
    private readonly DatabaseContext _databaseContext;
    private readonly ISecurityContext _securityContext;
    private readonly IValidatorFactory _validatorFactory;

    public GroupService(DatabaseContext databaseContext, ISecurityContext securityContext, IValidatorFactory validatorFactory)
    {
        _databaseContext = databaseContext;
        _securityContext = securityContext;
        _validatorFactory = validatorFactory;
    }

    public async Task<GroupModel> CreateAsync(CreateGroupRequest request)
    {
        _validatorFactory.ValidateAndThrow(request);

        var currentUserId = _securityContext.GetUserIdOrThrow();

        var nameExists = await _databaseContext.Groups
            .AnyAsync(g => g.Name == request.Name && g.UserId == currentUserId);

        if (nameExists)
        {
            throw new ValidationFailedException("Group with this name already exists",
                new DetailsBuilder()
                    .Add("name", request.Name)
                    .Build());
        }

        var group = Group.Create(request.Name, currentUserId);
        _databaseContext.Groups.Add(group);
        await _databaseContext.SaveChangesAsync();

        return group.ToGroupModel();
    }

    public async Task<GroupModel> GetByIdAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var group = await _databaseContext.Groups
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == currentUserId);

        if (group is null)
        {
            throw new ResourceNotFoundException($"Group with id {id} not found");
        }

        return group.ToGroupModel();
    }

    public async Task<PagingResponse<GroupModel>> GetAllAsync(PagingRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var pageFilter = new PageFilter<Group>
        {
            PageNumber = request.Page,
            PageSize = request.PageSize
        };

        var query = _databaseContext.Groups
            .Where(g => g.UserId == currentUserId)
            .AsQueryable();
        var page = await pageFilter.ApplyToQueryable(query);
        
        var groups = page.Items.Select(g => g.ToGroupModel()).ToArray();

        return new PagingResponse<GroupModel>
        {
            Items = groups,
            Meta = new PageMetadataModel(page.PageCount, page.PageNumber, page.ItemsCount)
        };
    }

    public async Task<GroupModel> UpdateAsync(Guid id, UpdateGroupRequest request)
    {
        _validatorFactory.ValidateAndThrow(request);

        var currentUserId = _securityContext.GetUserIdOrThrow();
        var group = await _databaseContext.Groups
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == currentUserId);

        if (group is null)
        {
            throw new ResourceNotFoundException($"Group with id {id} not found");
        }

        var nameExists = await _databaseContext.Groups
            .AnyAsync(g => g.Name == request.Name && g.Id != id && g.UserId == currentUserId);

        if (nameExists)
        {
            throw new ValidationFailedException("Group with this name already exists",
                new DetailsBuilder()
                    .Add("name", request.Name)
                    .Build());
        }

        group.UpdateName(request.Name);
        await _databaseContext.SaveChangesAsync();

        return group.ToGroupModel();
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var group = await _databaseContext.Groups
            .Include(g => g.Students)
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == currentUserId);

        if (group is null)
        {
            throw new ResourceNotFoundException($"Group with id {id} not found");
        }

        if (group.Students.Any())
        {
            throw new ValidationFailedException("Cannot delete group that contains students",
                new DetailsBuilder()
                    .Add("studentsCount", group.Students.Count.ToString())
                    .Build());
        }

        _databaseContext.Groups.Remove(group);
        await _databaseContext.SaveChangesAsync();
    }
} 