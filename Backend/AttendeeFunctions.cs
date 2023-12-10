using System;
using System.Linq;
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
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Innovate
{
    public class AttendeeFunctions
    {
        private const AuthorizationLevel AccessLevel = AuthorizationLevel.Anonymous;

        private readonly AttendeeDataTables _attendeeDataTables;
        private readonly bool _maskAttendees;

        private static readonly JsonSerializerSettings SerializerSettings = new()
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };


        public AttendeeFunctions(AttendeeDataTables attendeeDataTables, IOptions<AttendeeMaskOptions> maskOptions)
        {
            _attendeeDataTables = attendeeDataTables;
            if (maskOptions.Value.MaskAttendees.HasValue && !maskOptions.Value.MaskAttendees.Value)
            {
                _maskAttendees = false;
            }
            else
            {
                _maskAttendees = true;
            }
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

            await _attendeeDataTables.UpsertTeamAsync(team);

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
            var teamMembers = await _attendeeDataTables.GetTeamMembersAsync(teamId);
            if (_maskAttendees)
            {
                Random r = new Random();
                teamMembers = teamMembers.Select(a => MapAttendee(a, r)).ToList();
            }

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
            var attendee = await req.ReadFromJsonAsync<AttendeeEntity>();
            if (string.IsNullOrEmpty(attendee.Id))
            {
                attendee.Id = UniqueId.Next();
            }

            attendee.TeamId = teamId;
            await _attendeeDataTables.UpsetAttendeeAsync(attendee);

            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "attendeeUpdated"
                });

            if (_maskAttendees)
            {
                Random r = new Random();
                attendee = MapAttendee(attendee, r);
            }

            return new OkObjectResult(attendee);
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

            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "attendeeUpdated"
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
                    Target = "attendeeUpdated"
                });

            return new AcceptedResult();
        }

        private static AttendeeEntity MapAttendee(AttendeeEntity attendee, Random random)
        {
            return attendee with
            {
                Name = FakeNameData.GenerateName(random),
                JobTitle = FakeJobTitleData.GetRandomJobTitle(random),
                ProfilePictureUrl = $"https://picsum.photos/seed/{attendee.Id}/512/512"
            };
        }
    }
}