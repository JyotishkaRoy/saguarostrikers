const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB, DB_FILES } = require('../config/database');

class InterestDataHelper {
  getAllInterests() {
    return readDB(DB_FILES.INTERESTS);
  }

  getInterestById(interestId) {
    const interests = this.getAllInterests();
    return interests.find(interest => interest.interestId === interestId);
  }

  getInterestsByUser(userId) {
    const interests = this.getAllInterests();
    return interests.filter(interest => interest.userId === userId);
  }

  getInterestsByCompetition(competitionId) {
    const interests = this.getAllInterests();
    return interests.filter(interest => interest.competitionId === competitionId);
  }

  getInterestByUserAndCompetition(userId, competitionId) {
    const interests = this.getAllInterests();
    return interests.find(interest => 
      interest.userId === userId && interest.competitionId === competitionId
    );
  }

  createInterest(interestData) {
    const interests = this.getAllInterests();
    const newInterest = {
      interestId: uuidv4(),
      ...interestData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    interests.push(newInterest);
    writeDB(DB_FILES.INTERESTS, interests);
    return newInterest;
  }

  updateInterest(interestId, updateData) {
    const interests = this.getAllInterests();
    const index = interests.findIndex(interest => interest.interestId === interestId);
    
    if (index === -1) return null;
    
    interests[index] = {
      ...interests[index],
      ...updateData
    };
    
    writeDB(DB_FILES.INTERESTS, interests);
    return interests[index];
  }

  deleteInterest(interestId) {
    const interests = this.getAllInterests();
    const filteredInterests = interests.filter(interest => interest.interestId !== interestId);
    
    if (interests.length === filteredInterests.length) return false;
    
    writeDB(DB_FILES.INTERESTS, filteredInterests);
    return true;
  }

  getPendingInterestsByCompetition(competitionId) {
    const interests = this.getAllInterests();
    return interests.filter(interest => 
      interest.competitionId === competitionId && interest.status === 'pending'
    );
  }
}

module.exports = new InterestDataHelper();

