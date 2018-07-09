import { Component, OnInit, OnDestroy } from '@angular/core';
import { FlowService, Flow } from '../flow';
import { JhiAlertService } from 'ng-jhipster';
import * as moment from 'moment';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'jhi-maintenance',
    templateUrl: './maintenance.component.html',
})

export class MaintenanceComponent implements OnInit {

    public flows: Array<Flow> = [];
    public hours: number;
    public minutes: number;
    selectedFlows: Array<Flow> = [];
    allSelected = false;
    messageFlow: string;
    intervals: Array<any> = [];
    maintenanceTimers: Array<string> = [];
    timeLeft: Array<number> = [];
    disableFlows: Array<boolean> = [];

    constructor(
        private flowService: FlowService,
        private jhiAlertService: JhiAlertService,
    ) {
    }

    ngOnInit() {
        this.flowService.query().subscribe(
            (res) => {
                this.flows = res.json
            },
            (err) => {
                this.jhiAlertService.error(err.json.message, null, null)
            }
        );
    }

    setMaintenance() {
        if (this.hours === undefined) { this.hours = 0; }
        if (this.minutes === undefined) { this.minutes = 0; }
        let time = this.hours * 3600 * 1000 + this.minutes * 60000;
        const ids = this.selectedFlows.filter((sf) => sf !== null).map((f) => f.id);
        if (ids.length > 0) {
            this.flowService.setMaintenance(time, ids).subscribe(() => {
                this.messageFlow = `Set flows into maintenance mode for:`;
                this.displayMaintenanceTimer(this.selectedFlows, time);
                this.deselectAll();
            });
        }
    }

    displayMaintenanceTimer(flows: Array<Flow>, time: number) {
        flows.forEach((flow, i) => {
            if (flow === null) { return; }
            this.timeLeft[i] = time;
            this.intervals[i] = setInterval(() => {
                this.disableFlows[i] = true;
                this.timeLeft[i] -= 1000;
                if (this.timeLeft[i] < 0) {
                    this.clearInterval(i);
                } else {
                    this.maintenanceTimers[i] = moment.utc(this.timeLeft[i]).format('HH[h] mm[min] ss[sec]');
                }
            }, 1000)
        });
    }
    clearInterval(id: number) {
        clearInterval(this.intervals[id]);
        this.disableFlows[id] = false;
        this.maintenanceTimers[id] = '';
    }

    selectAll() {
        this.flows.forEach((flow, i) => {
            this.selectedFlows[i] = flow;
        });
        this.allSelected = true;
    }

    deselectAll() {
        this.selectedFlows = [];
        this.allSelected = false;
    }

    select(e, i: number, flow: Flow) {
        e.currentTarget.checked ? this.selectedFlows[i] = flow : this.selectedFlows[i] = null;
        this.allSelected = JSON.stringify(this.selectedFlows) === JSON.stringify(this.flows);
    }
}
