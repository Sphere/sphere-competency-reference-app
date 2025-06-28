import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LocalStorageService } from "../../../../../../app/manage-learn/core";
import { ScreenOrientation } from "@awesome-cordova-plugins/screen-orientation/ngx";
import videoJs from "video.js";
import { ViewerUtilService } from "../../../../../../project/ws/viewer/src/lib/viewer-util.service";
import { ROOT_WIDGET_CONFIG } from "../collection.config";
import { IWidgetsPlayerMediaData } from "../_models/player-media.model";
import { Events } from "../../../../../../util/events";
import {
  fireRealTimeProgressFunction,
  saveContinueLearningFunction,
  telemetryEventDispatcherFunction,
  videoInitializer,
  videoJsInitializer,
} from '../_services/videojs-util'
import { NsContent } from '../_services/widget-content.model'
import { WidgetContentService } from '../_services/widget-content.service'
import { OnlineSqliteService } from '../../../../../../app/modules/shared/services/online-sqlite.service'
import { CourseOptimisticUiService } from '../../../../../../app/modules/shared/services/course-optimistic-ui.service'
import { OfflineCourseOptimisticService } from '../../../../../../app/modules/shared/services/offline-course-optimistic.service'
import { SqliteService } from '../../../../../../app/modules/shared/services/sqlite.service'
import { WidgetBaseComponent } from '../../../../resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '../../../../resolver/src/lib/widget-resolver.model'
import { EventService } from '../../../../utils/src/lib/services/event.service'
import { ConfigurationsService } from '../../../../utils/src/lib/services/configurations.service'
import { EnqueueService } from '../../../../utils/src/lib/services/enqueue.service'
import { MatDialog } from "@angular/material/dialog";
import { Platform } from "@ionic/angular";
import { interval, Subscription } from "rxjs";
import _ from "lodash";
import { VideoPopUpQuizComponent } from "../../../../../../app/modules/shared/components/video-pop-up-quiz/video-pop-up-quiz.component";
import { Environment, Mode, PageId, TelemetryGeneratorService } from "../../../../../../services";
import { Rollup, TelemetryObject } from "sunbird-sdk";

const videoJsOptions: videoJs.PlayerOptions = {
  controls: true,
  autoplay: false,
  preload: "auto",
  fluid: false,
  techOrder: ["html5"],
  playbackRates: [0.75, 0.85, 1, 1.25, 2, 3],
  poster: "",
  html5: {
    hls: {
      overrideNative: true,
    },
    nativeVideoTracks: false,
    nativeAudioTracks: false,
    nativeTextTracks: false,
  },
  nativeControlsForTouch: false,
};

