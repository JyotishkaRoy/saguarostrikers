import { JoinMissionDataHelper } from '../data/JoinMissionDataHelper.js';
import { EmailService } from './EmailService.js';
import { MissionDataHelper } from '../data/MissionDataHelper.js';
import { UserService } from './UserService.js';
import { PDFGenerator } from '../utils/pdfGenerator.js';
import { SiteContentService } from './SiteContentService.js';
import {
  JoinMissionApplication,
  CreateJoinMissionData,
  UpdateApplicationStatusData,
  UpdateJoinMissionApplicationData,
  ApplicationStatus,
} from '../models/types';

export class JoinMissionService {
  private dataHelper: JoinMissionDataHelper;
  private emailService: EmailService;
  private missionDataHelper: MissionDataHelper;
  private userService: UserService;
  private siteContentService: SiteContentService;

  constructor(
    dataHelper?: JoinMissionDataHelper,
    emailService?: EmailService,
    missionDataHelper?: MissionDataHelper,
    userService?: UserService
  ) {
    this.dataHelper = dataHelper || new JoinMissionDataHelper();
    this.emailService = emailService || new EmailService();
    this.missionDataHelper = missionDataHelper || new MissionDataHelper();
    this.userService = userService || new UserService();
    this.siteContentService = new SiteContentService();
  }

  async submitApplication(data: CreateJoinMissionData): Promise<JoinMissionApplication> {
    // Validate required fields
    this.validateApplicationData(data);

    // Verify mission exists
    const mission = await this.missionDataHelper.getMissionById(data.missionId);
    if (!mission) {
      throw new Error('Selected mission not found');
    }

    // Check if student already applied to THIS specific mission
    const missionApplications = await this.dataHelper.getApplicationsByMission(data.missionId);
    const existingApplicationForMission = missionApplications.find(
      app => app.studentEmail.toLowerCase() === data.studentEmail.toLowerCase()
    );
    
    if (existingApplicationForMission) {
      throw new Error('This student has already applied to this mission');
    }

    // Check mission status (allow published and in-progress for direct assignments)
    if (data.isDirectAssignment) {
      if (mission.status !== 'published' && mission.status !== 'in-progress') {
        throw new Error('Scientists can only be added to Published or In Progress missions');
      }
    } else {
      if (mission.status !== 'published') {
        throw new Error('This mission is not currently accepting applications');
      }
    }

    // Create application
    const application = await this.dataHelper.createApplication(data);

    // Generate and save PDF
    let applicationPdfPath: string | undefined;
    try {
      const agreements = await this.siteContentService.getJoinMissionAgreements();
      applicationPdfPath = await PDFGenerator.generateApplicationPDF(application, mission.title, agreements);
      console.log(`✅ PDF generated for application ${application.applicationId}`);
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      // Don't fail the application if PDF generation fails
    }

    // Send confirmation emails
    try {
      // Send to student
      await this.emailService.sendJoinMissionStudentConfirmation(
        data.studentEmail,
        data.studentFirstName,
        data.parentEmail,
        mission.title,
        applicationPdfPath
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

  async getApprovedApplicationsByStudentEmail(email: string): Promise<JoinMissionApplication[]> {
    return await this.dataHelper.getApprovedApplicationsByStudentEmail(email);
  }

  async updateApplicationStatus(
    applicationId: string,
    data: UpdateApplicationStatusData,
    reviewedBy: string
  ): Promise<JoinMissionApplication> {
    console.log(`📝 Updating application status for ${applicationId}`);
    console.log(`   New status: ${data.status}`);
    console.log(`   Reviewed by: ${reviewedBy}`);
    
    const application = await this.dataHelper.getApplicationById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    console.log(`   Current status: ${application.status}`);
    console.log(`   Student email: ${application.studentEmail}`);

    const updatedApplication = await this.dataHelper.updateApplicationStatus(
      applicationId,
      data,
      reviewedBy
    );

    if (!updatedApplication) {
      throw new Error('Failed to update application status');
    }

    console.log(`   ✅ Status updated in data helper`);
    console.log(`   Updated status: ${updatedApplication.status}`);

    // Create user account when application is approved
    if (data.status === 'approved') {
      console.log(`🔐 Application approved, checking user account...`);
      try {
        // Check if user already exists
        const existingUser = await this.userService.getUserByEmail(application.studentEmail);
        
        if (!existingUser) {
          console.log(`   📝 Creating new user account...`);
          // Create new user account with default password
          await this.userService.createUser({
            email: application.studentEmail,
            password: 'Saguaro@123', // Default password
            firstName: application.studentFirstName,
            lastName: application.studentLastName,
            phone: application.studentPhone || '',
            role: 'user',
            status: 'active',
          });
          console.log(`   ✅ User account created for ${application.studentEmail}`);
        } else {
          console.log(`   ℹ️  User account already exists for ${application.studentEmail}`);
        }
      } catch (userError) {
        console.error('   ❌ Error creating user account:', userError);
        // Don't fail the approval if user creation fails
      }
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

  async updateApplication(
    applicationId: string,
    data: UpdateJoinMissionApplicationData
  ): Promise<JoinMissionApplication> {
    const application = await this.dataHelper.getApplicationById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const updatedApplication = await this.dataHelper.updateApplication(applicationId, data);
    if (!updatedApplication) {
      throw new Error('Failed to update application');
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
    // ALWAYS required: Student basic info
    if (!data.studentFirstName || data.studentFirstName.trim().length === 0) {
      throw new Error('Student first name is required');
    }

    if (!data.studentLastName || data.studentLastName.trim().length === 0) {
      throw new Error('Student last name is required');
    }

    if (!data.studentEmail || !this.isValidEmail(data.studentEmail)) {
      throw new Error('Valid student email is required');
    }

    // ALWAYS required: Mission selection
    if (!data.missionId || data.missionId.trim().length === 0) {
      throw new Error('Mission selection is required');
    }

    // ALWAYS required: Agreements
    if (!data.agreementFinancial) {
      throw new Error('Financial responsibility agreement must be accepted');
    }

    if (!data.agreementPhotograph) {
      throw new Error('Photograph usage agreement must be accepted');
    }

    if (!data.agreementLiability) {
      throw new Error('Liability waiver must be accepted');
    }

    // Skip detailed validation for admin direct assignments
    if (data.isDirectAssignment) {
      console.log('⏭️  Skipping detailed validation for direct assignment');
      return;
    }

    // FULL VALIDATION for public applications
    console.log('✅ Running full validation for public application');

    // Student detailed validation
    if (!data.studentDob) {
      throw new Error('Student date of birth is required');
    }

    // Validate age (must be at least 10 years old)
    const dob = new Date(data.studentDob);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 10) {
      throw new Error('Participant must be at least 10 years old');
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

    // Fit reason validation
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
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
