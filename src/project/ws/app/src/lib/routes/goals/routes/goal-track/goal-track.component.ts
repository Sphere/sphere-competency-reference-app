import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { NsGoal } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.model'
import { BtnGoalsService } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.service'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'

@Component({
  selector: 'ws-app-goal-track',
  templateUrl: './goal-track.component.html',
  styleUrls: ['./goal-track.component.scss'],
})
export class GoalTrackComponent implements OnInit {
  goal: NsGoal.IGoal | undefined = undefined

  constructor(
    private route: ActivatedRoute,
    private goalsSvc: BtnGoalsService,
    public configSvc: ConfigurationsService,
  ) {}

  ngOnInit() {
    const goalId = this.route.snapshot.params.goalId
    this.goal = this.goalsSvc.goalsHash[goalId]
    if (!this.goal) {
      this.goalsSvc.getOthersGoals('isInIntranet').subscribe(goals => {
        this.goal = goals.find(goal => goal.id === goalId)
      })
    }
  }
}
