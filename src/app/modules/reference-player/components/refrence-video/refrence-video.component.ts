import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileTransfer, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
@Component({
  selector: 'app-refrence-video',
  templateUrl: './refrence-video.component.html',
  styleUrls: ['./refrence-video.component.scss'],
})
export class RefrenceVideoComponent implements OnInit {
  showbackButton = true
  showLogOutIcon = false
  videoData: any
  constructor(
    public transfer: FileTransfer,
    public matSnackBar: MatSnackBar,
    private translate: TranslateService,
    private androidPermissions: AndroidPermissions,
    private router: Router
  ) { }

  ngOnInit() {
    if(history.state){
      this.videoData = history.state.videoData;
      console.log(this.videoData)
    }
    
  }

  async downloadVideo(videoData: any) {
    const permissionsToCheck = [
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.READ_MEDIA_AUDIO',
    ];
  
    const hasAllPermissions = await this.checkPermissions(permissionsToCheck);
  
    if (hasAllPermissions) {
      await this.downloadInLocal(videoData.url, 'reference');
    } else {
      await this.requestPermissionsAndDownload(videoData.url, 'reference', permissionsToCheck);
    }
  }
  
  private async checkPermissions(permissions: string[]): Promise<boolean> {
    const results = await Promise.all(
      permissions.map(permission => this.androidPermissions.checkPermission(permission))
    );
    return results.every(status => status.hasPermission);
  }
  
  private async requestPermissionsAndDownload(videoUrl: string, fileName: string, permissions: string[]) {
    try {
      const result = await this.androidPermissions.requestPermissions(permissions);
      if (result.hasPermission) {
        await this.downloadInLocal(videoUrl, fileName);
      } else {
        console.error('Permissions were not granted.');
      }
    } catch (err) {
      console.error('Permission request failed:', err);
    }
  }
  
  private async downloadInLocal(videoUrl: string, name: string) {
    const fileName = `${name}.mp4`;
    const folderPath = cordova.file.externalRootDirectory + 'Download/';
  
    try {
      const directoryEntry = await this.resolveFileSystemURL(folderPath);
      await this.downloadFile(directoryEntry, fileName, videoUrl);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  }
  
  private resolveFileSystemURL(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(url, resolve, reject);
    });
  }
  
  private async downloadFile(directoryEntry: any, fileName: string, videoUrl: string) {
    const fileTransfer = this.transfer.create();
    const fileURL = directoryEntry.nativeURL + fileName;
  
    try {
      this.showDownloadSuccessSnackbar();
      await fileTransfer.download(videoUrl, fileURL);
    } catch (err) {
      console.error('Download error:', err);
    }
  }
  
  private showDownloadSuccessSnackbar() {
    this.matSnackBar.open(this.translate.instant('DOWNLOADED_SUCCESSFULLY'), 'Close', { duration: 3000 });
  }
  navigateBack(){
     this.router.navigateByUrl(`/app/toc/${this.videoData.contentIdentifier}/overview`)
  }
 
  
}
