using SriLankaTransportComplaints.Api.Dtos;
using SriLankaTransportComplaints.Api.Models;
using SriLankaTransportComplaints.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace SriLankaTransportComplaints.Api.Controllers;

[ApiController]
[Route("api/user-complaints")]
[Authorize(Roles = UserRoles.User)]
public class UserComplaintFilterController : ControllerBase
{
    private readonly IComplaintService _service;

    public UserComplaintFilterController(IComplaintService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetMine()
    {
        var userId = GetUserId();
        return Ok(_service.GetForUser(userId));
    }

    [HttpGet("search")]
    public IActionResult SearchAndFilter([FromQuery] SearchComplaintsQueryDto query)
    {
        var userId = GetUserId();
        var complaints = _service.Search(query, userId, isAdmin: false);
        return Ok(complaints);
    }

    [HttpGet("{id:int}")]
    public IActionResult GetById(int id)
    {
        var complaint = _service.GetById(id, GetUserId(), isAdmin: false);
        return complaint is null ? NotFound() : Ok(complaint);
    }

    private int GetUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(raw, out var id) ? id : 0;
    }
}
