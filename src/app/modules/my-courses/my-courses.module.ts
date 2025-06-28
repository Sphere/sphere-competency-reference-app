import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyCoursesComponent } from './components/my-courses.component';
import { MycoursesRoutingModule } from './my-courses-routing.module';
import { StartedComponent } from './components/started/started.component';
import { IonicModule } from '@ionic/angular';
import { CompletedComponent } from './components/completed/completed.component';
import { ForYouComponent } from './components/for-you/for-you.component';
import { MyCoursesCardComponent } from './components/my-courses-card/my-courses-card.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MyCourseService } from './services/my-course.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    MyCoursesComponent,
    MyCoursesCardComponent,
    StartedComponent,
    ForYouComponent,
    CompletedComponent
    
  ],
  imports: [
    CommonModule,
    MycoursesRoutingModule,
    SharedModule,
    IonicModule,
    MatProgressBarModule
  ],
  exports:[MyCoursesCardComponent],
  providers:[MyCourseService]
})
export class MyCoursesModule { }
