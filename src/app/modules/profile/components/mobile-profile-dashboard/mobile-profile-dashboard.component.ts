import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router';
import { ValueService } from '../../../../../library/ws-widget/utils/src/lib/services/value.service';
import { LogoutComponent } from '../../../../../library/ws-widget/utils/src/lib/helpers/logout/logout.component';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { WidgetContentService } from '../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service'
import { IUserProfileDetailsFromRegistry } from '@ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '@ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { constructReq } from '../request-util'
import { LocalStorageService } from '../../../../../app/manage-learn/core'
import { storageKeys } from '../../../../../app/manage-learn/storageKeys'
import { AppFrameworkDetectorService } from '../../../../../app/modules/core/services/app-framework-detector-service.service'
import { buildConfig } from '../../../../../../configurations/configuration'
import { RouterLinks } from '../../../../../app/app.constant'
import { UserService } from '../../../../modules/home/services/user.service';
import { MobileAboutPopupComponent } from "../mobile-about-popup/mobile-about-popup.component";
import { forkJoin, from } from "rxjs";
import * as _ from "lodash";
import { DomSanitizer } from "@angular/platform-browser";
import { map, mergeMap } from "rxjs/operators";
import { CommonUtilService, Environment, InteractSubtype, InteractType, PageId, TelemetryGeneratorService } from "../../../../../services";

@Component({
  selector: "ws-mobile-profile-dashboard",
  templateUrl: "./mobile-profile-dashboard.component.html",
  styleUrls: ["./mobile-profile-dashboard.component.scss"],
})
export class MobileProfileDashboardComponent implements OnInit {
  firstName: string
  lastName: string
  showMobileView = false
  showAcademicElse = false
  loader = false
  userProfileData!: IUserProfileDetailsFromRegistry
  academicsArray: any[] = []
  certificates: any = []
  imgURI: any = []
  certificateThumbnail: any = []
  photoUrl: any
  image = 'https://'+buildConfig.SITEPATH+'/fusion-assets/icons/prof1.png'
  showbackButton = false
  showLogOutIcon = false
  profileData: any
  navigateTohome = true
  sessionData: any
  languagePage: any
  isDownload = false
  isCertificates = false
  appFramework: any
  showUptuLogo = false
  showSupport: boolean = true
  currentOrgId: string
  constructor(
    private configSvc: ConfigurationsService,
    private router: Router,
    public dialog: MatDialog,
    private userProfileSvc: UserProfileService,
    private contentSvc: WidgetContentService,
    private valueSvc: ValueService,
    private commonUtilService: CommonUtilService,
    private localStorage: LocalStorageService,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private userHomeSvc: UserService,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
    this.commonUtilService.removeLoader();
    this.getUserDetails();
  }

  ngOnInit() {
    this.userProfileSvc.updateuser$.pipe().subscribe((item) => {
      if (item) {
        this.getUserDetails();
      }
    });
    this.fetchProfile();

    this.valueSvc.isXSmall$.subscribe((isXSmall) => {
      if (isXSmall) {
        this.showbackButton = true;
        this.showLogOutIcon = true;
      } else {
        this.showbackButton = false;
        this.showLogOutIcon = false;
      }
    });

    this.detectFramework();
    // this.CompetencyConfiService.setConfig(this.profileData)
  }

  fetchProfile() {
    this.userProfileSvc
      .getUserdetailsFromRegistry(this.configSvc.unMappedUser.id)
      .subscribe((_res: any) => {
        this.commonUtilService.removeLoader();
        this.profileData = _res.profileDetails.profileReq;
        this.setAcademicDetail(_res);
      });
    this.contentSvc
      .fetchUserBatchList(this.configSvc.unMappedUser.id)
      .subscribe();
  }
  async detectFramework() {
    try {
      this.appFramework =
        await this.appFrameworkDetectorService.detectAppFramework();
      if (this.appFramework === "Ekshamata") {
        this.showUptuLogo = true;
        this.showSupport = false;
      }
    } catch (error) {
      // console.log('error while getting packagename')
    }
  }
  /* navigate to download course page */
  navigateToDownloadCourse() {
    this.commonUtilService.addLoader();
    this.generateInteractTelemetry('download-course');
    this.router.navigate([`app/download-course`]);
  }

