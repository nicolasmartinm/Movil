import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PhotoService, UserPhoto } from '../../services/photo.service';
import { getDatabase, ref, onValue } from 'firebase/database';
import { IonicModule, ActionSheetController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class DetailPage implements OnInit {
  public info: { id: string, info_title: string, info_description: string } = { id: '', info_title: '', info_description: '' };
  listId: string | null = null;

  constructor(private route: ActivatedRoute, private photoService: PhotoService, private actionSheetController: ActionSheetController) { }

  ngOnInit() {
    this.listId = this.route.snapshot.paramMap.get('id');
    if (this.listId) {
      this.loadInfo(this.listId);
    }
  }

  loadInfo(id: string) {
    const db = getDatabase();
    const infoRef = ref(db, 'infos/' + id);
    onValue(infoRef, (snapshot) => {
      const data = snapshot.val();
      this.info = {
        id: id,
        info_title: data.info_title,
        info_description: data.info_description
      };
    });
  }

  getPhotosForList(listId: string): UserPhoto[] {
    return this.photoService.selectedListPhotos[listId] || [];
  }

  async showActionSheet(photo: UserPhoto) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photo Options',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.deletePhoto(photo);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  deletePhoto(photo: UserPhoto) {
    const listId = this.info.id;
    const photoIndex = this.photoService.selectedListPhotos[listId].indexOf(photo);
    if (photoIndex > -1) {
      this.photoService.selectedListPhotos[listId].splice(photoIndex, 1);
      this.photoService.saveListPhotos();
    }
  }
}
