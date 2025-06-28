import { Component, Inject, OnInit, ViewEncapsulation, Renderer2 } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { from } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { Environment, InteractSubtype, PageId, TelemetryGeneratorService } from '../../../../../services';
import { InteractType } from 'sunbird-sdk';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class AlertModalComponent implements OnInit {
  isLoadingFcWidget = true;

  constructor(
    private iab: InAppBrowser,
    public dialogRef: MatDialogRef<AlertModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private telemetryGeneratorService: TelemetryGeneratorService 
  ) { }

  ngOnInit() {
    window.fcWidget.on("widget:closed",function(resp) {console.log('call here ') })
  }
  done() {
    this.dialogRef.close({ event: 'CONFIRMED' })
  }
  closePopup() {
    this.hideFcWidget()
    this.generateInteractEvent('close-popup');
    this.dialogRef.close({ event: 'CLOSE' })
   
  }

  openWhatsApp(event: Event) {
    event.preventDefault();
    const url = 'https://wa.me/919632013414?text=Hi';
    const target = '_system';
    const options = 'location=yes';
    this.iab.create(url, target, options);
  }


  closeAlert(data){
    this.generateInteractEvent(data)
    this.dialogRef.close({ event: data })
  }

  openChat(){
    try {
      setTimeout(() => {
        window.fcWidget.init()
        window.fcWidget.setConfig({ headerProperty: { hideChatButton: false } })
        window.fcWidget.setConfig({ headerProperty: { direction: 'ltr' } })
      }, 100)
      const script = this._renderer2.createElement('script')
      script.src = '//in.fw-cdn.com/30492305/271953.js'
      this._renderer2.appendChild(this.document.body, script)
      const fcWidget = window.fcWidget;
      script.onload = ()=>{
        window.fcWidget.on('widget:closed', () => {
          console.log("close widget")
          this.hideFcWidget()
        })
      }
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error)
    }
  }

  hideFcWidget() {
    const fcWidget = window.fcWidget
    if (fcWidget) {
      fcWidget.hide();
    }
  }

generateInteractEvent(status) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      `${status}-clicked`,
      Environment.CREATE_ACCOUNT,
      PageId.CREATE_ACCOUNT
    );
}
}

