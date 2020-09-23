import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DeploymentService } from './deployment.service';

@Component({
    selector: 'deployment',
    templateUrl: './deployment.component.html'
})
export class DeploymentComponent implements OnInit {
    @ViewChild('logArea', { static: false }) private logArea: ElementRef;
    public log: string;
    public logLines: string[];
    public lines: number;
    searchText: string = '';

    constructor(private logViewerService: DeploymentService) {}

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
