using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeachPanel.Core.Models.Entities;

namespace TeachPanel.DataAccess.EntityConfigurations;

public sealed class BrandGroupConfiguration : AuditEntityBaseConfiguration<BrandGroup, Guid>
{
    public override void Configure(EntityTypeBuilder<BrandGroup> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.BrandId).IsRequired();
        builder.Property(x => x.GroupId).IsRequired();
        builder.Property(x => x.CreatedAtLocal).IsRequired();
        builder.Property(x => x.UserId).IsRequired();

        // Configure foreign key relationships
        builder.HasOne(x => x.Brand)
            .WithMany()
            .HasForeignKey(x => x.BrandId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Group)
            .WithMany()
            .HasForeignKey(x => x.GroupId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Create unique index on the combination of BrandId and GroupId
        builder.HasIndex(x => new { x.BrandId, x.GroupId }).IsUnique();
        
        // Add index on UserId for performance
        builder.HasIndex(x => x.UserId);
    }
} 