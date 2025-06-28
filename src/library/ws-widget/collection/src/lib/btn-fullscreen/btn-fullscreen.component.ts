import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core'
import { ConfigurationsService } from '../../../../utils/src/lib/services/configurations.service'
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx'
import { Subscription, fromEvent } from 'rxjs'
import {
  getFullScreenElement,
  requestExitFullScreen,
  requestFullScreen,
  // hasFullScreenSupport,
} from './fullscreen.util'
import { WidgetBaseComponent } from '../../../../resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '../../../../resolver/src/lib/widget-resolver.model'

@Component({
  selector: 'ws-widget-btn-fullscreen',
  templateUrl: './btn-fullscreen.component.html',
  styleUrls: ['./btn-fullscreen.component.scss'],
})
export class BtnFullscreenComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy, NsWidgetResolver.IWidgetData<{ fsContainer: HTMLElement | null }> {
  @Input() widgetData!: { fsContainer: HTMLElement | null }
  @Output() fsState: EventEmitter<{state: Boolean, mode: string}> = new EventEmitter()

  // isFullScreenSupported = true
  isInFs = false
  fsChangeSubs: Subscription | null = null
  constructor(
    private screenOrientation: ScreenOrientation,
    private configSvc: ConfigurationsService
  ){
    super()
  }

  ngOnInit() {
    if (!this.widgetData.fsContainer) {
      return
    }
    this.isInFs = Boolean(getFullScreenElement())
    this.fsChangeSubs = fromEvent(document, 'fullscreenchange').subscribe(() => {
      this.isInFs = Boolean(getFullScreenElement())
      this.fsState.emit({
        state: this.isInFs,
        mode: this.screenOrientation.ORIENTATIONS.PORTRAIT
      })
    })
    // this.isFullScreenSupported = hasFullScreenSupport(this.widgetData.fsContainer)
  }

  ngOnDestroy() {
    if (this.fsChangeSubs) {
      this.fsChangeSubs.unsubscribe()
    }
  }

  toggleFs() {
    if (getFullScreenElement()) {
      requestExitFullScreen()
      this.configSvc._showshrink.next(false)
      this.screenOrientation.unlock();
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      this.fsState.emit({
        state: false,
        mode: this.screenOrientation.ORIENTATIONS.PORTRAIT
      })
    } else if (this.widgetData.fsContainer) {
      this.screenOrientation.unlock();
      requestFullScreen(this.widgetData.fsContainer)
      this.configSvc._showshrink.next(true)
      this.fsState.emit({
        state: true,
        mode: this.screenOrientation.ORIENTATIONS.PORTRAIT
      })
      try {
        this.widgetData.fsContainer.classList.add('mat-app-background')
      } catch (err) { }
    }
  }
}
