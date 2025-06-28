import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { NsGoal } from './btn-goals.model'
import { forkJoin, of } from 'rxjs'
import { catchError, map, tap } from 'rxjs/operators'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'


@Injectable({
  providedIn: 'root',
})
export class BtnGoalsService {
  goalsHash: { [goalId: string]: NsGoal.IGoal } = {}

  constructor(private http: HttpClient) {}

  createGoal(upsertRequest: NsGoal.IGoalUpsertRequest) {
    return this.http.post<NsGoal.IGoalUpsertResponse>(API_PROTECTED_END_POINTS.createGoal, upsertRequest)
  }

  createGoals(upsertRequests: NsGoal.IGoalUpsertRequest[]) {
    return forkJoin(
      upsertRequests.map(request => {
        return this.createGoal(request).pipe(
          catchError(error => of(error).pipe(map(_ => error.error.error))),
        )
      }),
    )
  }

  acceptRejectGoal(
    action: string,
    goalType: string,
    goalId: string,
    sharedBy: string,
    message?: string,
    confirm = true,
  ) {
    return this.http.post(API_PROTECTED_END_POINTS.acceptRejectGoal(action, goalType, goalId, confirm), {
      message,
      sharedBy,
    })
  }

  getCommonGoals() {
    return this.http.get<NsGoal.IGoalsGroup[]>(API_PROTECTED_END_POINTS.getCommonGoals)
  }

  getGoalGroup(groupId: string) {
    return this.http.get<NsGoal.IGoalsGroup>(`${API_PROTECTED_END_POINTS.getCommonGoals}/${groupId}`)
  }

  getUserGoals(type: NsGoal.EGoalTypes, sourceFields: string = '') {
    return this.http.get<NsGoal.IUserGoals>(API_PROTECTED_END_POINTS.getUserGoals(type, sourceFields))
  }

  getOthersGoals(sourceFields: string = '') {
    return this.http.get<NsGoal.IGoal[]>(API_PROTECTED_END_POINTS.getOthersGoals(sourceFields)).pipe(
      tap(goals => {
        this.goalsHash = goals.reduce((hash: { [id: string]: NsGoal.IGoal }, obj: NsGoal.IGoal) => {
          hash[obj.id] = obj
          return hash
        },                            {})
      }),
    )
  }

  getActionRequiredGoals(sourceFields: string = '') {
    return this.http.get<any[]>(API_PROTECTED_END_POINTS.getActionRequiredGoals(sourceFields))
  }

  trackGoal(id: string, type: NsGoal.EGoalTypes) {
    return this.http.get<any[]>(API_PROTECTED_END_POINTS.trackGoal(id, type))
  }

  shareGoal(type: string, id: string, users: string[]) {
    return this.http.post<any>(API_PROTECTED_END_POINTS.shareGoal(type, id), { users })
  }

  shareGoalV2(type: string, id: string, users: string[], message: string) {
    return this.http.post<any>(API_PROTECTED_END_POINTS.shareGoalV2(type, id), {
      users,
      message,
    })
  }

  deleteGoal(type: string, id: string) {
    return this.http.delete(API_PROTECTED_END_POINTS.deleteGoal(type, id))
  }

  deleteGoalForUsers(type: string, id: string, users: string[]) {
    return this.http.post(API_PROTECTED_END_POINTS.deleteGoalForUsers(type, id), {
      users,
    })
  }

  updateDurationCommonGoal(goalType: string, goalId: string, duration: number) {
    return this.http.get(API_PROTECTED_END_POINTS.updateDurationCommonGoal(goalType, goalId, duration))
  }

  addContentToGoal(goalId: string, contentId: string, goalType: NsGoal.EGoalTypes) {
    return this.http.patch<NsGoal.IGoalAddContentResponse>(
      API_PROTECTED_END_POINTS.addContentToGoal(goalId, contentId, goalType),
      {},
    )
  }

  removeContentFromGoal(goalId: string, contentId: string, goalType: NsGoal.EGoalTypes) {
    return this.http.delete<NsGoal.IGoalRemoveContentResponse>(
      API_PROTECTED_END_POINTS.removeContentFromGoal(goalId, contentId, goalType),
    )
  }
}
