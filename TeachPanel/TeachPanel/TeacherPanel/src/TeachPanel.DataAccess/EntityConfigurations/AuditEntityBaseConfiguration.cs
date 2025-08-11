using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeachPanel.Core.Models.Entities;

namespace TeachPanel.DataAccess.EntityConfigurations;

public abstract class AuditEntityBaseConfiguration<TEntity, TKey> : EntityConfigurationBase<TEntity, TKey>
    where TEntity : AuditEntity<TKey>
{
    public override void Configure(EntityTypeBuilder<TEntity> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc);
        builder.Property(x => x.DeletedAtUtc);
        builder.Property(x => x.CreatedBy);
        builder.Property(x => x.UpdatedBy);
    }
}