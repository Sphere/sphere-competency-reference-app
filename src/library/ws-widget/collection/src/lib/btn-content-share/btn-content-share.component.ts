import { Component, Input, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { ConfigurationsService } from '../../../../utils/src/lib/services/configurations.service'
import { NsContent } from '../_services/widget-content.model'
import { BtnContentShareDialogComponent } from './btn-content-share-dialog/btn-content-share-dialog.component'
import { buildConfig } from '../../../../../../../configurations/configuration'
import { Share } from '@capacitor/share';
import { WidgetBaseComponent } from '../../../../../../library/ws-widget/resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.model'
import { TelemetryObject } from 'sunbird-sdk'
import { Environment, InteractSubtype, InteractType, PageId, TelemetryGeneratorService } from '../../../../../../services'

@Component({
  selector: 'ws-widget-btn-content-share',
  templateUrl: './btn-content-share.component.html',
  styleUrls: ['./btn-content-share.component.scss'],
})
export class BtnContentShareComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<NsContent.IContent> {
  @Input() widgetData!: NsContent.IContent
  @Input() isDisabled = false
  @Input() showText = false
  @Input() forPreview = false
  @Input() isTocBanner = false
  @Input() isSocialShare;
  @Input() shareData;
  showBtn = false
  isShareEnabled = false

  constructor(private dialog: MatDialog,
    private configSvc: ConfigurationsService,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
    super()
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isShareEnabled = !this.configSvc.restrictedFeatures.has('share')
    }
    // tslint:disable-next-line: max-line-length
    this.showBtn = this.configSvc.rootOrg !== 'RootOrg'
  }

  shareContent() {
    if (!this.forPreview) {
      this.dialog.open<BtnContentShareDialogComponent, { content: NsContent.IContent }>(
        BtnContentShareDialogComponent,
        {
          data: { content: this.widgetData },
        },
      )
    }
  }

  async socialShare(courseId){
    let options = {
      title: 'Share',
      text: 'Please check this course', // not supported on some apps (Facebook, Instagram)
      // url: 'https://'+environment.sitePath+'/page/home',
      url:`https://${buildConfig.SITEPATH}/public/toc/overview?courseId=${courseId}`
    };
    this.generateInteractEvent();
    if((await Share.canShare()).value) {
      return await Share.share(options);
    }
   // window.plugins.socialsharing.shareWithOptions(options);
  }

  generateInteractEvent() {
    const telemetryObject = new TelemetryObject(this.widgetData?.identifier, this.widgetData?.contentType, this.widgetData?.version);
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SHARE_CLICKED,
      Environment.HOME,
      PageId.COURSE_TOC,
      telemetryObject,
    )
  }
}