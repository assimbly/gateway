import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from './message.service';
import { IMessage } from 'app/shared/model/message.model';
import { HeaderService } from '../header/header.service';
import { IHeader, Header } from 'app/shared/model/header.model';
import { Subscription } from 'rxjs';

@Component({
    standalone: false,
    selector: 'jhi-message-detail',
    templateUrl: './message-detail.component.html'
})
export class MessageDetailComponent implements OnInit {
    message: IMessage;

    constructor(
        protected activatedRoute: ActivatedRoute,
        protected messageService: MessageService,
        protected headerService: HeaderService
    ) {}
    public headers: Array<Header>;
    private subscription: Subscription;

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ message }) => {
            this.message = message;
        });
    }

    private load(id) {
        this.messageService.find(id).subscribe(message => {
            this.message = message.body;
            this.loadHeader(this.message.id);
        });
    }

    private loadHeader(id: number) {
        this.headerService.query().subscribe(res => {
            this.headers = res.body.filter(hk => hk.messageId === id);
        });
    }

    previousState() {
        window.history.back();
    }
}
