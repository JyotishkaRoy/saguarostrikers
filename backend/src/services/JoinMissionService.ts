import { JoinMissionDataHelper } from '../data/JoinMissionDataHelper.js';
import { EmailService } from './EmailService.js';
import { MissionDataHelper } from '../data/MissionDataHelper.js';
import {
  JoinMissionApplication,
  CreateJoinMissionData,
  UpdateApplicationStatusData,
  ApplicationStatus,
} from '../models/types';

export class JoinMissionService {
  private dataHelper: JoinMissionDataHelper;
  private emailService: EmailService;
  private missionDataHelper: MissionDataHelper;

  constructor(
    dataHelper?: JoinMissionDataHelper,
    emailService?: EmailService,
    missionDataHelper?: MissionDataHelper
  ) {
    this.dataHelper = dataHelper || new JoinMissionDataHelper();
    this.emailService = emailService || new EmailService();
    this.missionDataHelper = missionDataHelper || new MissionDataHelper();
  }

  async submitApplication(data: CreateJoinMissionData): Promise<JoinMissionApplication> {
    // Validate required fields
    this.validateApplicationData(data);

    // Check if student already applied
    const existingApplication = await this.dataHelper.getApplicationByStudentEmail(data.studentEmail);
    if (existingApplication) {
      throw new Error('An application with this student email already exists');
    }

    // Verify mission exists
    const mission = await this.missionDataHelper.getMissionById(data.missionId);
    if (!mission) {
      throw new Error('Selected mission not found');
    }

    if (mission.status !== 'published') {
      throw new Error('This mission is not currently accepting applications');
    }

    // Create application
    const application = await this.dataHelper.createApplication(data);

    // Send confirmation emails
    try {
      // Send to student
      await this.emailService.sendJoinMissionStudentConfirmation(
        data.studentEmail,
        `${data.studentFirstName} ${data.studentLastName}`,
        mission.title
      );

      // Send to parent
      await this.emailService.sendJoinMissionParentConfirmation(
        data.parentEmail,
        `${data.studentFirstName} ${data.studentLastName}`,
        `${data.parentFirstName} ${data.parentLastName}`,
        mission.title
      );

      // Send to admin
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@saguarostrikers.org';
      await this.emailService.sendJoinMissionAdminNotification(adminEmail, {
        studentName: `${data.studentFirstName} ${data.studentLastName}`,
        parentName: `${data.parentFirstName} ${data.parentLastName}`,
        missionTitle: mission.title,
        grade: data.grade,
        school: data.schoolName,
        applicationId: application.applicationId,
      });
    } catch (emailError) {
      console.error('Error sending confirmation emails:', emailError);
      // Don't fail the application if emails fail
    }

    return application;
  }

  async getAllApplications(): Promise<JoinMissionApplication[]> {
    return await this.dataHelper.getAllApplications();
  }

  async getApplicationById(applicationId: string): Promise<JoinMissionApplication | null> {
    return await this.dataHelper.getApplicationById(applicationId);
  }

  async getApplicationsByMission(missionId: string): Promise<JoinMissionApplication[]> {
    return await this.dataHelper.getApplicationsByMission(missionId);
  }

  async getApplicationsByStatus(status: ApplicationStatus): Promise<JoinMissionApplication[]> {
    return await this.dataHelper.getApplicationsByStatus(status);
  }

  async updateApplicationStatus(
    applicationId: string,
    data: UpdateApplicationStatusData,
    reviewedBy: string
  ): Promise<JoinMissionApplication> {
    const application = await this.dataHelper.getApplicationById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const updatedApplication = await this.dataHelper.updateApplicationStatus(
      applicationId,
      data,
      reviewedBy
    );

    if (!updatedApplication) {
      throw new Error('Failed to update application status');
    }

    // Send status update email
    if (data.status === 'approved' || data.status === 'rejected' || data.status === 'waitlisted') {
      try {
        const mission = await this.missionDataHelper.getMissionById(application.missionId);
        if (mission) {
          await this.emailService.sendApplicationStatusUpdate(
            application.studentEmail,
            application.parentEmail,
            `${application.studentFirstName} ${application.studentLastName}`,
            mission.title,
            data.status,
            data.reviewNotes
          );
        }
      } catch (emailError) {
        console.error('Error sending status update email:', emailError);
      }
    }

    return updatedApplication;
  }

