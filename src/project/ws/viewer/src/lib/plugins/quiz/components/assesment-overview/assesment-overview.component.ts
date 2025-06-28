import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router'
import { Environment, InteractType, PageId, TelemetryGeneratorService } from '../../../../../../../../../services';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'viewer-assesment-overview',
  templateUrl: './assesment-overview.component.html',
  styleUrls: ['./assesment-overview.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class AssesmentOverviewComponent implements OnInit {
  isCompetency = false
  isAshaHome: any = false
  constructor(
    public dialogRef: MatDialogRef<AssesmentOverviewComponent>,
    @Inject(MAT_DIALOG_DATA) public assesmentdata: any,
    public route: ActivatedRoute,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private platform: Platform
  ) { }

  ngOnInit() {
    this.isCompetency = this.route.snapshot.queryParams.competency;
    this.isAshaHome = this.route.snapshot.queryParams.isAsha;
    this.handleDeviceBackButton();
    // console.log("over-view",  this.isCompetency )
  }
  closePopup() {
    if (this.isCompetency) {
      if (this.isAshaHome) {
        this.dialogRef.close({
          event: 'close-overview',
          asha: this.route.snapshot.queryParams.isAsha
        })
      }else{
        this.dialogRef.close({
          event: 'close-overview',
          competency: this.route.snapshot.queryParams.competency
        })
      }
    } else {
      this.dialogRef.close({ event: 'close-overview' })
    }
    this.generateInteractEvent('close-assessment-popup');

    // if (this.isCompetency && this.isAshaHome ) {
    //   this.dialogRef.close({
    //     event: 'close-overview',
    //     asha: this.route.snapshot.queryParams.isAsha
    //   })
    // } else {
    //   this.dialogRef.close({ event: 'close-overview' })
    // }
  }

  generateInteractEvent(status) {
     this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          status,
          Environment.PLAYER,
          PageId.ASSESSMENT_OVERVIEW
        );
  }

  handleDeviceBackButton() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.closePopup();
      this.telemetryGeneratorService.generateBackClickedNewTelemetry(true, Environment.PLAYER, PageId.ASSESSMENT_OVERVIEW)
    });
  }
}
