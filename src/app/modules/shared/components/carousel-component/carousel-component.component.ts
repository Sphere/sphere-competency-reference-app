import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ScrollService } from '../../../../../app/modules/shared/services/scroll.service'
import { IonSlides, Platform } from '@ionic/angular';
import { Environment, InteractType, PageId, TelemetryGeneratorService } from '../../../../../services';

@Component({
  selector: 'app-carousel-component',
  templateUrl: './carousel-component.component.html',
  styleUrls: ['./carousel-component.component.scss'],
})
export class CarouselComponentComponent implements OnInit {
  @ViewChild(IonSlides) slides: IonSlides;
  
  @Input()  dataCarousel;
  @Input()  lang;
  public deafaultLan = 'en';

  currentSlideIndex = 0;
  slideOpts = {
    initialSlide: 0,
    speed: 250,
    autoplay: {
      delay: 6000,
      disableOnInteraction: false
    },
    loop: true,
  };
  isTablet = false;  
  constructor(   
     private scrollService: ScrollService,
     public platform: Platform,
     private telemetryGeneratorService: TelemetryGeneratorService
  ) { }

  ngOnInit(): void {
    this.isTablet = this.platform.is('tablet');
    this.platform.ready().then(() => {
      this.deafaultLan = (this.lang)?this.lang:'en';
    });
  }

  scrollToContent(data) {
    this.scrollService.scrollToDivEvent.emit(data)
    this.generateInteractTelemetry('scroll-to-banner-content');
  }

  generateInteractTelemetry(action) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      action,
      Environment.HOME,
      PageId.USER_HOME
    )
  }

}
