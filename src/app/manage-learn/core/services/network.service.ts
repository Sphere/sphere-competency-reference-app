import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  connectSubscription;
  disconnectSubscription;
  syncSettingData: any;
  $networkStatus = new Subject();
  isNetworkAvailable: boolean = false;
  constructor() { }

  public netWorkCheck() {
    this.getCurrentStatus();
    this.disconnectSubscription = Network.getStatus().then((val) => {
      if (!val.connected) {
        this.isNetworkAvailable = false;
        this.$networkStatus.next(this.isNetworkAvailable);
      }
    });
    this.connectSubscription = Network.getStatus().then((val) => {
      if (val.connected) {
        this.isNetworkAvailable = true;
        this.$networkStatus.next(this.isNetworkAvailable);
      }
    });
  }

  public getCurrentStatus() {
    Network.getStatus().then(val => {
      if (val.connectionType == 'none') {
        this.isNetworkAvailable = false;
        this.$networkStatus.next(this.isNetworkAvailable);
      } else {
        this.isNetworkAvailable = true;
        this.$networkStatus.next(this.isNetworkAvailable);
      }
    })
  }
  // method to handle on sync setting change
  checkSyncSettings(): Promise<any> {
    return new Promise((resolve, reject) => {   
    });
  }

}
