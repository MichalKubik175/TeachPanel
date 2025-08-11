using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TeachPanel.Core.Models.Entities;

namespace TeachPanel.DataAccess.Connection;

public class DatabaseContext : DbContext
{
    public DatabaseContext(DbContextOptions<DatabaseContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<Student> Students { get; set; }
    public DbSet<Questionnaire> Questionnaires { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Brand> Brands { get; set; }
    public DbSet<Commentary> Commentaries { get; set; }
    public DbSet<BrandGroup> BrandGroups { get; set; }
    public DbSet<TableLayout> TableLayouts { get; set; }
    public DbSet<Session> Sessions { get; set; }
    public DbSet<SessionHomeworkStudent> SessionHomeworkStudents { get; set; }
    public DbSet<SessionRegularStudent> SessionRegularStudents { get; set; }
    public DbSet<SessionHomeworkAnswer> SessionHomeworkAnswers { get; set; }
    public DbSet<SessionRegularAnswer> SessionRegularAnswers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DatabaseContext).Assembly);
    }
}

public class DbContextFactory : IDesignTimeDbContextFactory<DatabaseContext>
{
    public DatabaseContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<DatabaseContext>();
     
        var fileConfiguration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json", optional: true)
            .Build();

        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DatabaseContext")
            ?? Environment.GetEnvironmentVariable("ConnectionStrings:DatabaseContext")
            ?? fileConfiguration.GetConnectionString(nameof(DatabaseContext));
        
        optionsBuilder.UseSqlite(connectionString, opt =>
        {
            opt.MigrationsAssembly("TeachPanel.DataAccess");
        })
        .UseSnakeCaseNamingConvention();
        
        optionsBuilder.UseLoggerFactory(LoggerFactory.Create(builder => builder.AddConsole()));

        return new DatabaseContext(optionsBuilder.Options);
    }
}