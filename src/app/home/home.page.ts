import { Component } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { getDatabase, onValue, ref, remove } from "firebase/database";

const db = getDatabase();
const dbRef = ref(db, 'infos/');

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

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
            const deleteRef = ref(db, 'infos/' + id);
            remove(deleteRef);
          }
        }
      ]
    });

    await alert.present();
  }

  infos: any[] = [];

  constructor(private router: Router, private loadingController: LoadingController, private alertController: AlertController) {
    onValue(dbRef, (snapshot) => {
      this.infos = [];
      snapshot.forEach((childSnapshot) => {
        this.infos.push({
          id: childSnapshot.key,
          info_title: childSnapshot.val().info_title,
          info_description: childSnapshot.val().info_description
        });
      });
    }, {
      onlyOnce: false
    });
  }
  
   addInfo() {
     this.router.navigate(['/add-info']);
  }

  edit(id: string) {
    this.router.navigate(['/edit', { id: id }]);
  }

  

}

