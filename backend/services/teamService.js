const teamDataHelper = require('../dataHelpers/teamDataHelper');
const competitionDataHelper = require('../dataHelpers/competitionDataHelper');
const userDataHelper = require('../dataHelpers/userDataHelper');
const interestDataHelper = require('../dataHelpers/interestDataHelper');
const auditLogDataHelper = require('../dataHelpers/auditLogDataHelper');

class TeamService {
  createTeam(teamData, userId, requestInfo = {}) {
    const { competitionId, teamName, description } = teamData;

    // Verify competition exists
    const competition = competitionDataHelper.getCompetitionById(competitionId);
    if (!competition) {
      throw new Error('Competition not found');
    }

    // Create team
    const newTeam = teamDataHelper.createTeam({
      competitionId,
      teamName,
      description,
      createdBy: userId
    });

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'TEAM_CREATED',
      entity: 'team',
      entityId: newTeam.teamId,
      changes: { competitionId, teamName },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return newTeam;
  }

  updateTeam(teamId, updateData, userId, requestInfo = {}) {
    const team = teamDataHelper.getTeamById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    const updatedTeam = teamDataHelper.updateTeam(teamId, updateData);

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'TEAM_UPDATED',
      entity: 'team',
      entityId: teamId,
      changes: updateData,
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return updatedTeam;
  }

  deleteTeam(teamId, userId, requestInfo = {}) {
    const team = teamDataHelper.getTeamById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Remove all team members
    teamDataHelper.removeTeamMembersByTeam(teamId);

    // Delete team
    const success = teamDataHelper.deleteTeam(teamId);

    if (success) {
      // Log audit
      auditLogDataHelper.createLog({
        userId,
        action: 'TEAM_DELETED',
        entity: 'team',
        entityId: teamId,
        changes: { teamName: team.teamName },
        ipAddress: requestInfo.ipAddress || '',
        userAgent: requestInfo.userAgent || ''
      });
    }

    return success;
  }

  getTeamById(teamId) {
    const team = teamDataHelper.getTeamById(teamId);
    if (!team) return null;

    // Get team members with user details
    const members = teamDataHelper.getTeamMembersByTeam(teamId);
    const membersWithDetails = members.map(member => {
      const user = userDataHelper.getUserById(member.userId);
      return {
        memberId: member.memberId,
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        user: user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        } : null
      };
    });

    return {
      ...team,
      members: membersWithDetails
    };
  }

  getTeamsByCompetition(competitionId) {
    const teams = teamDataHelper.getTeamsByCompetition(competitionId);
    return teams.map(team => this.getTeamById(team.teamId));
  }

  addTeamMember(teamId, userIdToAdd, role, requestingUserId, requestInfo = {}) {
    const team = teamDataHelper.getTeamById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    const user = userDataHelper.getUserById(userIdToAdd);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is already in the team
    const existingMembers = teamDataHelper.getTeamMembersByTeam(teamId);
    const alreadyMember = existingMembers.find(m => m.userId === userIdToAdd);
    if (alreadyMember) {
      throw new Error('User is already a member of this team');
    }

    // Add team member
    const newMember = teamDataHelper.addTeamMember({
      teamId,
      userId: userIdToAdd,
      role: role || 'Member'
    });

    // Update interest status if exists
    const interest = interestDataHelper.getInterestByUserAndCompetition(userIdToAdd, team.competitionId);
    if (interest) {
      interestDataHelper.updateInterest(interest.interestId, { status: 'assigned' });
    }

    // Log audit
    auditLogDataHelper.createLog({
      userId: requestingUserId,
      action: 'TEAM_MEMBER_ADDED',
      entity: 'teamMember',
      entityId: newMember.memberId,
      changes: { teamId, userId: userIdToAdd, role },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return newMember;
  }

  removeTeamMember(memberId, requestingUserId, requestInfo = {}) {
    const members = teamDataHelper.getAllTeamMembers();
    const member = members.find(m => m.memberId === memberId);
    if (!member) {
      throw new Error('Team member not found');
    }

    const success = teamDataHelper.removeTeamMember(memberId);

    if (success) {
      // Log audit
      auditLogDataHelper.createLog({
        userId: requestingUserId,
        action: 'TEAM_MEMBER_REMOVED',
        entity: 'teamMember',
        entityId: memberId,
        changes: { teamId: member.teamId, userId: member.userId },
        ipAddress: requestInfo.ipAddress || '',
        userAgent: requestInfo.userAgent || ''
      });
    }

    return success;
  }

  updateTeamMemberRole(memberId, newRole, requestingUserId, requestInfo = {}) {
    const updatedMember = teamDataHelper.updateTeamMember(memberId, { role: newRole });
    
    if (updatedMember) {
      // Log audit
      auditLogDataHelper.createLog({
        userId: requestingUserId,
        action: 'TEAM_MEMBER_ROLE_UPDATED',
        entity: 'teamMember',
        entityId: memberId,
        changes: { role: newRole },
        ipAddress: requestInfo.ipAddress || '',
        userAgent: requestInfo.userAgent || ''
      });
    }

    return updatedMember;
  }

  getUserTeams(userId) {
    const memberships = teamDataHelper.getTeamMembersByUser(userId);
    return memberships.map(membership => {
      const team = teamDataHelper.getTeamById(membership.teamId);
      const competition = competitionDataHelper.getCompetitionById(team.competitionId);
      return {
        ...membership,
        team: {
          ...team,
          competition: competition ? {
            competitionId: competition.competitionId,
            title: competition.title,
            slug: competition.slug
          } : null
        }
      };
    });
  }
}

module.exports = new TeamService();

