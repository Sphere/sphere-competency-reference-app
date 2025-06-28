import { Component, OnInit, OnDestroy, Inject, NgZone, ChangeDetectorRef } from '@angular/core'
import { ActivatedRoute, Data, Router } from '@angular/router'
import { Subscription, of } from 'rxjs'
import { NsTnc } from '../models/tnc.model'
import { NsWidgetResolver } from '../../library/ws-widget/resolver/src/lib/widget-resolver.model'
import { ROOT_WIDGET_CONFIG } from '../../library/ws-widget/collection/src/lib/collection.config'
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms'
import { delay, mergeMap } from 'rxjs/operators'
import { UserProfileService } from '../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { SignupService } from '../modules/public/services/signup/signup.service'
import { TncPublicResolverService } from '../services/tnc-public-resolver.service'
import { AuthService, InteractType, TelemetryObject } from '@project-sunbird/sunbird-sdk'
import { UserService } from '../modules/home/services/user.service'
import _ from 'lodash'
import { RouterLinks } from '../app.constant'
import { LocalStorageService } from '../manage-learn/core'
import { ConfigService } from '@aastrika_npmjs/comptency/entry-module'
import { Events } from '../../util/events'
import { AppFrameworkDetectorService } from '../modules/core/services/app-framework-detector-service.service'
import { NsError } from '../../library/ws-widget/collection/src/lib/models/error-resolver.model'
import { LoggerService } from '../../library/ws-widget/utils/src/lib/services/logger.service'
import { ConfigurationsService } from '../../library/ws-widget/utils/src/lib/services/configurations.service'
import { AppGlobalService } from '../../services/app-global-service.service'
import { CommonUtilService } from '../../services/common-util.service'
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service'
import { Environment, PageId } from '../../services/telemetry-constants'


