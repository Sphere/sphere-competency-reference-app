import { Injectable } from '@angular/core';
import { OnlineSqliteService } from './online-sqlite.service';

@Injectable({
  providedIn: 'root'
})
export class CourseOptimisticUiService {

  constructor(private onlineSqliteService: OnlineSqliteService){
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
      await this.onlineSqliteService.insertData(courseId,contentId,userId,
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
      await this.onlineSqliteService.insertUserEnrollCourseData(courseId, contentId, userId, batchId, mimeType, completionPercentage, lastReadContentId, status, batchDetails);
    } catch (error) {
      console.error('Error inserting user enrollment data:', error);
    }
  }
  public async getUserEnrollCourse(courseId: string, userId: string): Promise<{ result: { courses: any[] }}> {
    try {
      const enrollCourses = await this.onlineSqliteService.getUserEnrollCourse(courseId, userId);
      console.log('Enrolled Courses:', enrollCourses);
      return enrollCourses
    } catch (error) {
      console.error('Error fetching user enrollment data:', error);
    }
  }
  public async isContentIdExistsWithPercentage(courseId: string, userId: string, contentId: string) {
    try {
      const result = await this.onlineSqliteService.isContentIdExistsWithPercentage(courseId, userId, contentId);
      console.log('Content Id Exists with Percentage:', result);
      return result
    } catch (error) {
      console.error('Error checking content id existence with percentage:', error);
    }
  }

  public async courseProgressRead(courseId: string) {
    try {
      const result = await this.onlineSqliteService.mockProgressAPIFormatedList(courseId);
      console.log('Course Progress API Formatted List:', result);
      return result
    } catch (error) {
      console.error('Error mocking progress API formatted list:', error);
    }
  }

  public async updateLastReadContentId(courseId: string, contentId: string, mockResponse?: any): Promise<void> {
    try {
      await this.onlineSqliteService.updateLastReadContentId(courseId, contentId, mockResponse);
      console.log('Last Read Content Id Updated Successfully.', contentId);
    } catch (error) {
      console.error('Error updating last read content id:', error);
    }
  }

}
