import {Component, OnInit} from '@angular/core';
import {CommonUtilService} from '../../../services';
import {NavParams} from '@ionic/angular';

@Component({
    selector: 'show-vendor-apps',
    templateUrl: './show-vendor-apps.component.html',
    styleUrls: ['./show-vendor-apps.component.scss'],
})
export class ShowVendorAppsComponent implements OnInit {
    appLists = [];
    content: any;
    appListAvailability = {};
    isAppListAvailable = false;
    appName = '';

    constructor(
        private navParams: NavParams,
        private commonUtilService: CommonUtilService
    ) {
        this.content = this.navParams.get('content');
        this.appLists = this.navParams.get('appLists');
    }

    async ngOnInit() {
        this.appName = await this.commonUtilService.getAppName();
        this.isAppListAvailable = Object.keys(this.appListAvailability).some((packageId) => {
            return this.appListAvailability[packageId];
        });
    }
}
