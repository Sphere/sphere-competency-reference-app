import { Injectable } from '@angular/core';
import {SQLiteObject,SQLite,SQLiteDatabaseConfig} from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform } from '@ionic/angular';
import * as _ from 'lodash';
import { LocalStorageService } from '../../../../app/manage-learn/core';
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service';

@Injectable({
  providedIn: 'root'
})
export class OnlineSqliteService {
  public  database :SQLiteObject;
  public  databseConfig:SQLiteDatabaseConfig
  constructor(private platform: Platform, private sqlite: SQLite,
    private localStorageService: LocalStorageService,
    private configSvc: ConfigurationsService,) { 
    this.databseConfig = {
      name: 'optimistic-ui-online-store.db',
      location: 'default'
    }
    this.platform.ready().then(async()=>{
      this.platform.ready().then(async () => {
        try {
          await this.createDatabaseIfOnline();
          await this.createDatabase(); // Ensure the database is created before using it
          await this.databaseReady();
          this.createTables();
          this.createUserEnrollCourseTable();
        } catch (error) {
          console.error('Error initializing database:', error);
        }
      });
    })
  }
  public async  createDatabaseIfOnline() {
    if (navigator.onLine) {
      await this.createDatabase();
    }
  }
  
  public createDatabase(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.database) {
        resolve();
      } else {
        this.sqlite.create(this.databseConfig)
          .then((db: SQLiteObject) => {
            this.database = db;
            console.log('Database created successfully');
            resolve(); // Resolve after setting this.database
          })
          .catch((error) => {
            console.error('Error opening database', error);
            reject(error);
          });
      }
    });
  }
  
 
  public  async initDatabase(): Promise<void> {
    if (!this.database) {
      await this.createDatabaseIfOnline();
    }
  }
  public async databaseReady() {
    return new Promise<void>((resolve) => {
      if (this.database) {
        resolve();
      } else {
        setTimeout(() => this.databaseReady().then(resolve), 1000);
      }
    });
  }
  public createTables() {
    const query =
      'CREATE TABLE IF NOT EXISTS onlineCourseProgress (' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
      'courseId varchar(255), ' +
      'contentId varchar(255), ' +
      'userId varchar(255), ' +
      'batchId varchar(255), ' +
      'mimeType varchar(255), ' +
      'completionPercentage INTEGER, ' +  // Add a comma here
      'lastReadContentId varchar(255), ' + // Add a comma here
      'status INTEGER)'; // Remove the comma here
      
    this.database
      .executeSql(query, [])
      .then(() => console.log('Optimistic online courseProgress Table created'))
      .catch((error) => console.error('Error creating Optimistic online table', error));
  }
  public createUserEnrollCourseTable() {
    const query =
      'CREATE TABLE IF NOT EXISTS userEnrollCourse (' +
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
      .then(() => console.log('userEnrollCoiurse Table created'))
      .catch((error) => console.error('Error creating userEnrollCoiurse table', error));
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
    try {
      await this.createDatabase();
      await this.databaseReady();
  
      const checkQuery = 'SELECT * FROM onlineCourseProgress WHERE courseId = ? AND userId = ? AND contentId = ?';
      const insertQuery =
        'INSERT INTO onlineCourseProgress (courseId, contentId, userId, completionPercentage, batchId, mimeType, lastReadContentId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      const updateQuery =
        'UPDATE onlineCourseProgress SET completionPercentage = CASE WHEN ? > completionPercentage THEN ? ELSE completionPercentage END, batchId = ?, mimeType = ?, lastReadContentId = ?, status = ? WHERE courseId = ? AND userId = ? AND contentId = ?';
  
      // Check if the record already exists
      const checkResult = await this.database.executeSql(checkQuery, [courseId, userId, contentId]);
  
      if (checkResult.rows.length > 0) {
        // If the record exists, update it within a transaction
        await this.database.transaction(async (tx) => {
          await tx.executeSql(updateQuery, [
            completionPercentage,
            completionPercentage, // Use completionPercentage for both parameters in the update query
            batchId,
            mimeType,
            lastReadContentId,
            status,
            courseId,
            userId,
            contentId,
          ]);
        });
  
        console.log('Data updated successfully for courseId:', courseId, 'contentId:', contentId, 'userId:', userId);
      } else {
        // If the record doesn't exist, insert it within a transaction
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
  
        console.log('Data inserted successfully for courseId:', courseId, 'contentId:', contentId, 'userId:', userId);
      }
    } catch (error) {
      console.error(
        'Error inserting/updating data for courseId:',
        courseId,
        'contentId:',
        contentId,
        'userId:',
        userId,
        'Error:',
        error
      );
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
): Promise<void> {
    try {
        const checkQuery =
            'SELECT * FROM userEnrollCourse WHERE courseId = ? AND userId = ?';
        const insertQuery =
            'INSERT INTO userEnrollCourse (courseId, contentId, userId, batchId, mimeType, completionPercentage, lastReadContentId, status, batch) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const updateQuery =
            'UPDATE userEnrollCourse SET batchId = ?, mimeType = ?, completionPercentage = ?, lastReadContentId = ?, status = ?, batch = ? WHERE courseId = ? AND userId = ?';

        await this.createDatabase();
        await this.databaseReady()
        const result = await this.database.executeSql(checkQuery, [courseId, userId]);

        if (result.rows.length > 0) {
            await this.database.executeSql(updateQuery, [
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
            await this.database.executeSql(insertQuery, [
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
        console.log('Data inserted successfully for courseId:', courseId, 'contentId:', contentId, 'userId:', userId);
    } catch (error) {
      console.error('Error inserting/updating data for courseId:', courseId, 'contentId:', contentId, 'userId:', userId, 'Error:', error);
    }
  }

  public async getUserEnrollCourse(courseId: string, userId: string): Promise<{ result: { courses: any[] }}> {
    await this.createDatabase();
    await this.databaseReady()

    const query = 'SELECT * FROM userEnrollCourse WHERE courseId = ? AND userId = ?';
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
      const checkQuery = 'SELECT * FROM onlineCourseProgress WHERE courseId = ? AND userId = ? AND contentId = ?';
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
      const checkQuery = 'SELECT * FROM onlineCourseProgress WHERE courseId = ? AND userId = ? AND contentId = ?';
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

  public fetchData() {
    const query = 'SELECT * FROM onlineCourseProgress';
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
  
  public fetchDataByCourseIdAndUserId(courseId: string, userId: string) {
    const query = 'SELECT * FROM onlineCourseProgress WHERE courseId = ? AND userId = ?';
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
          status: parseInt(data.status, 10),
        }, data)
      );
      const uniqueUpdatedData = _.uniqBy(updatedData, 'contentId');
      mockResponse.result.contentList = uniqueUpdatedData
    }
    return mockResponse;
  }
  public async updateResumeData(courseId){
    const mockResponse:any= await this.mockProgressAPIFormatedList(courseId)
    if(mockResponse){
      await this.localStorageService.setLocalStorage(courseId + 'resumeData', mockResponse.result.contentList);
    }

  }
  public async updateLastReadContentId(courseId, contentId, mockResponse?: any): Promise<void> {
    try {
      const enrollCourses = await this.getUserEnrollCourse(courseId, this.configSvc.userProfile.userId);
      const courseToUpdate = enrollCourses.result.courses.find(course => course.courseId === courseId);
      
      if (courseToUpdate) {
        courseToUpdate.lastReadContentId = contentId;
        const CkContent = await this.localStorageService.getLocalStorage('c_content' + courseId);
        
        if (CkContent) {
          const leafContentIds = Array.from(this.getLeafNodeIdsWithoutDuplicates([CkContent]));
          const unitLevelViewedContents = mockResponse?.result?.contentList
            .filter(c => (c.status === 1 || c.status === 2) && leafContentIds.includes(c.contentId));
          const totalCompletionPercentage = unitLevelViewedContents.reduce((sum, c) => sum + c.completionPercentage, 0);
          let progress = Math.round((totalCompletionPercentage / (leafContentIds.length * 100)) * 100);
          courseToUpdate.completionPercentage = Math.min(Math.max(progress, 0), 100);
        }
        
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

  public clearCourseProgressData() {
    const query = 'DELETE FROM onlineCourseProgress';
    return this.database
      .executeSql(query, [])
      .then(() => console.log('Course progress data cleared'))
      .catch((error) => console.error('Error clearing course progress data', error));
  }

  private async updateUserEnrollCourseTable(courseId: string, updatedEnrollCourses: any): Promise<void> {
    try {
      await this.createDatabase();
      await this.databaseReady()
      const updateQuery =
        'UPDATE userEnrollCourse SET lastReadContentId = ?, completionPercentage = ? WHERE courseId = ? AND userId = ?';
  
      const course = updatedEnrollCourses.result.courses.find(course => course.courseId === courseId);
      if (course) {
        const { lastReadContentId, completionPercentage } = course;
        await this.database.executeSql(updateQuery, [lastReadContentId, completionPercentage, courseId, this.configSvc.userProfile.userId]);
        console.log(`UserEnrollCourse table updated for courseId: ${courseId}`);
      }
    } catch (error) {
      console.error('Error updating userEnrollCourse table:', error);
    }
  }
  
}
