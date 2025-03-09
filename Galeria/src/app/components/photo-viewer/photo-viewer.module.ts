import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PhotoViewerComponent } from './photo-viewer.component';

@NgModule({
  imports: [CommonModule, IonicModule, PhotoViewerComponent], // Import the standalone component
  exports: [PhotoViewerComponent] // Export the standalone component
})
export class PhotoViewerModule {}
