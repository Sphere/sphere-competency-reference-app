import { Component, Inject, ViewChild, ElementRef } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import { NsGoal } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.model';
import { BtnGoalsService } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.service';
import { TFetchStatus } from '../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants';

@Component({
  selector: 'ws-app-goal-delete-dialog',
  templateUrl: './goal-delete-dialog.component.html',
  styleUrls: ['./goal-delete-dialog.component.scss'],
})
export class GoalDeleteDialogComponent {
  deleteGoalStatus: TFetchStatus = 'none'

  @ViewChild('errorDelete', { static: true })
  errorDeleteMessage!: ElementRef<any>
  @ViewChild('successDelete', { static: true })
  successDeleteMessage!: ElementRef<any>

  constructor(
    private dialogRef: MatDialogRef<GoalDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public goal: NsGoal.IGoal,
    private goalSvc: BtnGoalsService,
    private snackBar: MatSnackBar,
  ) {}

  deleteGoal() {
    if (this.goal) {
      this.deleteGoalStatus = 'fetching'
      this.goalSvc.deleteGoal(this.goal.type, this.goal.id).subscribe(
        () => {
          this.deleteGoalStatus = 'done'
          this.snackBar.open(this.successDeleteMessage.nativeElement.value)
          this.dialogRef.close(true)
        },
        () => {
          this.deleteGoalStatus = 'error'
          this.snackBar.open(this.errorDeleteMessage.nativeElement.value)
        },
      )
    }
  }
}
