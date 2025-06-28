import { NestedTreeControl } from "@angular/cdk/tree";
import {
  Component, EventEmitter, OnDestroy, OnInit, Output, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, Inject,
} from '@angular/core'
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ActivatedRoute, Router } from '@angular/router'
import { of, Subscription } from 'rxjs'
import { debounceTime, delay, distinctUntilChanged, takeLast } from 'rxjs/operators'
import { ViewerDataService } from '../../viewer-data.service'
import { ViewerUtilService } from '../../viewer-util.service'
import { PlayerStateService } from '../../player-state.service'
import * as _ from 'lodash'
import { localStorageConstants } from 'app/manage-learn/core/constants/localStorageConstants';
import { LocalStorageService } from 'app/manage-learn/core'
import { ConfirmmodalComponent } from '../../plugins/quiz/confirm-modal-component'
// import { HttpClient } from '@angular/common/http'

import { File } from '@awesome-cordova-plugins/file/ngx';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { CommonUtilService } from 'services/common-util.service'
import { TranslateService } from '@ngx-translate/core'
import { ContentService } from '@project-sunbird/sunbird-sdk'
import { DataSyncService } from 'app/modules/shared/services/data-sync.service'
import { Events } from 'util/events'
import { OnlineSqliteService } from 'app/modules/shared/services/online-sqlite.service'
import { CourseOptimisticUiService } from 'app/modules/shared/services/course-optimistic-ui.service'
import { OfflineCourseOptimisticService } from 'app/modules/shared/services/offline-course-optimistic.service'
import { QuizService } from '../../plugins/quiz/quiz.service';
import { WidgetContentService } from '../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service';
import { UtilityService } from '../../../../../../../library/ws-widget/utils/src/lib/services/utility.service';
import { ConfigurationsService } from '../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { ContentCorodovaService } from '../../../../../../../library/ws-widget/collection/src/lib/_services/content-corodova.service';
import { NsWidgetResolver } from '../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.model';
import { NsContent } from '../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model';
import { VIEWER_ROUTE_FROM_MIME } from '../../../../../../../library/ws-widget/collection/src/lib/_services/viewer-route-util';
import { CompleteCoursesModalComponent } from '../../plugins/quiz/components/complete-courses-modal/complete-courses-modal.component';
import { Environment, InteractSubtype, InteractType, PageId, TelemetryGeneratorService } from "../../../../../../../services";
import { AudioService } from "../../../../../../../app/modules/home/services/audio.service";
interface IViewerTocCard {
  identifier: string;
  completionPercentage: number;
  completionStatus: number;
  viewerUrl: string;
  thumbnailUrl: string;
  title: string;
  duration: number;
  type: string;
  complexity: string;
  artifactUrl: any;
  children: null | IViewerTocCard[];
}

export type TCollectionCardType = "content" | "playlist" | "goals";

interface ICollectionCard {
  type: TCollectionCardType | null;
  id: string;
  title: string;
  thumbnail: string;
  subText1: string;
  subText2: string;
  duration: number;
  redirectUrl: string | null;
}

