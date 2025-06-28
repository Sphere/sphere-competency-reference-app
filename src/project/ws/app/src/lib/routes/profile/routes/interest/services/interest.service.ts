// import { WsApiCatalogService } from '@ws-shared/apis/src/lib/ws-api-catalog.service'
// import { WsSharedUtilityService } from '@ws-shared/services'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ITopic, ITopicRecommended } from '../models/interest.model'
import { TreeCatalogService } from '../../../../../../../../../../library/ws-widget/collection/src/lib/tree-catalog/tree-catalog.service'
import { NSSearch } from '../../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-search.model'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class InterestService {
  constructor(private http: HttpClient, private treeCatalogSvc: TreeCatalogService) { }

  fetchUserInterests(): Observable<string[]> {
    return this.http
      .get<ITopic[]>(`${API_PROTECTED_END_POINTS.userTopics}?ts=${new Date().getTime()}`)
      .pipe(map(u => u.map((topic: ITopic) => topic.name)))
  }

  fetchSuggestedInterests(): Observable<string[]> {
    return this.http
      .get<ITopicRecommended[]>(`${API_PROTECTED_END_POINTS.suggestedTopics}`)
      .pipe(map(u => u.map((topic: ITopicRecommended) => topic.name)))
  }

  modifyUserInterests(topics: string[]) {
    return this.http.post(API_PROTECTED_END_POINTS.userTopics, { topics })
  }

  fetchAutocompleteInterests(): Observable<string[]> {
    const leafNodes: NSSearch.IFilterUnitContent[] = []
    return this.treeCatalogSvc.getFullCatalog().pipe(
      map(catalogDataTree => {
        catalogDataTree.forEach(catalogUnit => {
          leafNodes.push(...this.getLeafNodes(catalogUnit, []))
        })
        return leafNodes.map(unitItem => unitItem.displayName)
      }),
    )
  }
  getLeafNodes<T extends NSSearch.IFilterUnitContent>(node: T, nodes: T[]): T[] {
    if ((node.children || []).length === 0) {
      nodes.push(node)
    } else {
      if (node.children) {
        node.children.forEach(child => {
          this.getLeafNodes(child, nodes)
        })
      }
    }
    return nodes
  }

  // V2 Interest code
  fetchUserInterestsV2(): Observable<string[]> {
    return this.http.get<string[]>(`${API_PROTECTED_END_POINTS.userTopics}/v2?ts=${new Date().getTime()}`)
  }

  addUserInterest(interestVal: string) {
    return this.http.patch(`${API_PROTECTED_END_POINTS.userTopics}`, { interest: interestVal })
  }

  addUserMultipleInterest(interestVal: string[]) {
    return this.http.patch(`${API_PROTECTED_END_POINTS.addMultiple}`, { interest: interestVal })
  }

  removeUserInterest(interestVal: string) {
    return this.http.request('delete', `${API_PROTECTED_END_POINTS.userTopics}`, { body: { interest: interestVal } })
  }

  fetchSuggestedInterestV2(): Observable<string[]> {
    return this.http.get<string[]>(`${API_PROTECTED_END_POINTS.recommendedTopics}`)
  }

  fetchAutocompleteInterestsV2(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${API_PROTECTED_END_POINTS.autocompleteTopics}?query=${query}`)
  }
}
