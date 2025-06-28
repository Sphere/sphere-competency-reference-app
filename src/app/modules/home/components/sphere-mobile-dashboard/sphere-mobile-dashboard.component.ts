import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { ContentCorodovaService, WidgetUserService } from '../../../../../library/ws-widget/collection/src/public-api'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/public-api'
import { Observable, Subscription, forkJoin, fromEvent, of } from 'rxjs'
import * as _ from 'lodash-es'
import publicConfig from '../../../../../assets/configurations/sphere-mobile-home.json';
import { UserService } from '../../services/user.service'
import { AuthService } from '@project-sunbird/sunbird-sdk'
import { CommonUtilService, Environment, ImpressionType, PageId } from '../../../../../services'
import { RouterLinks } from '../../../../../app/app.constant'
import { ConfigService as CompetencyConfiService } from '../../../../../app/competency/services/config.service'
import { ScrollService } from '../../../../../app/modules/shared/services/scroll.service'
import { DomSanitizer } from '@angular/platform-browser'
import { CardService } from '../../../../../app/modules/shared/services/card.service'
import { catchError, map, mergeMap } from 'rxjs/operators'
import { OverlayContainer } from '@angular/cdk/overlay'
import { MatMenuTrigger } from '@angular/material/menu'
import { Events } from '../../../../../util/events'
import { Platform } from '@ionic/angular'


@Component({
  selector: 'app-sphere-mobile-dashboard',
  templateUrl: './sphere-mobile-dashboard.component.html',
  styleUrls: ['./sphere-mobile-dashboard.component.scss'],
})
export class SphereMobileDashboardComponent implements OnInit, OnDestroy {
  showBackMentee = false
  dataCarousel= [];
  isDataCarouselLoading = true;
  @Input() role;
  myCourse: any
  topCertifiedCourse: any = []
  featuredCourse: any = []
  userEnrollCourse: any = []
  cneCourseIdentifier:any = []
  cneCourse:any = []
  videoData: any
  homeFeatureData: any
  homeFeature: any
  userId: any
  firstName: any
  lastName: string;
  topCertifiedCourseIdentifier: any = []
  hindiTopCertifiedCourseIdentifier: any = []
  featuredCourseIdentifier: any = []
  latestCourseIndex = 0
  defaultLang: any = 'en'
  displayConfig = {
    displayType: 'card-badges',
    showCompetency: true,
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
  displayConfigContinue = {
    displayType: 'card-small',
    showSourceName:true,
    showProgress: true,
    showCompetency: true,
    badges: {
      orgIcon: true,
      certification: true,
      
    }
  }
  enrolledCourses: any = []
  isAPIInProgress = true;
  roleSelected:any = 'learner';
  isTablet = false;

  @ViewChild('menuTrigger') menuTrigger: ElementRef;
  @ViewChild('scrollToCneCourses', { static: false }) scrollToCneCourses!: ElementRef;
  isMenuOpen: boolean = false;
  impressionTelemetry: any;
  scroll$: Subscription;
  startPosition: number;

  constructor(
    private configSvc: ConfigurationsService,
    private userSvc: WidgetUserService,
    private ContentSvc: ContentCorodovaService,
    private router: Router,
    private userHomeSvc: UserService,
    private sanitizer: DomSanitizer,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    private commonUtilService: CommonUtilService,
    private CompetencyConfiService: CompetencyConfiService,
    private scrollService: ScrollService,
    private cardService:CardService,
    private overlayContainer: OverlayContainer,
    private events: Events,
    private platform: Platform,
    
  ) {
    this.commonUtilService.removeLoader();
    this.isAPIInProgress = false;
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.router.navigateByUrl('/organisations/home')
    }
  }

  async ngOnInit() {
    this.isTablet = this.platform.is('tablet');
    this.isAPIInProgress = true;
    this.roleSelected = await this.userHomeSvc.getActiveRole();

    this.scrollService.scrollToDivEvent.subscribe((targetDivId: string) => {
      if (targetDivId === 'scrollToCneCourses') {
        this.scrollService.scrollToElement(this.scrollToCneCourses.nativeElement)
      }
    })
    this.impressionTelemetry = {  
        type: ImpressionType.VIEW,
        subType: '',
        pageId: PageId.HOME,
        env: Environment.HOME
    }
    this.setHomeContent();
    await this.setUserprofile()
    // setTimeout(() => {
      this.userHomeSvc.updateValue$.subscribe(async (res: any) => {
        if (res) {
          this.userLanguage(res)
          this.fetchData()
        }
      })
    // }, 5000)
  }

