using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeachPanel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentVisits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "student_visits",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    student_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    visit_date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    is_present = table.Column<bool>(type: "INTEGER", nullable: false),
                    user_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    notes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    deleted_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    created_by = table.Column<string>(type: "TEXT", nullable: true),
                    updated_by = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_visits", x => x.id);
                    table.ForeignKey(
                        name: "fk_student_visits_students_student_id",
                        column: x => x.student_id,
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_student_visits_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_student_visits_student_date_user",
                table: "student_visits",
                columns: new[] { "student_id", "visit_date", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_student_visits_user_id",
                table: "student_visits",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "student_visits");
        }
    }
}
