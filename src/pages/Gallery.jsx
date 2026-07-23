import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const GREEN = '#8fce00';
const GREEN_LIGHT = '#d9ead3';
const GREEN_SOFT = '#e8f5d6';
const SECTION_BG = '#f6f9ef';
const WHITE = '#ffffff';
const TEXT = '#444444';
const TEXT_MUTED = '#666666';
const LOGO = 'src/images/logo.png';

const NAV_ITEMS = [
  { label: 'Accueil', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Galerie', path: '/galerie' },
  { label: 'Communauté', path: '/communaute' },
];

const CATEGORIES = ['Tous', 'Hébergement', 'Paysage', 'Restauration'];

const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'Chalet - Façade',
    category: 'Hébergement',
    image: 'src/images/chalets/chalets.png',
    tall: true,
  },
  {
    id: 2,
    title: 'Chalet - Intérieur 1',
    category: 'Hébergement',
    image: 'src/images/chalets/img1.png',
    tall: false,
  },
  {
    id: 3,
    title: 'Chalet - Intérieur 2',
    category: 'Hébergement',
    image: 'src/images/chalets/img2.png',
    tall: false,
  },
  {
    id: 4,
    title: 'Chalet - Intérieur 3',
    category: 'Hébergement',
    image: 'src/images/chalets/img3.png',
    tall: true,
  },
  {
    id: 5,
    title: 'Maison - Chambre',
    category: 'Hébergement',
    image: 'src/images/maisons/img1.png',
    tall: false,
  },
  {
    id: 6,
    title: 'Maison - Salon',
    category: 'Hébergement',
    image: 'src/images/maisons/img2.png',
    tall: false,
  },
  {
    id: 7,
    title: 'Maison - Terrasse',
    category: 'Hébergement',
    image: 'src/images/maisons/img3.png',
    tall: true,
  },
  {
    id: 8,
    title: 'Allée verdoyante',
    category: 'Paysage',
    image: 'src/images/verts/img1.png',
    tall: false,
  },
  {
    id: 9,
    title: 'Jardin tropical',
    category: 'Paysage',
    image: 'src/images/verts/img2.png',
    tall: true,
  },
  {
    id: 10,
    title: 'Espaces verts',
    category: 'Paysage',
    image: 'src/images/verts/img3.png',
    tall: false,
  },
  {
    id: 11,
    title: 'Zone caravanes',
    category: 'Paysage',
    image: 'src/images/espaces/zone_car.png',
    tall: true,
  },
  {
    id: 12,
    title: 'Restaurant - Terrasse',
    category: 'Restauration',
    image: 'src/images/restauration/img1.png',
    tall: false,
  },
  {
    id: 13,
    title: 'Restaurant - Entrée',
    category: 'Restauration',
    image: 'src/images/restauration/img2.png',
    tall: false,
  },
];

function HeroLeafIcon() {
  return (
    <svg width="28" height="22" viewBox="0 0 34 28" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path
        d="M4 20C2 12 6 5 12 3C14 9 12 16 4 20Z"
        fill={GREEN}
        transform="rotate(-18 10 11)"
      />
      <path
        d="M14 18C12 10 18 4 26 4C27 11 22 17 14 18Z"
        fill="#a8e63a"
        transform="rotate(12 20 10)"
      />
    </svg>
  );
}

