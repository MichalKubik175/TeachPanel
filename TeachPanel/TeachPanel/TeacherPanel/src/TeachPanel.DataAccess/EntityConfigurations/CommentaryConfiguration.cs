using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeachPanel.Core.Models.Entities;

namespace TeachPanel.DataAccess.EntityConfigurations;

public sealed class CommentaryConfiguration : AuditEntityBaseConfiguration<Commentary, Guid>
{
    public override void Configure(EntityTypeBuilder<Commentary> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.Text)
            .IsRequired()
            .HasMaxLength(2000);

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
    }
} 