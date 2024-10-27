import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { TableDialogComponent } from "./table-dialog/table-dialog.component";
import { DialogRegistryService } from "./services/dialog-registry.service";

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
