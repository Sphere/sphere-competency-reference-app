/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { MatSidenav } from "@angular/material/sidenav";
import { interval, Subject, Subscription } from "rxjs";
import { map, takeUntil, first } from "rxjs/operators";
import { NSQuiz } from "./quiz.model";
import { QuestionComponent } from "./components/question/question.component";
import { SubmitQuizDialogComponent } from "./components/submit-quiz-dialog/submit-quiz-dialog.component";
import { OnConnectionBindInfo } from "jsplumb";
import { QuizService } from "./quiz.service";
export type FetchStatus = "hasMore" | "fetching" | "done" | "error" | "none";
import { ViewerUtilService } from "./../../viewer-util.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AssesmentOverviewComponent } from "./components/assesment-overview/assesment-overview.component";
import { AssesmentModalComponent } from "./components/assesment-modal/assesment-modal.component";
import { AssesmentCloseModalComponent } from "./components/assesment-close-modal/assesment-close-modal.component";
import { CloseQuizModalComponent } from "./components/close-quiz-modal/close-quiz-modal.component";
import * as _ from "lodash";
import { QuizModalComponent } from "./components/quiz-modal/quiz-modal.component";
import { ViewerDataService } from "../../viewer-data.service";
import { PlayerStateService } from "../../player-state.service";
import { ConfirmmodalComponent } from "./confirm-modal-component";
import moment from "moment";
import { TranslateService } from "@ngx-translate/core";
import { EventService } from "../../../../../../../library/ws-widget/utils/src/lib/services/event.service";
import { WidgetContentService } from "../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service";
import { ConfigurationsService } from "../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service";
import { LoggerService } from "../../../../../../../library/ws-widget/utils/src/lib/services/logger.service";
import { ContentCorodovaService } from "../../../../../../../library/ws-widget/collection/src/lib/_services/content-corodova.service";
import { NsContent } from "../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model";
import { CompleteCoursesModalComponent } from "./components/complete-courses-modal/complete-courses-modal.component";
import { AudioService } from "../../../../../../../app/modules/home/services/audio.service";

@Component({
  selector: "viewer-plugin-quiz",
  templateUrl: "./quiz.component.html",
  styleUrls: ["./quiz.component.scss"],
})
export class QuizComponent implements OnInit, OnChanges, OnDestroy {
  [x: string]: any;

  @Input() identifier = "";
  @Input() artifactUrl = "";
  @Input() name = "";
  @Input() learningObjective = "";
  @Input() complexityLevel = "";
  @Input() duration = 0;
  @Input() collectionId = "";
  @Input() viewStateChange: boolean | undefined;
  @Input() progressStatus = "";
  @Input() quizJson = {
    timeLimit: 0,
    questions: [
      {
        multiSelection: false,
        question: "",
        questionId: "",
        options: [
          {
            optionId: "",
            text: "",
            isCorrect: false,
          },
        ],
      },
    ],
    isAssessment: false,
    passPercentage: 60,
  };
  @ViewChildren("questionsReference")
  questionsReference: QueryList<QuestionComponent> | null = null;
  @ViewChild("sidenav", { static: false }) sideNav: MatSidenav | null = null;
  @ViewChild("submitModal", { static: false }) submitModal: ElementRef | null =
    null;
  currentQuestionIndex = 0;
  currentTheme = "";
  fetchingResultsStatus: FetchStatus = "none";
  isCompleted = false;
  isIdeal = false;
  isSubmitted = false;
  markedQuestions = new Set([]);
  numCorrectAnswers = 0;
  numIncorrectAnswers = 0;
  numUnanswered = 0;
  passPercentage = 0;
  questionAnswerHash: { [questionId: string]: string[] } = {};
  result = 0;
  sidenavMode = "";
  sidenavOpenDefault = false;
  startTime = 0;
  submissionState: NSQuiz.TQuizSubmissionState = "unanswered";
  telemetrySubscription: Subscription | null = null;
  timeLeft = 0;
  timerSubscription: Subscription | null = null;
  viewState: NSQuiz.TQuizViewMode = "initial";
  paramSubscription: Subscription | null = null;
  public dialogOverview: any;
  public dialogAssesment: any;
  public dialogQuiz: any;
  showCompletionMsg = false;
  private isAshaSubscription: Subscription;
  private isCurrentcardDataSubscribe: Subscription;
  enrolledCourse: any;
  isAsha = false;
  /*
   * to unsubscribe the observable
   */
  public unsubscribe = new Subject<void>();
  constructor(
    private events: EventService,
    public dialog: MatDialog,
    private quizSvc: QuizService,
    private viewerSvc: ViewerUtilService,
    public route: ActivatedRoute,
    public location: Location,
    public viewerDataSvc: ViewerDataService,
    public playerStateService: PlayerStateService,
    public router: Router,
    private contentSvc: WidgetContentService,
    private loggerSvc: LoggerService,
    private configSvc: ConfigurationsService,
    private translate: TranslateService,
    private cordovasvc: ContentCorodovaService,
    private audioService: AudioService
  ) {}

