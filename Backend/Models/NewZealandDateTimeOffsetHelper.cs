using System;
using NodaTime;

namespace FunctionApp.Models;

public static class NewZealandDateTimeOffsetHelper
{
    public static DateTimeOffset GetStartOfTodayNzInUtc()
    {
        DateTimeZone timeZone = DateTimeZoneProviders.Tzdb["Pacific/Auckland"];

        var date = SystemClock.Instance.GetCurrentInstant().InZone(timeZone).Date;
        return timeZone.AtStartOfDay(date).ToDateTimeOffset().ToUniversalTime();
    }
}