@Component({
  selector: "ws-widget-player-video",
  templateUrl: "./player-video.component.html",
  styleUrls: ["./player-video.component.scss"],
})
export class PlayerVideoComponent
  extends WidgetBaseComponent
  implements
    OnInit,
    AfterViewInit,
    OnDestroy,
    NsWidgetResolver.IWidgetData<IWidgetsPlayerMediaData>
{
  @Input() widgetData!: IWidgetsPlayerMediaData;
  @ViewChild("fullScreenContainer", { static: true }) fullScreenContainer: any;
  @ViewChild("videoTag", { static: false })
  videoTag!: ElementRef<HTMLVideoElement>;
  @ViewChild("realvideoTag", { static: false })
  realvideoTag!: ElementRef<HTMLVideoElement>;
  private player: videoJs.Player | null = null;
  private dispose: (() => void) | null = null;
  contentData: any;
  showShrinkButton: any;
  progressData: any;
  progress = 0;
  videoStates: {
    [videoId: string]: { popupTriggered: any; currentMilestone: any };
  } = {};
  videojsEventNames = {
    disposing: "disposing",
    ended: "ended",
    exitfullscreen: "exitfullscreen",
    fullscreen: "fullscreen",
    mute: "mute",
    pause: "pause",
    play: "play",
    ready: "ready",
    seeked: "seeked",
    unmute: "unmute",
    volumechange: "volumechange",
    loadeddata: "loadeddata",
  };
  constructor(
    private eventSvc: EventService,
    private contentSvc: WidgetContentService,
    private viewerSvc: ViewerUtilService,
    private activatedRoute: ActivatedRoute,
    private configSvc: ConfigurationsService,
    private screenOrientation: ScreenOrientation,
    private enqueueService: EnqueueService,
    private onlineSqliteService: OnlineSqliteService,
    private courseOptimisticUiService: CourseOptimisticUiService,
    private offlineCourseOptimisticService: OfflineCourseOptimisticService,
    private sqliteService: SqliteService,
    private dialog: MatDialog,
    private platform: Platform,
    private router: Router,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
    super();
  }

  ngOnInit() {
    this.configSvc.showshrink$.subscribe(async (res: any) => {
      this.showShrinkButton = res;
    });
    this.platform.backButton.subscribeWithPriority(10, () => {
      console.log("back button pressed ");
      this.checkAndNavigate();
    });
  }

  checkAndNavigate() {
    this.screenOrientation.unlock();
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    this.player.exitFullscreen();
    this.player.pause();
    this.telemetryGeneratorService.generateBackClickedNewTelemetry(true, Environment.PLAYER, PageId.PLAYER_PAGE)
    // const currentUrl = this.router.url;
    // console.log(currentUrl)
    // if (currentUrl.includes("/viewer/video/")) {
    //   const currentId = this.activatedRoute.snapshot.queryParams.collectionId;
    //   this.router.navigate(['/app/toc', currentId, 'overview'], {
    //   queryParams: {
    //     primaryCategory: 'Course',
    //     batchId: this.activatedRoute.snapshot.queryParams.batchId
    //   }
    // }).then(() => {

    // });
    // }
  }
  async ngAfterViewInit() {
    if (navigator.onLine) {
      await this.getCurrentTime();
      await this.fetchContent();
    }
    this.widgetData = {
      ...this.widgetData,
    };
    // if (this.widgetData && this.widgetData.identifier && !this.widgetData.url) {
    //   await this.fetchContent()
    // }

    if (this.videoTag) {
      this.addTimeUpdateListener(this.videoTag.nativeElement);
    }
    if (this.realvideoTag) {
      this.addTimeUpdateListener(this.realvideoTag.nativeElement);
    }
    if (this.widgetData.url) {
      if (this.widgetData.isVideojs) {
        await this.initializePlayer();
      } else {
        this.initializeVPlayer();
      }
    }
  }
  addTimeUpdateListener(videoElement: HTMLVideoElement): void {
    const player = videoJs(videoElement, {
      ...videoJsOptions,
      poster: this.widgetData.posterImage,
      autoplay: this.widgetData.autoplay || false,
    });

    const videoId = videoElement.id;
    this.videoStates[videoId] = {
      popupTriggered: new Set<number>(), // Track triggered milestones
      currentMilestone: null,
    };

    // Handle play event
    player.on(this.videojsEventNames.play, () => {
      const intervalId = interval(500).subscribe(() => {
        const currentTimeInSeconds = Math.round(player.currentTime());
        if (
          this.widgetData.videoQuestions &&
          this.widgetData.videoQuestions.length > 0
        ) {
          for (const milestone of this.widgetData.videoQuestions) {
            // Check if popup has already been triggered for this milestone
            if (
              currentTimeInSeconds === milestone.timestampInSeconds &&
              !this.videoStates[videoId].popupTriggered.has(
                milestone.timestampInSeconds
              )
            ) {
              player.pause();
              console.log(
                "Popup triggered for milestone:",
                milestone.timestampInSeconds
              );
              this.videoStates[videoId].popupTriggered.add(
                milestone.timestampInSeconds
              );
              this.videoStates[videoId].currentMilestone =
                milestone.timestampInSeconds;
              this.openPopup(milestone.question, player, intervalId);
              return; // Exit loop after triggering popup
            }
          }
        }
      });
    });

    // Handle timeupdate for user seeking
    player.on("timeupdate", () => {
      const currentTimeInSeconds = Math.round(player.currentTime());
      this.progress = player.duration() - currentTimeInSeconds;
      if (this.widgetData.videoQuestions) {
        for (const milestone of this.widgetData.videoQuestions) {
          // Reset popupTriggered if user seeks before the milestone
          if (currentTimeInSeconds < milestone.timestampInSeconds) {
            this.videoStates[videoId].popupTriggered.delete(
              milestone.timestampInSeconds
            );
          }
        }
      }
    });
  }

  openPopup(questions: any, videoElement: any, intervalId: Subscription): void {
    const confirmdialog = this.dialog.open(VideoPopUpQuizComponent, {
      width: "600px",
      data: { questions },
    });

    if (confirmdialog) {
      confirmdialog.afterClosed().subscribe(() => {
        console.log("Popup closed");
        this.dialog.closeAll();
        videoElement.play();
        intervalId.unsubscribe(); // Stop the current interval
        this.addTimeUpdateListener(videoElement); // Resume the listener if needed
        this.onTimeUpdate();
      });
    }
  }
  onTimeUpdate() {
    const percentage =
      (this.videoTag.nativeElement.currentTime /
        this.videoTag.nativeElement.duration) *
      100;
    if (this.progressData.completionPercentage < percentage) {
      const data = {
        current: this.videoTag.nativeElement.currentTime,
        max_size: this.videoTag.nativeElement.duration,
        mime_type: this.widgetData.mimeType,
      };

      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
        ? this.activatedRoute.snapshot.queryParams.collectionId
        : this.widgetData.identifier;
      const batchId = this.activatedRoute.snapshot.queryParams.batchId
        ? this.activatedRoute.snapshot.queryParams.batchId
        : this.widgetData.identifier;
      if (percentage >= 98) {
        data.current = data.max_size;
      }

      if (percentage <= 98 && this.widgetData.identifier) {
        this.viewerSvc
          .realTimeProgressUpdate(
            this.widgetData.identifier,
            data,
            collectionId,
            batchId
          )
          .subscribe(async (data: any) => {
            const result = data.result;
            result["type"] = "Video";
            this.contentSvc.changeMessage(result);
            await this.courseOptimisticUiService.insertCourseProgress(
              collectionId,
              this.widgetData.identifier,
              this.configSvc.userProfile.userId,
              percentage > 95 ? 100 : percentage,
              batchId,
              "Video",
              this.widgetData.identifier,
              percentage > 95 ? 2 : 1
            );
            const couseLocalProgressData =
              await this.courseOptimisticUiService.courseProgressRead(
                collectionId
              );
            await this.courseOptimisticUiService.updateLastReadContentId(
              collectionId,
              this.widgetData.identifier,
              couseLocalProgressData
            );
            await this.onlineSqliteService.updateResumeData(collectionId);
            this.contentSvc.changeMessage({
              type: "Video",
              progressData: couseLocalProgressData.result,
            });
          });
      }
    }
  }

  async getCurrentTime() {
    let userId;
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || "";
    }
    const batchId = this.activatedRoute.snapshot.queryParams.batchId
      ? this.activatedRoute.snapshot.queryParams.batchId
      : this.widgetData.identifier;
    const req: NsContent.IContinueLearningDataReq = {
      request: {
        userId,
        batchId,
        courseId: this.activatedRoute.snapshot.queryParams.collectionId || "",
        contentIds: [],
        fields: ["progressdetails"],
      },
    };
    const data = await this.contentSvc.fetchContentHistoryV2(req).toPromise();
    if (data && data.result && data.result.contentList.length) {
      const contentData = data.result.contentList.find(
        (obj: any) => obj.contentId === this.widgetData.identifier
      );
      if (
        contentData &&
        contentData.progressdetails &&
        contentData.progressdetails.current
      ) {
        this.progressData = contentData;
        this.widgetData.resumePoint = contentData.progressdetails.current;
        console.log("Updated resume point:", this.widgetData.resumePoint);
      }
    }
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
    }
    if (this.dispose) {
      this.dispose();
    }
  }
  private initializeVPlayer() {
    const dispatcher: telemetryEventDispatcherFunction = (event) => {
      if (this.widgetData.identifier) {
        this.eventSvc.dispatchEvent(event);
      }
    };
    const saveCLearning: saveContinueLearningFunction = (data) => {
      if (this.widgetData.identifier) {
        if (
          this.activatedRoute.snapshot.queryParams.collectionType &&
          this.activatedRoute.snapshot.queryParams.collectionType.toLowerCase() ===
            "playlist"
        ) {
          const continueLearningData = {
            contextPathId: this.activatedRoute.snapshot.queryParams.collectionId
              ? this.activatedRoute.snapshot.queryParams.collectionId
              : this.widgetData.identifier,
            resourceId: data.resourceId,
            contextType: "playlist",
            dateAccessed: Date.now(),
            data: JSON.stringify({
              progress: data.progress,
              timestamp: Date.now(),
              contextFullPath: [
                this.activatedRoute.snapshot.queryParams.collectionId,
                data.resourceId,
              ],
            }),
          };
          this.contentSvc
            .saveContinueLearning(continueLearningData)
            .toPromise()
            .catch();
        } else {
          const continueLearningData = {
            contextPathId: this.activatedRoute.snapshot.queryParams.collectionId
              ? this.activatedRoute.snapshot.queryParams.collectionId
              : this.widgetData.identifier,
            ...data,
            // resourceId: data.resourceId,
            // dateAccessed: Date.now(),
            // data: data.data,
          };
          // JSON.stringify({
          //   progress: data.progress,
          //   timestamp: Date.now(),
          // }),
          this.contentSvc
            .saveContinueLearning(continueLearningData)
            .toPromise()
            .catch();
        }
      }
    };
    const fireRProgress: fireRealTimeProgressFunction = (identifier, data) => {
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
        ? this.activatedRoute.snapshot.queryParams.collectionId
        : this.widgetData.identifier;
      const batchId = this.activatedRoute.snapshot.queryParams.batchId
        ? this.activatedRoute.snapshot.queryParams.batchId
        : this.widgetData.identifier;
      if (this.widgetData.identifier) {
        this.viewerSvc.realTimeProgressUpdate(
          identifier,
          data,
          collectionId,
          batchId
        );
      }
    };

    if (this.widgetData.resumePoint && this.widgetData.resumePoint !== 0) {
      this.realvideoTag.nativeElement.currentTime = this.widgetData.resumePoint;
    }
    let enableTelemetry = false;
    if (
      !this.widgetData.disableTelemetry &&
      typeof this.widgetData.disableTelemetry !== "undefined"
    ) {
      enableTelemetry = true;
    }
    this.dispose = videoInitializer(
      this.realvideoTag.nativeElement,
      dispatcher,
      saveCLearning,
      fireRProgress,
      this.widgetData.passThroughData,
      ROOT_WIDGET_CONFIG.player.video,
      enableTelemetry,
      this.widgetData,
      this.widgetData.mimeType
    ).dispose;
  }

  private async initializePlayer() {
    const dispatcher: telemetryEventDispatcherFunction = (event) => {
      if (this.progress < 1) {
        if (event?.data?.playerStatus === "PAUSED") {
          this.generateEndTelemetry();
        }
      } else {
        this.generateStartTelemetry(event?.data?.playerStatus);
      }
      if (this.widgetData.identifier) {
        this.eventSvc.dispatchEvent(event);
      }
    };
    const saveCLearning: saveContinueLearningFunction = (data) => {
      if (this.widgetData.identifier && data) {
        if (
          this.activatedRoute.snapshot.queryParams.collectionType &&
          this.activatedRoute.snapshot.queryParams.collectionType.toLowerCase() ===
            "playlist"
        ) {
          // const continueLearningData = {
          //   contextPathId: this.activatedRoute.snapshot.queryParams.collectionId ?
          //     this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier,
          //   resourceId: data.resourceId,
          //   contextType: 'playlist',
          //   dateAccessed: Date.now(),
          //   data: JSON.stringify({
          //     progress: data.progress,
          //     timestamp: Date.now(),
          //     contextFullPath: [this.activatedRoute.snapshot.queryParams.collectionId, data.resourceId],
          //   }),
          // }
          // this.contentSvc
          //   .saveContinueLearning(continueLearningData)
          //   .toPromise()
          //   .catch()
        } else {
          // const continueLearningData = {
          //   contextPathId: this.activatedRoute.snapshot.queryParams.collectionId
          //     ? this.activatedRoute.snapshot.queryParams.collectionId
          //     : this.widgetData.identifier,
          //   ...data,
          //   // resourceId: data.resourceId,
          //   // dateAccessed: Date.now(),
          //   // data: JSON.stringify({
          //   //   progress: data.progress,
          //   //   timestamp: Date.now(),
          //   // }),
          // }
          // this.contentSvc
          //   .saveContinueLearning(continueLearningData)
          //   .toPromise()
          //   .catch()
        }
      }
    };
    const fireRProgress: fireRealTimeProgressFunction = async (
      identifier,
      data
    ) => {
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
        ? this.activatedRoute.snapshot.queryParams.collectionId
        : this.widgetData.identifier;
      const batchId = this.activatedRoute.snapshot.queryParams.batchId
        ? this.activatedRoute.snapshot.queryParams.batchId
        : this.widgetData.identifier;
      let userId;
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || "";
      }
      const req: NsContent.IContinueLearningDataReq = {
        request: {
          userId,
          batchId,
          courseId: collectionId,
          contentIds: [],
          fields: ["progressdetails"],
        },
      };
      const temp = data.current;
      const latest = parseFloat(temp[temp.length - 1] || "0");
      const percentMilis = (latest / data.max_size) * 100;
      const percent = parseFloat(percentMilis.toFixed(2));

      if (navigator.onLine) {
        this.contentSvc.fetchContentHistoryV2(req).subscribe(async (result) => {
          this.contentData = result["result"]["contentList"].find(
            (obj: any) => obj.contentId === identifier
          );

          if (
            this.contentData &&
            percent >= this.contentData.completionPercentage
          ) {
            if (this.widgetData.identifier && identifier && data) {
              this.viewerSvc
                .realTimeProgressUpdate(identifier, data, collectionId, batchId)
                .subscribe(async (data) => {
                  await this.courseOptimisticUiService.insertCourseProgress(
                    collectionId,
                    identifier,
                    userId,
                    percent > 95 ? 100 : percent,
                    batchId,
                    "Video",
                    identifier,
                    percent > 95 ? 2 : 1
                  );
                  const couseLocalProgressData =
                    await this.courseOptimisticUiService.courseProgressRead(
                      collectionId
                    );
                  await this.courseOptimisticUiService.updateLastReadContentId(
                    collectionId,
                    identifier,
                    couseLocalProgressData
                  );
                  await this.onlineSqliteService.updateResumeData(collectionId);
                  this.contentSvc.changeMessage({
                    type: "Video",
                    progressData: couseLocalProgressData.result,
                  });
                });
            }
          }
          if (percent > 95) {
            await this.courseOptimisticUiService.insertCourseProgress(
              collectionId,
              identifier,
              userId,
              percent > 95 ? 100 : percent,
              batchId,
              "Video",
              identifier,
              percent > 95 ? 2 : 1
            );
            const couseLocalProgressData =
              await this.courseOptimisticUiService.courseProgressRead(
                collectionId
              );
            await this.courseOptimisticUiService.updateLastReadContentId(
              collectionId,
              identifier,
              couseLocalProgressData
            );
            await this.onlineSqliteService.updateResumeData(collectionId);
            this.contentSvc.changeMessage({
              type: "Video",
              progressData: couseLocalProgressData.result,
            });
          }
          if (this.contentData === undefined && percent > 95) {
            this.viewerSvc
              .realTimeProgressUpdate(identifier, data, collectionId, batchId)
              .subscribe((data) => {
                this.contentSvc.changeMessage({
                  type: "Video",
                  progressData: data.result,
                });
              });
          } else if (this.contentData === undefined && percent > 0) {
            this.viewerSvc
              .realTimeProgressUpdate(identifier, data, collectionId, batchId)
              .subscribe((data) => {
                this.contentSvc.changeMessage({
                  type: "Video",
                  progressData: data.result,
                });
              });
            await this.courseOptimisticUiService.insertCourseProgress(
              collectionId,
              identifier,
              userId,
              percent,
              batchId,
              "Video",
              identifier,
              percent > 95 ? 2 : 1
            );
            const couseLocalProgressData =
              await this.courseOptimisticUiService.courseProgressRead(
                collectionId
              );
            await this.courseOptimisticUiService.updateLastReadContentId(
              collectionId,
              identifier,
              couseLocalProgressData
            );
            await this.onlineSqliteService.updateResumeData(collectionId);
          }
        });
      } else {
        try {
          const response: any = await this.enqueueService.enqueue(
            identifier,
            this.activatedRoute.snapshot.queryParams.collectionId || "",
            this.activatedRoute.snapshot.queryParams.batchId,
            percent < 95 ? 1 : 2,
            percent > 95 ? 100 : 100
          );

          console.log("enqueue-response video - ", response);
          const contentPerentage =
            await this.offlineCourseOptimisticService.isContentIdExistsWithPercentage(
              collectionId,
              userId,
              identifier
            );
          if (
            !contentPerentage.exists &&
            contentPerentage.completionPercentage === 0
          ) {
            await this.updateOfflineLocalProgressData(
              this.activatedRoute.snapshot.queryParams.collectionId,
              percent,
              identifier
            );
          } else if (
            contentPerentage.exists &&
            contentPerentage.completionPercentage > 0 &&
            contentPerentage.completionPercentage !== 100
          ) {
            await this.updateOfflineLocalProgressData(
              this.activatedRoute.snapshot.queryParams.collectionId,
              percent,
              identifier
            );
          } else if (
            contentPerentage.exists &&
            contentPerentage.completionPercentage === 100
          ) {
            await this.updateOfflineLocalProgressData(
              this.activatedRoute.snapshot.queryParams.collectionId,
              contentPerentage.completionPercentage,
              identifier
            );
          }
        } catch (error) {
          console.error("enqueue-error video - ", error);
        }
      }
    };

    let enableTelemetry = false;
    if (
      !this.widgetData.disableTelemetry &&
      typeof this.widgetData.disableTelemetry !== "undefined"
    ) {
      enableTelemetry = true;
    }
    const initObj = videoJsInitializer(
      this.videoTag.nativeElement,
      {
        ...videoJsOptions,
        poster: this.widgetData.posterImage,
        autoplay: this.widgetData.autoplay || false,
      },
      dispatcher,
      saveCLearning,
      fireRProgress,
      this.widgetData.passThroughData,
      ROOT_WIDGET_CONFIG.player.video,
      this.widgetData.resumePoint ? this.widgetData.resumePoint : 0,
      enableTelemetry,
      this.widgetData,
      this.widgetData.mimeType
    );

    this.player = initObj.player;
    this.dispose = initObj.dispose;
    initObj.player.ready(() => {
      if (Array.isArray(this.widgetData.subtitles)) {
        this.widgetData.subtitles.forEach((u, index) => {
          initObj.player.addRemoteTextTrack(
            {
              default: index === 0,
              kind: "captions",
              label: u.label,
              srclang: u.srclang,
              src: u.url,
            },
            false
          );
        });
      }
      if (this.widgetData.url) {
        initObj.player.src(this.widgetData.url);
      }
    });
  }
  async updateOfflineLocalProgressData(
    collectionId: string,
    percent: number,
    identifier: any
  ): Promise<void> {
    let userId;
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || "";
    }
    await this.offlineCourseOptimisticService.insertCourseProgress(
      collectionId,
      identifier,
      userId,
      percent >= 95 ? 100 : percent,
      this.activatedRoute.snapshot.queryParams.batchId,
      "Video",
      identifier,
      percent >= 95 ? 2 : 1
    );
    const couseLocalProgressData =
      await this.offlineCourseOptimisticService.courseProgressRead(
        collectionId
      );
    await this.offlineCourseOptimisticService.updateLastReadContentId(
      collectionId,
      identifier,
      couseLocalProgressData
    );
    await this.sqliteService.updateResumeData(collectionId);
    this.contentSvc.changeMessage({
      type: "Video",
      progressData: couseLocalProgressData.result,
    });
  }
  // onTimeUpdate() {
  //   const percentage = (this.videoTag.nativeElement.currentTime / this.videoTag.nativeElement.duration) * 100

  //   const data = {
  //     current: this.videoTag.nativeElement.currentTime,
  //     max_size: this.videoTag.nativeElement.duration,
  //     mime_type: this.widgetData.mimeType,
  //   }

  //   const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
  //     this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier
  //   const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
  //     this.activatedRoute.snapshot.queryParams.batchId : this.widgetData.identifier
  //   if (this.widgetData.identifier) {
  //     if (percentage >= 98) {
  //       data.current = data.max_size;
  //       this.viewerSvc
  //         .realTimeProgressUpdate(this.widgetData.identifier, data, collectionId, batchId)
  //    }
  //   }
  // }
  async fetchContent(): Promise<void> {
    try {
      const identifier = this.widgetData.identifier || "";
      const primaryCategory = this.widgetData.primaryCategory;

      const content = await this.contentSvc
        .fetchContent(identifier, "minimal", [], primaryCategory)
        .toPromise();

      const videoQuestions = _.get(
        content,
        "result.content.videoQuestions",
        null
      );
      if (videoQuestions) {
        this.widgetData.videoQuestions = JSON.parse(videoQuestions) || [];
      } else {
        this.widgetData.videoQuestions = [];
      }

      console.log(
        "this.widgetData.videoQuestions",
        this.widgetData.videoQuestions
      );

      const artifactUrl = _.get(content, "artifactUrl", "");
      if (artifactUrl.includes("/content-store/")) {
        this.widgetData.url = artifactUrl;
        this.widgetData.posterImage = _.get(content, "appIcon", "");

        await this.contentSvc.setS3Cookie(identifier).toPromise();
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  }

  generateStartTelemetry(status) {
    const telemetryObject = new TelemetryObject(
      this.widgetData?.identifier,
      this.widgetData?.mimeType,
      undefined
    );
    let objRollup = new Rollup();
    objRollup.l1 = this.widgetData.identifier;
    this.telemetryGeneratorService.generateStartTelemetry(
      PageId.PLAYER,
      telemetryObject,
      objRollup,
      undefined,
      status
    );
  }

  generateEndTelemetry() {
    const telemetryObject = new TelemetryObject(
      this.widgetData?.identifier,
      this.widgetData?.mimeType,
      undefined
    );
    let objRollup = new Rollup();
    objRollup.l1 = this.widgetData.identifier;
    this.telemetryGeneratorService.generateEndTelemetry(
      this.widgetData?.mimeType,
      Mode.END,
      PageId.PLAYER_PAGE,
      Environment.COURSE,
      this.videoTag.nativeElement.duration,
      telemetryObject,
      objRollup
    );
  }
}
