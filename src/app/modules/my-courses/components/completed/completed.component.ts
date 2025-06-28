import { Component, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import { MyCourseService } from '../../services/my-course.service';
import { AppFrameworkDetectorService } from '../../../../../app/modules/core/services/app-framework-detector-service.service';
import { Platform } from '@ionic/angular';
@Component({
  selector: 'app-completed',
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.scss'],
})
export class CompletedComponent implements OnInit {
  completedCourse: any[];
  displayConfig = {
    showCertificate: true,
    showProgress: false,
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
    this.myCourseService.getCompletedCourseData().subscribe((data: any) => {
      this.completedCourse = data;
      this.isLoading = false;
      //console.log('>>>>>>>>', this.completedCourse)
      this.completedCourse = data.sort((a, b) => b.dateTime - a.dateTime);;
      //console.log('>>>>>>>>', this.completedCourse)

    });
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
