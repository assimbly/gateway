import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';

import {  } from 'rxjs/Observable';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IWireTapEndpoint, WireTapEndpoint, EndpointType } from 'app/shared/model/wire-tap-endpoint.model';
import { IService, Service } from 'app/shared/model/service.model';
import { IHeader, Header } from 'app/shared/model/header.model';

import { WireTapEndpointService } from './wire-tap-endpoint.service';
import { ServiceService } from '../service';
import { HeaderService } from '../header';
import { Components, typesLinks } from '../../shared/camel/component-type';
import { FlowService } from '../flow/flow.service';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Option } from '../flow';
import { HttpResponse } from "@angular/common/http";
import { map } from "rxjs/operators";

@Component({
    selector: 'jhi-wire-tap-endpoint-edit',
    templateUrl: './wire-tap-endpoint-edit.component.html'
})
export class WireTapEndpointEditComponent implements OnInit {
    service: Service;

    wireTapEndpoint: IWireTapEndpoint;
    isSaving: boolean;
    typeCamelLink: string;
    wikiDocUrl: string;
    camelDocUrl: string;
    typeAssimblyLink: string;
    endpointOptions: Array<Option> = [];
    wireTapForm: FormGroup;
    headers: Header[];
    services: Service[];
    filteredService: Service[];
    serviceCreated: boolean;
    headerCreated: boolean;
    serviceType: string;
    uriPlaceholder: string;
    uriPopoverMessage: string;
    wiretapComponentOptions: any;
    
    constructor(
        private jhiAlertService: JhiAlertService,
        private wireTapEndpointService: WireTapEndpointService,
        private serviceService: ServiceService,
        private headerService: HeaderService,
        private flowService: FlowService,
        private eventManager: JhiEventManager,
        private route: ActivatedRoute,
        private router: Router,
        public components: Components
    ) {
    }

    ngOnInit() {
        this.wireTapEndpoint = new WireTapEndpoint();
        this.isSaving = false;
        this.initializeEndpointData();
        this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
    }

    private load(id) {
        if (id) {
            forkJoin(
                this.wireTapEndpointService.find(id),
                this.serviceService.query(),
                this.headerService.query(),
                this.flowService.getWikiDocUrl(),
                this.flowService.getCamelDocUrl()
            ).subscribe(([wireTapEndpoint, services, headers, wikiDocUrl, camelDocUrl]) => {
                this.wireTapEndpoint = wireTapEndpoint.body;
                this.services = services.body;
                this.serviceCreated = this.services.length > 0;
                this.headers = headers.body;
                this.headerCreated = this.headers.length > 0;
                this.wikiDocUrl = wikiDocUrl.url;
                this.camelDocUrl = camelDocUrl.url;
                this.updateEndpointData();
                this.setTypeLink();
                this.getOptions();
            });
        } else {
            forkJoin(
                this.serviceService.query(),
                this.headerService.query(),
                this.flowService.getWikiDocUrl(),
                this.flowService.getCamelDocUrl()
            ).subscribe(([services, headers, wikiDocUrl, camelDocUrl]) => {
                this.wireTapEndpoint.type = EndpointType.FILE;
                this.services = services.body;
                this.serviceCreated = this.services.length > 0;
                this.headers = headers.body;
                this.headerCreated = this.headers.length > 0;
                this.wikiDocUrl = wikiDocUrl.url;
                this.camelDocUrl = camelDocUrl.url;
                this.updateEndpointData();
                this.setTypeLink();
                this.getOptions();
            });
        }
    }

    save() {

        this.isSaving = true;
        this.setDataFromForm();
        this.setEndpointOptions();
        this.isSaving = false;

        if (this.wireTapEndpoint.id) {
            this.subscribeToSaveResponse(
                this.wireTapEndpointService.update(this.wireTapEndpoint));
        } else {
            this.subscribeToSaveResponse(
                this.wireTapEndpointService.create(this.wireTapEndpoint));
        }
    }

    setDataFromForm() {
        const flowControls = this.wireTapForm.controls;
        this.wireTapEndpoint.id = flowControls.id.value;
        this.wireTapEndpoint.type = flowControls.type.value;
        this.wireTapEndpoint.uri = flowControls.uri.value;
        this.wireTapEndpoint.headerId = flowControls.header.value;
        this.wireTapEndpoint.serviceId = flowControls.service.value ? flowControls.service.value : null;
    }

