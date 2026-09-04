using SriLankaTransportComplaints.Api.Dtos;
using SriLankaTransportComplaints.Api.Models;
using SriLankaTransportComplaints.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace SriLankaTransportComplaints.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ComplaintsController : ControllerBase
{
    private readonly IComplaintService _service;

    public ComplaintsController(IComplaintService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var isAdmin = User.IsInRole(UserRoles.Admin);
        var userId = GetUserId();

        var complaints = isAdmin
            ? _service.GetAll()
            : _service.GetForUser(userId);

        return Ok(complaints);
    }

    [HttpGet("search")]
    public IActionResult Search([FromQuery] SearchComplaintsQueryDto query)
    {
        var isAdmin = User.IsInRole(UserRoles.Admin);
        var userId = GetUserId();

        var complaints = _service.Search(query, userId, isAdmin);
        return Ok(complaints);
    }

    [HttpGet("{id:int}")]
    public IActionResult GetById(int id)
    {
        var isAdmin = User.IsInRole(UserRoles.Admin);
        var userId = GetUserId();

        var complaint = _service.GetById(id, userId, isAdmin);
        return complaint is null ? NotFound() : Ok(complaint);
    }

    [HttpPost]
    [Authorize(Roles = UserRoles.User + "," + UserRoles.Admin)]
    public IActionResult Create(CreateComplaintDto dto)
    {
        var complaint = _service.Create(GetUserId(), dto);
        return CreatedAtAction(nameof(GetById), new { id = complaint.Id }, complaint);
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = UserRoles.Admin)]
    public IActionResult UpdateStatus(int id, UpdateComplaintStatusDto dto)
    {
        var updated = _service.UpdateStatus(id, dto);
        return updated ? NoContent() : NotFound();
    }

    private int GetUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(raw, out var id) ? id : 0;
    }
}
