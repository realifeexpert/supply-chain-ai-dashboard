import axios from "axios";
// UPDATE: Humne order create/update ke liye zaroori types import kiye hain
import type {
  DashboardSummary,
  Order,
  Product,
  User,
  Vehicle,
  UserCreate,
  ProductCreate,
  ProductUpdate,
  UserUpdate,
  OrderCreate,
  OrderUpdate,
} from "@/types";

// .env se sirf base URL (http://127.0.0.1:8000) aayega
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const apiClient = axios.create({
  // "/api" ko yahaan centrally add kiya gaya hai.
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// -- Data Fetching Functions --
export const getDashboardSummary = () =>
  apiClient.get<DashboardSummary>("/analytics/summary");

export const getProducts = () =>
  apiClient.get<Product[]>("/inventory/products");

export const getOrders = () => apiClient.get<Order[]>("/orders/");

export const getVehicles = () =>
  apiClient.get<Vehicle[]>("/logistics/vehicles");

export const getUsers = () => apiClient.get<User[]>("/users/");

// -- Data Creation Functions --
export const createUser = (userData: UserCreate) =>
  apiClient.post<User>("/users/", userData);

export const createProduct = (productData: ProductCreate) =>
  apiClient.post<Product>("/inventory/products", productData);

// --- UPDATE: Naya Order Create Karne ka Function ---
export const createOrder = (orderData: OrderCreate) =>
  apiClient.post<Order>("/orders/", orderData);

// -- Data Modification Functions --
export const updateProduct = (productId: number, productData: ProductUpdate) =>
  apiClient.put<Product>(`/inventory/products/${productId}`, productData);

export const deleteProduct = (productId: number) =>
  apiClient.delete(`/inventory/products/${productId}`);

export const updateUser = (userId: number, userData: UserUpdate) =>
  apiClient.put<User>(`/users/${userId}`, userData);

export const deleteUser = (userId: number) =>
  apiClient.delete(`/users/${userId}`);

// --- UPDATE: Order Update aur Delete Karne ke Functions ---
export const updateOrder = (orderId: number, orderData: OrderUpdate) =>
  apiClient.put<Order>(`/orders/${orderId}`, orderData);

export const deleteOrder = (orderId: number) =>
  apiClient.delete(`/orders/${orderId}`);
