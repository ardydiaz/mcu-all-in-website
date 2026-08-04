import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  GraduationCap,
  HeartPulse,
  Landmark,
  LibraryBig,
  Mail,
  Menu,
  Microscope,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const iconsByCategory = {
  University: Landmark,
  Students: GraduationCap,
  Academics: LibraryBig,
  Healthcare: HeartPulse,
  Corporate: BriefcaseBusiness,
  Community: Users,
};

const tonesByColor = {
  lime: "green",
  yellow: "gold",
  cyan: "cyan",
  red: "red",
  violet: "purple",
  orange: "orange",
  pink: "pink",
};

function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginModal, setLoginModal] = useState(null);
  const [sites, setSites] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [catalogError, setCatalogError] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        setCurrentUser(result?.user || null);
        const pendingService = sessionStorage.getItem("mcu_pending_service");
        if (result?.user && pendingService && pendingService !== "#") {
          sessionStorage.removeItem("mcu_pending_service");
          window.location.assign(pendingService);
        }
      })
      .catch(() => {});
  }, []);

  const loadDirectory = useCallback(() => {
    setCatalogError("");
    Promise.all([fetch("/api/public/systems"), fetch("/api/public/categories")])
      .then(async ([systemsResponse, categoriesResponse]) => {
        if (!systemsResponse.ok || !categoriesResponse.ok) throw new Error("Unable to load MCU services.");
        const [systems, apiCategories] = await Promise.all([systemsResponse.json(), categoriesResponse.json()]);
        setSites(systems.map((system) => ({
          ...system,
          title: system.title || system.name,
          href: system.url,
          tone: tonesByColor[system.color] || "purple",
          icon: iconsByCategory[system.category] || BookOpen,
        }))); 
        const nextCategories = ["All", ...apiCategories.map((item) => item.name)];
        setCategories(nextCategories);
        setCategory((current) => nextCategories.includes(current) ? current : "All");
      })
      .catch((error) => setCatalogError(error.message))
      .finally(() => setCatalogLoading(false));
  }, []);

  useEffect(() => {
    loadDirectory();
    const events = new EventSource("/api/public/events");
    events.addEventListener("directory-updated", loadDirectory);
    const refreshWhenVisible = () => { if (document.visibilityState === "visible") loadDirectory(); };
    const refreshInterval = window.setInterval(loadDirectory, 12000);
    window.addEventListener("focus", loadDirectory);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      events.close();
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", loadDirectory);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadDirectory]);

  const filteredSites = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return sites.filter((site) => {
      const categoryMatches = category === "All" || site.category === category;
      const queryMatches =
        !normalizedQuery ||
        `${site.title} ${site.description} ${site.category}`
          .toLowerCase()
          .includes(normalizedQuery);
      return categoryMatches && queryMatches;
    });
  }, [sites, category, query]);

  const scrollToDirectory = () => {
    document.getElementById("directory")?.scrollIntoView({ behavior: "smooth" });
  };

  const openService = (event, site) => {
    event.preventDefault();
    if (currentUser) {
      if (site.href !== "#") window.location.assign(site.href);
      return;
    }
    setLoginModal(site);
  };

  const continueWithMicrosoft = () => {
    if (!loginModal) return;
    sessionStorage.setItem("mcu_pending_service", loginModal.href);
    window.location.href = "/api/auth/microsoft?returnTo=/";
  };

  return (
    <div className="app">
      <header className="site-header">
        <a className="brand" href="#" aria-label="MCU All-in-One home">
          <span className="brand-mark" aria-hidden="true">
            <Building2 size={22} strokeWidth={2.3} />
          </span>
          <span className="brand-copy">
            <strong>MCU</strong>
            <span>ALL-IN-ONE</span>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a className="active" href="#">Home</a>
          <a href="#directory">Directory</a>
          <a href="#about">About MCU</a>
          <a href="#support">Support</a>
        </nav>

        <a className="contact-button" href="/login">
          <ShieldCheck size={17} />
          Sign in
        </a>

        <button
          className="menu-button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <a href="#" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#directory" onClick={() => setMenuOpen(false)}>Directory</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About MCU</a>
            <a href="#support" onClick={() => setMenuOpen(false)}>Support</a>
          </nav>
        )}
      </header>

      <main>
        <section className="hero">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="hero-grid" />
          <div className="hero-content">
            <div className="eyebrow">
              <Sparkles size={15} />
              One MCU. Every service.
            </div>
            <h1>
              Everything MCU,
              <span> all in one place.</span>
            </h1>
            <p className="hero-copy">
              Your central gateway to MCU websites, platforms, and services—
              designed to get you where you need to go, faster.
            </p>

            <div className="hero-actions">
              <button className="primary-action" onClick={scrollToDirectory}>
                Explore all services
                <ArrowRight size={18} />
              </button>
              <a className="secondary-action" href="#about">
                Learn about MCU
              </a>
            </div>

            <div className="trust-row">
              <span><ShieldCheck size={17} /> Official MCU links</span>
              <span><span className="status-dot" /> Services available</span>
            </div>
          </div>

          <div className="hero-panel" aria-label="Quick access">
            <div className="panel-heading">
              <div>
                <span>QUICK ACCESS</span>
                <h2>Where would you like to go?</h2>
              </div>
              <div className="mini-logo">MCU</div>
            </div>
            <div className="quick-links">
              {[
                [GraduationCap, "Student Portal", "View your student account"],
                [CalendarDays, "Admissions", "Apply and enroll at MCU"],
                [HeartPulse, "MCU Hospital", "Healthcare and patient services"],
              ].map(([Icon, title, copy]) => (
                <a href="#" className="quick-link" key={title}>
                  <span className="quick-icon"><Icon size={21} /></span>
                  <span>
                    <strong>{title}</strong>
                    <small>{copy}</small>
                  </span>
                  <ChevronRight size={19} />
                </a>
              ))}
            </div>
            <button className="view-all" onClick={scrollToDirectory}>
              View full directory
              <ArrowRight size={17} />
            </button>
          </div>
        </section>

        <section className="directory-section" id="directory">
          <div className="directory-orb directory-orb-one" aria-hidden="true" />
          <div className="directory-orb directory-orb-two" aria-hidden="true" />
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                <span className="live-pulse" />
                MCU DIGITAL ECOSYSTEM
              </span>
              <h2>Find what you need</h2>
              <p>Browse official MCU platforms and digital services.</p>
            </div>
            <label className="search-box">
              <Search size={20} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search MCU services..."
                aria-label="Search MCU services"
              />
            </label>
          </div>

          <div className="directory-toolbar">
            <div className="filters" aria-label="Filter services">
              {categories.map((item) => (
                <button
                  key={item}
                  className={category === item ? "selected" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <span className="result-count">
              <strong>{catalogLoading && sites.length === 0 ? "—" : filteredSites.length}</strong> connected services
            </span>
          </div>

          <div className="site-grid">
            {filteredSites.map((site, index) => {
              const Icon = site.icon;
              return (
                <a
                  className={`site-card site-card-${site.tone}`}
                  href={site.href}
                  key={site.title}
                  style={{ "--card-index": index }}
                  onClick={(event) => openService(event, site)}
                >
                  <span className="card-accent" aria-hidden="true" />
                  <div className="card-top">
                    <span className={`site-icon ${site.tone}`}>
                      <Icon size={24} />
                    </span>
                    <ExternalLink className="external-icon" size={18} />
                  </div>
                  <span className="category-label">{site.category}</span>
                  <h3>{site.title}</h3>
                  <p>{site.description}</p>
                  <span className="card-link">
                    <span>Visit website</span>
                    <span className="arrow-bubble"><ArrowRight size={15} /></span>
                  </span>
                </a>
              );
            })}
          </div>

          {catalogLoading && sites.length === 0 && (
            <div className="empty-state directory-loading" role="status">
              <span className="directory-loader" />
              <h3>Loading MCU services</h3>
              <p>Connecting to the digital ecosystem…</p>
            </div>
          )}

          {!catalogLoading && filteredSites.length === 0 && (
            <div className="empty-state">
              <Search size={28} />
              <h3>{catalogError ? "Services are unavailable" : "No services found"}</h3>
              <p>{catalogError || "Try a different search term or category."}</p>
              {!catalogError && <button onClick={() => { setQuery(""); setCategory("All"); }}>Clear filters</button>}
            </div>
          )}
        </section>

        <section className="about-section" id="about">
          <div className="about-card">
            <div className="about-icon"><Landmark size={30} /></div>
            <div>
              <span className="section-kicker">SINCE 1904</span>
              <h2>One community. One MCU.</h2>
              <p>
                Manila Central University brings education, healthcare, research,
                and service together. This hub makes every part of our digital
                community easier to reach.
              </p>
            </div>
            <a href="#" className="secondary-action">
              Discover our story <ArrowRight size={17} />
            </a>
          </div>
        </section>

        <section className="support-strip" id="support">
          <div>
            <span className="support-icon"><CircleHelp size={23} /></span>
            <div>
              <h2>Need help finding a service?</h2>
              <p>Our support team is ready to point you in the right direction.</p>
            </div>
          </div>
          <a href="mailto:info@mcu.edu.ph">
            Contact support <ArrowRight size={17} />
          </a>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <span className="brand-mark"><Building2 size={21} /></span>
          <div>
            <strong>MCU All-in-One</strong>
            <span>Manila Central University</span>
          </div>
        </div>
        <p>© {new Date().getFullYear()} Manila Central University. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Accessibility</a>
        </div>
      </footer>

      {loginModal && (
        <div className="service-login-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setLoginModal(null)}>
          <section className="service-login-modal" role="dialog" aria-modal="true" aria-labelledby="service-login-title">
            <button className="service-login-close" onClick={() => setLoginModal(null)} aria-label="Close login dialog">
              <X size={19} />
            </button>
            <span className="service-lock"><LockKeyhole size={25} /></span>
            <span className="section-kicker">MCU SECURE ACCESS</span>
            <h2 id="service-login-title">Sign in to continue</h2>
            <p>
              Use your official MCU Microsoft 365 account to access
              <strong> {loginModal.title}</strong>.
            </p>
            <button className="m365-service-button" onClick={continueWithMicrosoft}>
              <span className="microsoft-symbol" aria-hidden="true"><i /><i /><i /><i /></span>
              Continue with Microsoft 365
              <ArrowRight size={18} />
            </button>
            <small><ShieldCheck size={14} /> Authentication is securely handled by Microsoft Entra ID.</small>
          </section>
        </div>
      )}
    </div>
  );
}

export default Home;
