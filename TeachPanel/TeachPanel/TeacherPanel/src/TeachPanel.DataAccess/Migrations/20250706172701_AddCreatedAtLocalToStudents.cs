﻿using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeachPanel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedAtLocalToStudents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "created_at_local",
                table: "students",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "created_at_local",
                table: "students");
        }
    }
}