export default function Gallery() {
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'Tous') return GALLERY_ITEMS;
    return GALLERY_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const openLightbox = (id) => {
    const index = filteredItems.findIndex((item) => item.id === id);
    if (index >= 0) setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const goPrev = () => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + filteredItems.length) % filteredItems.length));
  };

  const goNext = () => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % filteredItems.length));
  };

  const lightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div style={styles.root}>
      <style>{`
        .galleryNavLink:hover { color: ${GREEN} !important; }
        .galleryCard:hover .galleryOverlay { opacity: 1; }
        .galleryCard:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(143, 206, 0, 0.18); }
        .filterChip:hover { border-color: ${GREEN}; color: ${GREEN}; }
      `}</style>

      <nav style={styles.nav}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <img src={LOGO} alt="Camping Mimosas" style={styles.logo} />
        </Link>
        <div style={styles.navLinks}>
          {NAV_ITEMS.map(({ label, path }) => (
            <Link
              key={label}
              to={path}
              className="galleryNavLink"
              style={{
                ...styles.navLink,
                ...(path === '/galerie' ? styles.navLinkActive : {}),
              }}
            >
              {label}
            </Link>
          ))}
        </div>
        <Link to={isAuthenticated ? '/' : '/login'} style={{ textDecoration: 'none' }}>
          <button type="button" style={styles.navBtn}>
            {isAuthenticated ? 'Mon espace' : 'Connexion / Inscription'}
          </button>
        </Link>
      </nav>

      <section style={styles.hero}>
        <p style={styles.heroBadge}>
          <HeroLeafIcon />
          <span>Camping Mimosas</span>
        </p>
        <h1 style={styles.heroTitle}>Galerie photos</h1>
        <p style={styles.heroDesc}>
          Découvrez notre domaine en images : hébergements, paysages et espaces
          de restauration au cœur du camping.
        </p>
        <div style={styles.heroRule} aria-hidden />
      </section>

      <section style={styles.filtersSection}>
        <div style={styles.filters}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className="filterChip"
              style={{
                ...styles.filterChip,
                ...(activeCategory === cat ? styles.filterChipActive : {}),
              }}
              onClick={() => {
                setActiveCategory(cat);
                setLightboxIndex(null);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <p style={styles.resultCount}>
          {filteredItems.length} photo{filteredItems.length > 1 ? 's' : ''}
          {activeCategory !== 'Tous' ? ` — ${activeCategory}` : ''}
        </p>
      </section>

      <section style={styles.gridSection}>
        {filteredItems.length === 0 ? (
          <p style={styles.emptyMsg}>Aucune photo dans cette catégorie pour le moment.</p>
        ) : (
          <div style={styles.masonry}>
            {filteredItems.map((item) => (
              <article
                key={item.id}
                style={{
                  ...styles.card,
                  ...(item.tall ? styles.cardTall : styles.cardShort),
                }}
                className="galleryCard"
              >
                <button
                  type="button"
                  style={styles.cardBtn}
                  onClick={() => openLightbox(item.id)}
                  aria-label={`Voir ${item.title}`}
                >
                  <img src={item.image} alt={item.title} style={styles.cardImg} />
                  <div style={styles.galleryOverlay} className="galleryOverlay">
                    <FaExpand size={22} color={WHITE} />
                  </div>
                  <span style={styles.cardTag}>{item.category}</span>
                </button>
                <div style={styles.cardCaption}>
                  <strong style={styles.cardTitle}>{item.title}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={styles.ctaSection}>
        <div style={styles.ctaBox}>
          <h2 style={styles.ctaTitle}>Envie de vivre l&apos;expérience ?</h2>
          <p style={styles.ctaDesc}>
            Découvrez notre ambiance et les services qui rendent chaque séjour unique au Camping Mimosas.
          </p>
          <div style={styles.ctaActions}>
            <Link to="/services" style={{ textDecoration: 'none' }}>
              <button type="button" style={styles.ctaPrimary}>
                Découvrir nos services
              </button>
            </Link>
            <Link to="/services" style={{ textDecoration: 'none' }}>
              <button type="button" style={styles.ctaSecondary}>
                Voir nos services
              </button>
            </Link>
          </div>
        </div>
      </section>

      {lightboxItem && (
        <div
          style={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.title}
          onClick={closeLightbox}
        >
          <div style={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
            <button type="button" style={styles.lightboxClose} onClick={closeLightbox} aria-label="Fermer">
              <FaTimes size={18} />
            </button>
            <button type="button" style={styles.lightboxNav} onClick={goPrev} aria-label="Photo précédente">
              <FaChevronLeft size={20} />
            </button>
            <img src={lightboxItem.image} alt={lightboxItem.title} style={styles.lightboxImg} />
            <button
              type="button"
              style={{ ...styles.lightboxNav, ...styles.lightboxNavRight }}
              onClick={goNext}
              aria-label="Photo suivante"
            >
              <FaChevronRight size={20} />
            </button>
            <div style={styles.lightboxCaption}>
              <strong>{lightboxItem.title}</strong>
              <span>{lightboxItem.category}</span>
              <span style={styles.lightboxCounter}>
                {lightboxIndex + 1} / {filteredItems.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'Segoe UI', 'Poppins', sans-serif",
    background: SECTION_BG,
    minHeight: '100vh',
    color: TEXT,
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 32px',
    background: WHITE,
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    flexWrap: 'wrap',
    gap: 12,
  },
  logo: { height: 48 },
  navLinks: { display: 'flex', gap: 22, flexWrap: 'wrap' },
  navLink: {
    textDecoration: 'none',
    color: TEXT_MUTED,
    fontSize: 13,
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  navLinkActive: { color: GREEN, fontWeight: 700 },
  navBtn: {
    background: GREEN,
    color: WHITE,
    border: 'none',
    borderRadius: 20,
    padding: '9px 18px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  hero: {
    padding: '40px 24px 32px',
    textAlign: 'center',
    background: SECTION_BG,
    borderBottom: `1px solid ${GREEN_LIGHT}`,
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    margin: '0 0 14px',
    fontSize: 13,
    fontWeight: 600,
    color: GREEN,
  },
  heroTitle: {
    margin: '0 0 14px',
    fontFamily: "'Poppins', sans-serif",
    fontSize: 'clamp(2rem, 5vw, 2.6rem)',
    fontWeight: 700,
    letterSpacing: '-0.5px',
    color: GREEN,
  },
  heroDesc: {
    margin: '0 auto',
    maxWidth: 560,
    fontSize: 15,
    lineHeight: 1.65,
    color: TEXT_MUTED,
  },
  heroRule: {
    width: 56,
    height: 4,
    background: GREEN,
    borderRadius: 4,
    margin: '22px auto 0',
  },
  filtersSection: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '28px 24px 8px',
    textAlign: 'center',
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 12,
  },
  filterChip: {
    background: WHITE,
    border: `1.5px solid ${GREEN_LIGHT}`,
    borderRadius: 20,
    padding: '8px 18px',
    fontSize: 13,
    fontWeight: 600,
    color: TEXT_MUTED,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterChipActive: {
    background: GREEN,
    borderColor: GREEN,
    color: WHITE,
  },
  resultCount: {
    margin: 0,
    fontSize: 13,
    color: TEXT_MUTED,
  },
  gridSection: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '20px 24px 32px',
  },
  masonry: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 18,
    gridAutoRows: 8,
  },
  card: {
    background: WHITE,
    borderRadius: 16,
    overflow: 'hidden',
    border: `1px solid ${GREEN_LIGHT}`,
    boxShadow: '0 4px 18px rgba(45, 122, 58, 0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    gridRowEnd: 'span 28',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTall: { gridRowEnd: 'span 34' },
  cardShort: { gridRowEnd: 'span 26' },
  cardBtn: {
    position: 'relative',
    border: 'none',
    padding: 0,
    margin: 0,
    background: 'none',
    cursor: 'pointer',
    width: '100%',
    flex: 1,
    minHeight: 200,
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    minHeight: 200,
    objectFit: 'cover',
    display: 'block',
  },
  galleryOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(31, 92, 46, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.25s',
  },
  cardTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    background: GREEN,
    color: WHITE,
    fontSize: 11,
    fontWeight: 700,
    padding: '5px 12px',
    borderRadius: 20,
    zIndex: 2,
  },
  cardCaption: {
    padding: '12px 16px 14px',
    borderTop: `1px solid ${GREEN_LIGHT}`,
    background: WHITE,
  },
  cardTitle: {
    fontSize: 14,
    color: TEXT,
    fontFamily: "'Poppins', sans-serif",
  },
  emptyMsg: {
    textAlign: 'center',
    color: TEXT_MUTED,
    fontSize: 15,
    padding: '48px 0',
  },
  ctaSection: {
    padding: '0 24px 48px',
    maxWidth: 1100,
    margin: '0 auto',
  },
  ctaBox: {
    background: `linear-gradient(135deg, ${GREEN_SOFT} 0%, ${WHITE} 55%, ${SECTION_BG} 100%)`,
    border: `2px solid ${GREEN_LIGHT}`,
    borderRadius: 20,
    padding: '36px 28px',
    textAlign: 'center',
    boxShadow: '0 8px 28px rgba(143, 206, 0, 0.12)',
  },
  ctaTitle: {
    margin: '0 0 10px',
    fontSize: 22,
    fontWeight: 800,
    color: TEXT,
    fontFamily: "'Poppins', sans-serif",
  },
  ctaDesc: {
    margin: '0 0 22px',
    fontSize: 14,
    color: TEXT_MUTED,
    maxWidth: 420,
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: 1.6,
  },
  ctaActions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ctaPrimary: {
    background: GREEN,
    color: WHITE,
    border: 'none',
    borderRadius: 24,
    padding: '12px 26px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  ctaSecondary: {
    background: 'transparent',
    color: GREEN,
    border: `2px solid ${GREEN}`,
    borderRadius: 24,
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  lightbox: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.82)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lightboxInner: {
    position: 'relative',
    maxWidth: 900,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImg: {
    maxWidth: '100%',
    maxHeight: '75vh',
    borderRadius: 12,
    objectFit: 'contain',
    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
  },
  lightboxClose: {
    position: 'absolute',
    top: -44,
    right: 0,
    background: 'transparent',
    border: 'none',
    color: WHITE,
    cursor: 'pointer',
    padding: 8,
  },
  lightboxNav: {
    position: 'absolute',
    left: -48,
    top: '50%',
    transform: 'translateY(-50%)',
    background: GREEN,
    border: 'none',
    color: WHITE,
    width: 40,
    height: 40,
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxNavRight: { left: 'auto', right: -48 },
  lightboxCaption: {
    position: 'absolute',
    bottom: -52,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: WHITE,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 14,
  },
  lightboxCounter: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
};
