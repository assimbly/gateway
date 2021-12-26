import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiDataUtils } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IRoute } from 'app/shared/model/route.model';
import { RouteService } from './route.service';
import { RouteDeleteDialogComponent } from './route-delete-dialog.component';

@Component({
    selector: 'jhi-route',
    templateUrl: './route.component.html'
})
export class RouteComponent implements OnInit, OnDestroy {
    routes?: IRoute[];
    eventSubscriber?: Subscription;

    constructor(
        protected routeService: RouteService,
        protected dataUtils: JhiDataUtils,
        protected eventManager: JhiEventManager,
        protected modalService: NgbModal
    ) {}

    loadAll(): void {
        this.routeService.query().subscribe((res: HttpResponse<IRoute[]>) => (this.routes = res.body || []));
    }

    ngOnInit(): void {
        this.loadAll();
        this.registerChangeInRoutes();
    }

    ngOnDestroy(): void {
        if (this.eventSubscriber) {
            this.eventManager.destroy(this.eventSubscriber);
        }
    }

    trackId(index: number, item: IRoute): number {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return item.id!;
    }

    byteSize(base64String: string): string {
        return this.dataUtils.byteSize(base64String);
    }

    openFile(contentType: string, base64String: string): void {
        return this.dataUtils.openFile(contentType, base64String);
    }

    registerChangeInRoutes(): void {
        this.eventSubscriber = this.eventManager.subscribe('routeListModification', () => this.loadAll());
    }

    delete(route: IRoute): void {
        const modalRef = this.modalService.open(RouteDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.route = route;
    }
}
