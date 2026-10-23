import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Empty, Modal, Photo, ProductGrid } from "../components/UI";
import { useStore } from "../state/Store";
import { money } from "../domain/cart";
export default function Product() {
  const { slug } = useParams();
  const store = useStore();
  const product = store.products.find((p) => p.id === slug);
  const [size, setSize] = useState(""),
    [qty, setQty] = useState(1),
    [photo, setPhoto] = useState(0),
    [error, setError] = useState(""),
    [guide, setGuide] = useState(false),
    [zoom, setZoom] = useState(false);
  if (!product)
    return (
      <Empty title="This piece could not be found">
        <p>It may have moved. Explore the current collection below.</p>
      </Empty>
    );
  const p = product;
  const activeImage = p.gallery[photo] ?? p.image;
  return (
    <div className="section product-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={"/collections/" + p.category}>{p.category}</Link>
        <span>/</span>
        <span>{p.name}</span>
      </nav>
      <div className="product-detail">
        <div className="product-gallery">
          <button
            className="main-product-photo"
            aria-label="View larger product image"
            onClick={() => setZoom(true)}
          >
            <Photo
              name={activeImage}
              alt={p.name + (photo ? " — another view" : "")}
              priority
              sizes="(max-width: 700px) 100vw, 55vw"
            />
            <span>View full image ↗</span>
          </button>
          {p.gallery.length > 1 && (
            <div className="thumbnails">
              {p.gallery.map((image, i) => (
                <button
                  key={image}
                  aria-label={`Product image ${i + 1}`}
                  aria-pressed={photo === i}
                  onClick={() => setPhoto(i)}
                >
                  <Photo name={image} alt="" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="product-information">
          <p className="eyebrow">Sunday Nest · {p.material}</p>
          <h1>{p.name}</h1>
          <p className="detail-price">{money(p.price)}</p>
          <p className="product-lead">
            Comfort you can come home to. Thoughtful details, easy fits and a
            print to make your day.
          </p>
          <p className="colour-label">
            Colour: <strong>{p.colour}</strong>
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!size) {
                setError(
                  "Please choose a size before adding this piece to your bag.",
                );
                return;
              }
              store.add(p, size, qty);
              setError("");
            }}
          >
            <div className="size-heading">
              <span id="size-label">Choose your size</span>
              <button
                type="button"
                className="text-button"
                onClick={() => setGuide(true)}
              >
                Size guide
              </button>
            </div>
            <div
              className="size-options"
              role="group"
              aria-labelledby="size-label"
            >
              {p.sizes.map((s) => (
                <button
                  type="button"
                  key={s}
                  className={size === s ? "selected" : ""}
                  aria-pressed={size === s}
                  onClick={() => {
                    setSize(s);
                    setError("");
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="buy-row">
              <label>
                Quantity
                <select
                  aria-label="Quantity"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                >
                  {Array.from({ length: Math.min(8, p.stock) || 1 }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="button add-to-bag"
                type="submit"
                disabled={!p.stock}
              >
                {p.stock ? "Add to bag" : "Sold out"}
              </button>
            </div>
            <p className="form-error" role="alert">
              {error}
            </p>
          </form>
          <button
            className="wishlist-detail text-button"
            aria-pressed={store.wishlist.includes(p.id)}
            onClick={() => store.toggleWishlist(p.id)}
          >
            {store.wishlist.includes(p.id)
              ? "♥ Saved to your wishlist"
              : "♡ Save for later"}
          </button>
          <p className="shipping-note">
            Free UK delivery on orders over £60 ·{" "}
            <Link to="/pages/delivery-returns">Delivery details</Link>
          </p>
          <details open>
            <summary>The little details</summary>
            <p>{p.description}</p>
          </details>
          <details>
            <summary>Fabric & care</summary>
            <p>
              {p.material}. Follow the care label supplied with your garment.
              Wash similar colours together and air dry when possible.
            </p>
          </details>
          <details>
            <summary>Delivery & returns</summary>
            <p>
              UK delivery starts at £3.95. See our{" "}
              <Link to="/pages/delivery-returns">
                delivery and returns page
              </Link>{" "}
              for the preview delivery settings.
            </p>
          </details>
        </div>
      </div>
      <section className="related">
        <div className="section-heading">
          <h2>A few more favourites</h2>
          <Link to={"/collections/" + p.category}>Explore more →</Link>
        </div>
        <ProductGrid
          products={store.products
            .filter(
              (other) => other.category === p.category && other.id !== p.id,
            )
            .slice(0, 4)}
        />
      </section>
      {guide && (
        <Modal title="Finding your fit" onClose={() => setGuide(false)}>
          <p>
            Choose your usual size for a relaxed fit. This preview uses sample
            sizing; final measurements must be supplied with the live catalogue.
          </p>
          <table>
            <caption>Adult sizing reference</caption>
            <thead>
              <tr>
                <th>Size</th>
                <th>UK dress size</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["XS", "6–8"],
                ["S", "8–10"],
                ["M", "12–14"],
                ["L", "16–18"],
                ["XL", "20–22"],
                ["XXL", "24–26"],
              ].map(([s, uk]) => (
                <tr key={s}>
                  <td>{s}</td>
                  <td>{uk}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/pages/size-guides">Full size guide →</Link>
        </Modal>
      )}
      {zoom && (
        <Modal title={p.name} onClose={() => setZoom(false)}>
          <img
            className="zoom-image"
            src={"/images/" + activeImage + "-4k.jpeg"}
            alt={p.name}
            width="2560"
            height="3840"
          />
        </Modal>
      )}
    </div>
  );
}
