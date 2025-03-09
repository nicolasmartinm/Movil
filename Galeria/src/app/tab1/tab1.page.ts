import { Component } from '@angular/core';
import { PhotoService } from 'src/app/services/photo.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  constructor(private photoService: PhotoService) {}

  async addPhotoFromGallery() {
    await this.photoService.addPhotoFromGallery();
  }
}
