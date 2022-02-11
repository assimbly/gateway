import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Observable, Observer, Subscription, ReplaySubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import SockJS from 'sockjs-client';
import Stomp, { Client, Subscription as StompSubscription, ConnectionHeaders, Message } from 'webstomp-client';

import { AuthServerProvider } from 'app/core/auth/auth-jwt.service';
import { TrackerActivity } from './tracker-activity.model';

@Injectable({ providedIn: 'root' })
export class TrackerService {
  private stompClient: Client | null = null;
  private routerSubscription: Subscription | null = null;
  private connectionSubject: ReplaySubject<void> = new ReplaySubject(1);
  private connectionSubscription: Subscription | null = null;
  private stompSubscription: StompSubscription | null = null;
  private listenerSubject: Subject<TrackerActivity> = new Subject();
  private listenerFlow: Observable<any>;
  private listenerObserver: Observer<any>;

  constructor(private router: Router, private authServerProvider: AuthServerProvider, private location: Location) {
	this.listenerFlow = this.createListener();  
  }

  connect(): void {
    if (this.stompClient?.connected) {
      return;
    }

    // building absolute path so that websocket doesn't fail when deploying with a context path
    let url = '/websocket/tracker';
    url = this.location.prepareExternalUrl(url);
    const authToken = this.authServerProvider.getToken();
    if (authToken) {
      url += '?access_token=' + authToken;
    }
    const socket: WebSocket = new SockJS(url);
    this.stompClient = Stomp.over(socket, { protocols: ['v12.stomp'] });
    const headers: ConnectionHeaders = {};
    this.stompClient.connect(headers, () => {
      this.connectionSubject.next();

      this.sendActivity();

      this.routerSubscription = this.router.events
        .pipe(filter((event: Event) => event instanceof NavigationEnd))
        .subscribe(() => this.sendActivity());
    });
  }

  disconnect(): void {
    this.unsubscribe();

    this.connectionSubject = new ReplaySubject(1);

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
    }

    if (this.stompClient) {
      if (this.stompClient.connected) {
        this.stompClient.disconnect();
      }
      this.stompClient = null;
    }
  }

  receive(): Subject<TrackerActivity> {
    return this.listenerSubject;
  }

  receiveFlow(): any {
    return this.listenerFlow;
  }
  
  subscribe(): void {
    if (this.connectionSubscription) {
      return;
    }

    this.connectionSubscription = this.connectionSubject.subscribe(() => {
      if (this.stompClient) {
        this.stompSubscription = this.stompClient.subscribe('/topic/tracker', (data: Message) => {
          this.listenerSubject.next(JSON.parse(data.body));
        });
      }
    });
	
  }
  
  subscribeFlow(id, type): void {
    if (this.connectionSubscription) {
      return;
    }

	const topic = '/topic/' + id + '/' + type;
	
    this.connectionSubscription = this.connectionSubject.subscribe(() => {
      if (this.stompClient) {
        this.stompSubscription = this.stompClient.subscribe(topic, (data: Message) => {
          this.listenerSubject.next(JSON.parse(data.body));
        });
      }
    });
  }
  
  subscribeAlert(id): void {
    if (this.connectionSubscription) {
      return;
    }

    this.connectionSubscription = this.connectionSubject.subscribe(() => {
      if (this.stompClient) {
        this.stompSubscription = this.stompClient.subscribe('/topic/' + id + 'alert', (data: Message) => {
          this.listenerSubject.next(JSON.parse(data.body));
        });
      }
    });
	
  }
  
  unsubscribe(): void {
    if (this.stompSubscription) {
      this.stompSubscription.unsubscribe();
      this.stompSubscription = null;
    }

    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
      this.connectionSubscription = null;
    }
  }

  private sendActivity(): void {
    if (this.stompClient?.connected) {
      this.stompClient.send(
        '/topic/activity', // destination
        JSON.stringify({ page: this.router.routerState.snapshot.url }), // body
        {} // header
      );
    }
  }

  private createListener(): Observable<any> {
    return new Observable(observer => {
      this.listenerObserver = observer;
    });
  }
  
}
