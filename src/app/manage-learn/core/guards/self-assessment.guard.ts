import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { WidgetContentService } from '../../../../library/ws-widget/collection/src/lib/_services/widget-content.service';
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { viewerRouteGenerator } from '../../../../library/ws-widget/collection/src/lib/_services/viewer-route-util';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class SelfAssessmentGuard implements CanActivate {
  resumeData: any = null;
  eventData: any = null;
  batchData: any;
  resumeDataLink: any;
  content: any;
  batchId:any
  isAshaCourses:any = false
  competencyId: any;
  language: any;
  levelsDetaisl: any;
  constructor(
    private contentSvc: WidgetContentService,
    private configSvc: ConfigurationsService,
    private router: Router
  ) {}

  canActivate(next: ActivatedRouteSnapshot) {
    if (this.configSvc.userProfile) {
      if (_.get(next, 'queryParams')) {
        return this.selfAssessment(_.get(next, 'queryParams'));
      } else {
        return false;
      }
    } else {
      this.router.navigate(['public/home']);
      return false;
    }
  }

  selfAssessment(event: any): boolean {
    localStorage.removeItem('competency_meta_data');
    this.eventData = _.cloneDeep(event);
    if (this.eventData) {
      this.competencyId = this.eventData.competencyID
      this.language = this.eventData.lang
      this.levelsDetaisl = JSON.stringify(this.eventData.levels)
      console.log("query paramas levels details",this.levelsDetaisl)
      this.isAshaCourses = this.eventData.isAsha ? true : false;
      this.eventData['mimeType'] = 'application/json';
      const content$ = this.getContent();
      const enrolledCourseBatch$ = this.getEnrolledCourseList();
      forkJoin([content$, enrolledCourseBatch$])
        .pipe(
          mergeMap((res: any) => {
            this.content = _.get(res[0], 'result.content');
            let competency_meta_data = [];
            if (this.content) {
              if (
                this.content.competencies_v1 &&
                !_.isEmpty(this.content.competencies_v1)
              ) {
                competency_meta_data = JSON.parse(
                  this.content.competencies_v1
                );
              }
              const children = _.map(this.content.children, (item: any) => {
                return {
                  identifier: item.identifier,
                  competencyId: item.index,
                };
              });
              competency_meta_data.push({
                competencyIds: children,
              });
              localStorage.setItem(
                'competency_meta_data',
                JSON.stringify(competency_meta_data)
              );
            }
            this.batchData = _.find(res[1], { contentId: event.contentId });
            if (this.batchData) {
              return of(this.batchData);
            } else {
              return this.getFilteredCourseSearchResults(event.contentId).pipe(
                mergeMap((res: any) => {
                  const batchData = _.get(
                    _.find(res.result.content, 'batches'),
                    'batches'
                  );
                  return this.enrollUser(batchData, event.contentId);
                })
              );
            }
          })
        )
        .subscribe((res: any) => {
          // console.log('self assesment guard ',res)
          if(_.get(res,'batchId')){
            this.batchId = _.get(res,'batchId')
          }
          return this.navigateToplayer({'batchId': this.batchId});
        });
    }
    return false;
  }

  enrollUser(batchData: any, contentId: any) {
    const userId = _.get(this.configSvc, 'userProfile.userId') || '';
    this.batchId = _.get(batchData, '[0].batchId')
    const req = {
      request: {
        userId,
        courseId: contentId,
        batchId: _.get(batchData, '[0].batchId'),
      },
    };
    return this.contentSvc.enrollUserToBatch(req);
  }

  

  getContent() {
    return this.contentSvc.fetchContent(this.eventData.contentId);
  }

  getCourseBatch() {
    const req = {
      request: {
        filters: {
          courseId: this.eventData.contentId,
          status: ['0', '1', '2'],
        },
        sort_by: { createdDate: 'desc' },
      },
    };
    return this.contentSvc.fetchCourseBatches(req);
  }

  getEnrolledCourseList() {
    return this.contentSvc.fetchUserBatchList(
      _.get(this.configSvc, 'userProfile.userId')
    );
  }

  getFilteredCourseSearchResults(contentId: any) {
    return this.contentSvc.getFilteredCourseSearchResults(contentId);
  }

  navigateToplayer(data: any): boolean {
    const userId = _.get(this.configSvc, 'userProfile.userId') || '';
    const batchId = _.get(data, 'batchId');
    const req: any = {
      request: {
        batchId,
        userId,
        courseId: this.eventData.contentId || '',
        contentIds: [],
        fields: ['progressdetails'],
      },
    };
    this.contentSvc.fetchContentHistoryV2(req).subscribe((data: any) => {
      if (
        data &&
        data.result &&
        data.result.contentList &&
        data.result.contentList.length > 0
      ) {
        this.resumeData = _.get(data, 'result.contentList');
        const lastItem = _.last(this.resumeData);
        const resumeDataV2 = {
          identifier: _.get(lastItem, 'contentId'),
          mimeType: _.get(lastItem, 'progressdetails.mimeType'),
        };
        this.resumeDataLink = viewerRouteGenerator(
          resumeDataV2.identifier,
          resumeDataV2.mimeType,
          this.eventData.contentId,
          this.eventData.contentType,
          false,
          'Course',
          batchId
        );
        this.routeNavigation(batchId, 'RESUME');
      } else {
        const firstPlayableContent = this.contentSvc.getFirstChildInHierarchy(
          this.content
        );
        this.resumeDataLink = viewerRouteGenerator(
          _.get(firstPlayableContent, 'identifier'),
          _.get(firstPlayableContent, 'mimeType'),
          this.eventData.contentId,
          this.eventData.contentType,
          false,
          'Course',
          batchId
        );
        this.routeNavigation(batchId, 'START');
      }
    });
    return false;
  }

  routeNavigation(batchId?: any, viewMode?: any) {
    if (this.resumeDataLink && !this.isAshaCourses) {
      const qParams: { [key: string]: string } = {
        ...this.resumeDataLink.queryParams,
        batchId: batchId,
        viewMode: viewMode,
        competency: 'true',
      };
      console.log("router url", this.resumeDataLink, qParams)
      this.router.navigate([this.resumeDataLink.url], {
        queryParams: qParams,
      });
    }else {
      const qParams: { [key: string]: string } = {
        ...this.resumeDataLink.queryParams,
        batchId: batchId,
        viewMode: viewMode,
        competency: 'true',
        isAsha: this.isAshaCourses,
        competencyId: this.competencyId,
        lang: this.language,
        levels :this.levelsDetaisl
      };
      console.log("router url", this.resumeDataLink, qParams)
      this.router.navigate([this.resumeDataLink.url], {
        queryParams: qParams,
      });
    }
  }
}
