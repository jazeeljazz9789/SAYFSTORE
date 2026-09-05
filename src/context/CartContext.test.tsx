import React from 'react';
import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import product from '../data/products';

describe('CartContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );

  it('should add items to cart and calculate subtotal correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(2);
    });

    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].qty).toBe(2);
    expect(result.current.items[0].price).toBe(product.basePrice * 2);
    expect(result.current.subtotal).toBe(product.basePrice * 2);
    expect(result.current.totalItems).toBe(2);
  });

  it('should not allow quantity to exceed 10', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(15);
    });

    expect(result.current.items[0].qty).toBe(10);
    expect(result.current.subtotal).toBe(product.basePrice * 10);
  });

  it('should update quantity and subtotal correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(1);
    });

    expect(result.current.items[0].qty).toBe(1);

    act(() => {
      result.current.updateQty(product.id, 5);
    });

    expect(result.current.items[0].qty).toBe(5);
    expect(result.current.subtotal).toBe(product.basePrice * 5);
  });

  it('should remove item from cart if updated quantity is 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(2);
    });

    expect(result.current.items.length).toBe(1);

    act(() => {
      result.current.updateQty(product.id, 0);
    });

    expect(result.current.items.length).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('should remove item via removeItem correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(1);
    });

    expect(result.current.items.length).toBe(1);

    act(() => {
      result.current.removeItem(product.id);
    });

    expect(result.current.items.length).toBe(0);
  });

  it('should open and close cart correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.openCart();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeCart();
    });

    expect(result.current.isOpen).toBe(false);
  });
});
