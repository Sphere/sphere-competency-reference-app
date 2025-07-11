import { Component, OnInit, OnDestroy, Inject } from '@angular/core'
import { Subscription } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { NSQuiz } from '../../plugins/quiz/quiz.model'
import { ActivatedRoute } from '@angular/router'
import { ViewerUtilService } from '../../viewer-util.service'
import { buildConfig } from '../../../../../../../../configurations/configuration'
import { ContentService } from '@project-sunbird/sunbird-sdk'
import { NsContent } from '../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import { WidgetContentService } from '../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service'
import { EventService } from '../../../../../../../library/ws-widget/utils/src/lib/services/event.service'
import { WsEvents } from '../../../../../../../library/ws-widget/utils/src/lib/services/event.model'
import { Capacitor } from '@capacitor/core'

@Component({
  selector: 'viewer-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent implements OnInit, OnDestroy {
  private dataSubscription: Subscription | null = null
  isFetchingDataComplete = false
  forPreview = window.location.href.includes('/author/')
  isErrorOccured = false
  quizData: NsContent.IContent | null = null
  oldData: NsContent.IContent | null = null
  alreadyRaised = false
  quizJson: NSQuiz.IQuiz = {
    timeLimit: 0,
    questions: [],
    isAssessment: false,
  }
  basePath = '';
  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private contentSvc: WidgetContentService,
    private eventSvc: EventService,
    private viewSvc: ViewerUtilService,
  ) { }

  ngOnInit() {
    if(navigator.onLine){
      this.dataSubscription = this.activatedRoute.data.subscribe(
        async data => {
          this.quizData = data.content.data
          if (this.alreadyRaised && this.oldData) {
            this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.oldData)
          }
          if (this.quizData && this.quizData.artifactUrl.indexOf('content-store') >= 0) {
            await this.setS3Cookie(this.quizData.identifier)
          }
          if (this.quizData) {
            this.quizJson = await this.transformQuiz(this.quizData)
          }
          if (this.quizData) {
            this.oldData = this.quizData
            this.alreadyRaised = true
            this.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, this.quizData)
          }
          this.isFetchingDataComplete = true;
        },
        () => { },
      )
    }
    else {
      let option = { contentId:this.activatedRoute.snapshot.paramMap.get('resourceId')};
        this.contentService.getContentDetails(option).toPromise()
        .then(async (data: any) => {
          this.basePath = data.basePath;
          this.quizData = data.contentData;
          if (this.quizData) {
            this.quizJson = await this.transformQuiz(data.contentData);
            this.oldData = this.quizData
            this.alreadyRaised = true
            this.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, this.quizData)
          }
          this.isFetchingDataComplete = true;
        })
    }
  }

  async ngOnDestroy() {
    if (this.activatedRoute.snapshot.queryParams.collectionId &&
      this.activatedRoute.snapshot.queryParams.collectionType
      && this.quizData) {
      await this.contentSvc.continueLearning(this.quizData.identifier,
        this.activatedRoute.snapshot.queryParams.collectionId,
        this.activatedRoute.snapshot.queryParams.collectionType,
      )
    } else if (this.quizData) {
      await this.contentSvc.continueLearning(this.quizData.identifier)
    }
    if (this.quizData) {
      this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.quizData)
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe()
    }
  }

  raiseEvent(state: WsEvents.EnumTelemetrySubType, data: NsContent.IContent) {
    if (this.forPreview) {
      return
    }
    const event = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      from: 'quiz',
      to: '',
      data: {
        state,
        type: WsEvents.WsTimeSpentType.Player,
        mode: WsEvents.WsTimeSpentMode.Play,
        content: data,
        identifier: data ? data.identifier : null,
        mimeType: NsContent.EMimeTypes.QUIZ,
        url: data ? data.artifactUrl : null,
      },
    }
    this.eventSvc.dispatchEvent(event)
  }

  private async transformQuiz(content: NsContent.IContent): Promise<NSQuiz.IQuiz> {
    if(navigator.onLine){
      if (this.activatedRoute.snapshot.queryParams.competency) {
        this.viewSvc.competencyAsessment.next(false)
        const artifactUrl = 'https://'+buildConfig.SITEPATH+'/'+ this.viewSvc.getCompetencyAuthoringUrl(content.artifactUrl.split('/content')[1]
        )
        let quizJSON: NSQuiz.IQuiz = await this.http
          .get<any>(artifactUrl || '')
          .toPromise()
          .catch((_err: any) => {
            // throw new DataResponseError('MANIFEST_FETCH_FAILED');
          })
        if (this.forPreview && quizJSON) {
          quizJSON = this.viewSvc.replaceToAuthUrl(quizJSON)
        }
        quizJSON.questions.forEach((question: NSQuiz.IQuestion) => {
          if (question.multiSelection && question.questionType === undefined) {
            question.questionType = 'mcq-mca'
          } else if (!question.multiSelection && question.questionType === undefined) {
            question.questionType = 'mcq-sca'
          }
        })
        // console.log('transformQuiz')
        this.viewSvc.competencyAsessment.next(true)
        return quizJSON
      } else {
        const artifactUrl = this.forPreview
          ? this.viewSvc.getAuthoringUrl(content.artifactUrl)
          : content.artifactUrl
        let quizJSON: NSQuiz.IQuiz = await this.http
          .get<any>(artifactUrl || '')
          .toPromise()
          .catch((_err: any) => {
            // throw new DataResponseError('MANIFEST_FETCH_FAILED');
          })
        if (this.forPreview && quizJSON) {
          quizJSON = this.viewSvc.replaceToAuthUrl(quizJSON)
        }
        quizJSON.questions.forEach((question: NSQuiz.IQuestion) => {
          if (question.multiSelection && question.questionType === undefined) {
            question.questionType = 'mcq-mca'
          } else if (!question.multiSelection && question.questionType === undefined) {
            question.questionType = 'mcq-sca'
          }
        })
        return quizJSON
      }
    } else {
      const basePath = Capacitor.convertFileSrc(this.basePath); // Converts to an accessible URL
      const artifactPath = Capacitor.convertFileSrc(content.artifactUrl);
      //const artifactUrl = '_app_file_'+this.basePath+content.artifactUrl;
      const artifactUrl =`${basePath}/${artifactPath}`
      let quizJSON: NSQuiz.IQuiz = await this.http
        .get<any>(artifactUrl || '')
        .toPromise()
        .catch((_err: any) => {
          console.log('Error - ', _err);
          // throw new DataResponseError('MANIFEST_FETCH_FAILED');
        })
        quizJSON.questions.forEach((question: NSQuiz.IQuestion) => {
          if (question.multiSelection && question.questionType === undefined) {
            question.questionType = 'mcq-mca';
          } else if (!question.multiSelection && question.questionType === undefined) {
            question.questionType = 'mcq-sca';
          }
        });
        return quizJSON;
    }
  }
  private async setS3Cookie(contentId: string) {
    await this.contentSvc
      .setS3Cookie(contentId)
      .toPromise()
      .catch(() => {
        // throw new DataResponseError('COOKIE_SET_FAILURE')
      })
    return
  }
}
