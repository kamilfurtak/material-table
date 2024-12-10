import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

import { DialogService } from '../../../../libs/material-components/src/lib/dialog/dialog.service';
import { MapComponent } from './map/map.component';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-root',
    imports: [
        MatButtonModule,
        MatToolbarModule,
        MatIconModule,
        MapComponent,
        MatTooltip,
    ],
    template: `
    <mat-toolbar color="primary">
      <span>Angular Material Table Demo</span>
      <span style="flex: 1 1 auto"></span>
      <button mat-icon-button (click)="openDialog()" matTooltip="Open Table">
        <mat-icon>table_chart</mat-icon>
      </button>
    </mat-toolbar>

    <app-map></app-map>
  `
})
export class AppComponent implements OnInit {
  constructor(private dialogService: DialogService) {}

  ngOnInit() {
    this.openDialog();
  }

  openDialog() {
    this.dialogService.openDialog({
      width: '900px',
      height: '700px',
      title: 'User Table',
    });
  }
}
