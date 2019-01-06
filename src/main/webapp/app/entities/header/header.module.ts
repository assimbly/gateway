import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewayHeaderKeysModule } from '../../entities/header-keys/header-keys.module';
import { GatewaySharedModule } from '../../shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
    HeaderComponent,
    HeaderDetailComponent,
    HeaderDialogComponent,    
    HeaderUpdateComponent,
    HeaderDeletePopupComponent,
    HeaderDeleteDialogComponent,
    HeaderAllComponent,
    headerRoute,
    headerPopupRoute,
    HeaderPopupService,
    ForbiddenHeaderNamesValidatorDirective,
    ForbiddenHeaderKeysValidatorDirective
} from './';
import { NgSelectModule } from '@ng-select/ng-select';
import { HeaderPopupComponent } from "app/entities/header/header-dialog.component";
import { HeaderService } from "app/entities/header/header.service";
const ENTITY_STATES = [
    ...headerRoute,
    ...headerPopupRoute,
];

@NgModule({
    imports: [
        GatewaySharedModule,
        GatewayHeaderKeysModule,
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    declarations: [
			HeaderComponent,
			HeaderDetailComponent,
			HeaderDialogComponent,			
			HeaderUpdateComponent,
			HeaderAllComponent,
			HeaderDeleteDialogComponent,
			HeaderDeletePopupComponent,
			HeaderPopupComponent,
        	ForbiddenHeaderNamesValidatorDirective,
        	ForbiddenHeaderKeysValidatorDirective],
    entryComponents: [
			HeaderComponent,
			HeaderDialogComponent,
			HeaderUpdateComponent,
			 HeaderPopupComponent,
			HeaderAllComponent,
			HeaderDeleteDialogComponent,
			HeaderDeletePopupComponent],
		    providers: [
		        HeaderService,
		        HeaderPopupService,
		],		
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayHeaderModule {}
