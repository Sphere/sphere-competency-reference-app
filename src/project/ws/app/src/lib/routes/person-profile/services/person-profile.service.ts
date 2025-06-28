import { EventEmitter, Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Observable, BehaviorSubject } from 'rxjs'
import { IFollowDetails } from '../person-profile.model'
import { NsGoal } from '../../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.model'
import { ConfigurationsService } from '../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { NsPlaylist } from '../../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.model'
import { NsDiscussionForum } from '../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.model'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})

export class PersonProfileService {
  httpOptions = {
    headers: new HttpHeaders({
      validator_URL: `https://${this.configSvc.hostPath}/apis/protected/v8/user/validate`,
    }),
  }
  isfollowevent = new EventEmitter<Boolean>()
  wid = new BehaviorSubject<string>('')

  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService,
  ) { }

  fetchUserInterestsV2(id: string): Observable<string[]> {
    return this.http.get<string[]>(`${API_PROTECTED_END_POINTS.userTopics}/v2?ts=${new Date().getTime()}&wid=${id}`)
  }

  lastlearnt(): Observable<any> {
    return this.http.get<any>(`${API_PROTECTED_END_POINTS.lastlearnt}?pageSize=20`)
  }
  getFollowers(wid: string, pageSize: number = 0, pageState?: string): Observable<any> {
    if (pageState) {
      return this.http.post<any>(API_PROTECTED_END_POINTS.getFollowersv3, {
        fetchSize: pageSize,
        id: wid,
        followersPageState: pageState,
      })

    }
    return this.http.post<any>(API_PROTECTED_END_POINTS.getFollowersv3, {
      fetchSize: pageSize,
      id: wid,
    })
  }
  fetchdetails(wid?: string): Observable<IFollowDetails> {
    try {
      if (!wid) {
        return this.http.get<IFollowDetails>(API_PROTECTED_END_POINTS.getDetails)
      }

        return this.http.post<IFollowDetails>(API_PROTECTED_END_POINTS.getDetails, { wid })

    } catch (e) {
      return e
    }

  }

  getFollowingv3(wid: string, isIntranet: boolean, isStandAlone: boolean, type?: any): Observable<any> {
    const body = { type, id: wid }
    let params = new HttpParams()
    params = params.append('isIntranet', `${isIntranet}`)
    params = params.append('isStandAlone', `${isStandAlone}`)
    return this.http.post<any>(API_PROTECTED_END_POINTS.getFollowingv3, body, { params })
  }

  getFollowing(wid: string, type?: string): Observable<any> {
    let url = ''
    if (type) {
      url = `${API_PROTECTED_END_POINTS.getFollowing}?type=${type}&wid=${wid}`
    } else {
      url = `${API_PROTECTED_END_POINTS.getFollowing}?wid=${wid}`
    }

    // const url = `${API_PROTECTED_END_POINTS.getFollowing + (type ? `?type=` : `?wid=${wid}`)}`
    return this.http.get<any>(url)
  }

  getPlaylists(wid: string) {
    return this.http.get<NsPlaylist.IPlaylistResponse>(`${API_PROTECTED_END_POINTS.getAllPlaylists}?wid=${wid}`)
  }

  getUserGoals(type: NsGoal.EGoalTypes, sourceFields: string = '', wid: string) {
    return this.http.get<NsGoal.IUserGoals>(API_PROTECTED_END_POINTS.getUserProfileGoals(type, sourceFields, wid))
  }
  fetchTimelineDataProfile(wid: string, request: NsDiscussionForum.ITimelineRequest): Observable<NsDiscussionForum.ITimeline> {
    return this.http.post<NsDiscussionForum.ITimeline>(`${API_PROTECTED_END_POINTS.SOCIAL_TIMELINE}?wid=${wid}`, request)
  }
}
