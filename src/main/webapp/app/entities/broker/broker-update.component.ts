import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IBroker } from 'app/shared/model/broker.model';
import { BrokerService } from './broker.service';

import { artemisBrokerConfiguration, activemqBrokerConfiguration } from './broker-configuration';

import 'codemirror/addon/edit/closetag';

@Component({
    selector: 'jhi-broker-update',
    templateUrl: './broker-update.component.html'
})
export class BrokerUpdateComponent implements OnInit {

    broker: IBroker;
    brokerConfiguration: string;
    artemisConfiguration: string;
    activemqConfiguration: string;
    brokerConfigurationFailed: string;
    isSaving: boolean;

    namePopoverMessage: string;
    autostartPopoverMessage: string;
    typePopoverMessage: string;
    configurationTypePopoverMessage: string;
    brokerConfigurationPopoverMessage: string;


    constructor(protected brokerService: BrokerService, protected activatedRoute: ActivatedRoute) {
	}

    ngOnInit() {
        this.isSaving = false;
        this.setPopoverMessages();
        this.setDefaultConfiguration();
        this.activatedRoute.data.subscribe(({ broker }) => {
            this.broker = broker;
            if (this.broker.id !== undefined) {
                this.brokerService.getBrokerConfiguration(this.broker.id, this.broker.type).subscribe(brokerConfiguration => {
                    if (this.broker.type === 'artemis') {
                        this.artemisConfiguration = brokerConfiguration.body;
                        this.brokerConfiguration = brokerConfiguration.body;
                    } else {
                        this.activemqConfiguration = brokerConfiguration.body;
                        this.brokerConfiguration = brokerConfiguration.body;
                    }
                });
            } else {
                this.broker.autoStart = true;
                this.broker.type = 'artemis';
                this.broker.configurationType = 'file';
                this.brokerConfiguration = this.artemisConfiguration;
            }
        });
    }

    setDefaultConfiguration() {
        this.artemisConfiguration = artemisBrokerConfiguration;
        this.activemqConfiguration = activemqBrokerConfiguration;
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.brokerConfigurationFailed = '';

        if (this.broker.configurationType === 'file' && this.broker.id !== undefined) {
            this.isSaving = true;
            this.brokerService.update(this.broker).subscribe(
                response => {
                    this.brokerService
                        .setBrokerConfiguration(this.broker.id, this.broker.type, this.broker.configurationType, this.brokerConfiguration)
                        .subscribe(
                            response => {
                                this.isSaving = false;
                                this.previousState();
                            },
                            err => {
                                this.isSaving = false;
                                this.brokerConfigurationFailed = err.error;
                            }
                        );
                },
                err => {
                    this.isSaving = false;
                    this.brokerConfigurationFailed = err.error;
                }
            );
        } else if (this.broker.configurationType === 'file') {
            this.isSaving = true;
            this.subscribeToCreateResponse(this.brokerService.create(this.broker));
        } else {
            this.isSaving = true;
            if (this.broker.id !== undefined) {
                this.subscribeToSaveResponse(this.brokerService.update(this.broker));
            } else {
                this.subscribeToSaveResponse(this.brokerService.create(this.broker));
            }
        }
    }

    onTypeChange(brokerType) {
        if (brokerType === 'classic') {
            this.artemisConfiguration = this.brokerConfiguration;
            this.brokerConfiguration = this.activemqConfiguration;
        } else {
            this.activemqConfiguration = this.brokerConfiguration;
            this.brokerConfiguration = this.artemisConfiguration;
        }
    }

    setPopoverMessages() {
        this.namePopoverMessage = `Name of the broker. Usually the same as the integration name.`;
        this.autostartPopoverMessage = `If true then the broker starts automatically when the integration starts.`;
        this.typePopoverMessage = `The ActiveMQ broker to use. Either ActiveMQ Classic (5.x) or ActiveMQ Artemis. Artemis is default`;
        this.configurationTypePopoverMessage = `The type of configuration. Embedded starts a broker as localhost (for quick testing), File is default.`;
        this.brokerConfigurationPopoverMessage = `The broker file (activemq.xml for Classic and broker.xml for Artemis). When the configuration is empty than a default file is created. Check the ActiveMQ documentation how to configure the brokers.`;
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IBroker>>) {
        result.subscribe(
            (res: HttpResponse<IBroker>) => this.onSaveSuccess(),
            (res: HttpErrorResponse) => this.onSaveError()
        );
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
    }

    protected onSaveError() {
        this.isSaving = false;
    }

    protected subscribeToCreateResponse(result: Observable<HttpResponse<IBroker>>) {
        result.subscribe(
            (res: HttpResponse<IBroker>) => this.onCreateSuccess(res.body),
            (res: HttpErrorResponse) => this.onCreateError()
        );
    }

    protected onCreateSuccess(createdBroker) {
        this.brokerService
            .setBrokerConfiguration(createdBroker.id, createdBroker.type, createdBroker.configurationType, this.brokerConfiguration)
            .subscribe(
                response => {
                    this.isSaving = false;
                    this.previousState();
                },
                err => {
                    this.isSaving = false;
                    this.brokerConfigurationFailed = err.error;
                }
            );
    }

    protected onCreateError() {
        this.isSaving = false;
    }
}
