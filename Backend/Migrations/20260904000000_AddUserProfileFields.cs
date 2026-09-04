using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SriLankaTransportComplaints.Api.Migrations
{
    public partial class AddUserProfileFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Intentionally left blank.
            // The new columns are now created in InitialCreate so fresh databases do not duplicate them.
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Intentionally left blank.
        }
    }
}
