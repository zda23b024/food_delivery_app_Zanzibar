import { CartSummary } from "@/components/CartSummary";

export default function CartPage() {
  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Cart</h2>
          <p>Update quantities, remove items, and review delivery cost.</p>
        </div>
      </div>
      <CartSummary />
    </div>
  );
}
