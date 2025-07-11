import { Component, Input } from '@angular/core'
import { NsContent } from '../_services/widget-content.model'
import { WidgetBaseComponent } from 'library/ws-widget/resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from 'library/ws-widget/resolver/src/lib/widget-resolver.model'

interface IButtonChannelAnalytics {
  identifier: string
  contentType: NsContent.EContentTypes
}
@Component({
  selector: 'ws-widget-btn-channel-analytics',
  templateUrl: './btn-channel-analytics.component.html',
  styleUrls: ['./btn-channel-analytics.component.scss'],
})
export class BtnChannelAnalyticsComponent extends WidgetBaseComponent
  implements NsWidgetResolver.IWidgetData<IButtonChannelAnalytics> {

  @Input() widgetData!: IButtonChannelAnalytics

  public get showButton() {
    if (this.widgetData.contentType === NsContent.EContentTypes.CHANNEL) {
      return true
    }
    return false
  }

}
