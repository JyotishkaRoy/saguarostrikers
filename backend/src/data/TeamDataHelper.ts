import { BaseDataHelper } from './BaseDataHelper.js';
import { Team, TeamMember } from '../models/types.js';

export class TeamDataHelper extends BaseDataHelper<Team> {
  constructor() {
    super('teams.json');
  }

  public getTeamById(teamId: string): Team | null {
    return this.getById(teamId, 'teamId');
  }

  public createTeam(teamData: Team): Team {
    return this.add(teamData);
  }

  public updateTeam(teamId: string, updates: Partial<Team>): Team | null {
    return this.updateById(teamId, 'teamId', updates);
  }

  public deleteTeam(teamId: string): boolean {
    return this.deleteById(teamId, 'teamId');
  }

  public getTeamsByMission(missionId: string): Team[] {
    return this.findWhere(team => team.missionId === missionId);
  }

  public deleteTeamsByMission(missionId: string): number {
    this.loadData();
    const initialLength = this.data.length;
    this.data = this.data.filter(team => team.missionId !== missionId);
    
    if (this.data.length < initialLength) {
      this.saveData();
    }
    
    return initialLength - this.data.length;
  }
}

export class TeamMemberDataHelper extends BaseDataHelper<TeamMember> {
  constructor() {
    super('teamMembers.json');
  }

  public getMemberById(memberId: string): TeamMember | null {
    return this.getById(memberId, 'memberId');
  }

  public addMember(memberData: TeamMember): TeamMember {
    return this.add(memberData);
  }

  public removeMember(memberId: string): boolean {
    return this.deleteById(memberId, 'memberId');
  }

  public getMembersByTeam(teamId: string): TeamMember[] {
    return this.findWhere(member => member.teamId === teamId);
  }

  public getMembersByUser(userId: string): TeamMember[] {
    return this.findWhere(member => member.userId === userId);
  }

  public isUserInTeam(userId: string, teamId: string): boolean {
    this.loadData();
    return this.data.some(
      member => member.userId === userId && member.teamId === teamId
    );
  }

  public removeMembersByTeam(teamId: string): number {
    this.loadData();
    const initialLength = this.data.length;
    this.data = this.data.filter(member => member.teamId !== teamId);
    
    if (this.data.length < initialLength) {
      this.saveData();
    }
    
    return initialLength - this.data.length;
  }
}
