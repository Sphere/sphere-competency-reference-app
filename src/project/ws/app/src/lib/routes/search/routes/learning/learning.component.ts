import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { IKhubFetchStatus } from '../../../infy/routes/knowledge-hub/models/knowledgeHub.model'
// import { TrainingService } from '../../../infy/routes/training/services/training.service'
import { FilterDisplayComponent } from '../../components/filter-display/filter-display.component'
// import { IFilterUnitResponse, ISearchRequest, ISearchRequestV2, ISearchTab } from '../../models/search.model'
import { IFilterUnitResponse, ISearchRequestV2, ISearchTab, ISearchRequestV3 } from '../../models/search.model'
import { SearchServService } from '../../services/search-serv.service'
import * as _ from 'lodash'
import searchData from 'assets/configurations/feature/search.json'
import { SearchApiService } from '../../apis/search-api.service'
import { CommonUtilService, Environment, ErrorType, InteractSubtype, InteractType, PageId, TelemetryGeneratorService } from '../../../../../../../../../services'
import { RouterLinks } from '../../../../../../../../../app/app.constant'
import { AppFrameworkDetectorService } from '../../../../../../../../../app/modules/core/services/app-framework-detector-service.service'
import { Platform, NavController } from '@ionic/angular'
import {
  AuthService
} from 'sunbird-sdk';
import { NsError } from '../../../../../../../../../library/ws-widget/collection/src/lib/models/error-resolver.model'
import { NSSearch } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-search.model'
import { NsWidgetResolver } from '../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.model'
import { ROOT_WIDGET_CONFIG } from '../../../../../../../../../library/ws-widget/collection/src/lib/collection.config'
import { ValueService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/value.service'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UtilityService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/utility.service'
import { NsContent } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'

@Component({
  selector: 'ws-app-learning',
  templateUrl: './learning.component.html',
  styleUrls: ['./learning.component.scss'],
})
export class LearningComponent implements OnInit, OnDestroy {
  @ViewChild(FilterDisplayComponent, { static: false })
  appFilterDisplay: FilterDisplayComponent | null = null

  removable = true
  defaultSideNavBarOpenedSubscription: Subscription | null = null
  expandToPrefLang = true
  isLtMedium$ = this.valueSvc.isLtMedium$
  isXSmall$ = this.valueSvc.isXSmall$
  screenSizeIsLtMedium = false
  sideNavBarOpened = true
  searchRequestStatus: IKhubFetchStatus = 'none'
  lang = ['en', 'hi', 'kn']
  contactMethods = [
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'हिंदी' },
    { id: 'kn', label: 'ಕನ್ನಡ' }
  ]
  contact = []

  searchResults: NSSearch.ISearchV6ApiResultV2 = {
    id: '',
    ver: '',
    ts: '',
    params: {
      resmsgid: '',
      err: '',
      errmsg: '',
      msgid: '',
      status: '',
    },
    filters: [],
    responseCode: '',
    result: {
      count: 0,
      content: [],
      facets: [],
    },
  }
  searchRequestObject: ISearchRequestV2 = {
    request: {
      filters: {
        visibility: ['Default'],
      },
      query: '',
      sort_by: { lastUpdatedOn: 'desc' },
      fields: [],
      facets: [],
    },
  }
  newSearchRequestObject: ISearchRequestV3 = {

    query: '',
    language: '',
    Offset: 0, // Start with 0
    limit: 5 // Define the limit of items to fetch per request

  }
  searchResultsSubscription: Subscription | undefined
  filtersResetAble = false
  resultsDisplayType: 'basic' | 'advanced' = 'advanced'
  searchRequest: {
    query: string
    filters: { [type: string]: string[] }
    sort?: string
    lang?: any
  } = {
      query: '',
      filters: {},
      sort: '',
      lang: this.getActiveLocale() || '',
    }
  selectedFilterSet: Set<string> = new Set()
  noContent = false
  exactResult = {
    show: false,
    text: '',
    applied: false,
    old: '',
  }
  error = {
    load: false,
    message: '',
  }
  routeComp = ''
  translatedFilters: any = {}
  isIntranetAllowedSettings = false
  prefChangeSubscription: Subscription | null = null

  filtersResponse: IFilterUnitResponse[] = []
  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }
  showBackBtn = false
  displayConfig = {
    displayType: 'card-badges',
    showCompetency: true,
    badges: {
      orgIcon: true,
      certification: true,
    }
  }
  appFramework: any
  showUptuLogo = false;
  public backButtonFunc: Subscription;
  isCompetency: boolean = false;
  ashaData: any = {};
  isTablet = false;
  constructor(
    private activated: ActivatedRoute,
    private router: Router,
    private valueSvc: ValueService,
    private searchServ: SearchServService,
    private configSvc: ConfigurationsService,
    // private trainingSvc: TrainingService,
    private utilitySvc: UtilityService,
    private searchSvc: SearchApiService,
    private commonUtilService: CommonUtilService,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private platform: Platform,
    private navCtrl: NavController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
    this.commonUtilService.removeLoader()
  }

  getActiveLocale() {
    const locale = (this.configSvc.activeLocale && this.configSvc.activeLocale.locals[0]) || ''
    return this.searchServ.getLanguageSearchIndex(locale)
  }

  get applyPhraseSearch(): boolean {
    if (_.get(this.activated, 'snapshot.data.pageData.data.search.tabs[0].phraseSearch', searchData.search.tabs[0].phraseSearch) ||
      _.get(this.activated, 'snapshot.data.pageData.data.search.tabs[0].phraseSearch', searchData.search.tabs[0].phraseSearch) === undefined) {
      return true
    }
    return false
  }

  get applyIsStandAlone(): boolean {
    if (_.get(this.activated, 'snapshot.data.pageData.data.search.tabs[0].isStandAlone', searchData.search.tabs[0].isStandAlone) ||
      _.get(this.activated, 'snapshot.data.pageData.data.search.tabs[0].isStandAlone', searchData.search.tabs[0].isStandAlone) === undefined) {
      return true
    }
    return false
  }

  get filtersFromConfig() {
    return _.get(this.activated, 'snapshot.data.pageData.data.search.tabs[0].searchQuery.filters', searchData.search.tabs[0].searchQuery.filters)
  }

  get isDefaultFilterApplied() {
    const defaultFilters = JSON.parse(JSON.stringify(this.filtersFromConfig || {}))
    // const appliedFilters = JSON.parse(JSON.stringify(this.searchRequestObject.filters || {}))
    const appliedFilters = JSON.parse(JSON.stringify(this.searchRequestObject.request.filters || {}))
    if (!Object.keys(defaultFilters).length) {
      return false
    }
    for (const key of Object.keys(defaultFilters)) {
      if (JSON.stringify(defaultFilters[key]) !== JSON.stringify(appliedFilters[key])) {
        return false
      }
    }
    return true
  }

  get preferredLanguages(): string {
    if (this.configSvc.userPreference && this.configSvc.userPreference.selectedLangGroup) {
      let prefLang: string[] | string = this.configSvc.userPreference.selectedLangGroup.split(',').map(lang => {
        return this.searchServ.getLanguageSearchIndex(lang || 'en')
      })
      prefLang = prefLang.join(',')
      return prefLang
    }
    return 'en'
  }

  get searchAcrossPreferredLang() {
    // if (this.activated.snapshot.data.pageData.data.search.tabs[0].acrossPreferredLang) {
    //   if (this.searchRequestObject.locale && this.searchRequestObject.locale.join(',') !== this.preferredLanguages) {
    //     return true
    //   }
    //   return false
    // }
    return false
  }
  selectLang(e: any) {
    this.lang = e;
    this.router.navigate([], {
      queryParams: { lang: e },
      relativeTo: this.activated.parent,
      queryParamsHandling: 'merge',
    })
  }

  removeDefaultFiltersApplied() {
    const defaultFilters = JSON.parse(JSON.stringify(this.filtersFromConfig || {}))
    // const appliedFilters = JSON.parse(JSON.stringify(this.searchRequestObject.filters || {}))
    const appliedFilters = JSON.parse(JSON.stringify(this.searchRequestObject.request.filters || {}))
    const newFilters = JSON.parse(JSON.stringify(appliedFilters))
    for (const key of Object.keys(defaultFilters)) {
      if (!appliedFilters[key]) {
        return
      }
      if (JSON.stringify(defaultFilters[key]) !== JSON.stringify(appliedFilters[key])) {
        return
      }
      delete newFilters[key]
    }
    this.router.navigate([], {
      queryParams: { f: JSON.stringify(newFilters) },
      relativeTo: this.activated.parent,
      queryParamsHandling: 'merge',
    })
  }

  searchWithPreferredLanguage() {
    this.router.navigate([], {
      queryParams: { lang: this.preferredLanguages },
      relativeTo: this.activated.parent,
      queryParamsHandling: 'merge',
    })
  }

  ngOnInit() {
    this.isTablet = this.commonUtilService.isTablet();
    this.registerDeviceBackButton();
    if (this.router.url.includes(RouterLinks.SEARCH_PAGE + '/' + RouterLinks.learning)) {
      this.showBackBtn = true
    } else {
      this.showBackBtn = false
    }
    this.searchServ.searchConfig = _.get(this.activated, 'snapshot.data.pageData.data', searchData)
    this.prefChangeSubscription = this.configSvc.prefChangeNotifier.subscribe(() => {
      this.isIntranetAllowedSettings = this.configSvc.isIntranetAllowed
    })
    const queryMap = this.activated.snapshot.queryParamMap
    let defaultFilters = {}
    const lang = this.configSvc.userPreference && this.configSvc.userPreference.selectedLocale
    this.searchServ.translateSearchFilters(lang || 'en').then(val => {
      this.translatedFilters = val
    })
    if (queryMap.get('f')) {
      defaultFilters = JSON.parse(queryMap.get('f') || '{}')
    }
    if (!Object.keys(defaultFilters).length && Object.keys(this.filtersFromConfig).length) {
      this.router.navigate([], {
        skipLocationChange: true,
        queryParams: { f: JSON.stringify(this.filtersFromConfig) },
        relativeTo: this.activated.parent,
        queryParamsHandling: 'merge',
      })
    }
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe((isLtMedium: boolean) => {
      this.screenSizeIsLtMedium = isLtMedium
      this.sideNavBarOpened = !isLtMedium
    })
    // if (this.activated.snapshot.data.learning && this.activated.snapshot.data.learning.result) {
    //   this.searchResults.totalHits = this.activated.snapshot.data.learning.totalHits
    //   this.searchResults.filters = this.activated.snapshot.data.learning.filters
    //   this.searchResults.type = this.activated.snapshot.data.learning.type
    //   this.searchResults.result = this.activated.snapshot.data.learning.result
    // } else {
    this.activated.queryParamMap.subscribe(queryParams => {
      if (queryParams.get('competency') == 'true') {
        this.isCompetency = true
        if(queryParams.get('data')) {
          this.ashaData = JSON.parse(queryParams.get('data'))
        }
        this.getCompetencyResult(queryParams.getAll('q'))
      } else {
        this.isCompetency = false
        // Reset search request object
        this.searchRequest = {
          query: '',
          filters: {},
        }
        if (
          this.activated.snapshot.data &&
          this.activated.snapshot.data.pageroute !== 'learning' &&
          this.activated.snapshot.data.pageData
        ) {
          this.routeComp = this.activated.snapshot.data.pageroute
          _.get(this.activated, 'snapshot.data.pageData.data.search.tabs', searchData.search.tabs).map((cur: ISearchTab) => {
            if (cur.titleKey === this.activated.snapshot.data.pageroute) {
              // this.searchRequestObject.filters = cur.searchQuery.filters
              this.searchRequestObject.request.filters = {}
            }
          })
        } else {
          this.routeComp = this.activated.snapshot.data.pageroute
          // this.searchRequestObject.filters = {}
        }
        if (this.utilitySvc.isMobile && !this.isIntranetAllowedSettings) {
          this.searchRequestObject.request.filters = {}
          // this.searchRequestObject.filters['isInIntranet'] = ['false']
        }
        // query

        if (queryParams.has('q')) {
          if (this.newSearchRequestObject.query !== queryParams.get('q')) {
            this.expandToPrefLang = true
          }
          this.newSearchRequestObject.query = queryParams.get('q') || ''
          this.searchResults.result.content = []
          this.newSearchRequestObject.Offset = 0
          // if (_.isEmpty(this.searchRequest.filters)) {
          //   this.searchRequestObject.request.filters = {
          //     visibility: ['Default'],
          //     primaryCategory: [
          //       'Course',
          //     ],
          //     contentType: [
          //       'Course',
          //     ],
          //   }
          // }
        }

        // filters
        if (queryParams.has('f')) {
          const filters = JSON.parse(queryParams.get('f') || '{}')
          if (this.searchRequest.filters !== filters) {
            this.expandToPrefLang = true
          }
          if (Object.keys(filters).length > 0) {
            this.searchRequest.filters = filters
            for (const key of Object.keys(this.searchRequest.filters)) {
              if (key) {
                this.searchRequestObject.request.filters = this.searchRequest.filters
              }
            }
          } else {
            this.searchRequestObject.request.filters = { visibility: ['Default'] }
          }
        }
        // if (queryParams.has('sort') && this.searchRequestObject.sort) {
        //   this.searchRequest.sort = queryParams.get('sort') || ''
        //   this.searchRequestObject.sort = this.getSortType(this.searchRequest.sort)
        // }
        if (queryParams.has('sort') && this.searchRequestObject.request.sort_by.lastUpdatedOn) {
          this.searchRequest.sort = queryParams.get('sort') || ''
          this.searchRequestObject.request.sort_by.lastUpdatedOn = this.getSortType()// this.searchRequest.sort
        }
        if (this.searchRequest.lang !== queryParams.get('lang') || this.getActiveLocale() || 'en') {
          this.expandToPrefLang = true
        }
        this.searchRequest.lang = queryParams.get('lang') ? queryParams.get('lang') : _.get(this.configSvc.userProfile, 'language', '')
        if (this.searchRequest.lang) {
          this.searchRequest.lang = this.searchRequest.lang.toLowerCase()
          this.searchRequestObject.request.filters['lang'] = this.getLangFilter(this.searchRequest.lang);
          this.lang = this.getLangFilter(this.searchRequest.lang);
          this.contact = this.lang
          this.searchResults.result.content = []
          this.newSearchRequestObject.Offset = 0
          // this.searchRequestObject.locale =
          //   this.searchRequest.lang !== '' ? this.searchRequest.lang.split(',') : []
        }
        if (
          this.searchRequestObject.request.query.toLowerCase() !== 'all' &&
          this.searchRequestObject.request.query !== '*' && this.searchRequestObject.request.query !== ''
        ) {
          this.searchRequestObject.request.sort_by.lastUpdatedOn = ''
          if (!this.searchRequest.filters.hasOwnProperty('contentType')) {
            // this.searchRequestObject.isStandAlone = true
          } else if (this.searchRequest.filters.contentType.length === 0) {
            // this.searchRequestObject.isStandAlone = true
          }
          if (!this.applyIsStandAlone && this.searchRequestObject.hasOwnProperty('isStandAlone')) {
            // delete this.searchRequestObject.isStandAlone
          }
        } else {
          this.searchRequestObject.request.sort_by = { lastUpdatedOn: 'desc' }
        }
        this.noContent = false
        if (
          this.searchRequestObject.request.filters &&
          !Object.keys(this.searchRequestObject.request.filters).length
        ) {
          // if (this.searchRequestObject && this.searchRequestObject.pageNo) {
          //   this.searchRequestObject.pageNo = 0
          // }
          this.searchResults = {
            id: '',
            ver: '',
            ts: '',
            params: {
              resmsgid: '',
              err: '',
              errmsg: '',
              msgid: '',
              status: '',
            },
            responseCode: '',
            filters: [],
            result: {
              count: 0,
              content: [],
              facets: [],
            },
          }
        }
        const updatedFilterSet = this.searchServ.updateSelectedFiltersSet(this.searchRequest.filters)
        this.selectedFilterSet = updatedFilterSet.filterSet

        this.filtersResetAble = updatedFilterSet.filterReset
        // Modify filters
        this.getResults(undefined)
      }
    })
    // }
    this.detectFramework()
  }

  getLangFilter(lang) {
    let language = [];
    if (lang == 'en') {
      language = ["en", "english"]
    } else if (lang == 'hi') {
      language = ['hi']
    } else if (lang == 'kn') {
      language = ['kn']
    } else if (lang == 'all') {
      language = ["en", "english", "hi", "kn"]
    } else {
      language = ["en", "english", "hi", "kn"]
    }
    return language;
  }

  getRecomentedLang(lang) {
    let language = '';
    if (lang == 'en') {
      language = "en"
    } else if (lang == 'hi') {
      language = 'hi'
    } else if (lang == 'kn') {
      language = 'kn'
    } else if (lang == 'all') {
      language = ""
    } else {
      language = ""
    }
    return language;
  }

  registerDeviceBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.handleBackButton();
    });
  }

  async handleBackButton() {
    this.router.navigateByUrl('page/home');
  }


  async detectFramework() {
    try {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
      if (this.appFramework === 'Ekshamata') {
        this.displayConfig.badges.certification = false;
        this.showUptuLogo = true
      }
    } catch (error) {
      console.log('error while getting packagename')
    }
  }

  ngOnDestroy() {
    if (this.searchResultsSubscription) {
      this.searchResultsSubscription.unsubscribe()
    }
    if (this.defaultSideNavBarOpenedSubscription) {
      this.defaultSideNavBarOpenedSubscription.unsubscribe()
    }
    if (this.prefChangeSubscription) {
      this.prefChangeSubscription.unsubscribe()
    }
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }



  getCompetencyResult(data: any) {
    let reqData = {
      "request": {
        "filters": {
          "competencySearch": data,
          "primaryCategory": [
            "Course"
          ],
          "contentType": [
            "Course"
          ],
          "status": [
            "Live"
          ]
        },
        "sort_by": {
          "lastUpdatedOn": "desc"
        }
      },
      "sort": [
        {
          "lastUpdatedOn": "desc"
        }
      ]
    }
    let withQuotes: boolean
    let didYouMean = true
    this.searchSvc.getSearchCompetencyCourses(reqData, this.ashaData.isAsha).subscribe(
      data => {
        console.log("********* data contents ", data)
        this.searchResults.result.count = data.result.count
        this.searchServ.raiseSearchResponseEvent(
          this.searchRequestObject.request.query,
          this.searchRequestObject.request.filters,
          this.searchResults.result.count,
          '',
        )
        this.searchResults.filters = data.filters
        // this.searchResults.queryUsed = data.queryUsed
        // this.searchResults.type = data.type
        this.searchResults.result.content = (data.result.content) ? this.getSortedBasedCompetency(data.result.content) : []
        // [...this.searchResults.result.content, ...(data.result.content ? data.result.content : [])]
        // this.searchResults.doYouMean = data.doYouMean
        // this.searchResults.queryUsed = data.queryUsed
        // this.handleFilters(this.searchResults.filters)
        // const filteR = this.searchServ.handleFilters(
        //   this.searchResults.filters,
        //   this.selectedFilterSet,
        //   this.searchRequest.filters,
        //   this.activated.snapshot.data.pageroute !== 'learning' ? true : false,
        // )
        // this.searchServ.getSearchConfig().then(searchData => {
        //   if (filteR.filtersRes && filteR.filtersRes.length > 0) {
        //     filteR.filtersRes.forEach(ele => {
        //       if (searchData.search.visibleFilters.hasOwnProperty(ele.displayName)) {
        //         ele.displayName = searchData.search.visibleFilters[ele.displayName].displayName
        //       }
        //     })
        //     const newArray: any = []
        //     data.result.facets.forEach((el: any) => {
        //       const obj2 = {}
        //       if (el.values.length > 0) {
        //         el.values.forEach((el1: any) => {
        //           el1['displayName'] = el1.name
        //           el1['type'] = el1.name
        //           el1['checked'] = true
        //           el1['count'] = el1.count
        //         })
        //         if (el.name === 'resourceType' || el.name === 'exclusiveContent') {
        //           obj2['displayName'] = el.name
        //           obj2['type'] = el.name
        //           obj2['checked'] = true
        //           obj2['content'] = el.values
        //           newArray.push(obj2)
        //         }
        //       }
        //     })
        //     Array.prototype.push.apply(filteR.filtersRes, newArray)
        //     this.filtersResponse = filteR.filtersRes
        //   }
        // })
        if (
          this.searchResults.result.count === 0 && this.isDefaultFilterApplied
        ) {
          this.removeDefaultFiltersApplied()
          this.getResults(undefined, didYouMean)
          return
        } if (this.searchResults.result.count === 0 && this.searchAcrossPreferredLang && this.expandToPrefLang) {
          this.searchWithPreferredLanguage()
          this.getResults(undefined, didYouMean)
          return
        } if (
          this.searchResults.result.count === 0 &&
          this.searchRequestObject.request.query.indexOf(' ') === -1
        ) {
          this.noContent = true
        } else if ( // No results with phrase search disabled and space separated words
          this.searchResults.result.count === 0 &&
          this.searchRequestObject.request.query.indexOf(' ') > -1 &&
          !this.applyPhraseSearch
        ) {
          this.noContent = true
        } else if (
          this.searchResults.result.count === 0 &&
          this.searchRequestObject.request.query.indexOf(' ') > -1 &&
          withQuotes
        ) {
          this.noContent = true
        } else if (
          this.searchResults.result.count === 0 &&
          this.searchRequestObject.request.query.indexOf(' ') > -1 && this.applyPhraseSearch
        ) {
          // this.searchRequestObject.pageNo = 0
          this.getResults(true, didYouMean)
          return
        } else if (
          this.searchResults.result.count === 0 &&
          this.searchRequestObject.request.query.indexOf(' ') === -1 // &&
          // this.searchRequestObject.instanceCatalog
        ) {
          // this.searchRequestObject.pageNo = 0
          // this.searchRequestObject.instanceCatalog = false
          this.getResults(true, didYouMean)
          return
        } else if (
          this.searchResults.result.count > 0 &&
          this.searchRequestObject.request.query.indexOf(' ') > -1 &&
          !this.exactResult.applied
        ) {
          this.exactResult.show = true
          this.exactResult.text = this.searchRequestObject.request.query.replace(/['"]+/g, '')
        }
        if (this.searchResults.result.content.length < this.searchResults.result.count) {
          this.searchRequestStatus = 'hasMore'
        } else {
          this.searchRequestStatus = 'done'
        }
        if (this.searchResults.result.content.length < this.searchResults.result.count) {
          // tslint:disable-next-line: no-non-null-assertion
          // this.searchRequestObject.pageNo! += 1
        }

        this.getTrainingsLHub(this.searchResults)
      },
      error => {
        this.error.load = true
        this.error.message = error
        this.searchRequestStatus = 'done'
      },
    )

  }

  async getResults(withQuotes?: boolean, didYouMean = true) {
    // this.searchRequestObject.didYouMean = didYouMean
    if (this.searchResultsSubscription) {
      this.searchResultsSubscription.unsubscribe()
    }
    this.commonUtilService.addLoader()
    this.searchRequestStatus = 'fetching'
    this.exactResult.show = false
    if (this.exactResult.old !== this.newSearchRequestObject.query) {
      this.exactResult.applied = false
    }
    if (
      withQuotes === undefined &&
      this.newSearchRequestObject.query.indexOf(' ') > -1 &&
      !this.exactResult.applied // &&
      // this.searchRequestObject.pageNo === 0 && this.applyPhraseSearch
    ) {
      this.newSearchRequestObject.query = `${this.newSearchRequestObject.query}`
    } else if (withQuotes && this.newSearchRequestObject.query.indexOf(' ') > -1) {
      this.exactResult.applied = true
      this.newSearchRequestObject.query = this.newSearchRequestObject.query.replace(/['"]+/g, '')
      this.searchResults.result.content = []
      this.exactResult.show = false
      // this.searchRequestObject.request.pageNo = 0
      this.exactResult.old = this.newSearchRequestObject.query
    }
    this.searchServ.raiseSearchEvent(
      this.newSearchRequestObject.query,
      // this.searchRequestObject.request.filters,
      '', ''
    )
    // if (this.searchRequestObject.locale && this.searchRequestObject.locale.length > 1) {
    //   this.searchRequestObject.didYouMean = false
    // }

    this.newSearchRequestObject.language = this.searchRequest.lang == 'all' ? '' : this.searchRequest.lang
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      // this.searchRequestObject.request.filters['sourceName'] = ['Ministry of Health and Family Welfare']
    }

    this.searchResultsSubscription = await this.searchServ
      .getLearning(this.newSearchRequestObject)
      .subscribe(
        data => {
          console.log("search data", data)
          // Check if data is not undefined and count is greater than 0
          if (data && data.result && data.result.count > 0) {
            this.searchResults.result.count = data.result.count
            this.searchServ.raiseSearchResponseEvent(
              this.searchRequestObject.request.query,
              this.searchRequestObject.request.filters,
              this.searchResults.result.count,
              '',
            )
            this.searchResults.filters = data.filters
            const newContent = data.result.content ? this.getSortedBasedCompetency(data.result.content) : [];
            console.log("new content", newContent, newContent.length)
            console.log("before setting content", this.searchResults.result.content, this.searchResults.result.content.length)
            this.searchResults.result.content = _.uniqBy(
              this.searchResults.result.content.concat(newContent),
              'identifier'
            );
            console.log("after setting new content", this.searchResults.result.content, this.searchResults.result.content.length)
          } else {

            // Check if the searchResults.result.content array is empty or not
            if (this.searchResults.result.content.length === 0) {
              this.searchResults.result.count = 0
              this.noContent = true;  
              this.searchRequestStatus = 'done';

            } else {
              this.noContent = false;
            }
          }






          // this.searchResults.result.content = (data.result.content) ? this.getSortedBasedCompetency(data.result.content) : []
          // const filteR = this.searchServ.handleFilters(
          //   this.searchResults.filters,
          //   this.selectedFilterSet,
          //   this.searchRequest.filters,
          //   this.activated.snapshot.data.pageroute !== 'learning' ? true : false,
          // )
          // this.searchServ.getSearchConfig().then(searchData => {
          //   if (filteR.filtersRes && filteR.filtersRes.length > 0) {
          //     filteR.filtersRes.forEach(ele => {
          //       if (searchData.search.visibleFilters.hasOwnProperty(ele.displayName)) {
          //         ele.displayName = searchData.search.visibleFilters[ele.displayName].displayName
          //       }
          //     })
          //     const newArray: any = []
          //     data.result.content.forEach(el => {
          //       const obj2 = {}
          //       if (el.values && el.values.length > 0) {
          //         el.values.forEach(el1 => {
          //           el1['displayName'] = el1.name
          //           el1['type'] = el1.name
          //           el1['checked'] = true
          //           el1['count'] = el1.count
          //         })
          //         if (el.name === 'resourceType' || el.name === 'exclusiveContent') {
          //           obj2['displayName'] = el.name
          //           obj2['type'] = el.name
          //           obj2['checked'] = true
          //           obj2['content'] = el.values
          //           newArray.push(obj2)
          //         }
          //       }
          //     })
          //     Array.prototype.push.apply(filteR.filtersRes, newArray)
          //     this.filtersResponse = filteR.filtersRes
          //   }
          // })
          if (
            this.searchResults.result.count === 0 && this.isDefaultFilterApplied
          ) {
            this.removeDefaultFiltersApplied()
            this.getResults(undefined, didYouMean)
            return
          } if (this.searchResults.result.count === 0 && this.searchAcrossPreferredLang && this.expandToPrefLang) {
            this.searchWithPreferredLanguage()
            this.getResults(undefined, didYouMean)
            return
          } if (
            this.searchResults.result.count === 0 &&
            this.searchRequestObject.request.query.indexOf(' ') === -1
          ) {
            this.noContent = true
          } else if ( // No results with phrase search disabled and space separated words
            this.searchResults.result.count === 0 &&
            this.searchRequestObject.request.query.indexOf(' ') > -1 &&
            !this.applyPhraseSearch
          ) {
            this.noContent = true
          } else if (
            this.searchResults.result.count === 0 &&
            this.searchRequestObject.request.query.indexOf(' ') > -1 &&
            withQuotes
          ) {
            this.noContent = true
          } else if (
            this.searchResults.result.count === 0 &&
            this.searchRequestObject.request.query.indexOf(' ') > -1 && this.applyPhraseSearch
          ) {
            // this.searchRequestObject.pageNo = 0
            this.getResults(true, didYouMean)
            return
          } else if (
            this.searchResults.result.count === 0 &&
            this.searchRequestObject.request.query.indexOf(' ') === -1 // &&
            // this.searchRequestObject.instanceCatalog
          ) {
            // this.searchRequestObject.pageNo = 0
            // this.searchRequestObject.instanceCatalog = false
            this.getResults(true, didYouMean)
            return
          } else if (
            this.searchResults.result.count > 0 &&
            this.searchRequestObject.request.query.indexOf(' ') > -1 &&
            !this.exactResult.applied
          ) {
            this.exactResult.show = true
            this.exactResult.text = this.searchRequestObject.request.query.replace(/['"]+/g, '')
          }
          if (this.searchResults.result.content.length < this.searchResults.result.count) {
            this.searchRequestStatus = 'hasMore'
          } else {
            this.searchRequestStatus = 'done'
          }
          this.commonUtilService.removeLoader()
          if (this.searchResults.result.content.length < this.searchResults.result.count) {
            // tslint:disable-next-line: no-non-null-assertion
            // this.searchRequestObject.pageNo! += 1
          }

          this.getTrainingsLHub(this.searchResults)


        },
        error => {
          this.error.load = true
          this.error.message = error
          this.searchRequestStatus = 'done'
          this.generateErrorTelemetry(error, 'search-failed')
          this.commonUtilService.removeLoader()
        },
      )
  }


  loadMoreData(event: any) {
    if(!this.isCompetency){
      console.log('Load more data triggered'); // Debug statement to check if this method is called
      this.newSearchRequestObject.Offset += this.newSearchRequestObject.limit;
      this.generateInteractTelemetry();
      this.getResults().then(() => {
        console.log(this.searchResults.result.content.length, this.searchResults.result.count)
        event.target.complete();
        if (this.searchResults.result.count == 0) {
          event.target.disabled = true;
        } else {
          event.target.disabled = false;
        }
      });
    }else{
      event.target.disabled = false;
    }
    
  }

  generateInteractTelemetry() {
    const value = new Map();
    value['Offset'] = this.newSearchRequestObject.Offset;
    value['Limit'] = this.newSearchRequestObject.limit;
    value['total-content'] = this.searchResults.result.content.length;
    value['search-query'] = this.newSearchRequestObject.query;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH, InteractSubtype.LOAD_MORE_CONTENT,
      Environment.HOME, PageId.SEARCH, undefined, value
    );
  }


  getSortedBasedCompetency(data) {
    let sortedResult = [];
    let competencyCourses = [];
    let nonCompetencyCourses = [];
    let sortcompetency;

    _.forEach(data, (courses) => {
      if (courses.hasOwnProperty('competencies_v1') && Object.keys(courses.competencies_v1).length > 0) {
        competencyCourses.push(courses)
      } else {
        nonCompetencyCourses.push(courses)
      }
    })

    if (competencyCourses.length > 0) {
      sortcompetency = competencyCourses.sort(
        (c1, c2) =>

          (JSON.parse(c1.competencies_v1)[0].competencyId > JSON.parse(c2.competencies_v1)[0].competencyId) ?
            1 : (JSON.parse(c1.competencies_v1)[0].competencyId < JSON.parse(c2.competencies_v1)[0].competencyId) ? -1 : 0);
    }
    // @ts-ignore
    sortedResult = [...competencyCourses, ...nonCompetencyCourses];
    return sortedResult

  }

  contentTrackBy(item: NsContent.IContent) {
    return item.identifier
  }
  sortOrder(type: string) {
    try {
      this.router.navigate([], {
        queryParams: { sort: type },
        queryParamsHandling: 'merge',
        relativeTo: this.activated.parent,
      })
    } catch (e) {
      throw e
    }
  }

  getSortType() {
    try {
      return 'desc'
    } catch (e) {
      throw e
    }
  }

  searchLanguage(type: string) {
    try {
      this.router.navigate([], {
        queryParams: { lang: type },
        queryParamsHandling: 'merge',
        relativeTo: this.activated.parent,
      }).then(() => {
        this.expandToPrefLang = false
      })
    } catch (e) {
      throw e
    }
  }

  didYouMeanSearch(query: string) {
    let q = query.replace('<em>', '')
    q = q.replace('</em>', '')
    this.router.navigate([], {
      queryParams: { q },
      queryParamsHandling: 'merge',
      relativeTo: this.activated.parent,
    })
  }

  searchInsteadFor() {
    // this.searchResults.result = []
    this.searchResults.result.content = []
    this.getResults(undefined, false)
  }

  removeFilters() {
    // const filtercheck = JSON.stringify(this.searchRequest.filters)
    this.router.navigate([], {
      queryParams: { f: null, q: this.searchRequestObject.request.query },
      // queryParams: { f: null, q: this.searchRequestObject.query },
      // queryParamsHandling: 'merge',
      relativeTo: this.activated.parent,
    })
  }

  removeLanguage() {
    this.searchRequest.lang = '';
    this.router.navigate([], {
      queryParams: { f: JSON.stringify(this.searchRequest.filters), q: this.searchRequestObject.request.query, lang: null },

      // queryParamsHandling: 'merge',
      relativeTo: this.activated.parent,
    })

  }

  closeFilter(value: boolean) {
    this.sideNavBarOpened = value
  }

  private getTrainingsLHub(_searchResults: NSSearch.ISearchV6ApiResultV2) {
    const restrictedFeatures = this.configSvc.restrictedFeatures
    const trainingLHubEnabled = restrictedFeatures && !restrictedFeatures.has('trainingLHub')

    if (trainingLHubEnabled) {
      // this.trainingSvc.getTrainingCountsForSearchResults(searchResults)
    }
  }

  onScroll($event){
    console.log($event)
  }

  generateErrorTelemetry(error: any, status) {
      this.telemetryGeneratorService.generateErrorTelemetry(
         Environment.SEARCH,
         status,
         ErrorType.SYSTEM,
         PageId.SEARCH,
         JSON.stringify(error)
      )
  }

}
