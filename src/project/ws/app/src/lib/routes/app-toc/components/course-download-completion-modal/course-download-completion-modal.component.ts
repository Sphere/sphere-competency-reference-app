import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonUtilService, Environment, InteractType, PageId, TelemetryGeneratorService } from '../../../../../../../../../services';

@Component({
  selector: 'app-course-download-completion-modal',
  templateUrl: './course-download-completion-modal.component.html',
  styleUrls: ['./course-download-completion-modal.component.css'],
})
export class CourseDownloadCompletionModalComponent implements OnInit {
  freeSpace:any
  courseSize:any
  constructor(
    public dialogRef: MatDialogRef<CourseDownloadCompletionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
  ) { 
   
  }

  ngOnInit() {
    
  }

  closeNo() {
    this.generateInteractTelemetry({type: 'NO'})
    this.dialogRef.close(false)
  }
  closeYes() {
    this.generateInteractTelemetry({type: 'YES'})
    this.commonUtilService.addLoader()
    this.dialogRef.close({ event: 'YES' })
  }

  generateInteractTelemetry(initData) {
    const value = new Map();
    value['identifier'] = this.data.identifiers;
    value['message'] = this.data.message;
    const telemetryObject: any = {
      id: this.data?.identifier,
      type: this.data?.message,
      version: '',
    }
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      initData.type === 'YES' ? 'Go-to-downlod-section' : 'Do-not-go-to-download-section',
      Environment.COURSE,
      PageId.COURSE_TOC,
      telemetryObject,
      value
    )
  }
}
