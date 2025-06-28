import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouterLinks, ETopBar } from './app.constant';
import { PageResolve } from '../library/ws-widget/utils/src/lib/resolvers/page.resolver';
import { NewTncComponent } from './new-tnc/new-tnc.component';
import { TncPublicResolverService } from './services/tnc-public-resolver.service';
import { GeneralGuard } from './guards/general.guard';
import { CompetencyDashboardComponent } from '@aastrika_npmjs/comptency/competency';
import { SelfAssessmentComponent } from './self-assessment/self-assessment.component';
import { SelfAssessmentGuard } from './manage-learn/core/guards/self-assessment.guard';
import { OrgServiceService } from '../project/ws/app/src/lib/routes/org/org-service.service';
import { TncComponent } from '../project/ws/app/src/lib/routes/app-setup/components/tnc/tnc.component';
import { TncAppResolverService } from '../services/tnc-app-resolver.service';
import { LoginComponent } from './modules/auth/components/login/login.component';
import { HowItWorksVideoComponent } from './how-it-works-video/how-it-works-video.component';
import { ForgotPasswordComponent } from './modules/auth/components/forgot-password/forgot-password.component';
import { NotificationComponent } from './components/notification/notification.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: `${RouterLinks.PUBLIC_HOME}`,
    pathMatch: 'full'
  },
  {
    path: `${RouterLinks.PUBLIC_HOME}`,
    loadChildren: () => import('./modules/public/public.module').then(m => m.PublicModule),
    canActivate: [GeneralGuard],
    data: { animation: 'publicHome' }
  },
  {
    path: `${RouterLinks.PUBLIC_TNC}`,
    component: TncComponent,
    data: {
      title: 'Terms of Use - Aastrika',
      isPublic: true,
    },
    resolve: {
      tnc: TncPublicResolverService,
    },
  },
  {
    path: `${RouterLinks.CREATE_ACCOUNT}`,
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule),
    data: { animation: 'createAccount' }
  },{
    path: `${RouterLinks.NOTIFICATION}`,
    component: NotificationComponent,
    data: {animation: 'notification'}
  },
  {
    path: `${RouterLinks.APP_LOGIN}`,
    component: LoginComponent,
    data: { animation: 'createAccount' }
  },
  {
    path: `${RouterLinks.FORGOT_PASSWORD}`,
    component: ForgotPasswordComponent,
    data: { animation: 'createAccount' }
  },
  {
    path: `${RouterLinks.GET_HELP}`,
    loadChildren: () => import('./modules/get-help/get-help.module').then(m => m.GetHelpModule),
    data: { animation: 'getHelp' }
  },
  {
    path: `${RouterLinks.PRIVATE_HOME}`,
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule),
    canActivate: [GeneralGuard],
    data: { animation: 'privateHome' }
  },
  {
    path: `${RouterLinks.ABOUT_YOU}`,
    loadChildren: () => import('./modules/about-you/about-you.module').then(m => m.AboutYouModule),
    data: { animation: 'aboutYou' }
  },
  {
    path: RouterLinks.NEW_TNC,
    component: NewTncComponent,
    resolve: {
      tnc: TncAppResolverService,
    },
    data: { animation: 'newTNC' }
  },
  {
    path: RouterLinks.HOW_IT_WORKS,
    component: HowItWorksVideoComponent,
    data: { animation: 'newTNC' }
  },
  {
    path: RouterLinks.ORG_DETAILS,
    loadChildren: () => import('../project/ws/app/src/lib/routes/orgmodule/orgmodule.module').then(m => m.OrgmoduleModule),
    resolve: {
      orgData: OrgServiceService,
    },
    data: { animation: 'orgDetails' }
  },
  {
    path: `${RouterLinks.TOC_PAGE}`,
    loadChildren: () => import('./modules/overview-toc/overview-toc.module').then(m => m.OverviewTocModule),
    canActivate: [GeneralGuard],
    data: { animation: 'tocPages' }
  },
  {
    path: `${RouterLinks.MY_COURSES}`,
    loadChildren: () => import('./modules/my-courses/my-courses.module').then(m => m.MyCoursesModule),
    canActivate: [GeneralGuard],
    data: {animation: 'myCourses'}

  },
  {
    path: `${RouterLinks.REFERENCE_PLAYER}`,
    loadChildren: () => import('./modules/reference-player/reference-player.module').then(m => m.ReferencePlayerModule),
    canActivate: [GeneralGuard],
    data: {animation: 'referencePlayer'}

  },
  {
    path: `${RouterLinks.LEARNER_OBSERVATION}`,
    loadChildren: () => import('./modules/learner-observation/learner-observation.module').then(m => m.LearnerObservationModule),
    canActivate: [GeneralGuard],
    data: {animation: 'learnerObservation'}

  },
  {
    path: `${RouterLinks.MENTOR}`,
    loadChildren: () => import('./modules/observation/observation.module').then(m => m.ObservationModule),
    canActivate: [GeneralGuard],
    data: {animation: 'observation'}

  },
  {
    path: `${RouterLinks.VIEWER}`,
    data: {
      topBar: ETopBar.NONE,
      animation: 'viewer'
    },
    loadChildren: () => import('./modules/route-viewer/route-viewer.module').then(m => m.RouteViewerModule),
    canActivate: [GeneralGuard],
  },
  {
    path: `${RouterLinks.PROFILE_DASHBOARD}`,
    loadChildren: () => import('./modules/profile/profile.module').then(m => m.ProfileDashboardModule),
    data: { animation: 'profileDashboard' },
    canActivate: [GeneralGuard],
  },
  {
    path: RouterLinks.SEARCH_PAGE,
    loadChildren: () => import('./modules/overviews/routes/route-search-app.module').then(m => m.RouteSearchAppModule),
    data: {
      pageType: 'feature',
      pageKey: 'search',
      animation: 'seach'
    },
    resolve: {
      searchPageData: PageResolve,
    }
  },

  {
    path: RouterLinks.COMPETENCY_DASHBOARD,
    component: CompetencyDashboardComponent,
    canActivate: [GeneralGuard],
  },
  {
    path: RouterLinks.SELF_ASSESSMENT,
    component: SelfAssessmentComponent, canActivate: [SelfAssessmentGuard],
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {})
  ],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule { }
