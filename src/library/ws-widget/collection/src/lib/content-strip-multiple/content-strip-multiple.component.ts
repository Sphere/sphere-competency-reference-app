import { Component, OnInit, Input, OnDestroy, Inject } from '@angular/core'
import { NsContentStripMultiple } from './content-strip-multiple.model'
import { ContentStripMultipleService } from './content-strip-multiple.service'
import { WidgetContentService } from '../_services/widget-content.service'
import { NsContent } from '../_services/widget-content.model'
import { Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'
import * as _ from 'lodash-es'
import { WidgetUserService } from '../_services/widget-user.service'
import { ContentSearchCriteria, ContentData, ProfileService, Profile, ContentService, CourseService, FormService } from '@project-sunbird/sunbird-sdk';
import { AggregatorConfigField } from '@project-sunbird/sunbird-sdk/content/handlers/content-aggregator'
import { Router } from '@angular/router'
import { CorReleationDataType } from '../../../../../../services'
import { TranslateService } from '@ngx-translate/core'
import { NsWidgetResolver } from '../../../../resolver/src/lib/widget-resolver.model'
import { WidgetBaseComponent } from '../../../../resolver/src/lib/widget-base.component'
import { LoggerService } from '../../../../utils/src/lib/services/logger.service'
import { ConfigurationsService } from '../../../../utils/src/lib/services/configurations.service'
import { EventService } from '../../../../utils/src/lib/services/event.service'
import { UtilityService } from '../../../../utils/src/lib/services/utility.service'
import { TFetchStatus } from '../../../../utils/src/lib/constants/misc.constants'

interface IStripUnitContentData {
  key: string
  canHideStrip: boolean
  mode?: string
  showStrip: boolean
  widgets?: NsWidgetResolver.IRenderConfigWithAnyData[]
  stripTitle: string
  stripName?: string
  stripInfo?: NsContentStripMultiple.IStripInfo
  noDataWidget?: NsWidgetResolver.IRenderConfigWithAnyData
  errorWidget?: NsWidgetResolver.IRenderConfigWithAnyData
  showOnNoData: boolean
  showOnLoader: boolean
  showOnError: boolean
  stripBackground?: string
  viewMoreUrl: {
    path: string
    queryParams: any
  } | null
}
@Component({
  selector: 'ws-widget-content-strip-multiple',
  templateUrl: './content-strip-multiple.component.html',
  styleUrls: ['./content-strip-multiple.component.scss'],
})
export class ContentStripMultipleComponent extends WidgetBaseComponent
  implements
  OnInit,
  OnDestroy,
  NsWidgetResolver.IWidgetData<NsContentStripMultiple.IContentStripMultiple> {
  @Input() widgetData!: NsContentStripMultiple.IContentStripMultiple

  stripsResultDataMap: { [key: string]: IStripUnitContentData } = {}
  stripsKeyOrder: string[] = []
  showAccordionData = true
  showParentLoader = false
  showParentError = false
  showParentNoData = false
  errorDataCount = 0
  noDataCount = 0
  successDataCount = 0
  searchArray = ['preview', 'channel', 'author']
  contentAvailable = true
  isFromAuthoring = false
  changeEventSubscription: Subscription | null = null
  callPublicApi = false
  explorePage = false
  formField: {
    facet: string;
    searchCriteria: ContentSearchCriteria;
    aggregate: {
      sortBy?: {
        [field in keyof ContentData]: 'asc' | 'desc';
      }[];
      groupBy?: keyof ContentData;
      groupSortBy?: any
    };
    showNavigationPill?: boolean;
    filterPillBy?: string;
  };
  corRelationList: any;
  private searchCriteria: ContentSearchCriteria;
  profile: Profile;

  constructor(
    private contentStripSvc: ContentStripMultipleService,
    private contentSvc: WidgetContentService,
    private loggerSvc: LoggerService,
    private eventSvc: EventService,
    private configSvc: ConfigurationsService,
    protected utilitySvc: UtilityService,
    private userSvc: WidgetUserService,
    private router: Router,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('FORM_SERVICE') private formService: FormService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private translate: TranslateService
  ) {
    super()
    const extras = _.get(this.router.getCurrentNavigation(), 'extras.state');
    if (extras) {
      this.corRelationList = extras.corRelation;
    }
    if (this.corRelationList) {
      this.corRelationList.forEach(list => {
        if (list.type == CorReleationDataType.CONTENT) {
          this.formField = list.id;
          this.searchCriteria = JSON.parse(JSON.stringify(list.id.searchCriteria));
          if (this.formField && this.formField.facet && this.formField.facet.toLowerCase() === 'course') {
            if (!this.searchCriteria.impliedFiltersMap) {
              this.searchCriteria.impliedFiltersMap = [];
            }
            this.searchCriteria.impliedFiltersMap = this.searchCriteria.impliedFiltersMap.concat([{
              'batches.enrollmentType': 'open'
            }, {
              'batches.status': 1
            }
            ]);
          }
          this.formField.facet = this.formField.facet.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
        }
      });
    }
  }

  ngOnInit() {
    const url = window.location.href
    this.isFromAuthoring = this.searchArray.some((word: string) => {
      return url.indexOf(word) > -1
    })
    if (url.indexOf('explore') > 0) {
      this.explorePage = true
    }
    if (url.indexOf('login') > 0 || url.indexOf('explore') > 0) {
      this.callPublicApi = true
      // Fetch the data
      for (const strip of this.widgetData.strips) {
        if (this.checkForEmptyWidget(strip)) {
          this.fetchStripFromRequestData(strip)
        } else {
          this.processStrip(strip, [], 'done', true, null)
        }
      }
      // Subscription for changes
      const keyAndEvent: { key: string; type: string; from: string }[] = this.widgetData.strips
        .map(strip => ({
          key: strip.key,
          type: (strip.refreshEvent && strip.refreshEvent.eventType) || '',
          from: (strip.refreshEvent && strip.refreshEvent.from.toString()) || '',
        }))
        .filter(({ key, type, from }) => key && type && from)
      const eventTypeSet = new Set(keyAndEvent.map(e => e.type))
      this.changeEventSubscription = this.eventSvc.events$
        .pipe(filter(event => eventTypeSet.has(event.eventType)))
        .subscribe(event => {
          keyAndEvent
            .filter(e => e.type === event.eventType && e.from === event.from)
            .map(e => e.key)
            .forEach(k => this.fetchStripFromKeyForLogin(k, false))
        })
      this.stripsKeyOrder = this.widgetData.strips.map(strip => strip.key) || []
    } else if (url.indexOf('public/home') > 0) {
      this.initPublicHomeData()
    } else {
      this.initData()
    }
  }

  ngOnDestroy() {
    if (this.changeEventSubscription) {
      this.changeEventSubscription.unsubscribe()
    }
  }
  private initPublicHomeData() {
    this.stripsKeyOrder = this.widgetData.strips.map(strip => strip.key) || []
    if (this.widgetData.loader && this.widgetData.strips.length) {
      this.showParentLoader = true
    }
    // Fetch the data
    for (const strip of this.widgetData.strips) {
      if (this.checkForEmptyWidget(strip)) {
        this.fetchHomeStripFromRequestData(strip)
      } else {
        this.processStrip(strip, [], 'done', true, null)
      }
    }
    // Subscription for changes
    const keyAndEvent: { key: string; type: string; from: string }[] = this.widgetData.strips
      .map(strip => ({
        key: strip.key,
        type: (strip.refreshEvent && strip.refreshEvent.eventType) || '',
        from: (strip.refreshEvent && strip.refreshEvent.from.toString()) || '',
      }))
      .filter(({ key, type, from }) => key && type && from)
    const eventTypeSet = new Set(keyAndEvent.map(e => e.type))
    this.changeEventSubscription = this.eventSvc.events$
      .pipe(filter(event => eventTypeSet.has(event.eventType)))
      .subscribe(event => {
        keyAndEvent
          .filter(e => e.type === event.eventType && e.from === event.from)
          .map(e => e.key)
          .forEach(k => this.fetchStripFromHomeKey(k, false))
      })
  }
  private initData() {
    this.stripsKeyOrder = this.widgetData.strips.map(strip => strip.key) || []
    if (this.widgetData.loader && this.widgetData.strips.length) {
      this.showParentLoader = true
    }
    // Fetch the data
    for (const strip of this.widgetData.strips) {
      if (this.checkForEmptyWidget(strip)) {
        this.fetchStripFromRequestData(strip)
      } else {
        this.processStrip(strip, [], 'done', true, null)
      }
    }
    // Subscription for changes
    const keyAndEvent: { key: string; type: string; from: string }[] = this.widgetData.strips
      .map(strip => ({
        key: strip.key,
        type: (strip.refreshEvent && strip.refreshEvent.eventType) || '',
        from: (strip.refreshEvent && strip.refreshEvent.from.toString()) || '',
      }))
      .filter(({ key, type, from }) => key && type && from)
    const eventTypeSet = new Set(keyAndEvent.map(e => e.type))
    this.changeEventSubscription = this.eventSvc.events$
      .pipe(filter(event => eventTypeSet.has(event.eventType)))
      .subscribe(event => {
        keyAndEvent
          .filter(e => e.type === event.eventType && e.from === event.from)
          .map(e => e.key)
          .forEach(k => this.fetchStripFromKey(k, false))
      })
  }

  private fetchStripFromKeyForLogin(key: string, calculateParentStatus = true) {
    const stripData = this.widgetData.strips.find(strip => strip.key === key)
    if (stripData) {
      this.fetchStripFromRequestDataforLogin(stripData, calculateParentStatus)
      // this.fetchFromSearch(strip, calculateParentStatus)
    }
  }

  private fetchStripFromRequestDataforLogin(
    strip: NsContentStripMultiple.IContentStripUnit,
    calculateParentStatus = true,
  ) {
    // setting initial values
    this.processStrip(strip, [], 'fetching', false, null)
    this.fetchFromApi(strip, calculateParentStatus)
    this.fetchFromSearch(strip, calculateParentStatus)
    this.fetchFromSearchRegionRecommendation(strip, calculateParentStatus)
    this.fetchFromSearchV6(strip, calculateParentStatus)
    this.fetchFromIds(strip, calculateParentStatus)
    this.fetchFromEnrollmentList(strip, calculateParentStatus)

  }
  fetchFromEnrollmentList(strip: NsContentStripMultiple.IContentStripUnit, calculateParentStatus = true) {
    if (strip.request && strip.request.enrollmentList && Object.keys(strip.request.enrollmentList).length) {
      let userId = ''
      let content: NsContent.IContent[]
      let contentNew: NsContent.IContent[]
      const queryParams = _.get(strip.request.enrollmentList, 'queryParams')
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId
      } else {
        userId = this.configSvc.unMappedUser.id
      }
      // tslint:disable-next-line: deprecation
      this.userSvc.fetchUserBatchList(userId, queryParams).subscribe(
        courses => {
          const showViewMore = Boolean(
            courses.length > 5 && strip.stripConfig && strip.stripConfig.postCardForSearch,
          )
          const viewMoreUrl = showViewMore
            ? {
              path: '/app/search/learning',
              queryParams: {
                q: strip.request && strip.request.searchV6 && strip.request.searchV6.query,
                f:
                  strip.request && strip.request.searchV6 && strip.request.searchV6.filters
                    ? JSON.stringify(
                      // this.searchServSvc.transformSearchV6Filters(
                      strip.request.searchV6.filters
                      // ),
                    )
                    : {},
              },
            }
            : null
          if (courses && courses.length) {
            content = courses
              .map(c => {
                const contentTemp: NsContent.IContent = c.content
                contentTemp.completionPercentage = c.completionPercentage || c.progress || 0
                contentTemp.completionStatus = c.completionStatus || c.status || 0
                return contentTemp
              })
          }
          // To filter content with completionPercentage > 0,
          // so that only those content will show in home page
          // continue learing strip
          if (content && content.length) {
            contentNew = content.filter((c: any) => {
              /** commented as both are 0 after enrolll */
              if (c.completionPercentage && c.completionPercentage > 0) {
                return c
              }
            })
          }
          if (localStorage.getItem('loginbtn') || localStorage.getItem('url_before_login')) {
            // this.tocSvc.setcontentForWidget(contentNew)
            this.processStrip(
              strip,
              this.transformContentsToWidgets(contentNew, strip),
              'done',
              calculateParentStatus,
              viewMoreUrl,
            )
          } else {
            // this.tocSvc.setcontentForWidget(content)
            this.processStrip(
              strip,
              this.transformContentsToWidgets(content, strip),
              'done',
              calculateParentStatus,
              viewMoreUrl,
            )
          }
        },
        () => {
          this.processStrip(strip, [], 'error', calculateParentStatus, null)
        }
      )
    }
  }

  private fetchStripFromKey(key: string, calculateParentStatus = true) {
    const stripData = this.widgetData.strips.find(strip => strip.key === key)
    if (stripData) {
      this.fetchStripFromRequestData(stripData, calculateParentStatus)
    }
  }

  private fetchStripFromHomeKey(key: string, calculateParentStatus = true) {
    const stripData = this.widgetData.strips.find(strip => strip.key === key)
    if (stripData) {
      this.fetchHomeStripFromRequestData(stripData, calculateParentStatus)
    }
  }

  private fetchHomeStripFromRequestData(
    strip: NsContentStripMultiple.IContentStripUnit,
    calculateParentStatus = true,
  ) {

    // setting initial values
    this.processStrip(strip, [], 'fetching', false, null)
    // this.fetchFromApi(strip, calculateParentStatus)
    // this.fetchFromSearch(strip, calculateParentStatus)
    // this.fetchFromSearchRegionRecommendation(strip, calculateParentStatus)
    this.fetchFromPublicSearch(strip, calculateParentStatus)
    // his.fetchFromIds(strip, calculateParentStatus)
    // this.fetchFromEnrollmentList(strip, calculateParentStatus)
  }

  private fetchStripFromRequestData(
    strip: NsContentStripMultiple.IContentStripUnit,
    calculateParentStatus = true,
  ) {
    // setting initial values
    this.processStrip(strip, [], 'fetching', false, null)
    this.fetchFromApi(strip, calculateParentStatus)
    this.fetchFromSearch(strip, calculateParentStatus)
    this.fetchFromSearchRegionRecommendation(strip, calculateParentStatus)
    this.fetchFromSearchV6(strip, calculateParentStatus)
    this.fetchFromIds(strip, calculateParentStatus)
    this.fetchFromEnrollmentList(strip, calculateParentStatus)
  }
  fetchFromApi(strip: NsContentStripMultiple.IContentStripUnit, calculateParentStatus = true) {
    if (strip.request && strip.request.api && Object.keys(strip.request.api).length) {
      this.contentStripSvc.getContentStripResponseApi(strip.request.api).subscribe(
        results => {
          results.contents = results.contents.filter(item => {
            return item.contentType === 'Course'
          })
          this.processStrip(
            strip,
            this.transformContentsToWidgets(results.contents, strip),
            'done',
            calculateParentStatus,
            null,
          )
        },
        () => {
          this.processStrip(strip, [], 'error', calculateParentStatus, null)
        },
      )
    }
  }
  fetchFromSearch(strip: NsContentStripMultiple.IContentStripUnit, calculateParentStatus = true) {
    if (strip.request && strip.request.search && Object.keys(strip.request.search).length) {
      if (this.configSvc.activeLocale) {
        strip.request.search.locale = [this.configSvc.activeLocale.locals[0]]
      } else {
        strip.request.search.locale = ['en']
      }
      if (!this.callPublicApi) {
        if (strip.request.search && strip.request.search.filters) {
          strip.request.search.filters.lastUpdatedOn = ['year']
          strip.request.search.sort = [
            {
              lastUpdatedOn: 'desc',
            },
          ]
        }
        this.contentSvc.search(strip.request.search).subscribe(
          results => {
            const showViewMore = Boolean(
              results.result.length > 5 && strip.stripConfig && strip.stripConfig.postCardForSearch,
            )
            const viewMoreUrl = showViewMore
              ? {
                path: '/app/search/learning',
                queryParams: {
                  q: strip.request && strip.request.search && strip.request.search.query,
                  f: JSON.stringify(
                    strip.request && strip.request.search && strip.request.search.filters,
                  ),
                },
              }
              : null
            this.processStrip(
              strip,
              this.transformContentsToWidgets(results.result, strip),
              'done',
              calculateParentStatus,
              viewMoreUrl,
            )
          },
          () => {
            this.processStrip(strip, [], 'error', calculateParentStatus, null)
          },
        )
      } else {
        const req = {
          query: '',
          filters: [{ andFilters: [{ contentType: ['Course', 'Program'] }] }],
        }
        this.contentSvc.searchV6(req).subscribe(result => {
          const results = result
          if (results.result.length > 0) {
            const showViewMore = Boolean(
              results.result.length > 5 && strip.stripConfig && strip.stripConfig.postCardForSearch,
            )
            const viewMoreUrl = showViewMore
              ? {
                path: '/app/search/learning',
                queryParams: {
                  q: strip.request && strip.request.search && strip.request.search.query,
                  f: JSON.stringify(
                    strip.request && strip.request.search && strip.request.search.filters,
                  ),
                },
              }
              : null
            this.processStrip(
              strip,
              this.transformContentsToWidgets(results.result, strip),
              'done',
              calculateParentStatus,
              viewMoreUrl,
            )
          }
        })
      }
    }
  }

  fetchFromSearchRegionRecommendation(
    strip: NsContentStripMultiple.IContentStripUnit,
    calculateParentStatus = true,
  ) {
    if (
      strip.request &&
      strip.request.searchRegionRecommendation &&
      Object.keys(strip.request.searchRegionRecommendation).length
    ) {
      this.contentSvc
        .searchRegionRecommendation(strip.request.searchRegionRecommendation)
        .subscribe(
          results => {
            this.processStrip(
              strip,
              this.transformContentsToWidgets(results.contents, strip),
              'done',
              calculateParentStatus,
              null,
            )
          },
          () => {
            this.processStrip(strip, [], 'error', calculateParentStatus, null)
          },
        )
    }
  }
  private transformSearchV6FiltersV2(v6filters: any) {
    const filters: any = {}
    if (v6filters.constructor === Array) {
      v6filters.forEach(((f: any) => {
        Object.keys(f).forEach(key => {
          filters[key] = f[key]
        })
      }))
      return filters
    }
    return v6filters
  }

  fetchFromSearchV6(strip: NsContentStripMultiple.IContentStripUnit, calculateParentStatus = true) {
    if (strip.request && strip.request.searchV6 && Object.keys(strip.request.searchV6).length) {
      // if (!(strip.request.searchV6.locale && strip.request.searchV6.locale.length > 0)) {
      //   if (this.configSvc.activeLocale) {
      //     strip.request.searchV6.locale = [this.configSvc.activeLocale.locals[0]]
      //   } else {
      //     strip.request.searchV6.locale = ['en']
      //   }
      // }
      let originalFilters: any = []
      if (strip.request &&
        strip.request.searchV6 &&
        strip.request.searchV6.request &&
        strip.request.searchV6.request.filters) {
        originalFilters = strip.request.searchV6.request.filters
        strip.request.searchV6.request.filters = this.transformSearchV6FiltersV2(
          strip.request.searchV6.request.filters,
        )
      }

      this.contentSvc.searchV6(strip.request.searchV6).subscribe(
        results => {
          const showViewMore = Boolean(
            results.result.length > 5 && strip.stripConfig && strip.stripConfig.postCardForSearch,
          )
          results.result = this.filterCourse(results.result)
          const viewMoreUrl = showViewMore
            ? {
              path: '/app/search/learning',
              queryParams: {
                q: strip.request && strip.request.searchV6 && strip.request.searchV6.request,
                f:
                  strip.request &&
                    strip.request.searchV6 &&
                    strip.request.searchV6.request &&
                    strip.request.searchV6.request.filters
                    ? JSON.stringify(
                      this.transformSearchV6FiltersV2(
                        originalFilters,
                      )
                    )
                    : {},
              },
            }
            : null
          this.processStrip(
            strip,
            this.transformContentsToWidgets(results.result['content'], strip),
            'done',
            calculateParentStatus,
            viewMoreUrl,
          )
        },
        () => {
          this.processStrip(strip, [], 'error', calculateParentStatus, null)
        },
      )
    }
  }

  async fetchFromPublicSearch(strip: NsContentStripMultiple.IContentStripUnit, calculateParentStatus = true) {
    if (strip.request && strip.request.searchV6 && Object.keys(strip.request.searchV6).length) {
      // if (!(strip.request.searchV6.locale && strip.request.searchV6.locale.length > 0)) {
      //   if (this.configSvc.activeLocale) {
      //     strip.request.searchV6.locale = [this.configSvc.activeLocale.locals[0]]
      //   } else {
      //     strip.request.searchV6.locale = ['en']
      //   }
      // }
      let originalFilters: any = []
      if (strip.request &&
        strip.request.searchV6 &&
        strip.request.searchV6.request &&
        strip.request.searchV6.request.filters) {
        originalFilters = strip.request.searchV6.request.filters
        strip.request.searchV6.request.filters = this.transformSearchV6FiltersV2(
          strip.request.searchV6.request.filters,
        )
      }
      const defaultLang:any = ["en","english", "hi"]
      // this.translate.getDefaultLang();
      //await this.fetchAndSortData()
      this.contentSvc.publicContentSearch(strip.request.searchV6, defaultLang).subscribe(
        results => {
          results.result = this.filterCourse(results.result)
          const showViewMore = Boolean(
            results.result.length > 5 && strip.stripConfig && strip.stripConfig.postCardForSearch,
          )
          const viewMoreUrl = showViewMore
            ? {
              path: '/app/search/learning',
              queryParams: {
                q: strip.request && strip.request.searchV6 && strip.request.searchV6.request,
                f:
                  strip.request &&
                    strip.request.searchV6 &&
                    strip.request.searchV6.request &&
                    strip.request.searchV6.request.filters
                    ? JSON.stringify(
                      this.transformSearchV6FiltersV2(
                        originalFilters,
                      )
                    )
                    : {},
              },
            }
            : null
          this.processStrip(
            strip,
            this.transformContentsToWidgets(results.result['content'], strip),
            'done',
            calculateParentStatus,
            viewMoreUrl
            )
            // defaultLang
        },
        () => {
          this.processStrip(strip, [], 'error', calculateParentStatus, null)
        },
      )
    }
  }

  private async fetchAndSortData() {
    const temp = ((await this.contentService.buildContentAggregator
      (this.formService, this.courseService, this.profileService)
      .aggregate({
        interceptSearchCriteria: () => ({}),
        userPreferences: {}
      },
        [], null, [{
          dataSrc: {
            type: 'CONTENTS',
            request: {
              type: 'POST',
              path: '/apis/public/v8/mobileApp/kong/content/v1/search',
              withBearerToken: true
            },
            mapping: [{
              aggregate: this.formField.aggregate
            }]
          },
          sections: [
            {
              index: 0,
              title: this.formField.facet,
              theme: {}
            }
          ],
        } as AggregatorConfigField<'CONTENTS'>]).toPromise()).result);
    (this as any)['filterCriteria'] = temp[0].meta.filterCriteria;
    // console.log('temp ', temp);
  }

  fetchFromIds(strip: NsContentStripMultiple.IContentStripUnit, calculateParentStatus = true) {
    if (strip.request && strip.request.ids && Object.keys(strip.request.ids).length) {
      this.contentSvc.fetchMultipleContent(strip.request.ids).subscribe(
        results => {
          this.processStrip(
            strip,
            this.transformContentsToWidgets(results, strip),
            'done',
            calculateParentStatus,
            null,
          )
        },
        () => {
          this.processStrip(strip, [], 'error', calculateParentStatus, null)
        },
      )
    }
  }
  filterCourse(contents: any) {
    const list = contents.content
    const newList = list.filter((i: any) => {
      return (i.identifier !== 'do_11357408383009587211503' && i.identifier !== 'do_1136945911089315841314' && i.identifier !== 'do_1136782979878830081208')
    })
    contents.content = newList
    contents.content = this.getUptsu(contents.content)
    return contents

  }

  getUptsu(contents) {
    let sorted = contents.sort((a, b) => {
      // 'UPTSU' comes first, so if either a or b is 'UPTSU', return -1
      if (a.sourceName === 'UPTSU' || b.sourceName === 'UPTSU') {
        return a.sourceName === 'UPTSU' ? -1 : 1;
      }
    });
    return sorted;
  }
  private transformContentsToWidgets(
    contents: NsContent.IContent[],
    strip: NsContentStripMultiple.IContentStripUnit,
  ) {
    return (contents || []).map((content, idx) => ({
      widgetType: 'card',
      widgetSubType: 'cardContent',
      widgetHostClass: 'mb-2',
      widgetData: {
        content,
        cardSubType: strip.stripConfig && strip.stripConfig.cardSubType,
        context: { pageSection: strip.key, position: idx },
        intranetMode: strip.stripConfig && strip.stripConfig.intranetMode,
        deletedMode: strip.stripConfig && strip.stripConfig.deletedMode,
        contentTags: strip.stripConfig && strip.stripConfig.contentTags,
        badges: {
          orgIcon: strip.stripConfig.cardSubType === 'card-badges' ? true : false,
          certification: strip.stripConfig.cardSubType === 'card-badges' ? true : false
        }
      },
    }))
  }

  showAccordion(key: string) {
    if (this.utilitySvc.isMobile && this.stripsResultDataMap[key].mode === 'accordion') {
      return this.showAccordionData
    }
    return true
  }

  setHiddenForStrip(key: string) {
    this.stripsResultDataMap[key].showStrip = false
    localStorage.setItem(`cstrip_${key}`, '1')
  }
  private getIfStripHidden(key: string): boolean {
    const storageItem = localStorage.getItem(`cstrip_${key}`)
    return Boolean(storageItem !== '1')
  }

  getHiTitle(title) {
    let contentTitle = '';

    switch (title) {
      case 'Featured Courses':
        contentTitle = 'विशेष पाठ्यक्रम';
        break;

      default:
        contentTitle = title
        break;
    }

    return contentTitle;
  }

  private async processStrip(
    strip: NsContentStripMultiple.IContentStripUnit,
    results: NsWidgetResolver.IRenderConfigWithAnyData[] = [],
    fetchStatus: TFetchStatus,
    calculateParentStatus = true,
    viewMoreUrl: any,
    // defalutLang?: string
    // calculateParentStatus is used so that parents' status is not re-calculated if the API is called again coz of filters, etc.
  ) {
    let defalutLang = this.translate.getDefaultLang();
    // this.stripsResultDataMap[strip.key]
    if (results.length && strip.fetchLikes) {
      await this.processContentLikes(results)
    }
    const stripData = {
      viewMoreUrl,
      key: strip.key,
      canHideStrip: Boolean(strip.canHideStrip),
      showStrip: this.getIfStripHidden(strip.key),
      noDataWidget: strip.noDataWidget,
      errorWidget: strip.errorWidget,
      stripInfo: strip.info,
      stripTitle: defalutLang == 'hi' ? this.getHiTitle(strip.title) : strip.title,
      stripName: strip.name,
      mode: strip.mode,
      stripBackground: strip.stripBackground,
      widgets:
        fetchStatus === 'done'
          ? [
            ...(strip.preWidgets || []).map(w => ({
              ...w,
              widgetHostClass: `mb-2 ${w.widgetHostClass}`,
            })),
            ...results,
            ...(strip.postWidgets || []).map(w => ({
              ...w,
              widgetHostClass: `mb-2 ${w.widgetHostClass}`,
            })),
          ]
          : [],
      showOnNoData: Boolean(
        strip.noDataWidget &&
        !((strip.preWidgets || []).length + results.length + (strip.postWidgets || []).length) &&
        fetchStatus === 'done',
      ),
      showOnLoader: Boolean(strip.loader && fetchStatus === 'fetching'),
      showOnError: Boolean(strip.errorWidget && fetchStatus === 'error'),
    }
    // const stripData = this.stripsResultDataMap[strip.key]
    this.stripsResultDataMap = {
      ...this.stripsResultDataMap,
      [strip.key]: stripData,
    }
    if (_.get(this.stripsResultDataMap, 'latest.widgets', []).length > 0) {
      this.stripsResultDataMap.latest.widgets = _.filter(this.stripsResultDataMap.latest.widgets, widget => {
        return _.includes(['Others'], _.get(widget, 'widgetData.content.sourceName'))
      })
    }

    if (
      calculateParentStatus &&
      (fetchStatus === 'done' || fetchStatus === 'error') &&
      stripData.widgets
    ) {
      this.checkParentStatus(fetchStatus, stripData.widgets.length)
    }
    if (calculateParentStatus && !(results && results.length > 0)) {
      this.contentAvailable = false
    } else if (results && results.length > 0) {
      this.contentAvailable = true
    }
  }
  private checkParentStatus(fetchStatus: TFetchStatus, stripWidgetsCount: number): void {
    if (fetchStatus === 'done' && !stripWidgetsCount) {
      this.noDataCount += 1
    } else if (fetchStatus === 'done' && stripWidgetsCount) {
      this.successDataCount += 1
    } else if (fetchStatus === 'error') {
      this.errorDataCount += 1
    }
    const settledCount = this.noDataCount + this.successDataCount + this.errorDataCount
    const totalCount = this.widgetData.strips.length
    if (this.successDataCount > 0 && settledCount < totalCount) {
      return
    }
    this.showParentLoader = settledCount !== totalCount
    this.showParentNoData =
      this.noDataCount > 0 && this.noDataCount + this.errorDataCount === totalCount
    this.showParentError = this.errorDataCount === totalCount
  }

  toggleInfo(data: IStripUnitContentData) {
    const stripInfo = this.stripsResultDataMap[data.key].stripInfo
    if (stripInfo) {
      if (stripInfo.mode !== 'below') {
        this.loggerSvc.warn(`strip info mode: ${stripInfo.mode} not implemented yet`)
        stripInfo.mode = 'below'
      }
      if (stripInfo.mode === 'below') {
        this.stripsResultDataMap[data.key].stripInfo = {
          ...stripInfo,
          visibilityMode: 'visible',
        }
      }
    }
  }

  checkForEmptyWidget(strip: NsContentStripMultiple.IContentStripUnit): boolean {
    if (
      strip.request &&
      ((strip.request.api && Object.keys(strip.request.api).length) ||
        (strip.request.search && Object.keys(strip.request.search).length) ||
        (strip.request.searchRegionRecommendation &&
          Object.keys(strip.request.searchRegionRecommendation).length) ||
        (strip.request.searchV6 && Object.keys(strip.request.searchV6).length) ||
        (strip.request.enrollmentList && Object.keys(strip.request.enrollmentList).length) ||
        (strip.request.ids && Object.keys(strip.request.ids).length))
    ) {
      return true
    }
    if (strip.request &&
      ((strip.request.search && Object.keys(strip.request.search).length))) {
      return true
    }
    return false
  }

  processContentLikes(results: NsWidgetResolver.IRenderConfigWithAnyData[]): Promise<any> {
    const contentIds = {
      content_id:
        results.map(result => result.widgetData && result.widgetData.content.identifier) || [],
    }
    return this.contentSvc
      .fetchContentLikes(contentIds)
      .then(likeHash => {
        const likes = likeHash
        results.forEach(result => {
          result.widgetData.likes = likes[result.widgetData.content.identifier] || 0
        })
      })
      .catch(_err => { })
      .finally(() => Promise.resolve())
  }
}
