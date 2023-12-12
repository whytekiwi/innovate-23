using System;
using FunctionApp.Models;
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

        public bool HasSignedInToday
        {
            get
            {
                if (LastCheckInDate == null)
                {
                    return false;
                }

                var start = NewZealandDateTimeOffsetHelper.GetStartOfTodayNzInUtc();
                var end = start.AddDays(1);
                return LastCheckInDate >= start && LastCheckInDate < end;
            }
        }
    }
}