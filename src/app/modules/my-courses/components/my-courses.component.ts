import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { WidgetUserService } from '../../../../library/ws-widget/collection/src/lib/_services/widget-user.service';
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { filter, map } from 'rxjs/operators';
import { MyCourseService } from '../services/my-course.service';
import * as _ from 'lodash-es';
import { AppFrameworkDetectorService } from '../../core/services/app-framework-detector-service.service';
import { ContentCorodovaService } from '../../../../library/ws-widget/collection/src/lib/_services/content-corodova.service';
import { Environment, ImpressionType, InteractSubtype, InteractType, PageId, TelemetryGeneratorService } from '../../../../services';

@Component({
  selector: 'app-my-courses',
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.scss'],
})
export class MyCoursesComponent implements OnInit {
  startCount = 0;
  forYouCount = 0;
  completedCount = 0;
  userId: any;
  startedCourse: any;
  completedCourse: any;
  appId:string = ''
  forYouRequestData:any = {
    offset: 0,
    limit: 5,
    appId: '',
    designation: ''

  }
  requiredSourceName: string[] = [];
  departmentDefaultLang = 'en';
  currentOrgId: string
  constructor(
    private router: Router,
    private userSvc: WidgetUserService,
    private configSvc: ConfigurationsService,
    private myCourseService: MyCourseService,
    private appFrameworkDetectorService:AppFrameworkDetectorService,
    private cordovasvc: ContentCorodovaService,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) { }

  async ngOnInit() {


    this.cordovasvc.setAshaData({
      "isAsha": false,
    })

    // Subscribe to the forYouCount changes
    this.myCourseService.currentForYouCount.subscribe(count => {
      this.forYouCount = count;
    });
    await this.getHomeContent()
    this.fetchUserEnrolledCourse();
    this.fetchForYouCourse()
    this.router.events
    .pipe(
      filter(event => event instanceof NavigationEnd),
    )
    .subscribe(()=>{
      const currentUrl = this.router.url;
      if (currentUrl.includes('/my-course')) {
        this.generateInteractTelemetry(currentUrl.split('/').slice(-1)[0], 'my-courses');
      }
      if (currentUrl === '/my-courses/for-you') {
        this.fetchForYouCourse();
      } else {
        this.fetchUserEnrolledCourse();
      }
    });
    this.generateImpressionTelemetry();
  }

  isTabActive(route: string): boolean {
    return this.router.url === route;
  }

  async getHomeContent(){
    if (this.configSvc.userProfile && this.configSvc.userProfile.rootOrgId) {
      this.currentOrgId = this.configSvc.userProfile.rootOrgId;
    }
    let sphereHomeContent:any = await localStorage.getItem('sphereHomeContent');
    if(sphereHomeContent){
      sphereHomeContent = JSON.parse(sphereHomeContent);
      if (sphereHomeContent) {
        let res = sphereHomeContent.departments.find(obj => obj.channelId === this.currentOrgId);
        if (res) {
          this.requiredSourceName = res.sourceName;
          this.departmentDefaultLang = res.defaultLanguage ? res.defaultLanguage : 'en';
        } else {
          this.requiredSourceName = ["IHAT", "Others"]
          this.departmentDefaultLang = 'en'
        }
      }
    }
  }

