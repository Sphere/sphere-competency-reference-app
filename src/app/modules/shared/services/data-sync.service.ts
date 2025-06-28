import { Injectable } from '@angular/core';
import { WidgetUserService } from '../../../../library/ws-widget/collection/src/public-api';
import { SqliteService } from './sqlite.service';
import { LocalStorageService } from '../../../../app/manage-learn/core';
import { Subscription, from, interval, of, timer } from 'rxjs';
import { concatAll, concatMap, delay, startWith, takeUntil, takeWhile } from 'rxjs/operators';
import _ from 'lodash';
import { Events } from '../../../../util/events';
import { OfflineCourseOptimisticService } from '../../../../app/modules/shared/services/offline-course-optimistic.service'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service';

@Injectable({
  providedIn: 'root'
})
export class DataSyncService {

  constructor(
    private userSvc: WidgetUserService,
    private sqliteService: SqliteService,
    private localStorageService: LocalStorageService,
    private configSvc: ConfigurationsService,
    private event: Events,
    private offlineCourseOptimisticService:OfflineCourseOptimisticService) { }

    public async showSync(courseId?: any): Promise<boolean> {

      let enrolledData = await this.detectEnrolledCourseProgress(courseId);
      const couseLocalProgressData = await this.sqliteService.mockProgressAPIFormatedList(courseId);
      const existingData = _.get(couseLocalProgressData, 'result.contentList', []);
    
      if (existingData && existingData.length > 0) {
        const progressObservable = from([
          of(20).pipe(delay(800)),
          of(40).pipe(delay(1200)),
          of(60).pipe(delay(1600)),
          of(80).pipe(delay(2000)),
          of(100).pipe(delay(2400))
        ]).pipe(
          startWith(of(0)),
          concatAll()
        );
        const spinnerDuration = 1.5; /*1 minute and 30 seconds */
        const intervalTime = 5000;
        return new Promise<boolean>((resolve) => {
          let spinnerSubscription: Subscription | undefined;
          const apiCallTimer$ = timer(spinnerDuration * 60 * 1000); // Emit after 1 minute and 30 seconds
          spinnerSubscription = interval(intervalTime)
            .pipe(
              takeWhile(count => count <= (spinnerDuration * 60 * 1000 / intervalTime)), // Adjust the spinner duration
              concatMap(() => progressObservable),
              takeUntil(apiCallTimer$)
            )
            .subscribe(
              async (progressValue: number) => {
                const shouldShowSpinner = await this.checkProgressSync(enrolledData, courseId);
                console.log('shouldShowSpinner', shouldShowSpinner);
                resolve(shouldShowSpinner);
                if(shouldShowSpinner){
                  this.event.publish('showProgressSyncBar', true);
                }
                
              },
              () => {},
              () => {
                // Spinner duration completed, resolve with false
                console.log('Spinner duration completed, resolving with false');
                resolve(false);
                this.event.publish('showProgressSyncBar', false);
                setTimeout(() => {
                  this.event.publish('makeAPICall', true);
                }, 1000);
                
              }
            );;
    
          apiCallTimer$.subscribe(async () => {
            const updatedData = await this.detectEnrolledCourseProgress(courseId);
            const shouldShowSpinner = await this.checkProgressSync(enrolledData, courseId);
            console.log('API call after 1 minute:', updatedData);
            resolve(shouldShowSpinner);
            /* Stop the spinner subscription here if needed */
            if (spinnerSubscription) {
              spinnerSubscription.unsubscribe();
            }
          });
        });
      }
    
      return Promise.resolve(false); // If there is no data, resolve with false
    }
    
    
    public async detectEnrolledCourseProgress(courseId?: any): Promise<any> {
      return new Promise(async (resolve) => {
        if (!navigator.onLine) {
          resolve(undefined);
          return;
        }
        const userId = this.configSvc.userProfile?.userId || '';
        try {
          const courses = await this.userSvc.fetchUserBatchList(userId).toPromise();
    
          if (courses && courseId) {
            const coursesList = _.get(courses, 'result.courses', []);
            const filterEnrolledCourse = coursesList.find(course => course.courseId === courseId);
            resolve(filterEnrolledCourse);
          } else {
            resolve(undefined);
          }
        } catch (error) {
          console.error('Error fetching user batch list:', error);
          resolve(undefined);
        }
      });
    }
    
    
    public async checkProgressSync(filterEnrolledCourse?: any,courseId?:any) {
      console.log('filterEnrolledCourse', filterEnrolledCourse)
      const courses = await this.localStorageService.getLocalStorage(courseId);
      let response:any = await this.offlineCourseOptimisticService.fetchUserEnrolledCourse(courseId)
      console.log('response of offline ',response)
      if (courses) {
        const coursesList = _.get(response, 'result.courses', []);
        const courseTocheck = coursesList.find(course => course.courseId === courseId);
        if (filterEnrolledCourse && filterEnrolledCourse.completionPercentage < courseTocheck.completionPercentage) {
          return true
        } else {
          return false
        }
      }
    }
  
}
