import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfigurationsService } from '../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { NsTnc } from '../../../app/models/tnc.model'; 
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ws-tnc-renderer',
  templateUrl: './tnc-renderer.component.html',
  styleUrls: ['./tnc-renderer.component.scss'],
})
export class TncRendererComponent implements OnInit {
  @Input() tncData: NsTnc.ITnc | null = null
  @Input() showAccordian?: boolean = true
  @Output() tncChange = new EventEmitter<string>()
  @Output() dpChange = new EventEmitter<string>()

  generalTnc: NsTnc.ITncUnit | null = null
  dpTnc: NsTnc.ITncUnit | null = null
  termsOfUser = true

  // UI Vars
  currentPanel: 'tnc' | 'dp' = 'tnc'
  constructor(private configSvc: ConfigurationsService,private route: ActivatedRoute) {
    if (this.configSvc.restrictedFeatures) {
      if (this.configSvc.restrictedFeatures.has('termsOfUser')) {
        this.termsOfUser = false
      }
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (this.tncData) {
        this.assignGeneralAndDp();
        if (params['panel'] === 'dp' && this.dpTnc && !this.dpTnc.isAccepted) {
          this.currentPanel = 'dp';
        } else if (params['panel'] === 'tnc' && this.generalTnc && !this.generalTnc.isAccepted) {
          this.currentPanel = 'tnc';
        }
      }
    });
  }

  ngOnChanges() {
    if (this.tncData) {
      this.assignGeneralAndDp()
    }
  }
  private assignGeneralAndDp() {
    if (this.tncData) {
      this.tncData.termsAndConditions.forEach(tnc => {
        if (tnc.name === 'Generic T&C') {
          this.generalTnc = tnc
        } else {
          this.dpTnc = tnc
        }
      })
    }
  }

  reCenterPanel() {
    const tncPointer = document.getElementById('tnc')
    if (tncPointer) {
      tncPointer.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  changeTncLang(locale: string) {
    this.tncChange.emit(locale)
  }
  changeDpLang(locale: string) {
    this.dpChange.emit(locale)
  }
}
