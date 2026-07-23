import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaChevronRight,
  FaSeedling,
  FaHeart,
  FaGlobeAfrica,
  FaLeaf,
  FaUsers,
  FaUserCircle,
} from 'react-icons/fa';

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

const VALUES = [
  {
    icon: FaLeaf,
    title: 'Durabilité',
    description: 'Nous privilégions une gestion responsable des ressources et des pratiques respectueuses de la nature.',
  },
  {
    icon: FaHeart,
    title: 'Hospitalité',
    description: 'Un accueil chaleureux et un accompagnement attentif pour chaque visiteur.',
  },
  {
    icon: FaGlobeAfrica,
    title: 'Ancrage local',
    description: 'Nous valorisons la culture marocaine et soutenons les partenaires de la région.',
  },
  {
    icon: FaSeedling,
    title: 'Qualité continue',
    description: 'Nous améliorons en permanence le confort et les services proposés au camping.',
  },
];

const TEAM = [
  { id: 1, name: 'Direction', role: 'Coordination générale' },
  { id: 2, name: 'Accueil', role: 'Relation clients' },
  { id: 3, name: 'Exploitation', role: 'Services et maintenance' },
  { id: 4, name: 'Animations', role: 'Experiences et activites' },
];

const STATS = [
  { number: '5 000+', label: 'Visiteurs satisfaits' },
  { number: '4', label: 'Types d hebergement' },
  { number: '12', label: 'Annees d experience' },
  { number: '7j/7', label: 'Accompagnement client' },
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

export default function About() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={styles.root}>
      <style>{`
        .aboutNavLink:hover { color: ${GREEN} !important; }
        .aboutCard:hover {
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
            <Link key={label} to={path} className="aboutNavLink" style={styles.navLink}>
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
        <h1 style={styles.heroTitle}>A propos</h1>
        <p style={styles.heroDesc}>
          Une experience nature conviviale, pensee pour le confort, la simplicite
          et le respect de l environnement.
        </p>
        <div style={styles.heroRule} aria-hidden />
      </section>

      <section style={styles.storySection}>
        <div style={styles.storyGrid}>
          <article style={styles.storyCard}>
            <h2 style={styles.sectionTitle}>Notre histoire</h2>
            <p style={styles.sectionText}>
              Depuis notre creation, nous developpons un lieu accueillant au coeur de
              la verdure marocaine. Notre objectif est de proposer un sejour qui
              combine nature, confort et authenticite.
            </p>
            <p style={styles.sectionText}>
              Camping Mimosas grandit avec ses visiteurs : amelioration continue des
              services, espaces soignes et experience humaine chaleureuse.
            </p>
          </article>
          <img
            src="src/images/verts/image.png"
            alt="Camping Mimosas"
            style={styles.storyImage}
          />
        </div>
      </section>

      <section style={styles.valuesSection}>
        <h2 style={styles.sectionTitleCenter}>Nos valeurs</h2>
        <div style={styles.valuesGrid}>
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <article key={value.title} style={styles.valueCard} className="aboutCard">
                <div style={styles.valueIcon}>
                  <Icon size={20} color={GREEN} />
                </div>
                <h3 style={styles.valueTitle}>{value.title}</h3>
                <p style={styles.valueText}>{value.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section style={styles.statsSection}>
        <h2 style={styles.sectionTitleCenterWhite}>Nos chiffres cles</h2>
        <div style={styles.statsGrid}>
          {STATS.map((item) => (
            <div key={item.label} style={styles.statCard}>
              <strong style={styles.statNumber}>{item.number}</strong>
              <span style={styles.statLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.teamSection}>
        <h2 style={styles.sectionTitleCenter}>Notre equipe</h2>
        <p style={styles.teamSub}>Espace photo reserve (icone temporaire)</p>
        <div style={styles.teamGrid}>
          {TEAM.map((member) => (
            <article key={member.id} style={styles.teamCard} className="aboutCard">
              <div style={styles.teamAvatarPlaceholder} aria-label="Photo a ajouter">
                <FaUserCircle size={72} color={GREEN} />
              </div>
              <div style={styles.teamInfo}>
                <h3 style={styles.teamName}>{member.name}</h3>
                <p style={styles.teamRole}>{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={styles.gallerySection}>
        <h2 style={styles.sectionTitleCenter}>Ambiance du domaine</h2>
        <div style={styles.galleryGrid}>
          <img src="src/images/verts/img1.png" alt="Espaces verts" style={styles.galleryImage} />
          <img src="src/images/verts/img2.png" alt="Allees du camping" style={styles.galleryImage} />
          <img src="src/images/restauration/img1.png" alt="Restauration" style={styles.galleryImage} />
        </div>
      </section>

      <section style={styles.ctaSection}>
        <div style={styles.ctaBox}>
          <div style={styles.ctaIcon}>
            <FaUsers size={18} color={GREEN} />
          </div>
          <h2 style={styles.ctaTitle}>Pret a decouvrir Camping Mimosas ?</h2>
          <p style={styles.ctaDesc}>
            Reservez votre sejour et profitez d un cadre naturel, chaleureux et securise.
          </p>
          <div style={styles.ctaActions}>
            <Link to="/services" style={{ textDecoration: 'none' }}>
              <button type="button" style={styles.ctaPrimary}>
                Découvrir nos services
                <FaChevronRight size={11} />
              </button>
            </Link>
            <Link to="/services" style={{ textDecoration: 'none' }}>
              <button type="button" style={styles.ctaSecondary}>
                Voir les services
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
    padding: '40px 24px 34px',
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
    maxWidth: 620,
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
  storySection: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '40px 24px 24px',
  },
  storyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 20,
    alignItems: 'stretch',
  },
  storyCard: {
    background: WHITE,
    borderRadius: 18,
    border: `1px solid ${GREEN_LIGHT}`,
    boxShadow: '0 4px 20px rgba(45, 122, 58, 0.08)',
    padding: '24px 22px',
  },
  sectionTitle: {
    margin: '0 0 12px',
    fontSize: 22,
    fontWeight: 800,
    color: GREEN,
    fontFamily: "'Poppins', sans-serif",
  },
  sectionText: {
    margin: '0 0 12px',
    fontSize: 14,
    lineHeight: 1.7,
    color: TEXT_MUTED,
  },
  storyImage: {
    width: '100%',
    minHeight: 280,
    objectFit: 'cover',
    borderRadius: 18,
    border: `1px solid ${GREEN_LIGHT}`,
    boxShadow: '0 4px 20px rgba(45, 122, 58, 0.08)',
  },
  valuesSection: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '20px 24px 24px',
  },
  sectionTitleCenter: {
    margin: '0 0 20px',
    fontSize: 22,
    fontWeight: 800,
    color: GREEN,
    fontFamily: "'Poppins', sans-serif",
    textAlign: 'center',
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: 16,
  },
  valueCard: {
    background: WHITE,
    borderRadius: 14,
    border: `1px solid ${GREEN_LIGHT}`,
    boxShadow: '0 4px 16px rgba(143, 206, 0, 0.1)',
    padding: '18px 16px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  valueIcon: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: GREEN_SOFT,
    border: `1.5px solid ${GREEN_LIGHT}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  valueTitle: {
    margin: '0 0 6px',
    fontSize: 16,
    color: TEXT,
  },
  valueText: {
    margin: 0,
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 1.6,
  },
  statsSection: {
    background: `linear-gradient(135deg, ${GREEN} 0%, #76bb00 100%)`,
    padding: '36px 24px',
    marginTop: 8,
  },
  sectionTitleCenterWhite: {
    margin: '0 0 20px',
    fontSize: 22,
    fontWeight: 800,
    color: WHITE,
    textAlign: 'center',
    fontFamily: "'Poppins', sans-serif",
  },
  statsGrid: {
    maxWidth: 1000,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 14,
  },
  statCard: {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.35)',
    borderRadius: 14,
    padding: '16px 14px',
    textAlign: 'center',
    color: WHITE,
  },
  statNumber: {
    display: 'block',
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
  },
  teamSection: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '34px 24px 10px',
  },
  teamSub: {
    margin: '-8px 0 20px',
    textAlign: 'center',
    fontSize: 13,
    color: TEXT_MUTED,
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: 16,
  },
  teamCard: {
    background: WHITE,
    borderRadius: 14,
    border: `1px solid ${GREEN_LIGHT}`,
    boxShadow: '0 4px 16px rgba(143, 206, 0, 0.1)',
    padding: '18px 16px',
    textAlign: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  teamAvatarPlaceholder: {
    width: 92,
    height: 92,
    margin: '0 auto 12px',
    borderRadius: '50%',
    background: GREEN_SOFT,
    border: `2px dashed ${GREEN}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamInfo: {},
  teamName: {
    margin: '0 0 4px',
    fontSize: 16,
    color: TEXT,
  },
  teamRole: {
    margin: 0,
    fontSize: 13,
    color: TEXT_MUTED,
  },
  gallerySection: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '22px 24px 10px',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 14,
  },
  galleryImage: {
    width: '100%',
    height: 190,
    objectFit: 'cover',
    borderRadius: 14,
    border: `1px solid ${GREEN_LIGHT}`,
  },
  ctaSection: {
    padding: '24px 24px 48px',
    maxWidth: 1100,
    margin: '0 auto',
  },
  ctaBox: {
    background: `linear-gradient(135deg, ${GREEN_SOFT} 0%, ${WHITE} 55%, ${SECTION_BG} 100%)`,
    border: `2px solid ${GREEN_LIGHT}`,
    borderRadius: 20,
    padding: '30px 24px',
    textAlign: 'center',
    boxShadow: '0 8px 28px rgba(143, 206, 0, 0.12)',
  },
  ctaIcon: {
    width: 38,
    height: 38,
    margin: '0 auto 8px',
    borderRadius: '50%',
    background: WHITE,
    border: `1.5px solid ${GREEN_LIGHT}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTitle: {
    margin: '0 0 8px',
    fontSize: 22,
    fontWeight: 800,
    color: TEXT,
    fontFamily: "'Poppins', sans-serif",
  },
  ctaDesc: {
    margin: '0 0 18px',
    fontSize: 14,
    color: TEXT_MUTED,
  },
  ctaActions: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ctaPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: GREEN,
    color: WHITE,
    border: 'none',
    borderRadius: 24,
    padding: '11px 22px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  ctaSecondary: {
    background: 'transparent',
    color: GREEN,
    border: `2px solid ${GREEN}`,
    borderRadius: 24,
    padding: '9px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
