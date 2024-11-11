import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { AngularOpenlayersModule } from 'ng-openlayers';
import { MapLayerService } from './services/map-layer.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCheckboxModule,
    FormsModule,
    AngularOpenlayersModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #sidenav
        mode="side"
        [(opened)]="sidenavOpened"
        class="map-sidenav"
      >
        <div class="sidenav-header">
          <h3>Map Layers</h3>
          <button
            mat-icon-button
            (click)="sidenav.toggle()"
            class="toggle-button"
          >
            <mat-icon>chevron_left</mat-icon>
          </button>
        </div>

        <mat-nav-list>
          <mat-list-item *ngFor="let layer of layers$ | async">
            <mat-checkbox
              [checked]="layer.visible"
              (change)="toggleLayer(layer.id)"
            >
              {{ layer.name }}
            </mat-checkbox>
          </mat-list-item>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <button
          *ngIf="!sidenavOpened"
          mat-mini-fab
          color="primary"
          class="open-sidenav-button"
          (click)="sidenav.toggle()"
        >
          <mat-icon>chevron_right</mat-icon>
        </button>

        <div class="map-container">
          <aol-map>
            <aol-view [zoom]="2">
              <aol-coordinate
                [x]="5.795122"
                [y]="45.210225"
                [srid]="'EPSG:4326'"
              ></aol-coordinate>
            </aol-view>

            <ng-container *ngFor="let layer of layers$ | async">
              <aol-layer-tile *ngIf="layer.visible">
                <aol-source-osm *ngIf="layer.type === 'osm'"></aol-source-osm>
                <aol-source-xyz
                  *ngIf="layer.type === 'xyz' && layer.url"
                  [url]="layer.url"
                ></aol-source-xyz>
              </aol-layer-tile>
            </ng-container>

            <aol-interaction-default></aol-interaction-default>
            <aol-control-scaleline></aol-control-scaleline>
            <aol-control-zoomslider></aol-control-zoomslider>
            <aol-control-zoom></aol-control-zoom>
          </aol-map>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 64px);
      }

      .sidenav-container {
        flex: 1;
        width: 100%;
      }

      .map-sidenav {
        width: 250px;
        background-color: #f5f5f5;
        border-right: 1px solid #e0e0e0;
      }

      .sidenav-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
      }

      .sidenav-header h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 500;
      }

      .toggle-button {
        margin-right: -16px;
      }

      .open-sidenav-button {
        position: absolute;
        left: 16px;
        top: 16px;
        z-index: 1000;
      }

      .map-container {
        height: 100%;
        width: 100%;
      }

      aol-map {
        width: 100%;
        height: 100%;
      }

      mat-nav-list {
        padding-top: 0;
      }

      mat-list-item {
        height: 48px;
      }
    `,
  ],
})
export class MapComponent {
  sidenavOpened = false;
  layers$ = this.mapLayerService.layers$;

  constructor(private mapLayerService: MapLayerService) {}

  toggleLayer(layerId: string) {
    this.mapLayerService.toggleLayer(layerId);
  }
}
