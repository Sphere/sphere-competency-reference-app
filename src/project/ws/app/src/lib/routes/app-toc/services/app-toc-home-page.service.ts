import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { NsContent } from '@ws-widget/collection';
import { ActivatedRoute, Data } from '@angular/router';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx'
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { ContentService } from '@project-sunbird/sunbird-sdk';
import { LocalStorageService } from '../../../../../../../../app/manage-learn/core'


@Injectable({
  providedIn: 'root'
})
export class AppTocHomePageService {

  constructor( private screenOrientation: ScreenOrientation,
    private route: ActivatedRoute,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private localStorageService: LocalStorageService) { }
  async initializeScreenOrientation(screenOrientation: any) {
    await screenOrientation.unlock();
    await screenOrientation.lock(screenOrientation.ORIENTATIONS.PORTRAIT);
  }
  /**
   * Fetches query parameters from the route
   */
  getQueryParams(): Observable<any> {
    return this.route.queryParamMap.pipe(
      map((queryParams) => {
        console.log('queryParams toc:', queryParams);
        return queryParams;
      })
    );
  }
  /**
   * Fetches route data and validates JSON if required
   */
  getRouteData(): Observable<any> {
    return this.route.data.pipe(
      map((data: Data) => {
        if (data.content?.data) {
          return {
            ...data.content.data,
            isValidJson: this.isValidJson(data.content.data.creatorDetails),
          };
        }
        return null;
      })
    );
  }
   /**
   * Combines query parameters and route data
   */
  getCombinedRouteData(): Observable<{ queryParams: any; contentData: any }> {
    return combineLatest([this.getQueryParams(), this.getRouteData()]).pipe(
      map(([queryParams, contentData]) => ({ queryParams, contentData }))
    );
  }

  /**
   * Fetches and processes child content data recursively
   */
  async getAndSetChildContent(contentId: string): Promise<any> {
    const option = { contentId, hierarchyInfo: null };
    try {
      const data: any = await this.contentService.getChildContents(option).toPromise();
      const updatedData = data && data.children ? this.updateDataRecursively(data) : null;

      if (updatedData) {
        const contentWithChildren = { ...data, children: updatedData.children };
        this.localStorageService.setLocalStorage(`sdk_content${contentId}`, contentWithChildren);
        return contentWithChildren;
      }
    } catch (error) {
      console.error('Error fetching child content:', error);
      throw error;
    }
  }

   /**
   * Recursively updates content data with children
   */
   private updateDataRecursively(node): any {
    if (node.contentData) {
      const updatedNode = {
        ...node,
        ...node.contentData,
        children: _.map(node.children, (child) => this.updateDataRecursively(child)),
      };
      return this.cleanEmptyChildren(updatedNode);
    }

    const updatedNode = {
      ...node,
      children: _.map(node.children, (child) => this.updateDataRecursively(child)),
    };

    return this.cleanEmptyChildren(updatedNode);
  }

  /**
   * Removes children property if it is empty
   */
  private cleanEmptyChildren(node): any {
    if (node.children?.length === 0) {
      delete node.children;
    }
    return node;
  }
  private isValidJson(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (error) {
      return false;
    }
  }
}
