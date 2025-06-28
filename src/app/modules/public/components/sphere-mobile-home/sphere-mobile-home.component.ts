import { Component, OnInit, HostListener } from '@angular/core'
import { Router } from '@angular/router'
import { ScrollService } from '../../../../../app/modules/shared/services/scroll.service'
import { Platform } from '@ionic/angular';
import { ContentCorodovaService } from '../../../../../library/ws-widget/collection/src/public-api';
import { ValueService } from '../../../../../library/ws-widget/utils/src/lib/services/value.service';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';

@Component({
  selector: 'app-sphere-mobile-home',
  templateUrl: './sphere-mobile-home.component.html',
  styleUrls: ['./sphere-mobile-home.component.scss'],
})
export class SphereMobileHomeComponent implements OnInit {
  dataCarousel= [];
  isDataCarouselLoading = true;
  defaultlang = 'en'
  showCreateBtn = false
  bannerStats: any;
  isTablet = false;
  constructor(private router: Router, 
    private valueSvc: ValueService,
    public configSvc: ConfigurationsService,
    private scrollService: ScrollService,
    private platform: Platform,
    private ContentSvc: ContentCorodovaService,
  ) { }

  ngOnInit() {
    this.isTablet = this.platform.is('tablet');
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall && (this.configSvc.userProfile === null)) {
        this.showCreateBtn = true
      } else {
        this.showCreateBtn = false
      }
    });
    this.setHomeContent();
  }

  async setHomeContent(){
    this.isDataCarouselLoading = true;
    try {
      let sphereHomeContent:any = await localStorage.getItem('sphereHomeContent');
      if(sphereHomeContent){
        sphereHomeContent = JSON.parse(sphereHomeContent);
        this.dataCarousel= sphereHomeContent.public.content;
        this.bannerStats = sphereHomeContent.public.bannerStats;
        this.isDataCarouselLoading = false;
        this.setHomeContentByAPI();
      }else{
        this.setHomeContentByAPI();
      }
    } catch (error) {
      this.setHomeContentByAPI();
    }
  }

  setHomeContentByAPI(){
    this.ContentSvc.getHomeStaticContent().subscribe((_content:any)=>{
      this.dataCarousel= _content.private.content;
      this.bannerStats = _content.public.bannerStats;
      this.isDataCarouselLoading = false;
      localStorage.setItem('sphereHomeContent', JSON.stringify(_content));
    })
  }

  scrollParentToHowSphereWorks() {
    this.scrollService.scrollToDivEvent.emit('scrollToHowSphereWorks')
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall && (this.configSvc.userProfile === null)) {
        this.showCreateBtn = true
      } else {
        this.showCreateBtn = false
      }
    })
  }
  createAcct() {
    localStorage.removeItem('url_before_login')
    this.router.navigateByUrl('app/create-account')
  }

}
