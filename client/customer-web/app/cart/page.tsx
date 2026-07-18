import { CartSummary } from "@/components/CartSummary";

export default function CartPage() {
  return (
    <div className="cart-page">
      <section className="section-head">
        <div>
          <h2>Your cart</h2>
          <p>Update quantities, remove items, and review delivery cost before checkout.</p>
        </div>
      </section>
      <CartSummary />
    </div>
  );
}
