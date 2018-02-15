import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';

import { Header } from './header.model';
import { ResponseWrapper, createRequestOption } from '../../shared';

@Injectable()
export class HeaderService {

    private resourceUrl =  SERVER_API_URL + 'api/headers';

    constructor(private http: Http) { }

    create(header: Header): Observable<Header> {
        const copy = this.convert(header);
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    update(header: Header): Observable<Header> {
        const copy = this.convert(header);
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    find(id: number): Observable<Header> {
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

    private convertResponse(res: Response): ResponseWrapper {
        const jsonResponse = res.json();
        const result = [];
        for (let i = 0; i < jsonResponse.length; i++) {
            result.push(this.convertItemFromServer(jsonResponse[i]));
        }
        return new ResponseWrapper(res.headers, result, res.status);
    }

    /**
     * Convert a returned JSON object to Header.
     */
    private convertItemFromServer(json: any): Header {
        const entity: Header = Object.assign(new Header(), json);
        return entity;
    }

    /**
     * Convert a Header to a JSON which can be sent to the server.
     */
    private convert(header: Header): Header {
        const copy: Header = Object.assign({}, header);
        return copy;
    }
}
