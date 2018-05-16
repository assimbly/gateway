import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';

import { ToEndpoint } from './to-endpoint.model';
import { ResponseWrapper, createRequestOption } from '../../shared';

@Injectable()
export class ToEndpointService {

    private resourceUrl =  SERVER_API_URL + 'api/to-endpoints';

    constructor(private http: Http) { }

    create(toEndpoint: ToEndpoint): Observable<ToEndpoint> {
        const copy = this.convert(toEndpoint);
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    update(toEndpoint: ToEndpoint): Observable<ToEndpoint> {
        const copy = this.convert(toEndpoint);
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    find(id: number): Observable<ToEndpoint> {
        return this.http.get(`${this.resourceUrl}/${id}`).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    findByFlowId(id: number): Observable<Array<ToEndpoint>> {
        return this.http.get(`${this.resourceUrl}/byflowid/${id}`).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemsFromServer(jsonResponse);
        });
    }

    query(req?: any): Observable<ResponseWrapper> {
        const options = createRequestOption(req);
        return this.http.get(this.resourceUrl, options)
            .map((res: Response) => this.convertResponse(res));
    }

    delete(id: number): Observable<Response> {
        return this.http.delete(`${this.resourceUrl}/${id}`);
    }

    private convertResponse(res: Response): ResponseWrapper {
        const jsonResponse = res.json();
        const result = [];
        for (let i = 0; i < jsonResponse.length; i++) {
            result.push(this.convertItemFromServer(jsonResponse[i]));
        }
        return new ResponseWrapper(res.headers, result, res.status);
    }

    /**
	 * Convert a returned JSON object to ToEndpoint.
	 */
    private convertItemFromServer(json: any): ToEndpoint {
        const entity: ToEndpoint = Object.assign(new ToEndpoint(), json);
        return entity;
    }

    /**
	 * Convert a returned JSON object to Array<ToEndpoint>.
	 */
    private convertItemsFromServer(json: any): Array<ToEndpoint> {
        const entities: Array<ToEndpoint> = new Array<ToEndpoint>();
        json.forEach((element) => {
            entities.push(Object.assign(new ToEndpoint(), element));
        });
        return entities;
    }

    /**
	 * Convert a ToEndpoint to a JSON which can be sent to the server.
	 */
    private convert(toEndpoint: ToEndpoint): ToEndpoint {
        const copy: ToEndpoint = Object.assign({}, toEndpoint);
        return copy;
    }
}
