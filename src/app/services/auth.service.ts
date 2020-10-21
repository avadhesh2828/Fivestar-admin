import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class AuthService {
    private currentUserTokenSubject: BehaviorSubject<string>;
    public currentUserToken: Observable<string>;

    private isAuthenticatedSubject: BehaviorSubject<boolean>;
    public isAuthenticated: Observable<boolean>;

    constructor(private http: HttpClient, private router: Router) {
        this.currentUserTokenSubject = new BehaviorSubject<string>(this.getToken());
        this.currentUserToken = this.currentUserTokenSubject.asObservable();

        const isLoggedIn = this.getToken().length > 0 ? true : false;
        this.isAuthenticatedSubject = new BehaviorSubject<boolean>(isLoggedIn);
        this.isAuthenticated = this.isAuthenticatedSubject.asObservable();
    }

    public login(data: object) {
        return this.http.post(`${environment.API_URL}/login`, data)
            .pipe(map(response => {
                this.setAuthToken(response['Data'].session_key.toString());
                return response;
            }));
    }

    public verifyPersonalPassword(data: object) {
        return this.http.post(`${environment.API_URL}/verify-personal-password`, data)
            .pipe(map(response => {
                this.setAuthToken(response['Data'].session_key.toString());
                return response;
            }));
    }

    public initialLogin(data: object) {
        return this.http.post(`${environment.API_URL}/login`, data);
    }

    public setPersonalPassword(data: object) {
        return this.http.post(`${environment.API_URL}/set-personal-password`, data)
            .pipe(map(response => {
                this.setAuthToken(response['Data'].session_key.toString());
                return response;
            }));
    }

    public changePassword(data: object) {
        return this.http.post(`${environment.API_URL}/change-password`, data);
    }

    public get_user_details() {
        return this.http.get(`${environment.API_URL}/get-details`);
    }

    public logout() {
        return this.http.post(`${environment.API_URL}/logout`, {})
            .pipe(map(response => {
                this.removeAuthToken();
                this.router.navigate(['/login']);
                return response;
            }));
    }

    public get isUserAuthenticated(): boolean {
        return this.isAuthenticatedSubject.value;
    }

    public get authenticatedToken(): string {
        return this.currentUserTokenSubject.value;
    }

    private setAuthToken(token: string) {
        localStorage.setItem('AdminAuthToken', token);
        this.currentUserTokenSubject.next(token);
        this.isAuthenticatedSubject.next(true);
    }

    private getToken(): string {
        return localStorage.getItem('AdminAuthToken') || '';
    }

    public removeAuthToken() {
        localStorage.clear();
        this.currentUserTokenSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/login']);
    }



}