    setEndpointOptions() {
        this.wireTapEndpoint.options = '';
        let index = 0;
        this.endpointOptions.forEach((option, i) => {
            let formOptions: FormGroup = <FormGroup>(<FormArray>this.wireTapForm.controls.options).controls[i];
            option.key = formOptions.controls.key.value;
            option.value = formOptions.controls.value.value;
            if (option.key && option.value) {
                this.wireTapEndpoint.options += index > 0 ? `&${option.key}=${option.value}` : `${option.key}=${option.value}`;
                index++;
            }
        });
    }

    previousState() {
        window.history.back();
    }

    setTypeLink(e?) {
        if (typeof e !== 'undefined') {
            this.wireTapEndpoint.type = e;
        }

        let type = typesLinks.find((x) => x.name === this.wireTapEndpoint.type.toString());
        this.wireTapForm.controls.service.setValue('');
        this.filterServices();
        this.typeAssimblyLink = this.wikiDocUrl + type.assimblyTypeLink;
        this.typeCamelLink = this.camelDocUrl + type.camelTypeLink;
        this.uriPlaceholder = type.uriPlaceholder;
        this.uriPopoverMessage = type.uriPopoverMessage;
        
        this.wireTapForm.patchValue({ 'type': type.name });

        let componentType = this.wireTapForm.controls.type.value
        componentType = componentType.toLowerCase()
        if (componentType === 'activemq') {
            componentType = 'jms';
        } else if (componentType === 'sonicmq') {
            componentType = 'sjms';
        }
        
        // get options keys
        this.getComponentOptions(componentType).subscribe((data) => {
            this.wiretapComponentOptions = Object.keys(data.properties);
        });
        
        switch (this.wireTapForm.controls.type.value) {
            case 'WASTEBIN': {
                this.wireTapForm.controls.uri.disable();
                this.wireTapForm.controls.options.disable();
                this.wireTapForm.controls.service.disable();
                this.wireTapForm.controls.header.disable();
                break;
            }
            case 'ACTIVEMQ': case 'SJMS': case 'SONICMQ': case 'SQL': {
                this.wireTapForm.controls.uri.enable();
                this.wireTapForm.controls.options.enable();
                this.wireTapForm.controls.header.enable();
                this.wireTapForm.controls.service.enable();
                break;
            }
            default: {
                this.wireTapForm.controls.uri.enable();
                this.wireTapForm.controls.options.enable();
                this.wireTapForm.controls.header.enable();
                this.wireTapForm.controls.service.disable();
                break;
            }
        }
    }

    getOptions() {
        if (this.wireTapEndpoint.id) {

            if (!this.wireTapEndpoint.options) { this.wireTapEndpoint.options = '' }
            const options = this.wireTapEndpoint.options.split('&');

            options.forEach((option, index) => {
                const kv = option.split('=');
                const o = new Option();
                o.key = kv[0];
                o.value = kv[1];
                let formOptions = <FormArray>this.wireTapForm.controls.options;
                if (typeof formOptions.controls[index] === 'undefined') {
                    formOptions.push(
                        this.initializeOption()
                    )
                }

                formOptions.controls[index].patchValue({
                    'key': o.key,
                    'value': o.value
                })

                this.endpointOptions.push(o);
            });
        } else {
            this.addOption();
        }
    }
    
    getComponentOptions(componentType: String): any {
        return this.flowService.getComponentOptions(1, componentType).pipe(map((options) => {
            return options.body;
        }));
    }

    createOrEditHeader() {
        this.wireTapEndpoint.headerId = this.wireTapForm.controls.header.value;
        (this.wireTapEndpoint.headerId) ?
            this.router.navigate(['/', { outlets: { popup: 'header/' + this.wireTapEndpoint.headerId + '/edit' } }], { fragment: 'showEditHeaderButton' }) :
            this.router.navigate(['/', { outlets: { popup: ['header-new'] } }], { fragment: 'showEditHeaderButton' });

        this.eventManager.subscribe(
            'headerModified',
            (res) => this.setHeader(res)
        );
    }

    setHeader(id) {
        this.headerService.query().subscribe(
            res => {
                this.headers = res.body;
                this.headerCreated = this.headers.length > 0;
                this.wireTapEndpoint.headerId = this.headers.find((h) => h.id === id.content).id;
                this.wireTapForm.controls.header.patchValue(this.wireTapEndpoint.headerId);
            },
            res => this.onError(res.body)
        );
    }

