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
	this.listener = this.createListener();  
  }

  connect(): void {
  
    if (this.stompClient?.connected) {
      return;
    }
	
	if (this.connectedPromise === null) {
		console.log('connect1b');
		this.connection = this.createConnection();
	}


    // building absolute path so that websocket doesn't fail when deploying with a context path
    let url = '/topic/alert';
    url = this.location.prepareExternalUrl(url);
    const authToken = this.authServerProvider.getToken();
    if (authToken) {
      url += '?access_token=' + authToken;
    }
    const socket: WebSocket = new SockJS(url);
    this.stompClient = Stomp.over(socket, { protocols: ['v12.stomp'] });
    const headers: ConnectionHeaders = {};
	
	this.stompClient.connect(headers, () => {
            this.connectedPromise('success');
            this.connectedPromise = null;
        });

  }

  disconnect(): void {
    //this.unsubscribe();

    this.connectionSubject = new ReplaySubject(1);

    if (this.stompClient) {
      if (this.stompClient.connected) {
        this.stompClient.disconnect();
      }
      this.stompClient = null;
    }
  }

	private createConnection(): Promise<any> {
		return new Promise((resolve, reject) => (this.connectedPromise = resolve));
	}
  
  private createListener(): Observable<any> {
    return new Observable(observer => {
      this.listenerObserver = observer;
    });
  }
     
    client() {
        return this.stompClient;
    }  
  
}