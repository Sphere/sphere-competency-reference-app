import { Component, OnInit } from '@angular/core'
import { IWsOcmJsonResponse } from '../../models/ocm.model'
import { ActivatedRoute } from '@angular/router'
import { NsWidgetResolver } from '../../../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.model'
import { ICarousel } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/models/sliders.model'
import { ConfigurationsService } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'

@Component({
  selector: 'ws-app-ocm-home',
  templateUrl: './ocm-home.component.html',
  styleUrls: ['./ocm-home.component.scss'],
})
export class OcmHomeComponent implements OnInit {
  pageTitle = ''
  widgetBannersRequest: NsWidgetResolver.IRenderConfigWithTypedData<ICarousel[]> | null = null
  ocmRequestData: IWsOcmJsonResponse | null = null
  errorFetchingJson = false

  constructor(private route: ActivatedRoute, public configSvc: ConfigurationsService) {}

  ngOnInit() {
    this.route.data.subscribe(response => {
      if (response.ocmJson.data) {
        this.ocmRequestData = response.ocmJson.data
        if (this.ocmRequestData) {
          this.pageTitle = this.ocmRequestData.pageTitle
          this.widgetBannersRequest = this.ocmRequestData.banners
        }
      } else if (response.ocmJson.error) {
        this.errorFetchingJson = true
      }
    })
  }
}
