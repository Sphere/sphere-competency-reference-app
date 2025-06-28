import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router'
import { DomSanitizer } from '@angular/platform-browser';
import { ContentCorodovaService } from '../../../../../library/ws-widget/collection/src/lib/_services/content-corodova.service';
import publicConfig from '../../../../../assets/configurations/sphere-mobile-home.json';
import * as _ from 'lodash-es';
import cardConfig from '../../../../../assets/configurations/card.json';
import { Platform } from '@ionic/angular';
// import { SplashScreenService } from '../../../../../services';
import { CardService } from '../../../../../app/modules/shared/services/card.service';
import { ScrollService } from '../../../../../app/modules/shared/services/scroll.service';
@Component({
  selector: 'app-sphere-mobile-page',
  templateUrl: './sphere-mobile-page.component.html',
  styleUrls: ['./sphere-mobile-page.component.scss'],
})
export class SphereMobilePageComponent implements OnInit {
  pageLayout: any
  videoData: any
  defaultLang: any = 'en'
  topCertifiedCourse: any = []
  featuredCourse: any = []
  featuredCourseIdentifier: any = []
  topCertifiedCourseIdentifier: any = []
  cneCourseIdentifier:any = []
  cneCourse:any = []
  isHomePage: boolean = true;
  displayConfig = {
    displayType: 'card-badges',
    badges: {
      orgIcon: true,
      certification: true,
    }
  }
  displayConfigCNE= {
    displayType: 'card-badges',
    showCompetency: true,
    badges: {
      orgIcon: true,
      certification: false,
      CNE: true
    }
  }
  viewCnecourses:boolean=false;
  viewTopcourses:boolean=false;
  isTablet = false;
  @ViewChild('scrollToCneCourses', { static: false }) scrollToCneCourses!: ElementRef;
  constructor( private router: Router,
    // private splashScreenService: SplashScreenService,
    private sanitizer: DomSanitizer,
    private ContentSvc: ContentCorodovaService,
    private cardService:CardService,
    private scrollService: ScrollService,
    private platform: Platform
    ) { }

  ngOnInit() {
    this.isTablet = this.platform.is('tablet');
    this.platform.ready().then(() => {
      this.pageLayout = publicConfig.pageLayout
    });
    this.setHomeContent();
    
    // this.splashScreenService.handleSunbirdSplashScreenActions();
    setTimeout(() => {
      this.fetchData()
    }, 1000)

    this.routerSubscriptions()

    this.scrollService.scrollToDivEvent.subscribe((targetDivId: string) => {
      if (targetDivId === 'scrollToCneCourses') {
        this.scrollService.scrollToElement(this.scrollToCneCourses.nativeElement)
      }
    })
  }

  routerSubscriptions(){
    if (this.router.url === '/page/home' || this.router.url === '/public/home' || this.router.url === '/') {
      this.isHomePage = true
    } else {
      this.isHomePage = false
    }  
  }

  async setHomeContent(){
    try {
      let sphereHomeContent:any = await localStorage.getItem('sphereHomeContent');
      if(sphereHomeContent){
        sphereHomeContent = JSON.parse(sphereHomeContent);
        this.setVideoData(sphereHomeContent.public.videoData)
        this.setHomeContentByAPI();
      }else{
        this.setHomeContentByAPI();
      }
    } catch (error) {
      this.setHomeContentByAPI();
    }
  }

  setHomeContentByAPI(){
    this.ContentSvc.getHomeStaticContent().subscribe((_content:any)=>{
      this.setVideoData(_content.public.videoData)
      localStorage.setItem('sphereHomeContent', JSON.stringify(_content));
    })
  }

  setVideoData(videoList){
    this.videoData = [];
    let self = this;
    videoList.map(async (_row)=>{
      let url = await self.sanitizer.bypassSecurityTrustResourceUrl( _row.url);
      this.videoData.push({..._row, url:url});
    });
  }

