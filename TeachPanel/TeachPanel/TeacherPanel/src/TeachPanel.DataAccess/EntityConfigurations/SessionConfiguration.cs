using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeachPanel.Core.Models.Entities;

namespace TeachPanel.DataAccess.EntityConfigurations;

public sealed class SessionConfiguration : AuditEntityBaseConfiguration<Session, Guid>
{
    public override void Configure(EntityTypeBuilder<Session> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.State)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(x => x.UserId)
            .IsRequired();

        builder.Property(x => x.TableLayoutId)
            .IsRequired();

        builder.Property(x => x.CreatedAtLocal)
            .IsRequired();

        builder.Property(x => x.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        // Foreign key relationships
        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Questionnaire)
            .WithMany()
            .HasForeignKey(x => x.QuestionnaireId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.TableLayout)
            .WithMany()
            .HasForeignKey(x => x.TableLayoutId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Commentary)
            .WithMany()
            .HasForeignKey(x => x.CommentaryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.TableLayoutId);
        builder.HasIndex(x => x.State);
    }
} 