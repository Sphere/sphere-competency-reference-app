import { Injectable, NgZone, Inject } from '@angular/core';
import {
    ToastController,
    LoadingController,
    PopoverController,
    Platform,
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ConnectionStatus, Network } from '@capacitor/network';
import {
    SharedPreferences, ProfileService, Profile, ProfileType,
    CorrelationData, CachedItemRequestSourceFrom, LocationSearchCriteria, TelemetryService
} from 'sunbird-sdk';
import {
    PreferenceKey, ProfileConstants, RouterLinks,
    appLanguages, Location as loc, MaxAttempt, SwitchableTabsConfig
} from '../app/app.constant';
import { TelemetryGeneratorService } from '../services/telemetry-generator.service';
import {
    InteractType, InteractSubtype, PageId, Environment, ImpressionType
} from '../services/telemetry-constants';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { SbPopoverComponent } from '../app/components/popups';
import { Router } from '@angular/router';
import GraphemeSplitter from 'grapheme-splitter';

export interface NetworkInfo {
    isNetworkAvailable: boolean;
}
@Injectable()
export class CommonUtilService {
    public previesUrlList = []
    blockAddUrl: Boolean = false
    public networkAvailability$: Observable<any>;
    loader = null
    networkInfo: NetworkInfo = {
        isNetworkAvailable: navigator.onLine
    };

    googleCaptchaConfig = new Map();
    private _currentTabName: string;
    appName: any;
    private toast: any;
    loadersCount = 0;

    public preferedLanguages = {
        en: 'English',
        hi: 'Hindi',
        kn: 'Kannada'
    }

