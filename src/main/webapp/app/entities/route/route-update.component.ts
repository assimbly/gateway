import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { FileLoadError, DataUtils } from 'app/core/util/data-util.service';
import { IRoute, Route } from 'app/shared/model/route.model';
import { RouteService } from './route.service';
// import { AlertError } from 'app/shared/alert/alert-error.model';

@Component({
    selector: 'jhi-route-update',
    templateUrl: './route-update.component.html'
})
export class RouteUpdateComponent implements OnInit {
    isSaving = false;
    showType = false;

    editForm = this.fb.group({
        id: [],
        name: [],
        type: [],
        content: []
    });

    constructor(
        protected dataUtils: DataUtils,
        protected eventManager: EventManager,
        protected routeService: RouteService,
        protected activatedRoute: ActivatedRoute,
        private fb: FormBuilder
    ) {}

    ngOnInit(): void {
        this.activatedRoute.data.subscribe(({ route }) => {
            this.updateForm(route);
        });
    }

    updateForm(route: IRoute): void {
        this.editForm.patchValue({
            id: route.id,
            name: route.name,
            type: route.type,
            content: route.content
        });
    }

    byteSize(base64String: string): string {
        return this.dataUtils.byteSize(base64String);
    }

    openFile(contentType: string, base64String: string): void {
        this.dataUtils.openFile(contentType, base64String);
    }

    setFileData(event: Event, field: string, isImage: boolean): void {
        this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe(null, (err: FileLoadError) => {
        });
    }

    previousState(): void {
        window.history.back();
    }

    save(): void {
        this.isSaving = true;
        const route = this.createFromForm();
        if (route.id !== undefined) {
            this.subscribeToSaveResponse(this.routeService.update(route));
        } else {
            this.subscribeToSaveResponse(this.routeService.create(route));
        }
    }

    private createFromForm(): IRoute {
        return {
            ...new Route(),
            id: this.editForm.get(['id'])!.value,
            name: this.editForm.get(['name'])!.value,
            type: this.editForm.get(['type'])!.value,
            content: this.editForm.get(['content'])!.value
        };
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IRoute>>): void {
        result.subscribe(
            () => this.onSaveSuccess(),
            () => this.onSaveError()
        );
    }

    protected onSaveSuccess(): void {
        this.isSaving = false;
        this.previousState();
    }

    protected onSaveError(): void {
        this.isSaving = false;
    }
}
