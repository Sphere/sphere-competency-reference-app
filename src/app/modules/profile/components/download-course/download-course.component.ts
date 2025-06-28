import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { AppStorageInfo } from '../../../../../app/download-manager/download-manager.interface';
import { DbService, LocalStorageService, NetworkService } from '../../../../../app/manage-learn/core';
import { storageKeys } from '../../../../../app/manage-learn/storageKeys';
import { AppGlobalService, CommonUtilService, Environment, ImpressionType, PageId, TelemetryGeneratorService } from '../../../../../services';
import { ContentUtil } from '../../../../../util/content-util';
import { AuthService, Content, ContentDelete, ContentDeleteRequest, ContentDeleteResponse, ContentDeleteStatus, ContentRequest, ContentService, ContentSortCriteria, ContentSpaceUsageSummaryRequest, ContentSpaceUsageSummaryResponse, DeviceInfo, Profile, SortOrder, StorageService } from '@project-sunbird/sunbird-sdk';
import { CardService } from '../../../../../app/modules/shared/services/card.service';
import cardConfig from '../../../../../assets/configurations/card.json';
import * as _ from 'lodash-es';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import * as jwt_decode from "jwt-decode";
import * as moment from 'moment';
import { Router } from '@angular/router';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-download-course',
  templateUrl: './download-course.component.html',
  styleUrls: ['./download-course.component.scss'],
})
export class DownloadCourseComponent implements OnInit {
  showbackButton = true
  showLogOutIcon = false
  trigerrNavigation = true
 

  storageInfo: AppStorageInfo;
  downloadedContents: Content[] = [];

