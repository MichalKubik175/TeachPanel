using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeachPanel.Core.Models.Entities;

namespace TeachPanel.DataAccess.EntityConfigurations;

public sealed class BrandConfiguration : AuditEntityBaseConfiguration<Brand, Guid>
{
    public override void Configure(EntityTypeBuilder<Brand> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.CreatedAtLocal)
            .IsRequired();

        builder.Property(x => x.UserId)
            .IsRequired();

        // Configure foreign key relationship with User
        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Add index on UserId for performance
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.Name);
    }
} 