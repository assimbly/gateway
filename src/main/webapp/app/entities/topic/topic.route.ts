import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ResolveFn, Routes, Router } from '@angular/router';
import { of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { userRouteAccessService } from 'app/core/auth';
import { ITopic, Topic } from 'app/shared/model/topic.model';
import { TopicService } from './topic.service';

const topicResolve: ResolveFn<ITopic> = route => {
  const id = route.params['id'];
  if (id) {
    const router = inject(Router);
    return inject(TopicService)
      .find(id)
      .pipe(
        mergeMap((topic: HttpResponse<Topic>) => {
          if (topic.body) {
            return of(topic.body);
          } else {
            router.navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(new Topic());
};

export const topicRoute: Routes = [
  {
    path: 'topic',
    loadComponent: () => import('./topic.component').then(m => m.TopicComponent),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'topic/:id/view',
    loadComponent: () => import('./topic-detail.component').then(m => m.TopicDetailComponent),
    resolve: {
      topic: topicResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'topic/new',
    loadComponent: () => import('./topic-update.component').then(m => m.TopicUpdateComponent),
    resolve: {
      topic: topicResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'topic/:id/edit',
    loadComponent: () => import('./topic-update.component').then(m => m.TopicUpdateComponent),
    resolve: {
      topic: topicResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
];
