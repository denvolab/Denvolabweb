import { useState } from "react";
import { Link } from "react-router-dom";
import { Empty, Photo } from "../components/UI";
import { useStore } from "../state/Store";
import { money } from "../domain/cart";
import { isDemo } from "../services/store-api";
export function OrderSummary() {
  const { pricing } = useStore();
  return (
    <dl className="order-summary">
      <div>
        <dt>Subtotal</dt>
        <dd>{money(pricing.subtotal)}</dd>
      </div>
      {pricing.discount > 0 && (
        <div>
          <dt>Welcome discount</dt>
          <dd>−{money(pricing.discount)}</dd>
        </div>
      )}
      <div>
        <dt>UK delivery estimate</dt>
        <dd>{pricing.shipping ? money(pricing.shipping) : "Free"}</dd>
      </div>
      <div className="order-total">
        <dt>Total estimate</dt>
        <dd>{money(pricing.total)}</dd>
      </div>
    </dl>
  );
}
export default function Cart() {
  const store = useStore();
  const [code, setCode] = useState(""),
    [status, setStatus] = useState("");
  if (!store.cart.length)
    return (
      <Empty title="Your bag is waiting for something lovely">
        <p>Find your next favourite print and make yourself at home.</p>
      </Empty>
    );
  return (
    <div className="section cart-page">
      <header className="page-intro">
        <p className="eyebrow">A little comfort, coming your way</p>
        <h1>Your shopping bag</h1>
        <p>
          {store.cartCount} {store.cartCount === 1 ? "piece" : "pieces"} to look
          forward to
        </p>
      </header>
      <div className="cart-layout">
        <div className="cart-lines">
          {store.cart.map((line) => {
            const p = store.products.find((p) => p.id === line.productId);
            if (!p) return null;
            return (
              <article className="cart-line" key={p.id + line.size}>
                <Link to={"/products/" + p.id}>
                  <Photo name={p.image} alt={p.name} sizes="130px" />
                </Link>
                <div>
                  <Link className="cart-product-name" to={"/products/" + p.id}>
                    {p.name}
                  </Link>
                  <p>
                    {p.colour} / {line.size}
                  </p>
                  <p>{money(p.price)}</p>
                  <div className="quantity-control">
                    <button
                      aria-label={`Decrease quantity of ${p.name}`}
                      onClick={() =>
                        store.quantity(p.id, line.size, line.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span aria-label="Item quantity">{line.quantity}</span>
                    <button
                      disabled={line.quantity >= Math.min(8, p.stock)}
                      aria-label={`Increase quantity of ${p.name}`}
                      onClick={() =>
                        store.quantity(p.id, line.size, line.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="text-button remove-item"
                    aria-label={`Remove ${p.name} from bag`}
                    onClick={() => store.quantity(p.id, line.size, 0)}
                  >
                    Remove
                  </button>
                </div>
                <strong>{money(p.price * line.quantity)}</strong>
              </article>
            );
          })}
          <Link className="underlined" to="/collections/new-in">
            ← Continue shopping
          </Link>
        </div>
        <aside className="checkout-summary">
          <h2>A lovely little summary</h2>
          <p>
            {store.pricing.subtotal - store.pricing.discount < 6000
              ? `${money(6000 - store.pricing.subtotal + store.pricing.discount)} away from free UK delivery.`
              : "Your bag qualifies for free UK delivery."}
          </p>
          <OrderSummary />
          {isDemo && (
            <form
              className="promo-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (code.trim().toUpperCase() === "WELCOME10") {
                  store.setPromo("WELCOME10");
                  setStatus("10% sample discount applied.");
                } else {
                  store.setPromo("");
                  setStatus("That code was not recognised.");
                }
              }}
            >
              <label htmlFor="promo">Gift or discount code</label>
              <div className="input-row">
                <input
                  id="promo"
                  value={code}
                  maxLength={30}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Try WELCOME10 in this preview"
                />
                <button className="button secondary" type="submit">
                  Apply
                </button>
              </div>
              <p role="status" className="form-status">
                {status}
              </p>
            </form>
          )}
          <Link className="button checkout-link" to="/checkout">
            Continue to checkout →
          </Link>
          <small>
            Delivery, discounts and availability are confirmed at checkout.{" "}
            {isDemo ? "No payment is taken in this preview." : ""}
          </small>
        </aside>
      </div>
    </div>
  );
}
