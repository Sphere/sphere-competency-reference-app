import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service';
import { TranslateService } from '@ngx-translate/core';
import professionsList from 'assets/fusion-assets/files/professions.json'
import * as _ from 'lodash';
import { AppFrameworkDetectorService } from '../../../../app/modules/core/services/app-framework-detector-service.service';
import { Environment, ErrorType, InteractType, PageId, TelemetryGeneratorService } from '../../../../services';

@Component({
  selector: 'ws-your-background',
  templateUrl: './your-background.component.html',
  styleUrls: ['./your-background.component.scss'],
})
export class YourBackgroundComponent implements OnInit {
  @Input() aboutYou: any
  @Output() redirectToParent = new EventEmitter()
  bgImgSelect: any
  almostDone = false
  professions: any
  nextBtnDisable = true
  userId = ''
  firstName = ''
  middleName = ''
  lastName = ''
  email = ''
  selectedAddress: any
  professionUrl = '../../../fusion-assets/files/professions.json'
  isOpen: boolean[] = [false, false, false, false, false, false];selectedProfession: string;
  selectedBackground: any;
  hideAsha: boolean = false;
 ; // Keeps track of open sections
  constructor(
    private activateRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private telemetryGeneratorService: TelemetryGeneratorService

  ) {
     
  }

  ngOnInit() {
    console.log("list", professionsList )
      if (this.aboutYou.value.country !== 'India') {
        this.hideAsha = true
        // this.professions = _.get(professionsList, 'professions', professionsList.professions).filter((s: any) => {
        //   return s.name !== 'ASHA'
        // })
        this.professions = _.get(professionsList, 'professions', professionsList.professions).map((profession: any) => {
          if (profession.name === 'Others') {
            profession.roles = profession.roles.filter((role: string) => role !== 'ASHA trainer' && role !== 'ASHA facilitator');
          }
          return profession;
        }).filter((s: any) => s.name !== 'ASHA');
      } else {
        this.hideAsha = false
        this.professions = _.get(professionsList, 'professions', professionsList.professions)
      }
    this.nextBtnDisable = true
    
     // Initialize the isOpen array to be the same length as the professions array
     this.isOpen = Array(this.professions.length).fill(false);
     this.cdr.detectChanges();

     console.log("professions after filtering", this.professions);
     console.log("isOpen array initialized", this.isOpen);
  }
  imgSelect(img: any) {
    if (img) {
      this.nextBtnDisable = false
    }
    this.bgImgSelect = img.name
    this.onsubmit()
  }
  changeBackgroung() {
    this.almostDone = false
    this.bgImgSelect = ""
    this.selectedProfession = ""
    this.selectedBackground = ""
  }

  redirectToYourBackground() {
    this.redirectToParent.emit('true')
  }

  toggleSection(index: number) {
    
    // this.isOpen[index] = !this.isOpen[index]; // Toggle the selected section
    this.isOpen = this.isOpen.map((_, i) => i === index ? !this.isOpen[index] : false);
     // Debugging
  console.log("Toggled index:", index);
  console.log("isOpen state:", this.isOpen);
  }

  navigateAsha(professions){
    console.log('Asha:', professions );
    this.bgImgSelect = professions.name
   
    this.selectedBackground = professions
    this.onsubmit()
  }

  selectRole(role: string, professions ) {
    console.log('Selected role:', role, professions );
    this.bgImgSelect = professions.name
    this.selectedProfession = role
    this.selectedBackground = professions
    this.onsubmit()

  }

  async updateProfile() {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
      this.email = this.configSvc.userProfile.email || ''
      this.firstName = this.configSvc.userProfile.firstName || ''
      this.middleName = this.configSvc.userProfile.middleName || ''
      this.lastName = this.configSvc.userProfile.lastName || ''
    }
    this.selectedAddress = this.aboutYou.value.country
    if (this.aboutYou.value.state) {
      this.selectedAddress += ', ' + `${this.aboutYou.value.state}`
    }
    if (this.aboutYou.value.distict) {
      this.selectedAddress += ', ' + `${this.aboutYou.value.distict}`
    }
    const userObject = {
      firstname: this.firstName,
      middlename: this.middleName,
      surname: this.lastName,
      regNurseRegMidwifeNumber: '[NA]',
      primaryEmail: this.email,
      dob: this.aboutYou.value.dob,
      postalAddress: this.selectedAddress,
    }
    Object.keys(userObject).forEach(key => {
      if (userObject[key] === '') {
        delete userObject[key]
      }
    })
    const appName = await this.appFrameworkDetectorService.detectAppFramework();
    console.log('appName', appName);
    const reqUpdate = {
      request: {
        userId: this.userId,
        profileDetails: {
          profileLocation: `${appName}/your-background`,
          profileReq: {
            id: this.userId,
            userId: this.userId,
            personalDetails: {
              ...userObject,
              profileLocation: `${appName}/your-background`
            },
          },
        },
      },
    }

    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(data => {
      if (data) {
        this.generateInteractTelemetry('update-profile-success')
        this.openSnackbar(this.translate.instant('USER_PROFILE_DETAILS_UPDATED_SUCCESSFULLY'))
      }
    }, (error) => {
      this.generateErrorTelemetry(error)
    })
  }

    generateInteractTelemetry(action) {
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.UPDATE_PROFILE,
        action,
        Environment.HOME,
        PageId.PROFILE
      );
    }
    generateErrorTelemetry(error) {
        this.telemetryGeneratorService.generateErrorTelemetry(
          Environment.HOME,
          'update-user-profile',
          ErrorType.SYSTEM,
          PageId.LOGIN,
          JSON.stringify(error)
        );
      }

  onsubmit() {
    if (this.bgImgSelect) {
      if (this.bgImgSelect === 'Mother/Family Member') {
        this.updateProfile()
        this.activateRoute.queryParams.subscribe(params => {
          const url = params.redirect
          if (url) {
            localStorage.removeItem('url_before_login')
            this.router.navigate([url])
          } else {
            this.router.navigate(['page', 'home'])
          }
        })
      } else {
        this.almostDone = true
      }
    }
  }
  private openSnackbar(primaryMsg: string, duration: number = 2000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
}
