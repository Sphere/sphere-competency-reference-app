import { Component, OnInit } from '@angular/core';
import { MyCourseService } from '../../services/my-course.service';
import { WidgetUserService } from '../../../../../library/ws-widget/collection/src/lib/_services/widget-user.service';
import * as _ from 'lodash'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { Platform } from '@ionic/angular';
import { Environment, ErrorType, InteractType, PageId, TelemetryGeneratorService } from '../../../../../services';

@Component({
  selector: 'app-for-you',
  templateUrl: './for-you.component.html',
  styleUrls: ['./for-you.component.scss'],
})
export class ForYouComponent implements OnInit {
  forYouCourse: any[];
  displayConfig = {
    displayType: 'card-badges',
    showCompetency: true,
    badges: {
      orgIcon: true,
      certification: false,
      isCertified: true
    }
  }
  isLoading = true;

  currentParams: any;
  offset: any;
  limit: any;
  requiredSourceName: string[] = [];
  departmentDefaultLang = 'en';
  currentOrgId: string;
  isTablet = false;
  constructor(
    private myCourseService: MyCourseService,
    private userSvc: WidgetUserService,
    private configSvc: ConfigurationsService,
    private platform: Platform,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) { }

  async ngOnInit() {
    this.isTablet = this.platform.is('tablet');
    await this.getHomeContent()
    this.loadInitialCourses();
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
  loadInitialCourses() {
    this.isLoading = true;
    this.myCourseService.getRecomendedCourseData().subscribe((data: any) => {
      this.forYouCourse = data;
      this.isLoading = false;
      console.log('>>>>>>>>', this.forYouCourse)
    });
    this.myCourseService.getForYouParams().subscribe((data: any) => {
      this.currentParams = data
      this.offset = data.offset
      this.limit = data.limit
    })
  }


  loadMoreCourses(event: any) {

    console.log('Load more data triggered'); // Debug statement to check if this method is called
    this.offset += this.limit;  // Increase the offset to fetch the next set of data
    const request = {
      Offset: this.offset,
      limit: this.limit,
      appId: this.currentParams.appId,
      designation: this.currentParams.designation
    }
    console.log("infinity",request)
      
      this.userSvc.fetchCourseRemommendationv(request).subscribe((newCourses: any) => {
        console.log("ini data", newCourses)
        const { recomenderCourse, forYouCount } = this.formatmyRecomenderCourse(newCourses)
        this.forYouCourse = [...this.forYouCourse, ...recomenderCourse];
        event.target.complete();

      // Update the shared service with the new count
      this.myCourseService.updateForYouCount(this.forYouCourse.length);
        // Disable infinite scroll if there are no more courses to load
        if (newCourses.length ===  0) {
          event.target.disabled = true;
          console.log("ini data", event.target.disabled)
        }else{
          event.target.disabled = false;
        }
      },
      (error) => {
        console.error('Error fetching courses:', error);
        this.generateErrorTelemetry(error);
        event.target.complete();
      }
    );
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.loadMoreCourses(infiniteScroll);
    }, 500);
  }
  formatmyRecomenderCourse(courses: any[]): { recomenderCourse: any[]; forYouCount: number } {
    let recomenderCourse: any[] = [];
    if (courses && courses.length > 0) {
      courses.forEach((key) => {
        if (_.has(key, 'competency') && key.competency === false) {
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
      }
      });
    }
    recomenderCourse = _.uniqBy(recomenderCourse, 'identifier')
    // recomenderCourse = _.filter(
    //   _.uniqBy(recomenderCourse, 'identifier'), // Ensure unique courses
    //   (ckey) => _.includes(this.requiredSourceName, ckey.sourceName) // Filter based on sourceName
    // );
    
    return {
      recomenderCourse,
      forYouCount: recomenderCourse.length
    };
    

  }

  onScroll($event){
    console.log($event)
  }

  generateInteractTelemetry() {
    const values = new Map();
    values['currentOrgId'] = this.currentOrgId;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SCROLL,
      'infinite-scrolled',
      Environment.COURSE,
      'course-for-you',
      undefined,
      values
    )
  }

  generateErrorTelemetry(error) {
    this.telemetryGeneratorService.generateErrorTelemetry(
      Environment.HOME,
      'infinite-scrolled',
      ErrorType.SYSTEM,
      PageId.COURSES,
      JSON.stringify(error)
    )
  }

}


