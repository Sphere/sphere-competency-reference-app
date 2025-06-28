import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router'
import { CommonUtilService } from '../../../../../services/common-util.service';

@Component({
  selector: 'app-offline-modal',
  templateUrl: './offline-modal.component.html',
  styleUrls: ['./offline-modal.component.scss'],
})
export class OfflineModalComponent implements OnInit {

  public showSpinner = false;

  constructor(
    private commonUtilService: CommonUtilService,
    private router: Router,
    private dialog: MatDialog,
    private zone: NgZone
  ) { }

  ngOnInit() {}

  navigateToDownloadCourse(){
    this.closeModal();
    this.zone.run(() => {
      this.commonUtilService.addLoader()
      this.router.navigate([`app/download-course`])
    });
  }

  closeModal(){
    let openDilogRef = this.dialog.getDialogById('offlineModal');
    if(openDilogRef){
      openDilogRef.close();
    }
  }

  refreshContent(){
    this.showSpinner = true;
    if(navigator.onLine){
      this.showSpinner = false;
      this.closeModal();
    }else{
      setTimeout(() => {
        this.showSpinner = false;
      }, 5000);
    }
  }
}
