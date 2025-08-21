using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeachPanel.Core.Models.Entities;

namespace TeachPanel.DataAccess.EntityConfigurations;

public sealed class StudentVisitConfiguration : AuditEntityBaseConfiguration<StudentVisit, Guid>
{
    public override void Configure(EntityTypeBuilder<StudentVisit> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.StudentId)
            .IsRequired();

        builder.Property(x => x.VisitDate)
            .IsRequired();

        builder.Property(x => x.IsPresent)
            .IsRequired();

        builder.Property(x => x.UserId)
            .IsRequired();

        builder.Property(x => x.Notes)
            .HasMaxLength(500);

        // Configure foreign key relationship with Student
        builder.HasOne(x => x.Student)
            .WithMany()
            .HasForeignKey(x => x.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure foreign key relationship with User
        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Create unique index for StudentId + VisitDate + UserId to prevent duplicates
        builder.HasIndex(x => new { x.StudentId, x.VisitDate, x.UserId })
            .IsUnique()
            .HasDatabaseName("ix_student_visits_student_date_user");
    }
}

