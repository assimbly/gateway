import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Observable, Observer, Subscription, ReplaySubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import SockJS from 'sockjs-client';
import Stomp, { Client, Subscription as StompSubscription, ConnectionHeaders, Message } from 'webstomp-client';

import { AuthServerProvider } from 'app/core/auth/auth-jwt.service';

@Injectable({ providedIn: 'root' })
export class WebSocketsService {
  private stompClient: Client | null = null;
  private connectionSubject: ReplaySubject<void> = new ReplaySubject(1);
  private connectionSubscription: Subscription | null = null;
  private stompSubscription: StompSubscription | null = null;
  private listenerSubject: Subject<string> = new Subject();
  private listener: Observable<any>;
  private listenerObserver: Observer<any>;

  connection: Promise<any>;
  connectedPromise: any = null;
  
  constructor(private router: Router, private authServerProvider: AuthServerProvider, private location: Location) {
	}

    connect(): void {
    if (this.stompClient?.connected) {
      return;
    }

    // building absolute path so that websocket doesn't fail when deploying with a context path
    let url = '/websocket/tracker';
    url = this.location.prepareExternalUrl(url);

	url = url.replace('#','');

    const authToken = this.authServerProvider.getToken();
    if (authToken) {
      url += '?access_token=' + authToken;
    }
    const socket: WebSocket = new SockJS(url);
    this.stompClient = Stomp.over(socket, { protocols: ['v12.stomp'] });
    const headers: ConnectionHeaders = {};
    this.stompClient.connect(headers, () => {
      this.connectionSubject.next();
    });
  }
  
    disconnect(): void {
		this.unsubscribe();

		this.connectionSubject = new ReplaySubject(1);

		if (this.stompClient) {
		  if (this.stompClient.connected) {
			this.stompClient.disconnect();
		  }
		  this.stompClient = null;
		}
	  }
  
    receive(): Subject<string> {
		return this.listenerSubject;
	}

    getClient() {
        return this.stompClient;
    }

	getConnectionSubject() {
        return this.connectionSubject;
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
  
}