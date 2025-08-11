using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeachPanel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddSessionEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "sessions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    name = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    state = table.Column<string>(type: "TEXT", nullable: false),
                    user_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    questionnaire_id = table.Column<Guid>(type: "TEXT", nullable: true),
                    table_layout_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    commentary_id = table.Column<Guid>(type: "TEXT", nullable: true),
                    current_selected_question_id = table.Column<Guid>(type: "TEXT", nullable: true),
                    current_selected_session_student_id = table.Column<Guid>(type: "TEXT", nullable: true),
                    created_at_local = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    deleted_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    created_by = table.Column<string>(type: "TEXT", nullable: true),
                    updated_by = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_sessions", x => x.id);
                    table.ForeignKey(
                        name: "fk_sessions_commentaries_commentary_id",
                        column: x => x.commentary_id,
                        principalTable: "commentaries",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_sessions_questionnaires_questionnaire_id",
                        column: x => x.questionnaire_id,
                        principalTable: "questionnaires",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_sessions_table_layouts_table_layout_id",
                        column: x => x.table_layout_id,
                        principalTable: "table_layouts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_sessions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_sessions_commentary_id",
                table: "sessions",
                column: "commentary_id");

            migrationBuilder.CreateIndex(
                name: "ix_sessions_questionnaire_id",
                table: "sessions",
                column: "questionnaire_id");

            migrationBuilder.CreateIndex(
                name: "ix_sessions_state",
                table: "sessions",
                column: "state");

            migrationBuilder.CreateIndex(
                name: "ix_sessions_table_layout_id",
                table: "sessions",
                column: "table_layout_id");

            migrationBuilder.CreateIndex(
                name: "ix_sessions_user_id",
                table: "sessions",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "sessions");
        }
    }
}
