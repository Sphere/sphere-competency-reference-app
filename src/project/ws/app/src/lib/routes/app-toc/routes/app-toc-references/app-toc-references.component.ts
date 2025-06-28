import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Data } from '@angular/router'
import { Subject, Subscription } from 'rxjs'
import { AppTocService } from '../../services/app-toc.service'
import { takeUntil } from 'rxjs/operators'
import _ from 'lodash'

@Component({
  selector: 'ws-app-app-toc-references',
  templateUrl: './app-toc-references.component.html',
  styleUrls: ['./app-toc-references.component.scss'],
})
export class AppTocReferencesComponent implements OnInit, OnDestroy {
  content: any = null
  references!: any
  routeSubscription: Subscription | null = null
  public loadRefrence  = true
   /*
* to unsubscribe the observable
*/
  public unsubscribe = new Subject<void>()
  
  constructor(public route: ActivatedRoute, private tocSharedSvc: AppTocService,

  ) { }

  ngOnInit() {
    this.tocSharedSvc.showComponent$.pipe(takeUntil(this.unsubscribe)).subscribe(item => {
      if (item && !_.get(item, 'showComponent')) {
        this.loadRefrence = item.showComponent
       
      } else {
        this.loadRefrence = true
      }
    })
    
    if (this.route && this.route.parent) {
      this.routeSubscription = this.route.parent.data.subscribe((data: Data) => {
        this.initData(data)
      })
    }
  }
  public async initData(data: Data) {
    const initData = await this.tocSharedSvc.initData(data)
    this.content = initData.content
    if (this.content && this.content.references) {
      this.references = JSON.parse(this.content.references)
    }
  }
  ngOnDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }

}
