import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { PlayerComponent } from './player';
import { AuthComponent } from './auth';
import { HistoryComponent } from './history';
import { RecentPlayersComponent } from './recent-players';
import { PGCRComponent } from './pgcr';
import { ResourcesComponent } from './resources';
import { AboutComponent } from './about';
import { SettingsComponent } from './settings';
import { BungieSearchComponent } from './bungie-search';
import { ClanSearchComponent } from './clan-search';
import { ClanComponent } from './clan';
import { LeviathanComponent, LeviathanPrestigeComponent, RaidLastWishComponent } from './leaderboard';
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { DestinyCacheService } from './service/destiny-cache.service';
import { Subject } from 'rxjs';
import { BungieService } from '@app/service/bungie.service';

@Injectable()
export class AuthGuard implements CanActivate {
  public loader$ = new Subject<boolean>();

  constructor(private destinyCacheService: DestinyCacheService, private bungieService: BungieService) {
  }

  canActivate(): Promise<boolean> {
    this.loader$.next(true);
    return this.destinyCacheService.init().then(val => {
      this.loader$.next(false);
      return val;
    });
  }
}

@NgModule({
  imports: [RouterModule.forRoot(
    [{
      path: '',
      redirectTo: 'home',
      pathMatch: 'full'
    }
      , {
      path: 'home',
      canActivate: [AuthGuard],
      component: HomeComponent
    },
    {
      path: 'auth',
      component: AuthComponent
    },

    {
      path: 'settings',
      canActivate: [AuthGuard],
      component: SettingsComponent
    }, {
      path: 'about',
      canActivate: [AuthGuard],
      component: AboutComponent
    }, {
      path: 'search',
      canActivate: [AuthGuard],
      component: BungieSearchComponent
    }, {
      path: 'searchClans',
      canActivate: [AuthGuard],
      component: ClanSearchComponent
    }, {
      path: 'search/:name',
      canActivate: [AuthGuard],
      component: BungieSearchComponent
    }, {
      path: 'clan/:id',
      canActivate: [AuthGuard],
      component: ClanComponent
    },
    {
      path: 'leaderboard/last-wish/search/:query',
      canActivate: [AuthGuard],
      component: RaidLastWishComponent
    },
    {
      path: 'leaderboard/last-wish/:page',
      canActivate: [AuthGuard],
      component: RaidLastWishComponent
    },
    {
      path: 'leaderboard/leviathan/:name',
      canActivate: [AuthGuard],
      component: LeviathanComponent
    },
    {
      path: 'leaderboard/leviathan-prestige/:name',
      canActivate: [AuthGuard],
      component: LeviathanPrestigeComponent
    },
    {
      path: 'leaderboard/leviathan',
      canActivate: [AuthGuard],
      component: LeviathanComponent
    },
    {
      path: 'leaderboard/leviathan-prestige',
      canActivate: [AuthGuard],
      component: LeviathanPrestigeComponent
    },
    {
      path: 'leaderboard/last-wish',
      redirectTo: 'leaderboard/last-wish/1'
    },

    {
      path: 'leaderboard',
      redirectTo: 'leaderboard/last-wish/1'
    },
    {
      path: 'pgcr/:instanceId',
      canActivate: [AuthGuard],
      component: PGCRComponent
    },
    {
      path: 'vendors/:characterId/:tab',
      canActivate: [AuthGuard],
      component: ResourcesComponent
    },
    {
      path: 'vendors/:characterId',
      redirectTo: 'vendors/:characterId/Bounties'
    },
    {
      path: 'vendors',
      canActivate: [AuthGuard],
      component: ResourcesComponent
    },
    {
      path: 'history/:platform/:memberId/:characterId',
      canActivate: [AuthGuard],
      component: HistoryComponent
    },
    {
      path: 'recent-players/:platform/:memberId/:characterId',
      canActivate: [AuthGuard],
      component: RecentPlayersComponent
    },
    {
      path: ':platform/:gt/:tab/:treeHash',
      canActivate: [AuthGuard],
      component: PlayerComponent
    },
    {
      path: ':platform/:gt/:tab',
      canActivate: [AuthGuard],
      component: PlayerComponent
    },
    {
      path: ':platform/:gt',
      canActivate: [AuthGuard],
      redirectTo: ':platform/:gt/milestones'
    },
    {
      path: '**',
      redirectTo: 'home'
    }
    ], { useHash: false })],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
