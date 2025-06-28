import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { interval, merge, Subject, Subscription } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { ViewerUtilService } from '../../../../../../project/ws/viewer/src/lib/viewer-util.service'
import { ROOT_WIDGET_CONFIG } from '../collection.config'
import { NsContent } from '../_services/widget-content.model'
import { WidgetContentService } from '../_services/widget-content.service'
import { IWidgetsPlayerPdfData } from './player-pdf.model'
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { AuthService, DeviceInfo, Rollup, SharedPreferences, TelemetryObject } from '@project-sunbird/sunbird-sdk'
import * as _ from 'lodash'
import { OnlineSqliteService } from '../../../../../../app/modules/shared/services/online-sqlite.service'
import { SqliteService } from '../../../../../../app/modules/shared/services/sqlite.service'
import { CourseOptimisticUiService } from '../../../../../../app/modules/shared/services/course-optimistic-ui.service'
import { OfflineCourseOptimisticService } from '../../../../../../app/modules/shared/services/offline-course-optimistic.service'
import { WidgetBaseComponent } from '../../../../../../library/ws-widget/resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.model'
import { EventService } from '../../../../../../library/ws-widget/utils/src/lib/services/event.service'
import { ConfigurationsService } from '../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { EnqueueService } from '../../../../../../library/ws-widget/utils/src/lib/services/enqueue.service'
import { WsEvents } from '../../../../../../library/ws-widget/utils/src/lib/services/event.model'
import { PageId, TelemetryGeneratorService } from '../../../../../../services'
@Component({
  selector: 'ws-widget-player-pdf',
  templateUrl: './player-pdf.component.html',
  styleUrls: ['./player-pdf.component.scss'],
})
export class PlayerPdfComponent extends WidgetBaseComponent
  implements OnInit, AfterViewInit, OnDestroy, NsWidgetResolver.IWidgetData<any> {
  @Input() widgetData!: IWidgetsPlayerPdfData
  @ViewChild('fullScreenContainer', { static: true }) fullScreenContainer: ElementRef;
  @ViewChild('input') input: any; 
  containerSection!: ElementRef<HTMLElement>

  DEFAULT_SCALE = 1.0
  MAX_SCALE = 3
  MIN_SCALE = 0.2
  CSS_UNITS = 96 / 72
  totalPages = 0
  currentPage = new UntypedFormControl(1)
  // zoom = new FormControl(this.DEFAULT_SCALE)
  isSmallViewPort = false
  realTimeProgressRequest = {
    content_type: 'Resource',
    current: ['0'],
    max_size: 0,
    mime_type: NsContent.EMimeTypes.PDF,
    user_id_type: 'uuid',
  }
  current: string[] = []
  identifier: string | null = null
  enableTelemetry = false
  private activityStartedAt: Date | null = null
  private renderSubject = new Subject()
  private lastRenderTask: any | null = null
  // Subscriptions
  private contextMenuSubs: Subscription | null = null
  private renderSubscriptions: Subscription | null = null
  private runnerSubs: Subscription | null = null
  private routerSubs: Subscription | null = null
  public isInFullScreen = false
  contentData: any
  pdfHeight = '200px'
  pdfZoom = '28%'
 
  constructor(
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences: SharedPreferences,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private eventSvc: EventService,
    private contentSvc: WidgetContentService,
    private viewerSvc: ViewerUtilService,
    private configSvc: ConfigurationsService,
    private enqueueService: EnqueueService,
    private onlineSqliteService:OnlineSqliteService,
    private sqliteService:SqliteService,
    private courseOptimisticUiService: CourseOptimisticUiService,
    private offlineCourseOptimisticService:OfflineCourseOptimisticService,
    private telemetryGeneratorService: TelemetryGeneratorService 
  ) {
    super()
    pdfDefaultOptions.assetsFolder = 'bleeding-edge';
    // this.screenOrientation.unlock();
    // this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }

  // changeScale(val: 'zoomin' | 'zoomout') {
  //   const currentZoom = this.zoom.value
  //   const step = 0.1
  //   if (val === 'zoomin') {
  //     this.zoom.setValue(currentZoom + step)
  //   } else {
  //     this.zoom.setValue(currentZoom - step)
  //   }
  // }

  fullScreenState(fsState) {
    this.isInFullScreen = fsState.state
    if (fsState.state) {
      this.pdfHeight = 'calc(100vh - 50px)'
      this.pdfZoom = '40%'
    } else {
      this.pdfHeight = '200px'
      this.pdfZoom = '28%'
      const diplayedPagesCount = fsState.mode.includes('portrait') ? 2 : 1
      if (this.currentPage.value + diplayedPagesCount >= this.totalPages) {
        setTimeout(() => {
          this.currentPage.setValue(this.totalPages)
        },500)
      }
    }
    // this.renderSubject.next()
  }
  

  ngOnInit() {
    // this.zoom.disable()
    this.currentPage.disable()
    // this.valueSvc.isLtMedium$.subscribe(ltMedium => {
    //   if (ltMedium) {
    //     this.zoom.setValue(0.5)
    //   }
    // })
    // this.valueSvc.isXSmall$.subscribe(isXSmall => {
    //   if (isXSmall) {
    //     this.zoom.setValue(0.4)
    //   }
    // })

    this.widgetData.disableTelemetry = false
    if (this.widgetData.readValuesQueryParamsKey) {
      const keys = this.widgetData.readValuesQueryParamsKey
      this.activatedRoute.queryParamMap.pipe(distinctUntilChanged()).subscribe(params => {
        const pageNumber = Number(params.get(keys.pageNumber))
        const zoom = Number(params.get(keys.zoom))
        if (pageNumber > 0 && pageNumber <= this.totalPages) {
          this.currentPage.setValue(pageNumber)
        }
        // if (zoom > 0) {
        //   this.zoom.setValue(zoom)
        // }
      })
    }

    this.renderSubscriptions = merge(
      // this.zoom.valueChanges.pipe(distinctUntilChanged()),
      this.currentPage.valueChanges.pipe(distinctUntilChanged()),
      this.renderSubject.asObservable(),
    )

      .pipe(debounceTime(250))
      .subscribe(async _ => {
        if (this.widgetData.readValuesQueryParamsKey) {
          const { zoom, pageNumber } = this.widgetData.readValuesQueryParamsKey
          const params = this.activatedRoute.snapshot.queryParamMap
          if (
            // Number(params.get(zoom)) !== this.zoom.value ||
            Number(params.get(pageNumber)) !== this.currentPage.value
          ) {
            this.router.navigate([], {
              queryParams: {
                [pageNumber]: this.currentPage.value,
                // [zoom]: this.zoom.value,
              },
            })
          }
        }
        await this.render()
        setTimeout(() => this.preserveAllApiCalls(), 500)
      })

    if (!this.widgetData.disableTelemetry) {
      this.runnerSubs = interval(30000).subscribe(_ => {
        this.eventDispatcher(WsEvents.EnumTelemetrySubType.HeartBeat)
      })
      this.eventDispatcher(WsEvents.EnumTelemetrySubType.Init)
    }

  }

  ngAfterViewInit() {
    if (this.widgetData && this.widgetData.pdfUrl) {
      if (this.widgetData.identifier) {
        this.identifier = this.widgetData.identifier
      }
    }
    if (this.containerSection && this.containerSection.nativeElement.clientWidth < 400) {
      this.isSmallViewPort = true
    }
    document.addEventListener('textlayerrendered', _event => {
      const pdfLinks = document.getElementsByClassName('linkAnnotation')
      for (let i = 0; i < pdfLinks.length; i += 1) {
        if (pdfLinks[i].getElementsByTagName('a')[0] && !pdfLinks[i].getElementsByTagName('a')[0].classList.contains('internalLink')) {
          pdfLinks[i].getElementsByTagName('a')[0].setAttribute('target', 'blank')
        }
      }
    })
    if (this.input) {
      this.input.underlineRef.nativeElement.className = null;
    }
  }

  ngOnDestroy() {
    if (this.identifier) {
      this.fireRealTimeProgress(this.identifier)
    }
    if (this.contextMenuSubs) {
      this.contextMenuSubs.unsubscribe()
    }
    if (this.renderSubscriptions) {
      this.renderSubscriptions.unsubscribe()
    }
    if (this.runnerSubs) {
      this.runnerSubs.unsubscribe()
    }
    if (!this.widgetData.disableTelemetry) {
      this.eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded)
    }
    if (this.routerSubs) {
      this.routerSubs.unsubscribe()
    }
  }

  loadPageNum(pageNum: number) {
    // this.raiseTelemetry('pageChange')
    if (pageNum < 1 || pageNum > this.totalPages) {
      return
    }
    this.currentPage.setValue(pageNum)
    // if (!this.widgetData.disableTelemetry) {
    //   this.eventDispatcher(WsEvents.EnumTelemetrySubType.StateChange)
    // }

  }
  raiseTelemetry(action: string) {
    if (this.identifier) {
      this.eventSvc.raiseInteractTelemetry(action, 'click', {
        contentId: this.identifier,
      })
    }
  }

  fireRealTimeProgress(id: string) {
    if (this.totalPages > 0 && this.current.length > 0) {
      const realTimeProgressRequest:any = {
        ...this.realTimeProgressRequest,
        max_size: this.totalPages,
        current: this.current,
      }
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
        this.activatedRoute.snapshot.queryParams.batchId : this.widgetData.identifier

      const temp = [...realTimeProgressRequest.current]
      // const latest = parseFloat(temp.slice(-1) || '0')
      const latest = parseFloat(temp[temp.length - 1] || '0')
      const percentMilis = (latest / realTimeProgressRequest.max_size) * 100
      const percent = parseFloat(percentMilis.toFixed(2));
      if(!navigator.onLine) return;
      if (this.contentData && percent >= this.contentData.completionPercentage) {
        this.viewerSvc.realTimeProgressUpdate(id, realTimeProgressRequest, collectionId, batchId).subscribe((data) => {
          // this.contentSvc.changeMessage(
          //   {
          //     type: 'PDF',
          //     progressData: data.result
          //   }
          // )
        })
      }
      if (this.contentData === undefined && percent > 0) {
        this.viewerSvc.realTimeProgressUpdate(id, realTimeProgressRequest, collectionId, batchId).
        subscribe((data) => {
          this.contentSvc.changeMessage(
            {
              type: 'PDF',
              progressData: data.result
            }
          )
        })
      }
    }
    return
  }
  getContentData(data: any): any {
    return data['result']['contentList'].find((obj: any) => obj.contentId === this.identifier);
  }
  
  shouldUpdateRealTimeProgress(percent): boolean {
    return (this.contentData && percent >= this.contentData.completionPercentage) ||
           (this.contentData === undefined && percent > 0);
  }
  
  getCollectionAndBatchIds(): { collectionId: string, batchId: string } {
    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ||
                         this.widgetData.identifier;
    const batchId = this.activatedRoute.snapshot.queryParams.batchId ||
                    this.widgetData.identifier;
  
    return { collectionId, batchId };
  }
  
  async updateLocalProgressData(collectionId: string, percent: number): Promise<void> {
    await this.courseOptimisticUiService.insertCourseProgress(
      collectionId,
      this.identifier,
      this.configSvc.userProfile.userId,
      percent > 95 ? 100 : percent,
      this.getCollectionAndBatchIds().batchId,
      'PDF',
      this.identifier,
      percent > 95 ? 2 : 1
    );
    const couseLocalProgressData = await this.courseOptimisticUiService.courseProgressRead(collectionId);
    await this.courseOptimisticUiService.updateLastReadContentId(collectionId, this.identifier, couseLocalProgressData);
    await this.onlineSqliteService.updateResumeData(collectionId);
    const lpercent = Math.round(percent)
    if(lpercent > 0 && lpercent % 5 === 0){
      this.contentSvc.changeMessage({
        type: 'PDF',
        progressData: couseLocalProgressData.result
      });
    }
    
  }
  async updateOfflineLocalProgressData(collectionId: string, percent: number): Promise<void> {
    await this.offlineCourseOptimisticService.insertCourseProgress(
      collectionId,
      this.identifier,
      this.configSvc.userProfile.userId,
      percent > 95 ? 100 : percent,
      this.getCollectionAndBatchIds().batchId,
      'PDF',
      this.identifier,
      percent > 95 ? 2 : 1
    );
    const couseLocalProgressData = await this.offlineCourseOptimisticService.courseProgressRead(collectionId);
    await this.offlineCourseOptimisticService.updateLastReadContentId(collectionId, this.identifier, couseLocalProgressData);
    await this.sqliteService.updateResumeData(collectionId);
    const lpercent = Math.round(percent)
    if(lpercent > 0 && lpercent % 5 === 0){
      this.contentSvc.changeMessage({
        type: 'PDF',
        progressData: couseLocalProgressData.result
      });
    }
    
  }
  private async render(): Promise<boolean> {
    // if (!this.pdfContainer || this.pdfInstance === null) {
    //   return false
    // }
    // this.pdfContainer.nativeElement.innerHTML = ''
    // const page = await this.pdfInstance.getPage(this.currentPage.value)

    const pageNumStr = this.currentPage.value.toString()
    if (!this.current.includes(pageNumStr)) {
      this.current.push(pageNumStr)
    }
    // const viewport = page.getViewport({ scale: this.zoom.value })
    // this.pdfContainer.nativeElement.width = viewport.width
    // this.pdfContainer.nativeElement.height = viewport.height
    // this.lastRenderTask = new pdfjsViewer.PDFPageView({
    //   scale: viewport.scale,
    //   container: this.pdfContainer.nativeElement,
    //   id: this.currentPage.value,
    //   defaultViewport: viewport,
    //   textLayerFactory: new pdfjsViewer.DefaultTextLayerFactory(),
    //   annotationLayerFactory: new pdfjsViewer.DefaultAnnotationLayerFactory(),
    // })
    if (this.lastRenderTask) {
      // this.lastRenderTask.setPdfPage(page)
      this.lastRenderTask.draw()
    }
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    const req: NsContent.IContinueLearningDataReq = {
      request: {
        userId,
        batchId: this.activatedRoute.snapshot.queryParams.batchId,
        courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
        contentIds: [],
        fields: ['progressdetails'],
      },
    }
    const realTimeProgressRequest:any = {
      ...this.realTimeProgressRequest,
      max_size: this.totalPages,
      current: [(this.currentPage.value).toString()],
    }
    const temp:any = [...realTimeProgressRequest.current]
    // const latest = parseFloat(temp.slice(-1) || '0')
    const latest = parseFloat(temp[temp.length - 1] || '0')
    const percentMilis = (latest / realTimeProgressRequest.max_size) * 100
    const percent = parseFloat(percentMilis.toFixed(2))
    this.generateStartTelemetry(realTimeProgressRequest)

    if (navigator.onLine) {
      this.contentSvc.fetchContentHistoryV2(req).subscribe(
        async data => {
          if (!data) return true;
          this.contentData = this.getContentData(data);
    
          if (this.identifier && this.shouldUpdateRealTimeProgress(percent)) {
            const { collectionId, batchId } = this.getCollectionAndBatchIds();
            this.viewerSvc.realTimeProgressUpdate(this.identifier, realTimeProgressRequest, collectionId, batchId)
              .subscribe(() => {});
    
            console.log('pdf percentage', percent);
    
            if (percent > 0) {
              await this.updateLocalProgressData(collectionId, percent);
            }
          }
        }
      );
    } else {
      try {
        const response: any = await this.enqueueService.enqueue(
          this.identifier,
          this.activatedRoute.snapshot.queryParams.collectionId || '',
          this.activatedRoute.snapshot.queryParams.batchId,
          (percent < 95) ? 1 : 2, 
          percent > 95 ? 100 : 100,
        );
        const { collectionId } = this.getCollectionAndBatchIds();
        const contentPerentage = await this.offlineCourseOptimisticService.isContentIdExistsWithPercentage(collectionId, userId, this.identifier);
  
        if (!contentPerentage.exists && contentPerentage.completionPercentage === 0) {
          await this.updateOfflineLocalProgressData(collectionId, percent);
        }else if (contentPerentage.exists && contentPerentage.completionPercentage > 0 && contentPerentage.completionPercentage !== 100) {
          await this.updateOfflineLocalProgressData(collectionId, percent);
        }else if (contentPerentage.exists && contentPerentage.completionPercentage === 100) {
          await this.updateOfflineLocalProgressData(collectionId,  contentPerentage.completionPercentage);
        }
       
          
      } catch (error) {
        console.error('enqueue-error PDF - ', error);
      }
     
    }
    return true
  }
  
  

  




  // refresh() {
  //   this.renderSubject.next()
  // }

  private async loadDocument() {
    // const pdf = await PDFJS.getDocument(url).promise
    // this.pdfInstance = pdf
    // this.totalPages = this.pdfInstance.numPages
    // this.zoom.enable()
    this.currentPage.enable()
    this.currentPage.setValue(
      typeof this.widgetData.resumePage === 'number' &&
        this.widgetData.resumePage >= 1 &&
        this.widgetData.resumePage <= this.totalPages
        ? this.widgetData.resumePage
        : 1,
    )
    this.renderSubject.next()
    this.activityStartedAt = new Date()
    if (!this.widgetData.disableTelemetry) {
      this.eventDispatcher(WsEvents.EnumTelemetrySubType.Loaded)
    }

  }

  private eventDispatcher(
    eventType: WsEvents.EnumTelemetrySubType,
    activity: WsEvents.EnumTelemetryPdfActivity = WsEvents.EnumTelemetryPdfActivity.NONE,
  ) {
    if (this.widgetData.disableTelemetry) {
      return
    }
    const commonStructure: WsEvents.WsEventTelemetryPDF = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      from: {
        type: 'widget',
        widgetType: ROOT_WIDGET_CONFIG.player._type,
        widgetSubType: ROOT_WIDGET_CONFIG.player.pdf,
      },
      to: '',
      data: {
        eventSubType: eventType,
        activityType: activity,
        currentPage: this.currentPage.value,
        totalPage: this.totalPages,
        activityStartedAt: this.activityStartedAt,
      },
      passThroughData: this.widgetData.passThroughData,
    }

    switch (eventType) {
      case WsEvents.EnumTelemetrySubType.HeartBeat:
      case WsEvents.EnumTelemetrySubType.Init:
      case WsEvents.EnumTelemetrySubType.Loaded:
      case WsEvents.EnumTelemetrySubType.StateChange:
      case WsEvents.EnumTelemetrySubType.Unloaded:
        break
      default:
        return
    }
    if (this.enableTelemetry) {
      this.eventSvc.dispatchEvent(commonStructure)
    }
  }

  // Function which listens on relative link calls and trigger page load
  preserveAllApiCalls() {
    const links = Array.prototype.slice.call(document.getElementsByTagName('a'))
    for (let i = 0; i < links.length; i = i + 1) {
      if (links[i].className.includes('internalLink')) {
        // links[i].addEventListener('click', async (e: any) => {
        //   const layer = unescape((new URL(e.toElement.href).hash as string).slice(1))
        //   const pageIndex: any = JSON.parse(layer)
        //     ; (this.pdfInstance as any)
        //       .getPageIndex(pageIndex[0])
        //       .then((pageNumber: number) => {
        //         this.currentPage.setValue(pageNumber + 1)
        //       })
        //       .catch((ex: any) => {
        //         this.logger.error(ex)
        //       })
        // })
      }
    }
  }

  documentLoded(event) {
    if (event) {
      this.totalPages = event.pagesCount
      this.loadDocument()
    }
  }

  playerEvents(event){
    console.log('playerEvents-', event);
  }
  generateStartTelemetry(realTimeProgressRequest) {
      const telemetryObject = new TelemetryObject(
        realTimeProgressRequest.identifier,
        realTimeProgressRequest.mimeType,
        undefined
      );
      let objRollup = new Rollup();
      objRollup.l1 = realTimeProgressRequest.identifier;
      const value = new Map();
      value['progress'] = realTimeProgressRequest.current[0];
      value['total-page'] = realTimeProgressRequest.max_size;
      this.telemetryGeneratorService.generateStartTelemetry(
        PageId.PLAYER,
        telemetryObject,
        objRollup,
        undefined
      );
    }
}
