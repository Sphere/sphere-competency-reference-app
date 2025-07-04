import { Inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { NSQuiz } from './quiz.model'
import { BehaviorSubject, Observable } from 'rxjs'
import * as _ from 'lodash'
import { CordovaHttpService } from '../../../../../../../app/modules/core/services/cordova-http.service'
import { ToastService } from '../../../../../../../app/manage-learn/core'
import { ModalController } from '@ionic/angular'
import { AuthService, DeviceInfo, SharedPreferences } from '@project-sunbird/sunbird-sdk'
import { HTTP } from '@awesome-cordova-plugins/http/ngx'
import { ConfigurationsService } from '../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { buildConfig } from '../../../../../../../../configurations/configuration'
import { API_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})

export class QuizService extends CordovaHttpService {
  questionState: any
  public updateMtf = new BehaviorSubject<any>(undefined)
  public updateMtf$ = this.updateMtf.asObservable()
  constructor(
    public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences: SharedPreferences,
    public ionicHttp: HTTP,
    public configSvc: ConfigurationsService,
  ) {
    super(http, toast, modalController, authService, deviceInfo, preferences, ionicHttp);
    this.baseUrl = 'https://'+buildConfig.SITEPATH
  }
  submitQuizV2(req: NSQuiz.IQuizSubmitRequest): Observable<NSQuiz.IQuizSubmitResponse> {
    const options = {
      url: `${API_END_POINTS.ASSESSMENT_SUBMIT_V2}`,
      payload: req
    };
    return this.post(options)
    // return this.http.post<NSQuiz.IQuizSubmitResponse>(API_END_POINTS.ASSESSMENT_SUBMIT_V2, req)
  }
  competencySubmitQuizV2(req: NSQuiz.IQuizSubmitRequest): Observable<NSQuiz.IQuizSubmitResponse> {
    const options = {
      url: `${API_END_POINTS.COMPETENCY_ASSESSMENT_SUBMIT_V2}`,
      payload: req
    };
    return this.post(options)
    // return this.http.post<NSQuiz.IQuizSubmitResponse>(API_END_POINTS.COMPETENCY_ASSESSMENT_SUBMIT_V2, req)
  }

  updatePassbook(passbookBody: any, userId) {
    const options = {
      url: `${API_END_POINTS.UPDATE_PASSBOOK}`,
      payload: passbookBody,
      header: userId ?   {'x-authenticated-userid': userId } : ''
    };
    return this.patch(options)
    // return this.http.patch(`${API_END_POINTS.UPDATE_PASSBOOK}`, passbookBody)
  }
  createAssessmentSubmitRequest(
    identifier: string,
    title: string,
    quiz: NSQuiz.IQuiz,
    questionAnswerHash: { [questionId: string]: any[] },
  ): NSQuiz.IQuizSubmitRequest {
    const quizWithAnswers = {
      ...quiz,
      identifier,
      title,
    }
    quizWithAnswers.questions.map(question => {
      if (
        question.questionType === undefined ||
        question.questionType === 'mcq-mca' ||
        question.questionType === 'mcq-sca'
      ) {
        return question.options.map(option => {
          if (questionAnswerHash[question.questionId]) {
            option.userSelected = questionAnswerHash[question.questionId].includes(option.optionId)
          } else {
            option.userSelected = false
          }
          return option
        })
      } if (question.questionType === 'fitb') {
        for (let i = 0; i < question.options.length; i += 1) {
          if (questionAnswerHash[question.questionId]) {
            question.options[i].response = questionAnswerHash[question.questionId][0].split(',')[i]
          }
        }
      } else if (question.questionType === 'mtf') {
        question.options = questionAnswerHash[question.questionId]
      }
      return question
    })
    return quizWithAnswers
  }

