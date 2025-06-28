import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { GoalAcceptDialogComponent } from '../../components/goal-accept-dialog/goal-accept-dialog.component'
import { GoalRejectDialogComponent } from '../../components/goal-reject-dialog/goal-reject-dialog.component'
import { NsGoal } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.model'
import { TFetchStatus } from '../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'

@Component({
  selector: 'ws-app-goal-notification',
  templateUrl: './goal-notification.component.html',
  styleUrls: ['./goal-notification.component.scss'],
})
export class GoalNotificationComponent implements OnInit {
  goals: NsGoal.IGoal[] | null = this.route.snapshot.data.pendingGoals.data
  error = this.route.snapshot.data.pendingGoals.error

  acceptRejectGoalStatus: { [id: string]: TFetchStatus } = {}

  constructor(
    public configSvc: ConfigurationsService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {}

  openAcceptGoalDialog(goal: NsGoal.IGoal) {
    const dialogRef = this.dialog.open(GoalAcceptDialogComponent, {
      data: goal,
    })

    dialogRef.afterClosed().subscribe(value => {
      if (value && this.goals) {
        this.goals = this.goals.filter(item => item.id !== goal.id)
      }
    })
  }

  openRejectGoalDialog(goal: NsGoal.IGoal) {
    const dialogRef = this.dialog.open(GoalRejectDialogComponent, {
      data: goal,
    })

    dialogRef.afterClosed().subscribe(value => {
      if (value && this.goals) {
        this.goals = this.goals.filter(item => item.id !== goal.id)
      }
    })
  }
}
