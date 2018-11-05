
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ViewChild, AfterContentInit, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabChangeEvent, MatTabGroup, MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material';
import { Subject, BehaviorSubject, Observable, of as observableOf } from 'rxjs';

import { ANIMATE_ON_ROUTE_ENTER } from '../../animations/router.transition';
import { BungieService } from "../../service/bungie.service";
import { Player, Character, SearchResult, Platform, Const, TriumphNode, MileStoneName, UserInfo } from "../../service/model";
import { StorageService } from '../../service/storage.service';
import { NotificationService } from '../../service/notification.service';
import { ChildComponent } from '../../shared/child.component';
import { FlatTreeControl } from '@angular/cdk/tree';


export class TriumphFlatNode {
  constructor(
    public expandable: boolean, public level: number, public data: TriumphNode) { }
}

@Component({
  selector: 'anms-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent extends ChildComponent implements OnInit, OnDestroy {
  animateOnRouteEnter = ANIMATE_ON_ROUTE_ENTER;


  @ViewChild('maintabs') tabs: MatTabGroup;

  public const: Const = Const;
  platforms: Platform[];
  selectedPlatform: Platform;
  hiddenMilestones: string[];
  msg: string;
  selectedTab: string;
  gamerTag: string;
  player: Player;
  hideCompleteChecklist = false;
  hideCompleteTriumph = false;
  hideCompleteCollectible = false;
  sort = "rewardsDesc";

  hideCompleteChars: string = null;

  treeControl2: FlatTreeControl<any>;
  treeFlattener2: MatTreeFlattener<TriumphNode, TriumphFlatNode>;
  recordDatasource: MatTreeFlatDataSource<any, TriumphFlatNode>;
  collectionDatasource: MatTreeFlatDataSource<any, TriumphFlatNode>;

  constructor(public bungieService: BungieService,
    storageService: StorageService,
    private notificationService: NotificationService,
    private route: ActivatedRoute, private router: Router) {
    super(storageService);
    this.platforms = Const.PLATFORMS_ARRAY;
    this.selectedPlatform = this.platforms[0];
    this.hiddenMilestones = this.loadHiddenMilestones();
    this.treeControl2 = new FlatTreeControl<TriumphFlatNode>(this._getLevel, this._isExpandable);
    this.treeFlattener2 = new MatTreeFlattener(this.transformer2, this._getLevel, this._isExpandable, this._getChildren);

    
  }

  transformer2 = (node: TriumphNode, level: number) => {
    return new TriumphFlatNode(!!node.children, level, node);
  }

  private _getLevel = (node: TriumphFlatNode) => node.level;

  private _isExpandable = (node: TriumphFlatNode) => node.expandable;

  private _getChildren = (node: any): Observable<any[]> => observableOf(node.children);

  hasChild = (_: number, _nodeData: TriumphFlatNode) => _nodeData.expandable;

  hideTriumph = (_nodeData: TriumphFlatNode) => this.hideCompleteTriumph && _nodeData.data.complete;
  hideCollectible = (_nodeData: TriumphFlatNode) => this.hideCompleteCollectible && _nodeData.data.complete;


  private setPlayer(x: Player): void {
    this.player = x;
    if (x != null) {
      this.sort = "rewardsDesc";
      this.recordDatasource = new MatTreeFlatDataSource(this.treeControl2, this.treeFlattener2);
      this.recordDatasource.data = this.player.records;
      this.collectionDatasource = new MatTreeFlatDataSource(this.treeControl2, this.treeFlattener2);
      this.collectionDatasource.data = this.player.collections;
      
    }
    else {
      this.recordDatasource = null;
      this.collectionDatasource = null;
    }
  }



  public historyPlayer(p: Player) {
    p.profile.userInfo.membershipType, p.profile.userInfo.membershipId
    let c: Character = p.characters[0];
    this.router.navigate(['/history', c.membershipType, c.membershipId, c.characterId]);
  }

  public getRaidLink(p: Player) {
    let platformstr: string;
    let memberid: string;
    if (p.profile.userInfo.membershipType == 1) {
      platformstr = "xb";
      memberid = p.profile.userInfo.displayName;
    }
    else if (p.profile.userInfo.membershipType == 2) {
      platformstr = "ps";
      memberid = p.profile.userInfo.displayName;
    }
    else if (p.profile.userInfo.membershipType == 4) {
      platformstr = "pc"
      memberid = p.profile.userInfo.membershipId;
    }
    return "http://raid.report/" + platformstr + "/" + memberid;
  }

  public getCharacterById(p: Player, id: string) {
    if (p.characters == null) return null;
    for (let c of p.characters) {
      if (c.characterId === id) {
        return c;
      }
    }
    return null;
  }

  public getTrialsLink(p: Player) {
    let platformstr: string;
    if (p.profile.userInfo.membershipType == 1) {
      platformstr = "xbox";
    }
    else if (p.profile.userInfo.membershipType == 2) {
      platformstr = "ps";
    }
    else if (p.profile.userInfo.membershipType == 4) {
      platformstr = "pc";
    }
    return "https://trials.report/report/" + platformstr + "/" + encodeURI(this.gamerTag);
  }


  public history(c: Character) {
    this.router.navigate(['/history', c.membershipType, c.membershipId, c.characterId]);
  }

  public routeSearch(): void {

    //if route hasn't changed it won't refresh, so we have to force it
    if (this.selectedPlatform.type == this.route.snapshot.params.platform &&
      this.gamerTag == this.route.snapshot.params.gt) {
      this.performSearch();
      return;
    }

    //otherwise just re-route
    if (this.gamerTag == null || this.gamerTag.trim().length < 1) {
      return;
    }
    this.router.navigate([this.selectedPlatform.type, this.gamerTag, this.selectedTab]);
  }

  public toggleHide(hideMe: string) {
    if (this.hideCompleteChars == hideMe) {
      this.hideCompleteChars = null;
    }
    else {
      this.hideCompleteChars = hideMe;
    }
  }

  public hideRow(mileStoneName: MileStoneName): boolean {
    if (this.hideCompleteChars == null) return false;
    let allDone = true;
    for (let char of this.player.characters) {
      let doneChar = false;
      if (char.milestones[mileStoneName.key] != null) {
        if (char.milestones[mileStoneName.key].complete == true) {
          if (this.hideCompleteChars == char.characterId) return true;
          doneChar = true;
        }
      }
      else if (char.baseCharacterLevel >= char.maxLevel) {
        if (char.milestones[mileStoneName.key] == null && !mileStoneName.neverDisappears) {
          if (this.hideCompleteChars == char.characterId) return true;
          doneChar = true;
        }
      }
      allDone = allDone && doneChar;
    }
    if (this.hideCompleteChars == "ALL" && allDone) return true;
    return false;
  }

  public changeTab(event: MatTabChangeEvent) {
    const tabName: string = this.getTabLabel(event.index);

    if (this.debugmode) {
      console.log("Change tab: " + tabName);
    }
    this.selectedTab = tabName;
    this.router.navigate([this.selectedPlatform.type, this.gamerTag, tabName]);
  }

  readonly TAB_URI = [
    "milestones",
    "bounties",
    "checklist",
    "progress",
    "triumphs",
    "collections",
    "chars"
  ];

  public sortByName(): void {
    if (this.sort === "nameAsc") {
      this.sort = "nameDesc";
    }
    else {
      this.sort = "nameAsc";
    }
    this.sortMileStones();
  }
  public sortByReset(): void {
    if (this.sort === "resetDesc") {
      this.sort = "resetAsc";
    }
    else {
      this.sort = "resetDesc";
    }
    this.sortMileStones();
  }

  public sortByRewards(): void {
    if (this.sort === "rewardsDesc") {
      this.sort = "rewardsAsc";
    }
    else {
      this.sort = "rewardsDesc";
    }
    this.sortMileStones();
  }

  private getTabLabel(index: number): string {
    if (index >= this.TAB_URI.length) return null;
    return this.TAB_URI[index];
  }

  private sortMileStones() {
    if (this.player == null || this.player.milestoneList == null) return;
    if (this.sort == "rewardsDesc") {
      this.player.milestoneList.sort((a, b) => {
        if (a.rewards < b.rewards) return 1;
        if (a.rewards > b.rewards) return -1;
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;
        return 0;
      });
    }
    else if (this.sort == "rewardsAsc") {
      this.player.milestoneList.sort((a, b) => {
        if (a.rewards < b.rewards) return -1;
        if (a.rewards > b.rewards) return 1;
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;
        return 0;
      });
    }
    else if (this.sort == "resetDesc") {
      this.player.milestoneList.sort((a, b) => {
        if (a.resets < b.resets) return 1;
        if (a.resets > b.resets) return -1;
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;
        return 0;
      });
    }
    else if (this.sort == "resetAsc") {
      this.player.milestoneList.sort((a, b) => {
        if (a.resets < b.resets) return -1;
        if (a.resets > b.resets) return 1;
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;
        return 0;
      });
    }
    else if (this.sort == "nameAsc") {
      this.player.milestoneList.sort((a, b) => {
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;
        return 0;
      });
    }
    else if (this.sort == "nameDesc") {
      this.player.milestoneList.sort((a, b) => {
        if (a.name > b.name) return -1;
        if (a.name < b.name) return 1;
        return 0;
      });
    }

  }


  private setTab(): void {
    if (this.tabs == null) {
      console.log("--- this.tabs is null");
      return;
    }
    const tab: string = this.selectedTab;
    if (tab == null) {
      console.log("---tab is null!");
      return;
    }
    let cntr = 0;
    for (let label of this.TAB_URI) {
      if (tab == label) {
        this.tabs.selectedIndex = cntr;
        break;
      }
      cntr++;
    }
  }

  private loadHiddenMilestones(): string[] {
    try {
      let sMs: string = localStorage.getItem("hiddenMilestones");
      let ms: string[] = JSON.parse(sMs);
      if (ms != null) return ms;
    }
    catch (e) {
      localStorage.removeItem("hiddenMilestones");
      return [];
    }
    return [];
  }

  private saveHiddenMilestones(): void {
    let sMs = JSON.stringify(this.hiddenMilestones);
    localStorage.setItem("hiddenMilestones", sMs);
  }

  public hideMilestone(ms: string): void {
    this.hiddenMilestones.push(ms);
    this.saveHiddenMilestones();
  }

  public showAllMilestones(): void {
    this.hiddenMilestones = [];
    this.hideCompleteChars = null;
    this.saveHiddenMilestones();
  }

  public async performSearch(): Promise<void> {
    if (this.gamerTag == null || this.gamerTag.trim().length == 0) {
      return;
    }
    this.loading = true;
    const p = await this.bungieService.searchPlayer(this.selectedPlatform.type, this.gamerTag);

    try {
      if (p != null) {
        const x = await this.bungieService.getChars(p.membershipType, p.membershipId,
          ['Profiles', 'Characters', 'CharacterProgressions', 'CharacterActivities',
            'CharacterEquipment', 'CharacterInventories',
            'ProfileProgression', 'ItemObjectives', 'PresentationNodes', 'Records', 'Collectibles'
            //'ItemInstances','ItemPerks','ItemStats','ItemSockets','ItemPlugStates',
            //'ItemTalentGrids','ItemCommonData','ProfileInventories'
          ]);
        this.setPlayer(x);

        // need to get out of this change detection cycle to have tabs set
        setTimeout(() => {
          this.setTab();
        }, 0)

        this.loading = false;

        if (x.characters != null) {
          await this.bungieService.updateAggHistory(x.characters);
          await this.bungieService.updateRaidHistory(x.milestoneList, x.characters);
          // await this.bungieService.updateNfHistory(x.milestoneList, x.characters);
          // await this.xyzService.updateDrops(x);
        }
      }
      else {
        this.loading = false;
        this.setPlayer(null);
      }
    }
    catch (x) {
      this.loading = false;

    }
  }

  currentGt: string;
  currentPlatform: string;


  ngOnInit() {
    this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
      const newPlatform: string = params['platform'];
      const newGt: string = params['gt'];
      const tab: string = params['tab'];

      //nothing changed
      if (this.currentGt == newGt && this.currentPlatform == newPlatform) {
        return;
      }

      let oNewPlatform: Platform = null;
      let redirected: boolean = false;
      this.platforms.forEach((p: Platform) => {
        if ((p.type + "") == newPlatform) {
          oNewPlatform = p;
        }
        else if (p.name.toLowerCase() == newPlatform.toLowerCase()) {
          this.router.navigate([p.type, newGt, tab]);
          redirected = true;
        }
      });

      //we already redirected
      if (redirected) return;

      //invalid platform
      if (oNewPlatform == null) {
        this.router.navigate(["home"]);
        return;
      }

      //we have a valid numeric platform, and a gamer tag, and a tab
      this.currentGt = newGt;
      this.currentPlatform = newPlatform;

      this.selectedPlatform = oNewPlatform;

      this.gamerTag = newGt;
      this.selectedTab = tab.trim().toLowerCase();

      this.performSearch();
    });

  }

  onPlatformChange() {
    this.storageService.setItem("defaultplatform", this.selectedPlatform.type);
  }
  onGtChange() {
    this.storageService.setItem("defaultgt", this.gamerTag);
  }
}

