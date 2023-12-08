using System;
using Newtonsoft.Json;

namespace Innovate.Models
{
    public record AttendeeEntity : EntityToDto
    {
        public string? Name { get; set; }
        public string? JobTitle { get; set; }
        public string? TeamId { get; set; }
        public string? ProfilePictureUrl { get; set; }

        public string? PhotoConsent { get; set; }
        public DateTimeOffset? LastCheckInDate { get; set; }

        public bool HasSignedInToday => DateTimeOffset.UtcNow.DayOfYear == LastCheckInDate?.DayOfYear;
    }
}