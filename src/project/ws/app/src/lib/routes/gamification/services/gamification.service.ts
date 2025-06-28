import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class GamificationService {
  constructor(private http: HttpClient) { }

  // Fetch leaderboard to display for users
  fetchLeaderBoard(sprintIdVal: string) {
    return this.http.post<any>(API_PROTECTED_END_POINTS.fetchBoards, { sprintId: sprintIdVal })
  }

  // Fetch leaderboard to display for guild users
  fetchGuildLeaderboard(sprintIdVal: string, dateStart: any, dateEnd: any) {
    return this.http.post<any>(API_PROTECTED_END_POINTS.fetchGuildLeaderboard, {
      sprintId: sprintIdVal,
      startDate: dateStart, endDate: dateEnd,
    })
  }

  // Fetch leaderboard to display for activities
  fetchActivityLeaderboard(sprintIdVal: string, dateStart: any, dateEnd: any) {
    return this.http.post<any>(API_PROTECTED_END_POINTS.fetchActivityLeaderboard, {
      sprintId: sprintIdVal,
      startDate: dateStart, endDate: dateEnd,
    })
  }

  // Fetch badges to display for users
  fetchBadges() {
    return this.http.post<any>(API_PROTECTED_END_POINTS.fetchBadges, {})
  }

  // Fetch dealers to display for users
  fetchDealers() {
    return this.http.post<any>(API_PROTECTED_END_POINTS.fetchDealers, {})
  }

  // Fetch dealers to display for users
  fetchBadgesWon() {
    return this.http.post<any>(API_PROTECTED_END_POINTS.fetchBadgesWon, {})
  }

  // Fetch dealers to display for users
  fetchBadgesYetToWin() {
    return this.http.post<any>(API_PROTECTED_END_POINTS.fetchBadgesYetToWin, {})
  }

  // Fetch dealers to display for users
  getBalance() {
    return this.http.post<any>(API_PROTECTED_END_POINTS.GetBalance, {})
  }

  // Fetch sso url
  getsso() {
    return this.http.post<any>(API_PROTECTED_END_POINTS.Getsso, {})
  }

  // Fetch balance of guild points to display for users
  fetchUserProfile() {
    return this.http.post<any>(API_PROTECTED_END_POINTS.fetchUserProfile, {})
  }

  // Fetch dealers to display for users
  updateApprovedPoints(leaderboardList: []) {
    return this.http.post<any>(API_PROTECTED_END_POINTS.updateApprovedPoints, { UpdatedLeaderBoard: leaderboardList })
  }

  // Fetch Configs to display for users
  fetchConfigs(sprintIdVal: string, roleName: string) {
    return this.http.post<any>(API_PROTECTED_END_POINTS.fetchConfigs, { EntityCode: sprintIdVal, RoleName: roleName })
  }

  // Fetch dealers to display for users
  updateConfigs(configList: {}) {
    return this.http.post<any>(API_PROTECTED_END_POINTS.updateConfigs, { configPropertiesObj: configList })
  }

}
