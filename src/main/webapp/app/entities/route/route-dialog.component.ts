import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { ForbiddenRouteNamesValidatorDirective } from './route-validation.directive';

import { IRoute, Route } from 'app/shared/model/route.model';
import { RouteService } from './route.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { RoutePopupService } from 'app/entities/route/route-popup.service';
import { ThemeService } from 'app/core/theme';

import 'codemirror/addon/edit/closetag';

@Component({
    selector: 'jhi-route-dialog',
    templateUrl: './route-dialog.component.html',
    imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, AlertError, CodemirrorModule, ForbiddenRouteNamesValidatorDirective],
})
export class RouteDialogComponent implements OnInit {
    readonly themeService = inject(ThemeService);
    private routeOptionsTheme = '';
    private routeOptionsCache: Record<string, unknown> | null = null;
    route: IRoute;
    routes: IRoute[];
    routeNames: Array<string> = [];
    isSaving = false;
    show = true;
    type: string;

    editForm = this.fb.group({
        id: [null],
        name: ['', Validators.required],
        type: ['xml'],
        content: [
            ''
        ]
    });

    constructor(
        public activeModal: NgbActiveModal,
        private routeService: RouteService,
        private alertService: AlertService,
        private eventManager: EventManager,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder
    ) {}

    routeEditorOptions(): Record<string, unknown> {
        const theme = this.themeService.editorTheme();
        if (this.routeOptionsCache && this.routeOptionsTheme === theme) {
            return this.routeOptionsCache;
        }
        this.routeOptionsTheme = theme;
        this.routeOptionsCache = {
            lineNumbers: true,
            gutters: ['CodeMirror-linenumbers'],
            theme,
            mode: 'xml',
            autoCloseTags: true,
        };
        return this.routeOptionsCache;
    }

    refreshCodeMirror(editor: { codeMirror?: { refresh: () => void } }): void {
        const codeMirror = editor?.codeMirror;
        if (!codeMirror) {
            return;
        }
        const refresh = () => codeMirror.refresh();
        requestAnimationFrame(() => {
            refresh();
            setTimeout(refresh);
        });
    }

    ngOnInit() {

        // route is injected in the component (see RoutePopupService);
        if (!this.route.id) {
            this.route = this.createFromForm();
        }

        this.updateForm(this.route);

        this.routeService.query().subscribe(
            res => {
                this.routes = res.body;
                this.routeNames = this.routes.map(h => h.name);
            },
            res => this.onError(res.body)
        );


    }

    updateForm(route: IRoute): void {
        this.editForm.patchValue({
            id: route.id,
            name: route.name,
            type: route.type,
            content: route.content
        });
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save(closePopup: boolean) {
        this.isSaving = true;
        this.route = this.createFromForm();
        if (this.route.id) {
            this.subscribeToSaveResponse(this.routeService.update(this.route), closePopup);
        } else {
            this.subscribeToSaveResponse(this.routeService.create(this.route), closePopup);
        }
    }

    navigateToRoute() {
        this.router.navigate(['/route']);
        setTimeout(() => {
            this.activeModal.close();
        }, 0);
    }

    navigateToRouteDetail(routeId: number) {
        this.router.navigate(['/route', routeId]);
        setTimeout(() => {
            this.activeModal.close();
        }, 0);
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IRoute>>, closePopup) {
        result.subscribe(data => {
            if (data.ok) {
                this.onSaveSuccess(data.body, closePopup);
            } else {
                this.onSaveError();
            }
        });
    }

    private onSaveSuccess(result: IRoute, closePopup: boolean) {
		  this.eventManager.broadcast(new EventWithContent('routeListModification', 'OK'));
	    this.eventManager.broadcast(new EventWithContent('routeModified', result.id));
		  this.eventManager.broadcast(new EventWithContent('routeKeysUpdated', result));
      this.isSaving = false;
      this.activeModal.dismiss(result);
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

    private onSaveError() {
        this.isSaving = false;
    }
    private onError(error: any) {
        this.alertService.addAlert({
		  type: 'danger',
		  message: error.message,
		});
    }

}

@Component({
    selector: 'jhi-route-popup',
    template: ''
})
export class RoutePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(private route: ActivatedRoute, private routePopupService: RoutePopupService) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            if (params['id']) {
                console.log('set param' + params['id']);
                this.routePopupService.open(RouteDialogComponent as Component, params['id']);
            } else {
                console.log('no param');
                this.routePopupService.open(RouteDialogComponent as Component);
            }
        });
    }

   ngOnDestroy() {
        this.routeSub.unsubscribe();
    }

}
