import { Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'
import { ViewerUtilService } from '../../viewer-util.service';
import {Events} from '../../../../../../../util/events';
import { ConfigurationsService } from '../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service';

@Component({
  selector: 'viewer-confirm-modal-component',
  templateUrl: './confirm-modal-component.html',
  styleUrls: ['./confirm-modal-component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ConfirmmodalComponent implements OnInit {
  ratingsForm!: UntypedFormGroup
  stars: number[] = [1, 2, 3, 4, 5];
  selectedRating!: number
  isMandatory: boolean = true
  isSubmitPressed: boolean = false
  @ViewChild('commentTextarea') commentTextarea!: ElementRef;


  constructor(
    public dialogRef: MatDialogRef<ConfirmmodalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: UntypedFormBuilder,
    public snackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private ratingSvc: ViewerUtilService,
    private translate: TranslateService,
    private event: Events
  ) { }

  ngOnInit() {
    this.ratingsForm = this.formBuilder.group({
      review: ['', Validators.required],
    })
    if (
      this.data.request.courseRating &&
      this.data.request.courseRating.content &&
      this.data.request.courseRating.content.length > 0
    ) {
      const firstContent = this.data.request.courseRating.content[0]
      if (firstContent.rating) {
        this.selectedRating = firstContent.rating
        if (firstContent.rating <= 3 && !firstContent.review) {
          this.isMandatory = true
        }
        this.ratingsForm.controls.review.setValue(firstContent.review)
      } else {
        console.error("Missing rating or review in content:", firstContent)
      }
    } else {
      console.error("No course rating content available:", this.data.request.courseRating)
    }
  }


  // done() {
  //   this.dialogRef.close({ event: 'CONFIRMED' })
  // }
  // closePopup() {
  //   this.dialogRef.close({ event: 'close-complete' })
  // }

  // on slecting the star rating
  setRating(rating: number) {
    this.selectedRating = rating
    if (rating <= 3 && (this.ratingsForm.controls.review.value === '' || this.ratingsForm.controls.review.value === null)) {
      this.isMandatory = true;
      this.focusTextarea();
    } else {
      this.isMandatory = false
    }
  }

  focusTextarea() {
    // Check if the textarea element exists
    if (this.commentTextarea && this.commentTextarea.nativeElement) {
      // Focus on the textarea
      this.commentTextarea.nativeElement.focus();
    }
  }

  submitData() {
    if (!this.isMandatory && this.selectedRating) {
      this.submitRating(this.ratingsForm)
    }
  }

  submitRating(ratingsForm: any) {
    let userId = ''
    if (this.selectedRating) {
      if (this.configSvc?.userProfile) {
        userId = this.configSvc?.userProfile?.userId || ''
      }
      let req
      if (this.data) {
        req = {
          activityId: this.data.request.courseId,
          userId,
          activityType: 'Course',
          rating: this.selectedRating,
          review: ratingsForm.value.review ? ratingsForm.value.review : null,
          recommended: this.selectedRating >= 3 ? 'yes' : 'no',
        }
      }

      this.ratingSvc.submitCourseRating(req).subscribe(
        (res: any) => {
          if (res && res.params && res.params.status === 'Successful') {
            this.event.publish('refreshCourseRating')
            const message = this.translate.instant('THANK_YOU_FOR_YOUR_FEEDBACK')
            this.openSnackbar(message)
            this.dialogRef.close({ event: 'CONFIRMED' })
          } else {
           const message = this.translate.instant('SOMETHING_WENT_WRONG_TRY_LATER')
            this.dialogRef.close({ event: 'CONFIRMED' })
            this.openSnackbar(message)
          }
        },
        (err: any) => {
          const message = this.translate.instant('ERROR_MESSAGE')
          if (err && err.error && err.error.message) {
            this.openSnackbar(err.error.message)
          } else {
            this.openSnackbar(message)
          }
        }
      )
    }
  }

  openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

}
