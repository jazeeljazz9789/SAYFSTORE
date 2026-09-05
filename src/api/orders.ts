/**
 * SAYF Frontend API Client
 * All API communication goes through this module.
 * Never scatter fetch calls directly in components.
 */

export interface OrderRequest {
  name: string;
  phone: string;
  address: string;
  paymentMethod: "cod" | "upi";
  items: { id: string; qty: number }[];
}

export interface OrderResponse {
  success: boolean;
  message: string;
  order: {
    orderId: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  };
}

export interface APIError {
  error: string;
}

class APIClient {
  private baseURL = "/api";

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMsg = "Something went wrong. Please try again.";
        try {
          const errorBody = await response.json();
          if (errorBody.error && typeof errorBody.error === "string") {
            errorMsg = errorBody.error;
          }
        } catch {
          // ignore JSON parse failure
        }
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error("Request timed out. Please check your connection and try again.");
      }

      if (err instanceof TypeError && err.message === "Failed to fetch") {
        throw new Error("Unable to connect to the server. Please check your internet connection.");
      }

      throw err;
    }
  }

  async createOrder(data: OrderRequest, idempotencyKey?: string): Promise<OrderResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    
    return this.request<OrderResponse>("/orders", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
  }
}

export const api = new APIClient();