  ngOnDestroy() {
    this.scroll$?.unsubscribe()
  }

  async setHomeContent(){
    this.isDataCarouselLoading = true;
    try {
      let sphereHomeContent:any = await localStorage.getItem('sphereHomeContent');
      if(sphereHomeContent){
        sphereHomeContent = JSON.parse(sphereHomeContent);
        this.dataCarousel= sphereHomeContent.private.content;
        this.setVideoData(sphereHomeContent.private.videoData);
        this.isDataCarouselLoading = false;
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
      this.dataCarousel= _content.private.content;
      this.setVideoData(_content.private.videoData);
      this.isDataCarouselLoading = false;
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

  async fetchData() {
    if (this.configSvc.userProfile) {
      if(this.firstName == undefined){
        this.firstName = this.configSvc.userProfile.firstName;
        this.lastName = this.configSvc.userProfile.lastName;
      }
      
      this.userId = this.configSvc.userProfile.userId
      this.CompetencyConfiService.setConfig(this.configSvc.userProfile)

      let courseLanguages = ['en'];
      if(this.defaultLang != 'en'){
        courseLanguages.push(this.defaultLang);
      }
      const publicConfigJson: any = publicConfig
        this.homeFeature = publicConfigJson.userLoggedInSection
        this.topCertifiedCourseIdentifier = publicConfigJson.topCertifiedCourseIdentifier
        this.hindiTopCertifiedCourseIdentifier = publicConfigJson.hindiTopCertifiedCourseIdentifier
        this.featuredCourseIdentifier = publicConfigJson.featuredCourseIdentifier;
        this.cneCourseIdentifier = publicConfigJson.cneCoursesIdentifier
        const requiredIdentifiers = [...this.topCertifiedCourseIdentifier, ...this.featuredCourseIdentifier, ...this.hindiTopCertifiedCourseIdentifier, ...this.cneCourseIdentifier ]
      this.userSvc.fetchUserBatchList(this.userId).pipe(
        mergeMap((res: any) => {
          const identifiersList = this.getIdentifiersList(_.get(res, 'result.courses'))

          return forkJoin(
            this.ContentSvc.getSearchResultsByIds(identifiersList).pipe(this.handleRequest().bind(this)), 
            this.ContentSvc.getLiveSearchResultsSphere(courseLanguages, requiredIdentifiers).pipe(this.handleRequest().bind(this))
          )
        })
      ).subscribe((res: any) => {
        
        if(res[0]){
          this.formatmyCourseResponse(_.get(res[0], 'result.content'))
        }
        if (res[1] && _.get(res[1], 'result.content', []).length > 0) {
          let defaultLanCourses = res[1].result.content.filter((_row)=>_row.lang == this.defaultLang);
          if(defaultLanCourses && defaultLanCourses.length>0){
            res[1].result.content = defaultLanCourses;
          }
          this.formatTopCertifiedCourseResponse(res[1])
          this.cneCourses(res[1])
          this.formatFeaturedCourseResponse(res[1])

        }
        this.isAPIInProgress = false;
      })
    }
  }
  handleRequest() {
    return function (observable: Observable<any>) {
      return observable.pipe(
        map((result) => {
          return result;
        }),
        catchError((err) => {
          return of(null);
        })
      );
    };
  }

  getIdentifiersList(coursesList): string[] {
    const identifiersList = []
    this.enrolledCourses = []
    _.forEach(coursesList, key => {
      if (key.completionPercentage !== 100 && key.content) {
        identifiersList.push(key.content.identifier)
        const enrolledCoursesDetails = {
          identifier: key.content.identifier,
          completionPercentage: key.completionPercentage,
          dateTime: key.dateTime
        }
        this.enrolledCourses.push(enrolledCoursesDetails)
      }
    })
    return identifiersList;
  }

  userLanguage(res: any) {
    if (res && res.profileDetails) {
      if (_.get(res, 'profileDetails.preferences.language')) {
        const code = _.get(res, 'profileDetails.preferences.language')
        this.defaultLang = code;
        this.commonUtilService.updateAppLanguage(code);
      }
      if(res.profileDetails.profileReq){
        this.firstName = res.profileDetails?.profileReq?.personalDetails?.firstname;
        this.lastName = res.profileDetails?.profileReq?.personalDetails?.surname;
      }
    }

  }
  formatFeaturedCourseResponse(res: any) {
    const featuredCourse = _.filter(res.result.content, ckey => {
      return _.includes(this.featuredCourseIdentifier, ckey.identifier)
    })
    this.featuredCourse = _.uniqBy(featuredCourse, 'identifier');
    // this.featuredCourse = _.reduce(_.uniqBy(featuredCourse, 'identifier'), (result, value) => {
    //   result['identifier'] = value.identifier
    //   result['appIcon'] = value.appIcon
    //   result['name'] = value.name
    //   return result

    // }, {})
  }
  async setUserprofile() {

    const session = await this.authService.getSession().toPromise();
    this.userHomeSvc.userRead(session.userToken)
  }

  cneCourses(res){
    const cneCourse = _.filter(res.result.content, ckey => {
      return  _.includes(this.cneCourseIdentifier, ckey.identifier)
    })
    this.cneCourse = _.uniqBy(cneCourse, 'identifier')
    // this.topCertifiedCourse = this.topCertifiedCourse.slice(0, 10);
  }

  formatTopCertifiedCourseResponse(res: any) {
   
    const topCertifiedCourse = _.filter(res.result.content, ckey => {
      return  _.includes( this.defaultLang === 'hi' ? this.hindiTopCertifiedCourseIdentifier :  this.topCertifiedCourseIdentifier, ckey.identifier)
    })
    this.topCertifiedCourse = _.uniqBy(topCertifiedCourse, 'identifier')
    this.topCertifiedCourse = this.topCertifiedCourse.slice(0, 10);
  }

  formatmyCourseResponse(coursesDetails: any) {
    if (coursesDetails && coursesDetails.length > 0 && this.enrolledCourses && this.enrolledCourses.length > 0) {
      const myCourse: any = []
      let myCourseObject = {}
      _.forEach(coursesDetails, key => {
        const enrolledCourseDetails = _.find(this.enrolledCourses, (course: any) => course.identifier === key.identifier)
        myCourseObject = {
          identifier: key.identifier,
          appIcon: key.appIcon,
          thumbnail: key.thumbnail,
          name: key.name,
          completionPercentage: enrolledCourseDetails.completionPercentage,
          dateTime: enrolledCourseDetails.dateTime,
          sourceName: key.sourceName,
          cneName: key.cneName,
          issueCertification: key.issueCertification
        }
        myCourse.push(myCourseObject)
      })
      this.userEnrollCourse = _.sortBy(myCourse, 'dateTime').reverse()
    }
  }


  // For opening Course Page
  raiseTelemetry(contentIdentifier: any) {
    this.router.navigateByUrl(`/app/toc/${contentIdentifier}/overview`)
  }

  openIframe(video: any) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        video: video.videoIndex,
      },
    }
    this.router.navigate(['/app/video-player'], navigationExtras)
  }


