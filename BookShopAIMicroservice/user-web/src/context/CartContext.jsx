// import { createContext, useContext, useState, useEffect } from "react";
// import { orderApi } from "../api/orderApi";

// const CartContext = createContext();

// export function CartProvider({ children }) {
//   const [cartCount, setCartCount] = useState(0);

//   // ✅ load số lượng giỏ khi user đăng nhập
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const user = JSON.parse(localStorage.getItem("user"));
//         if (!user?.uid) return;
//         const res = await orderApi.getCart(user.uid);
//         setCartCount(res.data.data?.items?.length || 0);
//       } catch {
//         setCartCount(0);
//       }
//     };
//     load();
//   }, []);

//   // ✅ cho phép component khác gọi
//   const refreshCart = async () => {
//     try {
//       const user = JSON.parse(localStorage.getItem("user"));
//       if (!user?.uid) return setCartCount(0);
//       const res = await orderApi.getCart(user.uid);
//       setCartCount(res.data.data?.items?.length || 0);
//     } catch {
//       setCartCount(0);
//     }
//   };

//   const increment = () => setCartCount((c) => c + 1);
//   const decrement = () => setCartCount((c) => Math.max(0, c - 1));
//   const clear = () => setCartCount(0);

//   return (
//     <CartContext.Provider
//       value={{ cartCount, refreshCart, increment, decrement, clear }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export const useCart = () => {
//   const ctx = useContext(CartContext);
//   if (!ctx) {
//     throw new Error("useCart must be used inside a <CartProvider>");
//   }
//   return ctx;
// };




import { createContext, useContext, useState, useEffect } from "react";
import { orderApi } from "../api/orderApi";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0); // số loại sản phẩm khác nhau
  const [totalQty, setTotalQty] = useState(0);   // tổng số lượng sách

  // ✅ load khi khởi động (user đã đăng nhập)
  useEffect(() => {
    const load = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.uid) return;
        const res = await orderApi.getCart(user.uid);
        const items = res.data.data?.items || [];
        setCartCount(items.length);
        setTotalQty(items.reduce((sum, it) => sum + (it.quantity || 0), 0));
      } catch {
        setCartCount(0);
        setTotalQty(0);
      }
    };
    load();
  }, []);

  // ✅ làm mới (sử dụng lại được ở AddToCart, Cart, Checkout, ...)
  const refreshCart = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.uid) return setCartCount(0), setTotalQty(0);
      const res = await orderApi.getCart(user.uid);
      const items = res.data.data?.items || [];
      setCartCount(items.length);
      setTotalQty(items.reduce((sum, it) => sum + (it.quantity || 0), 0));
    } catch {
      setCartCount(0);
      setTotalQty(0);
    }
  };

  const increment = (qty = 1) => {
    setCartCount((c) => c + 1);
    setTotalQty((q) => q + qty);
  };

  const decrement = (qty = 1) => {
    setCartCount((c) => Math.max(0, c - 1));
    setTotalQty((q) => Math.max(0, q - qty));
  };

  const clear = () => {
    setCartCount(0);
    setTotalQty(0);
  };

  return (
    <CartContext.Provider
      value={{ cartCount, totalQty, refreshCart, increment, decrement, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside a <CartProvider>");
  return ctx;
};