  navigateToLearnerObservation() {
    // this.commonUtilService.addLoader()
    this.generateInteractTelemetry('learnere-observation');
    this.router.navigate([`app/learnere-observation`]);
  }
  navigateToCertificate() {
    this.commonUtilService.addLoader();
    this.generateInteractTelemetry('certificate-list');
    this.router.navigate([`app/certificate-list`]);
  }

  // processCertiFicate(data: any) {

  //   const certificateIdArray = _.map(_.flatten(_.filter(_.map(data, 'issuedCertificates'), certificate => {
  //     return certificate.length > 0
  //   })), 'identifier')
  //   this.formateRequest(data)
  //   from(certificateIdArray).pipe(
  //     map(certId => {
  //       this.certificateThumbnail.push({ identifier: certId })
  //       return certId
  //     }),
  //     mergeMap(certId =>
  //       this.contentSvc.getCertificateAPI(certId)
  //     )
  //   ).subscribe(() => {
  //     setTimeout(() => {
  //       this.contentSvc.updateValue$.subscribe((res: any) => {
  //         if (res) {
  //           _.forEach(this.certificates, cvalue => {
  //             if (res[cvalue.identifier]) {
  //               cvalue['image'] = this.domSanitizer.bypassSecurityTrustUrl(res[cvalue.identifier])
  //               cvalue['printUri'] = res[cvalue.identifier]
  //             }
  //           })
  //         }
  //       })
  //     }, 500)
  //   })

  // }

  // formateRequest(data: any) {
  //   const issuedCertificates = _.reduce(_.flatten(_.filter(_.map(data, 'issuedCertificates'), certificate => {
  //     return certificate.length > 0
  //   })), (result: any, value) => {
  //     result.push({
  //       identifier: value.identifier,
  //       name: value.name,
  //     })
  //     return result
  //   }, [])
  //   this.certificates = issuedCertificates
  // }

  // openAboutDialog() {
  //   const dialogRef = this.dialog.open(MobileAboutPopupComponent, {
  //     width: '312px',
  //     height: '369px',
  //     data: this.userProfileData.personalDetails.about ? this.userProfileData.personalDetails.about : '',
  //   })

  //   dialogRef.afterClosed().subscribe(result => {
  //     // tslint:disable-next-line: no-console
  //     // console.log('The dialog was closed', result)
  //   })
  // }

