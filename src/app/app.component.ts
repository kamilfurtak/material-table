import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AngularOpenlayersModule } from "ng-openlayers";

import { DialogService } from "./components/dialog/dialog.service";

@Component({
  selector: "app-root",
  standalone: true,
  providers: [DialogService],
  imports: [
    CommonModule,
    MatButtonModule,
    AngularOpenlayersModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Angular Material Table Demo</span>
      <span style="flex: 1 1 auto"></span>
      <button mat-icon-button (click)="openDialog()" matTooltip="Open Table">
        <mat-icon>table_chart</mat-icon>
      </button>
    </mat-toolbar>

    <div class="map-container">
      <aol-map>
        <aol-view [zoom]="2">
          <aol-coordinate
            [x]="5.795122"
            [y]="45.210225"
            [srid]="'EPSG:4326'"
          ></aol-coordinate>
        </aol-view>
        <aol-layer-tile>
          <aol-source-osm></aol-source-osm>
        </aol-layer-tile>
        <aol-interaction-default></aol-interaction-default>
        <aol-control-scaleline></aol-control-scaleline>
        <aol-control-zoomslider></aol-control-zoomslider>
        <aol-control-zoom></aol-control-zoom>
      </aol-map>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100vh;
      }

      .map-container {
        flex: 1;
        width: 100%;
      }

      aol-map {
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  constructor(private dialogService: DialogService) {}

  ngOnInit() {
    this.openDialog();
  }

  openDialog() {
    this.dialogService.openDialog({
      width: "900px",
      height: "700px",
      title: "User Table",
    });
  }
}
