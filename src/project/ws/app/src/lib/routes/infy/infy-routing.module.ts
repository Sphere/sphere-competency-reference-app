import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { CertificationsGuard } from './routes/certification-dashboard/guards/certifications.guard'

const routes: Routes = [
  {
    path: 'training',
    loadChildren: () => import('./routes/training/training.module').then(m => m.TrainingModule)
  },
  {
    path: 'certification-dashboard',
    loadChildren: () => import('./routes/certification-dashboard/certification-dashboard.module').then(m => m.CertificationDashboardModule),
    canActivate: [CertificationsGuard],
    data: {
      requiredFeatures: ['certificationLHub'],
    },
  },
  {
    path: 'navigator',
    loadChildren: () => import('./routes/navigator/navigator.module').then(m => m.NavigatorModule)
  },
  {
    path: 'experience-wow',
    loadChildren: () => import('./routes/ocm/ocm.module').then(m => m.OcmModule)
  },
  {
    path: 'khub',
    loadChildren: () => import('./routes/knowledge-hub/knowledge-hub.module').then(m => m.KnowledgeHubModule)
  },
  {
    path: 'marketing',
    loadChildren: () => import('./routes/marketing/marketing.module').then(m => m.MarketingModule)
  },
  {
    path: 'channels',
    loadChildren: () => import('./routes/channels/channels.module').then(m => m.ChannelsModule)
  },
  {
    path: 'events',
    loadChildren: () => import('./routes/events/events.module').then(m => m.EventsModule)
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfyRoutingModule { }
