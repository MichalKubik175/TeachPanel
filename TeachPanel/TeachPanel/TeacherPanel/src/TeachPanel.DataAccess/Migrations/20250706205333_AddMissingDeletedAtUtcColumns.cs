using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeachPanel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingDeletedAtUtcColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "deleted_at_utc",
                table: "users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "deleted_at_utc",
                table: "students",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "deleted_at_utc",
                table: "refresh_tokens",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "deleted_at_utc",
                table: "questions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "deleted_at_utc",
                table: "questionnaires",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "deleted_at_utc",
                table: "groups",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "deleted_at_utc",
                table: "users");

            migrationBuilder.DropColumn(
                name: "deleted_at_utc",
                table: "students");

            migrationBuilder.DropColumn(
                name: "deleted_at_utc",
                table: "refresh_tokens");

            migrationBuilder.DropColumn(
                name: "deleted_at_utc",
                table: "questions");

            migrationBuilder.DropColumn(
                name: "deleted_at_utc",
                table: "questionnaires");

            migrationBuilder.DropColumn(
                name: "deleted_at_utc",
                table: "groups");
        }
    }
}
