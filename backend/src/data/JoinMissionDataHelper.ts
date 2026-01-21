import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { JoinMissionApplication, CreateJoinMissionData, UpdateApplicationStatusData, ApplicationStatus } from '../models/types';
import { generateId } from '../utils/idGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class JoinMissionDataHelper {
  private dataPath: string;

  constructor(dataPath?: string) {
    this.dataPath = dataPath || join(__dirname, '../../../data', 'joinMissionApplications.json');
  }

  private readData(): JoinMissionApplication[] {
    try {
      const data = readFileSync(this.dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading join mission applications data:', error);
      return [];
    }
  }

  private writeData(applications: JoinMissionApplication[]): void {
    try {
      writeFileSync(this.dataPath, JSON.stringify(applications, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing join mission applications data:', error);
      throw error;
    }
  }

  async getAllApplications(): Promise<JoinMissionApplication[]> {
    return this.readData();
  }

  async getApplicationById(applicationId: string): Promise<JoinMissionApplication | null> {
    const applications = this.readData();
    return applications.find(app => app.applicationId === applicationId) || null;
  }

  async getApplicationsByMission(missionId: string): Promise<JoinMissionApplication[]> {
    const applications = this.readData();
    return applications.filter(app => app.missionId === missionId);
  }

  async getApplicationsByStatus(status: ApplicationStatus): Promise<JoinMissionApplication[]> {
    const applications = this.readData();
    return applications.filter(app => app.status === status);
  }

  async getApplicationByStudentEmail(email: string): Promise<JoinMissionApplication | null> {
    const applications = this.readData();
    return applications.find(app => app.studentEmail.toLowerCase() === email.toLowerCase()) || null;
  }

  async createApplication(data: CreateJoinMissionData): Promise<JoinMissionApplication> {
    const applications = this.readData();
    const now = new Date().toISOString();

    const newApplication: JoinMissionApplication = {
      applicationId: generateId(),
      ...data,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    applications.push(newApplication);
    this.writeData(applications);
    return newApplication;
  }

  async updateApplicationStatus(
    applicationId: string,
    data: UpdateApplicationStatusData,
    reviewedBy: string
  ): Promise<JoinMissionApplication | null> {
    const applications = this.readData();
    const index = applications.findIndex(app => app.applicationId === applicationId);

    if (index === -1) {
      return null;
    }

    const now = new Date().toISOString();
    const updatedApplication: JoinMissionApplication = {
      ...applications[index],
      status: data.status,
      reviewNotes: data.reviewNotes,
      reviewedBy,
      reviewedAt: now,
      updatedAt: now,
    };

    applications[index] = updatedApplication;
    this.writeData(applications);
    return updatedApplication;
  }

  async deleteApplication(applicationId: string): Promise<boolean> {
    const applications = this.readData();
    const filteredApplications = applications.filter(app => app.applicationId !== applicationId);

    if (filteredApplications.length === applications.length) {
      return false;
    }

    this.writeData(filteredApplications);
    return true;
  }

  async searchApplications(query: string): Promise<JoinMissionApplication[]> {
    const applications = this.readData();
    const lowerQuery = query.toLowerCase();

    return applications.filter(app =>
      app.studentFirstName.toLowerCase().includes(lowerQuery) ||
      app.studentLastName.toLowerCase().includes(lowerQuery) ||
      app.studentEmail.toLowerCase().includes(lowerQuery) ||
      app.parentEmail.toLowerCase().includes(lowerQuery) ||
      app.schoolName.toLowerCase().includes(lowerQuery)
    );
  }

  async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    waitlisted: number;
  }> {
    const applications = this.readData();

    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      underReview: applications.filter(app => app.status === 'under_review').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      waitlisted: applications.filter(app => app.status === 'waitlisted').length,
    };
  }
}