  /* check each question is it correct or wrong */
  checkAnswer(
    quiz: NSQuiz.IQuiz,
    questionAnswerHash: any,
  ) {
    const userSelectedAnswer = quiz.questions[questionAnswerHash['qslideIndex']]
    userSelectedAnswer['isCorrect'] = false
    userSelectedAnswer.options.map(option => {
      if (option.isCorrect) {
        userSelectedAnswer['answer'] = option.text
      }
      if (questionAnswerHash[_.get(userSelectedAnswer, 'questionId')]) {
        option.userSelected = questionAnswerHash[userSelectedAnswer.questionId].includes(option.optionId)
      } else {
        option.userSelected = false
      }
    })
    if (_.filter(userSelectedAnswer.options, 'isCorrect')[0].userSelected) {
      userSelectedAnswer['isCorrect'] = true
    }
    userSelectedAnswer['isExplanation'] = false
    if (quiz.questions[questionAnswerHash['qslideIndex']].
      questionType === 'fitb') {
      if (_.toLower(_.filter(userSelectedAnswer.options, 'text')[0].text) === questionAnswerHash[userSelectedAnswer.questionId][0]) {
        userSelectedAnswer['isCorrect'] = true
      } else {
        userSelectedAnswer['isCorrect'] = false
      }
    }
    return userSelectedAnswer
  }
  shuffle(array: any[] | (string | undefined)[]) {
    let currentIndex = array.length
    let temporaryValue
    let randomIndex

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1

      // And swap it with the current element.
      temporaryValue = array[currentIndex]
      array[currentIndex] = array[randomIndex]
      array[randomIndex] = temporaryValue
    }
    return array
  }
  checkMtfAnswer(quiz: NSQuiz.IQuiz, questionAnswerHash: any) {
    const userSelectedAnswer = quiz.questions[questionAnswerHash['qslideIndex']]
    for (let i = 0; i < quiz.questions[questionAnswerHash['qslideIndex']].options.length; i += 1) {
      // tslint:disable-next-line: max-line-length
      if (questionAnswerHash[quiz.questions[questionAnswerHash['qslideIndex']].questionId] && questionAnswerHash[quiz.questions[questionAnswerHash['qslideIndex']].questionId][0][i]) {
        for (let j = 0; j < questionAnswerHash[quiz.questions[questionAnswerHash['qslideIndex']].questionId][0].length; j += 1) {
          // tslint:disable-next-line: max-line-length
          if (quiz.questions[questionAnswerHash['qslideIndex']].options[i].text.trim() === questionAnswerHash[quiz.questions[questionAnswerHash['qslideIndex']].questionId][0][j].source.innerText.trim()) {
            // tslint:disable-next-line: max-line-length
            quiz.questions[questionAnswerHash['qslideIndex']].options[i].response = questionAnswerHash[quiz.questions[questionAnswerHash['qslideIndex']].questionId][0][j].target.innerText
          }
        }
      } else {
        quiz.questions[questionAnswerHash['qslideIndex']].options[i].response = ''
      }
    }
    const matchHintDisplay: any = []
    quiz.questions[questionAnswerHash['qslideIndex']].options.map(option => (option.matchForView = option.match))
    const array = quiz.questions[questionAnswerHash['qslideIndex']].options.map(elem => elem.match)
    const arr = this.shuffle(array)
    for (let i = 0; i < quiz.questions[questionAnswerHash['qslideIndex']].options.length; i += 1) {
      quiz.questions[questionAnswerHash['qslideIndex']].options[i].matchForView = arr[i]
    }
    const matchHintDisplayLocal = [...quiz.questions[questionAnswerHash['qslideIndex']].options]
    matchHintDisplayLocal.forEach(element => {

      matchHintDisplay.push(element)

    })
    userSelectedAnswer['answer'] = matchHintDisplay
    userSelectedAnswer['isExplanation'] = true
    return userSelectedAnswer
  }
  sanitizeAssessmentSubmitRequest(requestData: NSQuiz.IQuizSubmitRequest): NSQuiz.IQuizSubmitRequest {
    requestData.questions.map(question => {
      question.question = ''
      question.options.map(option => {
        option.hint = ''
        option.text = question.questionType === 'fitb' || question.questionType === 'mtf' ? option.text : ''
      })
    })
    return requestData
  }


  updateAshaAssessment(req:any){
    const options = {
      url: `${API_END_POINTS.UPDATE_ASHA_PROGRESS}`,
      payload: req
    }

    return this.post(options)
  }

}
