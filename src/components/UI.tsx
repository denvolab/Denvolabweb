import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../domain/types";
import { money } from "../domain/cart";
import { useStore } from "../state/Store";
export function Photo({
  name,
  alt,
  priority = false,
  className = "",
  sizes = "(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw",
}: {
  name: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  return (
    <img
      className={className}
      src={`/images/${name}-1280.webp`}
      srcSet={[640, 1280, 1920]
        .map((w) => `/images/${name}-${w}.webp ${w}w`)
        .join(", ")}
      sizes={sizes}
      alt={alt}
      width={
        name.startsWith("summer-") && name !== "summer-founder" ? 1920 : 1280
      }
      height={
        name.startsWith("summer-") && name !== "summer-founder" ? 1080 : 1920
      }
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
    />
  );
}
export function Icon({
  name,
}: {
  name: "search" | "heart" | "account" | "bag";
}) {
  const base = "/images/header-";
  return (
    <span className={`icon icon-${name}`} aria-hidden="true">
      {name === "search" ? (
        <>
          <img src={base + "imgVector.svg"} alt="" />
          <img src={base + "imgVector1.svg"} alt="" />
        </>
      ) : name === "bag" ? (
        <>
          <img src={base + "imgVector4.svg"} alt="" />
          <img src={base + "imgVector5.svg"} alt="" />
        </>
      ) : (
        <img
          src={base + (name === "heart" ? "imgVector2.svg" : "imgVector3.svg")}
          alt=""
        />
      )}
    </span>
  );
}
export function ProductCard({
  product: p,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const store = useStore();
  return (
    <article className="product-card">
      <div className="product-photo">
        <Link to={`/products/${p.id}`} aria-label={`View ${p.name}`}>
          <Photo name={p.image} alt={p.name} priority={priority} />
        </Link>
        <span className="badge">
          {p.stock ? (p.isNew ? "new" : p.material) : "sold out"}
        </span>
        <button
          className={
            "save-button " + (store.wishlist.includes(p.id) ? "saved" : "")
          }
          aria-label={`${store.wishlist.includes(p.id) ? "Remove" : "Save"} ${p.name} ${store.wishlist.includes(p.id) ? "from" : "to"} wishlist`}
          aria-pressed={store.wishlist.includes(p.id)}
          onClick={() => store.toggleWishlist(p.id)}
        >
          <Icon name="heart" />
        </button>
      </div>
      <Link className="product-name" to={`/products/${p.id}`}>
        {p.name}
      </Link>
      <div className="product-meta">
        <span>{money(p.price)}</span>
        <Link
          to={`/products/${p.id}`}
          aria-label={`Choose options for ${p.name}`}
        >
          Choose options <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
export function ProductGrid({
  products,
  priority = false,
}: {
  products: Product[];
  priority?: boolean;
}) {
  return (
    <div className="product-grid">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={priority && i < 4} />
      ))}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="flower" aria-hidden="true">
        ✳
      </span>
      <h1>{title}</h1>
      {children}
      <Link className="button" to="/collections/new-in">
        Explore the collection
      </Link>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog?.showModal();
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = original;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      Getting things ready…
    </div>
  );
}