    createOrEditService() {
        (typeof this.wireTapEndpoint.serviceId === 'undefined' || this.wireTapEndpoint.serviceId === null) ?
            this.router.navigate(['/', { outlets: { popup: ['service-new'] } }], { fragment: this.serviceType }) :
            this.router.navigate(['/', { outlets: { popup: 'service/' + this.wireTapEndpoint.serviceId + '/edit' } }], { fragment: this.serviceType });
        this.eventManager.subscribe(
            'serviceModified',
            (res) => this.setService(res)
        );
    }

    setService(id) {
        this.serviceService.query().subscribe(
            res => {
                this.services = res.body;
                this.serviceCreated = this.services.length > 0;
                this.service = this.services.find((s) => s.id === id.content);
                this.wireTapEndpoint.serviceId = this.service.id;
                this.wireTapForm.controls.service.patchValue(this.wireTapEndpoint.serviceId);
                this.filterServices();
            },
            res => this.onError(res.json)
        );
    }

    filterServices() {
        this.serviceType = this.returnServiceType(this.wireTapEndpoint.type);
        this.filteredService = this.services.filter((f) => f.type === this.serviceType);
        if (this.filteredService.length > 0 && this.wireTapEndpoint.serviceId) {
            this.wireTapForm.controls.service.setValue(this.filteredService.find((fs) => fs.id === this.wireTapEndpoint.serviceId).id);
        }
    }

    returnServiceType(type: any) {
        if (type === 'ACTIVEMQ') {
            return 'ActiveMQ Connection';
        } else if (type === 'SONICMQ') {
            return 'SonicMQ Connection';
        } else if (type === 'SQL') {
            return 'JDBC Connection';
        } else if (type === 'SJMS') {
            return 'MQ Connection';
        } else {
            return '';
        }
    }

    validateOptions(i: number) {
        let option: FormGroup = <FormGroup>(<FormArray>this.wireTapForm.controls.options).controls[i];
        if (option.value.key || option.value.value) {
            option.controls.key.setValidators([Validators.required]);
            option.controls.value.setValidators([Validators.required]);
        } else {
            option.controls.key.clearValidators();
            option.controls.value.clearValidators();
        }
        option.controls.key.updateValueAndValidity();
        option.controls.value.updateValueAndValidity();
    }

    addOption() {
        (<FormArray>this.wireTapForm.controls.options).push(this.initializeOption());
        this.endpointOptions.push(new Option());
    }

    removeOption(option: Option) {
        const index = this.endpointOptions.indexOf(option);
        (<FormArray>this.wireTapForm.controls.options).removeAt(index);
        this.endpointOptions.splice(index, 1);
    }

    private initializeEndpointData() {
        this.wireTapForm = new FormGroup({
            'id': new FormControl(this.wireTapEndpoint.id),
            'type': new FormControl(this.wireTapEndpoint.type, Validators.required),
            'uri': new FormControl(this.wireTapEndpoint.uri, Validators.required),
            'options': new FormArray([
                this.initializeOption()
            ]),
            'service': new FormControl(this.wireTapEndpoint.serviceId),
            'header': new FormControl(this.wireTapEndpoint.headerId)
        })
    }

    private initializeOption(): FormGroup {
        return new FormGroup({
            'key': new FormControl(null),
            'value': new FormControl(null)
        })
    }

    private updateEndpointData() {

        if (this.wireTapEndpoint !== null) {
            this.wireTapForm.patchValue({
                'id': this.wireTapEndpoint.id,
                'type': this.wireTapEndpoint.type,
                'uri': this.wireTapEndpoint.uri,
            });
        }

        if (this.wireTapEndpoint.serviceId !== null) {
            this.wireTapForm.patchValue({
                'service': this.wireTapEndpoint.serviceId,
            });
        }

        if (this.wireTapEndpoint.headerId !== null) {
            this.wireTapForm.patchValue({
                'header': this.wireTapEndpoint.headerId
            });
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IWireTapEndpoint>>) {
        result.subscribe(data => {
            if(data.ok){
                this.onSaveSuccess(data.body);
            }else{
                this.onSaveError()
            }
            }    
        )
    }

    private onSaveSuccess(result: WireTapEndpoint) {
        /* this.wireTapEndpoint = result;
        this.initializeEndpointData();
        this.getOptions();
        this.isSaving = false; */
        this.router.navigate(['./wire-tap-endpoint']);
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }

    trackServiceById(index: number, item: Service) {
        return item.id;
    }

    trackHeaderById(index: number, item: Header) {
        return item.id;
    }
}
