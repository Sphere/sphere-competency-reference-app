import { Component, Input, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { PlayerStateService } from '../../player-state.service'
import { NsContent } from '../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import { NsWidgetResolver } from '../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.model'
import { NsDiscussionForum } from '../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.model'
import { ConfigurationsService } from '../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'

@Component({
  selector: 'viewer-audio-native-container',
  templateUrl: './audio-native.component.html',
  styleUrls: ['./audio-native.component.scss'],
})
export class AudioNativeComponent implements OnInit {
  @Input() isScreenSizeSmall = false
  @Input() forPreview = false
  @Input() isFetchingDataComplete = false
  @Input() audioData: NsContent.IContent | null = null
  @Input() discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  @Input() defaultThumbnail = ''
  @Input() isPreviewMode = false
  isTypeOfCollection = false
  isRestricted = false
  prevResourceUrl: string | null = null
  nextResourceUrl: string | null = null
  collectionType: any
  viewerDataServiceSubscription: any
  prevTitle: string | null | undefined
  nextTitle: string | null | undefined
  collectionIdentifier: any

  constructor(private activatedRoute: ActivatedRoute, private configSvc: ConfigurationsService,
              private playerStateSvc: PlayerStateService) { }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        !this.configSvc.restrictedFeatures.has('disscussionForum')
    }
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false

    this.viewerDataServiceSubscription = this.playerStateSvc.playerState.subscribe(data => {

      this.prevTitle = data.previousTitle
      this.nextTitle = data.nextResTitle
      this.prevResourceUrl = data.prevResource
      this.nextResourceUrl = data.nextResource
    })
    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    this.collectionIdentifier = collectionId
  }
}
