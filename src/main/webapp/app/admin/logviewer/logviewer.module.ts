import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SearchByNamePipe } from './logviewer.searchbyname.pipe';

import { LogViewerComponent } from './logviewer.component';
import { logViewerRoute } from './logviewer.route';
import { LogViewerLineValidationDirective } from './logviewer-line-validation.directive';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([logViewerRoute])],
  declarations: [LogViewerComponent, LogViewerLineValidationDirective, SearchByNamePipe],
})
export class LogViewerModule {}
