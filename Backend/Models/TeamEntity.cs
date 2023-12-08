namespace Innovate.Models
{
    public record TeamEntity : EntityToDto
    {
        public string Name { get; set; }
        public string ProblemStatement { get; set; }
    }
}