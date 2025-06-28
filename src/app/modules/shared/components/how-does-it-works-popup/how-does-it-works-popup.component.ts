// video-popup.component.ts
import { Component, Input, Inject, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { DomSanitizer } from '@angular/platform-browser'
import { Environment, PageId, TelemetryGeneratorService } from '../../../../../services';
import * as _ from 'lodash-es';
import { Mode, Rollup, TelemetryObject } from 'sunbird-sdk';
@Component({
  selector: 'app-video-popup',
  templateUrl: './how-does-it-works-popup.component.html',
  styleUrls: ['./how-does-it-works-popup.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class VideoPopupComponent {

  constructor(
    public dialogRef: MatDialogRef<VideoPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
  }
  videoLink!: any
  public isOpen = false;
  videoUrls = ['https://www.youtube.com/embed/1fqlys8mkHg', 'https://www.youtube.com/embed/Kl28R7m2k50', 'https://www.youtube.com/embed/JTGzCkEXlmU'
  ]
  ngOnInit() {
    console.log("videoData", this.data)
    this.generateStartTelemetry(this.data)
    if (this.data) {
      this.videoLink = _.get(this.data,'url')
    }
  }
  close() {
    this.generateEndTelemetry(this.data)
    this.dialogRef.close()
  }

  generateStartTelemetry(data) {
    const telemetryObject = new TelemetryObject(data, 'youtube-video', undefined);
    let objRollup = new Rollup();
    objRollup.l1 = data.id;
    this.telemetryGeneratorService.generateStartTelemetry(
      PageId.HOME,
      telemetryObject, 
      objRollup
    );
  }

  generateEndTelemetry(data) {
    const telemetryObject = new TelemetryObject(data, 'youtube-video', undefined);
    this.telemetryGeneratorService.generateEndTelemetry(
      'youtube-video',
      Mode.PLAY,
      PageId.HOME,
      Environment.HOME,
      undefined,
      telemetryObject,
      undefined
    )
  }
}
