import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { TableDialogComponent } from "./table-dialog/table-dialog.component";
import { DialogRegistryService } from "./services/dialog-registry.service";
import { AngularOpenlayersModule } from "ng-openlayers";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    AngularOpenlayersModule,
    MatToolbarModule,
    MatIconModule,
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
  constructor(
    public dialog: MatDialog,
    private dialogRegistry: DialogRegistryService,
  ) {}

  ngOnInit() {
    this.openDialog();
  }

  openDialog() {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      width: "900px",
      height: "700px",
      maxWidth: "100vw",
      maxHeight: "100vh",
      panelClass: "draggable-dialog",
      hasBackdrop: false,
    });

    this.dialogRegistry.registerDialog(dialogRef);

    dialogRef.afterClosed().subscribe((result) => {
      this.dialogRegistry.closeChildDialogs(dialogRef);
      this.dialogRegistry.unregisterDialog(dialogRef);
      console.log("The dialog was closed");
    });
  }
}
