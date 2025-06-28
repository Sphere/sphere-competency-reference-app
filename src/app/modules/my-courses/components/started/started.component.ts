import { Component, OnDestroy, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import { MyCourseService } from '../../services/my-course.service';
import { AppFrameworkDetectorService } from '../../../../../app/modules/core/services/app-framework-detector-service.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Platform } from '@ionic/angular';
@Component({
  selector: 'app-started',
  templateUrl: './started.component.html',
  styleUrls: ['./started.component.scss'],
})
export class StartedComponent implements OnInit, OnDestroy {
  public unsubscribe = new Subject<void>()
  forYouUrl = '/my-courses/for-you'
  startedCourse: any[];
  displayConfig = {
    showCertificate: true,
    showProgress: true,
    showCompetency: false,
    showSourceName:true,
  }
  isLoading = true;
  isTablet = false;
 
  constructor(
    public router: Router,
    private myCourseService:MyCourseService,
    private appFrameworkDetectorService:AppFrameworkDetectorService,
    private platform: Platform
  ) { }
 
  ngOnInit() {
    this.isTablet = this.platform.is('tablet');
    this.detectFramework();
    this.myCourseService.getStartedCourseData().pipe(takeUntil(this.unsubscribe)).subscribe((data: any) => {
      this.isLoading = false
      this.startedCourse = data.sort((a, b) => b.dateTime - a.dateTime);
      console.log('>>>>>>>>', this.startedCourse)
    });
  }
 
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
 
  async detectFramework() {
    try {
      let appFramework = await this.appFrameworkDetectorService.detectAppFramework();
      if (appFramework === 'Ekshamata') {
        this.displayConfig.showCompetency = false
        this.displayConfig.showSourceName = true
 
      }else{
         this.displayConfig.showCompetency = false
        this.displayConfig.showSourceName = true
      }
    } catch (error) {
      console.log('error while getting packagename')
    }
  }
}