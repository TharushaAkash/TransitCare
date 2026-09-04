using SriLankaTransportComplaints.Api.Dtos;

namespace SriLankaTransportComplaints.Api.Services;

public interface IComplaintService
{
    IEnumerable<ComplaintDto> GetAll();
    IEnumerable<ComplaintDto> GetForUser(int userId);
    IEnumerable<ComplaintDto> Search(SearchComplaintsQueryDto query, int userId, bool isAdmin);
    ComplaintDto? GetById(int id, int userId, bool isAdmin);
    ComplaintDto Create(int userId, CreateComplaintDto dto);
    bool UpdateStatus(int id, UpdateComplaintStatusDto dto);
}
