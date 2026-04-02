using DoctorLicenseManagement.Application.Interfaces;
using DoctorLicenseManagement.Application.Services;
using DoctorLicenseManagement.API.Middleware;
using DoctorLicenseManagement.API.Database;
using DoctorLicenseManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(x => x.Value.Errors.Count > 0)
            .SelectMany(x => x.Value.Errors)
            .Select(x => x.ErrorMessage)
            .ToList();

        var response = new
        {
            success = false,
            message = errors.FirstOrDefault() ?? "Invalid request"
        };

        return new BadRequestObjectResult(response);
    };
});

// Dependency Injection
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IDbConnectionFactory, DbConnectionFactory>();

var app = builder.Build();

// Database Initializer
var initializer = new DatabaseInitializer(builder.Configuration);
await initializer.InitializeAsync();

// Middleware
app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();