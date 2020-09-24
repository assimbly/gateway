import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GatewaySharedModule } from '../../app/shared';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SearchByNamePipe } from './log-viewer/log-viewer.searchbyname.pipe';
import { DeploymentSearchbyname } from 'app/admin/deployment/deployment.searchbyname.pipe';

/* jhipster-needle-add-admin-module-import - JHipster will add admin modules imports here */

import {
    adminState,
    AuditsComponent,
    UserMgmtComponent,
    UserMgmtDetailComponent,
    UserMgmtUpdateComponent,
    UserMgmtDeleteDialogComponent,
    LogsComponent,
    LogViewerComponent,
    // JhiMetricsMonitoringModalComponent,
    // JhiMetricsMonitoringComponent,
    HealthModalComponent,
    HealthComponent,
    JhiConfigurationComponent,
    JhiDocsComponent,
    AuditsService,
    JhiConfigurationService,
    HealthService,
    // JhiMetricsService,
    MetricsService,
    LogsService,
    LogViewerService,
    UserResolve,
    LogViewerLineValidationDirective,
    DeploymentLineValidationDirective,
    DeploymentService,
    DeploymentComponent
} from './';

@NgModule({
    imports: [
        GatewaySharedModule,
        HttpClientModule,
        RouterModule.forChild(adminState),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
        /* jhipster-needle-add-admin-module - JHipster will add admin modules here */
    ],
    declarations: [
        AuditsComponent,
        UserMgmtComponent,
        UserMgmtDetailComponent,
        UserMgmtUpdateComponent,
        UserMgmtDeleteDialogComponent,
        LogsComponent,
        LogViewerComponent,
        DeploymentComponent,
        JhiConfigurationComponent,
        HealthComponent,
        HealthModalComponent,
        JhiDocsComponent,
        // JhiMetricsMonitoringComponent,
        // JhiMetricsMonitoringModalComponent,
        LogViewerLineValidationDirective,
        DeploymentLineValidationDirective,
        SearchByNamePipe,
        DeploymentSearchbyname
    ],
    entryComponents: [UserMgmtDeleteDialogComponent, HealthModalComponent],
    providers: [
        AuditsService,
        JhiConfigurationService,
        HealthService,
        MetricsService,
        LogsService,
        LogViewerService,
        DeploymentService,
        UserResolve
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayAdminModule {}
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}
