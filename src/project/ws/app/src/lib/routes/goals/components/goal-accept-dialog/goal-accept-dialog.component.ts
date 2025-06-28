import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import { NsGoal } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.model';
import { BtnGoalsService } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.service';
import { TFetchStatus } from '../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants';

@Component({
  selector: 'ws-app-goal-accept-dialog',
  templateUrl: './goal-accept-dialog.component.html',
  styleUrls: ['./goal-accept-dialog.component.scss'],
})
export class GoalAcceptDialogComponent implements OnInit {
  @ViewChild('errorAccept', { static: true }) errorAcceptMessage!: ElementRef<any>
  @ViewChild('successAccept', { static: true })
  successAcceptMessage!: ElementRef<any>
  showAlreadyGoalExistMessage = false

  acceptGoalStatus: TFetchStatus = 'none'
  constructor(
    private snackbar: MatSnackBar,
    private goalSvc: BtnGoalsService,
    private dialogRef: MatDialogRef<GoalAcceptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public goal: NsGoal.IGoal,
  ) {}

  ngOnInit() {
    this.acceptGoalConditionCheck()
  }

  acceptGoalConditionCheck() {
    this.goalSvc
      .acceptRejectGoal(
        'accept',
        this.goal.type,
        this.goal.id,
        this.goal.sharedBy ? this.goal.sharedBy.userId : '',
        '',
        false,
      )
      .subscribe(
        (response: NsGoal.IGoalAcceptConfirmationResponse) => {
          this.showAlreadyGoalExistMessage = response.commonUserGoal ? true : false
        },
        () => {
          this.showAlreadyGoalExistMessage = false
        },
      )
  }

  acceptGoal() {
    this.acceptGoalStatus = 'fetching'
    this.goalSvc
      .acceptRejectGoal(
        'accept',
        this.goal.type,
        this.goal.id,
        this.goal.sharedBy ? this.goal.sharedBy.userId : '',
      )
      .subscribe(
        () => {
          this.acceptGoalStatus = 'done'
          this.snackbar.open(this.successAcceptMessage.nativeElement.value)
          this.dialogRef.close(true)
        },
        () => {
          this.acceptGoalStatus = 'error'
          this.snackbar.open(this.errorAcceptMessage.nativeElement.value)
        },
      )
  }
}
