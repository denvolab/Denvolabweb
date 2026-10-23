import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { collections } from "../data/catalog";
import { useStore } from "../state/Store";
import { FigmaArrow, Photo, ProductCard } from "../components/UI";
import { useCarousel } from "../hooks/useCarousel";
export default function Home() {
  const { products } = useStore();
  const [tab, setTab] = useState("New In");
  const hero = useCarousel(3, 7000);
  const slide = hero.index;
  const track = useRef<HTMLDivElement>(null);
  const slides = [
    {
      image: "summer-home-hero",
      title: "Women’s Pyjama Sets",
      copy: "Prints, Stripes & More",
      to: "womens",
    },
    {
      image: "summer-family-hero",
      title: "Little everyday joys",
      copy: "For the whole family",
      to: "kids",
    },
    {
      image: "summer-bridal-morning",
      title: "A morning to remember",
      copy: "Soft prints for special moments",
      to: "bridal",
    },
  ];
  const current = slides[slide] ?? slides[0]!;
  const featured = products
    .filter(
      (p) =>
        p.category === "womens" &&
        (tab !== "Cotton Pyjamas & Nightwear" || p.material === "Cotton"),
    )
    .slice(tab === "Best Sellers" ? 2 : 0, tab === "Best Sellers" ? 8 : 6);
  const gingham = products.find((p) => p.id === "women-sage-gingham");
  return (
    <div className="home">
      <section
        className="hero"
        aria-roledescription="carousel"
        aria-label="Featured collections"
        {...hero.regionProps}
      >
        <picture key={current.image}>
          {slide === 0 && (
            <source
              media="(max-width: 600px)"
              srcSet="/images/women-sage-gingham-640.webp 640w, /images/women-sage-gingham-1280.webp 1280w"
              sizes="100vw"
            />
          )}
          <Photo
            name={current.image}
            alt={
              slide === 0
                ? "Two women wearing floral and gingham Sunday Nest pyjamas in a sunlit living room"
                : current.title
            }
            priority
            sizes="100vw"
          />
        </picture>
        <div className="hero-scrim" />
        <div className="hero-content" key={current.title}>
          <h1>{current.title}</h1>
          <p>{current.copy}</p>
          <Link className="button light" to={"/collections/" + current.to}>
            Shop pyjamas
          </Link>
        </div>
        <div className="hero-controls">
          <button
            aria-label="Previous featured collection"
            onClick={hero.previous}
          >
            <FigmaArrow variant="hero" direction="left" />
          </button>
          {slides.map((s, i) => (
            <button
              key={s.image}
              className={"slide-dot " + (i === slide ? "active" : "")}
              aria-label={`Show ${s.title}`}
              aria-pressed={i === slide}
              onClick={() => hero.goTo(i)}
            />
          ))}
          <button aria-label="Next featured collection" onClick={hero.next}>
            <FigmaArrow variant="hero" />
          </button>
        </div>
        <button className="carousel-playback" onClick={hero.togglePlayback}>
          {hero.stopped
            ? "Play featured collections"
            : "Pause featured collections"}
        </button>
      </section>
      <section className="section feature-products">
        <div className="section-heading">
          <div
            className="product-tabs"
            role="tablist"
            aria-label="Featured products"
          >
            {["New In", "Best Sellers", "Cotton Pyjamas & Nightwear"].map(
              (t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => {
                    setTab(t);
                    track.current?.scrollTo({ left: 0 });
                  }}
                >
                  {t}
                </button>
              ),
            )}
          </div>
          <div className="track-controls">
            <button
              aria-label="Previous products"
              onClick={() =>
                track.current?.scrollBy({ left: -450, behavior: "smooth" })
              }
            >
              <FigmaArrow direction="left" />
            </button>
            <button
              aria-label="Next products"
              onClick={() =>
                track.current?.scrollBy({ left: 450, behavior: "smooth" })
              }
            >
              <FigmaArrow />
            </button>
          </div>
        </div>
        <div className="product-track" ref={track} role="tabpanel">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          <Link className="track-end" to="/collections/new-in">
            <h2>New In</h2>
            <span>
              View all <FigmaArrow />
            </span>
          </Link>
        </div>
      </section>
      <section className="section categories">
        <div className="section-heading">
          <h2>Shop our collections</h2>
          <Link to="/collections/womens">
            View all <FigmaArrow />
          </Link>
        </div>
        <div className="category-grid">
          {collections.map((c) => (
            <Link key={c.slug} to={"/collections/" + c.slug}>
              <Photo name={c.image} alt={c.title} />
              <span>
                {c.title}
                <FigmaArrow />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="editorial-pair">
        {[
          ["women-pear-floral", "New In", "new-in"],
          ["women-blue-floral-robe", "Dressing Gowns & Robes", "robes"],
        ].map(([image, title, slug]) => (
          <div className="image-editorial" key={slug}>
            <Photo
              name={image!}
              alt={title!}
              sizes="(max-width: 600px) 100vw, 50vw"
            />
            <div className="photo-scrim" />
            <div className="image-editorial-copy">
              <h2>{title}</h2>
              <Link className="button" to={"/collections/" + slug}>
                Shop now
              </Link>
            </div>
          </div>
        ))}
      </section>
      <section className="section story">
        <p className="eyebrow">Our story</p>
        <h2>
          Sunday Nest has proudly evolved into a women-focused fashion brand,
          specialising in sleepwear and unique prints that celebrate the natural
          world, vibrant colour and feeling good.
        </h2>
        <Link className="underlined" to="/pages/about-us">
          Read more
        </Link>
      </section>
      <section className="section gingham">
        <div className="gingham-main">
          <Photo
            name="women-sage-gingham"
            alt="Sage gingham cotton pyjama set"
            sizes="(max-width: 600px) 100vw, 55vw"
          />
        </div>
        <div className="gingham-side">
          <h2>Shop gingham</h2>
          <Link className="button" to="/search?q=gingham">
            Shop now
          </Link>
          {gingham && (
            <div className="gingham-product">
              <ProductCard product={gingham} />
            </div>
          )}
        </div>
      </section>
      <section className="editorial-pair family">
        {[
          [
            "men-sage-stripe",
            "Mens Nightwear",
            "From matching family moments to classic styles, discover men’s pyjamas and more.",
            "mens",
          ],
          [
            "kids-sage-check",
            "Kids Pyjamas",
            "Prints for playful mornings and cosy evenings. Relaxed pyjamas for little ones and growing adventurers.",
            "kids",
          ],
        ].map(([image, title, copy, slug]) => (
          <div className="image-editorial" key={slug}>
            <Photo
              name={image!}
              alt={title!}
              sizes="(max-width: 600px) 100vw, 50vw"
            />
            <div className="photo-scrim" />
            <div className="image-editorial-copy">
              <h2>{title}</h2>
              <p>{copy}</p>
              <Link className="button" to={"/collections/" + slug}>
                Shop now
              </Link>
            </div>
          </div>
        ))}
      </section>
      <section className="split-story">
        <div>
          <p className="eyebrow">We are</p>
          <h2>Prints Made for Living</h2>
          <p>Thanks for supporting us.</p>
          <Link className="button dark" to="/pages/about-us">
            Read our story
          </Link>
        </div>
        <Photo
          name="summer-studio-team"
          alt="The Sunday Nest studio team working together"
          sizes="(max-width: 600px) 100vw, 50vw"
        />
      </section>
      <section className="section community">
        <h2>Join Our Community</h2>
        <p>
          Meet the people, prints and little everyday moments behind Sunday
          Nest. Read stories from our studio and find a little inspiration for
          your next slow morning.
        </p>
        <Link className="button" to="/journal">
          Behind the seams
        </Link>
      </section>
    </div>
  );
}
