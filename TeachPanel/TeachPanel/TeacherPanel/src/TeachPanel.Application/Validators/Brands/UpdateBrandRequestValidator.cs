using FluentValidation;
using TeachPanel.Application.Models.Brands;

namespace TeachPanel.Application.Validators.Brands;

public sealed class UpdateBrandRequestValidator : AbstractValidator<UpdateBrandRequest>
{
    public UpdateBrandRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100)
            .WithMessage("Brand name is required and must not exceed 100 characters");
    }
} 