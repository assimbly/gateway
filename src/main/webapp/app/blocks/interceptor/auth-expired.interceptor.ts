import { JhiHttpInterceptor } from 'ng-jhipster';
import { Injector } from '@angular/core';
import { RequestOptionsArgs, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AuthServerProvider } from '../../shared/auth/auth-session.service';
import { LoginModalService } from '../../shared/login/login-modal.service';
import { StateStorageService } from '../../shared/auth/state-storage.service';
import { LoginService } from '../../shared/login/login.service';
import { Router } from '@angular/router';

export class AuthExpiredInterceptor extends JhiHttpInterceptor {

    constructor(
        private injector: Injector,
        private stateStorageService: StateStorageService,
        private loginServiceModal: LoginModalService) {
        super();
    }

    requestIntercept(options?: RequestOptionsArgs): RequestOptionsArgs {
        return options;
    }

    responseIntercept(observable: Observable<Response>): Observable<Response> {
        return <Observable<Response>>observable.catch((error) => {
            if (error.status === 401 && error.text() !== '' && error.json().path && !error.json().path.includes('/api/account')) {
                const destination = this.stateStorageService.getDestinationState();
                if (destination !== null) {
                    const to = destination.destination;
                    const toParams = destination.params;
                    if (to.name === 'accessdenied') {
                        this.stateStorageService.storePreviousState(to.name, toParams);
                    }
                } else {
                    this.stateStorageService.storeUrl('/');
                    const loginService: LoginService = this.injector.get(LoginService);
                    loginService.logout();
                    const router: Router = this.injector.get(Router);
                    router.navigate(['/']);

                }
                const authServer: AuthServerProvider = this.injector.get(AuthServerProvider);
                authServer.logout();
            }
            return Observable.throw(error);
        });
    }
}