  async deleteApplication(applicationId: string): Promise<boolean> {
    const application = await this.dataHelper.getApplicationById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    return await this.dataHelper.deleteApplication(applicationId);
  }

  async searchApplications(query: string): Promise<JoinMissionApplication[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    return await this.dataHelper.searchApplications(query);
  }

  async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    waitlisted: number;
  }> {
    return await this.dataHelper.getApplicationStats();
  }

  private validateApplicationData(data: CreateJoinMissionData): void {
    // Student validation
    if (!data.studentFirstName || data.studentFirstName.trim().length === 0) {
      throw new Error('Student first name is required');
    }

    if (!data.studentLastName || data.studentLastName.trim().length === 0) {
      throw new Error('Student last name is required');
    }

    if (!data.studentEmail || !this.isValidEmail(data.studentEmail)) {
      throw new Error('Valid student email is required');
    }

    if (!data.studentDob) {
      throw new Error('Student date of birth is required');
    }

    // Validate age (must be reasonable for grades 6-12)
    const dob = new Date(data.studentDob);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 10 || age > 20) {
      throw new Error('Student age must be between 10 and 20 years');
    }

    if (!data.schoolName || data.schoolName.trim().length === 0) {
      throw new Error('School name is required');
    }

    if (!data.grade) {
      throw new Error('Grade is required');
    }

    // Parent validation
    if (!data.parentFirstName || data.parentFirstName.trim().length === 0) {
      throw new Error('Parent first name is required');
    }

    if (!data.parentLastName || data.parentLastName.trim().length === 0) {
      throw new Error('Parent last name is required');
    }

    if (!data.parentEmail || !this.isValidEmail(data.parentEmail)) {
      throw new Error('Valid parent email is required');
    }

    if (!data.parentPhone || data.parentPhone.trim().length === 0) {
      throw new Error('Parent phone is required');
    }

    // Address validation
    if (!data.studentAddressLine1 || data.studentAddressLine1.trim().length === 0) {
      throw new Error('Student address is required');
    }

    if (!data.studentCity || data.studentCity.trim().length === 0) {
      throw new Error('Student city is required');
    }

    if (!data.studentState || data.studentState.trim().length === 0) {
      throw new Error('Student state is required');
    }

    if (!data.studentZip || data.studentZip.trim().length === 0) {
      throw new Error('Student zip code is required');
    }

    if (!data.parentAddressLine1 || data.parentAddressLine1.trim().length === 0) {
      throw new Error('Parent address is required');
    }

    if (!data.parentCity || data.parentCity.trim().length === 0) {
      throw new Error('Parent city is required');
    }

    if (!data.parentState || data.parentState.trim().length === 0) {
      throw new Error('Parent state is required');
    }

    if (!data.parentZip || data.parentZip.trim().length === 0) {
      throw new Error('Parent zip code is required');
    }

    // Mission validation
    if (!data.missionId || data.missionId.trim().length === 0) {
      throw new Error('Mission selection is required');
    }

    if (!data.fitReason || data.fitReason.trim().length < 50) {
      throw new Error('Please provide at least 50 characters explaining why you are fit for this mission');
    }

    // Signature validation
    if (!data.studentSignature || data.studentSignature.trim().length === 0) {
      throw new Error('Student signature is required');
    }

    if (!data.parentSignature || data.parentSignature.trim().length === 0) {
      throw new Error('Parent signature is required');
    }

    // Agreement validation
    if (!data.agreementFinancial) {
      throw new Error('Financial responsibility agreement must be accepted');
    }

    if (!data.agreementPhotograph) {
      throw new Error('Photograph usage agreement must be accepted');
    }

    if (!data.agreementLiability) {
      throw new Error('Liability waiver must be accepted');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
