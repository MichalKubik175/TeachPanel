using Microsoft.EntityFrameworkCore;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Mapping;
using TeachPanel.Application.Models.Brands;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Security;
using TeachPanel.Application.Utils;
using TeachPanel.Application.Validators;
using TeachPanel.Core.Exceptions;
using TeachPanel.Core.Models.Entities;
using TeachPanel.DataAccess.Connection;
using TeachPanel.DataAccess.DataManipulation;

namespace TeachPanel.Application.Services;

public sealed class BrandService : IBrandService
{
    private readonly DatabaseContext _databaseContext;
    private readonly ISecurityContext _securityContext;
    private readonly IValidatorFactory _validatorFactory;

    public BrandService(DatabaseContext databaseContext, ISecurityContext securityContext, IValidatorFactory validatorFactory)
    {
        _databaseContext = databaseContext;
        _securityContext = securityContext;
        _validatorFactory = validatorFactory;
    }

    public async Task<BrandModel> CreateAsync(CreateBrandRequest request)
    {
        _validatorFactory.ValidateAndThrow(request);

        var currentUserId = _securityContext.GetUserIdOrThrow();

        var brandExists = await _databaseContext.Brands
            .AnyAsync(b => b.Name == request.Name && b.UserId == currentUserId);

        if (brandExists)
        {
            throw new ValidationFailedException("Brand with this name already exists",
                new DetailsBuilder()
                    .Add("name", request.Name)
                    .Build());
        }

        var brand = Brand.Create(request.Name, currentUserId);
        _databaseContext.Brands.Add(brand);
        await _databaseContext.SaveChangesAsync();

        return brand.ToBrandModel();
    }

    public async Task<BrandModel> GetByIdAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var brand = await _databaseContext.Brands
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == currentUserId);

        if (brand is null)
        {
            throw new ResourceNotFoundException($"Brand with id {id} not found");
        }

        return brand.ToBrandModel();
    }

    public async Task<PagingResponse<BrandModel>> GetAllAsync(PagingRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var pageFilter = new PageFilter<Brand>
        {
            PageNumber = request.Page,
            PageSize = request.PageSize
        };

        var query = _databaseContext.Brands
            .Where(b => b.UserId == currentUserId)
            .AsQueryable();
        var page = await pageFilter.ApplyToQueryable(query);
        
        var brands = page.Items.Select(b => b.ToBrandModel()).ToArray();

        return new PagingResponse<BrandModel>
        {
            Items = brands,
            Meta = new PageMetadataModel(page.PageCount, page.PageNumber, page.ItemsCount)
        };
    }

    public async Task<BrandModel> UpdateAsync(Guid id, UpdateBrandRequest request)
    {
        _validatorFactory.ValidateAndThrow(request);

        var currentUserId = _securityContext.GetUserIdOrThrow();
        var brand = await _databaseContext.Brands
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == currentUserId);

        if (brand is null)
        {
            throw new ResourceNotFoundException($"Brand with id {id} not found");
        }

        var nameExists = await _databaseContext.Brands
            .AnyAsync(b => b.Name == request.Name && b.Id != id && b.UserId == currentUserId);

        if (nameExists)
        {
            throw new ValidationFailedException("Brand with this name already exists",
                new DetailsBuilder()
                    .Add("name", request.Name)
                    .Build());
        }

        brand.UpdateName(request.Name);
        await _databaseContext.SaveChangesAsync();

        return brand.ToBrandModel();
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var brand = await _databaseContext.Brands
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == currentUserId);

        if (brand is null)
        {
            throw new ResourceNotFoundException($"Brand with id {id} not found");
        }

        _databaseContext.Brands.Remove(brand);
        await _databaseContext.SaveChangesAsync();
    }
} 