  loader: any;
  sortCriteria: ContentSortCriteria[];
  storageDestination: any;
  displayConfig = {
    displayType: 'card-standard',
    badges: {
      orgIcon: true,
      certification: false,
    }
  }
  noResultData :any
  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    private ngZone: NgZone,
    public commonUtilService: CommonUtilService,
    private appGlobalService: AppGlobalService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private db: DbService,
    private storage: LocalStorageService,
    private cardService:CardService,
    private networkService:NetworkService,
    public configSvc: ConfigurationsService,
    public router:Router,
    
  ) { 
    this.noResultData  = {'message': 'NO_COURSE_DOWNLOAD'}
  }

  async ngOnInit() {
    Network.getStatus().then(async(res: any) => {
      if(res.connectionType) {
        await this.checkTokenValidation()
      }
    })
    this.getDownloadedContents();
    this.networkService.netWorkCheck()
  }
  async checkTokenValidation() {
    if(this.commonUtilService.networkInfo.isNetworkAvailable){
      const session = await this.authService.getSession().toPromise();
      if (session) {
        const token = jwt_decode(session.access_token);
        const tokenExpiryTime = moment(token.exp * 1000);
        const currentTime = moment(Date.now());
        const duration = moment.duration(tokenExpiryTime.diff(currentTime));
        const hourDifference = duration.asHours();
        if (hourDifference < 2) {
          this.router.navigateByUrl('/public/home')
        }
      }else {
        this.router.navigateByUrl('/public/home')
      }
    }
    
  }

  async getDownloadedContents(shouldGenerateTelemetry?, ignoreLoader?) {
    const profile: Profile = this.appGlobalService.getCurrentUser();

    const defaultSortCriteria: ContentSortCriteria[] = [{
      sortAttribute: 'sizeOnDevice',
      sortOrder: SortOrder.DESC
    }];
    const primaryCategories = ['Course'];
    console.log('primaryCategories-', primaryCategories);
    const requestParams: ContentRequest = {
      uid: profile.uid,
      primaryCategories,
      audience: [],
      sortCriteria: this.sortCriteria || defaultSortCriteria
    };
    if (shouldGenerateTelemetry) {
      await this.getAppStorageInfo();
    }
    this.generateImpressionEvent();
    await this.contentService.getContents(requestParams).toPromise()
      .then(async data => {
        console.log('getContents-', data);
       // if (shouldGenerateTelemetry) {
          this.generateInteractTelemetry(data.length, this.storageInfo?.usedSpace, this.storageInfo?.availableSpace);
       // }
        data.forEach((value) => {
          value.contentData['lastUpdatedOn'] = value.lastUpdatedTime;
          value.contentData.appIcon = ContentUtil.getAppIcon(value.contentData.appIcon,
            value.basePath, this.commonUtilService.networkInfo.isNetworkAvailable);
        });
        const query = {
            selector: {
           downloaded: true,
          },
        }; 
        if(this.db.pdb){
          let projectData: any = await this.db.customQuery(query);
          if (projectData.docs) {
            projectData.docs.sort(function (a, b) {
                return  new Date(b.updatedAt || b.syncedAt).valueOf() - new Date(a.updatedAt || a.syncedAt).valueOf() ;
              });
              projectData.docs.map(doc => {
                doc.contentData = { lastUpdatedOn: doc.updatedAt,name:doc.title };
                doc.type = 'project'
                doc.identifier=doc._id;
                data.push(doc)
            })
          }
        }
        this.storage
        .getLocalStorage(storageKeys.downloadedObservations)
        .then(resp => {
          console.log('resp-', resp);
          resp.sort(function(a, b) {
            return ( new Date(b.lastViewedAt).valueOf() - new Date(a.lastViewedAt).valueOf());
          });
          resp.map(res => {
            res.contentData = { lastUpdatedOn: res.lastViewedAt, name: res.name, subject:res.programName };
            res.type = 'observation';
            res.identifier = res.programId + res.solutionId;
            data.push(res);
          });
        });
        
        this.ngZone.run(async () => {
          const cardData = this.cardService.getOfflineDataForCard(data,cardConfig.sphereCard.constantData,
            cardConfig.sphereCard.dynamicFields,cardConfig.sphereCard.metaData,false,true,true)
          this.downloadedContents = cardData;
          console.log('downloadedContents-', this.downloadedContents);
        });
      });
  }

  private async getAppStorageInfo(): Promise<AppStorageInfo> {
    const req: ContentSpaceUsageSummaryRequest = { paths: [this.storageService.getStorageDestinationDirectoryPath()] };
    return this.contentService.getContentSpaceUsageSummary(req).toPromise()
      .then((res: ContentSpaceUsageSummaryResponse[]) => {
        return this.deviceInfo.getAvailableInternalMemorySize().toPromise()
          .then((size) => {
            this.storageInfo = {
              usedSpace: res[0].sizeOnDevice,
              availableSpace: parseInt(size, 10)
            };
            return this.storageInfo;
          });
      });
  }

  generateImpressionEvent() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.DOWNLOADS,
      Environment.DOWNLOADS
    );
  }

  private generateInteractTelemetry(contentCount: number, usedSpace: number, availableSpace: number) {
    const valuesMap = {};
    valuesMap['count'] = contentCount;
    valuesMap['spaceTakenByApp'] = this.commonUtilService.fileSizeInMB(usedSpace);
    valuesMap['freeSpace'] = this.commonUtilService.fileSizeInMB(availableSpace);
    this.telemetryGeneratorService.generateExtraInfoTelemetry(valuesMap, PageId.DOWNLOADS);
  }
  
  async menuVerticalClick(param:any){
    if (param.action.eventName === 'delete') {
      const contentDelete: ContentDelete = {
        contentId: param.data.identifier,
        isChildContent: false
      }
      const contentDeleteRequest: ContentDeleteRequest = {
        contentDeleteList: [contentDelete],
      };
      this.loader = await this.commonUtilService.getLoader();
      await this.loader.present();
      /*call the delte method here to delete the downloadContent*/ 
      this.contentService.deleteContent(contentDeleteRequest).toPromise()
        .then(async (data: ContentDeleteResponse[]) => {
          await this.loader.dismiss();
          this.loader = undefined;
          if (data && data[0].status === ContentDeleteStatus.NOT_FOUND) {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('CONTENT_DELETE_FAILED'));
          } else {
            this.getDownloadedContents();
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('MSG_RESOURCE_DELETED'));
            await this.storage.deleteOneStorage('DOWNLOAD_COURSE_STATUS', param.data.identifier)
          }
        }).catch(async (error: any) => {
          await this.loader.dismiss();
          this.loader = undefined;
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('CONTENT_DELETE_FAILED'));
        });
    }
  }

}
