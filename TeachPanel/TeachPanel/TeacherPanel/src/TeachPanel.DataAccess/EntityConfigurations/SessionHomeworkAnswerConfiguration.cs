using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeachPanel.Core.Models.Entities;
using TeachPanel.Core.Models.Enums;

namespace TeachPanel.DataAccess.EntityConfigurations;

public sealed class SessionHomeworkAnswerConfiguration : AuditEntityBaseConfiguration<SessionHomeworkAnswer, Guid>
{
    public override void Configure(EntityTypeBuilder<SessionHomeworkAnswer> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.SessionHomeworkStudentId)
            .IsRequired();

        builder.Property(x => x.QuestionId)
            .IsRequired();

        builder.Property(x => x.State)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(x => x.CreatedAtLocal)
            .IsRequired();

        builder.HasOne(x => x.SessionHomeworkStudent)
            .WithMany()
            .HasForeignKey(x => x.SessionHomeworkStudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Question)
            .WithMany()
            .HasForeignKey(x => x.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.SessionHomeworkStudentId);
        builder.HasIndex(x => x.QuestionId);
        builder.HasIndex(x => x.State);
    }
} 