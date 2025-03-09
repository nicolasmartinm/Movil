import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Camera, CameraResultType, CameraSource, Photo, PermissionStatus } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { getDatabase, onValue, ref } from 'firebase/database';

export interface UserPhoto {
  filepath: string;
  webviewPath: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';
  private LIST_PHOTOS_STORAGE: string = 'listPhotos';
  public selectedListPhotos: { [key: string]: UserPhoto[] } = {}; // Store photos for each list
  public lists: { id: string, name: string }[] = [];

  constructor(private platform: Platform) {
    this.loadLists();
    this.loadSaved();
  }

  private loadLists() {
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
      console.log('Lists loaded:', this.lists); // Debugging line
    }, {
      onlyOnce: false
    });
  }

  private async checkCameraPermissions(): Promise<PermissionStatus> {
    const status = await Camera.checkPermissions();
    console.log('Camera permissions:', status);
    return status;
  }

  public async addNewToGallery() {
    const permissions = await this.checkCameraPermissions();

    if (permissions.camera === 'granted' && permissions.photos === 'granted') {
      const capturedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 100
      });

      const savedImageFile = await this.savePicture(capturedPhoto);
      this.photos.unshift(savedImageFile);

      try {
        await Preferences.set({
          key: this.PHOTO_STORAGE,
          value: JSON.stringify(this.photos),
        });
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          // Clear storage and try again
          await this.clearStorage();
          this.photos.unshift(savedImageFile);
          await Preferences.set({
            key: this.PHOTO_STORAGE,
            value: JSON.stringify(this.photos),
          });
        } else {
          throw e;
        }
      }
    } else {
      console.error('Permissions not granted');
    }
  }

  public async addPhotoFromGallery() {
    const permissions = await this.checkCameraPermissions();

    if (permissions.photos === 'granted') {
      const selectedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        quality: 100
      });

      const savedImageFile = await this.savePicture(selectedPhoto);
      this.photos.unshift(savedImageFile);

      try {
        await Preferences.set({
          key: this.PHOTO_STORAGE,
          value: JSON.stringify(this.photos),
        });
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          // Clear storage and try again
          await this.clearStorage();
          this.photos.unshift(savedImageFile);
          await Preferences.set({
            key: this.PHOTO_STORAGE,
            value: JSON.stringify(this.photos),
          });
        } else {
          throw e;
        }
      }
    } else {
      console.error('Permissions not granted');
    }
  }

  public async savePicture(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);

    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath || '' // Ensure webviewPath is always a string
    };
  }

  private async readAsBase64(photo: Photo) {
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path!
      });
      return file.data;
    } else {
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();
      return await this.convertBlobToBase64(blob) as string;
    }
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  public async loadSaved() {
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];

    const listPhotosValue = localStorage.getItem(this.LIST_PHOTOS_STORAGE);
    this.selectedListPhotos = listPhotosValue ? JSON.parse(listPhotosValue) : {};

    if (!this.platform.is('hybrid')) {
      for (let photo of this.photos) {
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
        });

        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }

  public async saveListPhotos() {
    localStorage.setItem(this.LIST_PHOTOS_STORAGE, JSON.stringify(this.selectedListPhotos));
  }

  public async deletePicture(photo: UserPhoto, index: number) {
    this.photos.splice(index, 1);
    await Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });

    // Delete the photo file from the filesystem
    await Filesystem.deleteFile({
      path: photo.filepath,
      directory: Directory.Data
    });

    // Remove the photo from all lists
    for (const listId in this.selectedListPhotos) {
      this.selectedListPhotos[listId] = this.selectedListPhotos[listId].filter(p => p.filepath !== photo.filepath);
    }
    await this.saveListPhotos();
  }

  public async deletePhotoFromList(photo: UserPhoto, listId: string) {
    if (this.selectedListPhotos[listId]) {
      this.selectedListPhotos[listId] = this.selectedListPhotos[listId].filter(p => p.filepath !== photo.filepath);
      await this.saveListPhotos();
    }
  }

  public async addPhotoToList(photo: UserPhoto, listId: string) {
    if (!this.selectedListPhotos[listId]) {
      this.selectedListPhotos[listId] = [];
    }
    this.selectedListPhotos[listId].push(photo);
    await this.saveListPhotos();
  }

  public getPhotosForList(listId: string): UserPhoto[] {
    return this.selectedListPhotos[listId] || [];
  }

  public getPhotoStorageKey(): string {
    return this.PHOTO_STORAGE;
  }

  getPhotos(): UserPhoto[] {
    return this.photos;
  }

  private async clearStorage() {
    await Preferences.clear();
    this.photos = [];
    this.selectedListPhotos = {};
  }
}
