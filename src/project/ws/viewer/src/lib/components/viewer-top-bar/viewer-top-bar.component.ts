import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, OnChanges, Inject } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs'
import { ViewerDataService } from '../../viewer-data.service'
import { PlayerStateService } from '../../player-state.service'
import { WidgetContentService } from '../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service'
import { ViewerUtilService } from '../../viewer-util.service'
import { NsContent } from '../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import * as _ from 'lodash'
import { ContentService } from '@project-sunbird/sunbird-sdk'
import { NsPage } from '../../../../../../../library/ws-widget/utils/src/lib/resolvers/page.model'
import { ConfigurationsService } from '../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { ValueService } from '../../../../../../../library/ws-widget/utils/src/lib/services/value.service'
@Component({
  selector: 'viewer-viewer-top-bar',
  templateUrl: './viewer-top-bar.component.html',
  styleUrls: ['./viewer-top-bar.component.scss'],
})
export class ViewerTopBarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() frameReference: any
  @Input() forPreview = false
  @Output() toggle = new EventEmitter()
  private viewerDataServiceSubscription: Subscription | null = null
  private paramSubscription: Subscription | null = null
  private viewerDataServiceResourceSubscription: Subscription | null = null
  appIcon: SafeUrl | null = null
  isTypeOfCollection = false
  collectionType: string | null = null
  prevResourceUrl: string | null = null
  nextResourceUrl: string | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  resourceId: string = (this.viewerDataSvc.resourceId as string) || ''
  resourceName: string | null = this.viewerDataSvc.resource ? this.viewerDataSvc.resource.name : ''
  collectionId = ''
  logo = true
  isPreview = false
  forChannel = false
  collection: any
  collectionCard: any
  @Input() screenContent: NsContent.IContent | null = null
  // @Input() enableFullScreen: any
  public isInFullScreen = false
  obj: NsContent.IContent | null = null
  isAuthor = false
  @Output() fsState: EventEmitter<boolean> = new EventEmitter()
  isSmall = false
  collectionIdentifier: any
  constructor(
    private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private configSvc: ConfigurationsService,
    private viewerDataSvc: ViewerDataService,
    private playerStateSvc: PlayerStateService,
    private valueSvc: ValueService,
    private contentSvc: WidgetContentService,
    private viewerSvc: ViewerUtilService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
  ) {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      // this.logo = !isXSmall
      this.isSmall = isXSmall
    })
  }

  ngOnChanges() {
    if (this.screenContent !== null) {
      this.obj = this.screenContent
    }

  }

  async ngOnInit() {
    if (window.location.href.includes('/channel/')) {
      this.forChannel = true
    }
    if (window.location.href.includes('/author/')) {
      this.isAuthor = true
    }
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
    this.collectionType = this.activatedRoute.snapshot.queryParams.collectionType
    // if (this.configSvc.rootOrg === EInstance.INSTANCE) {
    // this.logo = false
    // }

    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    this.collectionIdentifier = collectionId
    const collectionType = this.activatedRoute.snapshot.queryParams.collectionType
    if (collectionId && collectionType) {
      // if (
      //   collectionType.toLowerCase() ===
      //   NsContent.EMiscPlayerSupportedCollectionTypes.PLAYLIST.toLowerCase()
      // )
      //  {
      // this.collection = this.getPlaylistContent(collectionId, collectionType)
      this.paramSubscription = this.activatedRoute.queryParamMap.subscribe(async params => {
        this.collectionId = params.get('collectionId') as string
        this.isPreview = params.get('preview') === 'true' ? true : false
      })
      try {
        if(!navigator.onLine){
          const option = { contentId: collectionId, hierarchyInfo: null };
          const data: any = await this.contentService.getChildContents(option).toPromise();
          this.collection =  this.updateDataRecursively(data);
        }else{
          this.contentSvc
          .fetchContent(collectionId).subscribe((data: any) => {
            this.collection = data.result.content
            if (this.configSvc.instanceConfig) {
              this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.configSvc.instanceConfig.logos.appBottomNav,
              )
            }
            // tslint:disable-next-line:no-shadowed-variable
            this.viewerDataServiceSubscription = this.playerStateSvc.playerState.subscribe(data => {
              if(data){
                this.prevResourceUrl = data.prevResource
                this.nextResourceUrl = data.nextResource
                if (this.resourceId !== this.viewerDataSvc.resourceId) {
                  this.resourceId = this.viewerDataSvc.resourceId as string
                  this.resourceName = this.viewerDataSvc.resource ? this.viewerDataSvc.resource.name : ''
                }
              }
             
            })

            this.viewerDataServiceResourceSubscription = this.viewerDataSvc.changedSubject.subscribe(
              _data => {
                this.resourceId = this.viewerDataSvc.resourceId as string
                this.resourceName = this.viewerDataSvc.resource ? this.viewerDataSvc.resource.name : ''
              },
            )
            this.viewerSvc.castResource.subscribe(user => this.screenContent = user)
          })
        }
        
      } catch (e) {
        // TODO  // console.log(e)
      }
    }

    // this.viewerDataSubscription = this.viewerSvc
    // .getContent(this.activatedRoute.snapshot.paramMap.get('resourceId') || '')
    // .subscribe(data => {
    //   this.pdfData = data
    //   // if (this.pdfData) {
    //   //   this.formDiscussionForumWidget(this.pdfData)
    //   //   if (this.discussionForumWidget) {
    //   //     this.discussionForumWidget.widgetData.isDisabled = true
    //   //   }
    //   // }
    // }

  }
  private updateDataRecursively(node) {
    if (node.contentData) {
      const updatedNode = {
        ...node,
        ...node.contentData,
        children: _.map(node.children, child => this.updateDataRecursively(child))
      };
      if (updatedNode.children.length === 0) {
        delete updatedNode.children;
      }
      return updatedNode;
    }

    const updatedNode = {
      ...node,
      children: _.map(node.children, child => this.updateDataRecursively(child))
    };

    if (updatedNode.children.length === 0) {
      delete updatedNode.children;
    }

    return updatedNode;
  }
  fullScreenState(fsState) {
    this.isInFullScreen = fsState.state
    this.fsState.emit(fsState.state)
  }

  ngOnDestroy() {
    if (this.viewerDataServiceSubscription) {
      this.viewerDataServiceSubscription.unsubscribe()
    }
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe()
    }
    if (this.viewerDataServiceResourceSubscription) {
      this.viewerDataServiceResourceSubscription.unsubscribe()
    }
  }

  //   print(collection1:any){
  //  //TODO   // console.log(collection1)
  //   }
  toggleSideBar() {
    this.toggle.emit()
  }

  back() {
    try {
      if (window.self !== window.top) {
        return
      }
      window.history.back()
    } catch (_ex) {
      window.history.back()
    }

  }
}
