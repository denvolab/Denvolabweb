import { Component, Suspense, lazy } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { StoreProvider, useStore } from "./state/Store";
import { Layout } from "./components/Layout";
import { Empty, Loading } from "./components/UI";
const Home = lazy(() => import("./pages/Home"));
const Catalog = lazy(() => import("./pages/Catalog"));
const Product = lazy(() => import("./pages/Product"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Content = lazy(() => import("./pages/Content"));
const Wishlist = lazy(() =>
  import("./pages/Catalog").then((m) => ({ default: m.Wishlist })),
);
const Journal = lazy(() =>
  import("./pages/Content").then((m) => ({ default: m.Journal })),
);
const Account = lazy(() =>
  import("./pages/Content").then((m) => ({ default: m.Account })),
);
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* Report to a first-party error service after backend integration. Never log customer input. */
  }
  render() {
    return this.state.failed ? (
      <div className="empty">
        <h1>Let’s try that again</h1>
        <p>
          Something interrupted your visit. Your saved bag is still on this
          browser.
        </p>
        <button className="button" onClick={() => window.location.reload()}>
          Reload the page
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function AppRoutes() {
  const store = useStore(),
    location = useLocation();
  if (store.loading) return <Loading />;
  if (store.error)
    return (
      <div className="empty" role="alert">
        <h1>We couldn’t load the collection</h1>
        <p>{store.error}</p>
        <button className="button" onClick={store.retry}>
          Try again
        </button>
      </div>
    );
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="collections/:slug"
            element={<Catalog key={location.pathname} />}
          />
          <Route path="search" element={<Catalog key={location.pathname} />} />
          <Route
            path="products/:slug"
            element={<Product key={location.pathname} />}
          />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="account" element={<Account />} />
          <Route path="journal" element={<Journal />} />
          <Route path="journal/:slug" element={<Journal />} />
          <Route path="pages/:slug" element={<Content />} />
          <Route
            path="*"
            element={
              <Empty title="A little lost? Let’s get you home">
                <p>This page could not be found.</p>
              </Empty>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <StoreProvider>
          <AppRoutes />
        </StoreProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
