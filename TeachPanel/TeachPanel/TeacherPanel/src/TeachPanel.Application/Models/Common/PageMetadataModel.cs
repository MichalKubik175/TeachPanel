namespace TeachPanel.Application.Models.Common;

public sealed record PageMetadataModel(
    int TotalPagesCount,
    int CurrentPage,
    int TotalItemsCount);