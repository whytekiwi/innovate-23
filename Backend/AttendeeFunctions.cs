using System.Threading.Tasks;
using FunctionApp.Models;
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
        private const AuthorizationLevel AccessLevel = AuthorizationLevel.Anonymous;

        private readonly AttendeeDataTables _attendeeDataTables;

        private static readonly JsonSerializerSettings SerializerSettings = new()
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };

        public AttendeeFunctions(AttendeeDataTables attendeeDataTables)
        {
            _attendeeDataTables = attendeeDataTables;
        }

        [FunctionName("getTeams")]
        public async Task<IActionResult> GetTeams(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "teams")]
            HttpRequest req, ILogger log)
        {
            var teams = await _attendeeDataTables.GetTeamsAsync();
            return new OkObjectResult(teams);
        }

        [FunctionName("postTeam")]
        public async Task<IActionResult> PostTeam(
            [HttpTrigger(AccessLevel, "post", Route = "teams")]
            HttpRequest req,
            ILogger log,
            [SignalR(HubName = "serverless")] IAsyncCollector<SignalRMessage> signalRMessages)
        {
            var team = await req.ReadFromJsonAsync<TeamEntity>();
            if (string.IsNullOrEmpty(team.Id))
            {
                team.Id = UniqueId.Next();
            }

            team = await _attendeeDataTables.UpsertTeamAsync(team);
            var json = JsonConvert.SerializeObject(team, SerializerSettings);

            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "teamUpdated",
                    Arguments = new object[] { json }
                });

            return new AcceptedResult();
        }

        [FunctionName("getMembersForTeam")]
        public async Task<IActionResult> GetTeamMembers(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "teams/{teamId}/attendees")]
            HttpRequest req,
            string teamId,
            ILogger log)
        {
            var teamMembers = await _attendeeDataTables.GetTeamMembersAsync(teamId);
            return new OkObjectResult(teamMembers);
        }

        [FunctionName("postAttendee")]
        public async Task<IActionResult> PostAttendee(
            [HttpTrigger(AccessLevel, "post", Route = "teams/{teamId}/attendees")]
            HttpRequest req,
            string teamId,
            ILogger log,
            [SignalR(HubName = "serverless")] IAsyncCollector<SignalRMessage> signalRMessages)
        {
            string? newTeamId = req.Query["newTeamId"];

            bool isCreating = false;
            var attendee = await req.ReadFromJsonAsync<AttendeeEntity>();
            if (string.IsNullOrEmpty(attendee.Id))
            {
                isCreating = true;
                attendee.Id = UniqueId.Next();
            }

            attendee.TeamId = teamId;
            if (!isCreating && !string.IsNullOrEmpty(newTeamId))
            {
                var persistedAttendee = await _attendeeDataTables.GetAttendeeAsync(teamId, attendee.Id);
                await _attendeeDataTables.DeleteAttendeeAsync(teamId, attendee.Id);

                attendee = persistedAttendee with
                {
                    Name = attendee.Name,
                    JobTitle = attendee.JobTitle,
                    ProfilePictureUrl = attendee.ProfilePictureUrl,
                    TeamId = newTeamId
                };

                var j = JsonConvert.SerializeObject(new { attendeeId = attendee.Id, teamId }, SerializerSettings);

                await signalRMessages.AddAsync(
                    new SignalRMessage
                    {
                        Target = "attendeeRemoved",
                        Arguments = new object[] { j }
                    });

                isCreating = true;
            }

            attendee = await _attendeeDataTables.UpsertAttendeeAsync(attendee);

            var target = isCreating ? "attendeeAdded" : "attendeeUpdated";
            var json = JsonConvert.SerializeObject(attendee, SerializerSettings);

            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = target,
                    Arguments = new object[] { json }
                });

            return new AcceptedResult();
        }

        [FunctionName("deleteAttendee")]
        public async Task<IActionResult> DeleteAttendee(
            [HttpTrigger(AccessLevel, "delete", Route = "teams/{teamId}/attendees/{attendeeId}")]
            HttpRequest req,
            string teamId,
            string attendeeId,
            ILogger log,
            [SignalR(HubName = "serverless")] IAsyncCollector<SignalRMessage> signalRMessages)
        {
            await _attendeeDataTables.DeleteAttendeeAsync(teamId, attendeeId);

            var json = JsonConvert.SerializeObject(new { attendeeId, teamId }, SerializerSettings);

            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "attendeeRemoved",
                    Arguments = new object[] { json }
                });

            return new OkResult();
        }

        [FunctionName("countAttendees")]
        public async Task<IActionResult> CountAttendees(
            [HttpTrigger(AccessLevel, "get", Route = "attendees/count")]
            HttpRequest req,
            ILogger log)
        {
            var total = await _attendeeDataTables.CountAttendeesAsync();
            var signedIn = await _attendeeDataTables.CountSignedInAttendeesAsync();
            var remote = await _attendeeDataTables.CountSignedInRemoteAttendeesAsync();

            return new OkObjectResult(new AttendeeCounts
            {
                Total = total,
                SignedIn = signedIn,
                RemoteSignedIn = remote
            });
        }

        [FunctionName("resetSignIns")]
        public async Task<IActionResult> ResetAttendance(
            [HttpTrigger(AccessLevel, "delete", Route = "attendees")]
            HttpRequest req,
            [SignalR(HubName = "serverless")] IAsyncCollector<SignalRMessage> signalRMessages)
        {
            await _attendeeDataTables.ResetAttendanceAsync();

            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "resetAll"
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
                await _attendeeDataTables.SignInAttendeeAsync(teamId, attendeeId, signInReceipt?.PhotoConsent);

            if (attendee == null) return new BadRequestObjectResult("Attendee does not exist");
            var json = JsonConvert.SerializeObject(attendee, SerializerSettings);

            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "attendeeSelected",
                    Arguments = new object[] { json }
                });

            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "attendeeUpdated",
                    Arguments = new object[] { json }
                });

            return new AcceptedResult();
        }
    }
}