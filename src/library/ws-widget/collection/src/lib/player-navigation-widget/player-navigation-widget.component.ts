import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerStateService } from '../../../../../../project/ws/viewer/src/lib/player-state.service';
import { AppGlobalService, Environment, InteractSubtype, InteractType, PageId, TelemetryGeneratorService } from '../../../../../../services';

@Component({
  selector: 'app-player-navigation-widget',
  templateUrl: './player-navigation-widget.component.html',
  styleUrls: ['./player-navigation-widget.component.scss'],
})
export class PlayerNavigationWidgetComponent implements OnInit, OnDestroy {

  viewerDataServiceSubscription: any
  prevResourceUrl: string | null = null
  nextResourceUrl: string | null = null
  currentCompletionPercentage: number | null = null
  isPlayBackBtnClicked: boolean = false;
  isPlayNextBtnClicked: boolean = false;

  constructor(
    private viewerDataSvc: PlayerStateService,
    private router: Router,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appGlobalService: AppGlobalService
  ) { }

  ngOnInit() {
    this.viewerDataServiceSubscription = this.viewerDataSvc.playerState.subscribe(data => {
      if (data) {
        this.prevResourceUrl = data.prevResource
        this.nextResourceUrl = data.nextResource
        this.currentCompletionPercentage = data.currentCompletionPercentage;
        const value = this.appGlobalService.getPlayButtonConfig();
        if (value) {
          this.isPlayBackBtnClicked = value?.isBackBtn;
          this.isPlayNextBtnClicked = value?.isNextBtn;
        }
        if(!this.isPlayNextBtnClicked && !this.isPlayBackBtnClicked) {
          this.isPlayNextBtnClicked = true;
        }
      }
    })
  }

  navigateToPreResource() {
    this.isPlayBackBtnClicked = true;
    this.isPlayNextBtnClicked = false;
    this.setBtnInfo(true, false);
    if (this.prevResourceUrl) {
      this.generateInteractTelemetry('previous', this.prevResourceUrl.split('/').pop())
      this.router.navigate([this.prevResourceUrl], { queryParamsHandling: 'preserve' })
    }
  }

  navigateToNextResource() {
    this.generateInteractTelemetry('next', this.nextResourceUrl.split('/').pop());
    this.router.navigate([this.nextResourceUrl ? this.nextResourceUrl : ''], { queryParamsHandling: 'preserve' })
  }

  navigateToNextContent() {
    this.isPlayNextBtnClicked = true;
    this.isPlayBackBtnClicked = false;
    this.setBtnInfo(false, true);
    if (this.isProgressCheck()) {
    this.router.navigate([this.nextResourceUrl], {
      queryParamsHandling: 'preserve'
    });
  } else {
    this.stopPropagation();
  }
    this.generateInteractTelemetry('next', this.nextResourceUrl.split('/').pop())
  }

  isProgressCheck(): boolean {
    return this.currentCompletionPercentage === 100;
  }
  stopPropagation() {
    return
  }

  generateInteractTelemetry(status, identifier?) {
    const value = new Map();
    value['identifier'] = identifier;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_CONTENT,
      `play-${status}-content`,
      Environment.PLAYER,
      PageId.COLLECTION_DETAIL,
      undefined,
      value
    )
  }

  setBtnInfo(isBack?, isNext?) {
    const value ={
      isBackBtn: isBack ? isBack :this.isPlayBackBtnClicked,
      isNextBtn: isNext ? isNext :this.isPlayNextBtnClicked,
    };
    this.appGlobalService.setPlayButtonConfig(value);
  }

  ngOnDestroy() {
    if (this.viewerDataServiceSubscription) {
      this.viewerDataServiceSubscription.unsubscribe();
    }
    this.setBtnInfo(false, false);
  }
}
