export interface Product {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  currency: string;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  unitPrice: number;
  currency: string;
  categoryId: string;
}

export interface UpdateProductRequest extends CreateProductRequest { }
