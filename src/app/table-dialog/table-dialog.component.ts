import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { DragDropModule } from "@angular/cdk/drag-drop";
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from "@angular/cdk/scrolling";
import { SelectionModel } from "@angular/cdk/collections";
import { MatSort, MatSortModule } from "@angular/material/sort";
import {
  TableVirtualScrollDataSource,
  TableVirtualScrollModule,
} from "ng-table-virtual-scroll";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SubscriptionLike } from "rxjs";
import { DialogRegistryService } from "../services/dialog-registry.service";
import { PdfExportService } from '../pdf-export.service';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  [key: string]: any;
}

interface ColumnDef {
  columnDef: string;
  header: string;
  cell: (element: User) => string;
}

@Component({
  selector: "app-table-dialog",
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatDialogModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    FormsModule,
    DragDropModule,
    ScrollingModule,
    MatSortModule,
    TableVirtualScrollModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  template: `
    <div
      class="dialog-header"
      cdkDrag
      cdkDragRootElement=".cdk-overlay-pane"
      cdkDragHandle
    >
      <h2 mat-dialog-title>User Table</h2>
      <div class="dialog-controls">
        <button
          mat-icon-button
          (click)="minimizeDialog()"
          matTooltip="Minimize"
        >
          <mat-icon>remove</mat-icon>
        </button>
        <button
          mat-icon-button
          (click)="maximizeDialog()"
          matTooltip="Maximize"
        >
          <mat-icon>crop_square</mat-icon>
        </button>
        <button mat-icon-button (click)="closeDialog()" matTooltip="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
    <mat-dialog-content>
      <div class="table-container mat-elevation-z8">
        <mat-toolbar class="table-toolbar">
          <button
            mat-icon-button
            (click)="removeSelectedItems()"
            [disabled]="!selection.hasValue()"
            matTooltip="Remove selected items"
          >
            <mat-icon>delete</mat-icon>
          </button>
          <button
            mat-icon-button
            (click)="exportToPDF()"
            matTooltip="Export to PDF"
          >
            <mat-icon>picture_as_pdf</mat-icon>
          </button>
        </mat-toolbar>
        <cdk-virtual-scroll-viewport
          tvsItemSize="48"
          class="virtual-scroll-viewport"
        >
          <table mat-table [dataSource]="dataSource" matSort>
            <ng-container matColumnDef="select">
              <th mat-header-cell *matHeaderCellDef>
                <mat-checkbox
                  (change)="$event ? toggleAllRows() : null"
                  [checked]="selection.hasValue() && isAllSelected()"
                  [indeterminate]="selection.hasValue() && !isAllSelected()"
                  [disabled]="!isMultiSelect"
                >
                </mat-checkbox>
              </th>
              <td mat-cell *matCellDef="let row">
                <mat-checkbox
                  (click)="$event.stopPropagation()"
                  (change)="$event ? selection.toggle(row) : null"
                  [checked]="selection.isSelected(row)"
                  [disabled]="!isMultiSelect"
                >
                </mat-checkbox>
              </td>
            </ng-container>

            <ng-container
              *ngFor="let column of columns"
              [matColumnDef]="column.columnDef"
            >
              <th mat-header-cell *matHeaderCellDef mat-sort-header>
                {{ column.header }}
              </th>
              <td mat-cell *matCellDef="let row">{{ column.cell(row) }}</td>
            </ng-container>

            <tr
              mat-header-row
              *matHeaderRowDef="displayedColumns; sticky: true"
            ></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: displayedColumns"
              (click)="toggleRow(row, $event)"
              [class.selected-row]="selection.isSelected(row)"
              [class.hovered-row]="hoveredRow === row"
              (mouseenter)="hoveredRow = row"
              (mouseleave)="hoveredRow = null"
            ></tr>
          </table>
        </cdk-virtual-scroll-viewport>
        <mat-toolbar class="table-toolbar">
          <mat-slide-toggle [(ngModel)]="isMultiSelect"
            >Multi-Select Mode</mat-slide-toggle
          >
        </mat-toolbar>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="openChildDialog()">Open Child Dialog</button>
      <button mat-button (click)="closeDialog()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-header {
        cursor: move;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 20px;
        background-color: #f5f5f5;
      }
      .dialog-controls {
        display: flex;
      }
      mat-dialog-content {
        padding: 0 !important;
        overflow: hidden !important;
        transition: height 0.3s ease-in-out;
      }
      mat-dialog-content.minimized {
        height: 0 !important;
      }
      .table-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }
      .table-toolbar {
        min-height: 48px;
        padding: 0 16px;
        background-color: #fafafa;
        border: 1px solid #e0e0e0;
      }
      .virtual-scroll-viewport {
        flex: 1;
        width: 100%;
      }
      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
      }
      th,
      td {
        padding: 12px;
        border-bottom: 1px solid #e0e0e0;
        border-right: 1px solid #e0e0e0;
      }
      th:last-child,
      td:last-child {
        border-right: none;
      }
      th {
        background-color: #f5f5f5;
        font-weight: bold;
        text-align: left;
      }
      .selected-row {
        background-color: #e8f0fe;
      }
      .hovered-row {
        background-color: #f5f5f5;
      }
      .mat-column-select {
        overflow: initial;
        width: 50px;
        padding-right: 8px;
      }
    `,
  ],
})
export class TableDialogComponent implements OnInit, OnDestroy, AfterViewInit {
  columns: ColumnDef[] = [];
  displayedColumns: string[] = [];
  dataSource: TableVirtualScrollDataSource<User>;
  selection = new SelectionModel<User>(true, []);
  isMultiSelect = false;
  lastSelectedIndex: number | null = null;
  hoveredRow: User | null = null;
  isMinimized = false;
  private originalSize: {
    width: string;
    height: string;
    transform: string;
  } | null = null;

  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;
  @ViewChild(MatSort) sort!: MatSort;
  private locationSubscription: SubscriptionLike | undefined;

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<TableDialogComponent>,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private location: Location,
    private dialogRegistry: DialogRegistryService,
    public dialog: MatDialog,
    private pdfExportService: PdfExportService
  ) {
    this.dataSource = new TableVirtualScrollDataSource<User>([]);
  }

  ngOnInit() {
    // Push a new state to the history when the dialog opens
    history.pushState(null, "", "");

    // Subscribe to the popstate event
    this.locationSubscription = this.location.subscribe(() => {
      this.closeDialog();
    });

    this.http
      .get<User[]>("https://jsonplaceholder.typicode.com/users")
      .subscribe(
        (data) => {
          const expandedData = Array(50)
            .fill(null)
            .flatMap((_, i) =>
              data.map((user) => ({
                ...user,
                id: user.id + i * data.length,
              })),
            );
          this.dataSource.data = expandedData;
          this.updateDisplayedColumns(expandedData[0]);
        },
        (error) => console.error("Error fetching data:", error),
      );
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
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

  toggleRow(row: User, event: MouseEvent) {
    if (this.isMultiSelect) {
      if (event.ctrlKey || event.metaKey) {
        this.selection.toggle(row);
      } else if (event.shiftKey) {
        this.selectRange(row);
      } else {
        this.selection.clear();
        this.selection.toggle(row);
      }
    } else {
      this.selection.clear();
      this.selection.toggle(row);
    }
    this.lastSelectedIndex = this.dataSource.data.indexOf(row);
    console.log("Selected rows:", this.selection.selected);
  }

  selectRange(row: User) {
    const currentIndex = this.dataSource.data.indexOf(row);
    if (this.lastSelectedIndex !== null) {
      const start = Math.min(this.lastSelectedIndex, currentIndex);
      const end = Math.max(this.lastSelectedIndex, currentIndex);
      for (let i = start; i <= end; i++) {
        this.selection.select(this.dataSource.data[i]);
      }
    } else {
      this.selection.toggle(row);
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach((row) => this.selection.select(row));
    }
  }

  removeSelectedItems() {
    const selectedIds = this.selection.selected.map((item) => item.id);
    this.dataSource.data = this.dataSource.data.filter(
      (item) => !selectedIds.includes(item.id),
    );
    this.selection.clear();
  }

  closeDialog() {
    // Remove the popstate event listener
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }

    this.dialogRef.close(this.selection.selected);
  }

  minimizeDialog() {
    this.isMinimized = !this.isMinimized;
  }

  private isMaximized = false;

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
        // this.renderer.setStyle(
        //   dialogContainer,
        //   "transition",
        //   "all 0.3s ease-in-out",
        // );
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
        // this.renderer.setStyle(
        //   dialogContainer,
        //   "transition",
        //   "all 0.3s ease-in-out",
        // );
        this.isMaximized = false;
      }
    }
  }

  @HostListener("window:keydown", ["$event"])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.selection.clear();
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      this.handleArrowKeyNavigation(event, event.key === "ArrowUp" ? -1 : 1);
    }
  }

  handleArrowKeyNavigation(event: KeyboardEvent, direction: number) {
    const currentIndex =
      this.lastSelectedIndex !== null ? this.lastSelectedIndex : -1;
    const newIndex = Math.max(
      0,
      Math.min(currentIndex + direction, this.dataSource.data.length - 1),
    );

    if (newIndex !== currentIndex) {
      const newRow = this.dataSource.data[newIndex];
      if (
        !this.isMultiSelect ||
        (!event.shiftKey && !event.ctrlKey && !event.metaKey)
      ) {
        this.selection.clear();
      }
      this.selection.toggle(newRow);
      this.lastSelectedIndex = newIndex;

      // Scroll to the selected row
      this.viewport.scrollToIndex(newIndex);
    }
  }

  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks
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

    dialogRef.afterClosed().subscribe((result) => {
      this.dialogRegistry.closeChildDialogs(dialogRef);
      this.dialogRegistry.unregisterDialog(dialogRef);
      console.log("The dialog was closed");
    });
  }

  exportToPDF() {
    const tableData = this.dataSource.data;
    const columns = this.columns.map(col => col.header);
    console.log(tableData, columns);
    this.pdfExportService.exportToPDF(tableData, columns);
  }
}
