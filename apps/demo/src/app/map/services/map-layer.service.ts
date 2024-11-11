import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  type: 'osm' | 'xyz';
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MapLayerService {
  private layers: MapLayer[] = [
    { id: 'osm', name: 'OpenStreetMap', visible: true, type: 'osm' },
    { 
      id: 'satellite', 
      name: 'Satellite', 
      visible: false, 
      type: 'xyz',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    }
  ];

  private layersSubject = new BehaviorSubject<MapLayer[]>(this.layers);
  layers$ = this.layersSubject.asObservable();

  toggleLayer(layerId: string) {
    this.layers = this.layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    );
    this.layersSubject.next(this.layers);
  }
}