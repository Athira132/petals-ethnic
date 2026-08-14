import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('petals_ethnic_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('petals_ethnic_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, size = 'M', color = '') => {
    // Standardize key values
    const selectedSize = size || (product.sizes && product.sizes[0]) || 'M';
    const selectedColor = color || (product.colors && product.colors[0]) || '';

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.size === selectedSize &&
          item.color === selectedColor
      );

      if (existingItemIndex > -1) {
        // Update quantity
        const updatedItems = [...prevItems];
        const newQty = updatedItems[existingItemIndex].quantity + quantity;
        
        // Cap quantity at stock count if defined
        if (product.stockCount !== undefined && newQty > product.stockCount) {
          updatedItems[existingItemIndex].quantity = product.stockCount;
        } else {
          updatedItems[existingItemIndex].quantity = newQty;
        }
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { product, quantity, size: selectedSize, color: selectedColor }];
      }
    });
  };

  const removeFromCart = (productId, size, color) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(item.product.id === productId && item.size === size && item.color === color)
      )
    );
  };

  const updateQuantity = (productId, size, color, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId && item.size === size && item.color === color) {
          const maxStock = item.product.stockCount !== undefined ? item.product.stockCount : 99;
          const cappedQty = Math.min(newQuantity, maxStock);
          return { ...item, quantity: cappedQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const activePrice = item.product.salePrice || item.product.price;
      return acc + activePrice * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal: getSubtotal(),
        cartCount: getCartCount(),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