  async fetchForYouCourse(){
   
    if(this.configSvc.userProfile.profileData){
      await this.detectFramework()
      const professionalDetails  =  _.get(this.configSvc.userProfile.profileData,'professionalDetails')
      if(professionalDetails){
        const designation =  professionalDetails[0].designation
        this.forYouRequestData={
          offset: 0,
          limit: 5,
          appId: this.appId,
          designation: designation
        }
        this.userSvc.fetchCourseRemommendationv(this.forYouRequestData).pipe().subscribe((res)=>{
          const  { recomenderCourse, forYouCount } = this.formatmyRecomenderCourse(res)
          this.forYouCount = forYouCount
          this.myCourseService.setRecomendedCourseData(recomenderCourse);
        })
      }

      this.myCourseService.setForYouParams(this.forYouRequestData)
    }
  }
  formatmyRecomenderCourse(courses: any[]):{ recomenderCourse: any[]; forYouCount:number }{
    let recomenderCourse: any[] = [];
    if(courses && courses.length > 0){
      courses.forEach((key) => {
        const myCourseObject = {
            identifier: key.course_id,
            appIcon: key.course_appIcon,
            thumbnail: key.course_thumbnail,
            name: key.course_name,
            sourceName: key.course_sourceName,
            issueCertification:key.course_issueCertification,
            averageRating: key.course_rating,
            competencies_v1:key.competencies_v1
          };
          recomenderCourse.push(myCourseObject);
      });
    }
    recomenderCourse = _.uniqBy(recomenderCourse, 'identifier')
    // recomenderCourse = _.filter(
    //   _.uniqBy(recomenderCourse, 'identifier'), // Ensure unique courses
    //   (ckey) => _.includes(this.requiredSourceName, ckey.sourceName) // Filter based on sourceName
    // );
    return { recomenderCourse,  forYouCount: recomenderCourse.length}
   
  }
  fetchUserEnrolledCourse() {
    this.userId = this.configSvc.userProfile.userId;
    this.userSvc
      .fetchUserBatchList(this.userId)
      .pipe(
        map((res: any) => _.get(res, 'result.courses')
          )
      )
      .subscribe((courses: any[]) => {
        console.log("Mycourses",courses )
        const { startedCourse, completedCourse, startCount,completedCount } = this.formatmyCourseResponse(courses);
        this.startCount = startCount
        this.completedCount = completedCount
        if (this.isTabActive('/my-courses/started')) {
          this.myCourseService.setStartedCourseData(startedCourse);
        }
        if (this.isTabActive('/my-courses/completed')) {
          this.myCourseService.setCompletedCourseData(completedCourse);
        }
      });
  }

  formatmyCourseResponse(courses: any[]): { startedCourse: any[]; completedCourse: any[], startCount: number, completedCount: number } {
    const startedCourse: any[] = [];
    const completedCourse: any[] = [];
    let latestDateTime = 0;
  
    if (courses) {
      courses.forEach((key) => {
        // Check if competency exists, if not, assume it's okay to process (e.g., no competency required)
        const competencyExists = _.has(key, 'content.competency');
        const competency = competencyExists ? _.get(key, 'content.competency', false) : false;  // Default to false if competency is absent
  
        // Only process courses where competency is either false or not present
        if (competency === false) {
          if (key.completionPercentage !== 100) {
            if (latestDateTime < key.dateTime) {
              latestDateTime = key.dateTime;
            }
  
            const myCourseObject = {
              identifier: key.content.identifier,
              appIcon: key.content.appIcon,
              thumbnail: key.content.thumbnail,
              name: key.content.name,
              dateTime: key.dateTime,
              completionPercentage: key.completionPercentage,
              sourceName: key.content.sourceName,
              rating: key.content.averageRating || key.averageRating,
              isCertified: key.issueCertification || key.content.issueCertification,
              cne: key.content.cneName
            };
  
            startedCourse.push(myCourseObject);
          } else {
            const completedCourseObject = {
              identifier: key.content.identifier,
              appIcon: key.content.appIcon,
              thumbnail: key.content.thumbnail,
              name: key.content.name,
              dateTime: key.dateTime,
              completionPercentage: key.completionPercentage,
              sourceName: key.content.sourceName,
              rating: key.content.averageRating || key.averageRating,
              cne: key.content.cneName,
              isCertified: key.issueCertification || key.content.issueCertification,
            };
  
            completedCourse.push(completedCourseObject);
          }
        }
      });
    }
  
    return { 
      startedCourse, 
      completedCourse, 
      startCount: startedCourse.length, 
      completedCount: completedCourse.length 
    };
  }
  
  

  async detectFramework() {
    try {
      let appFramework = await this.appFrameworkDetectorService.detectAppFramework();
      if (appFramework === 'Ekshamata') {
        this.appId = 'app.aastrika.ekhamata';
      }else{
        this.appId = 'app.aastrika.sphere';
      }
    } catch (error) {
      this.appId = '';
      console.log('error while getting packagename')
    }
  }

  generateInteractTelemetry(action, page) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      `${action}-courses`,
      Environment.HOME,
      page
    );
  }

  generateImpressionTelemetry() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.PAGE_LOADED, '',
      'my-course',
      Environment.COURSE
    )
  }
}
