import { Component, OnInit, Inject } from '@angular/core'
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { noop } from 'rxjs'
import { ITrainingRequest } from '../../../../models/training-api.model'
import { TrainingApiService } from '../../../../apis/training-api.service'

@Component({
  selector: 'ws-app-training-reject-dialog',
  templateUrl: './training-reject-dialog.component.html',
  styleUrls: ['./training-reject-dialog.component.scss'],
})
export class TrainingRejectDialogComponent implements OnInit {
  rejectForm: UntypedFormGroup = new UntypedFormGroup({
    reason: new UntypedFormControl(),
  })

  constructor(
    @Inject(MAT_DIALOG_DATA) public request: ITrainingRequest,
    private dialogRef: MatDialogRef<TrainingRejectDialogComponent>,
    private trainingApi: TrainingApiService,
  ) {}

  ngOnInit() {}

  onReject() {
    this.trainingApi
      .rejectTrainingRequest(this.rejectForm.value.reason, this.request.offering_id)
      .subscribe(() => {
        this.dialogRef.close(true)
      },         noop)
  }
}
