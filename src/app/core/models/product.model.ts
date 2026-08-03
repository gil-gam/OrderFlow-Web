export interface Product {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  currency: string;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  // Optional aliases used by templates
  price?: number;
  categoryName?: string;
  stockQuantity?: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  unitPrice: number;
  currency: string;
  categoryId: string;
}

export interface UpdateProductRequest extends CreateProductRequest { }
