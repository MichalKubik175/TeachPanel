using FluentValidation;
using TeachPanel.Application.Models.Auth;

namespace TeachPanel.Application.Validators.Users;

public sealed class RefreshAccessTokenRequestValidator : AbstractValidator<RefreshAccessTokenRequest>
{
    public RefreshAccessTokenRequestValidator()
    {
        RuleFor(x => x.AccessToken)
            .NotEmpty()
            .MaximumLength(1000);
        
        RuleFor(x => x.RefreshToken)
            .NotEmpty()
            .MaximumLength(200);
    }
}