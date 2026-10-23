import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Empty, Photo } from "../components/UI";
import { articles } from "../data/catalog";
import { contactSchema, emailSchema } from "../domain/types";
import { isDemo, message, storeApi } from "../services/store-api";
export function Journal() {
  const { slug } = useParams();
  const article = articles.find((a) => a.slug === slug);
  if (slug && !article) return <Empty title="That story has moved" />;
  return article ? (
    <article className="section article">
      <Link className="underlined" to="/journal">
        ← Behind the seams
      </Link>
      <p className="eyebrow">The Sunday Nest Journal</p>
      <h1>{article.title}</h1>
      <Photo
        name={article.image}
        alt={article.title}
        priority
        sizes="(max-width: 900px) 100vw, 850px"
      />
      <p className="article-intro">{article.intro}</p>
      {article.body.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </article>
  ) : (
    <div className="section">
      <header className="page-intro">
        <p className="eyebrow">From our studio to your home</p>
        <h1>Behind the seams</h1>
        <p>People, prints and a few things worth slowing down for.</p>
      </header>
      <div className="journal-grid">
        {articles.map((a) => (
          <Link to={"/journal/" + a.slug} key={a.slug}>
            <Photo name={a.image} alt={a.title} />
            <h2>{a.title}</h2>
            <p>{a.intro}</p>
            <span className="underlined">Read the story →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
export function Account() {
  const [email, setEmail] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="account-page section">
      <p className="eyebrow">A little space of your own</p>
      <h1>Welcome to Sunday Nest</h1>
      <p>Sign in with a link sent to your email.</p>
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
            const result = await storeApi.login(parsed.data);
            setStatus(result.message);
          } catch (error) {
            setStatus(
              isDemo
                ? "Sign-in is not available in this preview. No email has been sent."
                : message(error),
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label htmlFor="account-email">Email address</label>
        <input
          id="account-email"
          type="email"
          autoComplete="email"
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="button" disabled={busy} type="submit">
          {busy ? "Please wait…" : "Send sign-in link"}
        </button>
        <p className="form-status" role="status">
          {status}
        </p>
      </form>
      <p>
        <Link to="/wishlist">Your wishlist</Link> ·{" "}
        <Link to="/cart">Your bag</Link>
      </p>
    </div>
  );
}
const information: Record<
  string,
  { title: string; intro: string; paragraphs: string[] }
> = {
  "about-us": {
    title: "Prints Made for Living",
    intro:
      "A love of print. A little everyday comfort. A slower kind of Sunday.",
    paragraphs: [
      "Sunday Nest is a print-led nightwear brand for people who like their everyday essentials to feel a little more personal.",
      "Our collection brings together expressive patterns, relaxed shapes and the kind of comfort you can make yourself at home in.",
      "From the first sketch to the finishing touches, our inspiration is found in everyday comfort. Explore the textures, shapes and small details behind Sunday Nest.",
    ],
  },
  "delivery-returns": {
    title: "Delivery & returns",
    intro: "The little details before your parcel arrives.",
    paragraphs: [
      "The preview is configured for standard UK delivery at £3.95, with free delivery on orders over £60 after discounts. The live backend must confirm the final delivery charge and availability.",
      "No real orders are accepted through this local preview. Dispatch estimates, return windows, return costs and the return address must be confirmed by the store before launch.",
      "Need help choosing a piece? Visit our size guide or contact page.",
    ],
  },
  privacy: {
    title: "Your privacy",
    intro: "A little clarity about what happens in this preview.",
    paragraphs: [
      "Your shopping bag and wishlist are saved in this browser’s local storage. They contain only product references, chosen sizes and quantities.",
      "This preview does not run analytics or advertising trackers. Checkout and contact details are not stored locally. In demo mode, forms do not send details to a server.",
      "The live store needs a completed privacy notice covering the business, service providers, retention, marketing consent and customer rights before collecting personal information.",
    ],
  },
  "terms-conditions": {
    title: "Terms & conditions",
    intro:
      "Preview information — final trading terms are required before launch.",
    paragraphs: [
      "The catalogue, prices, delivery settings and stock in this preview are sample data. No purchase contract can be formed and no payment is taken here.",
      "Before launch, the store owner must supply the business identity, contact details, payment terms, delivery terms, cancellation and returns information, and applicable consumer rights.",
    ],
  },
  accessibility: {
    title: "A more comfortable visit",
    intro: "A store that is easier to browse.",
    paragraphs: [
      "Browse using a keyboard, use the skip link to reach the main content, and close dialogs with Escape. Images include text descriptions and product options have clear labels.",
      "We support reduced-motion preferences and layouts that work across desktop, tablet and mobile. Contact us if something gets in your way.",
    ],
  },
  "wholesale-enquiries": {
    title: "Let’s make something lovely",
    intro: "Interested in bringing Sunday Nest to your shop?",
    paragraphs: [
      "Tell us a little about your business, where you are based and the collection you are interested in. Use the contact form and choose Wholesale as the subject.",
    ],
  },
  "size-guides": {
    title: "Finding your fit",
    intro: "A little help choosing your next favourite.",
    paragraphs: [
      "Our preview adult size options run from XS to XXL. Children’s options use age ranges. Accessories are available in one size.",
      "Use your usual size as a starting point for a relaxed fit. The live catalogue must include verified garment measurements and fit guidance before launch.",
    ],
  },
};
export default function Content() {
  const { slug = "about-us" } = useParams();
  if (slug === "contact-us") return <Contact />;
  if (slug === "faq") return <FAQ />;
  const data = information[slug];
  if (!data) return <Empty title="This page could not be found" />;
  return (
    <article className="section information-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>{data.title}</span>
      </nav>
      {slug === "about-us" && (
        <Photo
          className="information-hero"
          name="summer-studio-team"
          alt="The Sunday Nest studio team"
          priority
          sizes="100vw"
        />
      )}
      <p className="eyebrow">Sunday Nest</p>
      <h1>{data.title}</h1>
      <p className="article-intro">{data.intro}</p>
      {data.paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
      {slug === "size-guides" && (
        <table>
          <caption>Sample adult size reference</caption>
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
      )}
      {slug === "about-us" && (
        <div className="factory-story">
          <div>
            <h2>Our Trusted Factory</h2>
            <p>
              From the first sketch to the finishing touches, our inspiration is
              found in everyday comfort.
            </p>
          </div>
          <Photo
            name="summer-making-studio"
            alt="Making garments in a sunlit studio"
            sizes="(max-width: 700px) 100vw, 50vw"
          />
        </div>
      )}
      <Link className="underlined" to="/pages/contact-us">
        We’re here to help →
      </Link>
    </article>
  );
}
function Contact() {
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="section contact-page">
      <header className="page-intro">
        <p className="eyebrow">A little hello</p>
        <h1>We’d love to hear from you</h1>
        <p>Questions about sizing, an order or a print you love?</p>
      </header>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          const form = e.currentTarget;
          const fields = new FormData(form);
          const parsed = contactSchema.safeParse(Object.fromEntries(fields));
          if (!parsed.success) {
            setStatus(
              "Please complete every field. Your message needs at least 10 characters.",
            );
            return;
          }
          setBusy(true);
          try {
            const result = await storeApi.contact(parsed.data);
            setStatus(result.message);
            form.reset();
          } catch (error) {
            setStatus(
              isDemo
                ? "Your message is ready, but sending is not available in this preview. Nothing has been sent."
                : message(error),
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="form-grid">
          <label>
            Your name
            <input
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={120}
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
          <label className="wide">
            Subject
            <select name="subject">
              <option>Product question</option>
              <option>Order help</option>
              <option>Wholesale</option>
              <option>Something else</option>
            </select>
          </label>
          <label className="wide">
            Your message
            <textarea
              name="message"
              required
              minLength={10}
              maxLength={3000}
              rows={6}
            />
          </label>
        </div>
        <p className="form-status" role="status">
          {status}
        </p>
        <button className="button" disabled={busy} type="submit">
          {busy ? "Please wait…" : "Send message"}
        </button>
        <p className="muted">
          Please don’t include payment details or sensitive personal
          information.
        </p>
      </form>
    </div>
  );
}
function FAQ() {
  const questions = [
    [
      "How do I choose my size?",
      "Start with your usual size for a relaxed fit. The size guide on each product page shows the available options.",
    ],
    [
      "Where are my favourites saved?",
      "Your bag and wishlist are saved in this browser. Clearing browser storage or moving to a different device will not carry them over.",
    ],
    [
      "Can I place an order in this preview?",
      "You can browse, choose a size, build a bag and review checkout details. Payments and real orders are not enabled in the local preview.",
    ],
    [
      "How much is delivery?",
      "The preview uses standard UK delivery of £3.95, free when the discounted subtotal reaches £60. Delivery is confirmed by the live checkout.",
    ],
    [
      "How do I care for my nightwear?",
      "Always follow the label on your garment. Wash similar colours together and avoid harsh detergents.",
    ],
  ];
  return (
    <div className="section information-page">
      <header className="page-intro">
        <p className="eyebrow">A little help</p>
        <h1>Your questions, answered</h1>
      </header>
      {questions.map(([q, a]) => (
        <details key={q}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
      <p>
        Still wondering? <Link to="/pages/contact-us">Get in touch.</Link>
      </p>
    </div>
  );
}
