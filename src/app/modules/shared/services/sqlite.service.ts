import { Injectable } from '@angular/core';
import {SQLiteObject,SQLite,SQLiteDatabaseConfig} from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform } from '@ionic/angular';
import * as _ from 'lodash';
import { LocalStorageService } from '../../../../app/manage-learn/core';
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service';
@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  private database :SQLiteObject;
  private databseConfig:SQLiteDatabaseConfig

  constructor(private platform: Platform, private sqlite: SQLite,
    private localStorageService: LocalStorageService,
    private configSvc: ConfigurationsService
  ) { 
    this.databseConfig = {
      name: 'optimistic-ui-offline-store.db',
      location: 'default'
    }
    this.platform.ready().then(async()=>{
      /*create database */
      
      await this.createDatabase(); // Ensure the database is created before using it
      await this.databaseReady();
      this.createTables();
      
    })
  }
  public  createDatabase(){
    this.sqlite.create(this.databseConfig).then((db: SQLiteObject)=>{
      this.database = db
      this.createTables()
      this.createUserEnrollCourseTable()
    }).catch((error) => console.error('Error opening database', error));
  }
  private async databaseReady() {
    return new Promise<void>((resolve) => {
      if (this.database) {
        resolve();
      } else {
        setTimeout(() => this.databaseReady().then(resolve), 500);
      }
    });
  }
  public createTables() {
    const query =
      'CREATE TABLE IF NOT EXISTS offlineCourseProgress (' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
      'courseId varchar(255), ' +
      'contentId varchar(255), ' +
      'userId varchar(255), ' +
      'batchId varchar(255), ' +
      'mimeType varchar(255), ' +
      'completionPercentage INTEGER, ' +
      'lastReadContentId varchar(255), ' + // Add the missing fields
      'status INTEGER)';
  
    this.database
      .executeSql(query, [])
      .then(() => console.log('offlineCourseProgress Table created'))
      .catch((error) => console.error('Error creating table', error));
  }
  
 
  public createUserEnrollCourseTable() {
    const query =
      'CREATE TABLE IF NOT EXISTS offlineUserEnrollCourse (' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
      'courseId varchar(255), ' +
      'contentId varchar(255), ' +
      'userId varchar(255), ' +
      'batchId varchar(255), ' +
      'mimeType varchar(255), ' +
      'completionPercentage INTEGER, ' +
      'lastReadContentId varchar(255), ' +
      'status INTEGER, ' +
      'batch TEXT)';  
    
    this.database
      .executeSql(query, [])
      .then(() => console.log('offlineUserEnrollCourse Table created'))
      .catch((error) => console.error('Error creating offlineUserEnrollCourse table', error));
  }
  

  public async enrollUserOffline(
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
    console.log(`Enroll User offline Course: ${courseId} for User: ${userId}`);
    try {
      await this.insertUserEnrollCourseData(courseId, contentId, userId, batchId, mimeType, completionPercentage, lastReadContentId, status, batchDetails);
    } catch (error) {
      console.error('Error inserting user enrollment data:', error);
    }
  }

  public async insertUserEnrollCourseData(
    courseId: string,
    contentId: string,
    userId: string,
    batchId: string,
    mimeType: string,
    completionPercentage: number,
    lastReadContentId: string,
    status: number,
    batchDetails: any  
  ) {
    if (!this.database) {
      await this.createDatabase();
    }
    await this.databaseReady();
    const checkQuery =
      'SELECT * FROM offlineUserEnrollCourse WHERE courseId = ? AND userId = ?';
    const insertQuery =
      'INSERT INTO offlineUserEnrollCourse (courseId, contentId, userId, batchId, mimeType, completionPercentage, lastReadContentId, status, batch) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const updateQuery =
      'UPDATE offlineUserEnrollCourse SET batchId = ?, mimeType = ?, completionPercentage = ?, lastReadContentId = ?, status = ?, batch = ? WHERE courseId = ? AND userId = ?';
  
    return this.database
      .executeSql(checkQuery, [courseId, userId])
      .then((result) => {
        if (result.rows.length > 0) {
          return this.database.executeSql(updateQuery, [
            batchId,
            mimeType,
            completionPercentage,
            lastReadContentId,
            status,
            JSON.stringify(batchDetails),  
            courseId,
            userId,
          ]);
        } else {
          return this.database.executeSql(insertQuery, [
            courseId,
            contentId,
            userId,
            batchId,
            mimeType,
            completionPercentage,
            lastReadContentId,
            status,
            JSON.stringify(batchDetails),  
          ]);
        }
      })
      .then(() => console.log('Data inserted/updated'))
      .catch((error) => console.error('Error inserting/updating data', error));
  }

  public async insertData(
    courseId: string,
    contentId: string,
    userId: string,
    completionPercentage: number,
    batchId: string,
    mimeType: string,
    lastReadContentId: string,
    status: number
  ) {
    console.log('Completion Percentage:', completionPercentage);
  
    const checkQuery = 'SELECT * FROM offlineCourseProgress WHERE contentId = ?';
    const insertQuery = 'INSERT INTO offlineCourseProgress (courseId, contentId, userId, completionPercentage, batchId, mimeType, lastReadContentId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const updateQuery = 
      'UPDATE offlineCourseProgress SET completionPercentage = CASE WHEN ? > completionPercentage THEN ? ELSE completionPercentage END, batchId = ?, mimeType = ?, lastReadContentId = ?, status = ? WHERE courseId = ? AND userId = ? AND contentId = ?';
  
    try {
      const result = await this.database.executeSql(checkQuery, [contentId]);
  
      if (result.rows.length > 0) {
        await this.database.transaction(async (tx) => {
          await tx.executeSql(updateQuery, [
            completionPercentage,
            completionPercentage, 
            batchId,
            mimeType,
            lastReadContentId,
            status,
            courseId,
            userId,
            contentId,
          ]);
        });
  
        console.log('Data updated successfully for contentId:', contentId);
      } else {
        await this.database.transaction(async (tx) => {
          await tx.executeSql(insertQuery, [
            courseId,
            contentId,
            userId,
            completionPercentage,
            batchId,
            mimeType,
            lastReadContentId,
            status,
          ]);
        });
  
        console.log('Data inserted successfully for contentId:', contentId);
      }
    } catch (error) {
      console.error('Error inserting/updating data for contentId:', contentId, 'Error:', error);
    }
  }
  
  

  public fetchData() {
    const query = 'SELECT * FROM offlineCourseProgress';
    return this.database
      .executeSql(query, [])
      .then((result) => {
        let data = [];
        for (let i = 0; i < result.rows.length; i++) {
          data.push(result.rows.item(i));
        }
        return data;
      })
      .catch((error) => console.error('Error fetching data', error));
  }
  
  public fetchDataByCourseId(courseId: string) {
    const query = 'SELECT * FROM offlineCourseProgress WHERE courseId = ?';
    return this.database
      .executeSql(query, [courseId])
      .then((result) => {
        let data = [];
        for (let i = 0; i < result.rows.length; i++) {
          data.push(result.rows.item(i));
        }
        return data;
      })
      .catch((error) => console.error(`Error fetching data for courseId ${courseId}`, error));
  }
 

  public async mockProgressAPIFormatedList(courseId){
    const mockResponse = {
      id: "api.content.state.read",
      ver: "v1",
      ts: "2023-12-26 11:41:00:967+0000",
      params: {
        resmsgid: null,
        msgid: "ca467790-6210-4eb2-86b8-e9b1144fee41",
        err: null,
        status: "success",
        errmsg: null
      },
      responseCode: "OK",
      result: {
        contentList: []
      }
    };
    const existingData:any  = await this.fetchDataByCourseIdAndUserId(courseId,this.configSvc.userProfile.userId)
    if(existingData){
      const updatedData = _.map(existingData, data =>
        _.merge({
          viewCount: null,
          progressdetails: {
            max_size: 546.2,
            current: ["519.04202"],
          },
          status: data.completionPercentage === 100 ? 2 : parseInt(data.status, 10),
        }, data)
      );
      const uniqueUpdatedData = _.uniqBy(updatedData, 'contentId');
      mockResponse.result.contentList = uniqueUpdatedData
    }
    return mockResponse;
  }
  public async mockUserEnrollmentList(courseId){
    const mockResponse = {
      id: "api.user.courses.list",
      ver: "v1",
      ts: "2024-06-05 06:35:51:521+0000",
      params: {
        resmsgid: null,
        msgid: "ca467790-6210-4eb2-86b8-e9b1144fee41",
        err: null,
        status: "success",
        errmsg: null
      },
      responseCode: "OK",
     
    };
    const existingData:any  = await this.getUserEnrollCourse(courseId,this.configSvc.userProfile.userId)
    const finalResponse = { ...mockResponse, ...existingData };
    console.log('mockResponse for offline user enrolled',finalResponse)
    return finalResponse;
  }
  public clearCourseProgressData() {
    const query = 'DELETE FROM offlineCourseProgress';
    return this.database
      .executeSql(query, [])
      .then(() => console.log('Course progress data cleared'))
      .catch((error) => console.error('Error clearing course progress data', error));
  }

  public fetchDataByCourseIdAndUserId(courseId: string, userId: string) {
    const query = 'SELECT * FROM offlineCourseProgress WHERE courseId = ? AND userId = ?';
    return this.database
      .executeSql(query, [courseId, userId])
      .then((result) => {
        let data = [];
        for (let i = 0; i < result.rows.length; i++) {
          data.push(result.rows.item(i));
        }
        return data;
      })
      .catch((error) => console.error(`Error fetching data for courseId ${courseId} and userId ${userId}`, error));
  }

  public async getUserEnrollCourse(courseId: string, userId: string): Promise<{ result: { courses: any[] }}> {
    await this.createDatabase();
    await this.databaseReady()

    const query = 'SELECT * FROM offlineUserEnrollCourse WHERE courseId = ? AND userId = ?';
    console.log(' Enrolled Data for courseId:', courseId,  'userId:', userId);

    return this.database.executeSql(query, [courseId, userId])
        .then((result) => {
            const enrollCourses = [];
            for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows.item(i);
                if (row.batch) {
                    row.batch = JSON.parse(row.batch);
                }
                enrollCourses.push(row);
            }
            return { "result": { "courses": enrollCourses } };
        })
        .catch((error) => {
            console.error('Error fetching data', error);
            return { "result": { "courses": [] } };
        });
  }
  public async isContentIdExistsOrNot(courseId: string, userId: string, contentId: string) {
    try {
      await this.createDatabase();
      await this.databaseReady()
      const checkQuery = 'SELECT * FROM offlineCourseProgress WHERE courseId = ? AND userId = ? AND contentId = ?';
      const result = await this.database.executeSql(checkQuery, [courseId, userId, contentId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error in isContentIdExistsOrNot:', error);
      return true; // Return false when an error occurs
    }
  }

  public async isContentIdExistsWithPercentage(courseId: string, userId: string, contentId: string) {
    try {
      await this.createDatabase();
      await this.databaseReady()
      const checkQuery = 'SELECT * FROM offlineCourseProgress WHERE courseId = ? AND userId = ? AND contentId = ?';
      const result = await this.database.executeSql(checkQuery, [courseId, userId, contentId]);
      if (result.rows.length > 0) {
        const row = result.rows.item(0);
        return {
          exists: true,
          completionPercentage: row.completionPercentage, 
        };
      } else {
        return {
          exists: false,
          completionPercentage: 0,
        };
      }
    } catch (error) {
      console.error('Error in isContentIdExistsWithPercentage:', error);
      return {
        exists: false,
        completionPercentage: 0, 
      };
    }
  }
  private async updateUserEnrollCourseTable(courseId: string, updatedEnrollCourses: any): Promise<void> {
    try {
      await this.createDatabase();
      await this.databaseReady()
      const updateQuery =
        'UPDATE offlineUserEnrollCourse SET lastReadContentId = ?, completionPercentage = ? WHERE courseId = ? AND userId = ?';
  
      const course = updatedEnrollCourses.result.courses.find(course => course.courseId === courseId);
      if (course) {
        const { lastReadContentId, completionPercentage } = course;
        console.log(`Values to update: lastReadContentId=${lastReadContentId}, completionPercentage=${completionPercentage}`);
        await this.database.executeSql(updateQuery, [lastReadContentId, completionPercentage, courseId, this.configSvc.userProfile.userId]);
        console.log(`offlineUserEnrollCourse table updated for courseId: ${courseId}`);
      }
    } catch (error) {
      console.error('Error updating offlineUserEnrollCourse table:', error);
    }
  }
  public async updateLastReadContentId(courseId, contentId, mockResponse?: any): Promise<void> {
    const courses = await this.localStorageService.getLocalStorage(courseId);
    try {
      const enrollCourses = await this.getUserEnrollCourse(courseId, this.configSvc.userProfile.userId);
      const courseToUpdate = enrollCourses.result.courses.find(course => course.courseId === courseId)
      if (courseToUpdate) {
        courseToUpdate.lastReadContentId = contentId;
        const CkContent = await this.localStorageService.getLocalStorage('sdk_content' + courseId);
        if (CkContent) {
          const leafContentIds = Array.from(this.getLeafNodeIdsWithoutDuplicates([CkContent]));
          const unitLevelViewedContents = mockResponse?.result?.contentList
            .filter(c => c.status === 2 && c.completionPercentage == 100 && leafContentIds.includes(c.contentId))
            .map(c => c.contentId);
  
          courseToUpdate.completionPercentage = Math.round((unitLevelViewedContents.length / leafContentIds.length) * 100);
          console.log(`Calculated completion percentage: ${courseToUpdate.completionPercentage}`);
        }
        await this.localStorageService.setLocalStorage(courseId, courses);
        await this.updateUserEnrollCourseTable(courseId, enrollCourses);
      }
    } catch (error) {
      console.error('Error updating last read content id:', error);
    }
  }
  private getLeafNodeIdsWithoutDuplicates(contents: any[]): Set<string> {
    return contents.reduce((acc, content) => {
      if (content.children) {
        this.getLeafNodeIdsWithoutDuplicates(content.children).forEach((c) => acc.add(c));
      } else {
        if (!acc.has(content.identifier)) {
          acc.add(content.identifier);
        }
      }
      return acc;
    }, new Set<string>());
  }
  public async updateResumeData(courseId){
    const mockResponse:any= await this.mockProgressAPIFormatedList(courseId)
    if(mockResponse){
      await this.localStorageService.setLocalStorage(courseId + 'resumeData', mockResponse.result.contentList);
    }

  }
}
