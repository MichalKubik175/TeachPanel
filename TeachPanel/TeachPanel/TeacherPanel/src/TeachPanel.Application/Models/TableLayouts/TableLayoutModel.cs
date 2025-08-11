namespace TeachPanel.Application.Models.TableLayouts;

public class TableLayoutModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<TableRowModel> Rows { get; set; } = new();
    public DateTimeOffset CreatedAtLocal { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
}

public class TableRowModel
{
    public int RowNumber { get; set; }
    public int TablesCount { get; set; }
} 