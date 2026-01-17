import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { FileUpload, CreateFileData } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class FileDataHelper {
  private dataPath: string;

  constructor(dataPath?: string) {
    this.dataPath = dataPath || join(__dirname, '../../../data', 'files.json');
  }

  private readData(): FileUpload[] {
    try {
      const data = readFileSync(this.dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading files data:', error);
      return [];
    }
  }

  private writeData(files: FileUpload[]): void {
    try {
      writeFileSync(this.dataPath, JSON.stringify(files, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing files data:', error);
      throw error;
    }
  }

  async getAllFiles(): Promise<FileUpload[]> {
    return this.readData();
  }

  async getPublicFiles(): Promise<FileUpload[]> {
    const files = this.readData();
    return files.filter(file => file.isPublic);
  }

  async getFileById(fileId: string): Promise<FileUpload | null> {
    const files = this.readData();
    return files.find(file => file.fileId === fileId) || null;
  }

  async getFilesByCompetition(competitionId: string): Promise<FileUpload[]> {
    const files = this.readData();
    return files.filter(file => file.competitionId === competitionId);
  }

  async getFilesBySubEvent(subEventId: string): Promise<FileUpload[]> {
    const files = this.readData();
    return files.filter(file => file.subEventId === subEventId);
  }

  async getFilesByCategory(category: string): Promise<FileUpload[]> {
    const files = this.readData();
    return files.filter(file => file.category === category);
  }

  async createFile(data: CreateFileData, uploadedBy: string): Promise<FileUpload> {
    const files = this.readData();
    const now = new Date().toISOString();

    const newFile: FileUpload = {
      fileId: uuidv4(),
      fileName: data.filePath.split('/').pop() || '',
      originalName: data.originalName,
      filePath: data.filePath,
      fileType: data.fileType,
      fileSize: data.fileSize,
      category: data.category,
      competitionId: data.competitionId,
      subEventId: data.subEventId,
      description: data.description,
      isPublic: data.isPublic !== undefined ? data.isPublic : false,
      downloadCount: 0,
      uploadedBy,
      uploadedAt: now,
    };

    files.push(newFile);
    this.writeData(files);
    return newFile;
  }

  async updateFile(fileId: string, data: Partial<FileUpload>): Promise<FileUpload | null> {
    const files = this.readData();
    const index = files.findIndex(file => file.fileId === fileId);

    if (index === -1) {
      return null;
    }

    const updatedFile: FileUpload = {
      ...files[index],
      ...data,
      fileId: files[index].fileId, // Don't allow changing ID
      uploadedBy: files[index].uploadedBy, // Don't allow changing uploader
      uploadedAt: files[index].uploadedAt, // Don't allow changing upload date
    };

    files[index] = updatedFile;
    this.writeData(files);
    return updatedFile;
  }

  async incrementDownloadCount(fileId: string): Promise<boolean> {
    const files = this.readData();
    const index = files.findIndex(file => file.fileId === fileId);

    if (index === -1) {
      return false;
    }

    files[index].downloadCount += 1;
    this.writeData(files);
    return true;
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const files = this.readData();
    const filteredFiles = files.filter(file => file.fileId !== fileId);

    if (filteredFiles.length === files.length) {
      return false;
    }

    this.writeData(filteredFiles);
    return true;
  }

  async searchFiles(query: string): Promise<FileUpload[]> {
    const files = this.readData();
    const lowerQuery = query.toLowerCase();

    return files.filter(file =>
      file.originalName.toLowerCase().includes(lowerQuery) ||
      file.description?.toLowerCase().includes(lowerQuery)
    );
  }
}
