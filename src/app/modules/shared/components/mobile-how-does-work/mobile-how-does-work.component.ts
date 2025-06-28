import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core'
import { ScrollService } from '../../services/scroll.service'
import { MatDialog } from '@angular/material/dialog'
import { VideoPopupComponent } from '../how-does-it-works-popup/how-does-it-works-popup.component'
import { Platform } from '@ionic/angular'
import { Environment, InteractSubtype, InteractType, PageId, TelemetryGeneratorService } from '../../../../../services'
import { TelemetryObject } from 'sunbird-sdk'
@Component({
  selector: 'ws-mobile-how-does-work',
  templateUrl: './mobile-how-does-work.component.html',
  styleUrls: ['./mobile-how-does-work.component.scss'],
})
export class MobileHowDoesWorkComponent implements OnInit {
  @Input() data: any
  /** to listen the eevnt **/
  @Output() openPlayer = new EventEmitter()
  @ViewChild('scrollToHowSphereWorks', { static: false }) scrollToHowSphereWorks!: ElementRef;
  isTablet = false;
  constructor(private scrollService: ScrollService,
              public dialog: MatDialog,
              private platform: Platform,
              private telemetryGeneratorService: TelemetryGeneratorService
          )
               { }

  ngOnInit() {
    this.isTablet = this.platform.is('tablet');
    this.scrollService.scrollToDivEvent.subscribe((targetDivId: string) => {
      if (targetDivId === 'scrollToHowSphereWorks') {
        this.scrollService.scrollToElement(this.scrollToHowSphereWorks.nativeElement)
      }
    })
  }
  openVideoPopup(videoData:any) {
    this.genarateInteractTelemetry(videoData);
    this.dialog.open(VideoPopupComponent, {
      data: videoData,
      panelClass: 'youtube-modal',
    })
  }
  genarateInteractTelemetry(videoData: any) {
    const telemetryObject = new TelemetryObject(videoData, 'Video', undefined)
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.YOUTUBE_CONTENT_CLICKED,
      Environment.HOME,
      PageId.HOME,
      telemetryObject,
      undefined
    )
  }
}
