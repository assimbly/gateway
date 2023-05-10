import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Collectors {

    tracing = {
                	"id": "0",
                	"type": "message",
                	"events": [
                		"ExchangeCompleted",
                		"ExchangeCreated",
                		"ExchangeFailed",
                		"ExchangeFailure",
                		"ExchangeFailureHandled",
                		"ExchangeFailureHandling",
                	],
                	"stores": [
                		{
                			"type": "console"
                		}
                	],
                	"filters": []
                }

}
