import { Routes } from '@angular/router';
import { CafeProfilePage } from './pages/cafe-profile-page/cafe-profile-page';
import { CafeProfileRepository } from './services/cafe-profile.repository';
import { CafeProfileStore } from './services/cafe-profile.store';
import { HttpCafeProfileRepository } from './services/http-cafe-profile.repository';

export default [
  {
    path: '',
    component: CafeProfilePage,
    providers: [
      { provide: CafeProfileRepository, useClass: HttpCafeProfileRepository },
      CafeProfileStore,
    ],
  },
] satisfies Routes;
