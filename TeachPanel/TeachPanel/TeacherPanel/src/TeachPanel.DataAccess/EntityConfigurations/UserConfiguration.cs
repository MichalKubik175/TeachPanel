﻿using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeachPanel.Core.Models.Entities;
using TeachPanel.Core.Models.Enums;

namespace TeachPanel.DataAccess.EntityConfigurations;

public sealed class UserConfiguration : AuditEntityBaseConfiguration<User, Guid>
{
    public override void Configure(EntityTypeBuilder<User> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.Username).IsRequired();
        builder.Property(x => x.FullName).IsRequired();
        builder.Property(x => x.PasswordHash).IsRequired();

        builder.Property(x => x.Role)
            .HasConversion(
                enumValue => enumValue.ToStringFast(),
                stringValue => Common.ToEnumFast<Role>(stringValue, RoleExtensions.TryParse))
            .IsRequired();

        builder.HasIndex(x => x.Username).IsUnique();
    }
}