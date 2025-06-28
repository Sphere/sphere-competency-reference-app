import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Environment, InteractType, PageId, TelemetryGeneratorService } from '../../../../../../../../../services';
import { DeviceInfo } from '@project-sunbird/sunbird-sdk';

@Component({
  selector: 'app-offline-confirm-modal',
  templateUrl: './offline-confirm-modal.component.html',
  styleUrls: ['./offline-confirm-modal.component.scss'],
})
export class OfflineConfirmModalComponent implements OnInit {
  freeSpace:any
  courseSize:any
  constructor(
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    public dialogRef: MatDialogRef<OfflineConfirmModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private telemetryGeneratorService: TelemetryGeneratorService,
    
  ) { 
    this.deviceInfo.getAvailableInternalMemorySize().toPromise().then((freeSpaceBytes) => { 
      this.freeSpace = this.byteToGB(freeSpaceBytes, 'GB');
      console.log('Available device storage space:', this.freeSpace)
    }).catch((error) => {
      console.error('Error getting free device storage space:', error);
    });
  }

  ngOnInit() {
    this.courseSize = this.byteToGB(this.data.size, 'MB');
  }

  closeNo() {
    this.generateInteractTelemetry({type: 'NO'})
    this.dialogRef.close(false)
  }
  downloadAllContent(){
    this.generateInteractTelemetry({type: 'YES'})
    this.dialogRef.close(true)
    console.log('download the content')
  }
  byteToGB(byte, unit){
    let freeSpace = parseInt(byte);
    let convertSize = 1024 * 1024 * 1024;
    if(unit == 'MB'){
      convertSize = 1024 * 1024;
    }
    let newFreeSpaceGB = freeSpace / convertSize;
    return newFreeSpaceGB.toFixed(2)+' '+unit; 
  }

  generateInteractTelemetry(initData) {
    const value = new Map();
    value['identifier'] = this.data.identifiers;
    value['contentSize'] = this.data.size;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      initData.type === 'YES' ? 'download-content-clicked' : 'cancel-download-content-clicked',
      Environment.COURSE,
      PageId.COURSE_TOC,
      undefined,
      value
    )
  }
}
