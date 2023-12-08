using System;

namespace Innovate.Models
{
    public record SignInReceipt : EntityToDto
    {
        public DateTimeOffset? SignInTime { get; set; }

        public string? PhotoConsent { get; set; }

        public string? AttendeeId { get; set; }
    }
}