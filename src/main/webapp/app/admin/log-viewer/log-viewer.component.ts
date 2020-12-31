import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LogViewerService } from './log-viewer.service';

@Component({
    selector: 'jhi-log-viewer',
    templateUrl: './log-viewer.component.html'
})
export class LogViewerComponent implements OnInit {
    @ViewChild('logArea', { static: false }) private logArea: ElementRef;
    public log: string;
    public logLines: string[];
    public lines: number;
    searchText: string = '';
    
    constructor(private logViewerService: LogViewerService) {}

    ngOnInit() {
        this.lines = 250;
        this.getLogs();
    }

    getLogs() {
        let tt = this.lines;
        this.logViewerService.getLogs(this.lines).subscribe(res => {
            this.log = res.body;
            this.logLines = this.log.split(/\r?\n/);
            
            setTimeout(() => {
                try {
                    this.logArea.nativeElement.scrollTop = this.logArea.nativeElement.scrollHeight;
                } catch (error) {}
            }, 0);
        });
    }
}
