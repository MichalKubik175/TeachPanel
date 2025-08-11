using Microsoft.EntityFrameworkCore;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Mapping;
using TeachPanel.Application.Models.BrandGroups;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Security;
using TeachPanel.Application.Utils;
using TeachPanel.Application.Validators;
using TeachPanel.Core.Exceptions;
using TeachPanel.Core.Models.Entities;
using TeachPanel.DataAccess.Connection;
using TeachPanel.DataAccess.DataManipulation;

namespace TeachPanel.Application.Services;

public sealed class BrandGroupService : IBrandGroupService
{
    private readonly DatabaseContext _databaseContext;
    private readonly ISecurityContext _securityContext;
    private readonly IValidatorFactory _validatorFactory;

    public BrandGroupService(DatabaseContext databaseContext, ISecurityContext securityContext, IValidatorFactory validatorFactory)
    {
        _databaseContext = databaseContext;
        _securityContext = securityContext;
        _validatorFactory = validatorFactory;
    }

    public async Task<BrandGroupModel> CreateAsync(CreateBrandGroupRequest request)
    {
        _validatorFactory.ValidateAndThrow(request);

        var currentUserId = _securityContext.GetUserIdOrThrow();

        // Validate that Brand exists and belongs to current user
        var brand = await _databaseContext.Brands
            .FirstOrDefaultAsync(b => b.Id == request.BrandId && b.UserId == currentUserId);
        if (brand is null)
        {
            throw new ResourceNotFoundException($"Brand with id {request.BrandId} not found");
        }

        // Validate that Group exists and belongs to current user
        var group = await _databaseContext.Groups
            .FirstOrDefaultAsync(g => g.Id == request.GroupId && g.UserId == currentUserId);
        if (group is null)
        {
            throw new ResourceNotFoundException($"Group with id {request.GroupId} not found");
        }

        // Check if the combination already exists
        var existingBrandGroup = await _databaseContext.BrandGroups
            .FirstOrDefaultAsync(bg => bg.BrandId == request.BrandId && bg.GroupId == request.GroupId && bg.UserId == currentUserId);
        if (existingBrandGroup is not null)
        {
            throw new ValidationFailedException("This group is already linked to this brand",
                new DetailsBuilder()
                    .Add("brandId", request.BrandId.ToString())
                    .Add("groupId", request.GroupId.ToString())
                    .Build());
        }

        var brandGroup = BrandGroup.Create(request.BrandId, request.GroupId, currentUserId);
        _databaseContext.BrandGroups.Add(brandGroup);
        await _databaseContext.SaveChangesAsync();

        return await GetBrandGroupWithRelationsAsync(brandGroup.Id);
    }

    public async Task<BrandGroupModel> GetByIdAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var brandGroup = await _databaseContext.BrandGroups
            .Include(bg => bg.Brand)
            .Include(bg => bg.Group)
            .FirstOrDefaultAsync(bg => bg.Id == id && bg.UserId == currentUserId);

        if (brandGroup is null)
        {
            throw new ResourceNotFoundException($"BrandGroup with id {id} not found");
        }

