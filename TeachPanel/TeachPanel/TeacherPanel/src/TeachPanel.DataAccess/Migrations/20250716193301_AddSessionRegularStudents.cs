using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeachPanel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddSessionRegularStudents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "session_homework_students",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    session_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    student_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    table_number = table.Column<int>(type: "INTEGER", nullable: false),
                    created_at_local = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    deleted_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    created_by = table.Column<string>(type: "TEXT", nullable: true),
                    updated_by = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_session_homework_students", x => x.id);
                    table.ForeignKey(
                        name: "fk_session_homework_students_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_session_homework_students_students_student_id",
                        column: x => x.student_id,
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "session_regular_students",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    session_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    student_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    table_number = table.Column<int>(type: "INTEGER", nullable: false),
                    created_at_local = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    deleted_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    created_by = table.Column<string>(type: "TEXT", nullable: true),
                    updated_by = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_session_regular_students", x => x.id);
                    table.ForeignKey(
                        name: "fk_session_regular_students_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_session_regular_students_students_student_id",
                        column: x => x.student_id,
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_session_homework_students_session_id",
                table: "session_homework_students",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "ix_session_homework_students_session_id_student_id",
                table: "session_homework_students",
                columns: new[] { "session_id", "student_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_session_homework_students_student_id",
                table: "session_homework_students",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_session_homework_students_table_number",
                table: "session_homework_students",
                column: "table_number");

            migrationBuilder.CreateIndex(
                name: "ix_session_regular_students_session_id",
                table: "session_regular_students",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "ix_session_regular_students_session_id_student_id",
                table: "session_regular_students",
                columns: new[] { "session_id", "student_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_session_regular_students_student_id",
                table: "session_regular_students",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_session_regular_students_table_number",
                table: "session_regular_students",
                column: "table_number");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "session_homework_students");

            migrationBuilder.DropTable(
                name: "session_regular_students");
        }
    }
}
