import { Component, OnInit } from '@angular/core';
import { AppFrameworkDetectorService } from '../../../../../app/modules/core/services/app-framework-detector-service.service';
import { DeepLinkService } from '../../../../../app/services/deep-link.service';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { ConfigService as CompetencyConfiService } from '../../../../../app/competency/services/config.service'
import { Events } from '../../../../../util/events';
import { TelemetryGeneratorService } from '../../../../../services/telemetry-generator.service';
import * as _ from 'lodash-es'
import { Environment, ImpressionType, PageId } from '../../../../../services/telemetry-constants'
import { Subscription, fromEvent } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  public data: any;
  content: any;
  appFramework: string;
  role: string;
  designation: any;
   impressionTelemetry: any;
    scroll$: Subscription;
    startPosition: number;

  constructor(
    private appFrameworkDetectorService:AppFrameworkDetectorService,
    private deepLinkService: DeepLinkService,
    private configSvc: ConfigurationsService,
    private CompetencyConfiService: CompetencyConfiService,
    private events: Events,
    private telemetryGeneratorService: TelemetryGeneratorService,
  ) { }

  ngOnInit() {
    // this.detectNetwork()
    this.detectFramework()
    this.initDeeplinks();
    this.getRoles()
  }

  async detectFramework() {
    try {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
      this.telemetryGeneratorService.generateImpressionTelemetry(
        ImpressionType.PAGE_LOADED, '',
        PageId.USER_HOME,
        Environment.HOME);
    } catch (error) {
      // console.log('error while getting packagename')
    }
  }

  initDeeplinks() {
    if (!this.deepLinkService.isDeepLinkInitialized()) {
      this.deepLinkService.init();
    }
    this.events.publish('basicNavigationIsDone');
  }

  getRoles() {
    console.log("roles ", this.configSvc.userProfile.profileData)
    const desiginationArray = _.get(this.configSvc.userProfile.profileData, 'professionalDetails');
    this.designation =  desiginationArray[0].designation.toUpperCase();
    // this.designation =  "ASHA"

    const userRolesArray = Array.from(this.configSvc.userRoles);
    this.CompetencyConfiService.setConfig(this.configSvc.userProfile)
    // Find the role "obs_mentor"
    this.role = userRolesArray.find(role => role == "obs_mentor");
    if(!this.role){
      this.role = ''; 
    }
    console.log(this.role); // This will output "obs_mentor" if it exists in the set
  }
  
  // async detectNetwork(){
  //   if(!navigator.onLine){
  //     this.showOfflineModal();
  //   }
  //   this.network.onDisconnect().subscribe((res:any) => {
  //     console.log('home compo n/w disconnect check -',res)
  //     if(res.type == 'offline'){
  //       this.showOfflineModal();
  //     } else{
  //       let openDilogRef = this.dialog.getDialogById('offlineModal');
  //       if(openDilogRef){
  //         openDilogRef.close();
  //       }
  //     }
  //   });

  //   this.network.onConnect().subscribe((res:any) => {
  //     console.log('home compo n/w connect check -',res)
  //     let openDilogRef = this.dialog.getDialogById('offlineModal');
  //     if(openDilogRef){
  //       openDilogRef.close();
  //     }
  //   });

  // }

  // async showOfflineModal(){
  //   let openDilogRef = await this.dialog.getDialogById('offlineModal');
  //   if(openDilogRef){
  //     await openDilogRef.close();
  //     setTimeout(() => {
  //       this.openOfflineModal();
  //     }, 1000);
  //   }else{
  //     this.openOfflineModal()
  //   }
  // }

  // openOfflineModal(){
  //   const dialogRef = this.dialog.open(OfflineModalComponent, {
  //     id: 'offlineModal',
  //     width: '542px',
  //     disableClose: true,
  //     panelClass: 'full-width-offline-modal',
  //     data: {}
  //   })
  // }
}