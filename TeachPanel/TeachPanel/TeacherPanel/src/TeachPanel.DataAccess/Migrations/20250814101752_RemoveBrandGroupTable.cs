using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeachPanel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class RemoveBrandGroupTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "brand_groups");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "brand_groups",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    brand_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    group_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    user_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    created_at_local = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    created_by = table.Column<string>(type: "TEXT", nullable: true),
                    deleted_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    updated_by = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_brand_groups", x => x.id);
                    table.ForeignKey(
                        name: "fk_brand_groups_brands_brand_id",
                        column: x => x.brand_id,
                        principalTable: "brands",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_brand_groups_groups_group_id",
                        column: x => x.group_id,
                        principalTable: "groups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_brand_groups_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_brand_groups_brand_id_group_id",
                table: "brand_groups",
                columns: new[] { "brand_id", "group_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_brand_groups_group_id",
                table: "brand_groups",
                column: "group_id");

            migrationBuilder.CreateIndex(
                name: "ix_brand_groups_user_id",
                table: "brand_groups",
                column: "user_id");
        }
    }
}
