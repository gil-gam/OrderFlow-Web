export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest { }
