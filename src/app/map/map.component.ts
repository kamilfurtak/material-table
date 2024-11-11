import { Component } from "@angular/core";
import { AngularOpenlayersModule } from "ng-openlayers";

@Component({
  selector: "app-map",
  standalone: true,
  imports: [AngularOpenlayersModule],
  templateUrl: "./map.component.html",
  styleUrl: "./map.component.css",
})
export class MapComponent {}
