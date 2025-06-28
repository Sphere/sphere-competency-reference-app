import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { forkJoin, of, Subscription } from 'rxjs'
import { ContentCorodovaService } from '../../../../../library/ws-widget/collection/src/lib/_services/content-corodova.service'
import { WidgetUserService } from '../../../../../library/ws-widget/collection/src/lib/_services/widget-user.service'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import * as _ from 'lodash-es'
import publicConfig from '../../../../../assets/configurations/mobile-home.json';
import { UserService } from '../../services/user.service'
import { AuthService } from '@project-sunbird/sunbird-sdk'
import { CommonUtilService, Environment, ErrorType, PageId, TelemetryGeneratorService } from '../../../../../services'
import { RouterLinks } from '../../../../../app/app.constant'
import { ConfigService as CompetencyConfiService } from '../../../../../app/competency/services/config.service'
import { DomSanitizer } from '@angular/platform-browser'
import { OverlayContainer } from '@angular/cdk/overlay'
import { Events } from '../../../../../util/events'
import { catchError, debounceTime, filter, map, mergeMap, scan, switchMap, tap } from 'rxjs/operators'
import { MatDialog } from '@angular/material/dialog'
import { MatMenuTrigger } from '@angular/material/menu'
import { VideoPopupComponent } from '../../../../../app/modules/shared/components/how-does-it-works-popup/how-does-it-works-popup.component'
import { AudioService } from '../../services/audio.service'
import { API_END_POINTS_S3 } from 'app/apiConstants'
// import * as competencyHomeData from '../../../../../assets/configurations/biharorg.config.json'
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: "ws-mobile-dashboard",
  templateUrl: "./mobile-dashboard.component.html",
  styleUrls: ["./mobile-dashboard.component.scss"],
})
export class MobileDashboardComponent implements OnInit {
  @Input() role;
  @Input() designation;
  showBackMentee = false;
  myCourse: any;
  topCertifiedCourse: any = [];
  featuredCourse: any = [];
  forYouCourses: any = [];
  userEnrollCourse: any;
  videoData: any;
  homeFeatureData: any;
  homeFeature: any;
  userId: any;
  firstName: any;
  topCertifiedCourseIdentifier: any = [];
  featuredCourseIdentifier: any = [];

  latestCourseIndex = 0;
  defaultLang: any = "en";
  displayConfig = {
    displayType: "card-badges",
    showCompetency: true,
    badges: {
      orgIcon: true,
      certification: false,
    },
  };
  displayConfigContinue = {
    displayType: "card-small",
    showProgress: true,
    showCompetency: false,
    showSourceName: true,
    badges: {
      orgIcon: true,
      certification: true,
    },
  };
  appName = "Ekshamata";
  roleSelected: any = "learner";
  forYouCount = 0;

  @ViewChild("menuTrigger") menuTrigger: ElementRef;
  @ViewChild("scrollToCneCourses", { static: false })
  scrollToCneCourses!: ElementRef;
  isMenuOpen: boolean = false;
  currentOrgId: string;
  orgName: any;
  videoLink: any;
  requiredSourceName: string[] = [];
  departmentDefaultLang = "en";
  private subscription: Subscription;
  roleCompetencyData;
  roleBasedCompetency: any;
  ashaData: any = [];

  competencyHomeData: any;
  competencyLevelsData: any[];
  showanmHome = false;
  isTablet = false;
  completedCourses: any[] = [];
  inProgressCourses: any[] = [];
  showAllCourses = false;
  @ViewChild('firstCard', { read: ElementRef }) firstCardRef: ElementRef;
  constructor(
    private configSvc: ConfigurationsService,
    private userSvc: WidgetUserService,
    private ContentSvc: ContentCorodovaService,
    private router: Router,
    private userHomeSvc: UserService,
    @Inject("AUTH_SERVICE") public authService: AuthService,
    private commonUtilService: CommonUtilService,
    private CompetencyConfiService: CompetencyConfiService,
    private sanitizer: DomSanitizer,
    private overlayContainer: OverlayContainer,
    private events: Events,
    public dialog: MatDialog,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
    this.commonUtilService.removeLoader();
    if (localStorage.getItem("orgValue") === "nhsrc") {
      this.router.navigateByUrl("/organisations/home");
    }
  }

