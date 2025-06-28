import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { RouterLinks } from '../../../../../app/app.constant';

interface Idisplay {
  button?: boolean,
  buttonName?: string,
  arrowbtn?: boolean,
  btnNavigation?: string,
  activeTab?: string
}

@Component({
  selector: 'app-mentor-cards',
  templateUrl: './mentor-cards.component.html',
  styleUrls: ['./mentor-cards.component.scss'],
})

export class MentorCardsComponent implements OnInit {
  @ViewChild('mentorCardCompRef') mentorCardCompRef: ElementRef;
  @Input() data: any;
  @Input() display: Idisplay = { button: false, buttonName: '', arrowbtn: false, btnNavigation: '', activeTab: 'inProgress' };
  @Input() showResult?:boolean = false;
  @Input() showCreatedAt?:boolean = false;
  @Input() showLastCreatedAt?:boolean = false;
  @Input() showResultWithPercentage?:boolean = false;
  @Input() showSechdule?:boolean = false;
  @Input() viewByLearner = false;

  public result_percentage = 0;
  public total_score =  0;
  public acquired_score =  0;
  public buttonElement: ElementRef;


  constructor(
    public router: Router,
  ) { }

  ngOnInit() { 
    if(this.showResult || this.showResultWithPercentage){
      this.result_percentage = this.data.result_percentage || 0;
      this.total_score =  this.data.total_score || 0;
      this.acquired_score =  this.data.acquired_score || 0;
    }
  }

  mentee(navigate) {
    const navigationExtras: NavigationExtras = {
      state: {
        cardData: { ...this.data },
        mentee_id: this.data.mentee_id,
        activeTab: this.display.activeTab || 'inProgress'
      }
    };
    this.router.navigate([navigate], navigationExtras);
  }

  attempListNavigation(navigate){
    const navigationExtras: NavigationExtras = {
      state: {
        cardData: { ...this.data },
        mentee_id: this.data.mentee_id,
      }
    };
    this.router.navigate([navigate], navigationExtras);
  }

  observation(data) {
    if ((data.toLowerCase() == 'start')|| (data.toLowerCase() == 'start now')) {
      const navigationExtras: NavigationExtras = {
        state: {
          observationData: { ...this.data },
          canSubmit: true
        }
      };
      this.router.navigate([`${RouterLinks.MENTOR}/${RouterLinks.VERIFY_MENTEE}`], navigationExtras);
    } else if (data.toLowerCase() == 'resume') {
      const navigationExtras: NavigationExtras = {
        state: {
          observationData: { ...this.data, showTimer: true },
          canSubmit: true
        }
      };
      this.router.navigate([`${RouterLinks.MENTOR}/${RouterLinks.OBSERVATION_ASSESSMENT}`], navigationExtras);
    } else if (data.toLowerCase() == 'view') {
      this.downloadObservation()
    }
  }

  downloadObservation() {
    const navigationExtras: NavigationExtras = {
      state: {
        observationData: { ...this.data, showTimer: false, showResult: true },
        canSubmit: false
      }
    };
    if(this.viewByLearner){
      this.router.navigate([`${RouterLinks.LEARNER_OBSERVATION}/${RouterLinks.OBSERVATION_REPORT}`], navigationExtras);
    } else {
      this.router.navigate([`${RouterLinks.MENTOR}/${RouterLinks.OBSERVATION_ASSESSMENT}`], navigationExtras);
    }
  }

}
