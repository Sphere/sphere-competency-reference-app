import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core'
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms'
import { Observable, throwError, noop, Subscription, of } from 'rxjs'
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeWhile,
  map,
  catchError,
} from 'rxjs/operators'
import { TrainingApiService } from '../../../../apis/training-api.service'
import { TrainingService } from '../../../../services/training.service'
import { ActivatedRoute, Router } from '@angular/router'
import { IJITForm, ITrainingLocation, ITrainingTrack } from '../../../../models/training-api.model'
import { NsContent } from '../../../../../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import { TSendStatus } from '../../../../../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants'
import { IResolveResponse } from '../../../../../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/resolver.model'

@Component({
  selector: 'ws-app-jit-form',
  templateUrl: './jit-form.component.html',
  styleUrls: ['./jit-form.component.scss'],
})
export class JitFormComponent implements OnInit, AfterViewInit, OnDestroy {
  currentDate = new Date()
  locations$?: Observable<ITrainingLocation[]>
  track = ''
  tracks$?: Observable<ITrainingTrack[]>
  searchResults!: NsContent.IContent[]
  queryParamsSub?: Subscription
  searchResultsSub?: Subscription
  // showSearchBox: boolean

  jitForm: UntypedFormGroup

  submitStatus: TSendStatus = 'none'

  constructor(
    private trainingApi: TrainingApiService,
    private trainingSvc: TrainingService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.jitForm = new UntypedFormGroup({
      contentId: new UntypedFormControl(),
      contentName: new UntypedFormControl(),
      trainingDescription: new UntypedFormControl(),
      startDate: new UntypedFormControl(),
      participantCount: new UntypedFormControl('', [Validators.min(5)]),
      track: new UntypedFormControl(),
      location: new UntypedFormControl(),
      participantProfile: new UntypedFormControl(),
      trainingLevel: new UntypedFormControl(),
      additionalInfo: new UntypedFormControl(),
      searchedContent: new UntypedFormControl(),
      trainingByVendor: new UntypedFormControl(),
    })
  }

  ngOnInit() {
    this.setTrainingLocations()
    this.setTrainingTracks()

    this.queryParamsSub = this.route.queryParamMap
      .pipe(
        takeWhile(queryParams => queryParams.has('contentId')),
        map(queryParams => queryParams.get('contentId')),
        switchMap(contentId => {
          if (contentId) {
            return this.trainingSvc.getJITEligibleContent(contentId)
          }
          return throwError('No content ID')
        }),
      )
      .subscribe(searchResults => {
        if (searchResults.length) {
          this.jitForm.patchValue({
            contentId: searchResults[0].identifier,
            searchedContent: searchResults[0].name,
          })
        }
      },         noop)
  }

  ngAfterViewInit() {
    this.searchResultsSub = this.jitForm.controls.searchedContent.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((query: string) => this.trainingSvc.getJITEligibleContent(query)),
      )
      .subscribe(results => {
        this.searchResults = results
      },         noop)
  }

  ngOnDestroy() {
    if (this.queryParamsSub && !this.queryParamsSub.closed) {
      this.queryParamsSub.unsubscribe()
    }

    if (this.searchResultsSub && !this.searchResultsSub.closed) {
      this.searchResultsSub.unsubscribe()
    }
  }

  onClickSearchResult(searchResult: NsContent.IContent) {
    this.jitForm.patchValue({
      contentId: searchResult.identifier,
      track: searchResult.learningTrack,
    })
    this.track = searchResult.learningTrack || ''

  }

  onSearchUserInput() {
    this.jitForm.patchValue({
      contentId: undefined,
    })
  }

  onSubmitJITRequest() {
    this.submitStatus = 'sending'

    this.trainingApi.sendJITRequest(this.jitForm.value as IJITForm).subscribe(
      () => {
        this.submitStatus = 'done'
        this.openJITList()
      },
      () => {
        this.submitStatus = 'error'
      },
    )
  }

  openJITList() {
    this.router.navigate(['../my-training-requests'], {
      relativeTo: this.route,
    })
  }

  private setTrainingLocations() {
    this.locations$ = this.route.data.pipe(
      map(data => {
        const trainingConfigResolve = (data.trainingConfigResolve as IResolveResponse<{
          trainingLocations: ITrainingLocation[]
        }>).data

        if (trainingConfigResolve) {
          return trainingConfigResolve.trainingLocations
        }

        return []
      }),
      catchError(() => of([])),
    )
  }

  private setTrainingTracks() {
    this.tracks$ = this.route.data.pipe(
      map(data => {
        const trainingConfigResolve = (data.trainingConfigResolve as IResolveResponse<{
          trainingTracks: ITrainingTrack[]
        }>).data

        if (trainingConfigResolve) {
          return trainingConfigResolve.trainingTracks
        }

        return []
      }),
      catchError(() => of([])),
    )
  }
}
