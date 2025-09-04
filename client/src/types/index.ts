// Status types for badges
export type OrderStatus = "Delivered" | "Shipped" | "Pending" | "Cancelled";
export type ProductStatus = "In Stock" | "Low Stock" | "Out of Stock";
export type VehicleStatus = "On Route" | "Idle" | "In-Shop";
export type UserRole = "admin" | "user";

// --- Interface Definitions ---

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
  status: ProductStatus;
}

export interface ProductCreate {
  name: string;
  sku: string;
  stock_quantity: number;
  status: ProductStatus;
}

export interface ProductUpdate {
  name?: string;
  sku?: string;
  stock_quantity?: number;
  status?: ProductStatus;
}

export interface Order {
  id: number;
  customer_name: string;
  order_date: string;
  status: OrderStatus;
  amount: number;
}

// UPDATE: Yeh naya type hum "Add New Order" form ke liye istemal karenge.
export interface OrderCreate {
  customer_name: string;
  amount: number;
  shipping_address: string;
  status: OrderStatus;
}

// UPDATE: Yeh naya type hum "Update Order Status" dropdown ke liye istemal karenge.
export interface OrderUpdate {
  status?: OrderStatus;
}

export interface Vehicle {
  id: number;
  vehicle_number: string;
  driver_name: string;
  status: VehicleStatus;
  orders_count: number;
  live_temp: number;
  fuel_level: number;
}

export interface DashboardSummary {
  total_orders: number;
  total_revenue: number;
  on_time_deliveries: number;
  pending_orders: number;
}
