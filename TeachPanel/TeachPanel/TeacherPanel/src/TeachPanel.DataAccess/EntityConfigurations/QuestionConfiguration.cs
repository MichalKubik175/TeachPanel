using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeachPanel.Core.Models.Entities;

namespace TeachPanel.DataAccess.EntityConfigurations;

public sealed class QuestionConfiguration : AuditEntityBaseConfiguration<Question, Guid>
{
    public override void Configure(EntityTypeBuilder<Question> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.Answer)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(x => x.QuestionnaireId)
            .IsRequired();

        builder.Property(x => x.CreatedAtLocal)
            .IsRequired();

        builder.Property(x => x.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        // Configure foreign key relationship
        builder.HasOne(x => x.Questionnaire)
            .WithMany(x => x.Questions)
            .HasForeignKey(x => x.QuestionnaireId)
            .OnDelete(DeleteBehavior.Cascade);
    }
} 