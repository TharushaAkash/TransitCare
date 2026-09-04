using System.ComponentModel.DataAnnotations;

namespace SriLankaTransportComplaints.Api.Dtos;

public record CreateComplaintDto(
    [Required, StringLength(120)] string Title,
    [Required, StringLength(2500)] string Description,
    [Required, StringLength(80)] string Category,
    [Required, StringLength(80)] string District,
    [Required, StringLength(160)] string RouteOrLocation);

public record UpdateComplaintStatusDto(
    [Required, StringLength(40)] string Status,
    [StringLength(2500)] string? AdminResponse);

public record SearchComplaintsQueryDto(
    string? Keyword,
    string? ComplaintType,
    string? RouteNumber,
    string? Location,
    string? Status,
    DateOnly? Date);

public record ComplaintDto(
    int Id,
    string ReferenceNumber,
    string Title,
    string Description,
    string Category,
    string District,
    string RouteOrLocation,
    string Status,
    string? AdminResponse,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int UserId,
    string UserName,
    string UserEmail);
