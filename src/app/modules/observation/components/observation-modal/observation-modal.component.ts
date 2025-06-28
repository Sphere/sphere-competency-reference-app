import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-observation-modal',
  templateUrl: './observation-modal.component.html',
  styleUrls: ['./observation-modal.component.scss'],
})
export class ObservationModalComponent {

  isSchedule;
  public pointsBasedPercentageScore: any = 0;
  constructor(
    public dialogRef: MatDialogRef<ObservationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {

    this.isSchedule = data.type == 'schedule' ? true : false;
    this.pointsBasedPercentageScore = (this.data?.pointsBasedPercentageScore) ? this.data.pointsBasedPercentageScore : 0;
    this.pointsBasedPercentageScore = Math.floor(this.pointsBasedPercentageScore);
  }

  closePopup() {
    this.dialogRef.close();
  }

  backSchedule(){
    this.dialogRef.close()
  }

}
