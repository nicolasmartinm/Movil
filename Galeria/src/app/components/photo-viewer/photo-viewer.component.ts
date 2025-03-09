import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { UserPhoto, PhotoService } from '../../services/photo.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-photo-viewer',
  templateUrl: './photo-viewer.component.html',
  styleUrls: ['./photo-viewer.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PhotoViewerComponent {
  @Input() photos: UserPhoto[] = [];
  @Input() currentIndex: number = 0;

  constructor(private modalController: ModalController, private photoService: PhotoService) {}

  close() {
    this.modalController.dismiss();
  }

  next() {
    if (this.currentIndex < this.photos.length - 1) {
      this.currentIndex++;
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  get currentPhoto() {
    return this.photos[this.currentIndex];
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  addPhotoFromGallery() {
    this.photoService.addPhotoFromGallery();
  }
}