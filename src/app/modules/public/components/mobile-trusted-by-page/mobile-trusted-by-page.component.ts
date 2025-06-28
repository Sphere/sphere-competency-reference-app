import { Component, OnInit } from '@angular/core'
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

import { FileTransfer, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { Platform } from '@ionic/angular';
@Component({
  selector: 'ws-mobile-trusted-by-page',
  templateUrl: './mobile-trusted-by-page.component.html',
  styleUrls: ['./mobile-trusted-by-page.component.scss'],
})
export class MobileTrustedByPageComponent implements OnInit {

  isTablet = false;
  constructor(
    private file: File,
    private fileOpener: FileOpener,
    private platform: Platform,
    public transfer: FileTransfer,
  ) { }

  ngOnInit() {
    this.isTablet = this.platform.is('tablet');
  }

  openLink() {
    // console.log("file open")

    const url = 'https://www.c3india.org/wrai-rmc-charter';
    // const target = '_system';
    // const options: InAppBrowserOptions = {
    //   location: 'no',
    //   zoom: 'yes',
    // };
    // const browser = this.iab.create(url, target, options);
    let path =this.file.externalDataDirectory;
    const fileTransfer: FileTransferObject = this.transfer.create();
    fileTransfer.download(url, path + '/' + "rrr").then(success => {
      this.fileOpener.open( path + '/' + "rrr", 'application/pdf')
      .then(() => console.log('File is opened'))
      .catch(e => console.log('Error opening file', e));
    })
   

  }

}
