import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, CreateOrderRequest, UpdateOrderRequest, PaginatedList } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  // Rota versionada real da API
  private readonly baseUrl = `${environment.apiBaseUrl}/api/1.0/Orders`;

  getAll(pageIndex = 1, pageSize = 10): Observable<PaginatedList<Order>> {
    return this.http.get<PaginatedList<Order>>(this.baseUrl, {
      params: { pageIndex, pageSize },
    });
  }

  getById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateOrderRequest): Observable<string> {
    return this.http.post<string>(this.baseUrl, request);
  }

  update(id: string, request: UpdateOrderRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
