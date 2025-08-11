using FluentValidation;
using TeachPanel.Application.Models.Users;

namespace TeachPanel.Application.Validators.Users;

public sealed class ExpireRefreshTokenRequestValidator : AbstractValidator<ExpireRefreshTokenRequest>
{
    public ExpireRefreshTokenRequestValidator()
    {
        RuleFor(x => x.AccessToken)
            .NotEmpty()
            .MaximumLength(1000);
        
        RuleFor(x => x.RefreshToken)
            .NotEmpty()
            .MaximumLength(200);
    }
}