import { Component, OnInit } from '@angular/core'
import { IWidgetsPlayerMediaData } from '../../../../../../../../library/ws-widget/collection/src/lib/_models/player-media.model'
import { NsWidgetResolver } from '../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.model'
import { ConfigurationsService } from '../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'

@Component({
  selector: 'ws-app-quick-tour',
  templateUrl: './quick-tour.component.html',
  styleUrls: ['./quick-tour.component.scss'],
})
export class QuickTourComponent implements OnInit {
  appLanguage = 'en'
  introVideos: any
  widgetResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    IWidgetsPlayerMediaData
  > = {
    widgetData: {
      url: '',
      autoplay: true,
      identifier: '',
    },
    widgetHostClass: 'video-full block vertical-height-without-nav',
    widgetSubType: 'playerVideo',
    widgetType: 'player',
  }

  constructor(private configSvc: ConfigurationsService) { }

  ngOnInit() {

    if (this.configSvc.instanceConfig) {
      this.introVideos = this.configSvc.instanceConfig.tourVideo
    }
    if (Object.keys(this.introVideos).length > 1) {
      this.appLanguage = (this.configSvc.activeLocale && this.configSvc.activeLocale.path) || ''
      if (this.appLanguage !== 'de') {
        this.appLanguage = 'en'
      }
    }
    this.widgetResolverData = {
      ...this.widgetResolverData,
      widgetData: {
        ...this.widgetResolverData.widgetData,
        url: this.introVideos[this.appLanguage],
      },
    }
  }
}
