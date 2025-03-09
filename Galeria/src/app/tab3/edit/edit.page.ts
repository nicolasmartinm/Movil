import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PhotoService, UserPhoto } from '../../services/photo.service';
import { getDatabase, ref, onValue, update } from 'firebase/database';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule]
})
export class EditPage implements OnInit {
  infoForm: FormGroup;
  itemId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private photoService: PhotoService
  ) {
    this.infoForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.itemId = this.route.snapshot.paramMap.get('id');
    if (this.itemId) {
      this.loadItemDetails(this.itemId);
    }
  }

  loadItemDetails(itemId: string) {
    const db = getDatabase();
    const itemRef = ref(db, `infos/${itemId}`);
    onValue(itemRef, (snapshot) => {
      const item = snapshot.val();
      if (item) {
        this.infoForm.patchValue({
          title: item.info_title,
          description: item.info_description
        });
      }
    });
  }

  getPhotosForList(listId: string | null): UserPhoto[] {
    if (!listId) return [];
    const photos = this.photoService.selectedListPhotos[listId] || [];
    console.log(`Photos for list ${listId}:`, photos);
    return photos;
  }

  saveInfo() {
    if (this.infoForm.valid && this.itemId) {
      const db = getDatabase();
      const itemRef = ref(db, `infos/${this.itemId}`);
      update(itemRef, {
        info_title: this.infoForm.value.title,
        info_description: this.infoForm.value.description
      }).then(() => {
        console.log('Info updated:', this.infoForm.value);
        this.router.navigate(['/tabs/tab3']);
      }).catch((error) => {
        console.error('Error updating info:', error);
      });
    }
  }
}
