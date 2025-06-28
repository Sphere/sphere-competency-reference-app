import { Inject, Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router'
import { Observable, from, of } from 'rxjs'
import { catchError, map, switchMap, tap } from 'rxjs/operators'
import { ContentService } from '@project-sunbird/sunbird-sdk'
import * as _ from 'lodash'
import { IResolveResponse } from '../../../../../../../../library/ws-widget/utils/src/lib/resolvers/resolver.model'
import { NsContent } from '../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import { WidgetContentService } from '../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service'
import { PipeContentRoutePipe } from '../../../../../../../../library/ws-widget/collection/src/lib/_common/pipe-content-route/pipe-content-route.pipe'
const ADDITIONAL_FIELDS_IN_CONTENT = [
  'averageRating',
  'body',
  'creatorContacts',
  'creatorDetails',
  'curatedTags',
  'contentType',
  'collections',
  'hasTranslations',
  'expiryDate',
  'exclusiveContent',
  'introductoryVideo',
  'introductoryVideoIcon',
  'isInIntranet',
  'isTranslationOf',
  'keywords',
  'learningMode',
  'playgroundResources',
  'price',
  'registrationInstructions',
  'region',
  'registrationUrl',
  'resourceType',
  'subTitle',
  'softwareRequirements',
  'studyMaterials',
  'systemRequirements',
  'totalRating',
  'uniqueLearners',
  'viewCount',
  'labels',
  'sourceUrl',
  'sourceName',
  'sourceShortName',
  'sourceIconUrl',
  'locale',
  'hasAssessment',
  'preContents',
  'postContents',
  'kArtifacts',
  'equivalentCertifications',
  'certificationList',
]
@Injectable()
export class AppTocResolverService
  implements
  Resolve<
    Observable<IResolveResponse<NsContent.IContent>> | IResolveResponse<NsContent.IContent>
  > {
  constructor(
    private contentSvc: WidgetContentService,
    private routePipe: PipeContentRoutePipe,
    private router: Router,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<NsContent.IContent>> {
    const contentId = route.paramMap.get('id')
    const primaryCategory = route.queryParamMap.get('primaryCategory') || ''
    const extrasState: any = this.router.getCurrentNavigation()?.extras.state;
    console.log('extrasState', extrasState)
    return from(this.fetchData(extrasState, contentId)).pipe(
      switchMap(data => {
        if (data.data == 'online') {
          if (contentId) {
            const forPreview = window.location.href.includes('/author/')
            return (forPreview
              ? this.contentSvc.fetchAuthoringContent(contentId)
              : this.contentSvc.fetchContent(contentId, 'detail', ADDITIONAL_FIELDS_IN_CONTENT, primaryCategory)
            ).pipe(
              map(data => ({ data, error: null })),
              tap(resolveData => {
                // content data modified
                resolveData.data = resolveData.data.result.content
                let currentRoute: string[] | string = window.location.href.split('/')
                currentRoute = currentRoute[currentRoute.length - 1]
                if (forPreview && currentRoute !== 'contents' && currentRoute !== 'overview') {
                  this.router.navigate([
                    `${forPreview ? '/author' : '/app'}/toc/${resolveData.data.identifier}/${resolveData.data.children.length ?
                      'contents' : 'overview'
                    }?primaryCategory=${resolveData.data.primaryCategory}`,
                  ])
                } else if (
                  currentRoute === 'contents' &&
                  resolveData.data &&
                  !resolveData.data.children.length
                ) {
                  this.router.navigate([
                    `${forPreview ? '/author' : '/app'}/toc/${resolveData.data.identifier}/overview
                    ?primaryCategory=${resolveData.data.primaryCategory}`,
                  ])
                } else if (
                  resolveData.data &&
                  !forPreview &&
                  (resolveData.data.contentType === NsContent.EContentTypes.CHANNEL ||
                    resolveData.data.contentType === NsContent.EContentTypes.KNOWLEDGE_BOARD)
                ) {
                  const urlObj = this.routePipe.transform(resolveData.data, forPreview)
                  this.router.navigate([urlObj.url], { queryParams: urlObj.queryParams })
                }
              }),
              catchError((error: any) => of({ error, data: null })),
            )
          }
          return of({ error: 'NO_ID', data: null })
        } else if(data.error){
          return of({ error: data.error, data: null });
        } else {
          return of({ error: data.error, data: data.data });
        }
      }))
   
  }
  
  private updateDataRecursively(node) {
    if (node.contentData) {
      const updatedNode = {
        ...node,
        ...node.contentData,
        children: _.map(node.children, child => this.updateDataRecursively(child))
      };
      if (updatedNode.children.length === 0) {
        delete updatedNode.children;
      }
      return updatedNode;
    }

    const updatedNode = {
      ...node,
      children: _.map(node.children, child => this.updateDataRecursively(child))
    };

    if (updatedNode.children.length === 0) {
      delete updatedNode.children;
    }

    return updatedNode;
  }
  async fetchData(extrasState:any,collectionId) {
    if (!navigator.onLine) {
      if (extrasState) {
        return { error: null, data: extrasState };
      } else {
        const option = { contentId: collectionId, hierarchyInfo: null };
        try {
          const data: any = await this.contentService.getChildContents(option).toPromise();
          let content = this.updateDataRecursively(data);
          return { error: null, data: content };
        } catch (error) {
          // Handle errors here
          return { error, data: null };
        }
      }
    }else {
      return { error: null, data: 'online' };
    }
  }
}
