import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';

import { Group } from './group.model';
import { ResponseWrapper, createRequestOption } from '../../shared';

@Injectable()
export class GroupService {

    private resourceUrl =  SERVER_API_URL + 'api/groups';

    constructor(private http: Http) { }

    create(group: Group): Observable<Group> {
        const copy = this.convert(group);
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    update(group: Group): Observable<Group> {
        const copy = this.convert(group);
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    find(id: number): Observable<Group> {
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
     * Convert a returned JSON object to Group.
     */
    private convertItemFromServer(json: any): Group {
        const entity: Group = Object.assign(new Group(), json);
        return entity;
    }

    /**
     * Convert a Group to a JSON which can be sent to the server.
     */
    private convert(group: Group): Group {
        const copy: Group = Object.assign({}, group);
        return copy;
    }
}
