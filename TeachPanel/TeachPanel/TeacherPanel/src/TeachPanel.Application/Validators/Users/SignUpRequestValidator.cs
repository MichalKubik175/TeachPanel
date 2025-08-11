﻿using FluentValidation;
using TeachPanel.Application.Extensions;
using TeachPanel.Application.Models.Auth;

namespace TeachPanel.Application.Validators.Users;

public sealed class SignUpRequestValidator : AbstractValidator<SignUpRequest>
{
    public SignUpRequestValidator()
    {
        RuleFor(x => x.Username)
            .MinimumLength(1)
            .MaximumLength(50)
            .Matches(@"^\S*$")
            .WithMessage("Username cannot contain whitespace characters.")
            .NotEmpty();
        
        RuleFor(x => x.FullName)
            .MinimumLength(1)
            .MaximumLength(100)
            .NotEmpty();

        RuleFor(x => x.Password)
            .ApplyPasswordValidationRules();
    }
}