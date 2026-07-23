export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  customerId: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface UpdateOrderRequest {
  status: OrderStatus;
  items?: OrderItemRequest[];
}
