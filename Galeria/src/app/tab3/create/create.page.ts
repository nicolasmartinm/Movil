import { Component, OnInit } from '@angular/core';
import { getDatabase, ref, push } from "firebase/database";
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule]
})
export class CreatePage implements OnInit {
  infoForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.infoForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {}

  saveInfo() {
    if (this.infoForm.valid) {
      const db = getDatabase();
      const infosRef = ref(db, 'infos/');
      push(infosRef, {
        info_title: this.infoForm.value.title,
        info_description: this.infoForm.value.description
      }).then(() => {
        console.log('Info created:', this.infoForm.value);
        this.router.navigate(['/tabs/tab3']);
      }).catch((error) => {
        console.error('Error creating info:', error);
      });
    }
  }
}


