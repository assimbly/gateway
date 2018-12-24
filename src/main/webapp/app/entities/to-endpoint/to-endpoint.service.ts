import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IToEndpoint, ToEndpoint } from 'app/shared/model/to-endpoint.model';
import { map } from "rxjs/operators";

type EntityResponseType = HttpResponse<IToEndpoint>;
type EntityArrayResponseType = HttpResponse<IToEndpoint[]>;


@Injectable({ providedIn: 'root' })
export class ToEndpointService {

    private resourceUrlToEndpoint =  SERVER_API_URL + 'api/to-endpoint';
    private resourceUrlToEndpoints =  SERVER_API_URL + 'api/to-endpoints';
    public resourceUrl = SERVER_API_URL + 'api/to-endpoints';

    constructor(protected http: HttpClient) {}

    create(toEndpoint: IToEndpoint): Observable<IToEndpoint> {
        const copy = this.convert(toEndpoint);
        return this.http.post(this.resourceUrlToEndpoint, copy).pipe(map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        }));
    }

    createMultiple(toEndpoints: Array<IToEndpoint>): Observable<Array<IToEndpoint>> {
        const copy = new Array<IToEndpoint>();
        toEndpoints.forEach((toEndpoint) => {
            copy.push(this.convert(toEndpoint))
        });
        return this.http.post(this.resourceUrlToEndpoints, copy).pipe(map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemsFromServer(jsonResponse);
        }));
    }

    update(toEndpoint: IToEndpoint): Observable<IToEndpoint> {
        const copy = this.convert(toEndpoint);
        return this.http.put(this.resourceUrlToEndpoint, copy).pipe(map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        }));
    }

    updateMultiple(toEndpoints: Array<IToEndpoint>): Observable<Array<IToEndpoint>> {
        const copy = new Array<IToEndpoint>();
        toEndpoints.forEach((toEndpoint) => {
            copy.push(this.convert(toEndpoint))
        });
        return this.http.put(this.resourceUrlToEndpoints, copy).pipe(map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemsFromServer(jsonResponse);
        }));
    }

    find(id: number): Observable<IToEndpoint> {
        return this.http.get(`${this.resourceUrlToEndpoint}/${id}`).pipe(map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        }));
    }

    findByFlowId(id: number): Observable<Array<IToEndpoint>> {
        return this.http.get(`${this.resourceUrlToEndpoints}/byflowid/${id}`).pipe(map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemsFromServer(jsonResponse);
        }));
    }

    query(req?: any): Observable<any> {
        const options = createRequestOption(req);
        return this.http.get(this.resourceUrlToEndpoint, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<Response> {
        return this.http.delete<any>(`${this.resourceUrlToEndpoint}/${id}`);
    }

    /**
	 * Convert a returned JSON object to ToEndpoint.
	 */
    private convertItemFromServer(json: any): IToEndpoint {
        const entity: IToEndpoint = Object.assign(new ToEndpoint(), json);
        return entity;
    }

    /**
	 * Convert a returned JSON object to Array<ToEndpoint>.
	 */
    private convertItemsFromServer(json: any): Array<IToEndpoint> {
        const entities: Array<IToEndpoint> = new Array<IToEndpoint>();
        json.forEach((element) => {
            entities.push(Object.assign(new ToEndpoint(), element));
        });
        return entities;
    }

    /**
	 * Convert a ToEndpoint to a JSON which can be sent to the server.
	 */
    private convert(toEndpoint: IToEndpoint): IToEndpoint {
        const copy: IToEndpoint = Object.assign({}, toEndpoint);
        return copy;
    }
}
