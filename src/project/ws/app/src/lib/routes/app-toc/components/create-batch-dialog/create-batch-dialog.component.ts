import { Component, OnInit, Inject, forwardRef, ViewChild, ElementRef } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators, UntypedFormGroup, UntypedFormControl } from '@angular/forms'
import { AppTocService } from '../../services/app-toc.service'
import { AppDateAdapter, APP_DATE_FORMATS, startWithYearformat } from '../../../user-profile/services/format-datepicker'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service';

@Component({
  selector: 'ws-app-create-batch-dialog',
  templateUrl: './create-batch-dialog.component.html',
  styleUrls: ['./create-batch-dialog.component.scss'],
  providers: [
    { provide: forwardRef(() => DateAdapter), useClass: forwardRef(() => AppDateAdapter) },
    { provide: forwardRef(() => MAT_DATE_FORMATS), useValue: forwardRef(() => APP_DATE_FORMATS) },
  ],
})
export class CreateBatchDialogComponent implements OnInit {
  createBatchForm: UntypedFormGroup
  enrollmentTypes = ['open', 'closed']
  namePatern = `^[a-zA-Z\\s\\']{1,32}$`
  today = new Date()
  uploadSaveData = false
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  @ViewChild('toastError', { static: true }) toastError!: ElementRef<any>

  constructor(
    public dialogRef: MatDialogRef<CreateBatchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private appTocService: AppTocService,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService
  ) {
    this.createBatchForm = new UntypedFormGroup({
      name: new UntypedFormControl('', [Validators.required, Validators.pattern(this.namePatern)]),
      description: new UntypedFormControl('', []),
      enrollmentType: new UntypedFormControl(this.enrollmentTypes[0], [Validators.required]),
      startDate: new UntypedFormControl('', [Validators.required]),
      endDate: new UntypedFormControl('', []),
      enrollmentEndDate: new UntypedFormControl('', []),
      // createdFor: new FormControl('', []),
      mentors: new UntypedFormControl('', []),
      courseId: new UntypedFormControl('', []),
      createdBy: new UntypedFormControl('', []),
    })
  }

  ngOnInit() {
  }

  public createBatchSubmit(form: any) {
    this.uploadSaveData = true
    form.value.startDate = startWithYearformat(new Date(`${form.value.startDate}`))
    if (form.value.endDate) {
      form.value.endDate = startWithYearformat(new Date(`${form.value.endDate}`))
    } else {
      delete form.value.endDate
    }
    if (form.value.enrollmentEndDate) {
      form.value.enrollmentEndDate = startWithYearformat(new Date(`${form.value.enrollmentEndDate}`))
    } else {
      delete form.value.enrollmentEndDate
    }
    form.value.mentors = []
    if (this.configSvc.userProfile) {
      // form.value.createdFor = [this.configSvc.userProfile.rootOrgId]
      form.value.createdBy = this.configSvc.userProfile.userId
    }
    if (this.data && this.data.content) {
      form.value.courseId = this.data.content.identifier
    }
    this.appTocService.createBatch(form.value).subscribe(
      () => {
        this.uploadSaveData = false
        this.openSnackbar(this.toastSuccess.nativeElement.value)
        this.appTocService.updateBatchData()
        this.dialogRef.close()
      },
      err => {
        if (err && err.error && err.error.params && err.error.params.errmsg) {
          this.openSnackbar(err.error.params.errmsg)
        } else {
          this.openSnackbar(this.toastError.nativeElement.value)
        }
        this.uploadSaveData = false
      })
  }
  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

}
