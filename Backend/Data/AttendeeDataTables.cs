using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Azure.Data.Tables;
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

    public async Task<List<TeamEntity>> GetTeamAsync(string id)
    {
        return await _teamsTable.QueryAsync<TeamEntity>(at => at.RowKey == id)
            .ToListAsync();
    }

    public async Task UpsertTeamAsync(TeamEntity team)
    {
        team.PartitionKey = "team";
        await _teamsTable.UpsertEntityAsync(team);
    }

    public async Task UpsetAttendeeAsync(AttendeeEntity attendee)
    {
        attendee.PartitionKey = attendee.TeamId ?? "";
        await _attendeesTable.UpsertEntityAsync(attendee);
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
        DateTimeOffset thisMorning = DateTimeOffset.Now.Date.ToUniversalTime();
        return await _attendeesTable.QueryAsync<AttendeeEntity>()
            .CountAsync();
    }

    public async Task<int> CountSignedInAttendeesAsync()
    {
        DateTimeOffset thisMorning = DateTimeOffset.Now.Date.ToUniversalTime();
        return await _attendeesTable.QueryAsync<AttendeeEntity>(at => at.LastCheckInDate >= thisMorning)
            .CountAsync();
    }

    public async Task<int> CountSignedInRemoteAttendeesAsync()
    {
        DateTimeOffset thisMorning = DateTimeOffset.Now.Date.ToUniversalTime();
        return await _attendeesTable
            .QueryAsync<AttendeeEntity>(at => at.LastCheckInDate >= thisMorning && at.PhotoConsent == "remote")
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

    public async Task<AttendeeEntity?> SignInAttendeeAsync(string teamId, string attendeeId, string? givesPhotoConsent)
    {
        AttendeeEntity? attendee = await _attendeesTable.GetEntityAsync<AttendeeEntity>(teamId, attendeeId);
        if (attendee == null)
        {
            return null;
        }

        attendee.PhotoConsent = ConsentStateResolver.GetResolvedState(attendee.PhotoConsent, givesPhotoConsent);
        attendee.LastCheckInDate = DateTimeOffset.UtcNow;

        await UpsetAttendeeAsync(attendee);

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