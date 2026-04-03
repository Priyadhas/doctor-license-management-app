using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DoctorLicenseManagement.Application.Interfaces;
using DoctorLicenseManagement.Application.Services;
using DoctorLicenseManagement.API.Middleware;
using DoctorLicenseManagement.Infrastructure.Data;
using DoctorLicenseManagement.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// =============================================
// ADD SERVICES
// =============================================
builder.Services.AddControllers();

// APPLICATION SERVICES
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// INFRASTRUCTURE SERVICES
builder.Services.AddScoped<IDbConnectionFactory, DbConnectionFactory>();
builder.Services.AddScoped<IJwtService, JwtService>();

// =============================================
// JWT AUTHENTICATION
// =============================================
var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new Exception("JWT Key is missing in configuration");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            )
        };
    });

// =============================================
// VALIDATION RESPONSE
// =============================================
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(e => e.Value?.Errors.Count > 0)
            .SelectMany(e => e.Value!.Errors.Select(err => new
            {
                field = e.Key,
                message = string.IsNullOrWhiteSpace(err.ErrorMessage)
                    ? "Invalid input format"
                    : err.ErrorMessage
            }))
            .ToList();

        return new BadRequestObjectResult(new
        {
            success = false,
            message = errors.FirstOrDefault()?.message ?? "Validation failed",
            errors
        });
    };
});

var app = builder.Build();

// =============================================
// DATABASE INITIALIZATION
// =============================================
using (var scope = app.Services.CreateScope())
{
    var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    var initializer = new DatabaseInitializer(config);
    await initializer.InitializeAsync();
}

// =============================================
// MIDDLEWARE PIPELINE
// =============================================
app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();