import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  language = new BehaviorSubject(this.siteLang);

  set siteLang(value) {
    this.language.next(value); // this will make sure to tell every subscriber about the change.
    localStorage.setItem('language', value);
  }

  get siteLang() {
    return localStorage.getItem('language');
  }
}
