using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeachPanel.Core.Models.Entities;

namespace TeachPanel.DataAccess.EntityConfigurations;

public sealed class SessionHomeworkStudentConfiguration : AuditEntityBaseConfiguration<SessionHomeworkStudent, Guid>
{
    public override void Configure(EntityTypeBuilder<SessionHomeworkStudent> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.SessionId).IsRequired();
        builder.Property(x => x.StudentId).IsRequired();
        builder.Property(x => x.TableNumber).IsRequired();
        builder.Property(x => x.CreatedAtLocal).IsRequired();
        builder.Property(x => x.UserId).IsRequired();

        // Configure foreign key relationships
        builder.HasOne(x => x.Session)
            .WithMany(x => x.SessionHomeworkStudents)
            .HasForeignKey(x => x.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Student)
            .WithMany()
            .HasForeignKey(x => x.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Add indexes for performance
        builder.HasIndex(x => x.SessionId);
        builder.HasIndex(x => x.StudentId);
        builder.HasIndex(x => x.UserId);
        
        // Unique constraint to prevent duplicate student in same session
        builder.HasIndex(x => new { x.SessionId, x.StudentId }).IsUnique();
    }
} 