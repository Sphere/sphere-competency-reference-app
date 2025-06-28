import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RefrenceVideoComponent } from './components/refrence-video/refrence-video.component';


const routes: Routes = [
    {
        path: 'video',
        component: RefrenceVideoComponent,
      },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RefrencePlayerRoutingModule {}
