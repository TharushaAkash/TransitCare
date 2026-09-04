namespace SriLankaTransportComplaints.Api.Models;

public class Complaint
{
    public int Id { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string RouteOrLocation { get; set; } = string.Empty;
    public string Status { get; set; } = ComplaintStatuses.Submitted;
    public string? AdminResponse { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
