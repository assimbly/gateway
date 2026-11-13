import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ResolveFn, Routes, Router } from '@angular/router';
import { of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { userRouteAccessService } from 'app/core/auth';
import { IQueue, Queue } from 'app/shared/model/queue.model';
import { QueueService } from './queue.service';

const queueResolve: ResolveFn<IQueue> = route => {
  const id = route.params['id'];
  if (id) {
    const router = inject(Router);
    return inject(QueueService)
      .find(id)
      .pipe(
        mergeMap((queue: HttpResponse<Queue>) => {
          if (queue.body) {
            return of(queue.body);
          } else {
            router.navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(new Queue());
};

export const queueRoute: Routes = [
  {
    path: 'queue',
    loadComponent: () => import('./queue.component').then(m => m.QueueComponent),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'queue/:id/view',
    loadComponent: () => import('./queue-detail.component').then(m => m.QueueDetailComponent),
    resolve: {
      queue: queueResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'queue/new',
    loadComponent: () => import('./queue-update.component').then(m => m.QueueUpdateComponent),
    resolve: {
      queue: queueResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'queue/:id/edit',
    loadComponent: () => import('./queue-update.component').then(m => m.QueueUpdateComponent),
    resolve: {
      queue: queueResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
];
