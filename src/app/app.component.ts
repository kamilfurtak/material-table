import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { TableDialogComponent } from "./table-dialog/table-dialog.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <h1>Angular Material Table Demo</h1>
    <button mat-raised-button color="primary" (click)="openDialog()">
      Open Table Dialog
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 20px;
      }
    `,
  ],
})
export class AppComponent {
  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      width: "900px",
      height: "700px",
      maxWidth: "100vw",
      maxHeight: "100vh",
      panelClass: "draggable-dialog",
      hasBackdrop: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
    });
  }
}
