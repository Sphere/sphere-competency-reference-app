import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { NsGoal } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.model'
import { BtnGoalsService } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.service'
import { TFetchStatus } from '../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants'

@Component({
  selector: 'ws-app-goal-others',
  templateUrl: './goal-others.component.html',
  styleUrls: ['./goal-others.component.scss'],
})
export class GoalOthersComponent {
  fetchGoalsStatus: TFetchStatus = 'none'
  othersGoals: NsGoal.IGoal[] = this.route.snapshot.data.othersGoals.data
  error = this.route.snapshot.data.othersGoals.error

  constructor(private route: ActivatedRoute, private goalsSvc: BtnGoalsService) {}

  updateGoals() {
    this.fetchGoalsStatus = 'fetching'
    this.othersGoals = []
    this.goalsSvc.getOthersGoals('isInIntranet').subscribe(response => {
      this.fetchGoalsStatus = 'done'
      this.othersGoals = response
    })
  }
}
