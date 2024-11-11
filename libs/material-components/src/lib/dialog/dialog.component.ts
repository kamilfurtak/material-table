import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SubscriptionLike } from 'rxjs';

import { DialogService } from './dialog.service';
import { DialogRegistryService } from './dialog-registry.service';
import { DataTableComponent } from '../data-table/data-table.component';

interface DialogData {
  title: string;
}

@Component({
  selector: 'app-dialog',
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
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements OnInit, OnDestroy {
  isMinimized = false;
  private isMaximized = false;
  private locationSubscription: SubscriptionLike | undefined;

  constructor(
    private dialogRef: MatDialogRef<DialogComponent>,
    private elementRef: ElementRef,
    private location: Location,
    private dialogService: DialogService,
    private dialogRegistry: DialogRegistryService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    // Set up dialog close handler
    this.dialogRef.beforeClosed().subscribe(() => {
      this.dialogRegistry.closeChildDialogs(this.dialogRef);
      this.dialogRegistry.unregisterDialog(this.dialogRef);
    });
  }

  ngOnInit() {
    history.pushState(null, '', '');
    this.locationSubscription = this.location.subscribe(() => {
      this.closeDialog();
    });
  }

  closeDialog() {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
    this.dialogRef.close();
  }

  minimizeDialog() {
    this.isMinimized = !this.isMinimized;
  }

  maximizeDialog() {
    const dialogContainer =
      this.elementRef.nativeElement.closest('.cdk-overlay-pane');
    if (dialogContainer) {
      this.isMaximized = this.dialogService.toggleMaximize(
        dialogContainer,
        this.isMaximized,
      );
    }
  }

  openChildDialog() {
    const dialogRef = this.dialogService.openDialog({
      width: '900px',
      height: '700px',
      title: this.data.title,
    });

    this.dialogRegistry.registerDialog(dialogRef, this.dialogRef);
  }

  ngOnDestroy() {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
  }
}