  async naviagateToviewAllCourse() {
    // this.commonUtilService.addLoader()
    this.isAPIInProgress = true;
    this.router.navigateByUrl(`/${RouterLinks.SEARCH_PAGE}/${RouterLinks.learning}`)
  }

  scrollParentToHowSphereWorks() {
    this.scrollService.scrollToDivEvent.emit('scrollToHowSphereWorks')
  }

  learner(){
    this.roleSelected = "learner";
    this.userHomeSvc.setRole('learner')
    //this.router.navigate([RouterLinks.MY_COURSES]);
    this.events.publish('updatePrimaryNavBarConfig');
  }

  mentor(){ 
    this.roleSelected = "mentor";
    this.userHomeSvc.setRole('mentor')
     // this.router.navigate([`${RouterLinks.PRIVATE_HOME}`])
     this.events.publish('updatePrimaryNavBarConfig');
   
  }

  // closeMenuOnOutsideClick(event: MouseEvent): void {
  //   if (!this.menuTrigger.nativeElement.contains(event.target)) {
  //     // Close the menu or perform any desired action
  //     // For example, you can use matMenuTrigger API to close the menu:
      
  //   }
  // }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }


  preventCloseOnClickOut() {

    this.overlayContainer.getContainerElement().classList.add('disable-backdrop-click');
    this.overlayContainer.getContainerElement().classList.add('blur-background');
    this.isMenuOpen = true;
    document.body.classList.add('blur-background');
    document.body.style.overflow = 'hidden';
  }

  allowCloseOnClickOut() {
    this.overlayContainer.getContainerElement().classList.remove('disable-backdrop-click');
    this.overlayContainer.getContainerElement().classList.remove('blur-background');
    this.isMenuOpen = false;
    document.body.classList.remove('blur-background');
    document.body.style.overflow = 'auto';

  }

  closeMenu(menu: MatMenuTrigger): void {
    menu.closeMenu();
  }

}
