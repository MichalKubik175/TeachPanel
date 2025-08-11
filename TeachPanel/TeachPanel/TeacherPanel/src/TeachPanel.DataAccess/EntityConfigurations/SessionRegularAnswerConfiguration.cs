using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeachPanel.Core.Models.Entities;
using TeachPanel.Core.Models.Enums;

namespace TeachPanel.DataAccess.EntityConfigurations;

public sealed class SessionRegularAnswerConfiguration : AuditEntityBaseConfiguration<SessionRegularAnswer, Guid>
{
    public override void Configure(EntityTypeBuilder<SessionRegularAnswer> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.SessionRegularStudentId)
            .IsRequired();

        builder.Property(x => x.State)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(x => x.CreatedAtLocal)
            .IsRequired();

        builder.HasOne(x => x.SessionRegularStudent)
            .WithMany()
            .HasForeignKey(x => x.SessionRegularStudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.SessionRegularStudentId);
        builder.HasIndex(x => x.State);
    }
} 