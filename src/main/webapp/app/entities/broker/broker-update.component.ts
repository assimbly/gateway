import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IBroker } from 'app/shared/model/broker.model';
import { BrokerService } from './broker.service';

@Component({
    selector: 'jhi-broker-update',
    templateUrl: './broker-update.component.html'
})
export class BrokerUpdateComponent implements OnInit {

    broker: IBroker;
    brokerConfiguration: String;
    isSaving: boolean;

    namePopoverMessage: string;
    autostartPopoverMessage: string;
    typePopoverMessage: string;
    configurationTypePopoverMessage: string;
    brokerConfigurationPopoverMessage: string;

    constructor(protected brokerService: BrokerService, protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.isSaving = false;
        this.setPopoverMessages();
        this.activatedRoute.data.subscribe(({ broker }) => {
            this.broker = broker;
            if (this.broker.id !== undefined){
                this.brokerService.getBrokerConfiguration(this.broker.id).subscribe(brokerConfiguration => {
                    this.brokerConfiguration = brokerConfiguration.body;
                });
            }else{
                this.broker.type = 'artemis';
                this.broker.configurationType = 'file';
            }
        });
    }

    previousState() {
        window.history.back();
    }

    save() {

        if (this.broker.configurationType === 'file') {
            this.brokerService.setBrokerConfiguration(this.broker.id, this.brokerConfiguration).subscribe(response => {
                if (this.broker.id !== undefined) {
                    this.subscribeToSaveResponse(this.brokerService.update(this.broker));
                } else {
                    this.subscribeToSaveResponse(this.brokerService.create(this.broker));
                }
            });
        }else{
            this.isSaving = true;
            if (this.broker.id !== undefined) {
                this.subscribeToSaveResponse(this.brokerService.update(this.broker));
            } else {
                this.subscribeToSaveResponse(this.brokerService.create(this.broker));
            }
        }

    }

    setPopoverMessages() {
        this.namePopoverMessage = `Name of the broker. Usually the same as the gateway name.`;
        this.autostartPopoverMessage = `If true then the broker starts automatically when the gateway starts.`;
        this.typePopoverMessage = `The ActiveMQ broker to use. Either ActiveMQ Classic (5.x) or ActiveMQ Artemis. Artemis is default`;        
        this.configurationTypePopoverMessage = `The type of configuration. Embedded starts a broker as localhost (for quick testing), File is default.`;
        this.brokerConfigurationPopoverMessage = `The broker file (activemq.xml for Classic and broker.xml for Artemis). When the configuration is empty than a default file is created. Check the ActiveMQ documentation how to configure the brokers.`;
    }
    
    
    protected subscribeToSaveResponse(result: Observable<HttpResponse<IBroker>>) {
        result.subscribe((res: HttpResponse<IBroker>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
    }

    protected onSaveError() {
        this.isSaving = false;
    }
}