@Component({
  selector: "viewer-viewer-toc",
  templateUrl: "./viewer-toc.component.html",
  styleUrls: ["./viewer-toc.component.scss"],
})
export class ViewerTocComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Output() hidenav = new EventEmitter<boolean>();
  @Input() forPreview = false;
  @Input() resourceChanged = "";
  @ViewChild("highlightItem", { static: false })
  highlightItem!: ElementRef<any>;
  @ViewChild("outer", { static: false }) outer!: ElementRef<any>;
  @ViewChild("ulTree", { static: false }) ulTree!: ElementRef<any>;
  @Input() batchId!: string | null;
  searchCourseQuery = "";
  hideSideNav = false;
  reverse = "";
  greenTickIcon = "/fusion-assets/images/green-checked3.svg";
  collectionId: any = "";
  resourceContentType: any;
  disabledNode: boolean;
  private downloadedFile;

  confirmationDialog: any = null;
  isConfirmationDialogOpen = false;
  private isExpandPathInProgress = false;
  private isAshaSubscription: Subscription;
  isAsha = false;
  telemetryObject: any;
  constructor(
    private file: File,
    private http: HTTP,
    private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    // private logger: LoggerService,
    private contentSvc: WidgetContentService,
    private utilitySvc: UtilityService,
    private viewerDataSvc: ViewerDataService,
    private viewSvc: ViewerUtilService,
    private configSvc: ConfigurationsService,
    // private contentProgressSvc: ContentProgressService,
    private playerStateService: PlayerStateService,
    public router: Router,
    private storage: LocalStorageService,
    public dialog: MatDialog,
    private matSnackBar: MatSnackBar,
    private commonUtilService: CommonUtilService,
    private translate: TranslateService,
    @Inject("CONTENT_SERVICE") private contentService: ContentService,
    private dataSyncService: DataSyncService,
    private event: Events,
    private onlineSqliteService: OnlineSqliteService,
    private courseOptimisticUiService: CourseOptimisticUiService,
    private offlineCourseOptimisticService: OfflineCourseOptimisticService,
    private cordovasvc: ContentCorodovaService,
    private quizSvc: QuizService,
    private telemetryGeneratorService: TelemetryGeneratorService,
     private audioService: AudioService
  ) {
    this.nestedTreeControl = new NestedTreeControl<IViewerTocCard>(
      this._getChildren
    );
    this.nestedDataSource = new MatTreeNestedDataSource();
    this.disabledNode = this.viewerDataSvc.getNode();
  }
  resourceId: string | null = null;
  collection: IViewerTocCard | null = null;
  queue: IViewerTocCard[] = [];
  tocMode: "FLAT" | "TREE" = "TREE";
  nestedTreeControl: NestedTreeControl<IViewerTocCard>;
  nestedDataSource: MatTreeNestedDataSource<IViewerTocCard>;
  defaultThumbnail: SafeUrl | null = null;
  isFetching = true;
  pathSet = new Set();
  contentProgressHash: { [id: string]: number } | null = null;
  errorWidgetData: NsWidgetResolver.IRenderConfigWithTypedData<any> = {
    widgetType: "errorResolver",
    widgetSubType: "errorResolver",
    widgetData: {
      errorType: "",
    },
  };
  enumContentTypes = NsContent.EDisplayContentTypes;
  collectionCard: ICollectionCard | null = null;
  isErrorOccurred = false;
  private paramSubscription: Subscription | null = null;
  private viewerDataServiceSubscription: Subscription | null = null;
  message!: string;
  subscription: Subscription | null = null;
  isLoading = false;
  makeTreeCompleted = false;
  // tslint:disable-next-line
  hasNestedChild = (_: number, nodeData: IViewerTocCard) =>
    nodeData && nodeData.children && nodeData.children.length;
  private _getChildren = (node: IViewerTocCard) => {
    return node && node.children ? node.children : [];
  };

  async ngOnInit() {
    await this.storage.deleteOneStorage(localStorageConstants.COLLECTION_DATA);
    this.isLoading = true;
    this.handleDialog();
    if (this.configSvc.instanceConfig) {
      this.defaultThumbnail = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.defaultContent
      );
    }
    this.collectionId = "";
    this.paramSubscription = this.activatedRoute.queryParamMap.subscribe(
      async (params) => {
        this.batchId = params.get("batchId");
        const collectionId = params.get("collectionId");
        const collectionType = params.get("collectionType");
        this.collectionId = collectionId;
        console.log("this.collectionid", this.collectionId);
        this.contentSvc.collectionId = collectionId;
        if (collectionId && collectionType) {
          if (
            collectionType.toLowerCase() ===
            NsContent.EMiscPlayerSupportedCollectionTypes.PLAYLIST.toLowerCase()
          ) {
            this.collection = await this.getPlaylistContent(
              collectionId,
              collectionType
            );
          } else if (
            collectionType.toLowerCase() ===
            NsContent.EContentTypes.MODULE.toLowerCase() ||
            collectionType.toLowerCase() ===
            NsContent.EContentTypes.COURSE.toLowerCase() ||
            collectionType.toLowerCase() ===
            NsContent.EContentTypes.PROGRAM.toLowerCase()
          ) {
            this.collection = await this.getCollection(
              collectionId,
              collectionType
            );
            console.log("this.collection", JSON.stringify(this.collection));
          } else {
            this.isErrorOccurred = true;
          }
          if (this.collection) {
            this.queue = this.utilitySvc.getLeafNodes(this.collection, []);
          }
          if (this.collection) {
            this.storage.setLocalStorage(
              localStorageConstants.COLLECTION_DATA,
              this.collection
            );
          }
        }
        if (this.resourceId) {
          await this.processCurrentResourceChange();
        }
      }
    );

    this.viewerDataServiceSubscription =
      this.viewerDataSvc.changedSubject.subscribe(async (_data) => {
        if (this.resourceId !== this.viewerDataSvc.resourceId) {
          this.resourceId = this.viewerDataSvc.resourceId;
          await this.processCurrentResourceChange();
          this.checkIndexOfResource();
        }
      });
    this.viewerDataServiceSubscription =
      this.viewerDataSvc.scromChangeSubject.subscribe(
        async (data) => {
          if (data) {
            this.commonUtilService.addLoader(
              20000,
              "Please wait! Content requested is loading"
            );
            this.isLoading = true;
            if (
              this.playerStateService.trigger$.getValue() === undefined ||
              this.playerStateService.trigger$.getValue() === "not-triggered"
            ) {
              await this.scromUpdateCheck(data);
              console.log(
                "player state",
                this.playerStateService.isResourceCompleted(),
                this.playerStateService.getNextResource()
              );
              setTimeout(() => {
                if (this.playerStateService.isResourceCompleted()) {
                  const nextResource =
                    this.playerStateService.getNextResource();
                  if (!_.isNull(nextResource)) {
                    this.router
                      .navigate([nextResource], {
                        queryParamsHandling: "preserve",
                      })
                      .then(() => {
                        console.log(
                          "This block will be executed after navigation is complete"
                        );
                        this.commonUtilService.removeLoader();
                        this.playerStateService.trigger$.complete();
                        this.isLoading = false;
                      });
                  }
                }
              });
            }
          }
        },
        (err) => {
          this.commonUtilService.removeLoader();
          this.isLoading = false;
          console.log(
            "this.viewerDataSvc.scromChangeSubject.subscribe failed",
            err
          );
        }
      );
    this.event.subscribe("callVieweToc", async (status) => {
      await this.scromUpdateCheck(status);
    });
  }
  downloadResource(content: any) {
    // console.log(content)

    let type;
    let filename;
    if (
      content.type.toLowerCase() == "pdf" ||
      content.type.toLowerCase() == "lecture"
    ) {
      type = "application/pdf";
      filename = `${content.title}.pdf`;
      this.downloadOtherContent(type, filename, content);
    }
    if (content.type.toLowerCase() == "video") {
      type = "application/mp4";
      filename = `${content.title}.mp4`;
      this.downloadVedio(type, filename, content);
    }
  }

  downloadVedio(type, name, content) {
    const url = content.artifactUrl;
    this.viewSvc.downloadContent(url).subscribe(
      (res) => {
        // console.log("download sucessfull", res)
        this.downloadedFile = res;
        // saveAs(res, content.title)
        const folderPath = cordova.file.externalRootDirectory;
        const downloadDirectory = `${folderPath}Download/`;
        this.writeToFile(downloadDirectory, name, this.downloadedFile);
      },
      (err) => {
        // console.log("download failed", err)
      }
    );
  }

  downloadOtherContent(type, name, content) {
    // console.log("fileUrl: ", content)
    const url = content.artifactUrl;
    this.http
      .sendRequest(url, { method: "get", responseType: "arraybuffer" })
      .then((httpResponse) => {
        // console.log("File dowloaded successfully", httpResponse)

        this.downloadedFile = new Blob([httpResponse.data], { type: type });
        if (this.downloadedFile == null) return;

        const folderPath = cordova.file.externalRootDirectory;
        const downloadDirectory = `${folderPath}Download/`;
        this.writeToFile(downloadDirectory, name, this.downloadedFile);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  writeToFile(downloadDirectory, filename, downloadedFile) {
    // console.log("write ", downloadDirectory, filename, downloadedFile)

    this.file
      .writeFile(downloadDirectory, filename, downloadedFile, { replace: true })
      .then((res) => {
        // console.log('File written successfully.');
        // console.log('rs write file', res);
        this.matSnackBar.open(
          this.translate.instant("DOWNLOADED_SUCCESSFULLY")
        );
      })
      .catch((err) => {
        // console.log('writeFile err', err)
        // this.matSnackBar.open(this.translate.instant('DOWNLOADED_SUCCESSFULLY'))
      });
  }
  public async scromUpdateCheck(data: any): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        this.batchId = data.batchId;
        const collectionId = data.collectionId;
        const collectionType = data.collectionType;

        if (collectionId && collectionType) {
          if (
            collectionType.toLowerCase() ===
            NsContent.EMiscPlayerSupportedCollectionTypes.PLAYLIST.toLowerCase()
          ) {
            this.collection = await this.getPlaylistContent(
              collectionId,
              collectionType
            );
          } else if (
            collectionType.toLowerCase() ===
            NsContent.EContentTypes.MODULE.toLowerCase() ||
            collectionType.toLowerCase() ===
            NsContent.EContentTypes.COURSE.toLowerCase() ||
            collectionType.toLowerCase() ===
            NsContent.EContentTypes.PROGRAM.toLowerCase()
          ) {
            this.collection = await this.getCollection(
              collectionId,
              collectionType
            );
          } else {
            this.isErrorOccurred = true;
          }
          if (this.collection) {
            this.queue = this.utilitySvc.getLeafNodes(this.collection, []);
          }
        }

        await this.processCurrentResourceChange();
        this.checkIndexOfResource();

        resolve(); // Resolve the Promise to indicate completion
      } catch (error) {
        reject(error); // Reject the Promise if something goes wrong
      }
    });
  }

  checkIndexOfResource() {
    if (this.collection) {
      const index = this.queue.findIndex(
        (x) => x.identifier === this.resourceId
      );
      this.generateInteractTelemetry();
      this.scrollToUserView(index);
    }
  }
  async ngOnChanges() {
    this.processCollectionForTree();
  }
  scrollToUserView(index: number) {
    setTimeout(() => {
      if (index > 3) {
        if (this.highlightItem.nativeElement.classList.contains("li-active")) {
          const highlightItemOffset =
            this.highlightItem.nativeElement.offsetTop;
          const outerClientHeight = this.outer.nativeElement.clientHeight;
          const liItemHeight = this.highlightItem.nativeElement.clientHeight;

          if (outerClientHeight < highlightItemOffset + liItemHeight) {
            this.outer.nativeElement.scrollTop =
              this.highlightItem.nativeElement.offsetTop;
          } else {
            this.outer.nativeElement.scrollTop = 0;
          }

          if (highlightItemOffset > 535 && this.reverse === "next") {
            this.outer.nativeElement.scrollTop =
              this.highlightItem.nativeElement.offsetTop;
            this.outer.nativeElement.scrollTop = window.innerHeight;
            this.highlightItem.nativeElement.offsetTop = 300;
            this.highlightItem.nativeElement.scrollTop = 300;
            if (highlightItemOffset - window.innerHeight > 80) {
              window.scrollTo(0, 80);
            }
          } else {
            if (
              this.highlightItem.nativeElement.offsetTop +
              this.outer.nativeElement.offsetTop >
              window.innerHeight
            ) {
              this.outer.nativeElement.scrollTop =
                this.highlightItem.nativeElement.offsetTop;
            }
          }
        }
      }
    }, 300);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.checkIndexOfResource();
    }, 300);
  }
  // updateSearchModel(value) {
  //   this.searchModel = value
  //   // this.searchModelChange.emit(this.searchModel)
  // }
  sendStatus(content: any) {
    this.viewSvc.editResourceData(content);
  }

  // private getContentProgressHash() {
  //   this.contentProgressSvc.getProgressHash().subscribe(progressHash => {
  //     this.contentProgressHash = progressHash
  //   })
  // }
  // @HostListener('window:resize', ['$event'])
  // onResize(event: any) {
  //   if (event.target.innerWidth < 600) {
  //     this.minimizenav()
  //   }
  // }
  ngOnDestroy() {
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe();
    }
    if (this.viewerDataServiceSubscription) {
      this.viewerDataServiceSubscription.unsubscribe();
    }

    if (this.isAshaSubscription) {
      this.isAshaSubscription.unsubscribe();
    }
    // if(this.subscription) {
    //   this.subscription.unsubscribe();
    // }
    if (navigator.onLine) {
      this.contentSvc.messageSource.next(undefined);
      this.playerStateService.playerState.next(undefined);
    }
    this.commonUtilService.removeLoader();
  }
  changeTocMode() {
    if (this.tocMode === "FLAT") {
      this.tocMode = "TREE";
      // this.processCollectionForTree()
    } else {
      this.tocMode = "FLAT";
    }
  }

  private async processCurrentResourceChange() {
    if (this.collection && this.resourceId) {
      await this.processCollectionForTree();
      //this.expandThePath()
    }
  }

  private async getCollection(
    collectionId: string,
    _collectionType: string
  ): Promise<IViewerTocCard | null> {
    const option = { contentId: collectionId, hierarchyInfo: null };
    let content: NsContent.IContent | null = null;

    if (!navigator.onLine) {
      const data: any = await this.contentService
        .getChildContents(option)
        .toPromise();
      content = this.updateDataRecursively(data);
      console.log("content data from offline ", JSON.stringify(content));
    } else {
      try {
        content = await (this.forPreview
          ? this.contentSvc.fetchAuthoringContent(collectionId)
          : this.contentSvc.fetchContent(collectionId, "detail")
        ).toPromise();
        content = content.result.content;
      } catch (err) {
        switch (err.status) {
          case 403:
            this.errorWidgetData.widgetData.errorType = "accessForbidden";
            break;
          case 404:
            this.errorWidgetData.widgetData.errorType = "notFound";
            break;
          case 500:
            this.errorWidgetData.widgetData.errorType = "internalServer";
            break;
          case 503:
            this.errorWidgetData.widgetData.errorType = "serviceUnavailable";
            break;
          default:
            this.errorWidgetData.widgetData.errorType = "somethingWrong";
        }
      }
    }

    if (content) {
      if (content.gatingEnabled) {
        this.viewerDataSvc.setNode(content.gatingEnabled);
      }
      this.resourceContentTypeFunct(content.mimeType);
      this.collectionCard = this.createCollectionCard(content);
      const viewerTocCardContent = this.convertContentToIViewerTocCard(content);
      this.isFetching = false;
      return viewerTocCardContent;
    }

    this.isFetching = false;
    return null;
  }

  private updateDataRecursively(node) {
    if (node.contentData) {
      const updatedNode = {
        ...node,
        ...node.contentData,
        children: _.map(node.children, (child) =>
          this.updateDataRecursively(child)
        ),
      };
      if (updatedNode.children.length === 0) {
        delete updatedNode.children;
      }
      return updatedNode;
    }

    const updatedNode = {
      ...node,
      children: _.map(node.children, (child) =>
        this.updateDataRecursively(child)
      ),
    };

    if (updatedNode.children.length === 0) {
      delete updatedNode.children;
    }

    return updatedNode;
  }

  private async getPlaylistContent(
    collectionId: string,
    _collectionType: string
  ): Promise<IViewerTocCard | null> {
    try {
      const playlistFetchResponse = await this.contentSvc
        .fetchCollectionHierarchy("playlist", collectionId, 0, 1000)
        .toPromise();

      const content: NsContent.IContent = playlistFetchResponse.data;
      this.resourceContentTypeFunct(content.mimeType);
      this.collectionCard = this.createCollectionCard(content);
      const viewerTocCardContent = this.convertContentToIViewerTocCard(content);
      this.isFetching = false;
      return viewerTocCardContent;
    } catch (err) {
      switch (err.status) {
        case 403: {
          this.errorWidgetData.widgetData.errorType = "accessForbidden";
          break;
        }
        case 404: {
          this.errorWidgetData.widgetData.errorType = "notFound";
          break;
        }
        case 500: {
          this.errorWidgetData.widgetData.errorType = "internalServer";
          break;
        }
        case 503: {
          this.errorWidgetData.widgetData.errorType = "serviceUnavailable";
          break;
        }
        default: {
          this.errorWidgetData.widgetData.errorType = "somethingWrong";
          break;
        }
      }
      this.isFetching = false;
      return null;
    }
  }

  private convertContentToIViewerTocCard(
    content: NsContent.IContent
  ): IViewerTocCard {
    this.resourceContentTypeFunct(content.mimeType);
    return {
      identifier: content.identifier,
      viewerUrl: `${this.forPreview ? "/author" : ""
        }/viewer/${VIEWER_ROUTE_FROM_MIME(content.mimeType)}/${content.identifier
        }`,
      thumbnailUrl: content.appIcon,
      title: content.name,
      duration: content.duration,
      type: this.resourceContentType,
      complexity: content.complexityLevel,
      artifactUrl: content.artifactUrl,
      // tslint:disable
      completionPercentage: content.completionPercentage!,
      completionStatus: content.completionStatus!,
      // tslint:enable
      children:
        Array.isArray(content.children) && content.children.length
          ? content.children.map((child) =>
            this.convertContentToIViewerTocCard(child)
          )
          : null,
    };
  }

  private createCollectionCard(
    collection: NsContent.IContent | NsContent.IContentMinimal
  ): ICollectionCard {
    this.resourceContentTypeFunct(collection.mimeType);
    return {
      type: this.resourceContentType,
      id: collection.identifier,
      title: collection.name,
      thumbnail: this.forPreview
        ? this.viewSvc.getAuthoringUrl(collection.appIcon)
        : collection.appIcon,
      subText1: collection.resourceType
        ? collection.resourceType
        : collection.contentType,
      subText2: collection.complexityLevel,
      duration: collection.duration,
      redirectUrl: this.getCollectionTypeRedirectUrl(
        collection.identifier,
        collection.displayContentType
      ),
    };
  }

  private getCollectionTypeRedirectUrl(
    identifier: string,
    contentType: string = "",
    displayContentType?: NsContent.EDisplayContentTypes
  ): string | null {
    let url: string | null;
    switch (displayContentType) {
      case NsContent.EDisplayContentTypes.PROGRAM:
      case NsContent.EDisplayContentTypes.COURSE:
      case NsContent.EDisplayContentTypes.MODULE:
        url = `${this.forPreview ? "/author" : "/app"
          }/toc/${identifier}/overview`;
        break;
      case NsContent.EDisplayContentTypes.GOALS:
        url = `/app/goals/${identifier}`;
        break;
      case NsContent.EDisplayContentTypes.PLAYLIST:
        url = `/app/playlist/${identifier}`;
        break;
      default:
        url = null;
    }
    if (contentType) {
      url = `${url}?primaryCategory=${contentType}`;
    }
    return url;
  }

  private async fetchContentHistory(): Promise<any> {
    const userId = _.get(this.configSvc, "userProfile.userId", "");
    const req: NsContent.IContinueLearningDataReq = {
      request: {
        userId,
        batchId: this.batchId,
        courseId: _.get(this.collection, "identifier", ""),
        contentIds: [],
        fields: ["progressdetails"],
      },
    };

    try {
      const apiData = await this.contentSvc
        .fetchContentHistoryV2(req)
        .toPromise();
      return apiData;
    } catch (error) {
      console.error("Error fetching content history from API:", error);
      throw error;
    }
  }

  private async processCollectionForTree() {
    this.isLoading = true;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = this.contentSvc.currentMessage
      .pipe(
        debounceTime(500),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe(async (data: any) => {
        console.log("Data of current message:", data);
        console.log("Processing collection for tree...");
        let makeTreeMethod;
        if (data !== undefined && data.progressData) {
          if (navigator.onLine) {
            const couseLocalProgressData =
              await this.courseOptimisticUiService.courseProgressRead(
                _.get(this.collection, "identifier", "")
              );
            console.log(
              ">>>>>>>> data check in player",
              couseLocalProgressData
            );
            makeTreeMethod = this.makeTreeWithStorage(couseLocalProgressData);
          } else {
            const couseLocalProgressData =
              await this.offlineCourseOptimisticService.courseProgressRead(
                _.get(this.collection, "identifier", "")
              );
            console.log(
              ">>>>>>>> data check in player",
              couseLocalProgressData
            );
            makeTreeMethod = this.makeTreeWithStorage(couseLocalProgressData);
          }
        } else {
          if (navigator.onLine) {
            const couseLocalProgressData =
              await this.courseOptimisticUiService.courseProgressRead(
                _.get(this.collection, "identifier", "")
              );
            console.log(
              ">>>>>>>> data check in player",
              couseLocalProgressData
            );
            const apiData = await this.fetchContentHistory();
            console.log(">>>>>>>>>>>>api data from server ", apiData);
            makeTreeMethod = this.makeTreeWithStorage(apiData);
          } else {
            const couseLocalProgressData =
              await this.offlineCourseOptimisticService.courseProgressRead(
                _.get(this.collection, "identifier", "")
              );
            console.log(
              ">>>>>>>> data check in player",
              couseLocalProgressData
            );
            makeTreeMethod = this.makeTreeWithStorage(couseLocalProgressData);
          }
        }
        await makeTreeMethod;
        this.makeTreeCompleted = true;
        console.log("this.makeTreeCompleted", this.makeTreeCompleted);
      });
  }

  public async makeTreeWithStorage(data?: any): Promise<void> {
    if (!this.collection || !this.collection.children) {
      return;
    }
    await this.processData(data);
    this.isLoading = false;
    this.handleConfirmationDialog();
  }

  public async processData(data?: any): Promise<void> {
    const collectionData = await this.storage.getLocalStorage(
      localStorageConstants.COLLECTION_DATA
    );
    this.collection = collectionData;

    if (!this.collection || !this.collection.children) {
      return;
    }
    await this.mergeData(this.collection.children, data);
    this.queue = this.utilitySvc.getLeafNodes(this.collection, []);
    console.log(">>>>>>", this.queue);
    await this.updateResourceChange();

    setTimeout(() => {
      this.expandPathWithDelay();
    }, 500);
  }

  public async mergeData(collection: any, data: any): Promise<void> {
    return new Promise<void>(async (resolve) => {
      for (let index = 0; index < collection.length; index++) {
        const child1 = collection[index];
        const foundContent = _.find(data?.result?.contentList, {
          contentId: child1.identifier,
        });

        if (foundContent) {
          this.updateChildNodeData(child1, foundContent);
        } else if (this.viewerDataSvc.getNode()) {
          await this.handleNodeWithoutFoundContent(child1, index, collection);
        } else {
          collection[index].disabledNode = this.viewerDataSvc.getNode();
        }

        if (child1.children) {
          await this.mergeChildData(child1.children, data, collection, index);
        }
      }
      resolve();
    });
  }

  public async updateChildNodeData(child: any, foundContent: any) {
    child.completionPercentage = _.defaultTo(
      foundContent.completionPercentage,
      0
    );
    child.completionStatus = foundContent.status;
    if (
      this.viewerDataSvc.getNode() &&
      child.completionPercentage === undefined
    ) {
      child.disabledNode = false;
    } else if (
      child.completionPercentage === undefined &&
      child.disabledNode === false
    ) {
      child.disabledNode = false;
    } else if (this.viewerDataSvc.getNode() && child.completionPercentage > 0) {
      child.disabledNode = false;
    } else if (
      this.viewerDataSvc.getNode() &&
      child.completionPercentage === 0
    ) {
      child.disabledNode = false;
    }
  }

  public async handleNodeWithoutFoundContent(
    child: any,
    index: any,
    element: any
  ) {
    if (index === 0) {
      await this.handleFirstNode(child, element, index);
    } else {
      // Check if the previous node exists and if its completionPercentage is 100
      if (
        element[index - 1] &&
        element[index - 1].completionPercentage === 100
      ) {
        element[index].disabledNode = false;
      } else {
        element[index].disabledNode = this.viewerDataSvc.getNode();

        // Handle the next node in the collection
        if (element[index + 1]) {
          element[index + 1].disabledNode = true;
        }
      }
    }
  }

  public async handleFirstNode(child: any, element: any, index: any) {
    element[index].disabledNode = false;

    if (child.completionPercentage === 100 && element && element[index + 1]) {
      element[index + 1].disabledNode = false;
    } else if (element && element[index + 1]) {
      element[index + 1].disabledNode = true;
    }
  }

  public async mergeChildData(
    children: any,
    data: any,
    element: any,
    index: any
  ) {
    for (let cindex = 0; cindex < children.length; cindex++) {
      const child2 = children[cindex];
      const foundContent2 = _.find(data?.result?.contentList, {
        contentId: child2.identifier,
      });

      if (foundContent2) {
        await this.updateChildNodeData(child2, foundContent2);
      } else {
        await this.handleChildNodeWithoutFoundContent(
          child2,
          index,
          element,
          cindex
        );
      }
    }
  }

  public async handleChildNodeWithoutFoundContent(
    child: any,
    index: any,
    element: any,
    cindex: any
  ): Promise<void> {
    if (
      element[index - 1] && element[index - 1].children &&
      element[index - 1].children[element[index - 1].children.length - 1]
        .completionPercentage === 100
    ) {
      await this.handleCompletedChildNode(child, index, element, cindex);
    } else {
      await this.handleIncompleteChildNode(child, index, element, cindex);
    }
  }

  public async handleCompletedChildNode(
    child: any,
    index: any,
    element: any,
    cindex: any
  ): Promise<void> {
    if (element[index].children.length > 0) {
      if (cindex === 0) {
        element[index].children[cindex].disabledNode = false;
      } else if (
        element[index].children[cindex - 1] &&
        element[index].children[cindex - 1].completionPercentage === 100
      ) {
        element[index].children[cindex].disabledNode = false;
      } else if (this.viewerDataSvc.getNode()) {
        element[index].children[cindex].disabledNode = true;
      } else {
        element[index].children[cindex].disabledNode = false;
      }
    }
  }

  public async handleIncompleteChildNode(
    child: any,
    index: any,
    element: any,
    cindex: any
  ): Promise<void> {
    if (element[index].children.length > 0) {
      if (
        element[index].children[cindex - 1] &&
        element[index].children[cindex - 1].completionPercentage === 100
      ) {
        element[index].children[cindex].disabledNode = false;
      } else if (this.viewerDataSvc.getNode()) {
        element[index].children[cindex].disabledNode = true;
      } else {
        element[index].children[cindex].disabledNode = false;
      }
    }
  }

  handleConfirmationDialog() {
    if (!_.get(this.activatedRoute, "snapshot.queryParams.competency", false)) {
      console.log("this.collectionId", this.collectionId);
      this.showConfirmmodalDialog();
    }
  }

  private expandPathWithDelay = () => {
    this.nestedDataSource.data = this.collection.children;
    this.pathSet = new Set();
    if (this.resourceId) {
      of(true)
        .pipe(delay(2000))
        .subscribe(() => {
          this.expandThePath();
          this.isLoading = false;
        });
    }
  };

  handleDialog() {
    let openDilogRef = this.dialog.getDialogById("confirmModal");
    if (openDilogRef) {
      this.dialog.closeAll();
    }
  }

  async showConfirmmodalDialog() {
    if (!this.playerStateService.isResourceCompleted()) {
      return;
    }
    let currentCollectionId = this.contentSvc.collectionId;
    console.log("currentCollectionId in dialog box ", currentCollectionId);
    const dilogData = {
      courseId: currentCollectionId,
    };
    console.log("opening the funtion confirm modal for non quiz");
    const [optimisticDataResponse, offlineResponse] = await Promise.all([
      this.courseOptimisticUiService.getUserEnrollCourse(
        currentCollectionId,
        this.configSvc.userProfile.userId
      ),
      this.offlineCourseOptimisticService.fetchUserEnrolledCourse(
        currentCollectionId
      ),
    ]);

    console.log("Local Data Response:", optimisticDataResponse);
    console.log("Offline Data Response:", offlineResponse);

    const getCourses = (response: any) => _.get(response, "result.courses", []);
    const findCourse = (courses: any[]) =>
      _.find(courses, { courseId: currentCollectionId });

    const optimisticCourse = findCourse(getCourses(optimisticDataResponse));
    const offlineCourse = findCourse(getCourses(offlineResponse));

    if (!optimisticCourse && !offlineCourse) return;
    if (
      optimisticCourse?.completionPercentage === 100 ||
      offlineCourse?.completionPercentage === 100
    ) {
      let currentBatchId = this.batchId;
      const nextResource = this.playerStateService.getNextResource();
      if (
        (_.isEmpty(nextResource) || _.isNull(nextResource)) &&
        this.contentSvc.showConformation &&
        _.isNull(this.confirmationDialog)
      ) {
        let openDilogRef = this.dialog.getDialogById("confirmModal");
        if (!openDilogRef && this.router.url.includes("viewer")) {
          this.updateAsha(100);
          const confirmationDialog = this.dialog.open(ConfirmmodalComponent, {
            id: "confirmModal",
            width: "542px",
            panelClass: "overview-modal",
            disableClose: true,
            data: {
              request: dilogData,
              message: this.translate.instant(
                "CONGRATULATIONS_COMPLETED_COURSE"
              ),
            },
          });

          confirmationDialog.afterClosed().subscribe((res: any) => {
            if (res && res.event === "CONFIRMED") {
              this.dialog.closeAll();
              if (this.isAsha == true) {
                this.openAshaModal();
                // this.router.navigate([`page/home`])
              } else {
                this.router.navigate(
                  [`/app/toc/${currentCollectionId}/overview`],
                  {
                    queryParams: {
                      primaryCategory: "Course",
                      batchId: currentBatchId,
                    },
                  }
                );
              }

              this.ngOnDestroy();
            } else if (res && res.event === "close-complete") {
              this.dialog.closeAll();
            }

            if (this.isAsha == true) {
              this.openAshaModal();
              // this.router.navigate([`page/home`])
            }
            this.event.publish("makeAPICall", true);
          });
        }
      }
    }
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
    console.log("nextData", nextData, nextLevel);
    if (assessmentModelOpen !== null && assessmentModelOpen !== undefined) {
      assessmentModelOpen.close();
    }
    if (openDilogRef) {
      openDilogRef.close();
    }

    console.log("updated value", currentAshaData);
    const ashaCourses = this.dialog.open(CompleteCoursesModalComponent, {
      id: "completeCoursesModal",
      width: "542px",
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
   
    ashaCourses.afterClosed().subscribe(async(res: any) => {
      if (res && res.event === "CLOSE") {
        this.dialog.closeAll();
        await this.audioService.stopAllAudio()
        this.router.navigate([`page/home`]);
      }
      if (res && res.event === "STARTNEXTCOURSE") {
        // navigate to next course overview page
        await this.audioService.stopAllAudio()
        this.navigateToNextAshaCourses(currentAshaCardData, res);
      }
    });
  }
  
  navigateToNextAshaCourses(currentAshaCardData, data) {
    let nextCourseId;
    const competencyId = Number(data.competencyId);
    const nextLevelId = Number(data.nextLevelId); // 👈 Use directly
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
      const batchId = navigationdata.batches[0]?.batchId;

      const ashaData = {
        isAsha: true,
        userid: this.configSvc.userProfile.userId || "",
        batchid: batchId,
        contentid: navigationdata.identifier,
        competencylevel: nextLevelId,
        completionpercentage: 0,
        progress: "course",
        competencyid: competencyId,
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


  updateAsha(competedPercentage) {
    let ashaData = this.cordovasvc.getAshaData();

    // this.isAshaSubscription = this.cordovasvc.isAsha$.subscribe((value) => {
    console.log("Is ASHA:", ashaData);
    if (ashaData.isAsha == true) {
      this.isAsha = true;
      let req = {
        userid: ashaData.userid,
        courseid: ashaData.courseid,
        batchid: this.activatedRoute.snapshot.queryParams.batchId,
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

  async updateResourceChange() {
    const currentIndex = this.queue.findIndex(
      (c) => c.identifier === this.resourceId
    );
    const next =
      currentIndex + 1 < this.queue.length
        ? this.queue[currentIndex + 1].viewerUrl
        : null;
    const nextContentId =
      currentIndex + 1 < this.queue.length
        ? this.queue[currentIndex + 1].identifier
        : null;
    const prev =
      currentIndex - 1 >= 0 ? this.queue[currentIndex - 1].viewerUrl : null;
    const nextTitle =
      currentIndex + 1 < this.queue.length
        ? this.queue[currentIndex + 1].title
        : null;
    const prevTitle =
      currentIndex - 1 >= 0 ? this.queue[currentIndex - 1].title : null;
    const currentPercentage =
      currentIndex < this.queue.length
        ? this.queue[currentIndex].completionPercentage
        : null;
    const prevPercentage =
      currentIndex - 1 >= 0
        ? this.queue[currentIndex - 1].completionPercentage
        : null;
    // tslint:disable-next-line:object-shorthand-properties-first
    this.playerStateService.setState({
      isValid: Boolean(this.collection),
      // tslint:disable-next-line:object-shorthand-properties-first
      prev,
      prevTitle,
      nextTitle,
      next,
      currentPercentage,
      prevPercentage,
      nextContentId,
    });
  }

  resourceContentTypeFunct(type: any): void {
    if (
      type === "application/vnd.ekstep.content-collection" ||
      type === "application/pdf"
    ) {
      this.resourceContentType = "Lecture";
    } else if (type === "application/quiz" || type === "application/json") {
      this.resourceContentType = "Assessment";
    } else if (
      type === "application/html" ||
      type === "application/vnd.ekstep.html-archive"
    ) {
      this.resourceContentType = "Scrom";
    } else if (type === "application/x-mpegURL" || type === "video/mp4") {
      this.resourceContentType = "Video";
    } else if (type === "audio/mpeg") {
      this.resourceContentType = "Audio";
    } else if (
      type === "video/x-youtube" ||
      type === "text/x-url" ||
      type === "application/web-module"
    ) {
      this.resourceContentType = "Link";
    } else {
      this.resourceContentType = "Course";
    }
  }

  expandThePath() {
    if (this.collection && this.resourceId) {
      const path = this.utilitySvc.getPath(this.collection, this.resourceId);
      this.pathSet = new Set(
        path.map((u: { identifier: any }) => u.identifier)
      );
      path.forEach((node: IViewerTocCard) => {
        this.nestedTreeControl.expand(node);
      });
    }
  }

  // minimizenav() {
  //   this.hidenav.emit(false)
  //   this.hideSideNav = !this.hideSideNav
  // }

  public progressColor(): string {
    return "#1D8923";
  }

  generateInteractTelemetry() {
    this.telemetryObject = {
      id: this.collection.identifier,
      type: this.resourceContentType,
      version: '',
    };
    const value = new Map();
    value["identifier"] = this.collection.identifier;
    value["contentType"] = this.resourceContentType;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      Environment.PLAYER,
      PageId.MODULE_DETAILS,
      this.telemetryObject,
      value
    )
  }
}