  ngOnInit() {}
  async openOverviewDialog() {
    let overviewData: any = {};
    overviewData = {
      learningObjective: this.learningObjective,
      complexityLevel: this.complexityLevel,
      duration: this.duration,
      timeLimit: this.quizJson.timeLimit,
      noOfQuestions: this.quizJson.questions.length,
      progressStatus: this.progressStatus,
      isNqocnContent: this.isNqocnContent,
      isAssessment: _.get(this.quizJson, "isAssessment"),
      subtitle: this.name,
      passPercentage:
        this.quizJson && this.quizJson.hasOwnProperty("passPercentage")
          ? this.quizJson.passPercentage
          : 60,
    };
    this.dialogOverview = this.dialog.open(AssesmentOverviewComponent, {
      width: "542px",
      panelClass: "overview-modal",
      backdropClass: "custom-backdrop",
      disableClose: true,
      data: overviewData,
    });

    this.dialogOverview.afterClosed().subscribe((result: any) => {
      if (result.event === "close-overview") {
        if (result.competency) {
          this.router.navigate([`/app/user/competency`]);
        } else if (result.asha) {
          this.router.navigate([`page/home`]);
        } else {
          this.playerStateService.playerState
            .pipe(first(), takeUntil(this.unsubscribe))
            .subscribe((data: any) => {
              if (_.isNull(data.nextResource)) {
                this.router.navigate(
                  [`/app/toc/${this.collectionId}/overview`],
                  {
                    queryParams: {
                      primaryCategory: "Course",
                      batchId: this.route.snapshot.queryParams.batchId,
                    },
                  }
                );
                // this.router.navigate([data.prevResource], {queryParamsHandling: 'preserve'})
              } else {
                if (_.isNull(data.prevResource)) {
                  if (this.viewerDataSvc.gatingEnabled) {
                    if (data.currentCompletionPercentage === 100) {
                      this.router.navigate([data.nextResource], {
                        queryParamsHandling: "preserve",
                      });
                    } else {
                      this.router.navigate(
                        [`/app/toc/${this.collectionId}/overview`],
                        {
                          queryParams: {
                            primaryCategory: "Course",
                            batchId: this.route.snapshot.queryParams.batchId,
                          },
                        }
                      );
                    }
                  } else {
                    this.router.navigate([data.nextResource], {
                      queryParamsHandling: "preserve",
                    });
                  }
                } else {
                  if (this.viewerDataSvc.gatingEnabled) {
                    if (data.currentCompletionPercentage === 100) {
                      this.router.navigate([data.nextResource], {
                        queryParamsHandling: "preserve",
                      });
                    } else {
                      this.router.navigate(
                        [`/app/toc/${this.collectionId}/overview`],
                        {
                          queryParams: {
                            primaryCategory: "Course",
                            batchId: this.route.snapshot.queryParams.batchId,
                          },
                        }
                      );
                    }
                  } else {
                    this.router.navigate([data.nextResource], {
                      queryParamsHandling: "preserve",
                    });
                  }
                  // this.router.navigate([data.prevResource], {queryParamsHandling: 'preserve'})
                }
              }
              return;
            });
        }
      } else {
        // this.startQuiz()
        if (_.get(this.quizJson, "isAssessment")) {
          this.openAssesmentDialog();
        } else {
          this.openQuizDialog();
        }
      }
    });
  }

  scroll(qIndex: number) {
    if (!this.sidenavOpenDefault) {
      if (this.sideNav) {
        this.sideNav.close();
      }
    }
    const questionElement = document.getElementById(`question${qIndex}`);
    if (questionElement) {
      questionElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.viewState === "initial") {
      setTimeout(() => {
        this.openOverviewDialog();
      }, 500);
    }
    this.viewerSvc.castResource.subscribe((content: any) => {
      if (content && content.type === "Assessment") {
        this.viewState = "initial";
      }
    });
    if (this.viewStateChange) {
      this.viewState = "initial";
    }
    for (const change in changes) {
      if (change === "quiz") {
        if (this.quizJson && this.quizJson.timeLimit) {
          this.quizJson.timeLimit *= 1000;
        }
      }
    }
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.telemetrySubscription) {
      this.telemetrySubscription.unsubscribe();
    }
    this.unsubscribe.complete();

    this.startTime = 0;
    this.timeLeft = 0;

    if (this.isAshaSubscription) {
      this.isAshaSubscription.unsubscribe();
    }

