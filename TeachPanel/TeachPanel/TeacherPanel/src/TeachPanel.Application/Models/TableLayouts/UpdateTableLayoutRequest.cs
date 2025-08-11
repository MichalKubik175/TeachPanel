namespace TeachPanel.Application.Models.TableLayouts;

public class UpdateTableLayoutRequest
{
    public string Name { get; set; } = string.Empty;
    public List<TableRowModel> Rows { get; set; } = new();
} 