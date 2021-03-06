import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ClanSeal, ClanStateService } from '@app/clan/clan-state.service';
import { StorageService } from '@app/service/storage.service';
import { ChildComponent } from '@app/shared/child.component';
import { ClanTriumphSealDialogComponent } from '../clan-triumph-seal-dialog/clan-triumph-seal-dialog.component';

@Component({
  selector: 'd2c-clan-seals',
  templateUrl: './clan-seals.component.html',
  styleUrls: ['./clan-seals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClanSealsComponent extends ChildComponent implements OnInit {

  constructor(storageService: StorageService,
    public state: ClanStateService,
    public dialog: MatDialog) {
    super(storageService);
  }

  ngOnInit() {
  }

  public openSealDialog(triumph: ClanSeal, event: MouseEvent): void {
    event.stopPropagation();
    const dc = new MatDialogConfig();
    dc.disableClose = false;
    dc.autoFocus = true;
    dc.data = triumph;
    this.dialog.open(ClanTriumphSealDialogComponent, dc);
  }

}
