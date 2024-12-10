import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
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
    styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit, OnDestroy {
  isMinimized = false;
  private isMaximized = false;
  private locationSubscription: SubscriptionLike | undefined;
  private originalHeight: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<DialogComponent>,
    private elementRef: ElementRef,
    private location: Location,
    private dialogService: DialogService,
    private dialogRegistry: DialogRegistryService,
    private renderer: Renderer2,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
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
    const dialogContainer = this.elementRef.nativeElement.closest('.cdk-overlay-pane');
    if (!dialogContainer) return;

    if (!this.isMinimized) {
      this.originalHeight = dialogContainer.style.height;
      this.renderer.setStyle(dialogContainer, 'height', '64px');
    } else {
      this.renderer.setStyle(dialogContainer, 'height', this.originalHeight);
    }
    
    this.isMinimized = !this.isMinimized;
  }

  maximizeDialog() {
    const dialogContainer = this.elementRef.nativeElement.closest('.cdk-overlay-pane');
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