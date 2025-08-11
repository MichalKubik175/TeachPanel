using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Npgsql;
using TeachPanel.DataAccess.Connection;
using TeachPanel.DataAccess.Interceptors;

namespace TeachPanel.DataAccess;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDataAccessServices(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        services.AddDbContext<DatabaseContext>((sp ,options) =>
            {
                options.UseSqlite(configuration.GetConnectionString(nameof(DatabaseContext)))
                    .AddInterceptors(new AuditableEntitySaveChangesInterceptor(sp))
                    .UseSnakeCaseNamingConvention();

                AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

                options.UseLoggerFactory(sp.GetRequiredService<ILoggerFactory>());
                
                if (environment.IsDevelopment())
                {
                    options.EnableSensitiveDataLogging();
                }
            }
        );
        
        services.AddTransient<IDbConnection>(sp =>
        {
            var cfg = sp.GetRequiredService<IConfiguration>();
            var connectionString = cfg.GetConnectionString("DatabaseContext");
            return new NpgsqlConnection(connectionString);
        });

        return services;
    }
}