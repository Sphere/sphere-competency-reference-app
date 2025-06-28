import { Component, Input } from '@angular/core'
import { NsContent } from '../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'

@Component({
  selector: 'viewer-hands-on-container',
  templateUrl: './hands-on.component.html',
  styleUrls: ['./hands-on.component.scss'],
})
export class HandsOnComponent {
  @Input() isFetchingDataComplete = false
  @Input() isErrorOccured = false
  @Input() handsOnData: NsContent.IContent | null = null
  @Input() handsOnManifest: any
  @Input() forPreview = false
  constructor() {}
}
