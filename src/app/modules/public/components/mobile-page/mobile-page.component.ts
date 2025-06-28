
import { Component, Inject, OnInit } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
// import { SplashScreenService } from '../../../../../services';
import { delay } from 'rxjs/operators'
import publicConfig from '../../../../../assets/configurations/mobile-public.json';
import { ContentCorodovaService } from '../../../../../library/ws-widget/collection/src/lib/_services/content-corodova.service';
import _ from 'lodash';
import { RouterLinks } from '../../../../app.constant'
import * as jwt_decode from "jwt-decode";
import * as moment from 'moment';
import { AuthService } from '@project-sunbird/sunbird-sdk';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'ws-mobile-page',
  templateUrl: './mobile-page.component.html',
  styleUrls: ['./mobile-page.component.scss'],
})
export class MobilePageComponent implements OnInit {
  pageLayout: any
  videoData: any
  featuredCourse: any = []
  defaultLang: any = "en";
  // defaultLang: any = ["en"]
  displayConfig = {
    displayType: 'card-badges',
    showCompetency: true,
    badges: {
      orgIcon: true,
      certification: true,
    }
  }

  viewAllcourses:boolean = false;
  isAuthenticated: boolean;
  isTablet = false;

  constructor(
    private router: Router,
    // private splashScreenService: SplashScreenService,
    private ContentSvc: ContentCorodovaService,
    @Inject('AUTH_SERVICE') 
    public authService: AuthService,
    private platform: Platform
  ) { }

  async ngOnInit() {
    // this.fetchConfigData()
    // this.fetchData();
    this.isTablet = this.platform.is('tablet');
    await this.checkTokenValidation()
    // this.splashScreenService.handleSunbirdSplashScreenActions();
  }
  // fetchConfigData(){
  //   this.videoData = [
  //     {
  //       url: '../../../../../assets/videos/videoplayback.mp4',
  //       title: 'Register for a course',
  //       description: 'Explore various courses and pick the ones you like',
  //     },
  //     {
  //       url: '../../../../../assets/videos/videoplayback.mp4',
  //       title: 'Take the course',
  //       description: 'Access the course anytime, at your convinience',
  //     },
  //     {
  //       url: '../../../../../assets/videos/videoplayback.mp4',
  //       title: 'Get certified',
  //       description: 'Receive downloadable and shareable certificates',
  //     },
  //   ]

  //   this.pageLayout = publicConfig.pageLayout
  // }
  // openIframe(video: any) {
  //   const navigationExtras: NavigationExtras = {
  //     queryParams: {
  //       video: video.videoIndex,
  //     },
  //   }
  //   this.router.navigate(['/app/video-player'], navigationExtras)
  // }

  fetchData() {
    this.ContentSvc.getLiveSearchResults(this.defaultLang).pipe().subscribe((res: any) => {
      if (_.get(res, 'result.content', []).length > 0) {
        const featuredCourseData = this.filterCourse(res.result);
        console.log("<<<", featuredCourseData)
        this.featuredCourse = featuredCourseData;
        
        // _.reduce(_.uniqBy(featuredCourseData, 'identifier'), (result, value: any) => {
        //   result['identifier'] = value.identifier
        //   result['appIcon'] = value.appIcon
        //   result['name'] = value.name
        //   return result

        // }, {})
      }
    })
  }

  filterCourse(contents: any) {
    const list = contents.content
    const removeItem = ['do_11357408383009587211503', 'do_1136945911089315841314', 'do_1136782979878830081208']
    // const newList = list.filter((i: any) => {
    //   return (i.identifier !== 'do_11357408383009587211503' && i.identifier !== 'do_1136945911089315841314' && i.identifier !== 'do_1136782979878830081208')
    // })

    // Remove objects from array based on the list
    const newArray = _.differenceWith(list, removeItem, _.isEqual);
    
    const filterCourses = _.flatten(newArray)
    console.log(">>>>>>>", filterCourses);

    // contents.content = newList
    // contents.content = this.getUptsu(newList)
    let sortUptsu = this.getUptsu(filterCourses)
    return sortUptsu

  }

  getUptsu(contents) {
    let sorted = contents.sort((a, b) => {
      // 'UPTSU' comes first, so if either a or b is 'UPTSU', return -1
      if (a.sourceName === 'UPTSU' || b.sourceName === 'UPTSU') {
        return a.sourceName === 'UPTSU' ? -1 : 1;
      }
    });
    return sorted;
  }

  toggleViewAllCourses() {
    this.viewAllcourses = !this.viewAllcourses;
  }

  login(){
    this.router.navigateByUrl(RouterLinks.APP_LOGIN);
  }

  async checkTokenValidation() {
    const session = await this.authService.getSession().toPromise();
    if (session) {
      const token = jwt_decode(session.access_token);
      const tokenExpiryTime = moment(token.exp * 1000);
      const currentTime = moment(Date.now());
      const duration = moment.duration(tokenExpiryTime.diff(currentTime));
      const hourDifference = duration.asHours();
      if (!(hourDifference < 2)) {
       this.isAuthenticated = true
      }
    } else {
      this.isAuthenticated = false;
    }
    
  }
}
