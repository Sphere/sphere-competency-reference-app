import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { QuizComponent } from './quiz.component'
import { OverviewComponent } from './components/overview/overview.component'
import { QuestionComponent } from './components/question/question.component'
import { SubmitQuizDialogComponent } from './components/submit-quiz-dialog/submit-quiz-dialog.component'
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AssesmentCloseModalComponent } from './components/assesment-close-modal/assesment-close-modal.component'
import { AssesmentQuestionResultComponent } from './components/assesment-question-result/assesment-question-result.component'
import { QuizModalComponent } from './components/quiz-modal/quiz-modal.component'
import { ViewQuizQuestionComponent } from './components/view-quiz-question/view-quiz-question.component'
import { CloseQuizModalComponent } from './components/close-quiz-modal/close-quiz-modal.component'
import { TranslateModule } from '@ngx-translate/core';
import { PipeDurationTransformModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-duration-transform/pipe-duration-transform.module'
import { PipeLimitToModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-limit-to/pipe-limit-to.module'
import { BtnFullscreenModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-fullscreen/btn-fullscreen.module'
import { CompleteCoursesModalComponent } from './components/complete-courses-modal/complete-courses-modal.component'
import { ViewAssesmentQuestionsComponent } from './components/view-assesment-questions/view-assesment-questions.component'
import { SlideDirective } from './directives/slide.directive'
import { AssesmentModalComponent } from './components/assesment-modal/assesment-modal.component'
import { AssesmentOverviewComponent } from './components/assesment-overview/assesment-overview.component'

@NgModule({
    declarations: [
        QuizComponent,
        OverviewComponent,
        QuestionComponent,
        SubmitQuizDialogComponent,
        AssesmentOverviewComponent,
        AssesmentModalComponent,
        CompleteCoursesModalComponent,
        ViewAssesmentQuestionsComponent,
        SlideDirective,
        AssesmentCloseModalComponent,
        AssesmentQuestionResultComponent,
        QuizModalComponent,
        ViewQuizQuestionComponent,
        CloseQuizModalComponent,
    ],
    imports: [
        CommonModule,
        PipeDurationTransformModule,
        PipeLimitToModule,
        MatCardModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatListModule,
        MatRadioModule,
        MatSidenavModule,
        MatTableModule,
        MatButtonModule,
        BtnFullscreenModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatProgressBarModule,
        TranslateModule.forChild(),
    ],
    exports: [QuizComponent]
})
export class QuizModule { }
