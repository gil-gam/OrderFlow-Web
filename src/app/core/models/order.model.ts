export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  status: string;
  totalAmount: number;
  currency: string;
  itemCount: number;
  orderDate: string;
}

export interface CreateOrderRequest {
  customerId: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  currency?: string;
}

export interface UpdateOrderRequest {
  orderId: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  items: OrderItemRequest[];
}

export interface PaginatedList<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
