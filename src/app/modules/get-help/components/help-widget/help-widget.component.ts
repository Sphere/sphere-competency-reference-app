import { DOCUMENT, Location } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { Router,NavigationEnd } from '@angular/router';
import { Subject, from, timer } from 'rxjs';
import { concatMap, tap,filter, pairwise, takeUntil } from 'rxjs/operators';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { CommonUtilService } from '../../../../../services';
@Component({
  selector: 'app-help-widget',
  templateUrl: './help-widget.component.html',
  styleUrls: ['./help-widget.component.scss'],
})
export class helpWidgetComponent implements OnInit {
  isCommonChatEnabled = true;
  previousRoute: string;
  isLoadingFcWidget = true;
  private destroy$ = new Subject<void>();
  constructor(
    public configSvc: ConfigurationsService,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private location: Location,
    private iab: InAppBrowser,
    private commonUtilService: CommonUtilService,
  ) {}

  ngOnInit() {
    this.router.events
    .pipe(
      takeUntil(this.destroy$),
      filter(event => event instanceof NavigationEnd),
      pairwise(),
      tap(([previousEvent, currentEvent]: [NavigationEnd, NavigationEnd]) => {
        this.previousRoute = previousEvent.urlAfterRedirects || previousEvent.url;
        const isHelpPage = this.previousRoute.includes('app/get-help');
        if (!isHelpPage) {
          this.hideFcWidget();
        }
      })
    )
    .subscribe();
    this.showSocialChats()
      .pipe(
        concatMap(() => this.fcSettingsFunc())
      )
      .subscribe();
  }
  hideFcWidget() {
    const fcWidget = window.fcWidget;
    if (fcWidget) {
      fcWidget.hide();
    }
  }
  fcSettingsFunc() {
    try {
      if (window.fcWidget) {
        const fcWidget = window.fcWidget;
        const userProfile = this.configSvc.userProfile;
        if (userProfile) {
          const { firstName, lastName, phone, userId, userName } = userProfile;
          fcWidget.user.setFirstName(firstName);
          fcWidget.user.setLastName(lastName);
          fcWidget.user.setPhone(phone);
          fcWidget.user.setMeta({ userId, username: userName });
        }
      }
    } catch (error) {
      // console.log(error);
    }

    return timer(0); // Return a timer to mimic completion
  }

  showSocialChats() {
    this.commonUtilService.addLoader()
    const script = this.renderer2.createElement('script');
    script.src = '//in.fw-cdn.com/30492305/271953.js';

    return from(new Promise<void>((resolve, reject) => {
      try {
        setTimeout(() => {
          const fcWidget = window.fcWidget;
          if (fcWidget) {
            fcWidget.init();
            fcWidget.setConfig({ headerProperty: { hideChatButton: true } });
          }
        }, 200);
        const script = this.renderer2.createElement('script');
        script.src = '//in.fw-cdn.com/30492305/271953.js';

        script.onload = () => {
          const fcWidget = window.fcWidget;
          if (fcWidget) {
            fcWidget.show();
            fcWidget.setConfig({ headerProperty: { hideChatButton: true } });
            this.isLoadingFcWidget = false
            this.commonUtilService.removeLoader()
          }
          resolve();
        };
        this.renderer2.appendChild(this.document.body, script);
      } catch (error) {
        // console.log(error);
        this.isLoadingFcWidget = false
        reject(error);
      }
    }));
  }

  backToChatIcon() {
    const fcWidget = window.fcWidget;
    if (fcWidget) {
      fcWidget.hide();
    }
    this.commonUtilService.blockAddUrl = true
    const previousRoute = this.commonUtilService.getPreviesUrl
    if (previousRoute) {
      this.router.navigateByUrl(previousRoute);
      this.isCommonChatEnabled = false;
    }
  }
  openWhatsApp(event: Event) {
    event.preventDefault();
    const url = 'https://wa.me/919632013414?text=Hi';
    const target = '_system';
    const options = 'location=yes';
    this.iab.create(url, target, options);
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.hideFcWidget()
  }
}
