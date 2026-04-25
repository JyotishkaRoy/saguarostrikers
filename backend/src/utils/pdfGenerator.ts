import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { JoinMissionApplication, JoinMissionAgreements, CreateJoinMissionData } from '../models/types.js';

export class PDFGenerator {
  /**
   * Generate PDF for join mission application
   */
  static async generateApplicationPDF(
    application: JoinMissionApplication,
    missionTitle: string,
    agreements: JoinMissionAgreements
  ): Promise<string> {
    // Ensure applications directory exists
    // Use same pattern as upload middleware
    const uploadsBase = process.env.UPLOAD_PATH || path.join(process.cwd(), '..', 'uploads');
    const applicationsDir = path.join(uploadsBase, 'applications');
    
    if (!fs.existsSync(applicationsDir)) {
      fs.mkdirSync(applicationsDir, { recursive: true });
    }

    const fileName = `${application.applicationId}.pdf`;
    const filePath = path.join(applicationsDir, fileName);

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('Saguaro Strikers - Mission Application', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(`Application ID: ${application.applicationId}`, { align: 'center' });
    doc.fontSize(10).text(`Submitted: ${new Date(application.createdAt).toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);

    // Student Details Section
    doc.fontSize(16).font('Helvetica-Bold').text('STUDENT DETAILS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');

    this.addField(doc, 'First Name', application.studentFirstName);
    if (application.studentMiddleName) {
      this.addField(doc, 'Middle Name', application.studentMiddleName);
    }
    this.addField(doc, 'Last Name', application.studentLastName);
    this.addField(doc, 'Date of Birth', new Date(application.studentDob).toLocaleDateString());
    this.addSingleLineField(doc, 'School Name', application.schoolName, 48);
    this.addField(doc, 'Grade', application.grade);
    this.addSingleLineField(doc, 'Email', application.studentEmail, 42);
    if (application.studentPhone) {
      this.addField(doc, 'Phone', application.studentPhone);
    }
    if (application.studentSlack) {
      this.addSingleLineField(doc, 'Slack ID', application.studentSlack, 42);
    }

    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').text('Student Address:', { continued: false });
    doc.fontSize(11).font('Helvetica');
    doc.text(application.studentAddressLine1);
    if (application.studentAddressLine2) {
      doc.text(application.studentAddressLine2);
    }
    doc.text(`${application.studentCity}, ${application.studentState} ${application.studentZip}`);
    doc.moveDown(1);

    // Mission Selection
    doc.fontSize(16).font('Helvetica-Bold').text('MISSION SELECTION', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    this.addSingleLineField(doc, 'Mission', missionTitle);
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').text('Why are you fit for this mission?', { continued: false });
    doc.fontSize(11).font('Helvetica');
    doc.text(application.fitReason, { align: 'justify' });
    doc.moveDown(1);

    // Parent Details Section
    doc.fontSize(16).font('Helvetica-Bold').text('PARENT/GUARDIAN DETAILS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');

    this.addField(doc, 'First Name', application.parentFirstName);
    if (application.parentMiddleName) {
      this.addField(doc, 'Middle Name', application.parentMiddleName);
    }
    this.addField(doc, 'Last Name', application.parentLastName);
    this.addSingleLineField(doc, 'Email', application.parentEmail, 42);
    this.addField(doc, 'Phone', application.parentPhone);
    if (application.parentAlternateEmail) {
      this.addSingleLineField(doc, 'Alternate Email', application.parentAlternateEmail, 42);
    }

    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').text('Parent Address:', { continued: false });
    doc.fontSize(11).font('Helvetica');
    doc.text(application.parentAddressLine1);
    if (application.parentAddressLine2) {
      doc.text(application.parentAddressLine2);
    }
    doc.text(`${application.parentCity}, ${application.parentState} ${application.parentZip}`);
    doc.moveDown(1);

    // Agreements Section
    doc.fontSize(16).font('Helvetica-Bold').text('AGREEMENTS & CONSENT', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    
    this.addAgreementSection(
      doc,
      'Financial Obligations Agreement',
      agreements.agreementFinancial,
      application.agreementFinancial
    );
    doc.moveDown(0.5);
    this.addAgreementSection(
      doc,
      'Photograph & Video Consent',
      agreements.agreementPhotograph,
      application.agreementPhotograph
    );
    doc.moveDown(0.5);
    this.addAgreementSection(
      doc,
      'Liability Release',
      agreements.agreementLiability,
      application.agreementLiability
    );
    doc.moveDown(1);

    // Signatures Section
    doc.fontSize(16).font('Helvetica-Bold').text('ELECTRONIC SIGNATURES', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    
    this.addField(doc, 'Student Signature', application.studentSignature);
    doc.text(`Date: ${new Date(application.studentSignatureDate).toLocaleDateString()}`);
    doc.moveDown(0.5);
    
    this.addField(doc, 'Parent/Guardian Signature', application.parentSignature);
    doc.text(`Date: ${new Date(application.parentSignatureDate).toLocaleDateString()}`);
    doc.moveDown(1);

    // Footer
    doc.fontSize(9).fillColor('#666666').font('Helvetica').text(
      'This is an electronically submitted application. By signing above, both student and parent/guardian acknowledge that they have read and agree to all terms and conditions.',
      { align: 'center' }
    );
    doc.fillColor('black'); // Reset color

    // Finalize PDF
    doc.end();

    // Wait for the stream to finish writing
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve(filePath);
      });
      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  private static addField(doc: InstanceType<typeof PDFDocument>, label: string, value: string): void {
    doc.font('Helvetica-Bold').text(`${label}:`, { continued: true, width: 150 });
    doc.font('Helvetica').text(value || 'N/A', { width: 350 });
  }

  private static addSingleLineField(
    doc: InstanceType<typeof PDFDocument>,
    label: string,
    value: string,
    maxChars = 95
  ): void {
    const textValue = (value || 'N/A').replace(/\s+/g, ' ').trim();
    const safeValue = textValue.length > maxChars ? `${textValue.slice(0, maxChars - 3)}...` : textValue;
    doc.font('Helvetica-Bold').text(`${label}:`, { continued: true });
    doc.font('Helvetica').text(` ${safeValue}`);
  }

  private static addAgreementSection(
    doc: InstanceType<typeof PDFDocument>,
    title: string,
    content: string,
    accepted: boolean
  ): void {
    doc.fontSize(12).font('Helvetica-Bold').text(`${title}:`);
    doc.fontSize(11).font('Helvetica').text(content || 'N/A', { align: 'justify' });
    doc.moveDown(0.2);
    doc.font('Helvetica-Bold').text(`Status: ${accepted ? 'Accepted' : 'Not Accepted'}`);
    doc.font('Helvetica');
  }

  static async generateOutreachApplicationPDF(
    applicationId: string,
    outreachEventTitle: string,
    data: CreateJoinMissionData,
    agreements: JoinMissionAgreements,
    submittedAtIso: string
  ): Promise<string> {
    const uploadsBase = process.env.UPLOAD_PATH || path.join(process.cwd(), '..', 'uploads');
    const applicationsDir = path.join(uploadsBase, 'applications');

    if (!fs.existsSync(applicationsDir)) {
      fs.mkdirSync(applicationsDir, { recursive: true });
    }

    const fileName = `outreach-${applicationId}.pdf`;
    const filePath = path.join(applicationsDir, fileName);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).font('Helvetica-Bold').text('Saguaro Strikers - Outreach Event Application', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(`Application ID: ${applicationId}`, { align: 'center' });
    doc.fontSize(10).text(`Submitted: ${new Date(submittedAtIso).toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(16).font('Helvetica-Bold').text('STUDENT DETAILS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    this.addField(doc, 'First Name', data.studentFirstName);
    if (data.studentMiddleName) this.addField(doc, 'Middle Name', data.studentMiddleName);
    this.addField(doc, 'Last Name', data.studentLastName);
    this.addField(doc, 'Date of Birth', new Date(data.studentDob).toLocaleDateString());
    this.addSingleLineField(doc, 'School Name', data.schoolName, 48);
    this.addField(doc, 'Grade', data.grade);
    this.addSingleLineField(doc, 'Email', data.studentEmail, 42);
    if (data.studentPhone) this.addField(doc, 'Phone', data.studentPhone);
    if (data.studentSlack) this.addSingleLineField(doc, 'Slack ID', data.studentSlack, 42);
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').text('Student Address:', { continued: false });
    doc.fontSize(11).font('Helvetica');
    doc.text(data.studentAddressLine1);
    if (data.studentAddressLine2) doc.text(data.studentAddressLine2);
    doc.text(`${data.studentCity}, ${data.studentState} ${data.studentZip}`);
    doc.moveDown(1);

    doc.fontSize(16).font('Helvetica-Bold').text('OUTREACH EVENT SELECTION', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    this.addSingleLineField(doc, 'Outreach Event', outreachEventTitle);
    this.addSingleLineField(doc, 'Mapped Mission ID', data.missionId || 'N/A', 42);
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').text('Why are you fit for this event?', { continued: false });
    doc.fontSize(11).font('Helvetica');
    doc.text(data.fitReason, { align: 'justify' });
    doc.moveDown(1);

    doc.fontSize(16).font('Helvetica-Bold').text('PARENT/GUARDIAN DETAILS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    this.addField(doc, 'First Name', data.parentFirstName);
    if (data.parentMiddleName) this.addField(doc, 'Middle Name', data.parentMiddleName);
    this.addField(doc, 'Last Name', data.parentLastName);
    this.addSingleLineField(doc, 'Email', data.parentEmail, 42);
    this.addField(doc, 'Phone', data.parentPhone);
    if (data.parentAlternateEmail) this.addSingleLineField(doc, 'Alternate Email', data.parentAlternateEmail, 42);
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').text('Parent Address:', { continued: false });
    doc.fontSize(11).font('Helvetica');
    doc.text(data.parentAddressLine1);
    if (data.parentAddressLine2) doc.text(data.parentAddressLine2);
    doc.text(`${data.parentCity}, ${data.parentState} ${data.parentZip}`);
    doc.moveDown(1);

    doc.fontSize(16).font('Helvetica-Bold').text('AGREEMENTS & CONSENT', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    this.addAgreementSection(doc, 'Financial Obligations Agreement', agreements.agreementFinancial, data.agreementFinancial);
    doc.moveDown(0.5);
    this.addAgreementSection(doc, 'Photograph & Video Consent', agreements.agreementPhotograph, data.agreementPhotograph);
    doc.moveDown(0.5);
    this.addAgreementSection(doc, 'Liability Release', agreements.agreementLiability, data.agreementLiability);
    doc.moveDown(1);

    doc.fontSize(16).font('Helvetica-Bold').text('ELECTRONIC SIGNATURES', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    this.addField(doc, 'Student Signature', data.studentSignature);
    doc.text(`Date: ${new Date(data.studentSignatureDate).toLocaleDateString()}`);
    doc.moveDown(0.5);
    this.addField(doc, 'Parent/Guardian Signature', data.parentSignature);
    doc.text(`Date: ${new Date(data.parentSignatureDate).toLocaleDateString()}`);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }
}
