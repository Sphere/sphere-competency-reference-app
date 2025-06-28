import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyCoursesComponent } from './components/my-courses.component';
import { StartedComponent } from './components/started/started.component';
import { ForYouComponent } from './components/for-you/for-you.component';
import { CompletedComponent } from './components/completed/completed.component';

const routes: Routes = [
  {
    path: '', // Empty path for lazy-loaded module resolves to /my-courses
    component: MyCoursesComponent,
    children: [
      { path: '', redirectTo: 'started', pathMatch: 'full' },
      { path: 'started', component: StartedComponent },
      { path: 'for-you', component: ForYouComponent },
      { path: 'completed', component: CompletedComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MycoursesRoutingModule {}
