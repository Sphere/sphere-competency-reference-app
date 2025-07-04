import { Component, Input, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { BtnContentFeedbackDialogComponent } from './btn-content-feedback-dialog/btn-content-feedback-dialog.component'
import { ConfigurationsService } from '../../../../utils/src/lib/services/configurations.service'
import { WidgetBaseComponent } from '../../../../resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '../../../../resolver/src/lib/widget-resolver.model'

interface IWidgetBtnContentFeedback {
  identifier: string
  name: string
}

@Component({
  selector: 'ws-widget-btn-content-feedback',
  templateUrl: './btn-content-feedback.component.html',
  styleUrls: ['./btn-content-feedback.component.scss'],
})
export class BtnContentFeedbackComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<IWidgetBtnContentFeedback> {
  @Input() widgetData!: IWidgetBtnContentFeedback
  @Input() forPreview = false
  isFeedbackEnabled = false
  constructor(private dialog: MatDialog, private configSvc: ConfigurationsService) {
    super()
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isFeedbackEnabled = !this.configSvc.restrictedFeatures.has('contentFeedback')
    }
  }

  openFeedbackDialog() {
    if (!this.forPreview) {
      this.dialog.open(BtnContentFeedbackDialogComponent, {
        data: {
          id: this.widgetData.identifier,
          name: this.widgetData.name,
        },
      })
    }
  }
}
