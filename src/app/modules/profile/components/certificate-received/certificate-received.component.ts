import { Component, OnInit, Inject } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { WidgetContentService } from '../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service'
import { File } from '@awesome-cordova-plugins/file/ngx';
import { from } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'
import * as  _ from 'lodash'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { HTTP } from '@awesome-cordova-plugins/http/ngx'
import { CertificateService } from '@project-sunbird/sunbird-sdk';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { Environment, ImpressionType, InteractType, PageId, TelemetryGeneratorService, InteractSubtype } from '../../../../../services';

@Component({
  selector: 'ws-certificate-received',
  templateUrl: './certificate-received.component.html',
  styleUrls: ['./certificate-received.component.scss'],
})
export class CertificateReceivedComponent implements OnInit {

  certificateThumbnail: any = []
  certificates: any = []
  showbackButton = true
  showLogOutIcon = false
  trigerrNavigation = true
  noResultData = { 'message': 'NO_CERTIFICATE' }
  private downloadedFile;
  constructor(
    private file: File,
    private contentSvc: WidgetContentService,
    private domSanitizer: DomSanitizer,
    private configSvc: ConfigurationsService,
    public matSnackBar: MatSnackBar,
    private translate: TranslateService,
    private androidPermissions: AndroidPermissions,
    private device: Device,
    private http: HTTP,
    private socialSharing: SocialSharing,
    @Inject('CERTIFICATE_SERVICE') private certificateService: CertificateService,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) { }

  ngOnInit() {
    this.contentSvc.fetchGeneralAndRcCertificates(this.configSvc.userProfile.userId).pipe().subscribe((res: any) => {
      this.processCertiFicate(res)
    })
    this.generateImpressionEvent();
  }
  processCertiFicate(data: any) {

    const certificateIdArray = _.map(_.flatten(_.filter(_.map(data.generalCertificates, 'issuedCertificates'), certificate => {
      return certificate.length > 0
    })), 'identifier')
    this.formateRequest(data)
    from(certificateIdArray).pipe(
      map(certId => {
        this.certificateThumbnail.push({ identifier: certId })
        return certId
      }),
      mergeMap(certId =>
        this.contentSvc.getMobileCertificateAPI(certId, this.configSvc.userProfile.userId)
      )
    ).subscribe(() => {
      // setTimeout(() => {
      this.contentSvc.updateValue$.subscribe((res: any) => {
        if (res) {
          _.forEach(this.certificates, cvalue => {
            if (res[cvalue.identifier]) {
              cvalue['image'] = this.domSanitizer.bypassSecurityTrustUrl(res[cvalue.identifier])
              cvalue['printUri'] = res[cvalue.identifier]
            }
          })
        }
      })
      // }, 500)
    })
  }

  formateRequest(data: any) {
    this.certificates = _.concat(this.generalCertifcate(data), this.rcCertiface(data));
    console.log(this.certificates)
  }
  generalCertifcate(data){
    const generalCertificates = _.reduce(_.flatten(_.filter(_.map(data.generalCertificates, 'issuedCertificates'), certificate => {
      return certificate.length > 0
    })), (result: any, value) => {
      result.push({
        identifier: value.identifier,
        name: value.name,
        rcCertiface: false
      })
      return result
    }, [])
    return generalCertificates
  }

  rcCertiface(data: any) {
    if (data.sunbirdRcCertificates && data.sunbirdRcCertificates.length > 0) {
      return _.reduce(
        data.sunbirdRcCertificates,
        (result: any[], certificate: any) => {
          result.push({
            name: certificate.certificateName,
            downloadUrl: certificate.certificateDownloadUrl,
            image: certificate.thumbnail,
            rcCerticate: true
          });
          return result;
        },
        []
      );
    } else {
      return [];
    }
  }
  async convertToJpeg(imgVal: any, name: any) {
    const permissionsToCheck = [
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.READ_MEDIA_AUDIO',
    ];

    const hasAllPermissions = await Promise.all(
      permissionsToCheck.map(async permission => {
        const status = await this.androidPermissions.checkPermission(permission);
        return status.hasPermission;
      })
    );
    if (hasAllPermissions.every(permissionGranted => permissionGranted)) {
      this.downloadCertificate(imgVal, name)
    } else {
      this.requestPermissions(imgVal,name)
    }
  }

