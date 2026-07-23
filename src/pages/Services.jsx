import { Link } from 'react-router-dom';
import {
  FaHome,
  FaCampground,
  FaUtensils,
  FaHiking,
  FaWifi,
  FaShower,
  FaParking,
  FaLeaf,
  FaChevronRight,
} from 'react-icons/fa';
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

const SERVICES = [
  {
    icon: FaHome,
    title: 'Chalets',
    description:
      'Chalets tout confort pour jusqu\'à 4 personnes : cuisine équipée, salle de bain privée et terrasse avec vue sur la nature.',
    price: '350 MAD / nuit',
    capacity: '4 personnes',
    image: 'src/images/chalets/chalets.png',
    tag: 'Hébergement',
  },
  {
    icon: FaCampground,
    title: 'Emplacements camping',
    description:
      'Espaces ombragés pour tente ou emplacement sécurisé camping-car avec raccordements électriques et eau à proximité.',
    price: '150 MAD / nuit',
    capacity: 'Selon équipement',
    image: 'src/images/espaces/tente.png',
    tag: 'Nature',
  },
  {
    icon: FaUtensils,
    title: 'Restauration',
    description:
      'Restaurant sur place : cuisine marocaine traditionnelle et plats internationaux. Petit-déjeuner, déjeuner et dîner.',
    price: 'À la commande',
    capacity: 'Service continu',
    image: 'src/images/restauration/img1.png',
    tag: 'Gastronomie',
  },
  {
    icon: FaHiking,
    title: 'Activités & loisirs',
    description:
      'Randonnées guidées, soirées feu de camp, yoga en plein air et découverte de la faune locale.',
    price: 'Inclus / supplément',
    capacity: 'Tous âges',
    image: 'src/images/activ.png',
    tag: 'Découverte',
  },
];

const AMENITIES = [
  { icon: FaWifi, label: 'Wi-Fi gratuit', desc: 'Connexion dans les espaces communs' },
  { icon: FaShower, label: 'Sanitaires', desc: 'Blocs propres et entretenus' },
  { icon: FaParking, label: 'Parking sécurisé', desc: 'Accès véhicules 24h/24' },
  { icon: FaLeaf, label: 'Espaces verts', desc: 'Cadre naturel préservé' },
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

export default function Services() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={styles.root}>
      <style>{`
        .servicesNavLink:hover { color: ${GREEN} !important; }
        .serviceCard:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(143, 206, 0, 0.18);
        }
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
              className="servicesNavLink"
              style={{
                ...styles.navLink,
                ...(path === '/services' ? styles.navLinkActive : {}),
              }}
            >
              {label}
            </Link>
          ))}
        </div>
        <Link
          to={isAuthenticated ? '/' : '/login'}
          style={{ textDecoration: 'none' }}
        >
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
        <h1 style={styles.heroTitle}>Nos services</h1>
        <p style={styles.heroDesc}>
          Hébergement, restauration et activités au cœur de la nature.
          Tout ce dont vous avez besoin pour un séjour serein et mémorable.
        </p>
        <div style={styles.heroRule} aria-hidden />
      </section>

      <section style={styles.gridSection}>
        <div style={styles.grid}>
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <article key={service.title} style={styles.card} className="serviceCard">
                <div style={styles.cardImgWrap}>
                  <img src={service.image} alt={service.title} style={styles.cardImg} />
                  <span style={styles.cardTag}>{service.tag}</span>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardIconRow}>
                    <span style={styles.cardIcon}>
                      <Icon size={18} color={GREEN} />
                    </span>
                    <h2 style={styles.cardTitle}>{service.title}</h2>
                  </div>
                  <p style={styles.cardDesc}>{service.description}</p>
                  <div style={styles.cardFooter}>
                    <span style={styles.cardPrice}>{service.price}</span>
                    <span style={styles.cardCapacity}>{service.capacity}</span>
                  </div>
                  <Link to="/about" style={{ textDecoration: 'none' }}>
                    <button type="button" style={styles.cardBtn}>
                      En savoir plus
                      <FaChevronRight size={11} />
                    </button>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section style={styles.amenitiesSection}>
        <h2 style={styles.sectionTitle}>Confort & équipements</h2>
        <p style={styles.sectionSub}>
          Des services pensés pour simplifier votre quotidien sur le camping.
        </p>
        <div style={styles.amenitiesGrid}>
          {AMENITIES.map(({ icon: Icon, label, desc }) => (
            <div key={label} style={styles.amenityCard}>
              <div style={styles.amenityIcon}>
                <Icon size={20} color={GREEN} />
              </div>
              <strong style={styles.amenityLabel}>{label}</strong>
              <span style={styles.amenityDesc}>{desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.ctaSection}>
        <div style={styles.ctaBox}>
          <h2 style={styles.ctaTitle}>Prêt pour votre escapade nature ?</h2>
          <p style={styles.ctaDesc}>
            Explorez nos offres et profitez d’un cadre naturel pensé pour votre confort.
          </p>
          <div style={styles.ctaActions}>
            <Link to="/about" style={{ textDecoration: 'none' }}>
              <button type="button" style={styles.ctaPrimary}>
                Découvrir notre camping
              </button>
            </Link>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <button type="button" style={styles.ctaSecondary}>
                Retour à l&apos;accueil
              </button>
            </Link>
          </div>
        </div>
      </section>
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
    padding: '40px 24px 36px',
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
    letterSpacing: '0.3px',
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
  gridSection: {
    padding: '40px 24px 24px',
    maxWidth: 1100,
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 22,
  },
  card: {
    background: WHITE,
    borderRadius: 18,
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(45, 122, 58, 0.08)',
    border: `1px solid ${GREEN_LIGHT}`,
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
  },
  cardImgWrap: {
    position: 'relative',
    height: 180,
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
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
  },
  cardBody: {
    padding: '18px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: 10,
  },
  cardIconRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: GREEN_SOFT,
    border: `1.5px solid ${GREEN_LIGHT}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    color: TEXT,
    fontFamily: "'Poppins', sans-serif",
  },
  cardDesc: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.65,
    color: TEXT_MUTED,
    flex: 1,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    paddingTop: 4,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: 800,
    color: GREEN,
  },
  cardCapacity: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  cardBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    marginTop: 6,
    background: GREEN,
    color: WHITE,
    border: 'none',
    borderRadius: 24,
    padding: '10px 18px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  amenitiesSection: {
    padding: '32px 24px 48px',
    maxWidth: 1100,
    margin: '0 auto',
    textAlign: 'center',
  },
  sectionTitle: {
    margin: '0 0 8px',
    fontSize: 22,
    fontWeight: 800,
    color: GREEN,
    fontFamily: "'Poppins', sans-serif",
  },
  sectionSub: {
    margin: '0 0 28px',
    fontSize: 14,
    color: TEXT_MUTED,
    maxWidth: 480,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  amenitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
  },
  amenityCard: {
    background: WHITE,
    borderRadius: 14,
    padding: '20px 16px',
    border: `1px solid ${GREEN_LIGHT}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  amenityIcon: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: GREEN_SOFT,
    border: `2px solid ${GREEN_LIGHT}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityLabel: {
    fontSize: 14,
    color: TEXT,
  },
  amenityDesc: {
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 1.4,
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
};