  openIframe(video: any) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        video: video.videoIndex,
      },
    }
    this.router.navigate(['/app/video-player'], navigationExtras)
  }

  fetchData() {
    let courseLanguages = ['en'];
    if(this.defaultLang != 'en'){
      courseLanguages.push(this.defaultLang);
    }
    const publicConfigJson: any = publicConfig
      this.topCertifiedCourseIdentifier = publicConfigJson.topCertifiedCourseIdentifier
      this.featuredCourseIdentifier = publicConfigJson.featuredCourseIdentifier
      this.cneCourseIdentifier = publicConfigJson.cneCoursesIdentifier
    const requiredIdentifiers = [...this.topCertifiedCourseIdentifier, ...this.featuredCourseIdentifier, ...this.cneCourseIdentifier  ]
    this.ContentSvc.getLiveSearchResultsSphere(courseLanguages, requiredIdentifiers)
    .pipe().subscribe((res: any) => {
      
      if (_.get(res, 'result.content', []).length > 0) {
        let defaultLanCourses = res.result.content.filter((_row)=>_row.lang == this.defaultLang);
        if(defaultLanCourses && defaultLanCourses.length>0){
          res.result.content = defaultLanCourses;
        }
        this.formatTopCertifiedCourseResponse(res)
        this.formatFeaturedCourseResponse(res)
        this.cneCourses(res)
      }
    })
  }

  // cneCourses(res){
  //   const cneCourse = _.filter(res.result.content, ckey => {
  //     return  _.includes(this.cneCourseIdentifier, ckey.identifier)
  //   })
  //   this.cneCourse = _.uniqBy(cneCourse, 'identifier')
  //   // this.topCertifiedCourse = this.topCertifiedCourse.slice(0, 10);
  // }


  cneCourses(res) {
    // Define the IDs that should come first
    const priorityIds = [
      "do_11357413932438323211506",
      "do_11342648503935795211688",
      "do_1136137511548764161792"
    ];

    const remainingIds = [
      "do_1136208573316628481954",
      "do_11376124906447667219",
      "do_1137594994236129281162",
      "do_11378822335428198411",
      "do_1137937360086220801140",
      "do_1137937626018693121165",
      "do_1137533766819430401136",
      "do_113759108993581056167",
      "do_1134170689871134721450",
      "do_1135953715273646081267",
      "do_113789659935694848169"
  ];
  
    // Filter out the courses with priority IDs
    const priorityCourses = _.filter(res.result.content, ckey => {
      return _.includes(priorityIds, ckey.identifier);
    });
  
    // Filter out the remaining courses
    const remainingCourses = _.filter(res.result.content, ckey => {
      return _.includes(remainingIds, ckey.identifier);
    });
  
    // Combine the priority courses with the remaining courses
    // @ts-ignore
    this.cneCourse = [...priorityCourses, ...remainingCourses];
  }

  // formatTopCertifiedCourseResponse(res: any) {
  //   const topCertifiedCourse = _.filter(res.result.content, ckey => {
  //     return  _.includes(this.topCertifiedCourseIdentifier, ckey.identifier)
  //   })
  //   this.topCertifiedCourse = _.uniqBy(topCertifiedCourse, 'identifier')
  //   this.topCertifiedCourse = this.topCertifiedCourse.slice(0, 10);
  // }

  formatTopCertifiedCourseResponse(res: any){

    const priorityIds = [
      "do_1134170689871134721450",
      "do_11357408383009587211503",
      "do_11376124906447667219"
    ];

     // Filter out the courses with priority IDs
     const priorityCourses = _.filter(res.result.content, ckey => {
      return _.includes(priorityIds, ckey.identifier);
    });
  
    // Filter out the remaining courses
    const remainingCourses = _.filter(res.result.content, ckey => {
      return !_.includes(priorityIds, ckey.identifier);
    });
   const courses =_.uniqBy(remainingCourses, 'identifier')
    const topCertifiedCourse= courses.slice(0, 4);
  
    // Combine the priority courses with the remaining courses
    this.topCertifiedCourse = [...priorityCourses, ...topCertifiedCourse];
  
  }

  formatFeaturedCourseResponse(res: any) {
    const featuredCourseData = this.cardService.getDataForCard(res,cardConfig.sphereCard.constantData,cardConfig.sphereCard.dynamicFields,cardConfig.sphereCard.metaData)
    console.log(featuredCourseData)
    const featuredCourse = _.filter(res.result.content, ckey => {
      return _.includes(this.featuredCourseIdentifier, ckey.identifier)
    })
    this.featuredCourse = _.reduce(_.uniqBy(featuredCourse, 'identifier'), (result, value) => {
      result['identifier'] = value.identifier
      result['appIcon'] = value.appIcon
      result['name'] = value.name
      return result

    }, {})
  }

  toggleViewCneCourses(){
    this.viewCnecourses = !this.viewCnecourses
    
  }
  toggleViewTopCourses(){
    this.viewTopcourses = !this.viewTopcourses
  }


}