    private pageStartTime: any;
    private pageEndTime: any;
    private showNavbarSubject = new BehaviorSubject<boolean>(false);
    showNavbar$ = this.showNavbarSubject.asObservable();
    constructor(
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
        private translate: TranslateService,
        private loadingCtrl: LoadingController,
        private popOverCtrl: PopoverController,
        private zone: NgZone,
        private platform: Platform,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private appVersion: AppVersion,
        private router: Router,
        private toastController: ToastController,
    ) { 
        
        this.networkAvailability$ = merge(
            Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
                this.zone.run(() => {
                    this.networkInfo = {
                        isNetworkAvailable: status.connected
                    }
                })
            })
        )
    }

    initialize() {
        this.pageStartTime = Date.now();
    }
    showToast(translationKey, isInactive?, cssToast?, duration?, position?, fields?: string | any) {
        if (Boolean(isInactive)) {
            return;
        }

        let replaceObject: any = '';

        if (typeof (fields) === 'object') {
            replaceObject = fields;
        } else {
            replaceObject = { '%s': fields };
        }

        this.translate.get(translationKey, replaceObject).subscribe(
            async (translatedMsg: any) => {
                const toastOptions = {
                    message: translatedMsg,
                    duration: duration ? duration : 3000,
                    position: position ? position : 'bottom',
                    cssClass: cssToast ? cssToast : ''
                };

                let toast = await this.toastController.create(toastOptions);
                toast = this.addPopupAccessibility(toast, translatedMsg);
                await toast.present();
            }
        );
    }

    /**
     * Used to Translate message to current Language
     * @param messageConst - Message Constant to be translated
     * @returns translatedMsg - Translated Message
     */
    translateMessage(messageConst: string, fields?: string | any): string {
        let translatedMsg = '';
        let replaceObject: any = '';

        if (typeof (fields) === 'object') {
            replaceObject = fields;
        } else {
            replaceObject = { '%s': fields };
        }

        this.translate.get(messageConst, replaceObject).subscribe(
            (value: any) => {
                translatedMsg = value;
            }
        );
        return translatedMsg;
    }

    /**
     * @param translations Stringified object of translations
     * @param defaultValue Fallback value if does not have translations
     * @returns Translated values or fallback value
     */
    getTranslatedValue(translations: string, defaultValue: string) {
        const availableTranslation = JSON.parse(translations);
        if (availableTranslation.hasOwnProperty(this.translate.currentLang)) {
            return availableTranslation[this.translate.currentLang];
        }
        return defaultValue;
    }

    /**
     * Returns Loading object with default config
     * @returns Loading object
     */
    getLoader(duration?, message?): any {
        // return false;
        return this.loadingCtrl.create({
            message,
            duration: duration ? duration : 30000,
            spinner: 'crescent',
            cssClass: message ? 'custom-loader-message-class' : 'custom-loader-class'
        });
    }

    async addLoader(duration?, message?) {
        if (!this.loader === null) {
            await this.loader.dismiss()
            this.loader = null
        }
        setTimeout(async () => {
            this.loader = await this.getLoader(duration ? duration : 4000, message)
            await this.loader.present()
        }, 100)
        this.loadersCount = this.loadersCount + 1
    }

    public getPageLoadTime() {
        this.pageEndTime = Date.now();
        const loadTime = (this.pageEndTime - this.pageStartTime) / 1000;
        return loadTime;
     }

    async removeLoader() {
        this.loadersCount = this.loadersCount - 1
        if (this.loadersCount <= 0 && this.loader !== null) {
            await this.loader.dismiss()
            this.loader = null
            this.loadersCount = 0
        }
    }

    /**
     * Method to convert Array to Comma separated string
     */
    arrayToString(stringArray: Array<string>): string {
        return stringArray.join(', ');
    }
    /**
     * @param code language ISO short code
     */

    updateAppLanguage(code){
        if(code && this.preferedLanguages[code] != undefined){
            this.changeAppLanguage(this.preferedLanguages[code], code)
        }else{
            this.changeAppLanguage('English', 'en');
        }
    }

    /**
     * It will change the app language to given code/name if it available locally
     * @param name Name of the language
     * @param code language code
     */
    changeAppLanguage(name, code?) {
        if (!Boolean(code)) {
            const foundValue = appLanguages.filter(language => language.name === name);

            if (foundValue.length) {
                code = foundValue[0].code;
            }
        }

        if (code) {
            this.translate.use(code);
            this.translate.setDefaultLang(code)
            this.preferences.putString(PreferenceKey.SELECTED_LANGUAGE_CODE, code).toPromise().then();
            this.preferences.putString(PreferenceKey.SELECTED_LANGUAGE, name).toPromise().then();
        }
    }

    /**
     * Opens In-app Browser
     * @param url - URL to open in browser or system apps
     */
    openLink(url: string): void {
        const options
            = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,clearsessioncache=no,closebuttoncaption=Done,disallowoverscroll=yes';

        (window as any).cordova.InAppBrowser.open(url, '_system', options);
    }

    /**
     * @returns App direction 'rtl' || 'ltr'
     */
    getAppDirection() {
        return this.platform.isRTL ? 'rtl' : 'ltr';
    }


    async getAppName() {
        return this.appVersion.getAppName();
    }

    openUrlInBrowser(url) {
        const options = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,disallowoverscroll=yes';
        (window as any).cordova.InAppBrowser.open(url, '_blank', options);
    }

    fileSizeInMB(bytes) {
        if (!bytes) {
            return '0.00';
        }
        return (bytes / 1048576).toFixed(2);
    }

    public deDupe<T>(array: T[], property): T[] {
        if (!array) {
            return [];
        }
        return array.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[property]).indexOf(obj[property]) === pos;
        });
    }

    set currentTabName(tabName: string) {
        this._currentTabName = tabName;
    }

    get currentTabName() {
        return this._currentTabName;
    }

    setGoogleCaptchaConfig(key, isEnabled) {
        this.googleCaptchaConfig.set('key', key);
        this.googleCaptchaConfig.set('isEnabled', isEnabled);
    }

    getGoogleCaptchaConfig() {
        return this.googleCaptchaConfig;
    }
    // return org location details for logged in user
    getOrgLocation(organisation: any) {
        const location = { 'state': '', 'district': '', 'block': '' };
        if (organisation.locations) {
            for (let j = 0, l = organisation.locations.length; j < l; j++) {
                if (organisation.locations[j]) {
                    switch (organisation.locations[j].type) {
                        case 'state':
                            location.state = organisation.locations[j];
                            break;

                        case 'block':
                            location.block = organisation.locations[j];
                            break;

                        case 'district':
                            location.district = organisation.locations[j];
                            break;

                        default:
                            // console.log('default');
                    }
                }
            }
        }
        return location;
    }


    getUserLocation(profile: any) {
        const userLocation = {
        };
        if (profile && profile.userLocations && profile.userLocations.length) {
            profile.userLocations.forEach((d) => {
                userLocation[d.type] = d;
            });
        }

        return userLocation;
    }

    isUserLocationAvalable(profile: any, locationMappingConfig): boolean {
        const location = this.getUserLocation(profile.serverProfile ? profile.serverProfile : profile);
        let isAvailable = false;
        if (locationMappingConfig && profile && profile.profileType !== ProfileType.NONE) {
            const requiredFileds = this.findAllRequiredFields(locationMappingConfig, profile.profileType);
            isAvailable = requiredFileds.every(key => Object.keys(location).includes(key));
        }
        return isAvailable;
    }

    private findAllRequiredFields(locationMappingConfig, userType) {
        return locationMappingConfig.find((m) => m.code === 'persona').children[userType].reduce((acc, config) => {
            if (config.validations && config.validations.find((v) => v.type === 'required')) {
                acc.push(config.code);
            }
            return acc;
        }, []);
    }

    async isDeviceLocationAvailable(): Promise<boolean> {
        const deviceLoc = await this.preferences.getString(PreferenceKey.DEVICE_LOCATION).toPromise();
        return !!deviceLoc;
    }

    async isIpLocationAvailable(): Promise<boolean> {
        const deviceLoc = await this.preferences.getString(PreferenceKey.IP_LOCATION).toPromise();
        return !!deviceLoc;
    }

    handleToTopicBasedNotification() {
        this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
            .then(async (response: Profile) => {
                const profile = response;
                const subscribeTopic: Array<string> = [];
                subscribeTopic.push(profile.board[0]);
                subscribeTopic.push(profile.profileType.concat('-', profile.board[0]));
                profile.medium.forEach((m) => {
                    subscribeTopic.push(profile.board[0].concat('-', m));
                    profile.grade.forEach((g) => {
                        subscribeTopic.push(profile.board[0].concat('-', g));
                        subscribeTopic.push(profile.board[0].concat('-', m.concat('-', g)));
                    });
                });
                await this.preferences.getString(PreferenceKey.DEVICE_LOCATION).subscribe((data) => {
                    if (data) {
                        subscribeTopic.push(JSON.parse(data).state.replace(/[^a-zA-Z0-9-_.~%]/gi, '-'));
                        subscribeTopic.push(profile.profileType.concat('-', JSON.parse(data).state.replace(/[^a-zA-Z0-9-_.~%]/gi, '-')));
                        subscribeTopic.push(JSON.parse(data).district.replace(/[^a-zA-Z0-9-_.~%]/gi, '-'));
                    }
                });
                await this.preferences.putString(PreferenceKey.CURRENT_USER_PROFILE, JSON.stringify(profile)).toPromise();
                await this.preferences.putString(PreferenceKey.SUBSCRIBE_TOPICS, JSON.stringify(subscribeTopic)).toPromise();
            });
    }

    getFormattedDate(date: string | Date) {
        const inputDate = new Date(date).toDateString();
        const [, month, day, year] = inputDate.split(' ');
        const formattedDate = [day, month, year].join('-');
        return formattedDate;
    }

    isAccessibleForNonStudentRole(profileType) {
        return profileType === ProfileType.TEACHER ||
            profileType === ProfileType.OTHER ||
            profileType === ProfileType.ADMIN ||
            profileType === ProfileType.PARENT;
    }

    // public async getGivenPermissionStatus(permissions): Promise<AndroidPermissionsStatus> {
    //     return (
    //         await this.permissionService.checkPermissions([permissions]).toPromise()
    //     )[permissions];
    // }

    public async showSettingsPageToast(description: string, appName: string, pageId: string, isOnboardingCompleted: boolean) {
        let toast = await this.toastController.create({
            message: this.translateMessage(description, appName),
            cssClass: 'permissionSettingToast',
            buttons: [
                {
                    text: this.translateMessage('SETTINGS'),
                    role: 'cancel',
                    handler: () => { }
                }
            ],
            position: 'bottom',
            duration: 3000
        });

        toast = this.addPopupAccessibility(toast, this.translateMessage(description, appName));
        toast.setAttribute
        toast.present();

        toast.onWillDismiss().then((res) => {
            if (res.role === 'cancel') {
                this.telemetryGeneratorService.generateInteractTelemetry(
                    InteractType.TOUCH,
                    InteractSubtype.SETTINGS_CLICKED,
                    isOnboardingCompleted ? Environment.HOME : Environment.ONBOARDING,
                    pageId);
                this.router.navigate([`/${RouterLinks.SETTINGS}/${RouterLinks.PERMISSION}`], { state: { changePermissionAccess: true } });
            }
        });
    }

    public async buildPermissionPopover(
        handler: (selectedButton: string) => void,
        appName: string, whichPermission: string,
        permissionDescription: string, pageId, isOnboardingCompleted): Promise<HTMLIonPopoverElement> {
        return this.popOverCtrl.create({
            component: SbPopoverComponent,
            componentProps: {
                isNotShowCloseIcon: false,
                sbPopoverHeading: this.translateMessage('PERMISSION_REQUIRED'),
                sbPopoverMainTitle: this.translateMessage(whichPermission),
                actionsButtons: [
                    {
                        btntext: this.translateMessage('NOT_NOW'),
                        btnClass: 'popover-button-cancel',
                    },
                    {
                        btntext: this.translateMessage('ALLOW'),
                        btnClass: 'popover-button-allow',
                    }
                ],
                handler,
                img: {
                    path: './assets/imgs/ic_folder_open.png',
                },
                metaInfo: this.translateMessage(permissionDescription, appName),
            },
            cssClass: 'sb-popover sb-popover-permissions primary dw-active-downloads-popover',
        }).then((popover) => {
            this.telemetryGeneratorService.generateImpressionTelemetry(
                whichPermission === 'Camera' ? ImpressionType.CAMERA : ImpressionType.FILE_MANAGEMENT,
                pageId,
                PageId.PERMISSION_POPUP,
                isOnboardingCompleted ? Environment.HOME : Environment.ONBOARDING
            );
            return popover;
        });
    }

    async presentToastForOffline(msg: string) {
        this.toast = await this.toastController.create({
            duration: 3000,
            message: this.translateMessage(msg),
            buttons: [
                {
                    text: 'X',
                    role: 'cancel',
                    handler: () => { }
                }
            ],
            position: 'top',
            cssClass: ['toastHeader', 'offline']
        });
        await this.toast.present();
        this.toast.onDidDismiss(() => {
            this.toast = undefined;
        });
    }

    extractInitial(name) {
        let initial = '';
        if (name) {
            const splitter = new GraphemeSplitter();
            const split: string[] = splitter.splitGraphemes(name.trim());
            initial = split[0];
        }
        return initial;
    }

    async getStateList() {
        const req: LocationSearchCriteria = {
            from: CachedItemRequestSourceFrom.SERVER,
            filters: {
                type: loc.TYPE_STATE
            }
        };
        try {
            const stateList = await this.profileService.searchLocation(req).toPromise();
            return stateList || [];
        } catch {
            return [];
        }
    }

    async getDistrictList(id?: string, code?: string) {
        const req: LocationSearchCriteria = {
            from: CachedItemRequestSourceFrom.SERVER,
            filters: {
                type: loc.TYPE_DISTRICT,
                parentId: id || undefined,
                code: code || undefined
            }
        };
        try {
            const districtList = await this.profileService.searchLocation(req).toPromise();
            return districtList || [];
        } catch {
            return [];
        }
    }

    async handleAssessmentStatus(assessmentStatus) {
        const maxAttempt: MaxAttempt = {
            limitExceeded: false,
            isCloseButtonClicked: false,
            isLastAttempt: false
        };
        if (assessmentStatus && assessmentStatus.isContentDisabled) {
            maxAttempt.limitExceeded = true;
            this.showToast('FRMELMNTS_IMSG_LASTATTMPTEXCD');
            return maxAttempt;
        }
        if (assessmentStatus && assessmentStatus.isLastAttempt) {
            maxAttempt.isLastAttempt = true;
            return await this.showAssessmentLastAttemptPopup(maxAttempt);
        }
        return maxAttempt;
    }

    async showAssessmentLastAttemptPopup(maxAttempt?: MaxAttempt) {
        const confirm = await this.popOverCtrl.create({
            component: SbPopoverComponent,
            componentProps: {
                sbPopoverMainTitle: this.translateMessage('ASSESSMENT_LAST_ATTEMPT_MESSAGE'),
                showCloseBtn: true,
                actionsButtons: [
                    {
                        btntext: this.translateMessage('CONTINUE'),
                        btnClass: 'popover-color'
                    },
                ],
            },
            cssClass: 'sb-popover warning',
            backdropDismiss: false
        });
        await confirm.present();
        const { data } = await confirm.onDidDismiss();
        if (data && data.canDelete) {
            return maxAttempt;
        } else {
            maxAttempt.isCloseButtonClicked = true;
            return maxAttempt;
        }
    }

    public async populateGlobalCData() {
        const currentSelectedTabs = await this.preferences.getString(PreferenceKey.SELECTED_SWITCHABLE_TABS_CONFIG).toPromise();
        const correlationData: CorrelationData = {
            type: 'Tabs',
            id: (!currentSelectedTabs || currentSelectedTabs === SwitchableTabsConfig.RESOURCE_COURSE_TABS_CONFIG) ?
                'Library-Course' : 'Home-Discover'
        };
        this.telemetryService.populateGlobalCorRelationData([correlationData]);
    }

    private getPlatformBasedActiveElement(): HTMLElement {
        if (this.platform.is('android') && document.activeElement.shadowRoot != null) {
            return document.activeElement.shadowRoot.childNodes[0] as HTMLElement;
        } else {
            return document.activeElement as HTMLElement;
        }
    }

    private popupAccessibilityFocus(element: HTMLElement): void {
        setTimeout(() => {
            element.setAttribute('tabindex', '0');
            element.focus();
        }, 0);
    }

    public addPopupAccessibility(toast, message, id = 'sb-generic-toast') {
        if (!toast || !toast.setAttribute) {
            return toast;
        }

        toast.setAttribute('aria-label', message);
        toast.setAttribute('id', id);

        const toastElement = document.getElementById(id) as HTMLElement;
        const activeElement = this.getPlatformBasedActiveElement();

        // set focus on toast
        toast.addEventListener('ionToastWillPresent', () => {
            this.popupAccessibilityFocus(toastElement);
        });

        // reset focus
        toast.onDidDismiss().then(() => {
            this.popupAccessibilityFocus(activeElement);
        });

        return toast;
    }

    public setRatingStarAriaLabel(ratingDomTag, slectedStar = 0) {
        if (ratingDomTag && ratingDomTag.length && ratingDomTag[0].children && ratingDomTag[0].children.length) {
            const ratingStarContainer = ratingDomTag[0].children[0];
            ratingStarContainer.setAttribute('aria-label', (slectedStar > 0) ? `Rated ${slectedStar} star out of 5 stars` : 'Rate stars out of 5 stars');
            ratingStarContainer.setAttribute('tabindex', '0');
            if (ratingDomTag[0].children[0].children && ratingDomTag[0].children[0].children.length) {
                const ratingStars = ratingDomTag[0].children[0].children;
                for (let index = 0; index < ratingStars.length; index++) {
                    const element = ratingStars[index];
                    if (element && element.shadowRoot && element.shadowRoot.querySelector('button')) {
                        const starButton = element.shadowRoot.querySelector('button');
                        starButton.setAttribute('aria-label', (slectedStar >= index + 1 ? 'selected ' : '') + (index + 1) + 'out of five stars');
                        starButton.setAttribute('tabindex', '0');
                    }
                }
            }
        }
    }

    public appendTypeToPrimaryCategory(content, type = "detail"): string {
        const primaryCategory: string = content.primaryCategory ? content.primaryCategory : content.contentType ? content.contentType : '';
        return primaryCategory ? (primaryCategory.replace(/\s/g, '') + '-' + type).toLowerCase() : '';
    }

    public async getGuestUserConfig() {
        let guestProfile;
        await this.preferences.getString(PreferenceKey.GUEST_USER_ID_BEFORE_LOGIN).toPromise()
            .then(async (guestUserId: string) => {
                const allProfileDetais = await this.profileService.getAllProfiles().toPromise();
                guestProfile = allProfileDetais.find(ele => ele.uid === guestUserId);
            });
        return guestProfile;
    }

    // Used to convert file to base png, updated function to handle default image in consumption library.
    public async convertFileToBase64(file): Promise<Observable<string>> {
        let res = await fetch(file);
        let blob = await res.blob();
        return new Observable(res => {
            const reader = new FileReader();
            reader.onload = () => {
                res.next(reader.result as string);
                res.complete();
            }
            reader.readAsDataURL(blob);
        });
    }


addPreviesUrl(url: string) {
        if (!this.blockAddUrl) {
          if (url && !url.includes('viewer') && !url.includes('chapter') && !url.includes('overview') &&
              !(this.previesUrlList.length > 0 &&
                this.previesUrlList[this.previesUrlList.length - 1].includes(url))) {
            this.previesUrlList.push(url);
          }
        } else {
          this.blockAddUrl = false;
        }
      }

    get getPreviesUrl() {
        return this.previesUrlList.pop()
    }

    setShowNavBar(value: boolean) {
        this.showNavbarSubject.next(value);
      }

    isTablet(): boolean{
        return this.platform.is('tablet');
    }
}
