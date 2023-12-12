using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Azure.Data.Tables;
using FunctionApp.Models;
using Innovate.Models;

namespace Innovate.Data;

public class AttendeeDataTables
{
    private TableClient _attendeesTable;
    private TableClient _teamsTable;
    private TableClient _signInsTable;

    public AttendeeDataTables(IOptions<AzureTableStorageOptions> options)
    {
        TableServiceClient tableServiceClient = new TableServiceClient(options.Value.ConnectionString);
        _attendeesTable = tableServiceClient.GetTableClient(tableName: "Attendees");
        _teamsTable = tableServiceClient.GetTableClient(tableName: "Teams");
        _signInsTable = tableServiceClient.GetTableClient(tableName: "SignIns");
    }

    public async Task<List<TeamEntity>> GetTeamsAsync()
    {
        return await _teamsTable.QueryAsync<TeamEntity>()
            .ToListAsync();
    }

    public async Task<AttendeeEntity> GetAttendeeAsync(string teamId, string attendeeId)
    {
        return await _attendeesTable.GetEntityAsync<AttendeeEntity>(teamId, attendeeId);
    }

    public async Task<TeamEntity> UpsertTeamAsync(TeamEntity team)
    {
        team.PartitionKey = "team";
        await _teamsTable.UpsertEntityAsync(team);
        return team;
    }

    public async Task<AttendeeEntity> UpsertAttendeeAsync(AttendeeEntity attendee)
    {
        attendee.PartitionKey = attendee.TeamId ?? "";
        await _attendeesTable.UpsertEntityAsync(attendee);
        return attendee;
    }

    public async Task DeleteAttendeeAsync(string teamId, string attendeeId)
    {
        await _attendeesTable.DeleteEntityAsync(teamId, attendeeId);
    }

    public async Task<List<AttendeeEntity>> GetTeamMembersAsync(string teamId)
    {
        return await _attendeesTable.QueryAsync<AttendeeEntity>(at => at.PartitionKey == teamId)
            .ToListAsync();
    }

    public async Task<int> CountAttendeesAsync()
    {
        return await _attendeesTable.QueryAsync<AttendeeEntity>()
            .CountAsync();
    }

    public async Task<int> CountSignedInAttendeesAsync()
    {
        var start = NewZealandDateTimeOffsetHelper.GetStartOfTodayNzInUtc();
        var end = start.AddDays(1);
        return await _attendeesTable.QueryAsync<AttendeeEntity>(at =>
                at.LastCheckInDate >= start &&
                at.LastCheckInDate < end)
            .CountAsync();
    }

    public async Task<int> CountSignedInRemoteAttendeesAsync()
    {
        var start = NewZealandDateTimeOffsetHelper.GetStartOfTodayNzInUtc();
        var end = start.AddDays(1);
        return await _attendeesTable.QueryAsync<AttendeeEntity>(at =>
                at.LastCheckInDate >= start &&
                at.LastCheckInDate < end &&
                at.PhotoConsent == "remote")
            .CountAsync();
    }

    public async Task ResetAttendanceAsync()
    {
        var attendees = _attendeesTable.Query<AttendeeEntity>();
        foreach (var attendee in attendees)
        {
            attendee.LastCheckInDate = null;
            attendee.PhotoConsent = null;
            await _attendeesTable.UpdateEntityAsync(attendee, attendee.ETag, TableUpdateMode.Replace);
        }
    }

    public async Task<AttendeeEntity?> MoveAttendeesTeamAsync(string attendeeId, string fromTeamId, string toTeamId)
    {
        AttendeeEntity? attendee = await _attendeesTable.GetEntityAsync<AttendeeEntity>(fromTeamId, attendeeId);
        if (attendee == null)
        {
            return null;
        }

        var newAttendee = attendee with { TeamId = toTeamId };

        var deleteAction = new TableTransactionAction(TableTransactionActionType.Delete, attendee);
        var createAction =
            new TableTransactionAction(TableTransactionActionType.Add, newAttendee);

        await _attendeesTable.SubmitTransactionAsync(new[] { deleteAction, createAction });
        return newAttendee;
    }

    public async Task<AttendeeEntity?> SignInAttendeeAsync(string teamId, string attendeeId, string? givesPhotoConsent)
    {
        AttendeeEntity? attendee = await _attendeesTable.GetEntityAsync<AttendeeEntity>(teamId, attendeeId);
        if (attendee == null)
        {
            return null;
        }

        attendee.PhotoConsent = ConsentStateResolver.GetResolvedState(attendee.PhotoConsent, givesPhotoConsent);
        attendee.LastCheckInDate = DateTimeOffset.UtcNow;

        await UpsertAttendeeAsync(attendee);

        var receipt = new SignInReceipt
        {
            PartitionKey = attendee.Id,
            AttendeeId = attendee.Id,
            PhotoConsent = givesPhotoConsent,
            SignInTime = DateTimeOffset.Now,
            RowKey = UniqueId.Next()
        };
        await _signInsTable.UpsertEntityAsync(receipt);

        return attendee;
    }
}