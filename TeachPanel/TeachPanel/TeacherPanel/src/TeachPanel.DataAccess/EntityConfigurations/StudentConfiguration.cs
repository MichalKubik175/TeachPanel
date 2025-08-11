using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeachPanel.Core.Models.Entities;

namespace TeachPanel.DataAccess.EntityConfigurations;

public sealed class StudentConfiguration : AuditEntityBaseConfiguration<Student, Guid>
{
    public override void Configure(EntityTypeBuilder<Student> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.FullName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.GroupId)
            .IsRequired();

        builder.Property(x => x.CreatedAtLocal)
            .IsRequired();

        builder.Property(x => x.UserId)
            .IsRequired();

        // Configure foreign key relationship with Group
        builder.HasOne(x => x.Group)
            .WithMany(x => x.Students)
            .HasForeignKey(x => x.GroupId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure foreign key relationship with User
        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Add indexes for performance
        builder.HasIndex(x => x.FullName);
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.GroupId);
    }
} 