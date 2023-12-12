namespace Innovate
{
    public static class ConsentStateResolver
    {
        private const string ApprovesPhotos = "yes";
        private const string IsRemote = "remote";
        private const string DeniesPhoto = "no";

        public static string GetResolvedState(string? attendeeStatus, string? signInStatus)
        {
            if (!string.IsNullOrEmpty(signInStatus)) return signInStatus;

            if (!string.IsNullOrEmpty(attendeeStatus)) return attendeeStatus;

            return DeniesPhoto;
        }
    }
}