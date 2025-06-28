import { Component, Inject, Input, OnInit } from '@angular/core';
import { ViewerUtilService } from '../../../../../../../viewer/src/lib/viewer-util.service';
import { NSQuiz } from '../../../../../../../viewer/src/lib/plugins/quiz/quiz.model';
import { HttpClient } from '@angular/common/http';
import { WidgetContentService } from '@ws-widget/collection';
import { ActivatedRoute } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { ContentService } from '@project-sunbird/sunbird-sdk';

@Component({
  selector: 'ws-app-assessment-detail',
  templateUrl: './assessment-detail.component.html',
  styleUrls: ['./assessment-detail.component.scss'],
})
export class AssessmentDetailComponent implements OnInit {
  @Input() forPreview = false;
  @Input() resourceLink: any;
  @Input() content: any;

  assesmentdata: NSQuiz.IQuiz = {
    timeLimit: 0,
    questions: [
      {
        multiSelection: false,
        question: '',
        questionId: '',
        options: [
          {
            optionId: '',
            text: '',
            isCorrect: false,
          },
        ],
      },
    ],
    isAssessment: false,
    passPercentage: 60,
  };

  constructor(
    private viewSvc: ViewerUtilService,
    private http: HttpClient,
    private contentSvc: WidgetContentService,
    private activatedRoute: ActivatedRoute,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,

  ) { }

  async ngOnInit() {
    console.log('Content:', this.content);
    this.assesmentdata = await this.transformQuiz(this.content);
  }



  private async transformQuiz(content: any): Promise<NSQuiz.IQuiz> {
    const isCompetency = this.activatedRoute.snapshot.queryParams.competency;
  
    if (content.artifactUrl) {
      const artifactUrl = await this.getArtifactUrl(content, isCompetency); // Use await
      return await this.fetchQuizData(artifactUrl);
    }
  
    const fetchedContent = await this.fetchContentDetails(content.identifier);
    if (fetchedContent) {
      const artifactUrl = await this.getArtifactUrl(fetchedContent, isCompetency); // Use await
      return await this.fetchQuizData(artifactUrl);
    }
  
    return this.assesmentdata;
  }
  private async fetchQuizData(artifactUrl: string): Promise<NSQuiz.IQuiz> {
    try {
      const quizJSON = await this.http.get<NSQuiz.IQuiz>(artifactUrl).toPromise();
      console.log('quizJSON', quizJSON)
      if (quizJSON) {
        quizJSON.questions.forEach((question: NSQuiz.IQuestion) => {
          if (!question.questionType) {
            question.questionType = question.multiSelection ? 'mcq-mca' : 'mcq-sca';
          }
        });
        quizJSON.passPercentage ||= 60;
        return quizJSON;
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    }
    return this.assesmentdata;
  }

  private async getArtifactUrl(content: any, isCompetency: boolean): Promise<string> {
    if (navigator.onLine) {
      return this.forPreview
        ? this.viewSvc.getAuthoringUrl(content.artifactUrl)
        : content.artifactUrl;
    } else {
      try {
        const option = { contentId: content.identifier };
        const data = await this.contentService.getContentDetails(option).toPromise();
        if (data) {
          const basePath = Capacitor.convertFileSrc(data.basePath);
          const artifactPath = Capacitor.convertFileSrc(data.contentData.artifactUrl);
          return `${basePath}/${artifactPath}`;
        }
      } catch (error) {
        console.error('Error fetching offline artifact URL:', error);
      }
    }
    return content.artifactUrl; // Return a default or fallback value
  }
  

  private async fetchContentDetails(identifier: string): Promise<any> {
    try {
      const response = await this.contentSvc.fetchContent(identifier, 'detail').toPromise();
      return response?.result?.content;
    } catch (error) {
      console.error('Error fetching content details:', error);
      return null;
    }
  }
}
