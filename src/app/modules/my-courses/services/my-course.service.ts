import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
@Injectable()
export class MyCourseService {
  private startedCourseDataSubject = new Subject<any>();
  private completedCourseDataSubject = new Subject<any>();
  private recomendedCourseDataSubject = new Subject<any>();
  private foryouParamsSunject = new Subject<any>();

  private forYouCountSource = new BehaviorSubject<number>(0);
  currentForYouCount = this.forYouCountSource.asObservable();

  setStartedCourseData(data: any) {
    this.startedCourseDataSubject.next(data);
  }

  getStartedCourseData() {
    return this.startedCourseDataSubject.asObservable();
  }
  setRecomendedCourseData(data: any) {
    this.recomendedCourseDataSubject.next(data);
  }

  getRecomendedCourseData() {
    return this.recomendedCourseDataSubject.asObservable();
  }
  setCompletedCourseData(data: any) {
    this.completedCourseDataSubject.next(data);
  }

  getCompletedCourseData() {
    return this.completedCourseDataSubject.asObservable();
  }

  setForYouParams(data){
    this.foryouParamsSunject.next(data);
  }

  getForYouParams(){
    return this.foryouParamsSunject.asObservable();
  }

  updateForYouCount(count: number) {
    this.forYouCountSource.next(count);
  }

}