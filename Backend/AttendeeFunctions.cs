using System.Threading.Tasks;
using Innovate.Data;
using Innovate.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Innovate
{
    public class AttendeeFunctions
    {
        private readonly AttendeeDataTables attendeeDataTables;

        private static JsonSerializerSettings _serializerSettings = new JsonSerializerSettings()
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };


        public AttendeeFunctions(AttendeeDataTables attendeeDataTables)
        {
            this.attendeeDataTables = attendeeDataTables;
        }

        [FunctionName("getTeams")]
        public async Task<IActionResult> GetTeams(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "teams")]
            HttpRequest req, ILogger log)
        {
            var teams = await attendeeDataTables.GetTeamsAsync();
            return new OkObjectResult(teams);
        }

        [FunctionName("postTeam")]
        public async Task<IActionResult> PostTeam(
            [HttpTrigger(AuthorizationLevel.Admin, "post", Route = "teams")]
            HttpRequest req,
            ILogger log,
            [SignalR(HubName = "serverless")] IAsyncCollector<SignalRMessage> signalRMessages)
        {
            var team = await req.ReadFromJsonAsync<TeamEntity>();
            if (string.IsNullOrEmpty(team.Id))
            {
                team.Id = UniqueId.Next();
            }

            await attendeeDataTables.UpsertTeamAsync(team);

            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "attendeeUpdated"
                });

            return new OkObjectResult(team);
        }

        [FunctionName("getMembersForTeam")]
        public async Task<IActionResult> GetTeamMembers(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "teams/{teamId}/attendees")]
            HttpRequest req,
            string teamId,
            ILogger log)
        {
            var teamMembers = await attendeeDataTables.GetTeamMembersAsync(teamId);
            return new OkObjectResult(teamMembers);
        }

        [FunctionName("postAttendee")]
        public async Task<IActionResult> PostAttendee(
            [HttpTrigger(AuthorizationLevel.Admin, "post", Route = "teams/{teamId}/attendees")]
            HttpRequest req,
            string teamId,
            ILogger log,
            [SignalR(HubName = "serverless")] IAsyncCollector<SignalRMessage> signalRMessages)
        {
            var attendee = await req.ReadFromJsonAsync<AttendeeEntity>();
            if (string.IsNullOrEmpty(attendee.Id))
            {
                attendee.Id = UniqueId.Next();
            }

            attendee.TeamId = teamId;
            await attendeeDataTables.UpsetAttendeeAsync(attendee);

            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "attendeeUpdated"
                });

            return new OkObjectResult(attendee);
        }


        [FunctionName("deleteAttendee")]
        public async Task<IActionResult> DeleteAttendee(
            [HttpTrigger(AuthorizationLevel.Admin, "delete", Route = "teams/{teamId}/attendees/{attendeeId}")]
            HttpRequest req,
            string teamId,
            string attendeeId,
            ILogger log,
            [SignalR(HubName = "serverless")] IAsyncCollector<SignalRMessage> signalRMessages)
        {
            await attendeeDataTables.DeleteAttendeeAsync(teamId, attendeeId);

            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "attendeeUpdated"
                });

            return new OkResult();
        }

        [FunctionName("resetSignIns")]
        public async Task<IActionResult> ResetAttendance(
            [HttpTrigger(AuthorizationLevel.Admin, "delete", Route = "attendees")]
            HttpRequest req,
            [SignalR(HubName = "serverless")] IAsyncCollector<SignalRMessage> signalRMessages)
        {
            await attendeeDataTables.ResetAttendanceAsync();

            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "attendeeUpdated"
                });
            return new AcceptedResult();
        }


        [FunctionName("selectAttendee")]
        public async Task<IActionResult> SelectAttendee(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "teams/{teamId}/attendees/{attendeeId}")]
            HttpRequest req,
            string teamId,
            string attendeeId,
            ILogger log,
            [SignalR(HubName = "serverless")] IAsyncCollector<SignalRMessage> signalRMessages)
        {
            var signInReceipt = await req.ReadFromJsonAsync<SignInReceipt>();
            var attendee =
                await attendeeDataTables.SignInAttendeeAsync(teamId, attendeeId, signInReceipt?.PhotoConsent);

            if (attendee == null) return new BadRequestObjectResult("Attendee does not exist");

            var json = JsonConvert.SerializeObject(attendee, _serializerSettings);

            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "attendeeSelected",
                    Arguments = new object[] { json }
                });

            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "attendeeUpdated"
                });

            return new AcceptedResult();
        }
    }
}