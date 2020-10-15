import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthorizationHeaderInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.authService.isUserAuthenticated) {
            request = request.clone({ setHeaders: { Authorization: `${this.authService.authenticatedToken}` } });
        }

        return next.handle(request);
    }
}
