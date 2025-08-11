using FluentValidation;
using TeachPanel.Application.Extensions;
using TeachPanel.Application.Models.Auth;

namespace TeachPanel.Application.Validators.Users;

public sealed class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty()
            .MaximumLength(200);
        
        RuleFor(x => x.NewPassword)
            .ApplyPasswordValidationRules();
    }
}