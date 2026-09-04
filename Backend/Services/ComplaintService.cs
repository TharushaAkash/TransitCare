using SriLankaTransportComplaints.Api.Data;
using SriLankaTransportComplaints.Api.Dtos;
using SriLankaTransportComplaints.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace SriLankaTransportComplaints.Api.Services;

public class ComplaintService : IComplaintService
{
    private readonly AppDbContext _db;

    public ComplaintService(AppDbContext db)
    {
        _db = db;
    }

    private static ComplaintDto ToDto(Complaint complaint) =>
        new(
            complaint.Id,
            complaint.ReferenceNumber,
            complaint.Title,
            complaint.Description,
            complaint.Category,
            complaint.District,
            complaint.RouteOrLocation,
            complaint.Status,
            complaint.AdminResponse,
            complaint.CreatedAt,
            complaint.UpdatedAt,
            complaint.UserId,
            complaint.User.Name,
            complaint.User.Email);

    public IEnumerable<ComplaintDto> GetAll() =>
        _db.Complaints
            .Include(c => c.User)
            .OrderByDescending(c => c.CreatedAt)
            .AsNoTracking()
            .ToList()
            .Select(ToDto);

    public IEnumerable<ComplaintDto> Search(SearchComplaintsQueryDto query, int userId, bool isAdmin)
    {
        var complaints = _db.Complaints
            .Include(c => c.User)
            .AsNoTracking()
            .AsQueryable();

        if (!isAdmin)
        {
            complaints = complaints.Where(c => c.UserId == userId);
        }

        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var keyword = query.Keyword.Trim();
            complaints = complaints.Where(c =>
                EF.Functions.ILike(c.ReferenceNumber, $"%{keyword}%") ||
                EF.Functions.ILike(c.Title, $"%{keyword}%") ||
                EF.Functions.ILike(c.Description, $"%{keyword}%") ||
                EF.Functions.ILike(c.Category, $"%{keyword}%") ||
                EF.Functions.ILike(c.District, $"%{keyword}%") ||
                EF.Functions.ILike(c.RouteOrLocation, $"%{keyword}%") ||
                EF.Functions.ILike(c.Status, $"%{keyword}%"));
        }

        if (!string.IsNullOrWhiteSpace(query.ComplaintType))
        {
            var complaintType = query.ComplaintType.Trim();
            complaints = complaints.Where(c => EF.Functions.ILike(c.Category, $"%{complaintType}%"));
        }

        if (!string.IsNullOrWhiteSpace(query.RouteNumber))
        {
            var routeNumber = query.RouteNumber.Trim();
            complaints = complaints.Where(c => EF.Functions.ILike(c.RouteOrLocation, $"%{routeNumber}%"));
        }

        if (!string.IsNullOrWhiteSpace(query.Location))
        {
            var location = query.Location.Trim();
            complaints = complaints.Where(c =>
                EF.Functions.ILike(c.District, $"%{location}%") ||
                EF.Functions.ILike(c.RouteOrLocation, $"%{location}%"));
        }

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            var status = query.Status.Trim();
            complaints = complaints.Where(c => EF.Functions.ILike(c.Status, $"%{status}%"));
        }

        if (query.Date.HasValue)
        {
            var dayStart = query.Date.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var dayEnd = dayStart.AddDays(1);

            complaints = complaints.Where(c => c.CreatedAt >= dayStart && c.CreatedAt < dayEnd);
        }

        return complaints
            .OrderByDescending(c => c.CreatedAt)
            .ToList()
            .Select(ToDto);
    }

    public IEnumerable<ComplaintDto> GetForUser(int userId) =>
        _db.Complaints
            .Include(c => c.User)
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .AsNoTracking()
            .ToList()
            .Select(ToDto);

    public ComplaintDto? GetById(int id, int userId, bool isAdmin)
    {
        var complaint = _db.Complaints
            .Include(c => c.User)
            .AsNoTracking()
            .FirstOrDefault(c => c.Id == id);

        if (complaint is null)
        {
            return null;
        }

        if (!isAdmin && complaint.UserId != userId)
        {
            return null;
        }

        return ToDto(complaint);
    }

    public ComplaintDto Create(int userId, CreateComplaintDto dto)
    {
        var complaint = new Complaint
        {
            ReferenceNumber = GenerateReferenceNumber(),
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Category = dto.Category.Trim(),
            District = dto.District.Trim(),
            RouteOrLocation = dto.RouteOrLocation.Trim(),
            Status = ComplaintStatuses.Submitted,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            UserId = userId
        };

        _db.Complaints.Add(complaint);
        _db.SaveChanges();

        _db.Entry(complaint).Reference(c => c.User).Load();

        return ToDto(complaint);
    }

    public bool UpdateStatus(int id, UpdateComplaintStatusDto dto)
    {
        var complaint = _db.Complaints.FirstOrDefault(c => c.Id == id);
        if (complaint is null)
        {
            return false;
        }

        if (!ComplaintStatuses.Allowed.Contains(dto.Status))
        {
            throw new ArgumentException("Invalid complaint status.");
        }

        complaint.Status = dto.Status;
        complaint.AdminResponse = string.IsNullOrWhiteSpace(dto.AdminResponse)
            ? complaint.AdminResponse
            : dto.AdminResponse!.Trim();
        complaint.UpdatedAt = DateTime.UtcNow;

        _db.SaveChanges();
        return true;
    }

    private string GenerateReferenceNumber()
    {
        var reference = $"CMP-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";
        while (_db.Complaints.Any(c => c.ReferenceNumber == reference))
        {
            reference = $"CMP-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";
        }

        return reference;
    }
}
