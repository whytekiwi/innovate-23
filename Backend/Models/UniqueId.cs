using System;

namespace Innovate.Models
{
    public static class UniqueId
    {
        public static string Next()
        {
            var currentEpochTime = DateTime.Now.Ticks;
            return $"{currentEpochTime}";
        }
    }
}