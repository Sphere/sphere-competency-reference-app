import { Injectable } from '@angular/core';
import { SqliteService } from './sqlite.service';

@Injectable({
  providedIn: 'root'
})
export class OfflineCourseOptimisticService {

  constructor(private sqliteService: SqliteService){
  }

  public async insertCourseProgress( 
    courseId: string,
    contentId: string,
    userId: string,
    completionPercentage: number,
    batchId: string,
    mimeType: string,
    lastReadContentId: string,
    status: number): Promise<void> {
    try {
      console.log(`Course Progress  for  Course: ${courseId} for User: ${userId}`);
      await this.sqliteService.insertData(courseId,contentId,userId,
        completionPercentage,batchId,mimeType,lastReadContentId,status);
    } catch (error) {
      console.error('Error inserting course progress data:', error);
    }
  }
  public async enrollUser(
    courseId: string,
    contentId: string,
    userId: string,
    batchId: string,
    mimeType: string,
    completionPercentage: number,
    lastReadContentId: string,
    status: number,
    batchDetails: any
  ): Promise<void> {
    console.log(`Enroll User to Course: ${courseId} for User: ${userId}`);
    try {
      await this.sqliteService.insertUserEnrollCourseData(courseId, contentId, userId, batchId, mimeType, completionPercentage, lastReadContentId, status, batchDetails);
    } catch (error) {
      console.error('Error inserting user enrollment data:', error);
    }
  }
  public async getUserEnrollCourse(courseId: string, userId: string): Promise<{ result: { courses: any[] }}> {
    try {
      const enrollCourses = await this.sqliteService.getUserEnrollCourse(courseId, userId);
      console.log('Enrolled Courses:', enrollCourses);
      return enrollCourses
    } catch (error) {
      console.error('Error fetching user enrollment data:', error);
    }
  }
  public async isContentIdExistsWithPercentage(courseId: string, userId: string, contentId: string) {
    try {
      const result = await this.sqliteService.isContentIdExistsWithPercentage(courseId, userId, contentId);
      console.log('Content Id Exists with Percentage:', result);
      return result
    } catch (error) {
      console.error('Error checking content id existence with percentage:', error);
    }
  }

  public async courseProgressRead(courseId: string) {
    try {
      const result = await this.sqliteService.mockProgressAPIFormatedList(courseId);
      console.log('Offline Course Progress API Formatted List:', result);
      return result
    } catch (error) {
      console.error('Error mocking progress API formatted list:', error);
    }
  }

  public async fetchUserEnrolledCourse(courseId: string) {
    try {
      const result :any = await this.sqliteService.mockUserEnrollmentList(courseId);
      console.log('Offline User Enrolled  API Formatted List:', result);
      return result
    } catch (error) {
      console.error('Error mocking  User Enrolled API formatted list:', error);
    }
  }

  public async updateLastReadContentId(courseId: string, contentId: string, mockResponse?: any): Promise<void> {
    try {
      await this.sqliteService.updateLastReadContentId(courseId, contentId, mockResponse);
      console.log('Last Read Content Id Updated Successfully.', contentId);
    } catch (error) {
      console.error('Error updating last read content id:', error);
    }
  }

}
