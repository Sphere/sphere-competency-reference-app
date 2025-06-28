import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { FormControl } from '@angular/forms'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { ISearchAutoComplete, ISearchQuery, ISuggestedFilters } from '../../models/search.model'
import { SearchServService } from '../../services/search-serv.service'
import * as _ from 'lodash'
import searchData from 'assets/configurations/feature/search.json'
import { CommonUtilService, Environment, ImpressionSubtype, ImpressionType, InteractSubtype, InteractType, PageId, TelemetryGeneratorService } from '../../../../../../../../../services'
import { LocalStorageService } from '../../../../../../../../../app/manage-learn/core'
import { NsPage } from '../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/page.model'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { ContentCorodovaService } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/content-corodova.service'

@Component({
  selector: 'ws-app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  // tslint:disable-next-line
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {

  query: UntypedFormControl = new UntypedFormControl('')
  lang = 'all'
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  autoCompleteResults: ISearchAutoComplete[] = []
  searchQuery: ISearchQuery = {
    l: this.getActivateLocale(),
    q: '',
  }
  languageSearch: string[] = []
  suggestedFilters: ISuggestedFilters[] = []
  contact = ''
  auto = ''
  // searchSubscription = null
  constructor(
    private configSvc: ConfigurationsService,
    private router: Router,
    private route: ActivatedRoute,
    private searchSvc: SearchServService,
    private commonUtilService: CommonUtilService,
    private localStorage: LocalStorageService,
    private cordovasvc: ContentCorodovaService,
    private telemetryGenerateService: TelemetryGeneratorService
  ) {
    this.commonUtilService.removeLoader()
    const isAutoCompleteAllowed = _.get(this.route, 'snapshot.data.pageData.data.search.isAutoCompleteAllowed', searchData.search.isAutoCompleteAllowed)
    if (typeof isAutoCompleteAllowed === 'undefined' ||
      (typeof isAutoCompleteAllowed === 'boolean' && isAutoCompleteAllowed)) {
      this.query.valueChanges.pipe(
        debounceTime(200),
        distinctUntilChanged(),
      ).subscribe(q => {
        this.searchQuery.q = q
        this.getAutoCompleteResults()
      })
    }
    // if (!this.searchSubscription) {
    //   this.searchSubscription = this.searchApi.currentMessage.subscribe(
    //     (data: any) => {
    //       if (data) {
    //         this.search()
    //       }
    //     })
    // }
  }

  search() {
    this.commonUtilService.addLoader();
    this.commonUtilService.getPreviesUrl;
    this.generateInteractEvent()
    this.router.navigate(['/app/search/home'], {
      queryParams: { lang: this.lang, q: this.query.value || this.searchQuery.q },
    })
  }
  searchWithFilter(filter: any): void {
    const objType = filter.contentType ? { contentType: [filter.contentType] } :
      filter.resourceType ? { resourceType: [filter.resourceType] } : filter.combinedType === 'learningContent' ?
        { contentType: ['Collection', 'Learning Path', 'Course'] } : ''
    // this.CommonUtilService.addLoader()
    this.router.navigate(['/app/search/home'], {
      queryParams: { lang: this.searchQuery.l, q: this.searchQuery.q },
    }).then(() => {
      this.commonUtilService.addLoader()
      this.router.navigate(['/app/search/learning'], {
        queryParams: {
          q: this.searchQuery.q,
          lang: this.searchQuery.l,
          f: JSON.stringify(objType),
        },
      })
    })
  }

  getActivateLocale(): string {
    const locale = (this.configSvc.activeLocale && this.configSvc.activeLocale.locals[0]) || 'en'
    return this.searchSvc.getLanguageSearchIndex(locale)
  }

  get preferredLanguages(): string | null {
    if (this.configSvc.userPreference && this.configSvc.userPreference.selectedLangGroup) {
      let prefLang: string[] | string = this.configSvc.userPreference.selectedLangGroup.split(',').map(lang => {
        return this.searchSvc.getLanguageSearchIndex(lang || 'en')
      })
      prefLang = prefLang.join(',')
      return prefLang
    }
    return null
  }

  swapRemove(langArray: string[], from: number, to: number) {
    langArray.splice(to, 0, langArray[from])
    langArray.splice(from + 1, 1)
  }

  getAutoCompleteResults(): void {
    this.searchSvc.searchAutoComplete(this.searchQuery).then((results: ISearchAutoComplete[]) => {
      this.autoCompleteResults = results
    }).catch(() => {

    })
  }

  searchLanguage(lang: string): void {
    this.router.navigate([], {
      queryParams: { lang, q: this.searchQuery.q },
      queryParamsHandling: 'merge',
      relativeTo: this.route.parent,
    }).then(() => {
      this.getAutoCompleteResults()
    })
  }

  ngOnInit() {
    // this.localStorage.getLocalStorage(storageKeys.userProfile).then(resp => {
    //   if (resp) {
    //     this.lang = _.get(resp, 'profileDetails.preferences.language')
    //   }
    // })
    // this.lang = _.get(this.configSvc.userProfile, 'language', '')
    this.lang = "all";

    this.route.queryParamMap.subscribe(queryParam => {
      if (queryParam.has('q')) {
        this.searchQuery.q = queryParam.get('q') || ''
      } else {
        this.searchQuery.q = ''
      }
      this.query.setValue(this.searchQuery.q)
      if (queryParam.has('lang')) {
        this.searchQuery.l = queryParam.get('lang') || this.getActivateLocale()
      } else {
        this.searchQuery.l = this.getActivateLocale()
      }
      this.languageSearch = _.get(this.route, 'snapshot.data.pageData.data.search.languageSearch', searchData.search.languageSearch).map(
        (u: string) => u.toLowerCase(),
      )
      this.languageSearch = this.languageSearch.sort()
      this.swapRemove(this.languageSearch, this.languageSearch.indexOf('all'), 0)
      if (this.preferredLanguages && this.preferredLanguages.split(',').length > 1) {
        this.languageSearch.splice(1, 0, this.preferredLanguages)
      }
    })
    this.searchSvc.getSearchConfig().then(res => {
      this.suggestedFilters = res.search && res.search.suggestedFilters

    });
    this.generateImpressionEvent();
    this.cordovasvc.setAshaData({
      "isAsha": false
    })

  }

  generateInteractEvent() {
    const value = new Map();
    value['searchQuery'] = this.query.value || this.searchQuery.q;
    value['selectedFilters'] = this.lang;
    this.telemetryGenerateService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SEARCH_INITIATED,
      Environment.SEARCH,
      PageId.SEARCH,
      undefined,
      value
    )
  }

  generateImpressionEvent() {
    this.telemetryGenerateService.generateImpressionTelemetry(
      ImpressionType.SEARCH,
      '',
      Environment.SEARCH,
      PageId.SEARCH
    )
  }

}
