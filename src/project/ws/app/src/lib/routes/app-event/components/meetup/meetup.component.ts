import { Component, OnInit } from '@angular/core'
import { NsPage } from '../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/page.model'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { ValueService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/value.service'
import { Subscription } from 'rxjs'

@Component({
  selector: 'ws-app-meetup',
  templateUrl: './meetup.component.html',
  styleUrls: ['./meetup.component.scss'],
})
export class MeetupComponent implements OnInit {

  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  navBarTitle = 'Infosys Meetup Platform'
  screenSubscription: Subscription | null = null

  constructor(
    private configSvc: ConfigurationsService,
    private valSvc: ValueService,
  ) { }

  ngOnInit() {
    this.screenSubscription = this.valSvc.isLtMedium$.subscribe(isLtSMed => {
      if (isLtSMed) {
        this.navBarTitle = ''
      }
    })

    this.screenSubscription = this.valSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall) {
        this.navBarTitle = ''
      }
    })
  }

}
