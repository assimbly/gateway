import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LogViewerService } from './log-viewer.service';

@Component({
    selector: 'jhi-log-viewer',
    templateUrl: './log-viewer.component.html',
})
export class LogViewerComponent implements OnInit {

    @ViewChild('logArea')private logArea: ElementRef;
    public log: string;
    public lines: number;

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
            setTimeout(() => {
                try {
                    this.logArea.nativeElement.scrollTop = this.logArea.nativeElement.scrollHeight;
                } catch (error) { }
            }, 0);
        });
    }
}
