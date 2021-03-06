import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { IconService } from '@app/service/icon.service';

@Component({
  selector: 'd2c-sort-indicator',
  templateUrl: './sort-indicator.component.html',
  styleUrls: ['./sort-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortIndicatorComponent implements OnInit {

  @Input() field: string;
  @Input() currVal: string;
  @Input() descending: boolean;

  constructor(public iconService: IconService) { }

  ngOnInit() {
  }

}
