export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone: string;
  address: Address;
}

export interface UpdateCustomerRequest extends CreateCustomerRequest { }
