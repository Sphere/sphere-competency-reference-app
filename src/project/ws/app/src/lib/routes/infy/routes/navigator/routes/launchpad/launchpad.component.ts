import { Component, OnInit } from '@angular/core'
import { NsContentStripMultiple } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/content-strip-multiple/content-strip-multiple.model'
import { NsWidgetResolver } from '../../../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.model'

@Component({
  selector: 'ws-app-launchpad',
  templateUrl: './launchpad.component.html',
  styleUrls: ['./launchpad.component.scss'],
})
export class LaunchpadComponent implements OnInit {
  coursesFetched = false
  coursesResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > = {
    widgetType: 'contentStrip',
    widgetSubType: 'contentStripMultiple',
    widgetData: {
      strips: [
        {
          key: '',
          preWidgets: [],
          title: '',
          filters: [],
          request: {
            ids: ['lex_auth_012612333141950464848'],
          },
        },
      ],
      loader: true,
    },
  }

  constructor() {
    this.coursesFetched = false
  }

  ngOnInit() { }
}
