import { Injectable } from '@angular/core'
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { NsGoal } from '../../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.model'
import { BtnGoalsService } from '../../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.service'
import { IResolveResponse } from '../../../../../../../../library/ws-widget/utils/src/lib/resolvers/resolver.model'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'

@Injectable()
export class GoalsUserResolve
  implements
    Resolve<Observable<IResolveResponse<NsGoal.IUserGoals>> | IResolveResponse<NsGoal.IUserGoals>> {
  constructor(private goalSvc: BtnGoalsService) {}

  resolve(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<NsGoal.IUserGoals>> {
    return this.goalSvc.getUserGoals(NsGoal.EGoalTypes.USER, 'isInIntranet').pipe(
      map(data => ({ data, error: null })),
      catchError(error => of({ error, data: null })),
    )
  }
}
