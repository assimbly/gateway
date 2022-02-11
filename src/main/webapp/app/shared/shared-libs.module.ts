import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgJhipsterModule } from 'ng-jhipster';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FontAwesomeModule  } from '@fortawesome/angular-fontawesome';
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
  faHome,
} from '@fortawesome/free-solid-svg-icons';

@NgModule({
  imports: [NgbModule, InfiniteScrollModule, FontAwesomeModule],
  exports: [
    FormsModule,
    CommonModule,
    NgbModule,
    NgJhipsterModule,
    InfiniteScrollModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
})
export class SharedLibsModule {}
