import { Injectable } from "@angular/core";
import { SelectionModel } from "@angular/cdk/collections";
import { ColumnDef, User } from "../../models/user.model";
import { TableVirtualScrollDataSource } from "ng-table-virtual-scroll";

@Injectable({
  providedIn: "root",
})
export class TableStateService {
  dataSource = new TableVirtualScrollDataSource<User>([]);
  selection = new SelectionModel<User>(true, []);
  lastSelectedIndex: number | null = null;
  columns: ColumnDef[] = [];
  displayedColumns: string[] = [];

  updateData(data: User[]) {
    this.dataSource.data = data;
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

  removeSelectedItems() {
    const selectedIds = this.selection.selected.map((item) => item.id);
    this.dataSource.data = this.dataSource.data.filter(
      (item) => !selectedIds.includes(item.id),
    );
    this.selection.clear();
  }

  isAllSelected(): boolean {
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

  selectRange(currentIndex: number) {
    if (this.lastSelectedIndex !== null) {
      const start = Math.min(this.lastSelectedIndex, currentIndex);
      const end = Math.max(this.lastSelectedIndex, currentIndex);
      for (let i = start; i <= end; i++) {
        this.selection.select(this.dataSource.data[i]);
      }
    }
  }

  handleArrowKeyNavigation(
    direction: number,
    isMultiSelect: boolean,
    event: KeyboardEvent,
  ): number {
    const currentIndex =
      this.lastSelectedIndex !== null ? this.lastSelectedIndex : -1;
    const newIndex = Math.max(
      0,
      Math.min(currentIndex + direction, this.dataSource.data.length - 1),
    );

    if (newIndex !== currentIndex) {
      const newRow = this.dataSource.data[newIndex];
      if (
        !isMultiSelect ||
        (!event.shiftKey && !event.ctrlKey && !event.metaKey)
      ) {
        this.selection.clear();
      }
      this.selection.toggle(newRow);
    }

    return newIndex;
  }
}
