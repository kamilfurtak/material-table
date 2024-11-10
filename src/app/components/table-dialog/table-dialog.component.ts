import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
} from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SubscriptionLike } from "rxjs";

import { ColumnDef, User } from "../../models/user.model";
import { UserService } from "../../services/user.service";
import { TableStateService } from "../data-table/table-state.service";
import { DialogRegistryService } from "../dialog/dialog-registry.service";
import { PdfExportService } from "../data-table/pdf-export.service";
import { DataTableComponent } from "../data-table/data-table.component";

@Component({
  selector: "app-table-dialog",
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    DragDropModule,
    MatIconModule,
    MatTooltipModule,
    DataTableComponent,
  ],
  templateUrl: "./table-dialog.component.html",
  styleUrls: ["./table-dialog.component.scss"],
})
export class TableDialogComponent implements OnInit, OnDestroy {
  columns: ColumnDef[] = [];
  displayedColumns: string[] = [];
  isMultiSelect = false;
  isMinimized = false;
  private originalSize: {
    width: string;
    height: string;
    transform: string;
  } | null = null;
  private isMaximized = false;
  private locationSubscription: SubscriptionLike | undefined;

  constructor(
    private dialogRef: MatDialogRef<TableDialogComponent>,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private location: Location,
    private userService: UserService,
    public tableState: TableStateService,
    private dialogRegistry: DialogRegistryService,
    public dialog: MatDialog,
    private pdfExportService: PdfExportService,
  ) {}

  ngOnInit() {
    history.pushState(null, "", "");
    this.locationSubscription = this.location.subscribe(() => {
      this.closeDialog();
    });

    this.userService.getUsers().subscribe(
      (data) => {
        this.tableState.updateData(data);
        this.updateDisplayedColumns(data[0]);
      },
      (error) => console.error("Error fetching data:", error),
    );
  }

  updateDisplayedColumns(sampleData: User) {
    this.columns = Object.keys(sampleData)
      .filter((key) => key !== "address" && key !== "company")
      .map((key) => ({
        columnDef: key,
        header: key.charAt(0).toUpperCase() + key.slice(1),
        cell: (element: User) => `${element[key]}`,
      }));
    this.displayedColumns = [
      "select",
      ...this.columns.map((col) => col.columnDef),
    ];
  }

  closeDialog() {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
    this.dialogRef.close(this.tableState.selection.selected);
  }

  minimizeDialog() {
    this.isMinimized = !this.isMinimized;
  }

  maximizeDialog() {
    const dialogContainer =
      this.elementRef.nativeElement.closest(".cdk-overlay-pane");
    if (dialogContainer) {
      if (!this.isMaximized) {
        const computedStyle = window.getComputedStyle(dialogContainer);
        this.originalSize = {
          width: dialogContainer.style.width || computedStyle.width,
          height: dialogContainer.style.height || computedStyle.height,
          transform: dialogContainer.style.transform || computedStyle.transform,
        };

        this.renderer.setStyle(dialogContainer, "width", "100vw");
        this.renderer.setStyle(dialogContainer, "height", "100vh");
        this.renderer.setStyle(dialogContainer, "transform", "none");
        this.isMaximized = true;
      } else {
        this.renderer.setStyle(
          dialogContainer,
          "width",
          this.originalSize!.width,
        );
        this.renderer.setStyle(
          dialogContainer,
          "height",
          this.originalSize!.height,
        );
        this.renderer.setStyle(
          dialogContainer,
          "transform",
          this.originalSize!.transform,
        );
        this.isMaximized = false;
      }
    }
  }

  @HostListener("window:keydown", ["$event"])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.tableState.selection.clear();
    }
  }

  ngOnDestroy() {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
  }

  openChildDialog() {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      width: "900px",
      height: "700px",
      maxWidth: "100vw",
      maxHeight: "100vh",
      panelClass: "draggable-dialog",
      hasBackdrop: false,
    });

    this.dialogRegistry.registerDialog(dialogRef, this.dialogRef);

    dialogRef.afterClosed().subscribe(() => {
      this.dialogRegistry.closeChildDialogs(dialogRef);
      this.dialogRegistry.unregisterDialog(dialogRef);
    });
  }

  exportToPDF() {
    const tableData = this.tableState.dataSource.data;
    const columns = this.columns.map((col) => col.header);
    this.pdfExportService.exportToPDF(tableData, columns);
  }
}
