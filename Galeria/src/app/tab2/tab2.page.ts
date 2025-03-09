import { Component } from '@angular/core';
import { ActionSheetController, AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhotoService, UserPhoto } from '../services/photo.service';
import { getDatabase, onValue, ref } from 'firebase/database';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab2Page {
  public lists: { id: string, name: string }[] = [];
  public isGridView: boolean = true;

  constructor(public photoService: PhotoService, public actionSheetController: ActionSheetController, private alertController: AlertController) {
    this.loadLists();
  }

  loadLists() {
    const db = getDatabase();
    const listsRef = ref(db, 'infos/');
    onValue(listsRef, (snapshot) => {
      this.lists = [];
      snapshot.forEach((childSnapshot) => {
        this.lists.push({
          id: childSnapshot.key,
          name: childSnapshot.val().info_title // Use info_title as the name
        });
      });
      console.log('Lists loaded in Tab2:', this.lists); // Debugging line
    }, {
      onlyOnce: false
    });
  }

  async addPhotoToGallery() {
    await this.photoService.addNewToGallery();
  }

  async showActionSheet(photo: UserPhoto) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photo Options',
      buttons: [
        {
          text: 'Add to List',
          handler: () => {
            this.selectPhoto(photo);
          }
        },
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
              if (!this.photoService.selectedListPhotos[listId]) {
                this.photoService.selectedListPhotos[listId] = [];
              }
              this.photoService.selectedListPhotos[listId].push(photo);
              this.photoService.saveListPhotos();
              console.log('Photo added to list:', selectedList.name); // Debugging line
              console.log('Current photos in list:', this.photoService.selectedListPhotos[listId]); // Debugging line
            }
          }
        }
      ]
    });

    await alert.present();
  }

  deletePhoto(photo: UserPhoto) {
    const photoIndex = this.photoService.photos.indexOf(photo);
    if (photoIndex > -1) {
      this.photoService.photos.splice(photoIndex, 1);
      Preferences.set({
        key: this.photoService.getPhotoStorageKey(),
        value: JSON.stringify(this.photoService.photos)
      });
    }
  }
}
