import { Component, OnInit, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms'

import {
  ITrainingFilter,
  ITrainingLocation,
  ITrainingFilterDialogData,
} from '../../../../models/training-api.model'

@Component({
  selector: 'ws-app-training-filter-dialog',
  templateUrl: './training-filter-dialog.component.html',
  styleUrls: ['./training-filter-dialog.component.scss'],
})
export class TrainingFilterDialogComponent implements OnInit {
  filterForm: UntypedFormGroup
  currentDate: Date
  filterObj: ITrainingFilter
  trainingLocations: ITrainingLocation[]

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public filterDialogData: ITrainingFilterDialogData,
    private dialogRef: MatDialogRef<TrainingFilterDialogComponent>,
  ) {
    this.filterObj = this.filterDialogData.filterObj
    this.trainingLocations = this.filterDialogData.trainingLocations || []

    this.currentDate = new Date()

    this.filterForm = new UntypedFormGroup({
      fromDate: new UntypedFormControl(this.filterObj.external.fromDate),
      toDate: new UntypedFormControl(this.filterObj.external.toDate),
      location: new UntypedFormControl(this.filterObj.external.location),
      assessmentOnly: new UntypedFormControl(this.filterObj.internal.assessmentOnly),
      seatsAvailableOnly: new UntypedFormControl(this.filterObj.internal.seatsAvailableOnly),
      eligibleOnly: new UntypedFormControl(this.filterObj.internal.eligibleOnly),
    })
  }

  ngOnInit() {}

  onApplyFilters() {
    if (this.filterForm.invalid) {
      return
    }

    const newFilterObj: ITrainingFilter = {
      external: {
        fromDate: this.filterForm.value.fromDate,
        toDate: this.filterForm.value.toDate,
        location: this.filterForm.value.location,
      },
      internal: {
        assessmentOnly: this.filterForm.value.assessmentOnly,
        eligibleOnly: this.filterForm.value.eligibleOnly,
        seatsAvailableOnly: this.filterForm.value.seatsAvailableOnly,
      },
    }

    this.dialogRef.close(newFilterObj)
  }
}
