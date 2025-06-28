import { Component, OnInit, Input } from '@angular/core'
import { NsContent } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'

@Component({
  selector: 'ws-app-toc-certification-iap-card',
  templateUrl: './iap-card.component.html',
  styleUrls: ['./iap-card.component.scss'],
})
export class IapCardComponent implements OnInit {
  @Input() content?: NsContent.IContent

  constructor() {}

  ngOnInit() {}
}
