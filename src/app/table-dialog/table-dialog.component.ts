import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-table-dialog',
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
    ScrollingModule
  ],
  template: `
    <div class="dialog-header" cdkDrag cdkDragRootElement=".cdk-overlay-pane" cdkDragHandle>
      <h2 mat-dialog-title>User Table</h2>
      <mat-slide-toggle [(ngModel)]="isMultiSelect">Multi-Select</mat-slide-toggle>
    </div>
    <mat-dialog-content>
      <cdk-virtual-scroll-viewport itemSize="48" class="virtual-scroll-viewport">
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox (change)="$event ? toggleAllRows() : null"
                            [checked]="selection.hasValue() && isAllSelected()"
                            [indeterminate]="selection.hasValue() && !isAllSelected()"
                            [disabled]="!isMultiSelect">
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row">
              <mat-checkbox (click)="$event.stopPropagation()"
                            (change)="$event ? selection.toggle(row) : null"
                            [checked]="selection.isSelected(row)"
                            [disabled]="!isMultiSelect">
              </mat-checkbox>
            </td>
          </ng-container>

          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef> ID </th>
            <td mat-cell *matCellDef="let element"> {{element.id}} </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Name </th>
            <td mat-cell *matCellDef="let element"> {{element.name}} </td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef> Email </th>
            <td mat-cell *matCellDef="let element"> {{element.email}} </td>
          </ng-container>

          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef> Phone </th>
            <td mat-cell *matCellDef="let element"> {{element.phone}} </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              (click)="toggleRow(row)"
              [class.selected-row]="selection.isSelected(row)">
          </tr>
        </table>
      </cdk-virtual-scroll-viewport>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="closeDialog()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      cursor: move;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      background-color: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }
    .virtual-scroll-viewport {
      height: 400px;
      width: 100%;
    }
    table {
      width: 100%;
    }
    .selected-row {
      background-color: #f5f5f5;
    }
    mat-dialog-content {
      max-height: 400px;
      overflow: hidden;
    }
    .mat-column-select {
      overflow: initial;
    }
  `]
})
export class TableDialogComponent implements OnInit {
  displayedColumns: string[] = ['select', 'id', 'name', 'email', 'phone'];
  dataSource: MatTableDataSource<User>;
  selection = new SelectionModel<User>(true, []);
  isMultiSelect = false;

  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<TableDialogComponent>
  ) {
    this.dataSource = new MatTableDataSource<User>([]);
  }

  ngOnInit() {
    this.http.get<User[]>('https://jsonplaceholder.typicode.com/users')
      .subscribe(
        (data) => {
          // Simulate a larger dataset by duplicating the data
          // const expandedData = Array(50).fill(null).flatMap(() => data);
          const expandedData = Array(50).fill(null).flatMap((_, i) =>
              data.map(user => ({
                ...user,
                id: user.id + i * data.length // Adjust IDs to ensure uniqueness
              }))
          );
          this.dataSource.data = expandedData;

        },
        (error) => console.error('Error fetching data:', error)
      );
  }

  toggleRow(row: User) {
    if (this.isMultiSelect) {
      this.selection.toggle(row);
    } else {
      this.selection.clear();
      this.selection.toggle(row);
    }
    console.log('Selected rows:', this.selection.selected);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  closeDialog() {
    this.dialogRef.close(this.selection.selected);
  }
}
