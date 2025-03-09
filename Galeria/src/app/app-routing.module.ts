import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'create',
    loadChildren: () => import('./tab3/create/create.module').then(m => m.CreatePageModule)
  },
  {
    path: 'detail/:id',
    loadChildren: () => import('./tab3/detail/detail.module').then(m => m.DetailPageModule)
  },
  {
    path: 'edit/:id',
    loadChildren: () => import('./tab3/edit/edit.module').then(m => m.EditPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
