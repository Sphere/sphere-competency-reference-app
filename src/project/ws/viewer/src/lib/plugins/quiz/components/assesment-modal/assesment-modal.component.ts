import {
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { interval, Subject, Subscription } from "rxjs";
import { first, map, takeUntil } from "rxjs/operators";
import { FetchStatus } from "../../quiz.component";
import { NSQuiz } from "../../quiz.model";
import { QuizService } from "../../quiz.service";
declare var $: any;
import * as _ from "lodash";
import { ViewerDataService } from "../../../../viewer-data.service";
// import moment from 'moment'
import { ViewerUtilService } from "../../../../viewer-util.service";
import { PlayerStateService } from "../../../../player-state.service";
import { OnlineSqliteService } from "../../../../../../../../../app/modules/shared/services/online-sqlite.service";
import { CourseOptimisticUiService } from "../../../../../../../../../app/modules/shared/services/course-optimistic-ui.service";
import { OfflineCourseOptimisticService } from "../../../../../../../../../app/modules/shared/services/offline-course-optimistic.service";
import { SqliteService } from "../../../../../../../../../app/modules/shared/services/sqlite.service";
import { ValueService } from "../../../../../../../../../library/ws-widget/utils/src/lib/services/value.service";
import { ConfigurationsService } from "../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service";
import { TelemetryService } from "../../../../../../../../../library/ws-widget/utils/src/lib/services/telemetry.service";
import { EnqueueService } from "../../../../../../../../../library/ws-widget/utils/src/lib/services/enqueue.service";
import { WidgetContentService } from "../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service";
import { NsContent } from "../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model";
import {
  CommonUtilService,
  Environment,
  InteractSubtype,
  InteractType,
  Mode,
  PageId,
  TelemetryGeneratorService,
} from "../../../../../../../../../services";
import { Rollup, TelemetryObject } from "sunbird-sdk";
import { AudioService } from "../../../../../../../../../app/modules/home/services/audio.service";

// declare var Telemetry: any
@Component({
  selector: "viewer-assesment-modal",
  templateUrl: "./assesment-modal.component.html",
  styleUrls: ["./assesment-modal.component.scss"],
  // tslint:disable-next-line:use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
})
export class AssesmentModalComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  isXSmall$ = this.valueSvc.isXSmall$;
  showSubmit = false;
  timeLeft = 0;
  startTime = 0;
  tabIndex = 0;
  isIdeal = false;
  totalQuestion = 0;
  activeIndex = 0;
  numCorrectAnswers = 0;
  numIncorrectAnswers = 0;
  numUnanswered = 0;
  passPercentage = 0;
  result = 0;
  progressbarValue = 0;
  isCompleted = false;
  isCompetencyComplted = false;
  fetchingResultsStatus: FetchStatus = "none";
  questionAnswerHash: any = {};
  timerSubscription: Subscription | null = null;
  dialog: any;
  tabActive = false;
  disableNext = false;
  diablePrevious = true;
  assesmentActive = true;
  disableContinue = false;
  isCompetency = false;
  isAshaHome: any = false;
  competencyLevelId = "";
  nextCompetencyLevel = 0;
  proficiencyLevel = "";
  competencyId = "";
  public unsubscribe = new Subject<void>();
  courseID: any;
  progress = 40;
  constructor(
    public dialogRef: MatDialogRef<AssesmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public assesmentdata: any,
    public quizService: QuizService,
    public route: ActivatedRoute,
    private valueSvc: ValueService,
    private snackBar: MatSnackBar,
    public viewerDataSvc: ViewerDataService,
    private configSvc: ConfigurationsService,
    private telemetrySvc: TelemetryService,
    private viewerSvc: ViewerUtilService,
    public playerStateService: PlayerStateService,
    private enqueueService: EnqueueService,
    private contentSvc: WidgetContentService,
    private onlineSqliteService: OnlineSqliteService,
    private courseOptimisticUiService: CourseOptimisticUiService,
    private offlineCourseOptimisticService: OfflineCourseOptimisticService,
    private sqliteService: SqliteService,
    private telemetryGeneraterService: TelemetryGeneratorService,
    private audioService: AudioService,
    private commonutilService: CommonUtilService
  ) {}

  ngOnInit() {
    // Telemetry.impression()
    // Telemetry.start()
    this.telemetrySvc.impression();
    this.timeLeft = this.assesmentdata.questions.timeLimit;
    this.startTime = Date.now();
    this.timer(this.timeLeft);
    this.questionAnswerHash = {};
    this.totalQuestion = Object.keys(
      this.assesmentdata.questions.questions
    ).length;
    // this.progressbarValue = this.totalQuestion
    this.progressbarValue += 100 / this.totalQuestion;
    this.proficiencyLevel = this.assesmentdata.generalData.name
      .replace("Proficency", "Proficiency")
      .split("Proficiency")[1];
    this.isCompetency = this.route.snapshot.queryParams.competency;
    this.isAshaHome = this.route.snapshot.queryParams.isAsha;
  }
  ngAfterViewInit() {
    this.telemetrySvc.start(
      "assessment",
      "assessment-start",
      this.assesmentdata.generalData.identifier
    );
    if (this.assesmentdata.questions.questions[0].questionType === "mtf") {
      this.updateQuestionType(true);
    }
  }
  closePopup() {
    // console.log("close competenct", this.isCompetency)
    if (this.isCompetency) {
      if (this.isAshaHome) {
        this.dialogRef.close({
          event: "CLOSE",
          asha: this.route.snapshot.queryParams.isAsha,
        });
      } else {
        this.dialogRef.close({
          event: "CLOSE",
          competency: this.route.snapshot.queryParams.competency,
        });
      }
    } else {
      this.dialogRef.close({ event: "CLOSE" });
    }
    const data: any = {
      courseID: this.assesmentdata.generalData.collectionId,
      contentId: this.assesmentdata.generalData.identifier,
      name: this.assesmentdata.generalData.name,
      moduleId: this.viewerDataSvc.resource!.parent
        ? this.viewerDataSvc.resource!.parent
        : undefined,
    };

    this.telemetrySvc.start(
      "assessment",
      "assessment-close-start",
      this.assesmentdata.generalData.identifier
    );
    this.telemetrySvc.end(
      "assessment",
      "assessment-close-end",
      this.assesmentdata.generalData.identifier,
      data
    );
  }

  closeDone() {
    this.dialogRef.close({
      event: this.route.snapshot.queryParams.isAsha ? "DONE_ASHA" : "DONE",
      asha: this.route.snapshot.queryParams.isAsha,
    });
  }

  retakeQuiz() {
    this.dialogRef.close({ event: "RETAKE_QUIZ" });
  }
  CompetencyDashboard() {
    this.dialogRef.close({
      event: "FAILED_COMPETENCY",
      competency: this.route.snapshot.queryParams.competency,
    });
  }

  async goToAshaHome() {
    this.dialogRef.close({
      event: "FAILED_ASHA",
      // competency: this.route.snapshot.queryParams.competency,
      asha: this.route.snapshot.queryParams.isAsha,
    });
    await this.audioService.stopAllAudio()
  }
  viewCourses() {
    this.dialogRef.close({
      event: "VIEW_COURSES",
      competency: this.route.snapshot.queryParams.competency,
      competencyId: this.competencyId,
      competencyLevel: this.competencyLevelId,
    });
  }

  async viewAshaCourses() {
    this.dialogRef.close({
      event: "VIEW_ASHA_COURSES",
      asha: this.route.snapshot.queryParams.isAsha,
      competencyId: this.competencyId,
      competencyLevel: this.competencyLevelId,
      courseid: this.courseID,
      lang: this.route.snapshot.queryParams.lang,
    });
   const list = this.commonutilService.previesUrlList;
   if (list && list.length && list[list.length - 1].includes('isAsha=true')) {
     this.commonutilService.previesUrlList.pop();
    }
    await this.audioService.stopAllAudio()
  }
  async nextCompetency() {
    this.dialogRef.close({
      event: "NEXT_COMPETENCY",
      competency: this.route.snapshot.queryParams.competency,
    });
    await this.audioService.stopAllAudio()
  }

  timer(data: any) {
    if (data > -1) {
      this.timerSubscription = interval(100)
        .pipe(
          map(
            () =>
              this.startTime +
              this.assesmentdata.questions.timeLimit -
              Date.now()
          )
        )
        .subscribe((_timeRemaining) => {
          this.timeLeft -= 0.1;
          if (this.timeLeft < 0) {
            const data: any = {
              courseID: this.assesmentdata.generalData.collectionId,
              contentId: this.assesmentdata.generalData.identifier,
              name: this.assesmentdata.generalData.name,
              moduleId: this.viewerDataSvc.resource!.parent
                ? this.viewerDataSvc.resource!.parent
                : undefined,
            };
            this.telemetrySvc.end(
              "assessment",
              "assessment-auto-submit",
              this.assesmentdata.generalData.identifier,
              data
            );
            this.isIdeal = true;
            this.timeLeft = 0;
            if (this.timerSubscription) {
              this.timerSubscription.unsubscribe();
            }
            this.tabIndex = 1;
            this.tabActive = true;
            this.assesmentActive = false;
          }
        });
    }
  }

  fillSelectedItems(
    question: NSQuiz.IQuestion,
    optionId: string,
    qindex: number
  ) {
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
    this.generateInteractTelemetry("", question, qindex);
    this.questionAnswerHash["qslideIndex"] = qindex;
  }
  generateInteractTelemetry(
    status?: string,
    question?: NSQuiz.IQuestion,
    qindex?: number
  ) {
    const telemetryObject = new TelemetryObject(
      this.assesmentdata?.generalData?.identifier,
      "Assessment",
      undefined
    );
    const value = new Map();
    value["courseID"] = this.assesmentdata?.generalData?.collectionId;
    value["questionType"] = question ? question.questionType : "";
    value["identifier"] = this.assesmentdata?.generalData?.identifier;
    value["questionId"] = question ? question.questionId : "";
    value["qindex"] = question ? qindex : "";
    this.telemetryGeneraterService.generateInteractTelemetry(
      status ? InteractType.TOUCH : InteractType.SELECT_OPTION,
      status
        ? status === "next"
          ? InteractSubtype.NEXT_QUESTION_CLICKED
          : InteractSubtype.PREVIOUS_QUESTION_CLICKED
        : InteractSubtype.ANSWER_CLICKED,
      Environment.PLAYER,
      PageId.ASSESSMENT_OVERVIEW,
      telemetryObject,
      value
    );
  }

  proceedToSubmit() {
    this.submitQuiz();
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, "X", {
      duration,
    });
  }

  submitQuiz() {
    this.ngOnDestroy();
    if (!this.assesmentdata.questions.isAssessment) {
      this.calculateResults();
    }

    const submitQuizJson = JSON.parse(
      JSON.stringify(this.assesmentdata.questions)
    );
    this.fetchingResultsStatus = "fetching";
    const requestData: NSQuiz.IQuizSubmitRequest =
      this.quizService.createAssessmentSubmitRequest(
        this.assesmentdata.generalData.identifier,
        this.assesmentdata.generalData.name,
        {
          ...submitQuizJson,
          timeLimit: this.assesmentdata.questions.timeLimit * 1000,
        },
        this.questionAnswerHash
      );
    const sanitizedRequestData: NSQuiz.IQuizSubmitRequest =
      this.quizService.sanitizeAssessmentSubmitRequest(requestData);
    sanitizedRequestData["artifactUrl"] =
      this.assesmentdata.generalData.artifactUrl;
    sanitizedRequestData["contentId"] =
      this.assesmentdata.generalData.identifier;
    sanitizedRequestData["courseId"] =
      this.assesmentdata.generalData.collectionId;
    sanitizedRequestData["batchId"] = this.route.snapshot.queryParams.batchId;
    sanitizedRequestData["userId"] = this.configSvc.userProfile.userId;
    if (this.route.snapshot.queryParams.competency) {
      this.submitCompetencyQuizV2(sanitizedRequestData);
    } else {
      this.submitQuizV2(sanitizedRequestData);
    }
  }
  async submitQuizV2(sanitizedRequestData: any) {
    if (navigator.onLine) {
      await this.submitQuizOnline(sanitizedRequestData);
      await this.calculateAndInsertResults(sanitizedRequestData);
    } else {
      await this.submitQuizOffline(sanitizedRequestData);
    }
  }

  private async submitQuizOnline(sanitizedRequestData: any): Promise<void> {
    try {
      const res = await this.quizService
        .submitQuizV2(sanitizedRequestData)
        .toPromise();
      this.handleOnlineSubmissionResult(res);
    } catch (error) {
      this.handleError();
    }
  }

  generateEndTelemetry() {
    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    const telemetryObject = new TelemetryObject(
      this.assesmentdata?.generalData?.identifier,
      "Assessment",
      undefined
    );
    let objRollup = new Rollup();
    objRollup.l1 = this.assesmentdata?.generalData?.identifier;
    this.telemetryGeneraterService.generateEndTelemetry(
      "assessment",
      Mode.END,
      PageId.PLAYER_PAGE,
      Environment.COURSE,
      duration,
      telemetryObject,
      objRollup
    );
  }

  private async handleOnlineSubmissionResult(
    res: NSQuiz.IQuizSubmitResponse
  ): Promise<void> {
    console.log("response from submit assessment", res);
    if (res) {
      const data: any = {
        courseID: this.assesmentdata.generalData.collectionId,
        contentId: this.assesmentdata.generalData.identifier,
        name: this.assesmentdata.generalData.name,
        moduleId: this.viewerDataSvc.resource!.parent
          ? this.viewerDataSvc.resource!.parent
          : undefined,
      };
      this.generateEndTelemetry();
      this.telemetrySvc.end(
        "assessment",
        "assessment-submit",
        this.assesmentdata.generalData.identifier,
        data
      );
      window.scrollTo(0, 0);

      if (this.assesmentdata.questions.isAssessment) {
        this.isIdeal = true;
      }
      this.fetchingResultsStatus = "done";
      this.numCorrectAnswers = res.correct;
      this.numIncorrectAnswers = res.inCorrect;
      this.numUnanswered = res.blank;
      this.passPercentage =
        this.assesmentdata.generalData.collectionId ===
        "lex_auth_0131241730330624000"
          ? 70
          : res.passPercent;
      this.result = _.round(res.result);
      this.updateUiBasedOnResult();
    }
  }

  private updateUiBasedOnResult(): void {
    this.tabIndex = 1;
    this.tabActive = true;
    this.assesmentActive = false;
    if (this.result >= this.passPercentage) {
      this.isCompleted = true;
    }
    if (this.viewerDataSvc.gatingEnabled && !this.isCompleted) {
      this.disableContinue = true;
    }
  }

  private async calculateAndInsertResults(
    sanitizedRequestData: any
  ): Promise<void> {
    await this.calculateResults();
    const completionPercentage = this.isCompleted ? 100 : 0;
    await this.courseOptimisticUiService.insertCourseProgress(
      sanitizedRequestData["courseId"],
      sanitizedRequestData["contentId"],
      sanitizedRequestData["userId"],
      completionPercentage,
      sanitizedRequestData["batchId"],
      "application/json",
      sanitizedRequestData["contentId"],
      this.isCompleted ? 2 : 1
    );
    const couseLocalProgressData =
      await this.courseOptimisticUiService.courseProgressRead(
        sanitizedRequestData["courseId"]
      );
    console.log("Online couseLocalProgressData", couseLocalProgressData);
    await this.courseOptimisticUiService.updateLastReadContentId(
      sanitizedRequestData["courseId"],
      sanitizedRequestData["contentId"],
      couseLocalProgressData
    );
    await this.onlineSqliteService.updateResumeData(
      sanitizedRequestData["courseId"]
    );

    this.contentSvc.changeMessage({
      type: "assessment",
      progressData: couseLocalProgressData.result,
    });
  }

  private async submitQuizOffline(sanitizedRequestData: any): Promise<void> {
    let artifactUrlArray = sanitizedRequestData["artifactUrl"].split("/");
    sanitizedRequestData["artifactUrl"] =
      "https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/" +
      artifactUrlArray.slice(0, 1) +
      "/artifact/" +
      artifactUrlArray.slice(1);
    this.enqueueService.assementEnqueue(
      sanitizedRequestData["contentId"],
      sanitizedRequestData["courseId"],
      sanitizedRequestData["batchId"],
      sanitizedRequestData
    );
    await this.calculateResults();
    const completionPercentage = this.isCompleted ? 100 : 0;
    await this.offlineCourseOptimisticService.insertCourseProgress(
      sanitizedRequestData["courseId"],
      sanitizedRequestData["contentId"],
      sanitizedRequestData["userId"],
      completionPercentage,
      sanitizedRequestData["batchId"],
      "application/json",
      sanitizedRequestData["contentId"],
      this.isCompleted ? 2 : 1
    );
    const couseLocalProgressData =
      await this.offlineCourseOptimisticService.courseProgressRead(
        sanitizedRequestData["courseId"]
      );
    console.log("Offline couseLocalProgressData", couseLocalProgressData);
    await this.offlineCourseOptimisticService.updateLastReadContentId(
      sanitizedRequestData["courseId"],
      sanitizedRequestData["contentId"],
      couseLocalProgressData
    );
    await this.sqliteService.updateResumeData(sanitizedRequestData["courseId"]);

    this.contentSvc.changeMessage({
      type: "assessment",
      progressData: couseLocalProgressData.result,
    });
  }

  private handleError(): void {
    this.openSnackbar("Something went wrong! Unable to submit.");
    this.fetchingResultsStatus = "error";
  }

  submitCompetencyQuizV2(sanitizedRequestData: any) {
    this.quizService.competencySubmitQuizV2(sanitizedRequestData).subscribe(
      async (res: NSQuiz.IQuizSubmitResponse) => {
        const data1: any = {
          courseID: this.assesmentdata.generalData.collectionId,
          contentId: this.assesmentdata.generalData.identifier,
          name: this.assesmentdata.generalData.name,
          moduleId: this.viewerDataSvc.resource!.parent
            ? this.viewerDataSvc.resource!.parent
            : undefined,
        };
        this.telemetrySvc.end(
          "competency",
          "competency-submit",
          this.assesmentdata.generalData.identifier,
          data1
        );
        window.scrollTo(0, 0);
        if (this.assesmentdata.questions.isAssessment) {
          this.isIdeal = true;
        }
        this.fetchingResultsStatus = "done";
        this.numCorrectAnswers = res.correct;
        this.numIncorrectAnswers = res.inCorrect;
        this.numUnanswered = res.blank;
        /* tslint:disable-next-line:max-line-length */
        this.passPercentage =
          this.assesmentdata.generalData.collectionId ===
          "lex_auth_0131241730330624000"
            ? 70
            : res.passPercent; // NQOCN Course ID
        this.result = _.round(res.result);
        this.tabIndex = 1;
        this.tabActive = true;
        this.assesmentActive = false;

        if (this.result >= this.passPercentage) {
          this.isCompleted = true;
          this.isCompetencyComplted = true;
        }
        this.isCompetency = this.route.snapshot.queryParams.competency;
        this.isAshaHome = this.route.snapshot.queryParams.isAsha;
        if (this.viewerDataSvc.gatingEnabled && !this.isCompleted) {
          this.disableContinue = true;
        }
        const data = localStorage.getItem("competency_meta_data");
        let competency_meta_data: any;
        let competencyLevelId;
        if (data) {
          competency_meta_data = JSON.parse(data)[0];
          _.forEach(JSON.parse(data), (item: any) => {
            if (item.competencyIds) {
              competencyLevelId = this.getCompetencyId(item.competencyIds);
              this.competencyLevelId = competencyLevelId
                ? competencyLevelId
                : "";
            }
          });
        }
        this.competencyId = competency_meta_data.competencyId;
        let userId = "";
        if (this.configSvc.userProfile) {
          userId = this.configSvc.userProfile.userId || "";
        }
        if (this.isCompetencyComplted) {
          const formatedData = {
            request: {
              userId,
              typeName: "competency",
              competencyDetails: [
                {
                  competencyId: competency_meta_data.competencyId.toString(),
                  additionalParams: {
                    competencyName: competency_meta_data.competencyName,
                  },
                  acquiredDetails: {
                    acquiredChannel: "selfAssessment",
                    competencyLevelId,
                    // effectiveDate: "2023-02-09 9:46:12",
                    additionalParams: {
                      competencyName: competency_meta_data.competencyName,
                      courseId: this.assesmentdata.generalData.collectionId,
                      ResourseId: this.assesmentdata.generalData.identifier,
                    },
                  },
                },
              ],
            },
          };
          this.quizService
            .updatePassbook(formatedData, userId)
            .subscribe(() => {});
          this.updateNextResourses();
        }

        console.log("is asha assessement", this.isAshaHome);
        if (this.isAshaHome) {
          this.courseID = sanitizedRequestData.courseId;
          let req = {
            userid: userId,
            courseid: sanitizedRequestData.courseId,
            batchid: sanitizedRequestData.batchId,
            contentid: sanitizedRequestData.contentId,
            competencylevel: this.competencyLevelId,
            completionpercentage: this.result >= this.passPercentage ? 100 : 0,
            contentType: "selfAssessment",
            competencyid: this.competencyId,
            // "progress": this.result >= this.passPercentage ? "completed" : "inprogress"
          };
          this.quizService.updateAshaAssessment(req).subscribe(
            (res) => {
              console.log("after update res", res);
            },
            (err) => {
              console.log("after update err", err);
            }
          );
          await this.playCompletionAudio()
        }
      },
      (_error: any) => {
        this.openSnackbar("Something went wrong! Unable to submit.");
        this.fetchingResultsStatus = "error";
      }
    );
  }
  async playCompletionAudio(): Promise<void> {
    const isReady = this.audioService.isReady();
    console.log("Audio service ready:", isReady);
    const status = this.audioService.getInitializationStatus();
    console.log("Audio initialization status:", status);
    if (!isReady) {
      console.log("Audio service not ready yet");
      return;
    }
    const lang = this.route.snapshot.queryParams.lang || "en";
    if (this.isCompetencyComplted) {
      await this.audioService.playSuccessAudio(lang);
    } else {
      await this.audioService.playFailureAudio(lang);
    }
  }

  getCompetencyId(data: any) {
    let id;
    _.forEach(data, (item: any) => {
      if (item.identifier === this.assesmentdata.generalData.identifier) {
        id = item.competencyId.toString();
        this.nextCompetencyLevel = item.competencyId + 1;
      }
    });
    return id;
  }
  public async calculateResults(): Promise<void> {
    this.numCorrectAnswers = 0;
    this.numIncorrectAnswers = 0;
    this.numUnanswered = 0;
    const passPercentage = this.assesmentdata.questions.passPercentage || 60;

    this.assesmentdata.questions.questions.forEach(
      (question: NSQuiz.IQuestion) => {
        const result = this.calculateQuestionResult(question);

        if (result.correct) {
          this.numCorrectAnswers++;
        } else if (result.incorrect) {
          this.numIncorrectAnswers++;
        } else {
          this.numUnanswered++;
        }
      }
    );

    /* Calculate the percentage */
    this.result =
      passPercentage === 0
        ? 100
        : Math.round(
            (this.numCorrectAnswers /
              this.quizService.questionState.slides.length) *
              100
          );
    console.log(`Percentage Correct: ${this.result}%`);
    if (this.result >= passPercentage) {
      this.isCompleted = true;
    }
    this.tabIndex = 1;
    this.tabActive = true;
    this.assesmentActive = false;
    if (this.viewerDataSvc.gatingEnabled && !this.isCompleted) {
      this.disableContinue = true;
    }
  }

  calculateQuestionResult(question: NSQuiz.IQuestion): {
    correct: boolean;
    incorrect: boolean;
    unanswered: boolean;
  } {
    const correctOptions = question.options.filter(
      (option) => option.isCorrect
    );
    let selectedOptions = this.questionAnswerHash[question.questionId] || [];
    let correctFlag = true;
    let unTouched = false;
    if (question.questionType === "fitb" && selectedOptions.length > 0) {
      selectedOptions = selectedOptions[0].split(",") || [];
      unTouched = selectedOptions.length < 1;
      if (!unTouched && correctOptions.length !== selectedOptions.length) {
        correctFlag = false;
      }
      if (correctFlag && !unTouched) {
        for (let i = 0; i < correctOptions.length; i++) {
          /* Explicitly cast to string and then use trim */
          if (
            (correctOptions[i].text as string).trim().toLowerCase() !==
            selectedOptions[i].trim().toLowerCase()
          ) {
            correctFlag = false;
            break;
          }
        }
      }
      if (correctFlag && !unTouched) {
        return { correct: true, incorrect: false, unanswered: false };
      } else if (!unTouched) {
        return { correct: false, incorrect: true, unanswered: false };
      }
    } else if (
      question.questionType === "mtf" &&
      selectedOptions.length > 0 &&
      selectedOptions[0].length > 0
    ) {
      unTouched = selectedOptions[0].length < correctOptions.length;

      if (selectedOptions && selectedOptions[0]) {
        selectedOptions[0].forEach((element) => {
          const b = element.sourceId;
          if (correctOptions) {
            const option = correctOptions[(b.slice(-1) as number) - 1] || {
              match: "",
            };
            const match = option.match;

            if (match && match.trim() === element.target.innerHTML.trim()) {
              element.setPaintStyle({
                stroke: "#357a38",
              });
            } else {
              element.setPaintStyle({
                stroke: "#f44336",
              });
              correctFlag = false;
            }
          }
        });
      }

      if (correctFlag && !unTouched) {
        return { correct: true, incorrect: false, unanswered: false };
      } else if (!unTouched) {
        return { correct: false, incorrect: true, unanswered: false };
      }
    } else {
      selectedOptions = selectedOptions.sort().join(",");
      const correctOptionsString = correctOptions
        .sort()
        .map((option) => option.optionId)
        .join(",");

      if (correctOptionsString === selectedOptions) {
        return { correct: true, incorrect: false, unanswered: false };
      } else if (selectedOptions.length > 0) {
        return { correct: false, incorrect: true, unanswered: false };
      }
    }

    return { correct: false, incorrect: false, unanswered: true };
  }

  updateNextResourses() {
    const realTimeProgressRequest = {
      content_type: "Resource",
      current: ["0"],
      max_size: 0,
      mime_type: NsContent.EMimeTypes.APPLICATION_JSON,
      user_id_type: "uuid",
    };
    this.playerStateService.playerState
      .pipe(first(), takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        // console.log("submit next data", data)
        if (!_.isNull(data.nextResource)) {
          this.viewerSvc
            .realTimeProgressUpdate(
              data.nextContentId,
              realTimeProgressRequest,
              this.assesmentdata.generalData.collectionId,
              this.route.snapshot.queryParams.batchId
            )
            .subscribe((res) => {});
        }
      });
  }
  nextQuestion() {
    // tslint:disable-next-line:max-line-length
    this.generateInteractTelemetry(
      "next",
      this.assesmentdata.questions.questions[
        this.questionAnswerHash["qslideIndex"]
      ]
    );
    if (
      this.assesmentdata.questions.questions[
        this.questionAnswerHash["qslideIndex"]
      ] &&
      this.assesmentdata.questions.questions[
        this.questionAnswerHash["qslideIndex"]
      ].questionType === "mtf"
    ) {
      const submitQuizJson = JSON.parse(
        JSON.stringify(this.assesmentdata.questions)
      );
      let userAnswer: any = {};
      userAnswer = this.quizService.checkMtfAnswer(
        submitQuizJson,
        this.questionAnswerHash
      );
      this.questionAnswerHash[userAnswer.questionId] = userAnswer.answer;
    }
    this.disableNext = true;
    this.progressbarValue += 100 / this.totalQuestion;

    if (
      this.quizService.questionState.active_slide_index ===
      this.quizService.questionState.slides.length - 1
    ) {
      this.disableNext = true;
      // this.quizService.questionState.active_slide_index += 1
      this.showSubmit = true;
      //this.proceedToSubmit()
      this.updateQuestionType(false);

      return;
    }
    const oldSlide =
      this.quizService.questionState.slides[
        this.quizService.questionState.active_slide_index
      ];
    $(oldSlide).fadeOut("fast", () => {
      $(oldSlide).hide();

      for (
        let i = 0;
        i < this.quizService.questionState.slides.length;
        i += 1
      ) {
        const slide = this.quizService.questionState.slides[i];
        $(slide).hide();
      }
      this.quizService.questionState.active_slide_index += 1;
      const newSlide =
        this.quizService.questionState.slides[
          this.quizService.questionState.active_slide_index
        ];
      $(newSlide).fadeIn(800, () => {
        $(newSlide).show();
        this.disableNext = false;
        if (this.quizService.questionState.active_slide_index > 0) {
          this.diablePrevious = false;
        }
      });
    });
    // tslint:disable-next-line: max-line-length
    // if (this.assesmentdata.questions.questions[this.questionAnswerHash['qslideIndex']] && this.assesmentdata.questions.questions[this.questionAnswerHash['qslideIndex']].questionType === 'mtf') {
    //   const submitQuizJson = JSON.parse(JSON.stringify(this.assesmentdata.questions))
    //   let userAnswer: any = {}
    //   userAnswer = this.quizService.checkMtfAnswer(submitQuizJson, this.questionAnswerHash)
    //   this.questionAnswerHash[userAnswer.questionId] = userAnswer.answer
    // }

    // tslint:disable-next-line: max-line-length
    if (
      this.assesmentdata.questions.questions[
        this.quizService.questionState.active_slide_index + 1
      ].questionType === "mtf"
    ) {
      this.updateQuestionType(true);
    } else {
      this.updateQuestionType(false);
    }
  }
  updateQuestionType(status: any) {
    this.quizService.updateMtf.next(status);
  }
  previousQuestion() {
    if ((this.disableNext = true)) {
      this.disableNext = false;
    }
    this.diablePrevious = true;
    this.generateInteractTelemetry("back");
    this.progressbarValue -= 100 / this.totalQuestion;
    if (this.quizService.questionState.active_slide_index === 0) {
      return;
    }

    // if (
    //   this.quizService.questionState.active_slide_index
    //   === (this.quizService.questionState.slides.length - 1)) {
    //   this.diablePrevious = false
    //   this.showSubmit = false
    //   this.proceedToSubmit()
    // }
    const oldSlide =
      this.quizService.questionState.slides[
        this.quizService.questionState.active_slide_index
      ];
    $(oldSlide).fadeOut("fast", () => {
      $(oldSlide).hide();
      this.diablePrevious = true;
      for (
        let i = 0;
        i < this.quizService.questionState.slides.length;
        i += 1
      ) {
        const slide = this.quizService.questionState.slides[i];
        $(slide).hide();
      }
      this.quizService.questionState.active_slide_index -= 1;
      const newSlide =
        this.quizService.questionState.slides[
          this.quizService.questionState.active_slide_index
        ];
      $(newSlide).fadeIn(800, () => {
        $(newSlide).show();
        this.diablePrevious = false;
        if (this.quizService.questionState.active_slide_index === 0) {
          this.diablePrevious = true;
        }
      });
    });
    if (
      this.assesmentdata.questions.questions[
        this.quizService.questionState.active_slide_index - 1
      ].questionType === "mtf"
    ) {
      this.updateQuestionType(true);
    } else {
      this.updateQuestionType(false);
    }
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.startTime = 0;
    this.timeLeft = 0;
  }

  getConicGradient(value: number): string {
    return `
      radial-gradient(closest-side, white 79%, transparent 80% 100%),
      conic-gradient(rgba(206, 154, 57, 1) ${value}%, rgba(247, 238, 221, 1) 0)
    `;
  }
}