import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router'
import { interval, Subject, Subscription } from 'rxjs'
import { map } from 'rxjs/operators'
import { FetchStatus } from '../../quiz.component'
import { NSQuiz } from '../../quiz.model'
import { QuizService } from '../../quiz.service'

declare var $: any
import * as _ from 'lodash'
import { ViewerUtilService } from '../../../../viewer-util.service'
import { EnqueueService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/enqueue.service';
import { ValueService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/value.service';
import { WidgetContentService } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service';
@Component({
  selector: 'viewer-quiz-modal',
  templateUrl: './quiz-modal.component.html',
  styleUrls: ['./quiz-modal.component.scss'],
  // tslint:disable-next-line:use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
})
export class QuizModalComponent implements OnInit, AfterViewInit, OnDestroy {
  isXSmall$ = this.valueSvc.isXSmall$
  timeLeft = 0
  startTime = 0
  tabIndex = 0
  isIdeal = false
  totalQuestion = 0
  activeIndex = 0
  numCorrectAnswers = 0
  numIncorrectAnswers = 0
  numUnanswered = 0
  passPercentage = 0
  result = 0
  progressbarValue = 0
  isCompleted = false
  fetchingResultsStatus: FetchStatus = 'none'
  questionAnswerHash: any = {}
  timerSubscription: Subscription | null = null
  dialog: any
  tabActive = false
  userAnswer: any
  showAnswer = false
  disableSubmit = true
  /*
* to unsubscribe the observable
*/
  public unsubscribe = new Subject<void>()
  // tslint:disable-next-line: allow-leading-underscore
  public activeSlideIndex = 0

  viewState: NSQuiz.TQuizViewMode = 'initial'
  constructor(
    public dialogRef: MatDialogRef<QuizModalComponent>,
    @Inject(MAT_DIALOG_DATA) public assesmentdata: any,
    public quizService: QuizService,
    public route: ActivatedRoute,
    private valueSvc: ValueService,
    private snackBar: MatSnackBar,
    private enqueueService: EnqueueService,
    private viewerSvc: ViewerUtilService,
    private contentSvc: WidgetContentService,
  ) {

  }
  ngAfterViewInit() {
    if (this.assesmentdata.questions.questions[0].questionType === 'mtf') {
      this.updateQuestionType(true)
    }
  }
  updateQuestionType(status: any) {
    this.quizService.updateMtf.next(status)
  }
  ngOnInit() {
    this.timeLeft = this.assesmentdata.questions.timeLimit
    this.startTime = Date.now()
    this.timer(this.timeLeft)
    this.totalQuestion = Object.keys(this.assesmentdata.questions.questions).length
    // this.progressbarValue = this.totalQuestion
    this.questionAnswerHash = {}
  }

  closePopup() {
    this.dialogRef.close({ event: 'CLOSE' })
  }
  closeDone() {
    this.dialogRef.close({ event: 'DONE' })
  }
  retakeQuiz() {
    this.dialogRef.close({ event: 'RETAKE_QUIZ' })
  }

  timer(data: any) {
    if (data > -1) {
      this.timerSubscription = interval(100)
        .pipe(
          map(
            () =>
              this.startTime + this.assesmentdata.questions.timeLimit - Date.now(),
          ),
        )
        .subscribe(_timeRemaining => {
          this.timeLeft -= 0.1
          if (this.timeLeft < 0) {
            this.isIdeal = true
            this.timeLeft = 0
            if (this.timerSubscription) {
              this.timerSubscription.unsubscribe()
            }
            this.tabIndex = 1
            this.tabActive = true
          }
        })
    }
  }

  fillSelectedItems(question: NSQuiz.IQuestion, optionId: string, qindex: number) {
    if (
      this.questionAnswerHash[question.questionId] &&
      question.multiSelection
    ) {
      const questionIndex = this.questionAnswerHash[question.questionId].indexOf(optionId)
      if (questionIndex === -1) {
        this.questionAnswerHash[question.questionId].push(optionId)
      } else {
        this.questionAnswerHash[question.questionId].splice(questionIndex, 1)
      }
      if (!this.questionAnswerHash[question.questionId].length) {
        delete this.questionAnswerHash[question.questionId]
      }
    } else {
      this.questionAnswerHash[question.questionId] = [optionId]
    }
    this.questionAnswerHash['qslideIndex'] = qindex
    this.disableSubmit = false
  }

  proceedToSubmit() {
    this.submitQuiz()
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

  submitQuiz() {
    if (navigator.onLine) {
      this.submitOnlineQuiz();
    } else {
      this.submitOfflineQuiz();
    }
  }
  
  submitOnlineQuiz() {
    this.ngOnDestroy();
    const submitQuizJson = JSON.parse(JSON.stringify(this.assesmentdata.questions));
    this.fetchingResultsStatus = 'fetching';
    const requestData = this.prepareRequestData(submitQuizJson);
    this.quizService.submitQuizV2(requestData).subscribe(
      (res: NSQuiz.IQuizSubmitResponse) => {
        this.handleOnlineSubmissionSuccess(res);
      },
      (_error: any) => {
        this.handleOnlineSubmissionError();
      }
    );
  }
  
  async submitOfflineQuiz() {
    this.ngOnDestroy();
  
    const submitQuizJson = JSON.parse(JSON.stringify(this.assesmentdata.questions));
    this.fetchingResultsStatus = 'fetching';
  
    const requestData = this.prepareRequestData(submitQuizJson);
  
    // Adjusting URL for offline submission
    requestData['artifactUrl'] = this.assesmentdata.generalData.artifactUrl;
  
    // Enqueueing offline submission
    this.enqueueService.assementEnqueue(
      requestData['contentId'],
      requestData['courseId'],
      requestData['batchId'],
      requestData
    );
    await this.calculateResults()
      let completionPercentage =0
      if(this.isCompleted){
        completionPercentage = 100
      }else {
        completionPercentage = 0
      }
      const mocksqliteData = await this.viewerSvc.generateProgressAPIBySqllite(
        requestData['contentId'],
        requestData['batchId'],
        requestData['courseId'],
        requestData['courseId'],
      'video/mp4',
      completionPercentage )
      console.log('mocksqliteData',mocksqliteData)
      this.contentSvc.changeMessage(
          {
            type: 'assessment',
            progressData: mocksqliteData.result
          }
      )
  }
  
  prepareRequestData(submitQuizJson: any): NSQuiz.IQuizSubmitRequest {
    const timeLimit = this.assesmentdata.questions.timeLimit * 1000;
    const requestData: NSQuiz.IQuizSubmitRequest = this.quizService.createAssessmentSubmitRequest(
      this.assesmentdata.generalData.identifier,
      this.assesmentdata.generalData.name,
      { ...submitQuizJson, timeLimit },
      this.questionAnswerHash
    );
    requestData['artifactUrl'] = this.assesmentdata.generalData.artifactUrl
    requestData['contentId'] = this.assesmentdata.generalData.identifier;
    requestData['courseId'] = this.assesmentdata.generalData.collectionId;
    requestData['batchId'] = this.route.snapshot.queryParams.batchId;
    requestData['userId'] = localStorage.getItem('userUUID');
  
    return this.quizService.sanitizeAssessmentSubmitRequest(requestData);
  }
  
  handleOnlineSubmissionSuccess(res: NSQuiz.IQuizSubmitResponse) {
    window.scrollTo(0, 0);
    if (this.assesmentdata.questions.isAssessment) {
      this.isIdeal = true;
    }
    this.fetchingResultsStatus = 'done';
    this.numCorrectAnswers = res.correct;
    this.numIncorrectAnswers = res.inCorrect;
    this.numUnanswered = res.blank;
    this.passPercentage = this.assesmentdata.generalData.collectionId === 'lex_auth_0131241730330624000' ? 70 : res.passPercent; // NQOCN Course ID
    this.result = _.round(res.result);
    this.tabIndex = 1;
    this.tabActive = true;
    if (this.result >= this.passPercentage) {
      this.isCompleted = true;
    }
  }
  
  handleOnlineSubmissionError() {
    this.openSnackbar('Something went wrong! Unable to submit.');
    this.fetchingResultsStatus = 'error';
  }
  

  public async calculateResults() {
    this.numCorrectAnswers = 0;
    this.numIncorrectAnswers = 0;
    this.numUnanswered = 0;
    const passPercentage = this.assesmentdata.questions.passPercentage || 0;
    this.assesmentdata.questions.questions.forEach((question: NSQuiz.IQuestion) => {
      const result = this.calculateQuestionResult(question);

      if (result.correct) {
        this.numCorrectAnswers++;
      } else if (result.incorrect) {
        this.numIncorrectAnswers++;
      } else {
        this.numUnanswered++;
      }
    });

    /* Calculate the percentage */
     /* Calculate the percentage */
     this.result =  passPercentage === 0 ? 100 : Math.round((this.numCorrectAnswers /this.quizService.questionState.slides.length) * 100);
     console.log(`Percentage Correct: ${this.result}%`);
     if (this.result >= passPercentage) {
       this.isCompleted = true
     }
     this.tabIndex = 1
     this.tabActive = true
    
  }
 
  calculateQuestionResult(question: NSQuiz.IQuestion): { correct: boolean; incorrect: boolean; unanswered: boolean } {
    const correctOptions = question.options.filter(option => option.isCorrect);
    let selectedOptions = this.questionAnswerHash[question.questionId] || [];
    let correctFlag = true;
    let unTouched = false;
    if (question.questionType === 'fitb' && selectedOptions.length > 0) {
      selectedOptions = selectedOptions[0].split(',') || [];
      unTouched = selectedOptions.length < 1;
      if (!unTouched && correctOptions.length !== selectedOptions.length) {
        correctFlag = false;
      }
      if (correctFlag && !unTouched) {
        for (let i = 0; i < correctOptions.length; i++) {
          /* Explicitly cast to string and then use trim */
          if ((correctOptions[i].text as string).trim().toLowerCase() !== selectedOptions[i].trim().toLowerCase()) {
            correctFlag = false;
            break;
          }
        }
      }
      if (correctFlag && !unTouched) {
        return { correct: true, incorrect: false, unanswered: false };
      } else if (!unTouched) {
        return { correct: false, incorrect: true, unanswered: false };
      }
    } else if (question.questionType === 'mtf' && selectedOptions.length > 0 && selectedOptions[0].length > 0) {
      unTouched = selectedOptions[0].length < correctOptions.length;

      if (selectedOptions && selectedOptions[0]) {
        selectedOptions[0].forEach(element => {
          const b = element.sourceId;
          if (correctOptions) {
            const option = correctOptions[(b.slice(-1) as number) - 1] || { match: '' };
            const match = option.match;

            if (match && match.trim() === element.target.innerHTML.trim()) {
              element.setPaintStyle({
                stroke: '#357a38',
              });
            } else {
              element.setPaintStyle({
                stroke: '#f44336',
              });
              correctFlag = false;
            }
          }
        });
      }

      if (correctFlag && !unTouched) {
        return { correct: true, incorrect: false, unanswered: false };
      } else if (!unTouched) {
        return { correct: false, incorrect: true, unanswered: false };
      }
    } else {
      selectedOptions = selectedOptions.sort().join(',');
      const correctOptionsString = correctOptions.sort().map(option => option.optionId).join(',');

      if (correctOptionsString === selectedOptions) {
        return { correct: true, incorrect: false, unanswered: false };
      } else if (selectedOptions.length > 0) {
        return { correct: false, incorrect: true, unanswered: false };
      }
    }

    return { correct: false, incorrect: false, unanswered: true };
  }
  checkAnswer() {
    // tslint:disable-next-line: max-line-length
    if (this.assesmentdata.questions.questions[this.questionAnswerHash['qslideIndex']] && this.assesmentdata.questions.questions[this.questionAnswerHash['qslideIndex']].questionType === 'mtf') {
      const submitQuizJson = JSON.parse(JSON.stringify(this.assesmentdata.questions))
      this.userAnswer = {}
      this.userAnswer = this.quizService.checkMtfAnswer(submitQuizJson, this.questionAnswerHash)
      this.tabIndex = 2
      this.questionAnswerHash[this.userAnswer.questionId] = this.userAnswer.answer
      this.updateQuestionType(false)
    } else {
      const submitQuizJson = JSON.parse(JSON.stringify(this.assesmentdata.questions))
      this.userAnswer = {}
      this.userAnswer = this.quizService.checkAnswer(submitQuizJson, this.questionAnswerHash)
      this.tabIndex = 2
      this.updateQuestionType(false)
    }

  }
  nextQuestion() {

    this.progressbarValue += 100 / this.totalQuestion
    if (
      this.questionAnswerHash['qslideIndex']
      === (this.quizService.questionState.slides.length - 1)) {
      this.proceedToSubmit()
      return
    }
    if (this.fetchingResultsStatus !== 'error') {
      this.tabIndex = 0
    }
    this.disableSubmit = true
    const oldSlide = this.quizService.questionState.slides[this.questionAnswerHash['qslideIndex']]
    $(oldSlide).fadeOut('fast', () => {
      $(oldSlide).hide()
      for (let i = 0; i < this.quizService.questionState.slides.length; i += 1) {
        const slide = this.quizService.questionState.slides[i]
        $(slide).hide()
      }
      this.activeSlideIndex += 1
      const newSlide = this.quizService.questionState.slides[this.questionAnswerHash['qslideIndex'] + 1]
      $(newSlide).fadeIn('fast', () => {
        $(newSlide).show()
      })
    })
    setTimeout(() => {
      // tslint:disable-next-line: max-line-length
      if (this.assesmentdata.questions.questions[this.questionAnswerHash['qslideIndex'] + 1] && this.assesmentdata.questions.questions[this.questionAnswerHash['qslideIndex'] + 1].questionType === 'mtf') {
        this.updateQuestionType(true)
      } else {
        this.updateQuestionType(false)
      }
    },         500)
  }
  previousQuestion() {
    this.progressbarValue -= 100 / this.totalQuestion
    if (this.quizService.questionState.active_slide_index === 0) {
      return
    }
    const oldSlide = this.quizService.questionState.slides[this.quizService.questionState.active_slide_index]
    $(oldSlide).fadeOut('fast', () => {
      $(oldSlide).hide()
      for (let i = 0; i < this.quizService.questionState.slides.length; i += 1) {
        const slide = this.quizService.questionState.slides[i]
        $(slide).hide()
      }
      this.quizService.questionState.active_slide_index -= 1
      const newSlide = this.quizService.questionState.slides[this.quizService.questionState.active_slide_index]
      $(newSlide).fadeIn('fast', () => {
        $(newSlide).show()
      })
    })
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe()
    }
    this.startTime = 0
    this.timeLeft = 0
  }

}
