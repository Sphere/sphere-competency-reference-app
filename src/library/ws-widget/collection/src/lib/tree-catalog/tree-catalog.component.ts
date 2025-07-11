import { Component, OnInit, Input } from '@angular/core'
import { TreeCatalogService } from './tree-catalog.service'
import { NSCatalog } from './tree-catalog.model'
import { NSSearch } from '../_services/widget-search.model'
import { WidgetBaseComponent } from 'library/ws-widget/resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from 'library/ws-widget/resolver/src/lib/widget-resolver.model'
import { IWsTree } from '../tree/tree.model'
import { TFetchStatus } from 'library/ws-widget/utils/src/lib/constants/misc.constants'

@Component({
  selector: 'ws-widget-tree-catalog',
  templateUrl: './tree-catalog.component.html',
  styleUrls: ['./tree-catalog.component.scss'],
})
export class TreeCatalogComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<NSCatalog.ITreeCatalogData> {
  @Input() widgetData!: NSCatalog.ITreeCatalogData

  catalogTree: IWsTree[] | null = null
  catalogTreeFetchStatus: TFetchStatus = 'none'

  constructor(private catalogSvc: TreeCatalogService) {
    super()
  }

  ngOnInit() {
    this.catalogTreeFetchStatus = 'fetching'
    this.catalogSvc
      .getCatalog(this.widgetData.url, this.widgetData.type, this.widgetData.tags)
      .subscribe(
        (catalog: any[]) => {
          this.catalogTreeFetchStatus = 'done'
          if (catalog) {
            if (catalog.length === 1 && catalog[0].children) {
              this.catalogTree = catalog[0].children.map((item: NSSearch.IFilterUnitContent) => this.transformToTreeRecursive(item))
            } else {
              this.catalogTree = catalog.map(item => this.transformToTreeRecursive(item))
            }
          }
        },
        () => {
          this.catalogTreeFetchStatus = 'error'
        },
      )
  }

  private transformToTreeRecursive(catalog: NSSearch.IFilterUnitContent): IWsTree {
    // let catalogTypeForUrl = catalog.type || ''
    // if (catalog.type && catalog.type.startsWith('Common>')) {
    //   catalogTypeForUrl = catalog.type.slice(7)
    // }
    return {
      value: catalog.displayName,
      url: `${this.widgetData.baseClickUrl}/${encodeURIComponent(catalog.type || '')}`,
      children: (catalog.children || []).map(node => this.transformToTreeRecursive(node)),
    }
  }
}
