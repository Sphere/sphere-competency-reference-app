import { Component, OnDestroy, OnInit } from '@angular/core';
import { Events } from '../../../../../util/events';

@Component({
  selector: 'app-progress-sync-bar',
  templateUrl: './progress-sync-bar.component.html',
  styleUrls: ['./progress-sync-bar.component.scss'],
})
export class ProgressSyncBarComponent implements OnInit, OnDestroy {

  public showSpinner = false;
  private setTimeOutObj: any = null;
  
  constructor(private event: Events) {
    this.subscribeToShowProgressSyncBar();
  }

  ngOnDestroy(): void {
    this.unsubscribeFromShowProgressSyncBar();
    this.clearTimeout();
  }

  ngOnInit() {}

  public subscribeToShowProgressSyncBar(): void {
    this.event.subscribe('showProgressSyncBar', (status) => {
      console.log('showProgressSyncBar--', status);
      this.handleShowSpinner(status);
      this.setupTimeout();
    });
  }

  public unsubscribeFromShowProgressSyncBar(): void {
    this.event.unsubscribe('showProgressSyncBar');
    this.event.unsubscribe('makeAPICall')
  }

  private handleShowSpinner(status: boolean): void {
    this.showSpinner = status;
  }

  public setupTimeout(): void {
    this.clearTimeout();
    this.setTimeOutObj = setTimeout(() => {
      this.showSpinner = false;
      this.unsubscribeFromShowProgressSyncBar()
    }, 90000);
    
  }

  private clearTimeout(): void {
    if (this.setTimeOutObj) {
      clearInterval(this.setTimeOutObj);
    }
  }
}
