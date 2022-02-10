import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ITopic, Topic } from 'app/shared/model/topic.model';
import { TopicService } from './topic.service';
import { TopicComponent } from './topic.component';
import { TopicDetailComponent } from './topic-detail.component';
import { TopicUpdateComponent } from './topic-update.component';
import { TopicDeletePopupComponent } from './topic-delete-dialog.component';

@Injectable({ providedIn: 'root' })
export class TopicResolve implements Resolve<ITopic> {
  constructor(private service: TopicService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ITopic> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        flatMap((topic: HttpResponse<Topic>) => {
          if (topic.body) {
            return of(topic.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Topic());
  }
}

export const topicRoute: Routes = [
  {
    path: 'topic',
    component: TopicComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'Topics',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'topic/:id/view',
    component: TopicDetailComponent,
    resolve: {
      topic: TopicResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'Topics',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'topic/new',
    component: TopicUpdateComponent,
    resolve: {
      topic: TopicResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'Topics',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'topic/:id/edit',
    component: TopicUpdateComponent,
    resolve: {
      topic: TopicResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'Topics',
    },
    canActivate: [UserRouteAccessService],
  },
];

export const topicPopupRoute: Routes = [
  {
    path: 'topic/:id/delete',
    component: TopicDeletePopupComponent,
    resolve: {
      topic: TopicResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'Topics',
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup',
  },
];
