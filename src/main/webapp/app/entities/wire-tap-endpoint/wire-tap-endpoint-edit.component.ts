import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Response } from '@angular/http';
import { forkJoin } from 'rxjs/observable/forkJoin';

import { Observable } from 'rxjs/Observable';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { WireTapEndpoint } from './wire-tap-endpoint.model';
import { WireTapEndpointService } from './wire-tap-endpoint.service';
import { Service, ServiceService } from '../service';
import { Header, HeaderService } from '../header';
import { ResponseWrapper } from '../../shared';
import { Components, typesLinks, EndpointType } from '../../shared/camel/component-type';
import { FlowService } from '../flow/flow.service';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Option } from '../flow';

@Component({
    selector: 'jhi-wire-tap-endpoint-edit',
    templateUrl: './wire-tap-endpoint-edit.component.html'
})
export class WireTapEndpointEditComponent implements OnInit {

    wireTapEndpoint: WireTapEndpoint = new WireTapEndpoint();
    isSaving: boolean;
    typeCamelLink: string;
    wikiDocUrl: string;
    camelDocUrl: string;
    typeAssimblyLink: string;
    endpointOptions: Array<Option> = [];
    wireTapForm: FormGroup;
    services: Service[];
    filteredService: Service[];
    serviceCreated: boolean;
    headerCreated: boolean;
    serviceType: string;
    uriPlaceholder: string;
    uriPopoverMessage: string;

    headers: Header[];

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
        this.isSaving = false;
        this.initializeEndpointData();
        this.route.params.subscribe((params) => {
            this.load(params['id']);
        });

        /* if (!this.wireTapEndpoint.id) {
            this.wireTapEndpoint.type = EndpointType.FILE;
        }
        this.initializeEndpointData();
        this.serviceService.query()
            .subscribe((res: ResponseWrapper) => { this.services = res.json; }, (res: ResponseWrapper) => this.onError(res.json));
        this.headerService.query()
            .subscribe((res: ResponseWrapper) => { this.headers = res.json; }, (res: ResponseWrapper) => this.onError(res.json));

        forkJoin(this.flowService.getWikiDocUrl(), this.flowService.getCamelDocUrl()).subscribe(([wikiDocUrl, camelDocUrl]) => {
            this.wikiDocUrl = wikiDocUrl.text();
            this.camelDocUrl = camelDocUrl.text();

            if (this.wireTapEndpoint.type) {
                this.setTypeLink();
            }
        });

        this.getOptions(); */
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
                this.wireTapEndpoint = wireTapEndpoint;
                this.services = services.json;
                this.headers = headers.json;
                this.wikiDocUrl = wikiDocUrl.text();
                this.camelDocUrl = camelDocUrl.text();
                this.updateEndpointData();
                this.setTypeLink();
                this.getOptions();
            });
        }else {
            forkJoin(
                this.serviceService.query(),
                this.headerService.query(),
                this.flowService.getWikiDocUrl(),
                this.flowService.getCamelDocUrl()
            ).subscribe(([services, headers, wikiDocUrl, camelDocUrl]) => {
                this.wireTapEndpoint.type = EndpointType.FILE;
                this.services = services.json;
                this.headers = headers.json;
                this.wikiDocUrl = wikiDocUrl.text();
                this.camelDocUrl = camelDocUrl.text();
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
        this.wireTapEndpoint.header = flowControls.header.value;
        this.wireTapEndpoint.service = flowControls.service.value ? flowControls.service.value : null;
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

    createOrEditHeader() {
        this.wireTapEndpoint.header.id = this.wireTapForm.controls.header.value;
        (this.wireTapEndpoint.header.id) ?
            this.router.navigate(['/', { outlets: { popup: 'header/' + this.wireTapEndpoint.header.id + '/edit' } }], { fragment: 'showEditHeaderButton' }) :
            this.router.navigate(['/', { outlets: { popup: ['header-new'] } }], { fragment: 'showEditHeaderButton' });

        this.eventManager.subscribe(
            'headerModified',
            (res) => this.setHeader(res)
        );
    }

    setHeader(id) {
        this.headerService.query().subscribe(
            (res: ResponseWrapper) => {
                this.headers = res.json;
                this.headerCreated = this.headers.length > 0;
                this.wireTapEndpoint.header.id = this.headers.find((h) => h.id === id.content).id;
                this.wireTapForm.controls.header.patchValue(this.wireTapEndpoint.header.id);
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }

    createOrEditService() {
        (typeof this.wireTapEndpoint.service.id === 'undefined' || this.wireTapEndpoint.service.id === null) ?
            this.router.navigate(['/', { outlets: { popup: ['service-new'] } }], { fragment: this.serviceType }) :
            this.router.navigate(['/', { outlets: { popup: 'service/' + this.wireTapEndpoint.service.id + '/edit' } }], { fragment: this.serviceType });
        this.eventManager.subscribe(
            'serviceModified',
            (res) => this.setService(res)
        );
    }

    setService(id) {
        this.serviceService.query().subscribe(
            (res: ResponseWrapper) => {
                this.services = res.json;
                this.serviceCreated = this.services.length > 0;
                this.wireTapEndpoint.service = this.services.find((s) => s.id === id.content);
                this.wireTapForm.controls.service.patchValue(this.wireTapEndpoint.service);
                this.filterServices();
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }

    filterServices() {
        this.serviceType = this.returnServiceType(this.wireTapEndpoint.type);
        this.filteredService = this.services.filter((f) => f.type === this.serviceType);
        if (this.filteredService.length > 0 && this.wireTapEndpoint.service.id) {
            this.wireTapForm.controls.service.setValue(this.filteredService.find((fs) => fs.id === this.wireTapEndpoint.service.id));
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
            'service': new FormControl(this.wireTapEndpoint.service),
            'header': new FormControl(this.wireTapEndpoint.header)
        })
    }

    private initializeOption(): FormGroup {
        return new FormGroup({
            'key': new FormControl(null),
            'value': new FormControl(null)
        })
    }

    private updateEndpointData() {
        this.wireTapForm.patchValue({
            'id': this.wireTapEndpoint.id,
            'type': this.wireTapEndpoint.type,
            'uri': this.wireTapEndpoint.uri,
            'service': this.wireTapEndpoint.service,
            'header': this.wireTapEndpoint.header
        });
    }

    private subscribeToSaveResponse(result: Observable<WireTapEndpoint>) {
        result.subscribe((res: WireTapEndpoint) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: WireTapEndpoint) {
        // this.eventManager.broadcast({ name: 'wireTapEndpointListModification', content: 'OK' });
        this.wireTapEndpoint = result;
        this.initializeEndpointData();
        this.getOptions();
        this.isSaving = false;
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
