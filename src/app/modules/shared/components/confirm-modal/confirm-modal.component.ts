import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Environment, InteractSubtype, InteractType, PageId, TelemetryGeneratorService } from '../../../../../services';
@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class ConfirmPopUpComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ConfirmPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private telemetryGeneratorService: TelemetryGeneratorService) { }

  ngOnInit() {}
  closeNo() {
    this.generateInteractTelemetry('NO');
    this.dialogRef.close(false)
  }
  closeYes() {
    this.generateInteractTelemetry('YES');
    this.dialogRef.close({ event: 'YES' })
  }

  generateInteractTelemetry(action) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      action === 'YES' ? InteractSubtype.YES_CLICKED : InteractSubtype.NO_CLICKED,
      Environment.DOWNLOADS,
      PageId.DOWNLOADS
    )
  }

}
