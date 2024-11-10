import { Injectable } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Injectable({
  providedIn: "root",
})
export class DialogRegistryService {
  private dialogMap = new Map<MatDialogRef<any>, Set<MatDialogRef<any>>>();

  registerDialog(
    dialogRef: MatDialogRef<any>,
    parentDialogRef?: MatDialogRef<any>,
  ) {
    if (parentDialogRef) {
      if (!this.dialogMap.has(parentDialogRef)) {
        this.dialogMap.set(parentDialogRef, new Set());
      }
      this.dialogMap.get(parentDialogRef)!.add(dialogRef);
    }
    this.dialogMap.set(dialogRef, new Set());
  }

  unregisterDialog(dialogRef: MatDialogRef<any>) {
    this.dialogMap.delete(dialogRef);
    for (const [parent, children] of this.dialogMap.entries()) {
      if (children.has(dialogRef)) {
        children.delete(dialogRef);
        break;
      }
    }
  }

  closeChildDialogs(dialogRef: MatDialogRef<any>) {
    const children = this.dialogMap.get(dialogRef);
    if (children) {
      children.forEach((childRef) => {
        childRef.close();
        this.closeChildDialogs(childRef);
      });
      children.clear();
    }
  }
}
