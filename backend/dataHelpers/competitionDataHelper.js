const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB, DB_FILES } = require('../config/database');

class CompetitionDataHelper {
  getAllCompetitions() {
    return readDB(DB_FILES.COMPETITIONS);
  }

  getCompetitionById(competitionId) {
    const competitions = this.getAllCompetitions();
    return competitions.find(comp => comp.competitionId === competitionId);
  }

  getCompetitionBySlug(slug) {
    const competitions = this.getAllCompetitions();
    return competitions.find(comp => comp.slug === slug);
  }

  createCompetition(competitionData) {
    const competitions = this.getAllCompetitions();
    const newCompetition = {
      competitionId: uuidv4(),
      ...competitionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    competitions.push(newCompetition);
    writeDB(DB_FILES.COMPETITIONS, competitions);
    return newCompetition;
  }

  updateCompetition(competitionId, updateData) {
    const competitions = this.getAllCompetitions();
    const index = competitions.findIndex(comp => comp.competitionId === competitionId);
    
    if (index === -1) return null;
    
    competitions[index] = {
      ...competitions[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    writeDB(DB_FILES.COMPETITIONS, competitions);
    return competitions[index];
  }

  deleteCompetition(competitionId) {
    const competitions = this.getAllCompetitions();
    const filteredCompetitions = competitions.filter(comp => comp.competitionId !== competitionId);
    
    if (competitions.length === filteredCompetitions.length) return false;
    
    writeDB(DB_FILES.COMPETITIONS, filteredCompetitions);
    return true;
  }

  getCompetitionsByStatus(status) {
    const competitions = this.getAllCompetitions();
    return competitions.filter(comp => comp.status === status);
  }

  getUpcomingCompetitions() {
    const competitions = this.getAllCompetitions();
    const now = new Date();
    return competitions.filter(comp => 
      comp.status === 'published' && new Date(comp.startDate) > now
    ).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }

  getPublishedCompetitions() {
    return this.getCompetitionsByStatus('published');
  }
}

module.exports = new CompetitionDataHelper();

