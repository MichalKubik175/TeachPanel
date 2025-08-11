using System.Text.Json;

namespace TeachPanel.Core.Models.Entities;

public class TableLayout : AuditEntity<Guid>
{
    private TableLayout()
        : base(Guid.CreateVersion7())
    {
    }
    
    public string Name { get; set; } = string.Empty;
    public List<TableRow> Rows { get; set; } = new();
    public DateTimeOffset CreatedAtLocal { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; }

    public static TableLayout Create(string name, List<TableRow> rows, Guid userId)
    {
        var tableLayout = new TableLayout
        {
            Name = name,
            Rows = rows,
            UserId = userId,
            CreatedAtLocal = DateTimeOffset.Now
        };
        
        return tableLayout;
    }

    public void Update(string name, List<TableRow> rows)
    {
        Name = name;
        Rows = rows;
    }
}

public class TableRow
{
    public int RowNumber { get; set; }
    public int TablesCount { get; set; }
} 