import { Component, OnInit, Inject, OnDestroy } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { UntypedFormGroup, UntypedFormControl, FormGroup, FormControl } from '@angular/forms'
import { Subscription } from 'rxjs'
import { EFeedbackType } from '../../../../models/feedback.model'
import { EFeedbackRole, IFeedbackFilterDialogData, IFeedbackFilterObj } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/models/feedback.model'
import { NsContent } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'

@Component({
  selector: 'ws-app-feedback-filter-dialog',
  templateUrl: './feedback-filter-dialog.component.html',
  styleUrls: ['./feedback-filter-dialog.component.scss'],
})
export class FeedbackFilterDialogComponent implements OnInit, OnDestroy {
  filterForm: UntypedFormGroup
  feedbackTypeSub?: Subscription
  feedbackTypes: typeof EFeedbackType
  feedbackRoles: typeof EFeedbackRole
  contentTypes: typeof NsContent.EContentTypes
  typeToRoleMap: Map<EFeedbackType, EFeedbackRole>

  constructor(
    @Inject(MAT_DIALOG_DATA) public filterDialogData: IFeedbackFilterDialogData,
    private dialogRef: MatDialogRef<FeedbackFilterDialogComponent>,
  ) {
    this.feedbackTypes = EFeedbackType
    this.feedbackRoles = EFeedbackRole
    this.contentTypes = NsContent.EContentTypes

    const filterObj = this.filterDialogData.filterObj

    this.filterForm = new UntypedFormGroup({
      feedbackType: new UntypedFormControl(
        this.filterDialogData.viewedBy === this.feedbackRoles.User ? filterObj.feedbackType : null,
      ),
      contentType: new UntypedFormControl(
        this.filterDialogData.viewedBy === this.feedbackRoles.User ||
        this.filterDialogData.viewedBy === this.feedbackRoles.Author
          ? filterObj.contentType
          : null,
      ),
      showLimited: new UntypedFormControl(filterObj.showLimited),
    })

    this.typeToRoleMap = new Map([
      [EFeedbackType.Platform, EFeedbackRole.Platform],
      [EFeedbackType.ContentRequest, EFeedbackRole.Content],
      [EFeedbackType.ServiceRequest, EFeedbackRole.Service],
    ])
  }

  ngOnInit() {
    this.feedbackTypeSub = this.filterForm.controls['feedbackType'].valueChanges.subscribe(
      (value: EFeedbackType[]) => {
        if (!value.includes(EFeedbackType.Content)) {
          this.filterForm.controls['contentType'].patchValue(null)
        }
      },
    )
  }

  ngOnDestroy() {
    if (this.feedbackTypeSub && !this.feedbackTypeSub.closed) {
      this.feedbackTypeSub.unsubscribe()
    }
  }

  applyFilters() {
    const newFilterObj: IFeedbackFilterObj = { showLimited: this.filterForm.value['showLimited'] }

    const contentTypes = this.filterForm.value['contentType']
    const feedbackTypes = this.filterForm.value['feedbackType']

    if (contentTypes && contentTypes.length) {
      newFilterObj.contentType = contentTypes
    }

    if (feedbackTypes && feedbackTypes.length) {
      newFilterObj.feedbackType = feedbackTypes
    }

    this.dialogRef.close(newFilterObj)
  }

  showContentTypeControl(): boolean {
    if (
      !(
        this.filterDialogData.viewedBy === this.feedbackRoles.User ||
        this.filterDialogData.viewedBy === this.feedbackRoles.Author
      )
    ) {
      return false
    }

    if (this.filterDialogData.viewedBy === this.feedbackRoles.Author) {
      return true
    }

    const value: EFeedbackType[] = this.filterForm.controls['feedbackType'].value

    if (value && value.length && value.includes(EFeedbackType.Content)) {
      return true
    }

    return false
  }

  showFeedbackTypeFilter(feedbackType: EFeedbackType): boolean {
    const feedbackRole = this.typeToRoleMap.get(feedbackType)

    if (feedbackRole) {
      const roleDetail = this.filterDialogData.feedbackSummary.roles.find(
        role => role.role === feedbackRole,
      )

      if (roleDetail && roleDetail.enabled) {
        return true
      }
    }

    return false
  }
}
