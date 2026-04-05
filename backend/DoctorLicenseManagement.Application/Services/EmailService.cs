using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using DoctorLicenseManagement.Application.Interfaces;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            //  SAFE CONFIG READ
            var smtp = _config["EmailSettings:SmtpServer"] 
                       ?? throw new Exception("SMTP Server not configured");

            var port = int.TryParse(_config["EmailSettings:Port"], out var p) ? p : 587;

            var from = _config["EmailSettings:From"] 
                       ?? throw new Exception("From email not configured");

            var username = _config["EmailSettings:Username"] 
                           ?? throw new Exception("SMTP username missing");

            var password = _config["EmailSettings:Password"] 
                           ?? throw new Exception("SMTP password missing");

            //  SMTP CLIENT
            using var client = new SmtpClient(smtp, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true
            };

            //  EMAIL MESSAGE
            var mail = new MailMessage
            {
                From = new MailAddress(from),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mail.To.Add(to);

            //  SEND
            await client.SendMailAsync(mail);
        }
        catch (Exception ex)
        {
            //  LOG ERROR (DO NOT CRASH APP)
            Console.WriteLine("Email Error: " + ex.Message);

            // Optional: rethrow if needed
            throw new Exception("Failed to send email");
        }
    }
}