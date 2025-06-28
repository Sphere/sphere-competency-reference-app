import { Component, OnInit, OnDestroy, Inject } from '@angular/core'
import { Subscription } from 'rxjs'
import { AccessControlService } from '@ws/author'
import { ActivatedRoute } from '@angular/router'
import { ViewerUtilService } from '../../viewer-util.service'
import { Platform } from '@angular/cdk/platform'
import { ContentService } from '@project-sunbird/sunbird-sdk'
import { NsContent } from '../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import { NsWidgetResolver } from '../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.model'
import { IWidgetsPlayerMediaData } from '../../../../../../../library/ws-widget/collection/src/lib/_models/player-media.model'
import { NsDiscussionForum } from '../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.model'
import { ValueService } from '../../../../../../../library/ws-widget/utils/src/lib/services/value.service'
import { WidgetContentService } from '../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service'
import { ConfigurationsService } from '../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { Capacitor } from '@capacitor/core';
@Component({
  selector: 'viewer-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent implements OnInit, OnDestroy {
  private routeDataSubscription: Subscription | null = null
  private screenSizeSubscription: Subscription | null = null
  private viewerDataSubscription: Subscription | null = null
  forPreview = window.location.href.includes('/author/')
  isScreenSizeSmall = false
  videoData: NsContent.IContent | null = null
  isFetchingDataComplete = false
  isNotEmbed = true
  widgetResolverVideoData: NsWidgetResolver.IRenderConfigWithTypedData<
    IWidgetsPlayerMediaData
  > | null = null
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  batchId = this.activatedRoute.snapshot.queryParamMap.get('batchId');


  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private activatedRoute: ActivatedRoute,
    private valueSvc: ValueService,
    private viewerSvc: ViewerUtilService,
    private contentSvc: WidgetContentService,
    private platform: Platform,
    private accessControlSvc: AccessControlService,
    private configSvc: ConfigurationsService
  ) { }

  ngOnInit() {
    this.configSvc._showshrink.next(false)
    this.screenSizeSubscription = this.valueSvc.isXSmall$.subscribe(data => {
      this.isScreenSizeSmall = data
    })
    this.isNotEmbed =
      this.activatedRoute.snapshot.queryParamMap.get('embed') === 'true' ? false : true
    if (
      this.activatedRoute.snapshot.queryParamMap.get('preview') &&
      !this.accessControlSvc.authoringConfig.newDesign
    ) {
      this.viewerDataSubscription = this.viewerSvc
        .getContent(this.activatedRoute.snapshot.paramMap.get('resourceId') || '')
        .subscribe(data => {
          this.videoData = data
          if (this.videoData) {
            this.formDiscussionForumWidget(this.videoData)
          }
          this.widgetResolverVideoData = this.initWidgetResolverVideoData(this.videoData)
          let url = ''
          if (this.videoData.artifactUrl.indexOf('/content-store/') > -1) {
            url = `/apis/authContent/${new URL(this.videoData.artifactUrl).pathname}`
          } else {
            url = `/apis/authContent/${encodeURIComponent(this.videoData.artifactUrl)}`
          }
          this.widgetResolverVideoData.widgetData.url = this.videoData ? url : ''
          this.widgetResolverVideoData.widgetData.disableTelemetry = true
          this.isFetchingDataComplete = true
        })
    } else {
      if(!navigator.onLine){
        let option = { contentId:this.activatedRoute.snapshot.paramMap.get('resourceId')};
        this.contentService.getContentDetails(option).toPromise()
        .then((data: any) => {
          const basePath = Capacitor.convertFileSrc(data.basePath); // Converts to an accessible URL
          const artifactPath = Capacitor.convertFileSrc(data.contentData.artifactUrl); // Converts artifact URL
          data.contentData.artifactUrl = `${basePath}/${artifactPath}`;
          //data.contentData.artifactUrl = '_app_file_'+data.basePath+data.contentData.artifactUrl;
          this.syncData(data.contentData)
          console.log('video view getContentDetails offline-', data);
        })
      } else {
        this.routeDataSubscription = this.activatedRoute.data.subscribe(
          async data => {
            this.syncData(data.content.data)
            console.log('video view getContentDetails online-', data.content.data);
          }
        )
      }
    }
  }

  async syncData(data){
    this.widgetResolverVideoData = null
    this.videoData = data
    if (this.videoData) {
      this.formDiscussionForumWidget(this.videoData)
    }
    this.widgetResolverVideoData = this.initWidgetResolverVideoData(this.videoData as any)
    if (this.videoData && this.videoData.identifier) {
      if (this.activatedRoute.snapshot.queryParams.collectionId) {
        await this.fetchContinueLearning(
          this.activatedRoute.snapshot.queryParams.collectionId,
          this.videoData.identifier,
        )
      } else {
        await this.fetchContinueLearning(this.videoData.identifier, this.videoData.identifier)
      }
    }
    this.widgetResolverVideoData.widgetData.url = this.videoData
      ? this.forPreview
        ? this.viewerSvc.getAuthoringUrl(this.videoData.artifactUrl)
        : this.videoData.artifactUrl
      : ''
    this.widgetResolverVideoData.widgetData.resumePoint = this.getResumePoint(this.videoData)
    this.widgetResolverVideoData.widgetData.identifier = this.videoData
      ? this.videoData.identifier
      : ''
    this.widgetResolverVideoData.widgetData.mimeType = data.mimeType
    this.widgetResolverVideoData = JSON.parse(JSON.stringify(this.widgetResolverVideoData))
    if (this.videoData && this.videoData.artifactUrl.indexOf('content-store') >= 0) {
      await this.setS3Cookie(this.videoData.identifier)
    }
    this.isFetchingDataComplete = true
  }

  ngOnDestroy() {
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe()
    }
    if (this.screenSizeSubscription) {
      this.screenSizeSubscription.unsubscribe()
    }
    if (this.viewerDataSubscription) {
      this.viewerDataSubscription.unsubscribe()
    }
  }
  getResumePoint(content: NsContent.IContent | null) {
    if (content) {
      if (content.progress && content.progress.progressSupported && content.progress.progress) {
        return Math.floor(content.duration * content.progress.progress) || 0
      }
      return 0

    }
    return 0
  }

  initWidgetResolverVideoData(content: NsContent.IContent) {
    let isVideojs = false
    if (this.platform.IOS) {
      isVideojs = true
    } else if (!this.platform.WEBKIT && !this.platform.IOS && !this.platform.SAFARI) {
      isVideojs = true
    } else if (this.platform.ANDROID) {
      isVideojs = true
    } else {
      isVideojs = false
    }
    return {
      widgetType: 'player',
      widgetSubType: 'playerVideo',
      widgetData: {
        isVideojs,
        disableTelemetry: false,
        url: '',
        identifier: '',
        mimeType: content.mimeType,
        resumePoint: 0,
        continueLearning: true,
      },
      widgetHostClass: 'video-full',
    }
  }

  formDiscussionForumWidget(content: NsContent.IContent) {
    this.discussionForumWidget = {
      widgetData: {
        description: content.description,
        id: content.identifier,
        name: NsDiscussionForum.EDiscussionType.LEARNING,
        title: content.name,
        initialPostCount: 2,
        isDisabled: this.forPreview,
      },
      widgetSubType: 'discussionForum',
      widgetType: 'discussionForum',
    }
  }
  // async fetchContinueLearning(collectionId: string, videoId: string): Promise<boolean> {
  //   return new Promise(resolve => {
  //     this.contentSvc.fetchContentHistory(collectionId).subscribe(
  //       data => {
  //         if (data) {
  //           if (
  //             data.identifier === videoId &&
  //             data.continueData &&
  //             data.continueData.progress &&
  //             this.widgetResolverVideoData
  //           ) {
  //             this.widgetResolverVideoData.widgetData.resumePoint = Number(
  //               data.continueData.progress,
  //             )
  //           }
  //         }
  //         resolve(true)
  //       },
  //       () => resolve(true),
  //     )
  //   })
  // }

  async fetchContinueLearning(collectionId: string, videoId: string): Promise<boolean> {
    return new Promise(resolve => {
      let userId
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      const req: NsContent.IContinueLearningDataReq = {
        request: {
          userId,
          batchId: this.batchId,
          courseId: collectionId || '',
          contentIds: [],
          fields: ['progressdetails'],
        },
      }
      this.contentSvc.fetchContentHistoryV2(req).subscribe(
        data => {
          if (data && data.result && data.result.contentList.length) {
            for (const content of data.result.contentList) {
              if (
                content.contentId === videoId &&
                content.progressdetails &&
                content.progressdetails.current &&
                this.widgetResolverVideoData
              ) {
                this.widgetResolverVideoData.widgetData.resumePoint = Number(
                  content.progressdetails.current
                  // content.progressdetails.current.pop(),
                )
              }
            }
          }
          resolve(true)
        },
        () => resolve(true),
      )
    })
  }
  private async setS3Cookie(contentId: string) {
    await this.contentSvc
      .setS3Cookie(contentId)
      .toPromise()
      .catch(() => { })
    return
  }
}