        return brandGroup.ToBrandGroupModel();
    }

    public async Task<PagingResponse<BrandGroupModel>> GetAllAsync(PagingRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var pageFilter = new PageFilter<BrandGroup>
        {
            PageNumber = request.Page,
            PageSize = request.PageSize
        };

        var query = _databaseContext.BrandGroups
            .Include(bg => bg.Brand)
            .Include(bg => bg.Group)
            .Where(bg => bg.UserId == currentUserId)
            .AsQueryable();

        var page = await pageFilter.ApplyToQueryable(query);
        var brandGroups = page.Items.Select(bg => bg.ToBrandGroupModel()).ToArray();

        return new PagingResponse<BrandGroupModel>
        {
            Items = brandGroups,
            Meta = new PageMetadataModel(page.PageCount, page.PageNumber, page.ItemsCount)
        };
    }

    public async Task<BrandGroupModel> UpdateAsync(Guid id, UpdateBrandGroupRequest request)
    {
        _validatorFactory.ValidateAndThrow(request);

        var currentUserId = _securityContext.GetUserIdOrThrow();
        var brandGroup = await _databaseContext.BrandGroups
            .FirstOrDefaultAsync(bg => bg.Id == id && bg.UserId == currentUserId);

        if (brandGroup is null)
        {
            throw new ResourceNotFoundException($"BrandGroup with id {id} not found");
        }

        // Validate that new Brand exists and belongs to current user
        var brand = await _databaseContext.Brands
            .FirstOrDefaultAsync(b => b.Id == request.BrandId && b.UserId == currentUserId);
        if (brand is null)
        {
            throw new ResourceNotFoundException($"Brand with id {request.BrandId} not found");
        }

        // Validate that new Group exists and belongs to current user
        var group = await _databaseContext.Groups
            .FirstOrDefaultAsync(g => g.Id == request.GroupId && g.UserId == currentUserId);
        if (group is null)
        {
            throw new ResourceNotFoundException($"Group with id {request.GroupId} not found");
        }

        // Check if the new combination already exists (excluding current record)
        var existingBrandGroup = await _databaseContext.BrandGroups
            .FirstOrDefaultAsync(bg => bg.BrandId == request.BrandId && bg.GroupId == request.GroupId && bg.Id != id && bg.UserId == currentUserId);
        if (existingBrandGroup is not null)
        {
            throw new ValidationFailedException("This group is already linked to this brand",
                new DetailsBuilder()
                    .Add("brandId", request.BrandId.ToString())
                    .Add("groupId", request.GroupId.ToString())
                    .Build());
        }

        brandGroup.UpdateBrandGroup(request.BrandId, request.GroupId);
        await _databaseContext.SaveChangesAsync();

        return await GetBrandGroupWithRelationsAsync(brandGroup.Id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var brandGroup = await _databaseContext.BrandGroups
            .FirstOrDefaultAsync(bg => bg.Id == id && bg.UserId == currentUserId);

        if (brandGroup is null)
        {
            throw new ResourceNotFoundException($"BrandGroup with id {id} not found");
        }

        _databaseContext.BrandGroups.Remove(brandGroup);
        await _databaseContext.SaveChangesAsync();
    }

    public async Task<BrandGroupModel> CreateGroupInBrandAsync(CreateGroupInBrandRequest request)
    {
        _validatorFactory.ValidateAndThrow(request);

        var currentUserId = _securityContext.GetUserIdOrThrow();

        // Validate that Brand exists and belongs to current user
        var brand = await _databaseContext.Brands
            .FirstOrDefaultAsync(b => b.Id == request.BrandId && b.UserId == currentUserId);
        if (brand is null)
        {
            throw new ResourceNotFoundException($"Brand with id {request.BrandId} not found");
        }

        // Check if a group with the same name is already linked to this brand by this user
        var duplicateInBrand = await _databaseContext.BrandGroups
            .Include(bg => bg.Group)
            .AnyAsync(bg => bg.BrandId == request.BrandId && bg.Group.Name == request.GroupName && bg.UserId == currentUserId);
        if (duplicateInBrand)
        {
            throw new ValidationFailedException("Group with this name already exists in this brand",
                new DetailsBuilder()
                    .Add("brandId", request.BrandId.ToString())
                    .Add("groupName", request.GroupName)
                    .Build());
        }

        // Create a new group for the current user
        var group = Group.Create(request.GroupName, currentUserId);
        _databaseContext.Groups.Add(group);
        await _databaseContext.SaveChangesAsync();

        // Create the brand-group relationship
        var brandGroup = BrandGroup.Create(request.BrandId, group.Id, currentUserId);
        _databaseContext.BrandGroups.Add(brandGroup);
        await _databaseContext.SaveChangesAsync();

        return await GetBrandGroupWithRelationsAsync(brandGroup.Id);
    }

    private async Task<BrandGroupModel> GetBrandGroupWithRelationsAsync(Guid brandGroupId)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var brandGroup = await _databaseContext.BrandGroups
            .Include(bg => bg.Brand)
            .Include(bg => bg.Group)
            .FirstOrDefaultAsync(bg => bg.Id == brandGroupId && bg.UserId == currentUserId);

        return brandGroup.ToBrandGroupModel();
    }
} 