@Component({
  selector: 'ws-new-tnc',
  templateUrl: './new-tnc.component.html',
  styleUrls: ['./new-tnc.component.scss'],
})
export class NewTncComponent implements OnInit, OnDestroy {
  tncData: NsTnc.ITnc | null = null
  routeSubscription: Subscription | null = null
  isAcceptInProgress = false
  errorInAccepting = false
  isPublic = false
  result: any
  userId = ''
  createUserForm!: UntypedFormGroup
  showAcceptbtn = true
  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }
  userData: any
  source = 'profile'
  isChecked = false;
  showTNCDetails = false;
  appFramework: any
  currentOrgId: string
  orgName: any
  videoLink: Promise<any>
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private loggerSvc: LoggerService,
    private configSvc: ConfigurationsService,
    private tncPublicSvc: TncPublicResolverService,
    private userProfileSvc: UserProfileService,
    private signupService: SignupService,
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    private userHomeSvc: UserService,
    private localStorageService: LocalStorageService,
    private CompetencyConfigService: ConfigService,
    private cdr: ChangeDetectorRef,
    private events: Events,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
  ) {
  }

  async ngOnInit() {

    console.log(this.configSvc)
    this.detectFramework();
    this.getOrgName()
    this.routeSubscription = this.activatedRoute.data.subscribe((response: Data) => {
      console.log(">>>>>>>> Tad c", response)
      if (response.tnc) {
        this.tncData = response.tnc
        this.isPublic = response.isPublic || false
      } else {
        this.router.navigate(['error-service-unavailable'])
      }
    })

    if (this.configSvc.unMappedUser) {
      // this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe((userDetails: any) => {
      const userDetails = this.configSvc.userDetails
      this.userData = userDetails
      if (userDetails.profileDetails) {
        // if (userDetails.tcStatus === 'false') {
        if (!userDetails.tcStatus || (userDetails.tcStatus && userDetails.tcStatus === 'false')) {
          this.showAcceptbtn = true
        } else {
          this.showAcceptbtn = false
        }
      } else {
        this.showAcceptbtn = true
      }
      // })
    }

    this.result = await this.signupService.fetchStartUpDetails()
    this.createUserForm = this.createTncFormFields()
  }

  createTncFormFields() {
    return new UntypedFormGroup({
      tncAccepted: new UntypedFormControl(''),
      firstname: new UntypedFormControl('', []),
      middlename: new UntypedFormControl('', []),
      surname: new UntypedFormControl('', []),
      mobile: new UntypedFormControl('', []),
      telephone: new UntypedFormControl('', []),
      primaryEmail: new UntypedFormControl('', []),
      primaryEmailType: new UntypedFormControl('', []),
      dob: new UntypedFormControl('', []),
      regNurseRegMidwifeNumber: new UntypedFormControl('', []),
    })
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
  }

  getTnc(locale: string) {
    let dpData: NsTnc.ITncUnit
    if (this.tncData) {
      dpData = this.tncData.termsAndConditions.filter(term => term.name === 'Data Privacy')[0]
      const tncTerm = this.tncData.termsAndConditions.filter(term => term.name === 'Generic T&C')[0]
      if (locale === tncTerm.language) {
        return
      }
      if (this.isPublic) {
        this.tncPublicSvc.getPublicTnc(locale).subscribe(data => {
          this.assignTncData(dpData, data)
        })
      } else {
        // this.tncProtectedSvc.getTnc(locale).subscribe(data => {
        //   this.assignTncData(dpData, data)
        // })
      }
    }
  }
  private assignTncData(dpData: NsTnc.ITncUnit, data: NsTnc.ITnc) {
    data.termsAndConditions[1] = { ...dpData }
    if (this.tncData) {
      this.tncData = {
        ...data,
      }
    }
  }

  getDp(locale: string) {
    let tncData: NsTnc.ITncUnit
    if (this.tncData) {
      tncData = this.tncData.termsAndConditions.filter(term => term.name === 'Generic T&C')[0]
      const dpTerm = this.tncData.termsAndConditions.filter(term => term.name === 'Data Privacy')[0]
      if (locale === dpTerm.language) {
        return
      }
      if (this.isPublic) {
        this.tncPublicSvc.getPublicTnc(locale).subscribe(data => {
          this.assignDp(tncData, data)
        })
      } else {
        // this.tncProtectedSvc.getTnc(locale).subscribe(data => {
        //   this.assignDp(tncData, data)
        // })
      }
    }
  }
  assignDp(tncData: NsTnc.ITncUnit, data: NsTnc.ITnc) {
    data.termsAndConditions[0] = tncData
    if (this.tncData) {
      this.tncData = {
        ...data,
      }
    }
  }

  // async gotoLogin() {
  //   try {
  //     const url = `${document.baseURI}public/home`
  //     const keycloakurl = `${document.baseURI}auth/realms/sunbird/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(url)}`
  //     window.location.href = keycloakurl
  //     await this.http.get('/apis/proxies/v8/logout/user').toPromise()
  //     sessionStorage.clear()
  //     localStorage.removeItem('preferedLanguage')
  //     localStorage.removeItem('telemetrySessionId')
  //     localStorage.removeItem('loginbtn')
  //     localStorage.removeItem('url_before_login')
  //     localStorage.removeItem('tocData')
  //     localStorage.removeItem(`userUUID`)
  //   } catch (error) { }
  // }

  async gotoLogin() {
    this.configSvc.userDetails = null;
    this.configSvc.userProfile = null;
    this.generateInteractTelemetry('decline-clicked')
    this.appGlobalService.resetSavedQuizContent();
    this.logOut();
    return '';
  }


  async logOut() {
    this.userHomeSvc.resetUserProfile()
    await this.localStorageService.deleteAllStorage()
    localStorage.removeItem('isOnlyPassbook')
    sessionStorage.clear()
    this.authService.resignSession()
    this.configSvc.userDetails = null
    this.cdr.markForCheck();
    this.CompetencyConfigService.clearConfig()
    setTimeout(() => {
      this.events.publish('triggerPublicLoginEvent');
    }, 2000);
    this.router.navigate([RouterLinks.PUBLIC_HOME]);

  }

  private constructReq(form: any) {
    const userObject = form.value
    Object.keys(userObject).forEach(key => {
      if (userObject[key] === '') {
        delete userObject[key]
      }
    })
    if (this.configSvc.userDetails) {
      this.userId = this.configSvc.userDetails.userId || ''
    }
    const profileReq = {
      profileReq: {
        id: this.userId,
        userId: this.userId,
        personalDetails: userObject,
      },
    }
    return profileReq
  }

  acceptTnc() {
    this.generateInteractTelemetry('accept-TNC')
    if (this.tncData) {
      const generalTnc = this.tncData.termsAndConditions.filter(
        tncUnit => tncUnit.name === 'Generic T&C',
      )[0]
      const dataPrivacy = this.tncData.termsAndConditions.filter(
        tncUnit => tncUnit.name === 'Data Privacy',
      )[0]
      const termsAccepted: NsTnc.ITermAccepted[] = []
      if (generalTnc) {
        termsAccepted.push({
          acceptedLanguage: generalTnc.language,
          docName: generalTnc.name,
          version: generalTnc.version,
        })
      }
      if (dataPrivacy) {
        termsAccepted.push({
          acceptedLanguage: dataPrivacy.language,
          docName: dataPrivacy.name,
          version: dataPrivacy.version,
        })
      }
      this.isAcceptInProgress = true

      this.createUserForm.controls.tncAccepted.setValue('true')
      if (this.configSvc.userDetails) {
        this.userId = this.configSvc.userDetails.userId || ''
        this.createUserForm.controls.primaryEmail.setValue(this.configSvc.userDetails.email || '')
        this.createUserForm.controls.firstname.setValue(this.configSvc.userDetails.firstName || '')
        this.createUserForm.controls.surname.setValue(this.configSvc.userDetails.lastName || '')
        this.createUserForm.controls.regNurseRegMidwifeNumber.setValue('[NA]')
      }
      let Obj: any
      // if (localStorage.getItem('preferedLanguage')) {
      //   let data: any
      //   let lang: any
      //   data = localStorage.getItem('preferedLanguage')
      //   lang = JSON.parse(data)
      //   lang = lang !== 'en' ? lang : ''
      //   Obj = {
      //     preferences: {
      //       language: lang,
      //     },
      //   }
      // }

      /* this changes for ebhyass*/
      // if (this.userData && this.userData.tcStatus === 'false') {
      if (this.userData && ( !this.userData.tcStatus || (this.userData.tcStatus && this.userData.tcStatus === 'false')) ){
        
        const reqUpdate = {
          request: {
            userId: this.userId,
            profileDetails: {
              ...this.userData.profileDetails,
              ...Obj,
              profileLocation: `${this.appFramework}/new-tnc`,
              profileReq: {
                ...this.userData.profileDetails?.profileReq,
                personalDetails: {
                  ...this.userData.profileDetails?.profileReq?.personalDetails,
                  profileLocation: `${this.appFramework}/new-tnc`,
                },
              },
            },
            tcStatus: 'true',
          },
        };
        
        this.updateUser(reqUpdate)

      } else {
        const profileRequest = this.constructReq(this.createUserForm)
        const reqUpdate = {
          request: {
            userId: this.userId,
            profileDetails: {
              ...profileRequest,
              ...Obj,
              personalDetails: {
                ...profileRequest?.profileReq?.personalDetails,
                profileLocation: `${this.appFramework}/new-tnc`
              }
            }
          },
        }
        this.updateUser(reqUpdate)
      }

    } else {
      this.errorInAccepting = false
    }
  }

  updateUser(reqUpdate: any) {
    this.commonUtilService.addLoader()
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(data => {
      this.commonUtilService.removeLoader()
      if (data) {
        this.configSvc.profileDetailsStatus = true
        this.configSvc.hasAcceptedTnc = true
        if (this.result.tncStatus) {
          if (this.configSvc.unMappedUser) {
            this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).pipe(delay(100), mergeMap((userData: any) => {
              return of(userData)
            })).subscribe((userDetails: any) => {
              if (userDetails.profileDetails.profileReq.personalDetails.dob === undefined) {

                if (localStorage.getItem('url_before_login')) {
                  const courseUrl = localStorage.getItem('url_before_login')
                  this.router.navigate(['/app/about-you'], { queryParams: { redirect: courseUrl } })
                } else {
                  // location.href = '/page/home'
                  this.navigateToPrivatHome(data)
                }
              } else {
                if (userDetails.profileDetails.profileReq.personalDetails.dob) {
                  // location.href = '/page/home'
                  this.navigateToPrivatHome(data)
                }
                location.href = localStorage.getItem('url_before_login') || ''
              }
            })
          }
        } else {
          // location.href = '/page/home'
          // if (this.appFramework === 'Ekshamata') {
          //   this.navigatToShowVideo(data)
          // } else {
          //   this.navigateToPrivatHome(data)
          // }
          this.navigateToPrivatHome(data)
        }
      }
    },
      (err: any) => {
        this.loggerSvc.error('ERROR ACCEPTING TNC:', err)
        this.errorInAccepting = true
        this.isAcceptInProgress = false
      },
    )
  }

  async navigateToPrivatHome(data) {
    const session = await this.authService.getSession().toPromise();
    this.commonUtilService.addLoader()
    this.userProfileSvc.getUserdetailsFromRegistry(session.userToken).subscribe((res) => {
      this.userProfileSvc.updateProfileData(res);

      if (this.appFramework === 'Ekshamata') {
        this.navigatToShowVideo(data)
      } else {
        this.router.navigateByUrl('/page/home')
      }
      // this.router.navigateByUrl('/page/home')
    })
  }

  async navigatToShowVideo(data) {
    const session = await this.authService.getSession().toPromise();
    this.commonUtilService.addLoader()
    this.userProfileSvc.getUserdetailsFromRegistry(session.userToken).subscribe((res) => {
      this.userProfileSvc.updateProfileData(res)

      let videoLink = this.orgName.startVideo;

      // if(!_.isNil(videoLink)){
      //   this.router.navigate(['/how-it-works'],  { queryParams: { videoLink } })
      // }else{
      //   this.router.navigateByUrl('/page/home')
      // }
      this.router.navigateByUrl('/page/home');
     
    })
  }

  async getOrgName() {
    this.currentOrgId = this.configSvc.userProfile?.rootOrgId;
    // this.currentOrgId = "0138708679576535041037";
    let res:any = await this.userHomeSvc.getOrgData();
    this.orgName = res.orgNames.find(obj => obj.channelId === this.currentOrgId);
  }

  manageTNCDetails(status) {
    this.showTNCDetails = status;
  }

  changeEvent(event) {
    if (event.detail.checked) {
      this.isChecked = true;
    } else {
      this.isChecked = false;
    }
  }


  async detectFramework() {
    try {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
      console.log("nav", this.appFramework)

    } catch (error) {
      // console.log('error while getting packagename')
    }

  }

  generateInteractTelemetry(action) {
    const telemetryObject = new TelemetryObject(this.appFramework, 'app-name', '');
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      action,
      Environment.CREATE_ACCOUNT,
      PageId.TERMS_N_CONDITIONS,
      telemetryObject
    )
  }
}
