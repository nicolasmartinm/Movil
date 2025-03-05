import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { DataSnapshot, getDatabase, onValue, ref, set } from "firebase/database";

const db = getDatabase();

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
  standalone: false, 
})
export class EditPage implements OnInit {

  info: any = {};

  infoForm = this.formBuilder.group({
    info_title: [null, Validators.required],
    info_description: [null, Validators.required]
  });

  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { 
    
    this.getInfo();
  }
  getInfo() {
    const infoRef = ref(db, 'infos/' + this.route.snapshot.paramMap.get('id'));
    onValue(infoRef, (snapshot) => {
      this.info = snapshotToObject(snapshot);
      this.infoForm.controls['info_title'].setValue(this.info.info_title);
      this.infoForm.controls['info_description'].setValue(this.info.info_description);
    });
  }
  updateInfo() {
    set(ref(db, 'infos/' + this.route.snapshot.paramMap.get('id')), this.infoForm.value)
      .then(() => {
        this.router.navigate(['/detail', { id: this.route.snapshot.paramMap.get('id') }]);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  

  ngOnInit() {
  }

}
export const snapshotToObject = (snapshot: DataSnapshot) => {
  let item = snapshot.val();
  item.key = snapshot.key;

  return item;
}
