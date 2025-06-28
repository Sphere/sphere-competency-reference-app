import { Component, OnInit } from '@angular/core'
import { IFilterUnitContent } from '../../../search/models/search.model'
import { NsContent } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import { WidgetContentService } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service'

@Component({
  selector: 'ws-app-channels-home',
  templateUrl: './channels-home.component.html',
  styleUrls: ['./channels-home.component.scss'],
})
export class ChannelsHomeComponent implements OnInit {
  labelFilters: IFilterUnitContent[] = []
  categories: { [type: string]: NsContent.IContent[] } = {}
  constructor(private contentSvc: WidgetContentService) { }

  ngOnInit() {
    this.contentSvc.search({
    }).subscribe(response => {
      if (response.notToBeShownFilters) {
        const labels = response.notToBeShownFilters.find(unit => unit.type === 'labels')
        if (labels) {
          this.labelFilters = labels.content
        }
      }
    })
  }

  fetchChannel(label: IFilterUnitContent) {
    this.contentSvc.search({
      filters: {
        contentType: [NsContent.EContentTypes.CHANNEL],
        labels: label.type ? [label.type] : [],
      },
    }).subscribe(response => {
      this.categories[label.type || ''] = response.result
    })
  }

}
