import { Component, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AlertError } from 'app/shared/alert';
import { MessageService } from './message.service';
import { IMessage } from 'app/shared/model/message.model';
import { HeaderService } from '../header/header.service';
import { IHeader, Header } from 'app/shared/model/header.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'jhi-message-detail',
    templateUrl: './message-detail.component.html',
    imports: [RouterModule, AlertError, NgClass],
})
export class MessageDetailComponent implements OnInit {
    protected activatedRoute = inject(ActivatedRoute);
    protected messageService = inject(MessageService);
    protected headerService = inject(HeaderService);

    message!: IMessage;
    public headers!: Array<Header>;
    private subscription!: Subscription;

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ message }) => {
            this.message = message;
        });
    }

    private load(id: number) {
        this.messageService.find(id).subscribe(message => {
            this.message = message.body!;
            this.loadHeader(this.message.id!);
        });
    }

    private loadHeader(id: number) {
        this.headerService.query().subscribe(res => {
            this.headers = res.body!.filter(hk => hk.messageId === id);
        });
    }

    previousState() {
        window.history.back();
    }
}
