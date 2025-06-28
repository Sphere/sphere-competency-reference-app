import { Component, Inject, ViewChild, ElementRef } from '@angular/core'
import { MatListOption } from '@angular/material/list';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import { TFetchStatus } from '../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants';
import { NsGoal } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.model';
import { BtnGoalsService } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.service';

@Component({
  selector: 'ws-app-goal-shared-delete-dialog',
  templateUrl: './goal-shared-delete-dialog.component.html',
  styleUrls: ['./goal-shared-delete-dialog.component.scss'],
})
export class GoalSharedDeleteDialogComponent {
  @ViewChild('errorDeleteForUser', { static: true })
  errorDeleteForUserMessage!: ElementRef<any>
  deleteGoalStatus: TFetchStatus = 'none'

  constructor(
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<GoalSharedDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public goal: NsGoal.IGoal,
    private goalSvc: BtnGoalsService,
  ) {}

  deleteGoalForUser(selectedOptions: MatListOption[]) {
    const users = selectedOptions.map(option => option.value)
    if (this.goal) {
      this.deleteGoalStatus = 'fetching'
      this.goalSvc
        .deleteGoalForUsers(this.goal.type, this.goal.id, users)
        .subscribe(
          () => {
            this.deleteGoalStatus = 'done'
            this.dialogRef.close(true)
          },
          () => {
            this.deleteGoalStatus = 'error'
            this.snackbar.open(
              this.errorDeleteForUserMessage.nativeElement.value,
            )
          },
        )
    }
  }
}
