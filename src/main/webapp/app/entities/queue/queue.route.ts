import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { IQueue, Queue } from 'app/shared/model/queue.model';
import { QueueService } from './queue.service';
import { QueueComponent } from './queue.component';
import { QueueDetailComponent } from './queue-detail.component';
import { QueueUpdateComponent } from './queue-update.component';
import { QueueDeletePopupComponent } from './queue-delete-dialog.component';

@Injectable({ providedIn: 'root' })
export class QueueResolve implements Resolve<IQueue> {
    constructor(private service: QueueService, private router: Router) {}

    resolve(route: ActivatedRouteSnapshot): Observable<IQueue> | Observable<never> {
        const id = route.params['id'];
        if (id) {
            return this.service.find(id).pipe(
                flatMap((queue: HttpResponse<Queue>) => {
                    if (queue.body) {
                        return of(queue.body);
                    } else {
                        this.router.navigate(['404']);
                        return EMPTY;
                    }
                })
            );
        }
        return of(new Queue());
    }
}

export const queueRoute: Routes = [
    {
        path: 'queue',
        component: QueueComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Queues'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'queue/:id/view',
        component: QueueDetailComponent,
        resolve: {
            queue: QueueResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Queues'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'queue/new',
        component: QueueUpdateComponent,
        resolve: {
            queue: QueueResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Queues'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'queue/:id/edit',
        component: QueueUpdateComponent,
        resolve: {
            queue: QueueResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Queues'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const queuePopupRoute: Routes = [
    {
        path: 'queue/:id/delete',
        component: QueueDeletePopupComponent,
        resolve: {
            queue: QueueResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Queues'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
