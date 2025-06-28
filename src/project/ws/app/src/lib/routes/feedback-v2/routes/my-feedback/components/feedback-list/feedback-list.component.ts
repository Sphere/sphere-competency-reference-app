import { Component, OnInit, OnDestroy } from '@angular/core'
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { noop, Subscription } from 'rxjs'
import { MyFeedbackService } from '../../services/my-feedback.service'
import { FeedbackFilterDialogComponent } from '../feedback-filter-dialog/feedback-filter-dialog.component'
import { EFeedbackRole, IFeedbackFilterObj, IFeedbackSearchResult, IFeedbackSummary, IFeedbackThread } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/models/feedback.model'
import { TFetchStatus } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants'
import { EFeedbackType } from '../../../../models/feedback.model'
import { FeedbackService } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/services/feedback.service'
import { IResolveResponse } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/resolver.model'

@Component({
  selector: 'ws-app-feedback-list',
  templateUrl: './feedback-list.component.html',
  styleUrls: ['./feedback-list.component.scss'],
})
export class FeedbackListComponent implements OnInit, OnDestroy {
  feedbackData!: IFeedbackSearchResult
  searchForm: UntypedFormGroup
  filterObj: IFeedbackFilterObj
  feedbackFetchStatus: TFetchStatus
  feedbackTypes: typeof EFeedbackType
  feedbackRoles: typeof EFeedbackRole
  viewedBy: EFeedbackRole
  pageNo: number
  pageSize: number
  hasHits: boolean
  unseenCtrl: UntypedFormControl
  unseenCtrlSub!: Subscription
  feedbackSummary!: IFeedbackSummary

  constructor(
    private feedbackApi: FeedbackService,
    private myFeedbackSvc: MyFeedbackService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.searchForm = new UntypedFormGroup({
      query: new UntypedFormControl(),
      showLimited: new UntypedFormControl(),
    })

    this.unseenCtrl = new UntypedFormControl()

    this.feedbackFetchStatus = 'none'

    this.feedbackTypes = EFeedbackType
    this.feedbackRoles = EFeedbackRole

    this.viewedBy = this.route.snapshot.url[0].path as EFeedbackRole
    this.filterObj = this.myFeedbackSvc.initFilterObj(this.viewedBy)

    this.pageNo = 0
    this.pageSize = 50
    this.hasHits = false

    if (this.route.parent) {
      const feedbackSummaryResolve = this.route.parent.snapshot.data
        .feedbackSummary as IResolveResponse<IFeedbackSummary>
      if (feedbackSummaryResolve.data) {
        this.feedbackSummary = feedbackSummaryResolve.data
      }
    }
  }

  ngOnInit() {
    this.fetchFeedbacks()

    this.unseenCtrlSub = this.unseenCtrl.valueChanges.subscribe(value => {
      this.filterObj.showLimited = value
      this.fetchFeedbacks()
    })
  }

  ngOnDestroy() {
    if (this.unseenCtrlSub && !this.unseenCtrlSub.closed) {
      this.unseenCtrlSub.unsubscribe()
    }
  }

  onFeedbackItemClick(feedback: IFeedbackThread) {
    this.router.navigate([`../${this.viewedBy}/${feedback.rootFeedbackId}`], {
      relativeTo: this.route,
      queryParams: { feedbackType: feedback.feedbackType },
    })
  }

  fetchFeedbacks() {
    const query = this.myFeedbackSvc.getSearchObj(
      this.filterObj,
      this.viewedBy,
      this.pageNo,
      this.pageSize,
      this.searchForm.value.query,
    )

    this.feedbackFetchStatus = 'fetching'
    this.feedbackApi.searchFeedback(query).subscribe(
      result => {
        this.feedbackData = result
        this.feedbackFetchStatus = 'done'

        if (this.feedbackData && this.feedbackData.hits) {
          this.hasHits = true
        }
      },
      () => {
        this.feedbackFetchStatus = 'error'
      },
    )
  }

  openFilterDialog() {
    this.dialog
      .open(FeedbackFilterDialogComponent, {
        data: {
          filterObj: this.filterObj,
          viewedBy: this.viewedBy,
          feedbackSummary: this.feedbackSummary,
        },
        width: '320px',
      })
      .afterClosed()
      .subscribe((filterObj: IFeedbackFilterObj) => {
        if (filterObj) {
          this.filterObj = filterObj
          this.fetchFeedbacks()
        }
      },         noop)
  }
}
