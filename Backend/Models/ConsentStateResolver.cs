namespace Innovate
{
    public static class ConsentStateResolver
    {
        private const string ApprovesPhotos = "yes";
        private const string IsRemote = "remote";
        private const string DeniesPhoto = "no";

        public static string GetResolvedState(string? attendeeStatus, string? signInStatus)
        {
            if (attendeeStatus == IsRemote || signInStatus == IsRemote)
                return IsRemote;
            if (attendeeStatus == ApprovesPhotos || signInStatus == ApprovesPhotos)
                return ApprovesPhotos;
            return DeniesPhoto;
        }
    }
}