using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Contracts_IValidatorFactory = TeachPanel.Application.Contracts.IValidatorFactory;

namespace TeachPanel.Application.Services;

public sealed class ValidatorFactory : Contracts_IValidatorFactory
{
    private readonly IServiceProvider _serviceProvider;

    public ValidatorFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public IValidator<TModel> GetFor<TModel>() where TModel : class
    {
        return _serviceProvider.GetRequiredService<IValidator<TModel>>();
    }

    public void ValidateAndThrow<TModel>(TModel model) where TModel : class
    {
        var validator = _serviceProvider.GetService<IValidator<TModel>>();
        validator?.ValidateAndThrow(model);
    }
}