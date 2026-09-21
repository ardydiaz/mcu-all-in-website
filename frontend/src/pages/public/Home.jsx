import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  LibraryBig,
  Mail,
  Menu,
  Microscope,
  LockKeyhole,
  Megaphone,
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

function ExternalLinkAction() {
  return <span className="external-link-action" aria-hidden="true"><ExternalLink size={20} /></span>;
}

function greetingForManila() {
  const hour = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    hourCycle: "h23",
  }).format(new Date()));
  if (hour < 5) return "Good evening,";
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
}

function formatAnnouncementDate(value) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function Home() {
  const [query, setQuery] = useState("");
  const [quickQuery, setQuickQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginModal, setLoginModal] = useState(null);
  const [sites, setSites] = useState([]);
  const [recentSites, setRecentSites] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [groups, setGroups] = useState([]);
  const [groupTabSelections, setGroupTabSelections] = useState({});
  const [catalogError, setCatalogError] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);
  const [avatarTone] = useState(() => ["violet", "cyan", "pink", "orange", "lime"][Math.floor(Math.random() * 5)]);
  const [greeting, setGreeting] = useState(greetingForManila);
  const [announcements, setAnnouncements] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [storyOpen, setStoryOpen] = useState(false);
  const [quickAccessPage, setQuickAccessPage] = useState(0);

  useEffect(() => setAvatarImageFailed(false), [currentUser?.avatarUrl]);

  useEffect(() => {
    const updateGreeting = () => setGreeting(greetingForManila());
    updateGreeting();
    const timer = window.setInterval(updateGreeting, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const loadRecentlyVisited = useCallback(() => {
    if (!currentUser) {
      setRecentSites([]);
      return;
    }
    fetch("/api/me/recent-services")
      .then((response) => response.ok ? response.json() : [])
      .then((items) => setRecentSites(Array.isArray(items) ? items.map((system) => ({
        ...system,
        title: system.title || system.name,
        href: system.url,
        tone: tonesByColor[system.color] || "purple",
        icon: iconsByCategory[system.category] || BookOpen,
      })) : []))
      .catch(() => setRecentSites([]));
  }, [currentUser]);

  useEffect(() => { loadRecentlyVisited(); }, [loadRecentlyVisited]);

  const loadAnnouncements = useCallback(() => {
    if (!currentUser) {
      setAnnouncements([]);
      setNotificationsOpen(false);
      return;
    }
    fetch("/api/notifications")
      .then((response) => response.ok ? response.json() : { announcements: [] })
      .then((result) => setAnnouncements(Array.isArray(result?.announcements) ? result.announcements : []))
      .catch(() => setAnnouncements([]));
  }, [currentUser]);

  useEffect(() => {
    loadAnnouncements();
    const refresh = window.setInterval(loadAnnouncements, 12000);
    return () => window.clearInterval(refresh);
  }, [loadAnnouncements]);

  const unreadAnnouncements = announcements.filter((item) => !item.isRead);
  const toggleNotifications = () => setNotificationsOpen((open) => !open);
  const openAnnouncement = (announcement) => {
    if (!announcement.isRead) fetch(`/api/notifications/${announcement.id}/read`, { method: "POST" }).catch(() => {});
    setAnnouncements((items) => items.map((item) => item.id === announcement.id ? { ...item, isRead: true } : item));
    setSelectedAnnouncement(announcement);
    setNotificationsOpen(false);
  };

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

  useEffect(() => {
    const prompt = "What would you like to do today?";
    let timeout;
    const typePrompt = () => {
      let index = 0;
      setTypedPrompt("");
      const typeNextCharacter = () => {
        index += 1;
        setTypedPrompt(prompt.slice(0, index));
        if (index < prompt.length) timeout = window.setTimeout(typeNextCharacter, 42);
        else timeout = window.setTimeout(typePrompt, 5000);
      };
      timeout = window.setTimeout(typeNextCharacter, 42);
    };
    typePrompt();
    return () => window.clearTimeout(timeout);
  }, []);

  const loadDirectory = useCallback(() => {
    setCatalogError("");
    Promise.all([fetch("/api/public/systems"), fetch("/api/category-groups")])
      .then(async ([systemsResponse, groupsResponse]) => {
        if (!systemsResponse.ok || !groupsResponse.ok) throw new Error("Unable to load MCU services.");
        const [systems, apiGroups] = await Promise.all([systemsResponse.json(), groupsResponse.json()]);
        setSites(systems.map((system) => ({
          ...system,
          title: system.title || system.name,
          href: system.url,
          tone: tonesByColor[system.color] || "purple",
          icon: iconsByCategory[system.category] || BookOpen,
        })));
        setGroups(apiGroups);
        // Extract all category names from groups for backward compatibility with filters
        const allCategoryNames = new Set();
        apiGroups.forEach(g => {
          g.tabs?.forEach(t => allCategoryNames.add(t.name));
        });
        const nextCategories = ["All", ...Array.from(allCategoryNames)];
        setCategories(nextCategories);
        setCategory((current) => nextCategories.includes(current) ? current : "All");
      })
      .catch((error) => setCatalogError(error.message))
      .finally(() => setCatalogLoading(false));
  }, []);

  useEffect(() => {
    loadDirectory();
    const events = new EventSource("/api/public/events");
    const refreshPublicData = () => { loadDirectory(); loadAnnouncements(); };
    events.addEventListener("directory-updated", refreshPublicData);
    const refreshWhenVisible = () => { if (document.visibilityState === "visible") loadDirectory(); };
    const refreshInterval = window.setInterval(loadDirectory, 12000);
    window.addEventListener("focus", loadDirectory);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      events.removeEventListener("directory-updated", refreshPublicData);
      events.close();
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", loadDirectory);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadDirectory, loadAnnouncements]);

  const siteMatchesQuery = (site, normalizedQuery) =>
    !normalizedQuery ||
    `${site.title} ${site.description} ${(site.categories || [site.category]).join(" ")}`
      .toLowerCase()
      .includes(normalizedQuery);

  const filteredSites = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return sites.filter((site) => {
      const categoryMatches = category === "All" || (site.categories || [site.category]).includes(category);
      return categoryMatches && siteMatchesQuery(site, normalizedQuery);
    });
  }, [sites, category, query]);

  const groupedByTabStructure = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return groups.map((group) => {
      // Get all sites in this group first
      const allGroupSites = sites.filter((site) => {
        const siteCategories = site.categories || [site.category];
        const inGroup = siteCategories.includes(group.name) || (group.tabs && group.tabs.some((t) => siteCategories.includes(t.name)));
        return inGroup && siteMatchesQuery(site, normalizedQuery);
      });

      if (group.tabs && group.tabs.length > 0) {
        // Group with tabs: organize by tab
        return {
          ...group,
          tabs: group.tabs.map((tab) => ({
            ...tab,
            sites: sites.filter((site) => (site.categories || [site.category]).includes(tab.name) && siteMatchesQuery(site, normalizedQuery)),
          })).filter((tab) => tab.sites.length > 0),
        };
      } else {
        // Group without tabs: show "All" and group name as tabs
        const groupNameServices = sites.filter((site) => (site.categories || [site.category]).includes(group.name) && siteMatchesQuery(site, normalizedQuery));

        return {
          ...group,
          tabs: allGroupSites.length > 0
            ? [
                { name: "All", id: `${group.id}-all`, sites: allGroupSites },
                { name: group.name, id: `${group.id}-group`, sites: groupNameServices }
              ]
            : [],
        };
      }
    }).filter((group) => group.tabs.length > 0);
  }, [sites, groups, query]);

  const quickSites = useMemo(() => {
    const normalizedQuery = quickQuery.toLowerCase().trim();
    if (!normalizedQuery) return sites;
    return sites.filter((site) => siteMatchesQuery(site, normalizedQuery));
  }, [sites, quickQuery]);

  const heroQuickSites = useMemo(() => {
    if (!sites.length) return [];
    const start = (quickAccessPage * 3) % sites.length;
    return Array.from({ length: Math.min(3, sites.length) }, (_, index) => sites[(start + index) % sites.length]);
  }, [sites, quickAccessPage]);

  useEffect(() => {
    if (sites.length <= 3) return undefined;
    const pageCount = Math.ceil(sites.length / 3);
    const timer = window.setInterval(() => setQuickAccessPage((page) => (page + 1) % pageCount), 4500);
    return () => window.clearInterval(timer);
  }, [sites.length]);

  const sidebarRecentSites = currentUser && recentSites.length ? recentSites : quickSites.slice(0, 3);
  const sidebarRecentTitle = currentUser && recentSites.length ? "Recently visited" : "Recently added";

  const scrollToDirectory = () => {
    document.getElementById("directory")?.scrollIntoView({ behavior: "smooth" });
  };

  const showAllServices = () => {
    setQuery("");
    setCategory("All");
    setDirectoryOpen(true);
  };

  const openService = (event, site) => {
    event.preventDefault();
    if (currentUser) {
      if (Number.isSafeInteger(Number(site.id))) {
        fetch(`/api/me/recent-services/${site.id}`, { method: "POST", keepalive: true }).catch(() => {});
      }
    }
    if (site.href !== "#") window.open(site.href, "_blank", "noopener,noreferrer");
  };

  const continueWithMicrosoft = () => {
    if (!loginModal) return;
    sessionStorage.setItem("mcu_pending_service", loginModal.href);
    window.location.href = "/api/auth/microsoft?returnTo=/";
  };

  const promptPublicSignIn = (event) => {
    event?.preventDefault();
    setLoginModal({ title: "MCU All-in-One", href: "/" });
  };

  return (
    <>
    <div className="mobile-app-shell">
      <header className="mobile-app-header"><a className="mobile-app-brand" href="#"><span><Building2 size={20} /></span><strong>MCU <small>ALL-IN-ONE</small></strong></a>{currentUser && <div className="notification-control"><button aria-label="Announcements" aria-expanded={notificationsOpen} onClick={toggleNotifications}><Bell size={22} />{unreadAnnouncements.length > 0 && <i>{unreadAnnouncements.length > 9 ? "9+" : unreadAnnouncements.length}</i>}</button>{notificationsOpen && <section className="announcement-menu" aria-label="Announcements"><div className="announcement-menu-head"><div><strong>Notifications</strong><small>{announcements.length ? `${announcements.length} announcement${announcements.length === 1 ? "" : "s"}` : "You are up to date"}</small></div><button onClick={() => setNotificationsOpen(false)} aria-label="Close notifications"><X size={18} /></button></div><div className="announcement-menu-list">{announcements.length ? announcements.map((announcement) => <button className={announcement.isRead ? "" : "unread"} key={announcement.id} onClick={() => openAnnouncement(announcement)}><span><Megaphone size={17} /></span><div><strong>{announcement.title}</strong><small>{announcement.excerpt || "Read the latest MCU announcement."}</small></div></button>) : <p><Bell size={20} />No new announcements.</p>}</div></section>}</div>}</header>
      {selectedAnnouncement && <div className="announcement-detail-overlay" onMouseDown={(event) => event.target === event.currentTarget && setSelectedAnnouncement(null)}><article className="announcement-detail-modal"><button className="announcement-detail-close" onClick={() => setSelectedAnnouncement(null)} aria-label="Close announcement"><X size={20} /></button><span className="announcement-detail-icon"><Megaphone size={22} /></span><small>MCU ANNOUNCEMENT · {formatAnnouncementDate(selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt)}</small><h2>{selectedAnnouncement.title}</h2>{selectedAnnouncement.excerpt && <p className="announcement-detail-excerpt">{selectedAnnouncement.excerpt}</p>}<p className="announcement-detail-content">{selectedAnnouncement.content}</p>{selectedAnnouncement.linkUrl && <a href={selectedAnnouncement.linkUrl} target="_blank" rel="noreferrer">Open related link <ExternalLink size={17} /></a>}</article></div>}
      <main className="mobile-app-content">
        <div className="mcu-profile-avatar-slot">
          <span className={`mcu-profile-avatar ${avatarTone} ${!currentUser?.avatarUrl || avatarImageFailed ? "is-fallback" : ""}`} style={{ "--avatar-x": "50%", "--avatar-y": "4%" }}>
            {currentUser?.avatarUrl && !avatarImageFailed ? <img src={currentUser.avatarUrl} alt="Your Microsoft profile" onError={() => setAvatarImageFailed(true)} /> : <span className="mcu-illustrated-avatar" aria-label="Illustrated profile avatar" role="img" />}
          </span>
        </div>
        <section className="mobile-greeting"><p>{greeting}</p><h1>{currentUser?.fullname?.split(" ")[0] || currentUser?.name?.split(" ")[0] || "MCU Guest"} <span>👋</span></h1><small className="typewriter-prompt">{typedPrompt}<i /></small></section>
        <label className="mobile-service-search"><Search size={20} /><input value={quickQuery} onChange={(event) => setQuickQuery(event.target.value)} placeholder="Search Quick Access..." /></label>
        <section className="mobile-section"><div className="mobile-section-title"><h2>Quick Access</h2><button onClick={showAllServices}>View all</button></div><div className="mobile-quick-grid">{quickSites.slice(0, 6).map((site) => { const Icon = site.icon; return <button key={site.id || site.title} onClick={(event) => openService(event, site)}><span className={site.tone}><Icon size={22} /></span><small>{site.title}</small></button>; })}</div></section>
        <section className="mobile-section"><div className="mobile-section-title"><h2>{sidebarRecentTitle}</h2><button onClick={showAllServices}>View all</button></div><div className="mobile-recent-list">{sidebarRecentSites.map((site) => { const Icon = site.icon; return <button key={site.id || site.title} onClick={(event) => openService(event, site)}><span className={site.tone}><Icon size={19} /></span><div><strong>{site.title}</strong><small>{site.description}</small></div><ExternalLinkAction /></button>; })}</div></section>
      </main>
      <section className="desktop-app-directory">
        <div className="desktop-directory-title"><div><span className="section-kicker"><i /> LIVE MCU DIRECTORY</span><h2>Directory</h2></div></div>
        <label className="desktop-directory-search"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search MCU services..." /></label>
        <div className="desktop-directory-filters">{categories.map((item) => <button className={category === item ? "selected" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="desktop-directory-label"><strong>{category === "All" ? "All services" : category}</strong><span>{filteredSites.length} services</span></div>
        <div className="desktop-directory-list">{filteredSites.map((site) => { const Icon = site.icon; return <button key={site.id || site.title} onClick={(event) => openService(event, site)}><span className={site.tone}><Icon size={24} /></span><div><strong>{site.title}</strong><small>{site.description}</small><em>{(site.categories || [site.category]).join(", ")}</em></div><ExternalLinkAction /></button>; })}{!catalogLoading && !filteredSites.length && <p className="desktop-directory-empty">No matching services found.</p>}</div>
      </section>
      {directoryOpen && <div className="service-directory-overlay" onMouseDown={(event) => event.target === event.currentTarget && setDirectoryOpen(false)}><section className="service-directory-modal"><div className="service-directory-modal-head"><div><span className="section-kicker"><i /> MCU DIGITAL ECOSYSTEM</span><h2>All services</h2><p>{filteredSites.length} connected MCU services</p></div><button onClick={() => setDirectoryOpen(false)} aria-label="Close directory"><X size={22} /></button></div><label className="service-directory-modal-search"><Search size={20} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search MCU services..." /></label><div className="service-directory-modal-filters">{categories.map((item) => <button className={category === item ? "selected" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="service-directory-modal-list">{filteredSites.map((site) => { const Icon = site.icon; return <button key={site.id || site.title} onClick={(event) => openService(event, site)}><span className={site.tone}><Icon size={22} /></span><div><strong>{site.title}</strong><small>{site.description}</small><em>{(site.categories || [site.category]).join(", ")}</em></div><ExternalLinkAction /></button>; })}</div></section></div>}
      <nav className="mobile-bottom-nav"><button className="active"><House size={20} />Home</button><button onClick={showAllServices}><Search size={20} />Directory</button><a href="/" onClick={promptPublicSignIn}><ShieldCheck size={20} />Sign in</a></nav>
    </div>
    <div className="app">
      <header className="site-header">
        <a className="brand" href="#" aria-label="MCU All-in-One home">
          <img className="mcu-official-logo" src="/images/mcu-logo-purple.png" alt="Manila Central University" />
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a className="active" href="#">Home</a>
          <a href="#directory">Directory</a>
          <a href="#about">About MCU</a>
          <a href="#support">Support</a>
        </nav>

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
          <div className="hero-dot-texture" />
          <svg className="hero-wave" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="heroWavePurple" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2e0046" />
                <stop offset="100%" stopColor="#5c297c" />
              </linearGradient>
              <linearGradient id="heroWaveGold" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ffb736" />
                <stop offset="100%" stopColor="#ffd62e" />
              </linearGradient>
            </defs>
            <path d="M0,150 C260,210 500,90 760,130 C1000,170 1220,110 1440,150 L1440,220 L0,220 Z" fill="url(#heroWavePurple)" opacity="0.85" />
            <path d="M0,120 C240,180 480,40 720,90 C960,140 1200,60 1440,110 L1440,220 L0,220 Z" fill="url(#heroWaveGold)" opacity="0.5" />
          </svg>
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
            <div className="quick-links" key={quickAccessPage}>
              {heroQuickSites.map((site) => {
                const Icon = site.icon;
                return (
                <a href={site.href} className="quick-link" key={site.id || site.title} target="_blank" rel="noreferrer" onClick={(event) => openService(event, site)}>
                  <span className={`quick-icon ${site.tone}`}><Icon size={21} /></span>
                  <span>
                    <strong>{site.title}</strong>
                    <small>{site.description}</small>
                  </span>
                  <ChevronRight size={19} />
                </a>
                );
              })}
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

          <div className="service-category-groups">
            {groupedByTabStructure.map((group) => (
              <section className="service-category-group" key={group.name} aria-label={`${group.name} services`}>
                <h3 style={{ marginBottom: "16px", fontSize: "18px", fontWeight: "600" }}>{group.name}</h3>
                {(() => {
                  const activeTab = groupTabSelections[group.name] || "All";
                  const matchingTabs = group.tabs.filter((tab) => activeTab === "All" || activeTab === tab.name);
                  const uniqueSites = Array.from(
                    new Map(matchingTabs.flatMap((tab) => tab.sites).map((site) => [site.id || site.title, site])).values()
                  );
                  return (
                    <>
                      <div className="directory-toolbar category-group-toolbar">
                        {group.tabs && group.tabs.length > 0 && (
                          <div className="filters" aria-label={`Filter ${group.name} services`}>
                            <button className={activeTab === "All" ? "selected" : ""} onClick={() => setGroupTabSelections((current) => ({ ...current, [group.name]: "All" }))}>All</button>
                            {group.tabs.filter(t => t.name !== "All").map((tab) => (
                              <button
                                key={tab.id}
                                className={activeTab === tab.name ? "selected" : ""}
                                onClick={() => setGroupTabSelections((current) => ({ ...current, [group.name]: tab.name }))}
                              >
                                {tab.name}
                              </button>
                            ))}
                          </div>
                        )}
                        <span className="result-count"><strong>{uniqueSites.length}</strong> connected services</span>
                      </div>
                      <div className="site-grid category-site-grid">
                        {uniqueSites.map((site, index) => {
                          const Icon = site.icon;
                          return <a className={`site-card site-card-${site.tone}`} href={site.href} target="_blank" rel="noreferrer" key={site.id || site.title} style={{ "--card-index": index }} onClick={(event) => openService(event, site)}>
                            <span className="card-accent" aria-hidden="true" />
                            <div className="card-top"><span className={`site-icon ${site.tone}`}><Icon size={24} /></span><ExternalLink className="external-icon" size={18} /></div>
                            <span className="category-label">{(site.categories || [site.category]).join(", ")}</span><h3>{site.title}</h3><p>{site.description}</p>
                            <span className="card-link"><span>Visit website</span><span className="arrow-bubble"><ArrowRight size={15} /></span></span>
                          </a>;
                        })}
                      </div>
                    </>
                  );
                })()}
              </section>
            ))}
          </div>

          <div className="directory-toolbar global-directory-toolbar">
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

          <div className="site-grid global-site-grid">
            {filteredSites.map((site, index) => {
              const Icon = site.icon;
              return (
                <a
                  className={`site-card site-card-${site.tone}`}
                  href={site.href}
                  target="_blank"
                  rel="noreferrer"
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
                  <span className="category-label">{(site.categories || [site.category]).join(", ")}</span>
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
            <button type="button" className="secondary-action story-trigger" onClick={() => setStoryOpen(true)}>
              Discover our story <ArrowRight size={17} />
            </button>
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

      {storyOpen && (
        <div className="mcu-story-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setStoryOpen(false)}>
          <article className="mcu-story-modal" role="dialog" aria-modal="true" aria-labelledby="mcu-story-title">
            <button className="mcu-story-close" type="button" onClick={() => setStoryOpen(false)} aria-label="Close MCU story"><X size={21} /></button>
            <section className="mcu-story-hero">
              <span className="section-kicker"><span className="live-pulse" /> OUR MCU STORY</span>
              <h2 id="mcu-story-title">One community.<br /><span>One MCU.</span></h2>
              <p>Placeholder introduction: Share a short, inspiring overview of Manila Central University, its people, and its continuing commitment to service.</p>
              <div className="mcu-story-stat-grid">
                <div><strong>1904</strong><span>Founded</span></div>
                <div><strong>120+</strong><span>Years of service</span></div>
                <div><strong>06</strong><span>Digital communities</span></div>
              </div>
            </section>

            <section className="mcu-story-content">
              <div className="mcu-story-section-head">
                <span>OUR JOURNEY</span>
                <h3>Growing with purpose</h3>
                <p>Placeholder timeline content. Replace these short entries with approved MCU milestones and historic achievements.</p>
              </div>
              <div className="mcu-story-timeline">
                <div><b>1904</b><span /><p><strong>University founded</strong>The success of the review resulted in more students wanting to join the sessions and this brought about the establishment of Escuela de Farmacia del Liceo de Manila, the first private institution operated by Filipinos in the country. </p></div>
                <div><b>Today</b><span /><p><strong>Why MCU</strong>Through the years, we remain deeply rooted in our heritage yet we are intentional to be dynamic and relevant. With a renewed vigor, we are forward-looking to a brighter future by advancing that same pioneering and innovative spirit our institution has engraved in us since 1904.</p></div>
                <div><b>Next</b><span /><p><strong>Our Manifesto</strong>We are Educators and Nurturers. We are entrusted to teach and transform learners to become dynamic and competent members of society. We equip minds with high-quality and values-based education. We guide students toward excellence, integrity, perseverance, and innovation. We take responsibility in the continuous improvement and growth of our community by nurturing talents, knowledge, skills, character, and sense of service.</p></div>
              </div>
             
              <a className="mcu-story-website" href="https://mcu.edu.ph" target="_blank" rel="noreferrer">Visit the MCU official website <ArrowRight size={17} /></a>
            </section>
          </article>
        </div>
      )}

      <footer>
        <div className="footer-brand">
          <img className="mcu-official-logo" src="/images/mcu-logo-purple.png" alt="Manila Central University" />
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
    {loginModal && (
      <div className="service-login-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setLoginModal(null)}>
        <section className="service-login-modal" role="dialog" aria-modal="true" aria-labelledby="service-login-title-active">
          <button className="service-login-close" onClick={() => setLoginModal(null)} aria-label="Close login dialog"><X size={19} /></button>
          <span className="service-lock"><LockKeyhole size={25} /></span>
          <span className="section-kicker">MCU SECURE ACCESS</span>
          <h2 id="service-login-title-active">Sign in to continue</h2>
          <p>Use your official MCU Microsoft 365 account to access<strong> {loginModal.title}</strong>.</p>
          <button className="m365-service-button" onClick={continueWithMicrosoft}><span className="microsoft-symbol" aria-hidden="true"><i /><i /><i /><i /></span>Continue with Microsoft 365<ArrowRight size={18} /></button>
          <small><ShieldCheck size={14} />Authentication is securely handled by Microsoft Entra ID.</small>
        </section>
      </div>
    )}
    </>
  );
}

export default Home;