  requestPermissions(imgVal,name) {
    const androidVersion = parseInt(this.device.version, 10);

    const permissionsAndroid13Plus = [
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.READ_MEDIA_AUDIO',
    ];

    const permissionsBelowAndroid13 = [
      this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE
    ];

    const permissions = androidVersion >= 13 ? permissionsAndroid13Plus : permissionsBelowAndroid13;

    this.androidPermissions.requestPermissions(permissions).then(
      result => {
        console.log('Permissions granted:', result.hasPermission);
        this.downloadCertificate(imgVal, name);
      },
      err => {
        console.error('Permissions denied:', err);
      }
    );
  }

  downloadCertificate(imgVal, name) {
   
    if(imgVal.rcCerticate){
      const fileName = `${name}_certificate.png`;
      const folderPath = cordova.file.externalRootDirectory + 'Download/';
     this.downloadRCCertificate(imgVal.downloadUrl, fileName, folderPath)
    }else {
      const img = new Image();
      const url = imgVal.printUri;
      img.onload = async() => {
        const canvas: any = document.getElementById('certCanvas') || document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const imgWidth = img.width;
        const imgHeight = img.height;
  
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
  
        const imgURI = canvas.toDataURL('image/jpeg').split(',')[1];
        const byteString = atob(imgURI);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uintArray = new Uint8Array(arrayBuffer);
  
        for (let i = 0; i < byteString.length; i++) {
          uintArray[i] = byteString.charCodeAt(i);
        }
  
        const blob = new Blob([uintArray], { type: 'image/jpeg' });
        const fileName = `${name}_certificate.jpeg`;
        const folderPath = cordova.file.externalRootDirectory
        const downloadDirectory = `${folderPath}Download/`;
        const downloadRequest = {
          fileName: fileName,
          mimeType: 'image/png',
          blob: blob
        }
        const { path } = await this.certificateService
          .downloadCertificate(downloadRequest)
          .toPromise();
        console.log('path', path)
        await this.shareFile(path, fileName)
      };
      img.src = url;
    }
   
  }
  
  private async shareFile(filePath: string, fileName: string): Promise<void> {
  
    try {
      this.generateInteractEvent(fileName);
      this.socialSharing.share('Certificate', 'Here is your certificate.', filePath, null);
      
    } catch (error) {
      console.log('Error sharing file:', error);
    }
    
  }
  writeToFile(downloadDirectory, filename, downloadedFile) {
    this.file.writeFile(downloadDirectory, filename, downloadedFile, { replace: true })
      .then((res) => {
        this.matSnackBar.open(this.translate.instant('DOWNLOADED_SUCCESSFULLY'))
      })
      .catch((err) => {
        console.log('writeFile err', err)
      });
  }
  private async downloadRCCertificate(videoUrl: string, name: string, folderPath: string) {
    try {
      // Download the file as a Blob
      const httpResponse = await this.http.sendRequest(videoUrl, { method: "get", responseType: "arraybuffer" });
      console.log("File downloaded successfully");
      this.downloadedFile = new Blob([httpResponse.data], { type: 'image/png' });
      const downloadRequest = {
        fileName: name,
        mimeType: 'image/png',
        blob: this.downloadedFile
      }
      const { path } = await this.certificateService.downloadCertificate(downloadRequest).toPromise()
      console.log('path',path)
      await this.shareFile(path, name)
    } catch (err) {
      console.error('Download error:', err);
    }
  }

  generateImpressionEvent() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.MY_CERTIFICATE,
      Environment.DOWNLOADS
    );
  }

  generateInteractEvent(fileName) {
    const valuesMap = {};
    valuesMap['fileName'] = fileName;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.DOWNLOAD,
      InteractSubtype.SHARE_CLICKED,
      Environment.DOWNLOADS,
      PageId.MY_CERTIFICATE,
      undefined,
      valuesMap
    );
  }
  
}
