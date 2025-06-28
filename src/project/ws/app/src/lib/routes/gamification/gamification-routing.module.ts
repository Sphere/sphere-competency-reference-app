import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  {
    path: 'leaderboard',
    loadChildren: () => import('./routes/leaderboard/leaderboard.module').then(m => m.LeaderboardModule)

  },
  {
    path: 'badges',
    loadChildren: () => import('./routes/badges/badges.module').then(m => m.BadgesModule)

  },
  {
    path: 'admin',
    loadChildren: () => import('./routes/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'rewards',
    loadChildren: () => import('./routes/rewards/rewards.module').then(m => m.RewardsModule)
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GamificationRoutingModule { }
