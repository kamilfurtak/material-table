import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { User } from '../models/user.model';
import { TableStateService } from './table-state.service';
import { UserService } from '../services/user.service';
import { PdfExportService } from './pdf-export.service';

@Component({
  selector: 'lib-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    FormsModule,
    ScrollingModule,
    MatSortModule,
    TableVirtualScrollModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent implements OnInit, AfterViewInit {
  hoveredRow: User | null = null;
  isMultiSelect = false;

  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public tableState: TableStateService,
    private userService: UserService,
    private pdfExportService: PdfExportService,
  ) {}

  ngOnInit() {
    this.userService.getUsers().subscribe(
      (data) => {
        this.tableState.updateData(data);
        this.tableState.updateDisplayedColumns(data[0]);
      },
      (error) => console.error('Error fetching data:', error),
    );
  }

  ngAfterViewInit() {
    this.tableState.dataSource.sort = this.sort;
  }

  toggleRow(row: User, event: MouseEvent) {
    if (this.isMultiSelect) {
      if (event.ctrlKey || event.metaKey) {
        this.tableState.selection.toggle(row);
      } else if (event.shiftKey) {
        this.tableState.selectRange(
          this.tableState.dataSource.data.indexOf(row),
        );
      } else {
        this.tableState.selection.clear();
        this.tableState.selection.toggle(row);
      }
    } else {
      this.tableState.selection.clear();
      this.tableState.selection.toggle(row);
    }
    this.tableState.lastSelectedIndex =
      this.tableState.dataSource.data.indexOf(row);
  }

  handleArrowNavigation(direction: number, event: any) {
    const newIndex = this.tableState.handleArrowKeyNavigation(
      direction,
      this.isMultiSelect,
      event,
    );
    this.tableState.lastSelectedIndex = newIndex;
    this.viewport.scrollToIndex(newIndex);
  }

  exportToPDF() {
    const tableData = this.tableState.dataSource.data;
    const columns = this.tableState.columns.map((col) => col.header);
    this.pdfExportService.exportToPDF(tableData, columns);
  }
}
