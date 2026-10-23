import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ProductGrid, Empty } from "../components/UI";
import { useStore } from "../state/Store";
const names: Record<string, string> = {
  "new-in": "New In",
  womens: "Women’s Pyjamas & Nightwear",
  mens: "Men’s Pyjamas & Nightwear",
  kids: "Kids’ Pyjamas",
  accessories: "The Little Extras",
  gifting: "Thoughtful Gifts",
  "summer-garden": "The Summer Garden Edit",
  "evening-edit": "The Evening Edit",
  robes: "Dressing Gowns & Robes",
  satin: "Satin Pyjamas & Nightwear",
  stripes: "Stripes for Slow Mornings",
  nightdresses: "Nightdresses & Shirts",
  bridal: "The Bridal Morning Edit",
};
export default function Catalog() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const { products } = useStore();
  const [showFilters, setShowFilters] = useState(false);
  const [available, setAvailable] = useState(params.has("available"));
  useEffect(() => {
    setAvailable(params.has("available"));
  }, [params]);
  const query = (params.get("q") ?? "").slice(0, 100).trim(),
    material = params.get("material") ?? "",
    size = params.get("size") ?? "",
    sort = params.get("sort") ?? "featured";
  const category = slug ?? "search";
  const [limit, setLimit] = useState(12);
  function update(key: string, value: string) {
    setLimit(12);
    setParams((old) => {
      const next = new URLSearchParams(old);
      value ? next.set(key, value) : next.delete(key);
      return next;
    });
  }
  let matches = products.filter((p) => {
    const scope =
      category === "new-in"
        ? p.isNew
        : ["womens", "mens", "kids", "accessories", "gifting"].includes(
              category,
            )
          ? p.category === category
          : category === "robes"
            ? p.name.toLowerCase().includes("robe") || p.name.includes("Gown")
            : category === "satin" || category === "evening-edit"
              ? p.material === "Satin"
              : category === "stripes"
                ? p.name.toLowerCase().includes("stripe")
                : category === "nightdresses"
                  ? p.name.includes("Nightdress")
                  : category === "summer-garden" || category === "bridal"
                    ? p.category === "womens"
                    : true;
    return (
      scope &&
      (!query ||
        `${p.name} ${p.material} ${p.category} ${p.colour}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!material || p.material === material) &&
      (!size || p.sizes.includes(size)) &&
      (!available || p.stock > 0)
    );
  });
  if (sort === "price-asc")
    matches = [...matches].sort((a, b) => a.price - b.price);
  if (sort === "price-desc")
    matches = [...matches].sort((a, b) => b.price - a.price);
  if (sort === "name")
    matches = [...matches].sort((a, b) => a.name.localeCompare(b.name));
  const title = slug
    ? names[slug]
    : query
      ? `Search results for “${query}”`
      : "Find your next favourite";
  if (slug && !names[slug])
    return (
      <Empty title="That collection could not be found">
        <p>Let’s find something lovely instead.</p>
      </Empty>
    );
  return (
    <div className="catalog section">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>{slug ? names[slug] : "Search"}</span>
      </nav>
      <header className="page-intro">
        <p className="eyebrow">Prints, comfort & little everyday joys</p>
        <h1>{title}</h1>
        <p>
          Nightwear for slower mornings, lovely evenings and everything in
          between.
        </p>
      </header>
      {!slug && (
        <form
          className="catalog-search"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            update("q", String(data.get("q") ?? "").slice(0, 100));
          }}
        >
          <label className="sr-only" htmlFor="catalog-query">
            Search products
          </label>
          <input
            id="catalog-query"
            name="q"
            type="search"
            maxLength={100}
            defaultValue={query}
            placeholder="Search by print, colour or style"
          />
          <button className="button" type="submit">
            Search
          </button>
        </form>
      )}
      <div className="catalog-toolbar">
        <button
          className="filter-toggle text-button"
          aria-expanded={showFilters}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters {material || size || params.has("available") ? "●" : "+"}
        </button>
        <span aria-live="polite">
          {matches.length} {matches.length === 1 ? "piece" : "pieces"}
        </span>
        <label>
          Sort by{" "}
          <select value={sort} onChange={(e) => update("sort", e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </label>
      </div>
      <div className={"filters " + (showFilters ? "expanded" : "")}>
        <label>
          Fabric
          <select
            value={material}
            aria-label="Fabric"
            onChange={(e) => update("material", e.target.value)}
          >
            <option value="">All fabrics</option>
            {["Cotton", "Satin", "Jersey", "Linen blend"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          Size
          <select
            aria-label="Size"
            value={size}
            onChange={(e) => update("size", e.target.value)}
          >
            <option value="">All sizes</option>
            {[
              "XS",
              "S",
              "M",
              "L",
              "XL",
              "XXL",
              "3–4",
              "5–6",
              "7–8",
              "9–10",
              "11–12",
              "One size",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => {
              const checked = e.currentTarget.checked;
              setAvailable(checked);
              update("available", checked ? "1" : "");
            }}
          />
          In stock only
        </label>
        <button
          className="text-button"
          onClick={() => setParams(query ? { q: query } : {})}
        >
          Clear filters
        </button>
      </div>
      {matches.length ? (
        <>
          <ProductGrid products={matches.slice(0, limit)} priority />
          <p className="result-count">
            Showing {Math.min(limit, matches.length)} of {matches.length} pieces
          </p>
          {limit < matches.length && (
            <div className="center">
              <button
                className="button secondary"
                onClick={() => setLimit(limit + 12)}
              >
                Load more
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty">
          <h2>No pieces found</h2>
          <p>Try another print, colour or size.</p>
          <button
            className="button"
            onClick={() => {
              setParams({});
              setShowFilters(false);
            }}
          >
            Reset search & filters
          </button>
        </div>
      )}
    </div>
  );
}
export function Wishlist() {
  const { products, wishlist } = useStore();
  const items = products.filter((p) => wishlist.includes(p.id));
  return items.length ? (
    <div className="section">
      <header className="page-intro">
        <p className="eyebrow">Keep your favourites close</p>
        <h1>Your wishlist</h1>
        <p>Saved on this browser, ready when you are.</p>
      </header>
      <ProductGrid products={items} />
    </div>
  ) : (
    <Empty title="A little space for your favourites">
      <p>Tap the heart on a piece you love. We’ll keep it here for you.</p>
    </Empty>
  );
}
