import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Icon, Modal, Photo } from "./UI";
import { useStore } from "../state/Store";
import { emailSchema } from "../domain/types";
import { isDemo, message, storeApi } from "../services/store-api";
const navigation = [
  ["Summer Garden Edit", "summer-garden"],
  ["Evening Edit", "evening-edit"],
  ["New In", "new-in"],
  ["Womens", "womens"],
  ["Mens", "mens"],
  ["Kids", "kids"],
  ["Accessories", "accessories"],
  ["Gifting", "gifting"],
];
export function Layout() {
  const store = useStore();
  const [announcement, setAnnouncement] = useState(0),
    [menu, setMenu] = useState(false),
    [search, setSearch] = useState(false),
    [q, setQ] = useState("");
  const navigate = useNavigate(),
    location = useLocation();
  const announcements = [
    "£3.95 Standard delivery or Free delivery on all UK orders over £60",
    "Prints for playful mornings and cosy evenings.",
    "Slow mornings. Lovely nights. Welcome to Sunday Nest.",
  ];
  useEffect(() => {
    setMenu(false);
    setSearch(false);
    document.title =
      location.pathname === "/"
        ? "Sunday Nest — Slow mornings, lovely nights"
        : `${location.pathname.split("/").at(-1)?.replaceAll("-", " ") ?? "Shop"} · Sunday Nest`;
  }, [location.pathname, location.search]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="announcement" aria-label="Store announcements">
        <button
          aria-label="Previous announcement"
          onClick={() => setAnnouncement((announcement + 2) % 3)}
        >
          ‹
        </button>
        <p aria-live="polite">{announcements[announcement]}</p>
        <button
          aria-label="Next announcement"
          onClick={() => setAnnouncement((announcement + 1) % 3)}
        >
          ›
        </button>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="icon-button menu-toggle"
            aria-label="Open menu"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            ☰
          </button>
          <Link to="/" aria-label="Sunday Nest home" className="brand">
            <span className="logo" />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map(([label, slug]) =>
              label && slug ? (
                <NavigationItem key={slug} label={label} slug={slug} />
              ) : null,
            )}
          </nav>
          <div className="header-actions">
            <button
              className="icon-button"
              aria-label="Search products"
              onClick={() => setSearch(true)}
            >
              <Icon name="search" />
            </button>
            <Link
              className="icon-button wishlist-link"
              to="/wishlist"
              aria-label={`Wishlist, ${store.wishlist.length} saved items`}
            >
              <Icon name="heart" />
            </Link>
            <Link
              className="icon-button account-link"
              to="/account"
              aria-label="Your account"
            >
              <Icon name="account" />
            </Link>
            <Link
              className="icon-button bag-link"
              to="/cart"
              aria-label={`Shopping bag, ${store.cartCount} items`}
            >
              <Icon name="bag" />
              <span className="bag-count">{store.cartCount}</span>
            </Link>
          </div>
        </div>
      </header>
      {menu && (
        <Modal title="Explore Sunday Nest" onClose={() => setMenu(false)}>
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {navigation.map(([label, slug]) => (
              <Link key={slug} to={`/collections/${slug}`}>
                {label}
                <span>→</span>
              </Link>
            ))}
            <Link to="/wishlist">Your wishlist</Link>
            <Link to="/account">Your account</Link>
          </nav>
        </Modal>
      )}
      {search && (
        <Modal
          title="Find your next favourite"
          onClose={() => setSearch(false)}
        >
          <form
            className="search-form"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(
                "/search?q=" + encodeURIComponent(q.trim().slice(0, 100)),
              );
              setSearch(false);
            }}
          >
            <label htmlFor="search-input">
              Search pyjamas, robes, prints and more
            </label>
            <div className="input-row">
              <input
                id="search-input"
                type="search"
                maxLength={100}
                value={q}
                autoFocus
                onChange={(e) => setQ(e.target.value)}
                placeholder="Try ‘sage’ or ‘cotton’"
              />
              <button className="button" type="submit">
                Search
              </button>
            </div>
          </form>
          <p className="eyebrow">Popular right now</p>
          <div className="chips">
            {["Cotton", "Sage", "Robes", "Kids"].map((term) => (
              <Link key={term} to={"/search?q=" + term}>
                {term}
              </Link>
            ))}
          </div>
        </Modal>
      )}
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      {isDemo && (
        <div className="preview-note">
          Local storefront preview · Sample catalogue · Payments are not enabled
        </div>
      )}
      <div
        className={"toast " + (store.notice ? "show" : "")}
        role="status"
        aria-live="polite"
      >
        {store.notice}
      </div>
      <CookiePreferences />
    </>
  );
}
function Footer() {
  const [email, setEmail] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <>
      <div className="benefits">
        {[
          ["Free delivery", "On UK orders over £60"],
          ["Thoughtful details", "Comfort in every stitch"],
          ["Wear it your way", "Prints for everyday living"],
          ["Here to help", "Find answers in our help centre"],
        ].map(([title, copy], i) => (
          <div key={title}>
            <img
              src={"/images/benefits-imgIcon" + (i || "") + ".svg"}
              alt=""
              loading="lazy"
            />
            <h3>{title}</h3>
            <p>{copy}</p>
          </div>
        ))}
      </div>
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <h2>About us</h2>
            {[
              ["About Us", "/pages/about-us"],
              ["Size guides", "/pages/size-guides"],
              ["Behind The Seams", "/journal"],
              ["Contact us", "/pages/contact-us"],
              ["Wholesale enquiries", "/pages/wholesale-enquiries"],
            ].map(([label, to]) => (
              <Link key={to} to={to ?? "/"}>
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h2>Here to help</h2>
            {[
              ["Delivery & returns", "delivery-returns"],
              ["Frequently asked questions", "faq"],
              ["Terms & conditions", "terms-conditions"],
              ["Privacy policy", "privacy"],
              ["Accessibility", "accessibility"],
            ].map(([label, to]) => (
              <Link key={to} to={"/pages/" + to}>
                {label}
              </Link>
            ))}
          </div>
          <div className="newsletter">
            <h2>Join our community</h2>
            <p>
              Sign up for little everyday joys, new prints and stories from
              behind the seams.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (busy) return;
                const parsed = emailSchema.safeParse(email);
                if (!parsed.success) {
                  setStatus("Please enter a valid email address.");
                  return;
                }
                setBusy(true);
                try {
                  const result = await storeApi.newsletter(parsed.data);
                  setStatus(result.message);
                  setEmail("");
                } catch (error) {
                  setStatus(message(error));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Your email
              </label>
              <div className="newsletter-input">
                <input
                  id="newsletter-email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                />
                <button disabled={busy} type="submit">
                  {busy ? "Please wait…" : "Subscribe"}
                </button>
              </div>
              <small>
                By subscribing, you agree to receive emails. Unsubscribe at any
                time. <Link to="/pages/privacy">Privacy notice</Link>
              </small>
              <p className="form-status" role="status">
                {status}
              </p>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <Link className="footer-brand" to="/">
            Sunday Nest
          </Link>
          <span>United Kingdom · GBP £</span>
          <p>
            © {new Date().getFullYear()} Sunday Nest. Slow mornings, lovely
            nights.
          </p>
          <button
            className="text-button"
            onClick={() => window.dispatchEvent(new Event("sn:preferences"))}
          >
            Privacy preferences
          </button>
          <a href="#main">Back to top ↑</a>
        </div>
      </footer>
    </>
  );
}
function CookiePreferences() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("sn:preferences", show);
    return () => window.removeEventListener("sn:preferences", show);
  }, []);
  return open ? (
    <Modal title="Your privacy preferences" onClose={() => setOpen(false)}>
      <p>
        This storefront does not use advertising or analytics cookies. Your bag
        and wishlist are saved on this browser so you can come back to them.
      </p>
      <button
        className="button"
        onClick={() => {
          try {
            localStorage.removeItem("sn:cart:v1");
            localStorage.removeItem("sn:wishlist:v1");
          } catch {
            /* Storage may be unavailable. */
          }
          window.location.reload();
        }}
      >
        Clear saved bag and wishlist
      </button>
      <button className="button secondary" onClick={() => setOpen(false)}>
        Keep browsing
      </button>
    </Modal>
  ) : null;
}

