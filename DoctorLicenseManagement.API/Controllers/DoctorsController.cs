using DoctorLicenseManagement.Application.DTOs;
using DoctorLicenseManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoctorLicenseManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly IDoctorService _doctorService;

    public DoctorsController(IDoctorService doctorService)
    {
        _doctorService = doctorService;
    }

    // ============================
    // CREATE DOCTOR
    // ============================
    [HttpPost]
    public async Task<IActionResult> AddDoctor([FromBody] CreateDoctorDto dto)
    {
        if (dto == null)
        {
            return BadRequest(new
            {
                success = false,
                message = "Request body is required"
            });
        }

        var id = await _doctorService.AddDoctorAsync(dto);

        return CreatedAtAction(nameof(GetById), new { id }, new
        {
            success = true,
            message = "Doctor added successfully",
            data = id
        });
    }

    // ============================
    // GET ALL (SEARCH + FILTER + PAGINATION)
    // ============================
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        if (pageNumber <= 0 || pageSize <= 0)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid pagination values"
            });
        }

        var result = await _doctorService.GetAllDoctorsAsync(
            search,
            status,
            pageNumber,
            pageSize
        );

        if (result == null || !result.Any())
        {
            return NotFound(new
            {
                success = false,
                message = "No doctors found"
            });
        }

        return Ok(new
        {
            success = true,
            message = "Doctors fetched successfully",
            pageNumber,
            pageSize,
            count = result.Count,
            data = result
        });
    }

    // ============================
    // GET BY ID
    // ============================
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid doctor ID"
            });
        }

        var result = await _doctorService.GetDoctorByIdAsync(id);

        if (result == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Doctor not found"
            });
        }

        return Ok(new
        {
            success = true,
            message = "Doctor fetched successfully",
            data = result
        });
    }

    // ============================
    // UPDATE DOCTOR
    // ============================
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDoctorDto dto)
    {
        if (id <= 0)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid doctor ID"
            });
        }

        if (dto == null)
        {
            return BadRequest(new
            {
                success = false,
                message = "Request body is required"
            });
        }

        var result = await _doctorService.UpdateDoctorAsync(id, dto);

        if (!result)
        {
            return NotFound(new
            {
                success = false,
                message = "Doctor not found"
            });
        }

        return Ok(new
        {
            success = true,
            message = "Doctor updated successfully"
        });
    }

    // ============================
    // UPDATE STATUS
    // ============================
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        if (id <= 0)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid doctor ID"
            });
        }

        if (string.IsNullOrWhiteSpace(status))
        {
            return BadRequest(new
            {
                success = false,
                message = "Status is required"
            });
        }

        var result = await _doctorService.UpdateStatusAsync(id, status);

        if (!result)
        {
            return NotFound(new
            {
                success = false,
                message = "Doctor not found"
            });
        }

        return Ok(new
        {
            success = true,
            message = "Doctor status updated successfully"
        });
    }

    // ============================
    // DELETE (SOFT DELETE)
    // ============================
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid doctor ID"
            });
        }

        var result = await _doctorService.DeleteDoctorAsync(id);

        if (!result)
        {
            return NotFound(new
            {
                success = false,
                message = "Doctor not found"
            });
        }

        return Ok(new
        {
            success = true,
            message = "Doctor deleted successfully"
        });
    }

    // ============================
    // EXPIRED DOCTORS
    // ============================

    [HttpGet("expired")]
    public async Task<IActionResult> GetExpiredDoctors()
    {
        var result = await _doctorService.GetExpiredDoctorsAsync();

        return Ok(new
        {
            success = true,
            data = result
        });
    }

    // ============================
    // DOCTORS SUMMARY
    // ============================

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var result = await _doctorService.GetDoctorSummaryAsync();

        return Ok(new
        {
            success = true,
            data = result
        });
    }

}