using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using DoctorLicenseManagement.Application.Interfaces;

namespace DoctorLicenseManagement.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        //  SAFE CONFIG
        var smtp = _config["EmailSettings:SmtpServer"]
            ?? throw new Exception("SMTP Server missing");

        var portString = _config["EmailSettings:Port"] ?? "587";

        if (!int.TryParse(portString, out int port))
            throw new Exception("Invalid SMTP port");

        var from = _config["EmailSettings:From"]
            ?? throw new Exception("Sender email missing");

        var username = _config["EmailSettings:Username"]
            ?? throw new Exception("SMTP username missing");

        var password = _config["EmailSettings:Password"]
            ?? throw new Exception("SMTP password missing");

        try
        {
            using var client = new SmtpClient(smtp, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true
            };

            var mail = new MailMessage
            {
                From = new MailAddress(from, "Doctor License System"),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mail.To.Add(to);

            await client.SendMailAsync(mail);
        }
        catch (Exception ex)
        {
            throw new Exception("Email sending failed: " + ex.Message);
        }
    }
}