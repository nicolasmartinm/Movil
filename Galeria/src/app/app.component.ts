import { Component } from '@angular/core';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'FIREBASE_WEB_APIKEY',
  databaseURL: 'https://carpetas-22bc3-default-rtdb.firebaseio.com/',
};

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})

export class AppComponent {
  constructor() {

    initializeApp(firebaseConfig);

  }
}
