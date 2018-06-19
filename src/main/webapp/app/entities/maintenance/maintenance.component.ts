import { Component, OnInit } from '@angular/core';
import { FlowService, Flow } from '../flow';
import { JhiAlertService } from 'ng-jhipster';

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
        const time = (this.hours * 60 * 60000) + (this.minutes * 60000);
        const ids = this.selectedFlows.filter((sf) => sf !== null).map((f) => f.id);
        if (ids.length > 0) {
            this.flowService.setMaintainance(time, ids).subscribe((res) => {
                let r = res;
            });
        }
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
