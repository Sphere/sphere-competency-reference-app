import { Component, ViewChild, ElementRef, Input } from '@angular/core'
import { MatMenuTrigger } from '@angular/material/menu';
import { NSSearch } from '../../_services/widget-search.model'
import { TFetchStatus } from 'library/ws-widget/utils/src/lib/constants/misc.constants';

@Component({
  selector: 'ws-widget-tree-catalog-menu',
  templateUrl: './tree-catalog-menu.component.html',
  styleUrls: ['./tree-catalog-menu.component.scss'],
})
export class TreeCatalogMenuComponent {

  @ViewChild('childMenu', { static: true }) public childMenu!: ElementRef

  @Input() rootTrigger: MatMenuTrigger | null = null
  @Input() catalogItems: NSSearch.IFilterUnitContent[] | null = null
  @Input() fetchStatus: TFetchStatus = 'none'
  @Input() isRoot = false

}
