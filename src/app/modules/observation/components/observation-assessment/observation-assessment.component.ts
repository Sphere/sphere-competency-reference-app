import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ObservationService } from '../../services/observation.service';
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
  selector: 'app-observation-assessment',
  templateUrl: './observation-assessment.component.html',
  styleUrls: ['./observation-assessment.component.scss'],
  encapsulation: ViewEncapsulation.None,
})


export class ObservationAssessmentComponent implements OnInit {

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
  menteeProgressURL = `${RouterLinks.MENTOR}/${RouterLinks.MENTEE_PROGRESS}`;
  timer: any;
  seconds: any;
  minutes: number;
  timerText: string;
  showTimer: boolean = true;
  startTimer: boolean = true;
  public result_percentage = 0;
  showChip = false
  
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
        this.getobservationDetails();
        if(!this.canSubmit){
          this.updatePreviuosSelection()
        }
      } else {
        this.router.navigate([this.menteeProgressURL]);
      }
    }else{
      this.router.navigate([this.menteeProgressURL]);
    }
  }

  ngOnInit() {
    if (!this.observationData) {
      this.router.navigate([this.menteeProgressURL]);
    }
    if (this.questionData && this.questionData.sections.length > 0) {
      this.currentSection = this.questionData.sections[this.currentSectionIndex];
    }
    this.progressbarValue = Math.ceil(((this.currentSectionIndex + 1) / this.questionData.sections.length) * 100);
    this.startTimer = !this.observationData.showTimer ? this.observationData.showTimer : true
    this.showTimer = !this.observationData.showTimer ? this.observationData.showTimer : true
    if(this.startTimer == undefined){
      this.startTimer = true;
      this.showTimer = true;
    }
    if(this.observationData.showResult){
      this.result_percentage = this.observationData.result_percentage || 0;
      this.showChip = true
    }
  }

  getTimer(){
    this.seconds = this.observationData.duration
    // this.seconds = 60
    this.minutes = Math.floor(this.seconds / 60);

    const timer = setInterval(() => {
      // Decrement seconds
      this.seconds--;

      // Update timer text
      if (this.seconds >= 0) {
        this.timerText = this.formatTime(this.seconds);
      } else {
        clearInterval(timer);
        this.timerText = "00:00";
        // once timer ends get back to the home screen
        if(this.startTimer){
          this.router.navigate(['page/home'])
        }
      }
    }, 1000); // Run every second (1000 milliseconds)
  }
  

   // Helper function to format time
   formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds}`;
  }
  scrollToTop() {
    let div = document.getElementById('observationQuestionSection');
    div.scroll({
      top: 0,
      behavior: 'smooth'
    });
  }

  getobservationDetails() {
    let urlParam = {
      mentee_id: this.observationData.mentee_id,
      submission_number: (this.canSubmit)? (this.observationData.attempted_count + 1):this.observationData.attempt_serial_number,
      observation_id: this.observationData.observation_id
    }
    let param = {
      users: this.observationData.mentor_id,
      roles: "MENTOR,MENTEE"
    }
    this.userObserSvc.getobservationDetails(urlParam, param).subscribe(
      (_res) => {
        if (_res && _res.result) {
          this.observationDetails = _res.result;
          if(this.startTimer){
            this.showTimer = true
            this.getTimer()
          }
          this.mapQuestions();
        } else {
          this.router.navigate([this.menteeProgressURL]);
        }
      },
      (error) => {
        this.router.navigate([this.menteeProgressURL]);
      }
    );
  }
  mapQuestions() {
    this.questionData.sections = [];
    this.observationDetails.assessment.evidences.map((_evidence) => {
      _evidence.sections.map((_section) => {
        let pageQuestions = [];
        _section.questions.map((_ques) => {
          pageQuestions = pageQuestions.concat(_ques.pageQuestions)
        })
        let tempSections = {
          externalId: _evidence.externalId,
          evidencesID: _evidence.code,
          sectionID: _section.code,
          name: _section.name,
          pageQuestions: pageQuestions
        }
        this.questionData.sections.push(tempSections);
      })
    })
    if (this.questionData && this.questionData.sections.length > 0) {
      this.currentSection = this.questionData.sections[this.currentSectionIndex];
      if(!this.canSubmit){
        this.mapAnswers()
      }
    }
    this.progressbarValue = Math.ceil(((this.currentSectionIndex + 1) / this.questionData.sections.length) * 100);
    this.valdateCurrentSection();
    this.scrollToTop();
    if (this.questionData.sections.length == this.currentSectionIndex + 1) {
      this.showSubmit = true;
    } else {
      this.showSubmit = false;
    }
  }

  previousQuestion() {
    if (this.currentSectionIndex > 0) {
      this.currentSectionIndex--;
      this.currentSection = this.questionData.sections[this.currentSectionIndex];
      this.progressbarValue = Math.ceil(((this.currentSectionIndex + 1) / this.questionData.sections.length) * 100);
    }
    if (this.currentSectionIndex == 0) {
      this.diablePrevious = true;
    } else {
      this.diablePrevious = false;
    }
    if (this.questionData.sections.length == this.currentSectionIndex + 1) {
      this.showSubmit = true;
    } else {
      this.showSubmit = false;
    }
    this.valdateCurrentSection();
    this.scrollToTop();
  }

  async nextQuestion() {
    this.isAnsSubmitting = true;
    if(this.canSubmit){
      await this.submitEvidences();
    }
    this.isAnsSubmitting = false;
    // get the current section question data 
    if (this.currentSectionIndex < this.questionData.sections.length - 1) {
      this.currentSectionIndex++;
      this.currentSection = this.questionData.sections[this.currentSectionIndex];
      this.mapAnswers();
    } else if (this.currentSectionIndex == this.questionData.sections.length - 1) {
      this.submit();
    }
    // show the last section with submit button
    if (this.questionData.sections.length == this.currentSectionIndex + 1) {
      this.showSubmit = true;
    } else {
      this.showSubmit = false;
    }

    // disable or enable previous button 
    if (this.currentSectionIndex == 0) {
      this.diablePrevious = true;
    } else {
      this.diablePrevious = false;
    }

    // section progress update
    this.progressbarValue = Math.ceil(((this.currentSectionIndex + 1) / this.questionData.sections.length) * 100);
    this.startTime = new Date().getTime();
    this.valdateCurrentSection();
    this.scrollToTop();
  }

  saveAnswer(answer, quesIndex) {
    if (this.currentSection.pageQuestions[quesIndex].responseType == 'multiselect') {
      let ans = [];
      answer.map((_ans) => {
        if (_ans.checked) {
          ans.push(_ans.value);
        }
      });
      this.currentSection.pageQuestions[quesIndex].value = ans;
    } else if (this.currentSection.pageQuestions[quesIndex].responseType == 'date') {
      if (answer) {
        let date = new Date(answer)
        this.currentSection.pageQuestions[quesIndex].value = date.toISOString();
      } else {
        this.currentSection.pageQuestions[quesIndex].value = '';
      }
    } else {
      this.currentSection.pageQuestions[quesIndex].value = answer;
    }
    this.questionData.sections[this.currentSectionIndex] = this.currentSection;
    this.valdateCurrentSection();
  }

  submitEvidences() {
    return new Promise((resolve) => {
      // let urlParam = {
      //   mentee_id: this.observationData.info.mentee_id,
      //   submissionNumber: 1,
      //   submission_id: this.observationDetails.assessment.submissionId
      // }
      // users: this.observationData.info.mentor_id,
      let param: any = {
        mentoring_relationship_id: this.observationData.mentoring_relationship_id,
        mentor_id: this.observationData.mentor_id,
        mentee_id: this.observationData.mentee_id,
        solution_id: this.observationData.solution_id,
        submission_id: this.observationDetails.assessment.submissionId,
        attempted_count: this.observationData.attempted_count + 1,
        observation_id: this.observationData.observation_id,
        submission_data:{
          evidence: {
            externalId: this.questionData.sections[this.currentSectionIndex].externalId,
            startTime: this.startTime,
            endTime: new Date().getTime(),
            answers: {
            }
          }
        }
      }
      let answers = {};
      this.currentSection.pageQuestions.map((_ques) => {
        answers[_ques._id] = {
          qid: _ques._id,
          options: _ques.options,
          questionType: _ques.questionType,
          value: _ques.value,
          remarks: "",
          fileName: [],
          gpsLocation: "",
          payload: {
            question: _ques.question,
            labels: [],
            responseType: _ques.responseType,
            filesNotUploaded: []
          },
          startTime: this.startTime,
          endTime: new Date().getTime(),
          criteriaId: _ques.payload.criteriaId,
          responseType: _ques.responseType,
          evidenceMethod: _ques.evidenceMethod,
          rubricLevel: _ques.rubricLevel
        }
      })
      param.submission_data.evidence.answers = answers;

      this.userObserSvc.submitObservation(param).subscribe((_result) => {
        resolve(true)
      }, (error) => {
        resolve(false)
      });
    });
  }

  submit() {
    const navigationExtras: NavigationExtras = {
      state: {
        observationDetails: { ...this.observationDetails },
        observationData: { ...this.observationData },
        canSubmit: this.canSubmit
      }
    };
    this.router.navigate([`${RouterLinks.MENTOR}/${RouterLinks.OBSERVATION_RESULTS}`], navigationExtras);
  }

  valdateCurrentSection() {
    this.isCurrentSectionFormValid = false;
    let flag: boolean = true;
    this.currentSection.pageQuestions.map((_ques) => {
      if (flag && _ques.value != null && _ques.value != '') {
        if (_ques.value.length == 0) {
          flag = false;
        }
      } else {
        flag = false;
      }
    });
    this.isCurrentSectionFormValid = flag;
  }

  showRequiredMessage() {
    this.commonUtilService.showToast('PLEASE_ANSWER_ALL_QUESTION');
  }

  updatePreviuosSelection(){
    if(this.observationData.user_submission && this.observationData.user_submission.evidence && this.observationData.user_submission.evidence.answers){
      this.previuosSelection = {...this.observationData.user_submission.evidence.answers};
    }
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

  navigateBack(){
   let prvurl = `${RouterLinks.MENTOR}/${RouterLinks.MENTEE_PROGRESS}`;
    if(this.showTimer){
      prvurl = 'page/home'
    }

   this.router.navigate([prvurl]);
  }


  
}