  async ngOnInit() {
    this.checkDialogOpen();
    this.isTablet = await this.commonUtilService.isTablet();
    // this.fetchCompetencyData()
    this.competencyHomeData = await this.userHomeSvc.getCompetencyData();
    console.log("home dtata ************ ", this.competencyHomeData);
    this.roleSelected = await this.userHomeSvc.getActiveRole();
    this.getOrgName();
    this.setHomeContentByAPI();
    this.commonUtilService.addLoader();
    await this.setUserprofile();
    this.initializeUpdateValueSubscription();
    this.getAshaData();
  }

  checkDialogOpen() {
    let openDilogRef = this.dialog.getDialogById("confirmModal");
    let assessmentModelOpen = this.dialog.getDialogById("assessmentModel");
    if (assessmentModelOpen) {
      openDilogRef.close();
    }
    if (openDilogRef) {
      openDilogRef.close();
    }
  }

  async fetchCompetencyData() {
    fetch(API_END_POINTS_S3.COMPETENCY_ORG_DATA)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        this.competencyHomeData = data;
        console.log("home dtata ************ ", this.competencyHomeData);
      })
      .catch((error) => {
        console.error("Error fetching or parsing JSON:", error);
        this.generateErrorTelemetry(error, "home-data");
      });
  }
  initializeUpdateValueSubscription() {
    this.subscription = this.userHomeSvc.updateValue$
      .pipe(
        debounceTime(300), // Debounce the rapid successive emissions
        scan((acc, curr) => ({ prev: acc.curr, curr }), {
          prev: null,
          curr: null,
        }), // Track previous and current values
        filter(({ prev, curr }) => prev !== curr && curr !== null), // Allow only if values are different and not null
        switchMap(({ curr }) => this.handleValueChange(curr)),
        tap(() => this.getAshaData())
      )
      .subscribe(() => {
        this.fetchData();
      });
  }
  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks and redundant API calls
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  handleValueChange(curr: any) {
    if (curr) {
      this.userLanguage(curr);
      return this.fetchForYouCourse().pipe(
        catchError((error) => {
          console.error("Error fetching course recommendation", error);
          return of(null);
        })
      );
    }
    return of(null);
  }

  async getOrgName() {
    if (this.configSvc.userProfile && this.configSvc.userProfile.rootOrgId) {
      this.currentOrgId = this.configSvc.userProfile.rootOrgId;
    }
    if (this.currentOrgId) {
      // this.currentOrgId = "014005962721189888281";
      let res: any = await this.userHomeSvc.getOrgData();
      this.competencyHomeData = await this.userHomeSvc.getCompetencyData();
      console.log("home dtata ************ ", this.competencyHomeData);
      this.orgName = res.orgNames.find(
        (obj) => obj.channelId === this.currentOrgId
      );
      this.showanmHome = this.competencyHomeData[this.currentOrgId]
        ? true
        : false;
      if (this.orgName && this.orgName.startVideo)
        this.videoLink = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.orgName?.startVideo
        );
      else this.videoLink = "";
      this.showanmHome = this.competencyHomeData[this.currentOrgId]
        ? true
        : false;
    } else {
      this.videoLink = "";
    }
  }

  getAshaDataOld() {
    this.roleCompetencyData = [];
    this.competencyLevelsData = [];
    this.userHomeSvc
      .getRoleWiseData()
      .pipe(
        mergeMap((result) => {
          this.roleBasedCompetency = _.find(result.response, {
            position: "GNM",
          });
          if (this.roleBasedCompetency) {
            const competencyIds = _.flatMap(
              this.roleBasedCompetency.competency,
              (item) =>
                _.flatMap(item, (competency) => {
                  console.log(competency.id);
                  this.roleCompetencyData.push(competency.id);
                })
            );
          }
          return of(null); // Return null or an empty value since you're not using this result in the subsequent mergeMap
        }),
        mergeMap(() => {
          if (this.defaultLang) {
            return this.getCompetencyCourse();
          }
          return of(null);
        }),
        // mergeMap((res: any) => {
        //   console.log("self",res)
        //   const assessData = this.formatedCompetencyCourseData(res);
        //   console.log("assess",assessData)
        //   // this.ashaData = this.getCompetencyFilter(assessData);
        //   this.ashaData = assessData

        //   if(this.ashaData.length > 0 ){
        //     let userId = this.userId || this.configSvc.userProfile.userId
        //     return this.userHomeSvc.getAshaProgress(userId).subscribe(
        //       (progressData) => {
        //         if (progressData) {
        //           console.log("Fetched progress data:", progressData);
        //           this.ashaData = this.mergeProgressData(this.ashaData, progressData);
        //           console.log("Merged ASHA DATA", this.ashaData);
        //         } else {
        //           console.log("Progress data is null or empty.");
        //         }
        //       },
        //       (err) => {
        //         console.log("Error fetching ASHA Progress", err);
        //       }
        //     );
        //   }else{

        //     return of(null)
        //   }
        //   return of(null);
        // })
        mergeMap((res: any) => {
          console.log("self", res);
          const assessData = this.formatedCompetencyCourseData(
            res,
            this.competencyLevelsData
          );
          this.ashaData = assessData;
          console.log("assess", assessData);

          if (this.ashaData.length > 0) {
            const userId = this.userId || this.configSvc.userProfile.userId;

            console.log(userId);
            // Subscribing directly to getAshaProgress here
            this.userHomeSvc.getAshaProgress(userId).subscribe(
              (progressData) => {
                if (progressData) {
                  console.log("Fetched progress data:", progressData);
                  this.ashaData = this.mergeProgressData(
                    this.ashaData,
                    progressData.data
                  );
                  console.log("Merged ASHA DATA", this.ashaData);
                } else {
                  console.log("Progress data is null or empty.");
                }
              },
              (err) => {
                console.log("Error fetching ASHA Progress", err);
                this.generateErrorTelemetry(err, "asha-progress");
              }
            );
          } else {
            console.log("No ASHA Data available.");
            return of(null);
          }

          return of(null);
        })
      )
      .subscribe(() => {
        console.log("ASHA DATA", this.ashaData);
      });
  }

  getAshaData() {
    this.roleCompetencyData = [];
    this.competencyLevelsData = [];

    // Check if currentOrgId exists in competencyHomeData and designation is ANM
    console.log("ASSAAAA ", this.currentOrgId, this.designation);
    if (
      this.competencyHomeData[this.currentOrgId] &&
      (this.designation.toLowerCase() === "anm-student-bihar".toLowerCase() ||
        this.designation.toLowerCase() === "anm-faculty-bihar".toLowerCase() ||
        this.designation.toLowerCase() === "anm-bihar".toLowerCase() ||
        this.designation.toLowerCase() === "gnm-bihar".toLowerCase())
    ) {
      const orgData = this.competencyHomeData[this.currentOrgId][this.designation.toUpperCase()] || this.competencyHomeData[this.currentOrgId][
          this.designation.replace(/(?<=-)([A-Z]+)/g, (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase())
        ];

      if (orgData) {
        // Retrieve the competency IDs for ANM position (C1 and C2)
        const competencies = orgData.competency;
        competencies.forEach((competency) => {
          const competencyIds = Object.keys(competency).map(
            (key) => competency[key].id
          );
          console.log("competencyIds", competencyIds);
          this.roleCompetencyData.push(...competencyIds); // Push competency IDs (100, 101) to roleCompetencyData
          console.log("roleCompetencyData", this.roleCompetencyData);

          // Extracting levels details from competencyLevelDescription
          Object.keys(competency).forEach((key) => {
            const competencyInfo = competency[key];
            if (
              competencyInfo.additionalProperties &&
              competencyInfo.additionalProperties.competencyLevelDescription
            ) {
              competencyInfo.additionalProperties.competencyLevelDescription.forEach(
                (level) => {
                  this.competencyLevelsData.push({
                    competencyId: competencyInfo.id,
                    level: level.level,
                    name: level.name,
                    description: level.description,
                    langHiName: level["lang-hi-name"],
                    langHiDescription: level["lang-hi-description"],
                    course: level.course,
                  });
                }
              );
            }
          });
        });

        console.log(
          "Extracted competency levels data:",
          this.competencyLevelsData
        );
      }
    }

    // Continue with the rest of the flow
    of(null)
      .pipe(
        mergeMap(() => {
          if (this.defaultLang) {
            return this.getCompetencyCourse();
          }
          return of(null);
        }),
        mergeMap((res: any) => {
          console.log("self", res);
          const assessData = this.formatedCompetencyCourseData(
            res,
            this.competencyLevelsData
          );
          this.ashaData = this.getCompetencyFilter(assessData);
          console.log("assess", assessData);

          if (this.ashaData.length > 0) {
            const userId = this.userId || this.configSvc.userProfile.userId;

            console.log(userId);
            // Subscribing directly to getAshaProgress here
            this.userHomeSvc.getAshaProgress(userId).subscribe(
              (progressData) => {
                if (progressData) {
                  console.log("Fetched progress data:", progressData);
                  this.ashaData = this.mergeProgressData(
                    this.ashaData,
                    progressData.data
                  );
                  console.log("Merged ASHA DATA", this.ashaData);
                  const { completed, inProgress } =
                    this.partitionCompletedAndInProgress(this.ashaData);
                  console.log("Completed courses:", completed);

                  this.completedCourses = completed;
                  this.inProgressCourses = inProgress;
                  this.inProgressCourses = inProgress.map((course, index) => ({
                    ...course,
                    expand: index === 0,
                  }));
                  console.log("In-progress courses:", this.inProgressCourses);
                } else {
                  console.log("Progress data is null or empty.");
                  console.log("Merged ASHA DATA", this.ashaData);
                  const { completed, inProgress } =
                    this.partitionCompletedAndInProgress(this.ashaData);

                  this.inProgressCourses = inProgress;
                  this.inProgressCourses = inProgress.map((course, index) => ({
                    ...course,
                    expand: index === 0,
                  }));
                  console.log("In-progress courses:", this.inProgressCourses);
                }
              },
              (err) => {
                console.log("Error fetching ASHA Progress", err);
                if (err?.status === 404) {
                  const { completed, inProgress } =
                    this.partitionCompletedAndInProgress(this.ashaData);
                  this.inProgressCourses = inProgress;
                  this.inProgressCourses = inProgress.map((course, index) => ({
                    ...course,
                    expand: index === 0,
                  }));
                } else {
                  const { completed, inProgress } =
                    this.partitionCompletedAndInProgress(this.ashaData);
                  this.inProgressCourses = inProgress;
                  this.inProgressCourses = inProgress.map((course, index) => ({
                    ...course,
                    expand: index === 0,
                  }));
                }
              }
            );
          } else {
            console.log("No ASHA Data available.");
            return of(null);
          }

          return of(null);
        })
      )
      .subscribe(() => {
        console.log("ASHA DATA", this.ashaData);
      });
  }

  mergeProgressData(ashaData: any[], progressData: any[]) {
    // Map progress data by competencyId for quick lookup and grouping by levelId
    const progressMap = new Map<string, any[]>();

    progressData.forEach((progressItem) => {
      const competencyId = progressItem.competencyid;
      const levelId = progressItem.competencylevel;

      if (!progressMap.has(competencyId)) {
        progressMap.set(competencyId, []);
      }

      // Add progress details to the progress array for each competencyId
      progressMap.get(competencyId).push({
        levelId: levelId,
        competencyId: progressItem.competencyid,
        completionpercentage: progressItem.completionpercentage,
        passFailStatus: progressItem.passFailStatus,
        attemptcount: progressItem.attemptcount,
        contentType: progressItem.contentType,
      });
    });

    // Merge progress data into ashaData based on competencyId
    ashaData.forEach((ashaItem) => {
      const competencyId = ashaItem.competencyID;
      const progressArray = progressMap.get(competencyId);

      console.log(`Processing ashaItem with competencyId: ${competencyId}`);
      console.log("Found progress data:", progressArray); // Debug log to confirm progress data exists

      if (progressArray) {
        const uniqueprogressArray = Array.from(
          progressArray
            .reduce((map, item) => {
              const key = `${item.passFailStatus}-${item.competencyId}-${item.levelId}`;
              if (!map.has(key)) {
                map.set(key, item);
              }
              return map;
            }, new Map())
            .values()
        );
        // Assign the grouped progress data to the ashaItem

        ashaItem.progress = uniqueprogressArray;
        console.log("Updated ashaItem with progress:", ashaItem); // Confirm that progress is added
      }
    });

    return ashaData;
  }

  private partitionCompletedAndInProgress(ashaData: any[]): {
    completed: any[];
    inProgress: any[];
  } {
    const [completed, inProgress] = _.partition(ashaData, (course) => {
      const totalLevels = 5; // You can make this dynamic if needed
      const completedLevels =
        course.progress?.filter((p) => p.passFailStatus === "Pass").length || 0;
      const totalPercentage = (completedLevels / totalLevels) * 100;
      return totalPercentage === 100;
    });

    return { completed, inProgress };
  }
  getCompetencyCourse() {
    return this.userHomeSvc.getCompetencyCourseIdentifier(this.defaultLang);
  }

  getCompetencyFilter(data) {
    let result = [];
    // Remove duplicates from roleCompetencyData
    let uniqueRoleCompetencyData = _.uniq(this.roleCompetencyData);
    _.forEach(uniqueRoleCompetencyData, (value) => {
      // console.log("data", value)
      _.forEach(data, (item) => {
        if (item.competencyID == value) {
          result.push(item);
        }
      });
    });
    return result;
  }

  formatedCompetencyCourseData(data: any, competencyLevelsData: any[]) {
    const result = [];
    if (_.get(data, "result")) {
      const content = _.get(data, "result.content");
      if (content) {
        _.forEach(content, (value: any) => {
          let levels;
          const competencyID = this.getCompetencyData(value.competencies_v1);
          if (competencyID) {
            levels = competencyLevelsData.filter((level) =>
              competencyID.includes(level.competencyId)
            );
          }
          // Find matching levels in competencyLevelsData based on competencyID

          result.push({
            title: _.get(value, "name"),
            contentId: _.get(value, "identifier"),
            contentType: _.get(value, "contentType"),
            subTitle: _.get(value, "subTitle"),
            description: _.get(value, "description"),
            creator: _.get(value, "creator"),
            duration: _.get(value, "duration"),
            batchId: this.getBatchData(value),
            childContent: _.get(value, "childNodes").length,
            competencyID: competencyID ? competencyID : "",
            levels: levels ? levels : "",
            isAsha: "true",
            lang: this.defaultLang,
          });
        });
        return result;
      }
    }
  }

  getCompetencyData(competency: any) {
    if (competency) {
      let data = JSON.parse(competency);

      // Ensure data is an array
      if (!Array.isArray(data)) {
        data = [data];
      }

      let transformedData = data.map((item) => {
        return {
          competencyId: item.competencyId.toString(),
          competencyName: item.competencyName.toString(),
        };
      });
      return transformedData[0].competencyId;
    }
  }

  getBatchData(data) {
    let batchId = "";
    if (data.batches) {
      batchId = data.batches[0].batchId;
      //   _.forEach(data.batches, (value:any)=>{
      //     batchId = _.get(value, 'batchId')
      //   })
    }

    return batchId;
  }

  setHomeContentByAPI() {
    this.ContentSvc.getHomeStaticContent().subscribe((_content: any) => {
      if (_content) {
        let res = _content.departments.find(
          (obj) => obj.channelId === this.currentOrgId
        );
        if (res) {
          this.requiredSourceName = res.sourceName;
          this.departmentDefaultLang = res.defaultLanguage
            ? res.defaultLanguage
            : "en";
        } else {
          this.requiredSourceName = ["IHAT", "Others"];
          this.departmentDefaultLang = "en";
        }
        localStorage.setItem("sphereHomeContent", JSON.stringify(_content));
      }
    });
  }

  fetchForYouCourse() {
    const appId = "app.aastrika.ekhamata";
    if (this.configSvc.userProfile.profileData) {
      const professionalDetails = _.get(
        this.configSvc.userProfile.profileData,
        "professionalDetails"
      );
      if (professionalDetails) {
        const designation = professionalDetails[0].designation;
        const forYouRequestData = {
          offset: 0,
          limit: 10,
          appId: appId,
          designation: designation,
        };
        return this.userSvc.fetchCourseRemommendationv(forYouRequestData).pipe(
          switchMap((res) => {
            console.log("for you course", res);
            this.formatmyRecomendedCourse(res);
            return of(res);
          }),
          catchError((error) => {
            console.error("Error fetching course recommendation", error);
            this.generateErrorTelemetry(error, "course-recommendation");
            return of(null);
          })
        );
      }
    }
    return of(null); // Return an observable that emits null if no action is needed
  }

  formatmyRecomendedCourse(courses: any[]) {
    let recomenderCourse: any[] = [];
    if (courses && courses.length > 0) {
      courses.forEach((key) => {
        const myCourseObject = {
          identifier: key.course_id,
          appIcon: key.course_appIcon,
          thumbnail: key.course_thumbnail,
          name: key.course_name,
          sourceName: key.course_sourceName,
          issueCertification: key.course_issueCertification,
          averageRating: key.course_rating,
          competencies_v1: key.competencies_v1,
        };
        recomenderCourse.push(myCourseObject);
      });
    }

    recomenderCourse = _.uniqBy(recomenderCourse, "identifier");
    const forYouCoursesFilter = _.filter(recomenderCourse, (ckey) => {
      return _.includes(this.requiredSourceName, ckey.sourceName);
    });
    this.forYouCourses = forYouCoursesFilter;
    // return { recomenderCourse,  forYouCount: recomenderCourse.length}
  }

  async fetchData() {
    if (this.configSvc.userProfile) {
      if (this.firstName == undefined) {
        this.firstName = this.configSvc.userProfile.firstName;
      }

      this.userId = this.configSvc.userProfile.userId;
      this.CompetencyConfiService.setConfig(this.configSvc.userProfile);
      let courseLanguages = ["en"];
      if (this.departmentDefaultLang != "en") {
        courseLanguages.push(this.departmentDefaultLang);
      }

      const publicConfigJson: any = publicConfig;
      this.homeFeature = publicConfigJson.userLoggedInSection;
      this.topCertifiedCourseIdentifier =
        publicConfigJson.topCertifiedCourseIdentifier;
      this.featuredCourseIdentifier = publicConfigJson.featuredCourseIdentifier;
      const requiredIdentifiers = [
        ...this.topCertifiedCourseIdentifier,
        ...this.featuredCourseIdentifier,
      ];

      forkJoin([this.userSvc.fetchUserBatchList(this.userId)])
        .pipe()
        .subscribe((res: any) => {
          this.formatmyCourseResponse(_.get(res[0], "result.courses"));
          // if (_.get(res[1], 'result.content', []).length > 0) {
          //   let defaultLanCourses = res[1].result.content.filter((_row)=>_row.lang == this.departmentDefaultLang);
          //   if(defaultLanCourses && defaultLanCourses.length>0){
          //     res[1].result.content = defaultLanCourses;
          //   }
          //   this.formatTopCertifiedCourseResponse(res[1])
          //   this.formatFeaturedCourseResponse(res[1])
          // }
        });
    }
    this.commonUtilService.removeLoader();
  }
  userLanguage(res: any) {
    if (res && res.profileDetails) {
      if (_.get(res, "profileDetails.preferences.language")) {
        const code = _.get(res, "profileDetails.preferences.language");
        this.defaultLang = code;
        this.commonUtilService.updateAppLanguage(code);
      }
      if (res.profileDetails.profileReq) {
        this.firstName =
          res.profileDetails.profileReq.personalDetails.firstname;
      }
    }
  }
  formatFeaturedCourseResponse(res: any) {
    const featuredCourse = _.filter(res.result.content, (ckey) => {
      return _.includes(this.featuredCourseIdentifier, ckey.identifier);
    });
    this.featuredCourse = _.reduce(
      _.uniqBy(featuredCourse, "identifier"),
      (result, value) => {
        result["identifier"] = value.identifier;
        result["appIcon"] = value.appIcon;
        result["name"] = value.name;
        return result;
      },
      {}
    );
  }
  async setUserprofile() {
    const session = await this.authService.getSession().toPromise();
    this.userHomeSvc.userRead(session.userToken);
  }

  formatTopCertifiedCourseResponse(res: any) {
    const topCertifiedCourse = _.filter(res.result.content, (ckey) => {
      return _.includes(this.requiredSourceName, ckey.sourceName);
    });
    // Jhpiego
    this.topCertifiedCourse = _.uniqBy(topCertifiedCourse, "identifier");
    this.topCertifiedCourse = this.topCertifiedCourse.slice(0, 10);
  }
  formatmyCourseResponse(res: any) {
    const myCourse: any = [];
    let myCourseObject = {};
    let dateTime = 0;
    _.forEach(res, (key) => {
      // Check if competency exists, if not, assume it's okay to process (e.g., no competency required)
      const competencyExists = _.has(key, "content.competency");
      const competency = competencyExists
        ? _.get(key, "content.competency", false)
        : false; // Default to false if competency is absent
      if (competency === true) {
        return;
      }
      if (key.completionPercentage !== 100) {
        if (dateTime < key.dateTime) {
          dateTime = key.dateTime;
          this.latestCourseIndex = myCourse.length;
        }
        myCourseObject = {
          identifier: key.content.identifier,
          appIcon: key.content.appIcon,
          thumbnail: key.content.thumbnail,
          name: key.content.name,
          dateTime: key.dateTime,
          completionPercentage: key.completionPercentage,
          sourceName: key.content.sourceName,
        };
        myCourse.push(myCourseObject);
      }
    });
    this.userEnrollCourse = myCourse;
  }

  // For opening Course Page
  raiseTelemetry(contentIdentifier: any) {
    this.router.navigateByUrl(`/app/toc/${contentIdentifier}/overview`);
  }

  openIframe(video: any) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        video: video.videoIndex,
      },
    };
    this.router.navigate(["/app/video-player"], navigationExtras);
  }

  async naviagateToviewAllCourse() {
    this.commonUtilService.addLoader();
    //this.router.navigateByUrl(`/${RouterLinks.SEARCH_PAGE}/${RouterLinks.learning}`)
    this.router.navigateByUrl(`/${RouterLinks.MY_COURSES}/for-you`);
  }
  viewAll() {
    const container = document.querySelector(".asha-course-list");
    const firstCard = container?.querySelector("app-asha-learning");
    if (!firstCard) return;
  
    const initialScrollY = window.scrollY;
    const prevFirstCardTop = firstCard.getBoundingClientRect().top;
  
    this.commonUtilService.addLoader();
    this.showAllCourses = !this.showAllCourses;
  
    // Let Angular settle + DOM reflow
    setTimeout(() => {
     
      requestAnimationFrame(() => {
        const newFirstCard = document.querySelector(".asha-course-list app-asha-learning");
        if (!newFirstCard) return;
  
        const newFirstCardTop = newFirstCard.getBoundingClientRect().top;
        const scrollAdjustment = newFirstCardTop - prevFirstCardTop;
        console.log({
          initialScrollY,
          prevFirstCardTop,
          newFirstCardTop,
          scrollAdjustment
        });
        window.scrollTo({
          top: initialScrollY + scrollAdjustment,
          behavior: "auto"
        });
  
        this.commonUtilService.removeLoader();
      });
    }, 500); // Add a small delay to let Angular rendering settle
  }
  
  learner() {
    this.roleSelected = "learner";
    this.userHomeSvc.setRole("learner");
    // this.router.navigate([`${RouterLinks.PRIVATE_HOME}`])
    this.events.publish("updatePrimaryNavBarConfig");
  }

  mentor() {
    this.roleSelected = "mentor";

    this.userHomeSvc.setRole("mentor");

    // this.router.navigate([`${RouterLinks.PRIVATE_HOME}`])
    this.events.publish("updatePrimaryNavBarConfig");
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }

  preventCloseOnClickOut() {
    this.overlayContainer
      .getContainerElement()
      .classList.add("disable-backdrop-click");
    this.overlayContainer
      .getContainerElement()
      .classList.add("blur-background");
    this.isMenuOpen = true;
    document.body.classList.add("blur-background");
    document.body.style.overflow = "hidden";
  }

  allowCloseOnClickOut() {
    this.overlayContainer
      .getContainerElement()
      .classList.remove("disable-backdrop-click");
    this.overlayContainer
      .getContainerElement()
      .classList.remove("blur-background");
    this.isMenuOpen = false;
    document.body.classList.remove("blur-background");
    document.body.style.overflow = "auto";
  }

  closeMenu(menu: MatMenuTrigger): void {
    menu.closeMenu();
  }

  openVideoPopup(data: any) {
    this.dialog.open(VideoPopupComponent, {
      data: { url: this.sanitizer.bypassSecurityTrustResourceUrl(data) },
      panelClass: "youtube-modal",
    });
  }

  generateErrorTelemetry(error: any, status) {
    this.telemetryGeneratorService.generateErrorTelemetry(
      Environment.HOME,
      status,
      ErrorType.SYSTEM,
      PageId.HOME,
      JSON.stringify(error)
    );
  }
}
