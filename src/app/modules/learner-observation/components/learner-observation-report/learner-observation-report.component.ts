import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ObservationService } from '../../../observation/services/observation.service';
import { RouterLinks } from '../../../../../app/app.constant';
import { CommonUtilService } from '../../../../../services';

interface Question {
  [x: string]: any;
  question: string[];
  questionId: string;
  responseType: string;
  questionNumber: string;
  options?: { value: string; label: string }[];
}

interface Section {
  sectionID: string;
  pageQuestions: Question[];
}
@Component({
  selector: 'app-learner-observation-report',
  templateUrl: './learner-observation-report.component.html',
  styleUrls: ['./learner-observation-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
})


export class LearnerObservationReporteComponent implements OnInit {

  diablePrevious = true;
  disableNext = false;
  observationData: any;
  observationDetails: any;
  activeEvidencesIndex = 0;
  totalEvidencesIndexs = 0;
  showSubmit = false;
  progressbarValue = 0;
  sliderlength: any;
  startTime = new Date().getTime();
  previuosSelection:any = {};

  questionData: any = {
    sections: []
  };
  currentSectionIndex: number = 0; // Track the current section index
  currentSection: Section | undefined; // Store the current section data
  isAnsSubmitting: boolean = false;
  isCurrentSectionFormValid: boolean = false;
  canSubmit:boolean = false;
  menteeProgressURL = `${RouterLinks.LEARNER_OBSERVATION}/completed`;
  seconds: any;
  minutes: number;
  showTimer: boolean = false;
  public result_percentage = 0;
  showChip = false
  redirectUrl = `/app/${RouterLinks.LEARNER_OBSERVATION}/completed`;

  constructor(
    private router: Router,
    public userObserSvc: ObservationService,
    private commonUtilService: CommonUtilService,
  ) {
    const currentNavigation = this.router.getCurrentNavigation();
    if (currentNavigation && currentNavigation.extras && currentNavigation.extras.state){
      if (currentNavigation.extras.state?.canSubmit) {
        this.canSubmit = currentNavigation.extras.state.canSubmit;
      }else{
        this.canSubmit = false;
      }
      if (currentNavigation.extras.state?.observationData) {
        this.observationData = currentNavigation.extras.state?.observationData;
        this.manageQuestions();
      } else {
        this.router.navigate([this.menteeProgressURL]);
      }
    }else{
      this.router.navigate([this.menteeProgressURL]);
    }
  }

  navigateBack(){
    this.router.navigate([this.menteeProgressURL]);
  }

  ngOnInit() {
    if (!this.observationData) {
      this.router.navigate([this.menteeProgressURL]);
    }
    if (this.questionData && this.questionData.sections.length > 0) {
      this.currentSection = this.questionData.sections[this.currentSectionIndex];
    }
    this.progressbarValue = Math.ceil(((this.currentSectionIndex + 1) / this.questionData.sections.length) * 100);

    if(this.observationData.showResult){
      this.result_percentage = this.observationData.result_percentage || 0;
      this.showChip = true
    }
  }

  manageQuestions(){
    this.questionData.sections = [];
    let questions = this.observationData.user_submission.evidence.answers;
    questions = Object.values(questions);

    questions.map((_row, _index)=>{
      questions[_index].questionNumber = _index+1;
      questions[_index].question = _row.payload.question;
    });
    let tempSections = {
      externalId: '',
      evidencesID: '',
      sectionID: '',
      name: '',
      pageQuestions: questions
    }
    this.questionData.sections.push(tempSections);
  }

  mapAnswers(){
    if(this.currentSection && this.currentSection.pageQuestions){
      this.currentSection.pageQuestions.map((_ques, index)=>{
        if(this.previuosSelection[_ques._id] != undefined){
          this.currentSection.pageQuestions[index].value = this.previuosSelection[_ques._id].value;
        }
      })
    }
  }
  
}
