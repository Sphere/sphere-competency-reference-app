import { Component, Input, OnInit } from '@angular/core'
import { NsContent } from '../_services/widget-content.model'
import { MatDialog } from '@angular/material/dialog'
import { BtnMailUserDialogComponent } from './btn-mail-user-dialog/btn-mail-user-dialog.component'
import { WidgetBaseComponent } from '../../../../../../library/ws-widget/resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.model'
import { EventService } from '../../../../../../library/ws-widget/utils/src/lib/services/event.service'
import { ConfigurationsService } from '../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'

export interface IBtnMailUser {
  content: NsContent.IContent
  emails: string[]
  labelled?: boolean
}

@Component({
  selector: 'ws-widget-btn-mail-user',
  templateUrl: './btn-mail-user.component.html',
  styleUrls: ['./btn-mail-user.component.scss'],
})
export class BtnMailUserComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<IBtnMailUser> {
  @Input() widgetData!: IBtnMailUser
  isShareEnabled = false

  constructor(
    private events: EventService,
    private dialog: MatDialog,
    private configSvc: ConfigurationsService,
  ) {
    super()
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isShareEnabled = !this.configSvc.restrictedFeatures.has('mailUsers')
    }
  }

  openQueryMailDialog(event: Event) {
    event.stopPropagation()
    this.raiseTelemetry()
    this.dialog.open(
      BtnMailUserDialogComponent, {
      width: '600px',
      height: 'auto',

      data: this.widgetData,

    })
  }

  raiseTelemetry() {
    this.events.raiseInteractTelemetry(
      'email',
      'openDialog',
      {
        contentId: this.widgetData.content.identifier,
        emails: this.widgetData.emails,
      },
    )
  }

}
