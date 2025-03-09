import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PhotoService, UserPhoto } from '../../services/photo.service';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ActionSheetController, ModalController } from '@ionic/angular';
import { PhotoViewerComponent } from '../../components/photo-viewer/photo-viewer.component';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, PhotoViewerComponent]
})
export class DetailPage implements OnInit {
  photos: UserPhoto[] = [];
  title: string = '';
  description: string = '';
  listId: string = '';
  isEditingTitle: boolean = false;
  isEditingDescription: boolean = false;

  constructor(
    private photoService: PhotoService,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.listId = this.route.snapshot.paramMap.get('id') || '';
    if (this.listId) {
      this.loadListDetails(this.listId);
      this.loadPhotosForList(this.listId);
    }
  }

  private loadListDetails(id: string) {
    const db = getDatabase();
    const listRef = ref(db, `infos/${id}`);
    onValue(listRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.title = data.info_title;
        this.description = data.info_description;
      }
    });
  }

  private async loadPhotosForList(listId: string) {
    await this.photoService.loadSaved();
    this.photos = this.photoService.getPhotosForList(listId);
  }

  async presentPhotoOptions(photo: UserPhoto, index: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photo Options',
      buttons: [
        {
          text: 'View',
          icon: 'eye',
          handler: () => {
            this.viewPhoto(index);
          }
        },
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.deletePhotoFromList(photo, index);
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async viewPhoto(index: number) {
    const modal = await this.modalController.create({
      component: PhotoViewerComponent,
      componentProps: {
        photos: this.photos,
        currentIndex: index
      }
    });
    return await modal.present();
  }

  async deletePhotoFromList(photo: UserPhoto, index: number) {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to delete this photo?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Delete cancelled');
          }
        }, {
          text: 'Okay',
          handler: async () => {
            await this.photoService.deletePhotoFromList(photo, this.listId);
            this.photos = this.photoService.getPhotosForList(this.listId);
          }
        }
      ]
    });

    await alert.present();
  }

  editList() {
    if (this.listId) {
      this.router.navigate(['/edit', this.listId]);
    }
  }

  enableEditTitle() {
    this.isEditingTitle = true;
  }

  async saveTitle() {
    this.isEditingTitle = false;
    const db = getDatabase();
    const listRef = ref(db, `infos/${this.listId}`);
    await update(listRef, { info_title: this.title });
  }

  enableEditDescription() {
    this.isEditingDescription = true;
  }

  async saveDescription() {
    this.isEditingDescription = false;
    const db = getDatabase();
    const listRef = ref(db, `infos/${this.listId}`);
    await update(listRef, { info_description: this.description });
  }
}