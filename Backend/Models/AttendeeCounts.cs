namespace FunctionApp.Models
{
    public record AttendeeCounts
    {
        public int Total { get; set; }
        public int SignedIn { get; set; }
        public int RemoteSignedIn { get; set; }
    }
}