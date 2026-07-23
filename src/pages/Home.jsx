import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from '../components/NotificationBell'
import { FaSignOutAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Swal from 'sweetalert2'

const NAV_ITEMS = [
  { label: "Accueil", href: "#" },
  { label: "Services", path: "/services" },
  { label: "Galerie", path: "/galerie" },
  { label: "Communauté", path: "/communaute" },
];

const FEATURES = [
  {
    icon: "⛺",
    title: "Camping Naturel",
    desc: "Explorez notre camping unique avec des emplacements confortables entourés de nature vierge et d'air frais.",
    btn: "En Savoir Plus",
  },
  {
    icon: "🏕️",
    title: "Hébergement Exclusif",
    desc: "Découvrez nos chalets et tentes glamping offrant le confort moderne avec une expérience authentique en plein air.",
    btn: "Découvrir",
  },
  {
    icon: "🚐",
    title: "Espaces Caravanes & Camping-cars",
    desc: "Profitez de nos espaces caravanes et camping-cars fixes, ainsi que de zones tentes équipées pour une expérience de camping authentique.",
    btn: "Découvrir",
  },
];

const HERO_BG = "src/images/verts/image.png";
const HERO_IMAGES = [
  "src/images/verts/image.png",
  "src/images/verts/back2.png",
  "src/images/verts/img1.png",
  "src/images/verts/img2.png",
  "src/images/verts/img3.png",
];
const LOGO = "src/images/logo.png";
const ABOUT_IMG =
  "src/images/chalets/section2.png";
const CARD_IMGS = [
  "src/images/espaces/tente.png",
  "src/images/chalets/chalets.png",
  "src/images/espaces/zone_car.png",
];

function HeroLeafIcon() {
  return (
    <svg
      width="34"
      height="28"
      viewBox="0 0 34 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, marginLeft: 6 }}
      aria-hidden
    >
      <path
        d="M4 20C2 12 6 5 12 3C14 9 12 16 4 20Z"
        fill="#8fce00"
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

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchLoc, setSearchLoc] = useState("");
  const [searchType, setSearchType] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewsIndex, setReviewsIndex] = useState(0);
  const [allReviews, setAllReviews] = useState([]);
  const [reviewsLoadingState, setReviewsLoadingState] = useState(true);
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Charger les avis depuis la base de données
  const fetchReviews = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reviews')
      if (response.ok) {
        const data = await response.json()
        setAllReviews(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error)
    } finally {
      setReviewsLoadingState(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleNextReviews = () => {
    if (reviewsIndex + 2 < allReviews.length) {
      setReviewsIndex(reviewsIndex + 2)
    }
  }

  const handlePrevReviews = () => {
    if (reviewsIndex - 2 >= 0) {
      setReviewsIndex(reviewsIndex - 2)
    }
  }

  const displayedReviews = allReviews.slice(reviewsIndex, reviewsIndex + 2)

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactEmail && contactMessage) {
      console.log("Contact form submitted:", { email: contactEmail, message: contactMessage });
      setContactSubmitted(true);
      setTimeout(() => {
        setContactEmail("");
        setContactMessage("");
        setContactSubmitted(false);
      }, 3000);
    }
  };

  const handleEvaluateClick = () => {
    if (!isAuthenticated) {
      Swal.fire({
        title: 'Authentification requise',
        text: 'Veuillez vous connecter pour évaluer votre expérience',
        icon: 'warning',
        confirmButtonText: 'Se connecter',
        confirmButtonColor: '#afee1b',
        background: 'linear-gradient(135deg, #2d7a3a 0%, #4a9d57 100%)',
        color: '#ffffff'
      }).then(() => navigate('/login'))
    } else {
      setShowReviewModal(true);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewComment.trim()) {
      Swal.fire({
        title: 'Erreur',
        text: 'Veuillez donner une note et un commentaire',
        icon: 'warning',
        confirmButtonColor: '#afee1b'
      })
      return
    }

    setReviewLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission')
      }

      setShowReviewModal(false)
      setReviewRating(0)
      setReviewComment("")
      
      // Rafraîchir les avis pour afficher le nouvel avis immédiatement
      await fetchReviews()
      
      Swal.fire({
        title: 'Succès! 🎉',
        text: 'Votre avis a été enregistré avec succès!',
        icon: 'success',
        confirmButtonColor: '#afee1b',
        background: 'linear-gradient(135deg, #2d7a3a 0%, #4a9d57 100%)',
        color: '#ffffff'
      })
    } catch (error) {
      console.error('Erreur:', error)
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible d\'enregistrer votre avis',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      })
    } finally {
      setReviewLoading(false)
    }
  };

  return (
    <div style={styles.root}>
      <style>{`
        input::placeholder, textarea::placeholder {
          color: rgba(255, 255, 255, 0.6) !important;
          opacity: 1;
        }
        input:focus::placeholder, textarea:focus::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        .navLink {
          border-bottom: 3px solid transparent;
          padding-bottom: 5px;
          transition: border-bottom 0.3s ease;
        }
        .navLink:hover {
          border-bottom: 3px solid #afee1b;
        }
        .authBtn:hover {
          background: #8fce00 !important;
          color: #fff !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(143, 206, 0, 0.3) !important;
        }
        @keyframes slideImages {
          0%, 20% { transform: translateX(0%); }
          25%, 45% { transform: translateX(-25%); }
          50%, 70% { transform: translateX(-50%); }
          75%, 95% { transform: translateX(-75%); }
          100% { transform: translateX(-75%); }
        }
      `}</style>
      {/* ── NAV ── */}
      <nav style={styles.nav}>
        <img src={LOGO} alt="Logo Camping Mimosas" style={styles.logo} />
        <div style={styles.navLinks}>
          {NAV_ITEMS.map((item, index) => {
            const linkStyle = {
              ...styles.navLink,
              ...(index === 0 ? styles.navLinkActive : {}),
            };

            if (item.path) {
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="navLink"
                  style={{ ...linkStyle, textDecoration: "none" }}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <a
                key={item.label}
                href={item.href}
                style={linkStyle}
                className="navLink"
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <div style={styles.navRight}>
          {isAuthenticated && (
            <div className="home-notif-wrap">
              <NotificationBell variant="home" />
            </div>
          )}
          {isAuthenticated ? (
            <>
              <button 
                style={styles.logoutBtn} 
                className="authBtn"
                onClick={async () => {
                  await logout()
                  navigate('/')
                }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button style={styles.loginBtn} className="authBtn">Connexion</button>
              </Link>
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <button style={styles.signupBtn} className="authBtn">Inscription</button>
              </Link>
            </>
          )}
          <Link to="/services" style={{ textDecoration: 'none' }}>
            <button style={styles.getBtn}>Nos services</button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={styles.hero}>
        <div style={styles.heroGlow} aria-hidden />
        <div style={styles.heroRightGlow} aria-hidden />
        {/* Image droite animée qui entre et sort */}
        <div style={styles.heroSlideMask}>
              <div style={styles.heroSlideTrack}>
                {HERO_IMAGES.concat(HERO_IMAGES[0]).map((img, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.heroSlide,
                      backgroundImage: `url(${img})`,
                    }}
                  />
                ))}
              </div>

              {/* Vague */}
              <svg
                viewBox="0 0 120 600"
                preserveAspectRatio="none"
                style={styles.waveShape}
              >
                <path
                  d="
                    M120,0
                    C60,80 20,160 60,240
                    C100,320 20,400 70,480
                    C110,540 40,580 80,600
                    L0,600
                    L0,0
                    Z
                  "
                  fill="#f6f9ef"
                />
              </svg>
            </div>
        {/* Panneau gauche */}
        <div style={styles.heroLeftPanel}>
          <div style={styles.heroContent}>
          <p style={styles.heroBadge}>Bienvenue dans</p>
          <h1 style={styles.heroTitleWrap}>
            <span style={styles.heroTitleCamping}>CAMPING</span>
            <span style={styles.heroTitleMimosasLine}>
              <span style={styles.heroTitleMimosas}>MIMOSAS</span>
              <HeroLeafIcon />
            </span>
          </h1>
          <div style={styles.heroTitleRule} aria-hidden />
          <p style={styles.heroSub}>
            Vous venez d'entrer dans un monde où tout<br />
            devient plus calme.
          </p>

          {/* Stats */}
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <h3 style={styles.statNumber}>12ans+</h3>
              <p style={styles.statLabel}>Expérience</p>
            </div>
            <div style={styles.statItem}>
              <h3 style={styles.statNumber}>98%</h3>
              <p style={styles.statLabel}>Satisfaction</p>
            </div>
            <div style={styles.statItem}>
              <h3 style={styles.statNumber}>24/7</h3>
              <p style={styles.statLabel}>Support</p>
            </div>
          </div>

          {/* Badges */}
          <div style={styles.badges}>
            <span style={styles.badge}>espace communautaire</span>
            <span style={styles.badge}>Avis Vérifiés</span>
            <span style={styles.badge}>Paiement Sécurisé</span>
          </div>

          {/* Buttons */}
          <div style={styles.heroButtons}>
            <Link to="/services" style={{ textDecoration: 'none' }}>
              <button style={styles.reserveBtn}>Découvrir les services</button>
            </Link>
            <Link to="/about" style={{ textDecoration: 'none' }}>
              <button style={styles.learnBtn}>En savoir plus</button>
            </Link>
          </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section style={styles.about}>
        <div style={styles.aboutImgWrap}>
          <img src={ABOUT_IMG} alt="Camping" style={styles.aboutImg} />
          <span style={styles.aboutBadgeTop}>Camping Mimosas</span>
          <span style={styles.aboutBadgeBottom}></span>
        </div>
        <div style={styles.aboutText}>
          <h2 style={styles.sectionTitle}>Bienvenue au Camping Mimosas</h2>
          <p style={styles.bodyText}>
            Camping Mimosas est votre destination idéale pour des vacances inoubliables 
            en plein cœur de la nature marocaine. Nous offrons une expérience authentique 
            combinant confort moderne et connexion naturelle, parfaite pour les familles 
            qui cherchent à s'échapper de la routine quotidienne.
          </p>
          <div style={styles.aboutActions}>
            <Link to="/services" style={{ textDecoration: 'none' }}>
              <button style={styles.greenBtn}>Découvrir nos services</button>
            </Link>
            <Link to="/about" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <span style={styles.learnLink}>À propos de nous →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="services" style={styles.features}>
        <h2 style={styles.featTitle}>Pourquoi Choisir Camping Mimosas?</h2>

        <div style={styles.cards}>
          {FEATURES.map((f, i) => (
            <div key={i} style={styles.card}>
              <img src={CARD_IMGS[i]} alt={f.title} style={styles.cardImg} />
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{f.title}</h3>
                <p style={styles.cardDesc}>{f.desc}</p>
                {i === 0 ? (
                  <Link to="/about" style={{ textDecoration: 'none' }}>
                    <button style={styles.cardBtn}>{f.btn}</button>
                  </Link>
                ) : (
                  <Link to="/services" style={{ textDecoration: 'none' }}>
                    <button style={styles.cardBtn}>{f.btn}</button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section style={styles.reviewsSection}>
        <h2 style={styles.reviewsTitle}>Les avis de nos clients</h2>
        
        <div style={styles.reviewsContainer}>
          {/* Flèche gauche */}
          <button 
            onClick={handlePrevReviews} 
            style={{
              ...styles.arrowBtn,
              opacity: reviewsIndex === 0 ? 0.3 : 1,
              pointerEvents: reviewsIndex === 0 ? 'none' : 'auto'
            }}
          >
            <FaChevronLeft size={18} />
          </button>

          {/* Grille des avis */}
          <div style={styles.reviewsGrid}>
            {displayedReviews.length > 0 ? (
              displayedReviews.map((review) => {
                // Utiliser user_name du backend ou générer les initiales
                const userName = review.user_name || review.author || 'Visiteur'
                const initials = userName
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <div key={review.id} style={styles.reviewCard}>
                    <div style={styles.reviewHeader}>
                      <div style={styles.reviewAvatar}>
                        <span style={styles.avatarInitials}>{initials}</span>
                      </div>
                      <div>
                        <h4 style={styles.reviewName}>{userName}</h4>
                        <div style={styles.reviewRating}>
                          {[...Array(review.rating || 5)].map((_, i) => (
                            <span key={i} style={styles.star}>★</span>
                          ))}
                          <span style={styles.ratingText}>{review.rating || 5}/5</span>
                        </div>
                      </div>
                    </div>
                    <p style={styles.reviewText}>
                      "{review.comment || review.text || ''}"
                    </p>
                  </div>
                )
              })
            ) : (
              <div style={styles.reviewCard}>
                <p style={styles.reviewText}>Aucun avis disponible pour le moment.</p>
              </div>
            )}
          </div>

          {/* Flèche droite */}
          <button 
            onClick={handleNextReviews} 
            style={{
              ...styles.arrowBtn,
              opacity: reviewsIndex + 2 >= allReviews.length ? 0.3 : 1,
              pointerEvents: reviewsIndex + 2 >= allReviews.length ? 'none' : 'auto'
            }}
          >
            <FaChevronRight size={18} />
          </button>
        </div>

        <button onClick={handleEvaluateClick} style={styles.evaluateBtn}>Évaluer votre expérience</button>
      </section>

      {/* ── MODAL ÉVALUATION ── */}
      {showReviewModal && (
        <div style={styles.modalOverlay} onClick={() => setShowReviewModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Évaluez votre expérience</h2>
              <button 
                onClick={() => setShowReviewModal(false)} 
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Sélection des étoiles */}
              <div style={styles.starsSection}>
                <label style={styles.modalLabel}>Votre note</label>
                <div style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      style={{
                        ...styles.starButton,
                        color: star <= reviewRating ? '#afee1b' : '#ddd',
                        fontSize: '3rem'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p style={styles.starText}>
                  {reviewRating > 0 ? `${reviewRating}/5 étoiles` : 'Cliquez pour noter'}
                </p>
              </div>

              {/* Champ de commentaire */}
              <div style={styles.commentSection}>
                <label style={styles.modalLabel}>Votre commentaire</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Partagez votre expérience au camping..."
                  style={styles.commentInput}
                  rows="6"
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button 
                onClick={() => setShowReviewModal(false)}
                style={styles.cancelBtn}
              >
                Annuler
              </button>
              <button 
                onClick={handleSubmitReview}
                disabled={reviewLoading}
                style={{...styles.submitReviewBtn, opacity: reviewLoading ? 0.6 : 1}}
              >
                {reviewLoading ? 'Envoi...' : 'Envoyer mon avis'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>
          <img src={LOGO} alt="Logo Camping Mimosas" style={styles.footerLogoImg} />
        </div>
        <div style={styles.footerContainer}>
          <div style={styles.footerCol}>
            <h4 style={styles.footerTitle}>Camping Mimosas</h4>
            <p style={styles.footerText}>Votre destination pour des vacances inoubliables en plein cœur de la nature marocaine.</p>
          </div>
          <div style={styles.footerCol}>
            <h4 style={styles.footerTitle}>Navigation</h4>
            <ul style={styles.footerList}>
              <li><Link to="/" style={styles.footerLink}>Accueil</Link></li>
              <li><a href="#services" style={styles.footerLink}>Services</a></li>
              <li><Link to="/galerie" style={styles.footerLink}>Galerie</Link></li>
              <li><Link to="/communaute" style={styles.footerLink}>Communauté</Link></li>
            </ul>
          </div>
          <div style={styles.footerCol}>
            <h4 style={styles.footerTitle}>Contactez-nous</h4>
            <p style={styles.footerText}>+212 05 34 56 09 12</p>
            <p style={styles.footerText}>info@campingmimosas.com</p>
            <h4 style={{...styles.footerTitle, marginTop: 16}}>Suivez-nous</h4>
            <div style={styles.socialLinks}>
              <a href="#" style={styles.socialLink}>
                <img src="src/images/facebook.png" alt="Facebook" style={styles.socialIcon} />
              </a>
              <a href="#" style={styles.socialLink}>
                <img src="src/images/instagram.png" alt="Instagram" style={styles.socialIcon} />
              </a>
              <a href="#" style={styles.socialLink}>
                <img src="src/images/instagram.png" alt="Twitter" style={styles.socialIcon} />
              </a>
            </div>
          </div>
          <div style={styles.footerCol}>
            <h4 style={styles.footerTitle}>Formulaire de Contact</h4>
            <form onSubmit={handleContactSubmit} style={styles.contactForm}>
              <input
                type="email"
                placeholder="Votre e-mail"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                style={styles.contactInput}
                required
              />
              <textarea
                placeholder="Votre message"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                style={styles.contactTextarea}
                required
              />
              <button type="submit" style={styles.contactBtn}>
                {contactSubmitted ? "✓ Envoyé" : "Envoyer"}
              </button>
            </form>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.footerCopy}>© 2024 Camping Mimosas. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

/* ─── STYLES ─────────────────────────────────────────────── */
const GREEN = "#8fce00";
const GREEN_DARK = "#1f5c2e";
const GREEN_LIGHT = "#d9ead3";
const GREEN_MID = "#b6d7a8";
const SECTION_BG = "#f6f9ef";

const styles = {
  root: {
    fontFamily: "'Segoe UI', sans-serif",
    background: SECTION_BG,
    color: "#222",
    minHeight: "100vh",
    overflowX: "hidden",
  },

  /* NAV */
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 40px",
    boxShadow: "0 4px 20px rgba(143,206,0,0.15)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    borderRadius: 24,
    margin: "8px 15px 0 15px",
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.72)",
  },
  logo: {
    height: 60,
    width: "auto",
    objectFit: "contain",
    display: "block",
    filter: "drop-shadow(0 2px 4px rgba(143,206,0,0.2))",
  },
  navLinks: {
    display: "flex",
    gap: 32,
    marginLeft: -200,
  },
  navLink: {
    textDecoration: "none",
    color: "#444",
    fontSize: 15,
    fontWeight: 500,
    transition: "color .2s",
  },
  navLinkActive: {
    borderBottom: `3px solid ${GREEN}`,
    paddingBottom: "5px",
    color: GREEN,
  },
  
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  getBtn: {
    background: GREEN,
    color: "#fff",
    border: "none",
    borderRadius: 18,
    padding: "8px 18px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(143,206,0,0.3)",
    transition: "all 0.3s",
  },
  loginBtn: {
    background: "transparent",
    color: GREEN,
    border: `2px solid ${GREEN}`,
    borderRadius: 18,
    padding: "7px 16px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.3s",
  },
  signupBtn: {
    background: "transparent",
    color: GREEN,
    border: `2px solid ${GREEN}`,
    borderRadius: 18,
    padding: "7px 16px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.3s",
  },
  dashboardBtn: {
    background: "transparent",
    color: GREEN,
    border: `2px solid ${GREEN}`,
    borderRadius: 18,
    padding: "7px 16px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.3s",
  },
  logoutBtn: {
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: 18,
    padding: "8px 18px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 2px 8px rgba(220,53,69,0.3)",
  },

  /* HERO */
  hero: {
    position: "relative",
    minHeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 120,
    marginTop: -100,
    width: "100%",
    overflow: "hidden",
    paddingLeft: 40,
    paddingRight: 40,
    background: SECTION_BG,
    
  },
  heroSlideMask: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "50%",
    height: "100%",
    overflow: "hidden",
    zIndex: 1,
  },
  heroSlideTrack: {
    display: "flex",
    width: "400%",
    height: "100%",
    animation: "slideImages 10s infinite ease-in-out",
  },
  heroSlide: {
    width: "25%",
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    flexShrink: 0,
  },
  waveShape: {
  position: "absolute",
  left: 0,
  top: 0,
  height: "100%",
  width: 160,
  zIndex: 20,
  transform: "translateX(-35%)",
  pointerEvents: "none",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0) 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0.6) 100%)",
  },
  heroTrapezoid: {
    display: "none",
  },
  heroLeftPanel: {
    position: "relative",
    width: "50%",
    maxWidth: "50%",
    minHeight: "100%",
    display: "flex",
    alignItems: "center",
    zIndex: 30,
    flexShrink: 0,
  },
  heroRightGlow: {
    position: "absolute",
    left: "calc(50% - 240px)",
    top: 0,
    width: 260,
    height: "100%",
    // background:
    //   "radial-gradient(ellipse 100% 85% at 100% 50%, rgba(175, 238, 27, 0.48) 0%, rgba(143, 206, 0, 0.22) 38%, rgba(246, 249, 239, 0) 72%)",
    pointerEvents: "none",
    zIndex: 2,
  },
  heroGlow: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: "55%",
    height: "100%",
    background:
      "radial-gradient(ellipse 80% 70% at 0% 100%, rgba(175, 238, 27, 0.42) 0%, rgba(143, 206, 0, 0.18) 38%, rgba(246, 249, 239, 0) 72%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  heroContent: {
    background: "transparent",
    position: "relative",
    zIndex: 1,
    padding: "40px 32px 50px 32px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
  },
  heroBadge: {
    color: GREEN,
    borderRadius: 20,
    padding: "2px 0",
    fontSize: 16,
    fontWeight: 500,
    display: "inline-block",
    marginBottom: 8,
    background: "#f6f9ef",
    letterSpacing: "0.5px",
    fontFamily: "'Poppins', sans-serif",
  },
  heroTitleWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    margin: "0 0 10px",
    fontFamily: "'Arial Black', Arial, sans-serif",
    lineHeight: 1.05,
  },
  heroTitleCamping: {
    fontSize: 35,
    fontWeight: 900,
    color: GREEN_DARK,
    letterSpacing: "-0.5px",
    display: "block",
  },
  heroTitleMimosasLine: {
    display: "flex",
    alignItems: "center",
    flexWrap: "nowrap",
  },
  heroTitleMimosas: {
    fontSize: 46,
    fontWeight: 900,
    color: GREEN,
    letterSpacing: "-1px",
    textShadow: "0 2px 10px rgba(143, 206, 0, 0.15)",
  },
  heroTitleRule: {
    width: 56,
    height: 2,
    background: GREEN,
    borderRadius: 2,
    marginBottom: 12,
    opacity: 0.85,
  },
  heroSub: {
    fontSize: 15,
    marginBottom: 22,
    lineHeight: 1.55,
    color: "#5f6b57",
    background: "transparent",
    fontWeight: 400,
  },
  exploreBtn: {
    display: "none",
  },

  /* SEARCH BAR 2 */
  searchBar2: {
    position: "relative",
    width: "100%",
    maxWidth: "400px",
    marginBottom: 30,
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    right: "15px",
    fontSize: "18px",
    cursor: "pointer",
    color: GREEN,
  },

  /* STATS */
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginBottom: 16,
    width: "100%",
    maxWidth: "320px",
  },
  statItem: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "12px",
    padding: "10px 8px",
    textAlign: "center",
  },
  statNumber: {
    color: GREEN,
    fontSize: "18px",
    fontWeight: "800",
    margin: "0 0 4px",
  },
  statLabel: {
    color: "#666",
    fontSize: "11px",
    fontWeight: "500",
    margin: 0,
  },

  /* BADGES */
  badges: {
    display: "flex",
    gap: "8px",
    marginBottom: 18,
    flexWrap: "wrap",
  },
  badge: {
    background: "rgba(143,206,0,0.1)",
    border: `1px solid ${GREEN}`,
    color: GREEN,
    borderRadius: "20px",
    padding: "5px 12px",
    fontSize: "11px",
    fontWeight: "600",
  },

  /* HERO BUTTONS */
  heroButtons: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  reserveBtn: {
    background: GREEN,
    color: "#fff",
    border: "none",
    borderRadius: "18px",
    padding: "8px 20px",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(143,206,0,0.4)",
    transition: "all 0.3s",
  },
  learnBtn: {
    background: "transparent",
    color: GREEN,
    border: `2px solid ${GREEN}`,
    borderRadius: "18px",
    padding: "6px 18px",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.3s",
  },

  /* SEARCH BAR */
  searchBar: {
    position: "absolute",
    bottom: -28,
    left: "50%",
    transform: "translateX(-50%)",
    width: "80%",
    background: "#fff",
    borderRadius: 40,
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
    gap: 8,
    zIndex: 10,
    border: `2px solid ${GREEN_LIGHT}`,
  },
  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: 14,
    color: "#555",
    background: "rgba(255,255,255,0.9)",
    padding: "14px 45px 14px 16px",
    borderRadius: "12px",
    fontFamily: "inherit",
  },
  searchDivider: {
    width: 1,
    height: 28,
    background: "#ddd",
    margin: "0 6px",
  },
  searchIcons: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginRight: 8,
  },
  iconBtn: {
    fontSize: 18,
    cursor: "pointer",
    background: "none",
    border: "none",
  },
  iconBtnGreen: {
    fontSize: 18,
    cursor: "pointer",
    background: GREEN,
    color: "#fff",
    borderRadius: "50%",
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  compareBtn: {
    background: GREEN,
    color: "#fff",
    border: "none",
    borderRadius: 28,
    padding: "9px 22px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  /* ABOUT */
  about: {
    display: "flex",
    alignItems: "center",
    gap: 52,
    padding: "60px 60px 60px",
    background: SECTION_BG,
    flexWrap: "wrap",
    width: "70%",
    margin: "0 auto",
  },
  aboutImgWrap: {
    position: "relative",
    flexShrink: 0,
  },
  aboutImg: {
    width: 300,
    height: 260,
    objectFit: "cover",
    borderRadius: 18,
    display: "block",
    boxShadow: "0 8px 32px rgba(45,122,58,0.18)",
  },
  aboutBadgeTop: {
    position: "absolute",
    top: -14,
    left: -14,
    background: GREEN,
    color: "#fff",
    borderRadius: 20,
    padding: "6px 16px",
    fontSize: 13,
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(45,122,58,0.25)",
  },
  aboutBadgeBottom: {
    position: "absolute",
    bottom: -14,
    right: -14,
    background: "#fff",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
  },
  aboutText: {
    flex: 1,
    minWidth: 260,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: "#222",
    marginBottom: 14,
    fontFamily: "'Poppins', sans-serif",
  },
  bodyText: {
    color: "#666",
    fontSize: 15,
    lineHeight: 1.7,
    marginBottom: 22,
  },
  aboutActions: {
    display: "flex",
    alignItems: "center",
    gap: 18,
  },
  greenBtn: {
    background: GREEN,
    color: "#fff",
    border: "none",
    borderRadius: 24,
    padding: "10px 22px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  learnLink: {
    color: GREEN,
    fontWeight: 600,
    fontSize: 14,
    textDecoration: "none",
  },

  /* FEATURES */
  features: {
    background: SECTION_BG,
    padding: "52px 40px 40px",
    textAlign: "center",
  },
  featTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: GREEN,
    marginBottom: 32,
    fontFamily: "'Poppins', sans-serif",
  },
  dots: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#bbb",
    cursor: "pointer",
    transition: "background .2s",
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: GREEN,
    cursor: "pointer",
  },
  cards: {
    display: "flex",
    gap: 24,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  card: {
    background: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    width: 280,
    boxShadow: "0 4px 20px rgba(45,122,58,0.10)",
    textAlign: "left",
    transition: "transform .2s, box-shadow .2s",
  },
  cardImg: {
    width: "100%",
    height: 170,
    objectFit: "cover",
    display: "block",
  },
  cardBody: {
    padding: "16px 18px 18px",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#222",
    marginBottom: 8,
    fontFamily: "'Poppins', sans-serif",
  },
  cardDesc: {
    color: "#777",
    fontSize: 13,
    lineHeight: 1.6,
    marginBottom: 14,
  },
  cardBtn: {
    background: GREEN,
    color: "#fff",
    border: "none",
    borderRadius: 20,
    padding: "8px 18px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },

  /* FOOTER */
  footer: {
    background: `linear-gradient(135deg,rgb(74, 124, 86) 0%,rgb(74, 124, 86)`,
    color: "#fff",
    padding: "20px 40px 10px",
    marginTop: 60,
  },
  footerLogo: {
    textAlign: "center",
    marginBottom: 30,
  },
  footerLogoImg: {
    height: 60,
    width: "auto",
    objectFit: "contain",
    display: "inline-block",
  },
  footerContainer: {
    display: "flex",
    gap: 60,
    justifyContent: "space-between",
    maxWidth: "1200px",
    margin: "0 auto 40px",
    flexWrap: "wrap",
  },
  footerCol: {
    flex: 1,
    minWidth: 250,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 800,
    marginBottom: 12,
    color: GREEN,
    fontFamily: "'Poppins', sans-serif",
  },
  footerText: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.8)",
    margin: "6px 0",
  },
  footerList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  footerLink: {
    color: "rgba(255,255,255,0.8)",
    textDecoration: "none",
    fontSize: 13,
    transition: "color 0.3s",
  },
  socialLinks: {
    display: "flex",
    gap: 12,
  },
  socialLink: {
    display: "inline-flex",
    background: GREEN,
    color: "#fff",
    width: 40,
    height: 40,
    borderRadius: "50%",
    fontSize: 18,
    textDecoration: "none",
    transition: "all 0.3s",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 20,
    height: 20,
    objectFit: "contain",
  },
  contactForm: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  contactInput: {
    padding: "10px 12px",
    border: "2px solid rgb(46, 199, 79)",
    borderRadius: 6,
    background: "rgba(255, 255, 255, 0.18)",
    color: "#fff",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.3s",
  },
  contactTextarea: {
    padding: "10px 12px",
    border: "2px solid rgb(46, 199, 79)",
    borderRadius: 6,
    background: "rgba(255, 255, 255, 0.17)",
    color: "#fff",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.3s",
    resize: "vertical",
    minHeight: 80,
  },
  contactBtn: {
    background: GREEN,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "10px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s",
  },
  footerBottom: {
    borderTop: `1px solid rgba(255,255,255,0.2)`,
    paddingTop: 20,
    textAlign: "center",
  },
  footerCopy: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    margin: 0,
  },

  /* REVIEWS SECTION */
  reviewsSection: {
    background: SECTION_BG,
    padding: "60px 40px",
    textAlign: "center",
  },
  reviewsTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: GREEN,
    marginBottom: 32,
    fontFamily: "'Poppins', sans-serif",
  },
  reviewsContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    maxWidth: "1000px",
    margin: "0 auto 28px",
  },
  reviewsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 24,
    flex: 1,
    minWidth: 0,
  },
  arrowBtn: {
    background: GREEN,
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 44,
    height: 44,
    fontSize: 24,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.3s",
    boxShadow: "0 4px 12px rgba(143,206,0,0.3)",
  },
  reviewCard: {
    background: "#f9f9f9",
    border: `1px solid ${GREEN_LIGHT}`,
    borderRadius: 16,
    padding: "20px 18px",
    textAlign: "left",
    transition: "all 0.3s",
  },
  reviewHeader: {
    display: "flex",
    gap: 12,
    marginBottom: 14,
    alignItems: "flex-start",
  },
  reviewAvatar: {
    width: 45,
    height: 45,
    borderRadius: "50%",
    background: GREEN,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarInitials: {
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#222",
    margin: "0 0 4px",
  },
  reviewRating: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
  star: {
    color: GREEN,
    fontSize: 13,
  },
  ratingText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 6,
  },
  reviewText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 1.6,
    margin: 0,
  },
  evaluateBtn: {
    background: GREEN,
    color: "#fff",
    border: "none",
    borderRadius: 20,
    padding: "12px 32px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 4px 15px rgba(143,206,0,0.3)",
  },

  /* MODAL STYLES */
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    borderRadius: 12,
    width: "90%",
    maxWidth: 500,
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
    animation: "slideUp 0.3s ease",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: `2px solid ${GREEN_LIGHT}`,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: GREEN,
    margin: 0,
    fontFamily: "'Poppins', sans-serif",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 24,
    cursor: "pointer",
    color: "#999",
    transition: "color 0.2s",
    padding: 0,
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    padding: "24px",
  },
  starsSection: {
    marginBottom: 24,
  },
  starsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    margin: "12px 0",
  },
  starButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    transition: "all 0.2s",
    transform: "scale(1)",
  },
  starText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    margin: "8px 0 0 0",
  },
  commentSection: {
    marginBottom: 24,
  },
  modalLabel: {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: GREEN,
    marginBottom: 8,
    fontFamily: "'Poppins', sans-serif",
  },
  commentInput: {
    width: "100%",
    padding: "12px",
    border: `2px solid ${GREEN_LIGHT}`,
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "inherit",
    fontFamily: "'Poppins', sans-serif",
    outline: "none",
    transition: "border-color 0.3s",
    boxSizing: "border-box",
    resize: "vertical",
  },
  modalFooter: {
    display: "flex",
    gap: 12,
    padding: "16px 24px",
    borderTop: `1px solid #eee`,
  },
  cancelBtn: {
    flex: 1,
    padding: "12px 16px",
    background: "#f0f0f0",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s",
    color: "#333",
  },
  submitReviewBtn: {
    flex: 1,
    padding: "12px 16px",
    background: GREEN,
    color: "white",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s",
  },
};