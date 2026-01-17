import { BaseDataHelper } from './BaseDataHelper.js';
import { BoardMember } from '../models/types.js';

export class BoardMemberDataHelper extends BaseDataHelper<BoardMember> {
  constructor() {
    super('boardMembers.json');
  }

  public getBoardMemberById(boardMemberId: string): BoardMember | null {
    return this.getById(boardMemberId, 'boardMemberId');
  }

  public createBoardMember(memberData: BoardMember): BoardMember {
    return this.add(memberData);
  }

  public updateBoardMember(
    boardMemberId: string,
    updates: Partial<BoardMember>
  ): BoardMember | null {
    return this.updateById(boardMemberId, 'boardMemberId', updates);
  }

  public deleteBoardMember(boardMemberId: string): boolean {
    return this.deleteById(boardMemberId, 'boardMemberId');
  }

  public getActiveBoardMembers(): BoardMember[] {
    return this.findWhere(member => member.status === 'active').sort(
      (a, b) => a.order - b.order
    );
  }

  public getBoardMembersByStatus(status: 'active' | 'inactive'): BoardMember[] {
    return this.findWhere(member => member.status === status);
  }

  public reorderBoardMembers(orderedIds: string[]): void {
    this.loadData();
    
    orderedIds.forEach((id, index) => {
      const member = this.data.find(m => m.boardMemberId === id);
      if (member) {
        member.order = index;
      }
    });
    
    this.saveData();
  }
}
