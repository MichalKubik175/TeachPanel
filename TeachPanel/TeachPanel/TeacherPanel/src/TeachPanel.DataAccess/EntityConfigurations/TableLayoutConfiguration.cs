using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;
using TeachPanel.Core.Models.Entities;

namespace TeachPanel.DataAccess.EntityConfigurations;

public sealed class TableLayoutConfiguration : AuditEntityBaseConfiguration<TableLayout, Guid>
{
    public override void Configure(EntityTypeBuilder<TableLayout> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.CreatedAtLocal)
            .IsRequired();

        builder.Property(x => x.UserId)
            .IsRequired();

        // Configure JSON serialization for Rows
        builder.Property(x => x.Rows)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<TableRow>>(v, (JsonSerializerOptions)null))
            .HasColumnType("TEXT");

        // Configure foreign key relationship with User
        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Add index on UserId for performance
        builder.HasIndex(x => x.UserId);
    }
} 