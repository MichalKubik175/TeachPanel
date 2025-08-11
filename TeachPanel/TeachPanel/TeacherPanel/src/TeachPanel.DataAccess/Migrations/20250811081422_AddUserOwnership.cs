using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeachPanel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddUserOwnership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_session_homework_students_sessions_session_id",
                table: "session_homework_students");

            migrationBuilder.DropForeignKey(
                name: "fk_session_regular_students_sessions_session_id",
                table: "session_regular_students");

            migrationBuilder.DropIndex(
                name: "ix_session_regular_students_table_number",
                table: "session_regular_students");

            migrationBuilder.DropIndex(
                name: "ix_session_homework_students_table_number",
                table: "session_homework_students");

            migrationBuilder.DropIndex(
                name: "ix_brands_name",
                table: "brands");

            migrationBuilder.AlterColumn<string>(
                name: "rows",
                table: "table_layouts",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "table_layouts",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "students",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "session_regular_students",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "session_homework_students",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "questionnaires",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "groups",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "commentaries",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "brands",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "brand_groups",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "ix_table_layouts_user_id",
                table: "table_layouts",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_students_user_id",
                table: "students",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_session_regular_students_user_id",
                table: "session_regular_students",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_session_homework_students_user_id",
                table: "session_homework_students",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_questionnaires_is_deleted",
                table: "questionnaires",
                column: "is_deleted");

            migrationBuilder.CreateIndex(
                name: "ix_questionnaires_user_id",
                table: "questionnaires",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_groups_name",
                table: "groups",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "ix_groups_user_id",
                table: "groups",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_commentaries_user_id",
                table: "commentaries",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_brands_name",
                table: "brands",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "ix_brands_user_id",
                table: "brands",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_brand_groups_user_id",
                table: "brand_groups",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_brand_groups_users_user_id",
                table: "brand_groups",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_brands_users_user_id",
                table: "brands",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_commentaries_users_user_id",
                table: "commentaries",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_groups_users_user_id",
                table: "groups",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_questionnaires_users_user_id",
                table: "questionnaires",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_session_homework_students_sessions_session_id",
                table: "session_homework_students",
                column: "session_id",
                principalTable: "sessions",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_session_homework_students_users_user_id",
                table: "session_homework_students",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_session_regular_students_sessions_session_id",
                table: "session_regular_students",
                column: "session_id",
                principalTable: "sessions",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_session_regular_students_users_user_id",
                table: "session_regular_students",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_students_users_user_id",
                table: "students",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_table_layouts_users_user_id",
                table: "table_layouts",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_brand_groups_users_user_id",
                table: "brand_groups");

            migrationBuilder.DropForeignKey(
                name: "fk_brands_users_user_id",
                table: "brands");

            migrationBuilder.DropForeignKey(
                name: "fk_commentaries_users_user_id",
                table: "commentaries");

            migrationBuilder.DropForeignKey(
                name: "fk_groups_users_user_id",
                table: "groups");

            migrationBuilder.DropForeignKey(
                name: "fk_questionnaires_users_user_id",
                table: "questionnaires");

            migrationBuilder.DropForeignKey(
                name: "fk_session_homework_students_sessions_session_id",
                table: "session_homework_students");

            migrationBuilder.DropForeignKey(
                name: "fk_session_homework_students_users_user_id",
                table: "session_homework_students");

            migrationBuilder.DropForeignKey(
                name: "fk_session_regular_students_sessions_session_id",
                table: "session_regular_students");

            migrationBuilder.DropForeignKey(
                name: "fk_session_regular_students_users_user_id",
                table: "session_regular_students");

            migrationBuilder.DropForeignKey(
                name: "fk_students_users_user_id",
                table: "students");

            migrationBuilder.DropForeignKey(
                name: "fk_table_layouts_users_user_id",
                table: "table_layouts");

            migrationBuilder.DropIndex(
                name: "ix_table_layouts_user_id",
                table: "table_layouts");

            migrationBuilder.DropIndex(
                name: "ix_students_user_id",
                table: "students");

            migrationBuilder.DropIndex(
                name: "ix_session_regular_students_user_id",
                table: "session_regular_students");

            migrationBuilder.DropIndex(
                name: "ix_session_homework_students_user_id",
                table: "session_homework_students");

            migrationBuilder.DropIndex(
                name: "ix_questionnaires_is_deleted",
                table: "questionnaires");

            migrationBuilder.DropIndex(
                name: "ix_questionnaires_user_id",
                table: "questionnaires");

            migrationBuilder.DropIndex(
                name: "ix_groups_name",
                table: "groups");

            migrationBuilder.DropIndex(
                name: "ix_groups_user_id",
                table: "groups");

            migrationBuilder.DropIndex(
                name: "ix_commentaries_user_id",
                table: "commentaries");

            migrationBuilder.DropIndex(
                name: "ix_brands_name",
                table: "brands");

            migrationBuilder.DropIndex(
                name: "ix_brands_user_id",
                table: "brands");

            migrationBuilder.DropIndex(
                name: "ix_brand_groups_user_id",
                table: "brand_groups");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "table_layouts");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "students");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "session_regular_students");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "session_homework_students");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "questionnaires");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "groups");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "commentaries");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "brands");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "brand_groups");

            migrationBuilder.AlterColumn<string>(
                name: "rows",
                table: "table_layouts",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_session_regular_students_table_number",
                table: "session_regular_students",
                column: "table_number");

            migrationBuilder.CreateIndex(
                name: "ix_session_homework_students_table_number",
                table: "session_homework_students",
                column: "table_number");

            migrationBuilder.CreateIndex(
                name: "ix_brands_name",
                table: "brands",
                column: "name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "fk_session_homework_students_sessions_session_id",
                table: "session_homework_students",
                column: "session_id",
                principalTable: "sessions",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_session_regular_students_sessions_session_id",
                table: "session_regular_students",
                column: "session_id",
                principalTable: "sessions",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
