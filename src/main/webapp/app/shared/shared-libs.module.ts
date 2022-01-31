import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgJhipsterModule } from 'ng-jhipster';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CookieModule } from 'ngx-cookie';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import {
  faUser,
  faSort,
  faSortUp,
  faSortDown,
  faSync,
  faEye,
  faBan,
  faTimes,
  faArrowLeft,
  faSave,
  faPlus,
  faPencilAlt,
  faBars,
  faThList,
  faUserPlus,
  faRoad,
  faTachometerAlt,
  faHeart,
  faList,
  faBell,
  faBook,
  faHdd,
  faFlag,
  faWrench,
  faClock,
  faCloud,
  faSignOutAlt,
  faSignInAlt,
  faCalendarAlt,
  faSearch,
  faTrashAlt,
  faAsterisk,
  faTasks,
  faHome
} from '@fortawesome/free-solid-svg-icons';

@NgModule({
  imports: [NgbModule, InfiniteScrollModule, CookieModule.forRoot(), FontAwesomeModule],
  exports: [
    FormsModule,
    CommonModule,
    NgbModule,
    NgJhipsterModule,
    InfiniteScrollModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    TranslateModule
  ]
})
export class GatewaySharedLibsModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faUser);
    library.addIcons(faSort);
    library.addIcons(faSortUp);
    library.addIcons(faSortDown);
    library.addIcons(faSync);
    library.addIcons(faEye);
    library.addIcons(faBan);
    library.addIcons(faTimes);
    library.addIcons(faArrowLeft);
    library.addIcons(faSave);
    library.addIcons(faPlus);
    library.addIcons(faPencilAlt);
    library.addIcons(faBars);
    library.addIcons(faHome);
    library.addIcons(faThList);
    library.addIcons(faUserPlus);
    library.addIcons(faRoad);
    library.addIcons(faTachometerAlt);
    library.addIcons(faHeart);
    library.addIcons(faList);
    library.addIcons(faBell);
    library.addIcons(faTasks);
    library.addIcons(faBook);
    library.addIcons(faHdd);
    library.addIcons(faFlag);
    library.addIcons(faWrench);
    library.addIcons(faClock);
    library.addIcons(faCloud);
    library.addIcons(faSignOutAlt);
    library.addIcons(faSignInAlt);
    library.addIcons(faCalendarAlt);
    library.addIcons(faSearch);
    library.addIcons(faTrashAlt);
    library.addIcons(faAsterisk);
  }
}
