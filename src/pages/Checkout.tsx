import { useState } from "react";
import { Link } from "react-router-dom";
import { Empty } from "../components/UI";
import { addressSchema } from "../domain/types";
import { useStore } from "../state/Store";
import { isDemo, message, storeApi } from "../services/store-api";
import { OrderSummary } from "./Cart";
export default function Checkout() {
  const store = useStore();
  const [errors, setErrors] = useState<Record<string, string>>({}),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  if (!store.cart.length)
    return (
      <Empty title="Let’s find your first favourite">
        <p>Add a piece to your bag before checking out.</p>
      </Empty>
    );
  return (
    <div className="section checkout-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/cart">Your bag</Link>
        <span>→</span>
        <span>Checkout</span>
      </nav>
      <header className="page-intro">
        <p className="eyebrow">Almost there</p>
        <h1>Make yourself at home</h1>
        <p>
          {isDemo
            ? "Checkout preview — no payment will be collected."
            : "Enter your details to continue to secure payment."}
        </p>
      </header>
      <div className="cart-layout">
        <form
          className="checkout-form"
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            setStatus("");
            const data = new FormData(e.currentTarget);
            const parsed = addressSchema.safeParse({
              email: data.get("email"),
              firstName: data.get("firstName"),
              lastName: data.get("lastName"),
              address: data.get("address"),
              city: data.get("city"),
              postcode: data.get("postcode"),
              country: data.get("country"),
              consent: data.get("consent") === "on",
            });
            if (!parsed.success) {
              const issues: Record<string, string> = {};
              for (const issue of parsed.error.issues)
                issues[String(issue.path[0])] =
                  "Please " +
                  (issue.path[0] === "consent"
                    ? "agree to the terms."
                    : issue.path[0] === "email"
                      ? "enter a valid email address."
                      : "complete this field.");
              setErrors(issues);
              setStatus("Please check the highlighted fields.");
              return;
            }
            setErrors({});
            setBusy(true);
            try {
              const url = await storeApi.checkout(
                store.cart,
                parsed.data,
                store.promo,
              );
              window.location.assign(url);
            } catch (error) {
              setStatus(
                isDemo
                  ? "Your details are valid. Checkout is not available in this preview. No order has been placed or payment taken."
                  : message(error),
              );
              setBusy(false);
            }
          }}
        >
          <h2>Your details</h2>
          <div className="form-grid">
            {[
              ["email", "Email address", "email", "email"],
              ["firstName", "First name", "given-name", "text"],
              ["lastName", "Last name", "family-name", "text"],
              ["address", "Street address", "street-address", "text"],
              ["city", "Town / city", "address-level2", "text"],
              ["postcode", "Postcode", "postal-code", "text"],
            ].map(([name, label, autocomplete, type]) => (
              <label
                className={name === "email" || name === "address" ? "wide" : ""}
                key={name}
              >
                {label}
                <input
                  name={name}
                  type={type}
                  aria-label={label}
                  autoComplete={autocomplete}
                  maxLength={name === "email" ? 254 : 160}
                  aria-invalid={!!errors[name!]}
                  aria-describedby={errors[name!] ? `error-${name}` : undefined}
                  required
                />
                {errors[name!] && (
                  <span className="form-error" id={"error-" + name}>
                    {errors[name!]}
                  </span>
                )}
              </label>
            ))}
            <label className="wide">
              Country
              <select name="country" autoComplete="country">
                <option value="GB">United Kingdom</option>
              </select>
            </label>
          </div>
          <h2>Delivery</h2>
          <p className="delivery-option">
            Standard UK delivery · Free on orders over £60
          </p>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="consent"
              aria-invalid={!!errors.consent}
            />
            I agree to the <Link to="/pages/terms-conditions">terms</Link> and
            have read the <Link to="/pages/privacy">privacy notice</Link>.
          </label>
          {errors.consent && <p className="form-error">{errors.consent}</p>}
          <p className="form-status" role="status">
            {status}
          </p>
          <button className="button" disabled={busy} type="submit">
            {busy
              ? "Please wait…"
              : isDemo
                ? "Review checkout details"
                : "Continue to secure payment"}
          </button>
          <p className="muted">
            {isDemo
              ? "Your address is not saved or sent in this preview."
              : "Your payment details are handled by the payment provider."}
          </p>
        </form>
        <aside className="checkout-summary">
          <h2>Your order</h2>
          {store.cart.map((l) => {
            const p = store.products.find((p) => p.id === l.productId);
            return (
              <p key={l.productId + l.size}>
                {p?.name} · {l.size} × {l.quantity}
              </p>
            );
          })}
          <OrderSummary />
          <Link className="underlined" to="/cart">
            Edit your bag
          </Link>
        </aside>
      </div>
    </div>
  );
}