  setAcademicDetail(data: any) {
    if (_.get(data, "profileDetails.profileReq")) {
      this.userProfileData = data.profileDetails.profileReq;
      if (_.get(this.userProfileData, "personalDetails")) {
        this.photoUrl = this.userProfileData.personalDetails.photo;
      } else {
        this.photoUrl = this.userProfileData.photo;
      }

      if (
        this.userProfileData.academics &&
        Array.isArray(this.userProfileData.academics)
      ) {
        this.academicsArray = this.userProfileData.academics;
      }
    }
  }
  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc
        .getUserdetailsFromRegistry(this.configSvc.unMappedUser.id)
        .subscribe((data: any) => {
          if (data) {
            this.commonUtilService.removeLoader();
            this.userProfileData = data.profileDetails.profileReq;
            if (
              this.userProfileData &&
              this.userProfileData.academics &&
              Array.isArray(this.userProfileData.academics)
            ) {
              this.academicsArray = this.userProfileData.academics;
            }
            if (_.get(this.userProfileData, "personalDetails.photo")) {
              this.photoUrl = this.userProfileData.personalDetails.photo;
            }
            if (this.userProfileData?.personalDetails.firstname) {
              this.firstName = this.userProfileData?.personalDetails.firstname;
              this.lastName = this.userProfileData?.personalDetails.surname;
            } else {
              this.firstName = this.configSvc.userProfile.firstName;
              this.lastName = this.configSvc.userProfile.lastName;
            }
          }
        });
    }
  }

  eductionEdit() {
    this.commonUtilService.addLoader();
    this.generateInteractTelemetry('academic-details');
    if (this.userProfileData?.personalDetails?.dob === undefined) {
      this.router.navigate(["/app/about-you"], {
        queryParams: { redirect: `app/education-list` },
      });
    } else {
      this.router.navigate([`app/education-list`]);
    }
    // this.router.navigate([`app/education-list`])
  }

  workInfoEdit() {
    this.commonUtilService.addLoader();
    this.generateInteractTelemetry('organization-details');
    if (this.userProfileData?.personalDetails?.dob === undefined) {
      this.router.navigate(["/app/about-you"], {
        queryParams: { redirect: `app/organization-list` },
      });
    } else {
      this.router.navigate([`app/organization-list`]);
    }
  }

  navigateToPassbook() {
    localStorage.setItem("isOnlyPassbook", "true");
    this.generateInteractTelemetry('passbook');
    this.router.navigate(["/app/passbook"]);
  }

  personalDetailEdit() {
    this.commonUtilService.addLoader();
    this.generateInteractTelemetry('profile-details');
    if (this.userProfileData?.personalDetails?.dob === undefined) {
      this.router.navigate(["/app/about-you"], {
        queryParams: { redirect: `app/personal-detail-list` },
      });
    } else {
      this.router.navigate([`app/personal-detail-list`]);
    }
  }

  // openCompetency(event: any) {
  //   this.router.navigate([`app/user/self-assessment`])
  // }
  // openCompetencyDashboard(event: any) {
  //   this.router.navigate([`app/user/competency`])
  // }

  logout() {
    this.dialog.open<LogoutComponent>(LogoutComponent);
    this.generateInteractTelemetry('logout');
  }

  setLanguage() {
    this.showbackButton = false;
    this.languagePage = true;
  }

  hideLanguagePage(event: boolean) {
    this.languagePage = !event;
  }

  selectLanguage(event: any) {
    if (this.configSvc.userProfile) {
      let userId = this.configSvc.userProfile.userId;
      const preferences = {
        language: event,
      };
      let reqUpdate;
      if (this.userProfileData && this.userProfileData.academics && this.userProfileData.professionalDetails) {
        const constructedProfile = Object.assign(
          constructReq({}, this.userProfileData)
        );
        (
          constructedProfile.profileReq.personalDetails as any
        ).profileLocation = `${this.appFramework}/language-update`;

        reqUpdate = {
          request: {
            userId: userId,
            profileDetails: {
              preferences,
              profileLocation: `${this.appFramework}/language-update`, 
              profileReq: constructedProfile.profileReq, 
          }
          },
        };
      } else {
        reqUpdate = {
          request: {
            userId: userId,
            profileDetails: {
              ...preferences, 
              profileReq: {
                userId: userId,
              },
              profileLocation: `${this.appFramework}/language-update`,
          },
            tcStatus: "true",
          },
        };
      }
      this.userProfileSvc
        .updateProfileDetails(reqUpdate)
        .pipe(
          mergeMap((res: any) => {
            return this.userProfileSvc.getUserdetailsFromRegistry(userId);
          })
        )
        .subscribe(async (res) => {
          this.localStorage.setLocalStorage(storageKeys.userProfile, res);
          await this.userProfileSvc.updateProfileData(res);
          this.commonUtilService.updateAppLanguage(event);
          this.router.navigate([`/page/home`]);
        });
    }
  }

  async redirectToHelpWidget() {
    this.generateInteractTelemetry("help");
    if (this.appFramework === "Sphere") {
      this.router.navigate([RouterLinks.GET_HELP]);
      return;
    }

    this.currentOrgId = this.configSvc.userProfile.rootOrgId;
    try {
      const orgData: any = await this.userHomeSvc.getOrgData();
      const orgName = orgData.orgNames.find(
        (obj) => obj.channelId === this.currentOrgId
      );

      let phoneNum = orgName
        ? orgName.phone || "tel:0000 000 0000"
        : "tel:0000 000 0000";

      if (this.appFramework === "Ekshamata") {
        window.open(phoneNum);
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
    }
  }
  notificationSetting(){
    this.router.navigate([`app/notification-setting`]);
  }
  generateInteractTelemetry(status) {
    const value = new Map();
    value["appFramework"] = this.appFramework;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      status ? `${status}-clicked` :InteractSubtype.HELP_SECTION_CLICKED,
      status || Environment.FAQ,
      PageId.PROFILE
    )
  }
}
