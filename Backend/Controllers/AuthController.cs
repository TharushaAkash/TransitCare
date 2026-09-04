using SriLankaTransportComplaints.Api.Data;
using SriLankaTransportComplaints.Api.Dtos;
using SriLankaTransportComplaints.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SriLankaTransportComplaints.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _cfg;

    public AuthController(AppDbContext db, IConfiguration cfg)
    {
        _db = db;
        _cfg = cfg;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var taken = await _db.Users.AnyAsync(u => u.Email == dto.Email);
        if (taken)
        {
            return Conflict("Email already used");
        }

        var user = new User
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            NicNumber = dto.NicNumber.ToUpperInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = UserRoles.User
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return StatusCode(201, new AuthResponseDto(
            user.Id,
            user.Name,
            user.FirstName,
            user.LastName,
            user.Email,
            user.PhoneNumber,
            user.NicNumber,
            user.Role,
            CreateToken(user)));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid credentials");
        }

        return Ok(new AuthResponseDto(
            user.Id,
            user.Name,
            user.FirstName,
            user.LastName,
            user.Email,
            user.PhoneNumber,
            user.NicNumber,
            user.Role,
            CreateToken(user)));
    }

    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public IActionResult Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var name = User.FindFirstValue(ClaimTypes.Name);
        var firstName = User.FindFirstValue(ClaimTypes.GivenName);
        var lastName = User.FindFirstValue(ClaimTypes.Surname);
        var email = User.FindFirstValue(ClaimTypes.Email);
        var phoneNumber = User.FindFirstValue("phone_number");
        var nicNumber = User.FindFirstValue("nic_number");
        var role = User.FindFirstValue(ClaimTypes.Role);

        return Ok(new
        {
            userId,
            name,
            firstName,
            lastName,
            email,
            phoneNumber,
            nicNumber,
            role
        });
    }

    private string CreateToken(User user)
    {
        var jwt = _cfg.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.GivenName, user.FirstName),
            new Claim(ClaimTypes.Surname, user.LastName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("phone_number", user.PhoneNumber),
            new Claim("nic_number", user.NicNumber),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(4),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
