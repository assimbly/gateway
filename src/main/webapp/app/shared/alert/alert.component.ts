import { Component, OnDestroy, OnInit, AfterContentChecked } from '@angular/core';
import { JhiAlertService } from 'ng-jhipster';

@Component({
    selector: 'jhi-alert',
    template: `
        <div class="alerts" role="alert">
            <div *ngFor="let alert of alerts" [ngClass]="{\'alert.position\': true, \'toast\': alert.toast}">
                <ngb-alert *ngIf="alert && alert.type && alert.msg" [type]="alert.type" (close)="alert.close(alerts)">
                    <pre [innerHTML]="alert.msg"></pre>
                </ngb-alert>
            </div>
        </div>`
})
export class JhiAlertComponent implements OnInit, OnDestroy, AfterContentChecked {
    alerts: any[];
    test: string[];

    constructor(private alertService: JhiAlertService) { }

    ngOnInit() {}
    ngAfterContentChecked() {
        this.alertService.get().forEach((x) => {
            if (x.msg !== 'unconfigured') {
                this.alerts = this.alertService.get();
            }
        })
    }

    ngOnDestroy() {
       this.alerts = [];
    }

}
