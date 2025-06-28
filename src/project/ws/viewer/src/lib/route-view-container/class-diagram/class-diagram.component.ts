import { Component, Input } from '@angular/core'
import { NsContent } from '../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'

@Component({
  selector: 'viewer-class-diagram-container',
  templateUrl: './class-diagram.component.html',
  styleUrls: ['./class-diagram.component.scss'],
})
export class ClassDiagramComponent {
  @Input() isLtMedium = false
  @Input() forPreview = false
  @Input() isFetchingDataComplete = false
  @Input() isErrorOccured = false
  @Input() classDiagramData: NsContent.IContent | null = null
  @Input() classDiagramManifest: any

  constructor() {}
}
