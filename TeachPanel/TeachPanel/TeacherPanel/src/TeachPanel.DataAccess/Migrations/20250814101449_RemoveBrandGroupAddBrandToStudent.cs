using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeachPanel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class RemoveBrandGroupAddBrandToStudent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "brand_id",
                table: "students",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "ix_students_brand_id",
                table: "students",
                column: "brand_id");

            migrationBuilder.AddForeignKey(
                name: "fk_students_brands_brand_id",
                table: "students",
                column: "brand_id",
                principalTable: "brands",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_students_brands_brand_id",
                table: "students");

            migrationBuilder.DropIndex(
                name: "ix_students_brand_id",
                table: "students");

            migrationBuilder.DropColumn(
                name: "brand_id",
                table: "students");
        }
    }
}