const subNavigation: Record<string, { label: string; to: string }[]> = {
  "new-in": [
    { label: "All new arrivals", to: "/collections/new-in" },
    { label: "The Summer Garden Edit", to: "/collections/summer-garden" },
    { label: "Behind the prints", to: "/journal/behind-the-prints" },
  ],
  womens: [
    { label: "All women’s nightwear", to: "/collections/womens" },
    { label: "Cotton pyjamas", to: "/collections/womens?material=Cotton" },
    { label: "Satin pyjamas", to: "/collections/satin" },
    { label: "Nightdresses & shirts", to: "/collections/nightdresses" },
    { label: "Dressing gowns & robes", to: "/collections/robes" },
    { label: "Stripes", to: "/collections/stripes" },
  ],
  mens: [
    { label: "All men’s nightwear", to: "/collections/mens" },
    { label: "Cotton pyjamas", to: "/collections/mens?material=Cotton" },
    { label: "Lounge sets", to: "/collections/mens?material=Jersey" },
  ],
  kids: [
    { label: "All kids’ nightwear", to: "/collections/kids" },
    { label: "Little ones", to: "/collections/kids?size=3%E2%80%934" },
    { label: "Growing adventurers", to: "/collections/kids?size=9%E2%80%9310" },
  ],
};
function NavigationItem({ label, slug }: { label: string; slug: string }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname, location.search]);
  const links = subNavigation[slug];
  return (
    <div
      className="nav-item"
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          e.currentTarget.querySelector("button")?.focus();
        }
      }}
    >
      <NavLink to={"/collections/" + slug}>{label}</NavLink>
      {links && (
        <>
          <button
            className="nav-expand"
            aria-label={"Browse " + label}
            aria-expanded={open}
            aria-controls={"menu-" + slug}
            onClick={() => setOpen(!open)}
          >
            ⌄
          </button>
          {open && (
            <div className="mega-menu" id={"menu-" + slug}>
              <div>
                <p className="eyebrow">Make yourself at home</p>
                <h2>{label}</h2>
                <Link className="underlined" to={"/collections/" + slug}>
                  Explore the collection →
                </Link>
              </div>
              <div className="mega-links">
                {links.map((link) => (
                  <Link key={link.to} to={link.to}>
                    {link.label}
                  </Link>
                ))}
              </div>
              <Link className="mega-photo" to={"/collections/" + slug}>
                <Photo
                  name={
                    slug === "mens"
                      ? "men-sage-stripe"
                      : slug === "kids"
                        ? "kids-sage-check"
                        : "women-pear-floral"
                  }
                  alt={label + " nightwear"}
                  sizes="180px"
                />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
