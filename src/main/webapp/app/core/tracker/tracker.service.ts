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
  private subscriber = null;
  private routerSubscription: Subscription | null = null;
  private connectionSubject: ReplaySubject<void> = new ReplaySubject(1);
  private connectionSubscription: Subscription | null = null;
  private stompSubscription: StompSubscription | null = null;
  private listenerSubject: Subject<TrackerActivity> = new Subject();
  private listenerFlow: Observable<any>;
  private listenerObserver: Observer<any>;

  connection: Promise<any>;
  connectedPromise: any = null;
  
  constructor(private router: Router, private authServerProvider: AuthServerProvider, private location: Location) {
	this.listenerFlow = this.createListener();  
  }

  connect(): void {
  
	console.log('connect1');
    if (this.stompClient?.connected) {
      return;
    }
	
	if (this.connectedPromise === null) {
		console.log('connect1b');
		this.connection = this.createConnection();
	}

	console.log('connect2');

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

	console.log('connect3');
	
	this.stompClient.connect(headers, () => {
			console.log('connect3a');
            this.connectedPromise('success');
            this.connectedPromise = null;
        });
	
	

	console.log('connect4');	
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

  receive(): Subject<TrackerActivity> {
    return this.listenerSubject;
  }

  receiveFlow(): any {
    return this.listenerFlow;
  }
  
 
  subscribeFlow(id, type): void {
  
	const topic = '/topic/' + id + '/' + type;

  	console.log('subscribeFlow2 topic=' + topic);
	  
	//this.connection.then(() => {
		console.log('subscribeFlow3 topic=' + topic);
		
		this.subscriber = this.stompClient.subscribe(topic, data => {
			
			console.log('subscribeFlow4 tracker data=' +data);
			if (!this.listenerObserver) {
				this.listenerFlow = this.createListener();
			}
			
			this.listenerObserver.next(data.body);
		});
		
	//});
			
	

  }  
  
  unsubscribe(): void {
        if (this.subscriber !== null) {
            this.subscriber.unsubscribe();
        }
        this.listenerFlow = this.createListener();
  }



	private createConnection(): Promise<any> {
		return new Promise((resolve, reject) => (this.connectedPromise = resolve));
	}
  
  private createListener(): Observable<any> {
    return new Observable(observer => {
      this.listenerObserver = observer;
    });
  }
  
}
