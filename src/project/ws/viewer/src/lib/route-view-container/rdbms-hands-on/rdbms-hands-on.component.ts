import { Component, Input } from '@angular/core'
import { NsContent } from '../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'

@Component({
  selector: 'viewer-rdbms-hands-on-container',
  templateUrl: './rdbms-hands-on.component.html',
  styleUrls: ['./rdbms-hands-on.component.scss'],
})
export class RdbmsHandsOnComponent {
  @Input() isFetchingDataComplete = false
  @Input() isErrorOccured = false
  @Input() rDbmsHandsOnData: NsContent.IContent | null = null
  @Input() rDbmsHandsOnManifest: any
  @Input() forPreview = false

  constructor() {}
}
