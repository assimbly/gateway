import { Component, OnInit } from '@angular/core';
import { LogViewerService } from './log-viewer.service';

@Component({
    selector: 'jhi-log-viewer',
    templateUrl: './log-viewer.component.html',
})
export class LogViewerComponent implements OnInit {

    public log: string;
    private lines: number;

    constructor(
        private logViewerService: LogViewerService
    ) {
    }

    ngOnInit() {
        this.lines = 250;
        this.getLogs();
    }

    getLogs() {
        let tt = this.lines;
        this.logViewerService.getLogs(this.lines).subscribe((res) => {
            this.log = res.text();
        });
    }
}
