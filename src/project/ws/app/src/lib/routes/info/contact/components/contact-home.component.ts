import { Component, OnInit } from '@angular/core'
import { NsPage } from '../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/page.model'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'

@Component({
  selector: 'ws-app-contact-home',
  templateUrl: './contact-home.component.html',
  styleUrls: ['./contact-home.component.scss'],
})
export class ContactHomeComponent implements OnInit {
  contactUsMail = 'information@aastrika.org'
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar

  constructor(private configSvc: ConfigurationsService) {}

  ngOnInit() {
    if (this.configSvc.instanceConfig) {
      this.contactUsMail = this.configSvc.instanceConfig.mailIds.contactUs
    }
  }
}
