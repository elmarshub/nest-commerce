import "server-only";
import { api } from "./client";

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function getCart(accessToken: string) {
  const { data, error } = await api.GET("/api/v1/cart", {
    headers: authHeaders(accessToken),
  });

  if (error) return null;
  return data;
}

export async function addCartItem(
  accessToken: string,
  item: { productId: string; quantity: number },
) {
  const { data, error } = await api.POST("/api/v1/cart/items", {
    headers: authHeaders(accessToken),
    body: item,
  });

  if (error) return null;
  return data;
}

export async function updateCartItem(
  accessToken: string,
  itemId: string,
  quantity: number,
) {
  const { data, error } = await api.PATCH("/api/v1/cart/items/{itemId}", {
    params: { path: { itemId } },
    headers: authHeaders(accessToken),
    body: { quantity },
  });

  if (error) return null;
  return data;
}

export async function removeCartItem(accessToken: string, itemId: string) {
  const { data, error } = await api.DELETE("/api/v1/cart/items/{itemId}", {
    params: { path: { itemId } },
    headers: authHeaders(accessToken),
  });

  if (error) return null;
  return data;
}

export async function clearCart(accessToken: string) {
  const { data, error } = await api.DELETE("/api/v1/cart", {
    headers: authHeaders(accessToken),
  });

  if (error) return null;
  return data;
}
