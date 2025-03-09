import { Component, OnInit } from '@angular/core';
import { PhotoService, UserPhoto } from '../services/photo.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ActionSheetController, ModalController } from '@ionic/angular';
import { getDatabase, onValue, ref } from 'firebase/database';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PhotoViewerModule } from '../components/photo-viewer/photo-viewer.module';
import { PhotoViewerComponent } from '../components/photo-viewer/photo-viewer.component';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, PhotoViewerModule]
})
export class Tab2Page implements OnInit {
  public lists: { id: string, name: string, description: string }[] = [];
  public isGridView: boolean = true;
  photos: UserPhoto[] = [];

  constructor(
    private photoService: PhotoService,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private router: Router
  ) {
    this.loadLists();
  }

  ngOnInit() {
    this.loadPhotos();
  }

  loadLists() {
    const db = getDatabase();
    const listsRef = ref(db, 'infos/');
    onValue(listsRef, (snapshot) => {
      this.lists = [];
      snapshot.forEach((childSnapshot) => {
        this.lists.push({
          id: childSnapshot.key,
          name: childSnapshot.val().info_title,
          description: childSnapshot.val().info_description
        });
      });
      console.log('Lists loaded in Tab2:', this.lists); // Debugging line
    }, {
      onlyOnce: false
    });
  }

  async loadPhotos() {
    await this.photoService.loadSaved();
    this.photos = this.photoService.getPhotos();
  }

  async addPhotoToGallery() {
    await this.photoService.addNewToGallery();
    this.photos = this.photoService.getPhotos(); // Update the photos array after adding a new photo
  }

  async selectExistingPhoto() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      quality: 100
    });

    await this.photoService.savePicture(capturedPhoto);
    this.photos = this.photoService.getPhotos(); // Update the photos array after selecting a new photo
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
          text: 'Add to List',
          icon: 'add',
          handler: () => {
            this.selectPhoto(photo);
          }
        },
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.deletePhoto(photo, index);
          }
        },
        {
          text: 'Select Existing Photo',
          icon: 'images',
          handler: () => {
            this.selectExistingPhoto();
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

  async deletePhoto(photo: UserPhoto, index: number) {
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
            await this.photoService.deletePicture(photo, index);
            this.photos = this.photoService.getPhotos();
          }
        }
      ]
    });

    await alert.present();
  }

  async selectPhoto(photo: UserPhoto) {
    console.log('Lists in selectPhoto:', this.lists); // Debugging line
    const alertInputs = this.lists.map((list: { id: string, name: string }) => ({
      name: list.name,
      type: 'radio' as const, // Ensure the type is 'radio'
      label: list.name,
      value: list.id,
      checked: false
    }));

    const alert = await this.alertController.create({
      header: 'Select List',
      inputs: alertInputs,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Ok',
          handler: (listId: string) => {
            const selectedList = this.lists.find((list: { id: string, name: string }) => list.id === listId);
            if (selectedList) {
              this.photoService.addPhotoToList(photo, listId);
              console.log('Photo added to list:', selectedList.name); // Debugging line
              console.log('Current photos in list:', this.photoService.getPhotosForList(listId)); // Debugging line
            }
          }
        }
      ]
    });

    await alert.present();
  }

  navigateToDetail(id: string) {
    this.router.navigate(['/detail', id]);
  }
}
