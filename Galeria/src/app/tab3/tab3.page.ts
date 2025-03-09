import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PhotoService, UserPhoto } from '../services/photo.service';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Asegúrate de importar RouterModule

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule] // Asegúrate de que RouterModule esté incluido
})
export class Tab3Page implements OnInit {
  public lists: { id: string, name: string, description: string }[] = [];
  public isGridView: boolean = true;

  constructor(private router: Router, private photoService: PhotoService, private alertController: AlertController) {
    this.loadLists();
  }

  ngOnInit() {}

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
      this.sortLists();
      console.log('Lists loaded in Tab3:', this.lists);
    }, {
      onlyOnce: false
    });
  }

  sortLists() {
    this.lists.sort((a, b) => {
      const aHasPhotos = this.photoService.selectedListPhotos[a.id] && this.photoService.selectedListPhotos[a.id].length > 0;
      const bHasPhotos = this.photoService.selectedListPhotos[b.id] && this.photoService.selectedListPhotos[b.id].length > 0;
      return aHasPhotos === bHasPhotos ? 0 : aHasPhotos ? -1 : 1;
    });
  }

  getFirstPhoto(listId: string): string {
    const photos = this.photoService.selectedListPhotos[listId] || [];
    return photos.length > 0 ? photos[0].webviewPath : 'assets/placeholder.png';
  }

  getPhotosForList(listId: string): UserPhoto[] {
    const photos = this.photoService.selectedListPhotos[listId] || [];
    console.log(`Photos for list ${listId}:`, photos);
    return photos;
  }

  goToDetail(listId: string) {
    this.router.navigate(['/detail', listId]);
  }

  toggleView() {
    this.isGridView = !this.isGridView;
  }

  async delete(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure want to delete this info?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('cancel');
          }
        }, {
          text: 'Okay',
          handler: () => {
            const db = getDatabase();
            const deleteRef = ref(db, 'infos/' + id);
            remove(deleteRef).then(() => {
              console.log('Info deleted:', id);
              this.loadLists();
            }).catch((error) => {
              console.error('Error deleting info:', error);
            });
          }
        }
      ]
    });

    await alert.present();
  }

  addNewList() {
    this.router.navigate(['/create']);
  }

  addInfo() {
    this.router.navigate(['/add-info']);
  }

  editList(listId: string) {
    this.router.navigate(['/edit', listId]);
  }

  async selectPhoto(photo: UserPhoto) {
    const listName = 'myPhotoList';
    await this.photoService.addPhotoToList(photo, listName);
  }
}


