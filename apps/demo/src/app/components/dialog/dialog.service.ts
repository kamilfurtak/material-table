import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private renderer: Renderer2;
  private originalSize: {
    width: string;
    height: string;
    transform: string;
  } | null = null;

  constructor(
    private dialog: MatDialog,
    rendererFactory: RendererFactory2,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  openDialog(options: { width: string; height: string; title: string }) {
    return this.dialog.open(DialogComponent, {
      width: options.width,
      height: options.height,
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'draggable-dialog',
      hasBackdrop: false,
      data: { title: options.title },
    });
  }

  toggleMaximize(dialogContainer: HTMLElement, isMaximized: boolean): boolean {
    if (!isMaximized) {
      const computedStyle = window.getComputedStyle(dialogContainer);
      this.originalSize = {
        width: dialogContainer.style.width || computedStyle.width,
        height: dialogContainer.style.height || computedStyle.height,
        transform: dialogContainer.style.transform || computedStyle.transform,
      };

      this.renderer.setStyle(dialogContainer, 'width', '100vw');
      this.renderer.setStyle(dialogContainer, 'height', '100vh');
      this.renderer.setStyle(dialogContainer, 'transform', 'none');
      return true;
    } else {
      this.renderer.setStyle(
        dialogContainer,
        'width',
        this.originalSize!.width,
      );
      this.renderer.setStyle(
        dialogContainer,
        'height',
        this.originalSize!.height,
      );
      this.renderer.setStyle(
        dialogContainer,
        'transform',
        this.originalSize!.transform,
      );
      return false;
    }
  }
}
