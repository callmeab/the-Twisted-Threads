import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderModel } from '../models/order.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// The Web App URL generated from your Google Apps Script deployment
export const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyss7OXhTO-Q-1SMQyQBpaZrjO-aRocl4jh0-j8qZW2I86o5BMfxH_Md2MKj04HZpsaPg/exec';

@Injectable({
  providedIn: 'root'
})
export class EmailNotificationService {
  private http = inject(HttpClient);

  /**
   * Sends the order data to the Google Apps Script Web App.
   * The Apps Script will handle sending the email to the store owner and the customer.
   */
  sendOrderEmails(order: OrderModel | any): Observable<any> {


    // Google Apps Script requires CORS 'no-cors' mode if calling from browser, 
    // otherwise the 302 redirect throws a CORS error.
    return new Observable(subscriber => {
      fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(order)
      }).then(() => {
        // With no-cors, the response is opaque, meaning we can't read response.ok
        // but if it didn't throw a network error, the request was dispatched.
        subscriber.next({ status: 'sent', message: 'Opaque request dispatched to GAS' });
        subscriber.complete();
      }).catch(err => {
        subscriber.error(err);
      });
    });
  }
}
