import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogRegistryService {
  private dialogMap = new Map<MatDialogRef<any>, Set<MatDialogRef<any>>>();
  private parentMap = new Map<MatDialogRef<any>, MatDialogRef<any>>();

  registerDialog(
    dialogRef: MatDialogRef<any>,
    parentDialogRef?: MatDialogRef<any>,
  ) {
    if (parentDialogRef) {
      if (!this.dialogMap.has(parentDialogRef)) {
        this.dialogMap.set(parentDialogRef, new Set());
      }
      this.dialogMap.get(parentDialogRef)!.add(dialogRef);
      this.parentMap.set(dialogRef, parentDialogRef);
    }
    this.dialogMap.set(dialogRef, new Set());
  }

  unregisterDialog(dialogRef: MatDialogRef<any>) {
    // Remove from parent's children set
    const parentRef = this.parentMap.get(dialogRef);
    if (parentRef) {
      const parentChildren = this.dialogMap.get(parentRef);
      if (parentChildren) {
        parentChildren.delete(dialogRef);
      }
      this.parentMap.delete(dialogRef);
    }

    // Close all child dialogs recursively
    this.closeChildDialogs(dialogRef);

    // Remove dialog's own entry from the map
    this.dialogMap.delete(dialogRef);
  }

  closeChildDialogs(dialogRef: MatDialogRef<any>) {
    const children = this.dialogMap.get(dialogRef);
    if (children) {
      // Create a new array from the Set to avoid modification during iteration
      Array.from(children).forEach((childRef) => {
        childRef.close();
        this.closeChildDialogs(childRef);
      });
      children.clear();
    }
  }

  getParentDialog(dialogRef: MatDialogRef<any>): MatDialogRef<any> | undefined {
    return this.parentMap.get(dialogRef);
  }

  hasChildDialogs(dialogRef: MatDialogRef<any>): boolean {
    const children = this.dialogMap.get(dialogRef);
    return children ? children.size > 0 : false;
  }
}
