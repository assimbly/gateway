import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared/util/request-util';
import { IStep, Step } from 'app/shared/model/step.model';
import { map } from 'rxjs/operators';

type EntityResponseType = HttpResponse<IStep>;
type EntityArrayResponseType = HttpResponse<IStep[]>;

@Injectable({ providedIn: 'root' })
export class StepService {
    private resourceUrlStep = this.applicationConfigService.getEndpointFor('api/step');
    private resourceUrlSteps = this.applicationConfigService.getEndpointFor('api/steps');
    public resourceUrl = this.applicationConfigService.getEndpointFor('api/steps');

    constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

    create(step: IStep): Observable<HttpResponse<IStep>> {
        const copy = this.convert(step);
        return this.http.post(this.resourceUrlStep, copy, { observe: 'response' });
    }

    createMultiple(steps: Array<IStep>): Observable<HttpResponse<any>> {
        const copy = new Array<IStep>();
        steps.forEach(step => {
            copy.push(this.convert(step));
        });
        return this.http.post(this.resourceUrlSteps, copy, { observe: 'response' });
    }

    updateMultiple(steps: Array<IStep>): Observable<HttpResponse<any>> {
        const copy = new Array<IStep>();
        steps.forEach(step => {
            copy.push(this.convert(step));
        });
        return this.http.put(this.resourceUrlSteps, copy, { observe: 'response' });
    }

    update(step: IStep): Observable<EntityResponseType> {
        return this.http.put<IStep>(this.resourceUrl, step, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IStep>(`${this.resourceUrlStep}/${id}`, { observe: 'response' });
    }

    findByFlowId(id: number): Observable<HttpResponse<any>> {
        return this.http.get(`${this.resourceUrlSteps}/byflowid/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IStep[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    /**
     * Convert a returned JSON object step.
     */
    private convertItemFromServer(json: any): IStep {
        const entity: IStep = Object.assign(new Step(), json);
        return entity;
    }

    /**
     * Convert a returned JSON object to Array<Step>.
     */
    private convertItemsFromServer(json: any): Array<IStep> {
        const entities: Array<IStep> = new Array<IStep>();
        json.forEach(element => {
            entities.push(Object.assign(new Step(), element));
        });
        return entities;
    }

    /**
     * Convert a Step to a JSON which can be sent to the server.
     */
    private convert(step: IStep): IStep {
        const copy: IStep = Object.assign({}, step);
        return copy;
    }
}
