import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';

import { CamelRoute } from './camel-route.model';
import { ResponseWrapper, createRequestOption } from '../../shared';

@Injectable()
export class CamelRouteService {

    private resourceUrl =  SERVER_API_URL + 'api/camel-routes';

    constructor(private http: Http) { }

    create(camelRoute: CamelRoute): Observable<CamelRoute> {
        const copy = this.convert(camelRoute);
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    update(camelRoute: CamelRoute): Observable<CamelRoute> {
        const copy = this.convert(camelRoute);
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    find(id: number): Observable<CamelRoute> {
        return this.http.get(`${this.resourceUrl}/${id}`).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
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

    deleteAll(id: number): Observable<Response> {
        return this.http.delete(`${this.resourceUrl}/delete-all/${id}`);
    }

    start(id: number): Observable<Response> {
        return this.http.get(`${this.resourceUrl}/start/${id}`);
    }

    restart(id: number): Observable<Response> {
        return this.http.get(`${this.resourceUrl}/restart/${id}`);
    }

    stop(id: number): Observable<Response> {
        return this.http.get(`${this.resourceUrl}/stop/${id}`);
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
     * Convert a returned JSON object to CamelRoute.
     */
    private convertItemFromServer(json: any): CamelRoute {
        const entity: CamelRoute = Object.assign(new CamelRoute(), json);
        return entity;
    }

    /**
     * Convert a CamelRoute to a JSON which can be sent to the server.
     */
    private convert(camelRoute: CamelRoute): CamelRoute {
        const copy: CamelRoute = Object.assign({}, camelRoute);
        return copy;
    }
}