    if (this.isCurrentcardDataSubscribe) {
      this.isCurrentcardDataSubscribe.unsubscribe();
    }
  }

  openAssesmentDialog() {
    this.dialogAssesment = this.dialog.open(AssesmentModalComponent, {
      id: "assessmentModel",
      panelClass: "assesment-modal",
      disableClose: true,
      data: {
        questions: this.quizJson,
        generalData: {
          identifier: this.identifier,
          artifactUrl: this.artifactUrl,
          name: this.name,
          collectionId: this.collectionId,
        },
      },
    });
    this.dialogAssesment.afterClosed().subscribe((result: any) => {
      if (result) {
        if (result.event === "NEXT_COMPETENCY" && result.competency) {
          this.nextCompetency();
        }
        if (result.event === "FAILED_COMPETENCY") {
          this.router.navigate([`/app/user/competency`]);
        }
        if (result.event === "VIEW_COURSES") {
          this.viewCompetencyCourses(result);
        }

        if (result.event === "FAILED_ASHA") {
          this.router.navigate([`page/home`]);
        }

        if (result.event === "VIEW_ASHA_COURSES") {
          this.navigateToAshaCourses(result);
          // this.viewCompetencyCourses(result)
        }

        if (result.event === "CLOSE") {
          if (result.competency) {
            this.router.navigate([`/app/user/competency`]);
          } else if (result.asha) {
            this.router.navigate([`page/home`]);
          } else {
            this.closeBtnDialog();
          }
        }

        if (result.event === "RETAKE_QUIZ") {
          this.openOverviewDialog();
        } else if (result.event === "DONE") {
          let userId;
          if (this.configSvc.userProfile) {
            // tslint:disable-next-line
            userId = this.configSvc.userProfile.userId || "";
          }
          if (navigator.onLine) {
            this.contentSvc.fetchUserBatchList(userId).subscribe(
              async (courses: NsContent.ICourse[]) => {
                if (this.collectionId) {
                  if (courses && courses.length) {
                    this.enrolledCourse = await courses.find((course) => {
                      const identifier = this.collectionId || "";
                      if (course.courseId !== identifier) {
                        return undefined;
                      }
                      return course;
                    });
                  }
                  // tslint:disable-next-line:no-console
                  // console.log(this.enrolledCourse)
                  // if (this.enrolledCourse != null) {
                  const customerDate = moment(this.enrolledCourse.completedOn);
                  const dateNow = moment(new Date());
                  const duration = moment.duration(dateNow.diff(customerDate));
                  const dilogData = {
                    courseId: this.collectionId,
                  };
                  // tslint:disable-next-line
                  //if (this.enrolledCourse && this.enrolledCourse.completionPercentage! < 100) {
                  if (this.enrolledCourse && duration.asMinutes() <= 0.5) {
                    this.showCompletionMsg = true;
                  } else {
                    this.showCompletionMsg = false;
                  }
                  // }
                  this.playerStateService.playerState
                    .pipe(first(), takeUntil(this.unsubscribe))
                    .subscribe((data: any) => {
                      if (
                        _.isEmpty(data.nextResource) ||
                        _.isNull(data.nextResource)
                      ) {
                        // tslint:disable-next-line
                        if (
                          !_.get(
                            this.activatedRoute,
                            "snapshot.queryParams.competency",
                            false
                          )
                        ) {
                          if (
                            this.enrolledCourse &&
                            this.enrolledCourse!.completionPercentage === 100 &&
                            this.contentSvc.showConformation
                          ) {
                            this.updateAsha(100);
                            const confirmdialog = this.dialog.open(
                              ConfirmmodalComponent,
                              {
                                id: "confirmModal",
                                // width: '542px',
                                panelClass: "overview-modal",
                                disableClose: true,
                                data: {
                                  request: dilogData,
                                  message: this.translate.instant(
                                    "CONGRATULATIONS_COMPLETED_COURSE"
                                  ),
                                },
                              }
                            );
                            confirmdialog
                              .afterClosed()
                              .subscribe((res: any) => {
                                if (res.event === "CONFIRMED") {
                                  if (this.isAsha == true) {
                                    console.log("asha true in confirm modal");
                                    this.openAshaModal();
                                    // this.router.navigate([`page/home`])
                                  } else {
                                    this.router.navigate(
                                      [
                                        `/app/toc/${this.collectionId}/overview`,
                                      ],
                                      {
                                        queryParams: {
                                          primaryCategory: "Course",
                                          batchId:
                                            this.route.snapshot.queryParams
                                              .batchId,
                                        },
                                      }
                                    );
                                  }
                                }
                              });
                          } else {
                            this.updateAsha(100);
                            if (this.isAsha == true) {
                              this.openAshaModal();
                              // this.router.navigate([`page/home`])
                            } else {
                              this.router.navigate(
                                [`/app/toc/${this.collectionId}/overview`],
                                {
                                  queryParams: {
                                    primaryCategory: "Course",
                                    batchId:
                                      this.route.snapshot.queryParams.batchId,
                                  },
                                }
                              );
                            }
                          }
                        }

                        // this.router.navigate([data.prevResource], {queryParamsHandling: 'preserve'})
                      } else {
                        this.router.navigate([data.nextResource], {
                          queryParamsHandling: "preserve",
                        });
                      }
                      return;
                    });
                }
              },
              (error: any) => {
                this.loggerSvc.error("CONTENT HISTORY FETCH ERROR >", error);
              }
            );
          } else {
            this.playerStateService.playerState
              .pipe(first(), takeUntil(this.unsubscribe))
              .subscribe(async (data: any) => {
                const filterContent: any =
                  await this.viewerSvc.getFilteredContent(
                    this.identifier,
                    this.route.snapshot.queryParams.collectionId
                  );
                if (
                  filterContent.filteredContent.length > 0 &&
                  filterContent.filteredContent[0].completionPercentage
                ) {
                  this.contentSvc.changeMessage({
                    type: "assessment",
                    progressData: filterContent.mockResponse,
                  });
                  if (
                    !_.isNull(data.nextResource) ||
                    !_.isEmpty(data.nextResource)
                  ) {
                    this.router.navigate([data.nextResource], {
                      queryParamsHandling: "preserve",
                    });
                  }
                }
              });
          }
        }
      }
    });
  }

  async openAshaModal() {
    let currentAshaCardData = this.cordovasvc.getAshaCardData();
    let currentAshaData = this.cordovasvc.getAshaData();
    this.cordovasvc.isAsha$.subscribe((value) => {
      console.log("updated value", value);
      currentAshaData = value;
    });
    let openDilogRef = this.dialog.getDialogById("confirmModal");
    let assessmentModelOpen = this.dialog.getDialogById("assessmentModel");
   // iterate over each courses 

   const currentLevel = Number(currentAshaData.competencylevel);
   const currentCourse = JSON.stringify(
     currentAshaCardData.levels.find(l => Number(l.level) === currentLevel)?.course
   );

   let nextLevel = currentLevel + 1;
   let nextData = false;

   // Loop through next levels to find a level with a different course
   while (nextLevel <= 5) {
     const nextLevelData = currentAshaCardData.levels.find(l => Number(l.level) === nextLevel);
     if (!nextLevelData) break;

     const nextCourse = JSON.stringify(nextLevelData.course);

     if (nextCourse !== currentCourse) {
       nextData = true;
       break;
     }

     nextLevel++;
   }
    // let nextData = Number(currentAshaData.competencylevel) !== 5;
    console.log("nextData", nextData, nextLevel);
    if (assessmentModelOpen) {
      openDilogRef.close();
    }
    if (openDilogRef) {
      openDilogRef.close();
    }
    console.log("updated value", currentAshaData);
    const ashaCourses = this.dialog.open(CompleteCoursesModalComponent, {
      id: "completeCoursesModal",
      width: '542px',
      panelClass: "assesment-modal",
      disableClose: true,
      data: {
        navigateNextCourse: nextData,
        competencyId: currentAshaData.competencyid,
        competencyLevel: currentAshaData.competencylevel,
        currentAshaCardData: currentAshaCardData,
        nextLevelId: nextLevel
      },
    });
    ashaCourses.afterClosed().subscribe(async (res: any) => {
      if (res && res.event === "CLOSE") {
        this.dialog.closeAll();
        await this.audioService.stopAllAudio()
        this.router.navigate([`page/home`]);
      }
      if (res && res.event === "STARTNEXTCOURSE") {
        await this.audioService.stopAllAudio()
        this.navigateToNextAshaCourses(currentAshaCardData, res);
        // navigate to next course overview page
      }
    });
  }

  navigateToNextAshaCourses(currentAshaCardData, data) {
    let nextCourseId;
    const nextLevelId = Number(data.nextLevelId); 
    const competencyId = Number(data.competencyId);
    const currentLang = currentAshaCardData.lang;

    if (competencyId && nextLevelId) {
      const nextLevel = currentAshaCardData.levels.find(
        (level: any) =>
          level.competencyId === competencyId &&
          Number(level.level) === nextLevelId
      );

      if (nextLevel) {
        const course = nextLevel.course.find(
          (c: any) => c.lang === currentLang
        );
        nextCourseId = course ? course.id : null;
      }
    }

    const req = {
      request: {
        filters: {
          // "competencySearch": [`${data.competencyId}-${data.competencyLevel}`],
          primaryCategory: ["Course"],
          contentType: ["Course"],
          status: ["Live"],
          identifier: nextCourseId || "",
        },
        sort_by: {
          lastUpdatedOn: "desc",
        },
      },
      sort: [
        {
          lastUpdatedOn: "desc",
        },
      ],
    };

    this.cordovasvc.getAshaCompetencyCorses(req).subscribe((res) => {
      console.log(res.result.content[0]);
      const navigationdata = res.result.content[0];
      let batchId = navigationdata.batches[0]?.batchId;
      let ashaData = {
        isAsha: true,
        userid: this.configSvc.userProfile.userId || "",
        batchid: batchId,
        contentid: navigationdata.identifier,
        competencylevel:nextLevelId,
        completionpercentage: 0,
        progress: "course",
        competencyid: competencyId
      };

      this.cordovasvc.setAshaData(ashaData);
      this.router.navigate([`/app/toc/${navigationdata.identifier}/overview`], {
        queryParams: {
          primaryCategory: "course",
          batchId: batchId,
          competencyid: competencyId,
          levelId: nextLevelId,
          courseid: navigationdata.identifier,
          isAsha: true,
        },
      });
    });
  }

  navigateToAshaCourses(data) {
    let currentData;
    let navigationdata;

    currentData = this.cordovasvc.getAshaCardData();
    console.log("Is ASHA card:", currentData);

    if (data.competencyId && data.competencyLevel) {
      let identifier: any = this.getCourseId(
        data.competencyId,
        data.competencyLevel,
        currentData
      );
      const req = {
        request: {
          filters: {
            // "competencySearch": [`${data.competencyId}-${data.competencyLevel}`],
            primaryCategory: ["Course"],
            contentType: ["Course"],
            status: ["Live"],
            identifier: identifier || "",
          },
          sort_by: {
            lastUpdatedOn: "desc",
          },
        },
        sort: [
          {
            lastUpdatedOn: "desc",
          },
        ],
      };

      this.cordovasvc.getAshaCompetencyCorses(req).subscribe((res) => {
        console.log(res.result.content[0]);
        // navigationdata = this.getNavigationData(res.result.content, data.competencyLevel, data, currentData)
        const navigationdata = res.result.content[0];
        let batchId = navigationdata.batches[0].batchId;

        let ashaData = {
          isAsha: true,
          userid: this.configSvc.userProfile.userId || "",
          batchid: batchId,
          contentid: navigationdata.identifier,
          competencylevel: data.competencyLevel,
          completionpercentage: 0,
          progress: "course",
          competencyid: data.competencyId,
        };

        this.cordovasvc.setAshaData(ashaData);

        this.router.navigate(
          [`/app/toc/${navigationdata.identifier}/overview`],
          {
            queryParams: {
              primaryCategory: "course",
              batchId: batchId,
              competencyid: data.competencyId,
              levelId: data.competencyLevel,
              courseid: data.courseid,
              isAsha: true,
            },
          }
        );
      });
    }
  }

  getCourseId(
    competencyId: string,
    levelId: string,
    ashaData: any
  ): string | null {
    // Extract the language from the ashaData
    const language = ashaData.lang;

    // Iterate over the levels in the ashaData
    for (const level of ashaData.levels) {
      // Check if the competencyId and levelId match
      if (
        level.competencyId.toString() == competencyId &&
        level.level == levelId
      ) {
        // Iterate over the courses in the matched level
        for (const course of level.course) {
          // Check if the course language matches the input language (ashaData.lang)
          if (course.lang == language) {
            return course.id; // Return the matched course ID
          }
        }
      }
    }

    // If no match is found, return null
    return null;
  }

  getNavigationData(res, levelId, data, currentData) {
    console.log("Input data:", res); // Debugging the input array
    // const matchedContent = res.find(content => {
    //   // Ensure ashaData and its properties exist
    //   if (!currentData.levels || !currentData.lang) {
    //     console.error("ashaData or ashaData properties are undefined.");
    //     return false;
    //   }

    //   return currentData.levels.some(level => {
    //     // Ensure levelId and course data are correct
    //     if (level.level == levelId) {
    //       return level.course.some(course => {
    //         // Ensure course id and content identifier match (same type)
    //         const courseIdMatches = course.id == content.identifier;
    //         const languageMatches = content.lang == currentData.lang;
    //         if (courseIdMatches && languageMatches) {
    //           return true; // Found a match
    //         }else{
    //           if (courseIdMatches) {
    //             return true; // Found a match with courseId only
    //         }
    //         }
    //         return false; // No match for this course
    //       });
    //     }
    //     return false; // Level does not match
    //   });
    // });

    let matchedContent = null;
    if (!currentData.levels || !currentData.lang) {
      console.error("ashaData or ashaData properties are undefined.");
    } else {
      // Iterate through each content in res
      matchedContent = res.find((content) => {
        // Iterate through all levels in ashaData
        for (let level of currentData.levels) {
          if (level.level == levelId) {
            // Iterate through all courses in the level
            for (let course of level.course) {
              const courseIdMatches = course.id === content.identifier;
              const languageMatches = content.lang === currentData.lang;

              console.log(
                "Checking course:",
                course.id,
                content.identifier,
                content.lang,
                currentData.lang
              );

              // First priority: Check if both courseIdMatches and languageMatches are true
              if (courseIdMatches && languageMatches) {
                console.log("Both matched:", course.id, content.identifier);
                matchedContent = content; // Found a match with both conditions
                return true; // Return immediately as we've found the desired match
              }
            }
          }
        }

        // If no match was found, look for courseIdMatches condition alone
        for (let level of currentData.levels) {
          if (level.level == levelId) {
            for (let course of level.course) {
              const courseIdMatches = course.id === content.identifier;
              if (courseIdMatches) {
                console.log(
                  "Only courseIdMatches:",
                  course.id,
                  content.identifier
                );
                matchedContent = content; // Found a match for courseIdMatches alone
                return true; // Return immediately as we've found the match
              }
            }
          }
        }

        return false; // No match for this content
      });
    }

    // Check if a match was found
    if (matchedContent) {
      console.log("Matched content:", matchedContent);
    } else {
      console.log("No match found for levelId:", levelId);
    }

    return matchedContent;
  }

  nextCompetency() {
    // // console.log("next competency")
    this.viewState = "answer";
    this.playerStateService.playerState
      .pipe(first(), takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        // console.log("next", data.nextResource)
        if (_.isNull(data.nextResource)) {
          // tslint:disable-next-line
          // if (!_.get(this.activatedRoute, 'snapshot.queryParams.competency', true)) {
          // if (this.enrolledCourse && this.enrolledCourse!.completionPercentage === 100) {
          //   const confirmdialog = this.dialog.open(ConfirmmodalComponent, {
          //     // width: '542px',
          //     // panelClass: 'overview-modal',
          //     disableClose: true,
          //     data: 'Congratulations!, you have completed the course',
          //   })
          //   confirmdialog.afterClosed().subscribe((res: any) => {
          //     if (res.event === 'CONFIRMED') {
          //       this.router.navigate([`/app/user/competency`])
          //     }
          //   })
          // } else {
          this.router.navigate([`/app/user/competency`]);
          // }
          // }
        } else {
          this.router.navigate([data.nextResource], {
            queryParamsHandling: "preserve",
          });
          this.viewerSvc.competencyAsessment$.subscribe((res) => {
            // console.log('nextCompetency', res)
            if (res) {
              this.dialogRef.closeAll();
              setTimeout(() => {
                this.openOverviewDialog();
              }, 500);
              // this.viewerSvc.competencyAsessment.complete()
              // this.viewerSvc.competencyAsessment.next(false)
              // this.viewerSvc.competencyAsessment.unsubscribe()
            }
          });
        }
        return;
      });
  }

  viewCompetencyCourses(data: any) {
    if (data.competencyId && data.competencyLevel) {
      this.router.navigate(["/app/search"], {
        queryParams: {
          q: [`${data.competencyId}-${data.competencyLevel}`],
          competency: true,
        },
        queryParamsHandling: "merge",
      });
    }
  }

  /*open quiz dialog*/
  openQuizDialog() {
    this.dialogQuiz = this.dialog.open(QuizModalComponent, {
      panelClass: "quiz-modal",
      disableClose: true,
      data: {
        questions: this.quizJson,
        generalData: {
          identifier: this.identifier,
          artifactUrl: this.artifactUrl,
          name: this.name,
          collectionId: this.collectionId,
        },
      },
    });
    this.dialogQuiz.afterClosed().subscribe((result: any) => {
      if (result) {
        if (result.event === "CLOSE") {
          this.closeQuizBtnDialog(result.event);
        }

        if (result.event === "RETAKE_QUIZ") {
          // this.openOverviewDialog(result.event)
          this.closeQuizBtnDialog(result.event);
        } else if (result.event === "DONE") {
          let userId;
          if (this.configSvc.userProfile) {
            userId = this.configSvc.userProfile.userId || "";
          }
          if (navigator.onLine) {
            this.fetchUserBatchListAndHandleCompletion(
              userId,
              this.collectionId
            );
          } else {
            this.handlePlayerState();
          }
        }
      }
    });
  }

  public async fetchUserBatchListAndHandleCompletion(
    userId: string,
    collectionId: string | undefined
  ) {
    try {
      const courses: NsContent.ICourse[] = await this.contentSvc
        .fetchUserBatchList(userId)
        .toPromise();
      if (collectionId && courses && courses.length) {
        const enrolledCourse = courses.find(
          (course) => course.courseId === collectionId
        );
        if (enrolledCourse) {
          const customerDate = moment(enrolledCourse.completedOn);
          const dateNow = moment();
          const duration = moment.duration(dateNow.diff(customerDate));

          this.showCompletionMsg =
            enrolledCourse.completionPercentage !== undefined &&
            duration.asMinutes() <= 0.5;
        }
      }
      this.handlePlayerState();
    } catch (error) {
      this.loggerSvc.error("CONTENT HISTORY FETCH ERROR >", error);
    }
  }

  public handlePlayerState() {
    this.playerStateService.playerState
      .pipe(first(), takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        if (_.isNull(data.nextResource)) {
          if (
            !_.get(
              this.activatedRoute,
              "snapshot.queryParams.competency",
              false
            )
          ) {
            this.showConfirmmodalDialog();
          }
        } else {
          this.router.navigate([data.nextResource], {
            queryParamsHandling: "preserve",
          });
        }
      });
  }

  updateAsha(competedPercentage) {
    let ashaData = this.cordovasvc.getAshaData();

    // this.isAshaSubscription = this.cordovasvc.isAsha$.subscribe((value) => {
    console.log("Is ASHA:", ashaData);
    if (ashaData.isAsha == true) {
      this.isAsha = true;
      let req = {
        userid: ashaData.userid,
        courseid: ashaData.courseid,
        batchid: this.route.snapshot.queryParams.batchId,
        contentid: ashaData.contentid,
        competencylevel: ashaData.competencylevel,
        completionpercentage: competedPercentage,
        contentType: "course",
        competencyid: ashaData.competencyid || "",
      };
      console.log("req ", req);
      this.quizSvc.updateAshaAssessment(req).subscribe(
        (res) => {
          console.log("after update res", res);
        },
        (err) => {
          console.log("after update err", err);
        }
      );
    } else {
      this.isAsha = false;
    }

    // });
  }
  showConfirmmodalDialog() {
    console.log("opening the funtion confirm modal");
    const data = {
      courseId: this.collectionId,
    };
    if (
      this.enrolledCourse &&
      this.enrolledCourse!.completionPercentage === 100 &&
      this.contentSvc.showConformation
    ) {
      this.updateAsha(100);
      const confirmdialog = this.dialog.open(ConfirmmodalComponent, {
        id: "confirmModal",
        width: "542px",
        panelClass: "overview-modal",
        disableClose: true,
        data: {
          request: data,
          message: this.translate.instant("CONGRATULATIONS_COMPLETED_COURSE"),
        },
      });
      confirmdialog.afterClosed().subscribe((res: any) => {
        console.log("closed the modal", res);
        if (res.event === "CONFIRMED") {
          this.dialog.closeAll();
          if (this.isAsha == true) {
            console.log("asha true in confirm modal");
            this.openAshaModal();
            // this.router.navigate([`page/home`])
          } else {
            this.router.navigate([`/app/toc/${this.collectionId}/overview`], {
              queryParams: {
                primaryCategory: "Course",
                batchId: this.route.snapshot.queryParams.batchId,
              },
            });
          }
        }
      });
    } else {
      this.updateAsha(100);
      if (this.isAsha == true) {
        this.openAshaModal();
        // this.router.navigate([`page/home`])
      } else {
        this.router.navigate([`/app/toc/${this.collectionId}/overview`], {
          queryParams: {
            primaryCategory: "Course",
            batchId: this.route.snapshot.queryParams.batchId,
          },
        });
      }
    }
  }

  closeQuizBtnDialog(event: String) {
    const dialogRef = this.dialog.open(CloseQuizModalComponent, {
      panelClass: "assesment-close-modal",
      disableClose: true,
      data: {
        type: event,
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result.event === "CLOSE") {
        dialogRef.close();
        this.dialog.closeAll();
        this.playerStateService.playerState
          .pipe(first(), takeUntil(this.unsubscribe))
          .subscribe((data: any) => {
            if (!_.isNull(data.prevResource)) {
              this.router.navigate([data.prevResource], {
                queryParamsHandling: "preserve",
              });
            }
            return;
          });
      } else if (result.event === "NO") {
        this.openQuizDialog();
      } else if (result.event === "RETAKE_QUIZ") {
        this.openOverviewDialog();
      }
    });
  }
  closeBtnDialog() {
    const dialogRef = this.dialog.open(AssesmentCloseModalComponent, {
      panelClass: "assesment-close-modal",
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result.event === "CLOSE") {
        dialogRef.close();
        this.dialog.closeAll();
        this.playerStateService.playerState
          .pipe(first(), takeUntil(this.unsubscribe))
          .subscribe((data: any) => {
            if (!_.isNull(data.prevResource)) {
              this.router.navigate([data.prevResource], {
                queryParamsHandling: "preserve",
              });
            }

            return;
          });
      } else if (result.event === "NO") {
        this.openOverviewDialog();
      }
    });
  }

  overViewed(event: NSQuiz.TUserSelectionType) {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (event === "start") {
      this.startQuiz();
    } else if (event === "skip") {
      // alert('skip quiz TBI')
    }
  }

  startQuiz() {
    this.sidenavOpenDefault = true;
    setTimeout(() => {
      this.sidenavOpenDefault = false;
    }, 500);
    this.viewState = "attempt";
    this.startTime = Date.now();
    this.markedQuestions = new Set([]);
    this.questionAnswerHash = {};
    this.currentQuestionIndex = 0;
    this.timeLeft = this.quizJson.timeLimit;
    if (this.quizJson.timeLimit > -1) {
      this.timerSubscription = interval(100)
        .pipe(map(() => this.startTime + this.quizJson.timeLimit - Date.now()))
        .subscribe((_timeRemaining) => {
          this.timeLeft -= 0.1;
          if (this.timeLeft < 0) {
            this.isIdeal = true;
            this.timeLeft = 0;
            if (this.timerSubscription) {
              this.timerSubscription.unsubscribe();
            }
            this.submitQuiz();
          }
        });
    }
  }
  reTakeQuiz() {
    this.startQuiz();
  }
  fillSelectedItems(question: NSQuiz.IQuestion, optionId: string) {
    this.raiseTelemetry("mark", optionId, "click");
    if (this.viewState === "answer") {
      if (this.questionsReference) {
        this.questionsReference.forEach((questionReference) => {
          questionReference.reset();
        });
      }
    }
    this.viewState = "attempt";
    if (
      this.questionAnswerHash[question.questionId] &&
      question.multiSelection
    ) {
      const questionIndex =
        this.questionAnswerHash[question.questionId].indexOf(optionId);
      if (questionIndex === -1) {
        this.questionAnswerHash[question.questionId].push(optionId);
      } else {
        this.questionAnswerHash[question.questionId].splice(questionIndex, 1);
      }
      if (!this.questionAnswerHash[question.questionId].length) {
        delete this.questionAnswerHash[question.questionId];
      }
    } else {
      this.questionAnswerHash[question.questionId] = [optionId];
    }
  }

  proceedToSubmit() {
    if (this.timeLeft) {
      if (
        Object.keys(this.questionAnswerHash).length !==
        this.quizJson.questions.length
      ) {
        this.submissionState = "unanswered";
      } else if (this.markedQuestions.size) {
        this.submissionState = "marked";
      } else {
        this.submissionState = "answered";
      }
      const dialogRef = this.dialog.open(SubmitQuizDialogComponent, {
        width: "250px",
        data: this.submissionState,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.submitQuiz();
        }
      });
    }
  }

  submitQuiz() {
    this.raiseTelemetry("quiz", null, "submit");
    this.isSubmitted = true;
    this.ngOnDestroy();
    if (!this.quizJson.isAssessment) {
      this.viewState = "review";
      this.calculateResults();
    } else {
      this.viewState = "answer";
    }
    const submitQuizJson = JSON.parse(JSON.stringify(this.quizJson));
    this.fetchingResultsStatus = "fetching";
    const requestData: NSQuiz.IQuizSubmitRequest =
      this.quizSvc.createAssessmentSubmitRequest(
        this.identifier,
        this.name,
        {
          ...submitQuizJson,
          timeLimit: this.quizJson.timeLimit * 1000,
        },
        this.questionAnswerHash
      );
    const sanitizedRequestData: NSQuiz.IQuizSubmitRequest =
      this.quizSvc.sanitizeAssessmentSubmitRequest(requestData);
    sanitizedRequestData["artifactUrl"] = this.artifactUrl;
    sanitizedRequestData["contentId"] = this.identifier;
    sanitizedRequestData["courseId"] = this.collectionId;
    sanitizedRequestData["batchId"] = this.route.snapshot.queryParams.batchId;
    sanitizedRequestData["userId"] = localStorage.getItem("userUUID");
    this.quizSvc.submitQuizV2(sanitizedRequestData).subscribe(
      (res: NSQuiz.IQuizSubmitResponse) => {
        window.scrollTo(0, 0);
        if (this.quizJson.isAssessment) {
          this.isIdeal = true;
        }
        this.fetchingResultsStatus = "done";
        this.numCorrectAnswers = res.correct;
        this.numIncorrectAnswers = res.inCorrect;
        this.numUnanswered = res.blank;
        this.passPercentage =
          this.collectionId === "lex_auth_0131241730330624000"
            ? 70
            : res.passPercent; // NQOCN Course ID
        this.result = res.result;
        if (this.result >= this.passPercentage) {
          this.isCompleted = true;
        }
        // const result = {
        //   result: (this.numCorrectAnswers * 100.0) / this.processedContent.quiz.questions.length,
        //   total: this.processedContent.quiz.questions.length,
        //   blank: res.blank,
        //   correct: res.correct,
        //   inCorrect: res.inCorrect,
        //   passPercentage: res.passPercent,
        // }
        // this.quizSvc.firePlayerTelemetryEvent(
        //   this.processedContent.content.identifier,
        //   this.collectionId,
        //   MIME_TYPE.quiz,
        //   result,
        //   this.isCompleted,
        //   'DONE',
        //   this.isIdeal,
        //   true,
        // )
      },
      (_error: any) => {
        this.fetchingResultsStatus = "error";
      }
    );
    // this.fetchingResultsStatus = 'done'
  }

  showAnswers() {
    this.showMtfAnswers();
    this.showFitbAnswers();
    this.viewState = "answer";
  }

  showMtfAnswers() {
    if (this.questionsReference) {
      this.questionsReference.forEach((questionReference) => {
        questionReference.matchShowAnswer();
      });
    }
  }

  showFitbAnswers() {
    if (this.questionsReference) {
      this.questionsReference.forEach((questionReference) => {
        questionReference.functionChangeBlankBorder();
      });
    }
  }

  calculateResults() {
    const correctAnswers = this.quizJson.questions.map(
      (question: NSQuiz.IQuestion) => {
        return {
          questionType: question.questionType,
          questionId: question.questionId,
          correctOptions: question.options
            .filter((option) => option.isCorrect)
            .map((option) =>
              question.questionType === "fitb" ? option.text : option.optionId
            ),
          correctMtfOptions: question.options
            .filter((option) => option.isCorrect)
            .map((option) =>
              question.questionType === "mtf" ? option : undefined
            ),
        };
      }
    );
    // logger.log(correctAnswers);
    this.numCorrectAnswers = 0;
    this.numIncorrectAnswers = 0;
    correctAnswers.forEach((answer) => {
      const correctOptions = answer.correctOptions;
      const correctMtfOptions = answer.correctMtfOptions;
      let selectedOptions: any =
        this.questionAnswerHash[answer.questionId] || [];
      if (
        answer.questionType === "fitb" &&
        this.questionAnswerHash[answer.questionId] &&
        this.questionAnswerHash[answer.questionId][0]
      ) {
        selectedOptions =
          this.questionAnswerHash[answer.questionId][0].split(",") || [];
        let correctFlag = true;
        let unTouched = false;
        if (selectedOptions.length < 1) {
          unTouched = true;
        }
        if (correctOptions.length !== selectedOptions.length) {
          correctFlag = false;
        }
        if (correctFlag && !unTouched) {
          for (let i = 0; i < correctOptions.length; i += 1) {
            if (
              correctOptions[i].trim().toLowerCase() !==
              selectedOptions[i].trim().toLowerCase()
            ) {
              correctFlag = false;
            }
          }
        }
        if (correctFlag && !unTouched) {
          this.numCorrectAnswers += 1;
        } else if (!unTouched) {
          this.numIncorrectAnswers += 1;
        }
        this.showFitbAnswers();
      } else if (answer.questionType === "mtf") {
        let unTouched = false;
        let correctFlag = true;
        if (selectedOptions.length < 1 || selectedOptions[0].length < 1) {
          unTouched = true;
        } else if (selectedOptions[0].length < correctMtfOptions.length) {
          correctFlag = false;
        }
        if (selectedOptions && selectedOptions[0]) {
          // logger.log(selectedOptions)
          // logger.log(correctOptions)
          (selectedOptions[0] as any[]).forEach((element) => {
            const b = element.sourceId;
            if (correctMtfOptions) {
              const option = correctMtfOptions[(b.slice(-1) as number) - 1] || {
                match: "",
              };
              const match = option.match;
              if (match && match.trim() === element.target.innerHTML.trim()) {
                element.setPaintStyle({
                  stroke: "#357a38",
                });
                this.setBorderColor(element, "#357a38");
              } else {
                element.setPaintStyle({
                  stroke: "#f44336",
                });
                correctFlag = false;
                this.setBorderColor(element, "#f44336");
              }
            }
          });
        }
        if (correctFlag && !unTouched) {
          this.numCorrectAnswers += 1;
        } else if (!unTouched) {
          this.numIncorrectAnswers += 1;
        }
      } else {
        if (
          correctOptions.sort().join(",") === selectedOptions.sort().join(",")
        ) {
          this.numCorrectAnswers += 1;
        } else if (selectedOptions.length > 0) {
          this.numIncorrectAnswers += 1;
        }
      }
    });
    this.numUnanswered =
      this.quizJson.questions.length -
      this.numCorrectAnswers -
      this.numIncorrectAnswers;
  }

  setBorderColor(connection: OnConnectionBindInfo, color: string) {
    const connectionSourceId = document.getElementById(connection.sourceId);
    const connectionTargetId = document.getElementById(connection.targetId);
    if (connectionSourceId) {
      connectionSourceId.style.borderColor = color;
    }
    if (connectionTargetId) {
      connectionTargetId.style.borderColor = color;
    }
  }

  isQuestionAttempted(questionId: string): boolean {
    return !(Object.keys(this.questionAnswerHash).indexOf(questionId) === -1);
  }

  isQuestionMarked(questionId: string) {
    return this.markedQuestions.has(questionId as unknown as never);
  }

  markQuestion(questionId: string) {
    if (this.markedQuestions.has(questionId as unknown as never)) {
      this.markedQuestions.delete(questionId as unknown as never);
    } else {
      this.markedQuestions.add(questionId as unknown as never);
    }
  }

  raiseTelemetry(action: string, optionId: string | null, event: string) {
    if (optionId) {
      this.events.raiseInteractTelemetry(action, event, {
        optionId,
      });
    } else {
      this.events.raiseInteractTelemetry(action, event, {
        contentId: this.identifier,
      });
    }
  }
}
