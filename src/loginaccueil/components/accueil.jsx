import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import Login from "./Login";
import { useNavigate } from "react-router-dom";

// Import des images (si elles sont dans src/assets)
import logo from "../assets/ENSABM-LOGO-removebg-preview.png";
import heroImage from "../assets/2222 1.png";
import formation1 from "../assets/istockphoto-1192947841-170667a.png";
import formation2 from "../assets/istockphoto-1396019181-170667a.png";
import formation3 from "../assets/istockphoto-1226452601-170667a.png";
import directeurImage from "../assets/diricteur.jpg";

const Accueil = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formations, setFormations] = useState([]);
  const [loadingFormations, setLoadingFormations] = useState(false);
  const [errorFormations, setErrorFormations] = useState(null);
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      setIsLoggedIn(true);
      // Rediriger vers l'application principale
      navigate("/");
    }
  }, [navigate]);

  // Récupérer les formations depuis l'API
  useEffect(() => {
    const fetchFormations = async () => {
      setLoadingFormations(true);
      try {
        console.log('Tentative de récupération des formations...');
        const response = await fetch('http://localhost:5000/api/formations/latest');
        console.log('Réponse reçue:', response.status);

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Données reçues:', data);

        if (data && Array.isArray(data) && data.length > 0) {
          setFormations(data);
        } else {
          console.log('Aucune formation reçue ou format incorrect');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des formations:', error);
        setErrorFormations(error.message);
      } finally {
        setLoadingFormations(false);
      }
    };

    fetchFormations();
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setShowLogin(false);
    // Rediriger vers l'espace étudiant après une connexion réussie
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
  };

  // Styles JSX
  const styles = {
    nav: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px',
    },
    logo: {
      height: '100px',
      marginRight: '6px',
    },
    navList: {
      listStyle: 'none',
      display: 'flex',
      alignItems: 'center',
    },
    navItem: {
      margin: '0 15px',
    },
    navLink: {
      color: 'black',
      textDecoration: 'none',
    },
    loginButton: {
      backgroundColor: 'blue',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
    },
    closeButton: {
        position: 'absolute', // Position absolue par rapport au conteneur parent
        top: '10px', // Position en haut
        right: '10px', // Position à droite
        backgroundColor: 'red', // Couleur de fond
        color: 'white', // Couleur du texte
        border: 'none', // Pas de bordure
        borderRadius: '5px', // Coins arrondis
        padding: '5px 10px', // Espacement interne
        cursor: 'pointer', // Curseur en forme de main
        zIndex: 1001, // Assure que le bouton est au-dessus du formulaire
      },
    heroSection: {
      position: 'relative',
    },
    heroText: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
    },
    heroImage: {
      width: '100%',
      height: '384px',
      objectFit: 'cover',
    },
    contactButton: {
      backgroundColor: 'blue',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
    },
    servicesSection: {
      padding: '2rem 0',
      backgroundColor: '#f9f9f9',
    },
    servicesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
      padding: '0 10%',
    },
    serviceCard: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
    },
    serviceButton: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    formationsSection: {
      padding: '2rem 0',
      backgroundColor: '#ffffff',
    },
    formationsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
      padding: '0 10%',
    },
    formationCard: {
      textAlign: 'center',
    },
    directeurSection: {
      padding: '3rem 2.5rem',
      textAlign: 'center',
    },
    footer: {
      backgroundColor: '#2563eb',
      color: 'white',
      textAlign: 'center',
      padding: '1.5rem',
    },
    socialLinks: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginTop: '0.5rem',
    },
    loginOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(5px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },

  };

  return (
    <div>
    {/* Navigation */}
    <nav style={styles.nav}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={logo} alt="Logo" style={styles.logo} />
      </div>
      <ul style={styles.navList}>
        <li style={styles.navItem}><a href="#" style={styles.navLink} onClick={(e) => { e.preventDefault(); setShowLogin(true); }}>Actualité</a></li>
        <li style={styles.navItem}><a href="#" style={styles.navLink} onClick={(e) => { e.preventDefault(); setShowLogin(true); }}>Examens</a></li>
        <li style={styles.navItem}><a href="#" style={styles.navLink} onClick={(e) => { e.preventDefault(); setShowLogin(true); }}>Emplois du temps</a></li>
        <li style={styles.navItem}><a href="#" style={styles.navLink} onClick={(e) => { e.preventDefault(); setShowLogin(true); }}>Événements</a></li>
        <li style={styles.navItem}><a href="#" style={styles.navLink} onClick={(e) => { e.preventDefault(); setShowLogin(true); }}>About</a></li>
      </ul>

      <div style={{ display: 'flex', gap: '10px' }}>
        {/* Bouton de login/logout étudiant */}
        {!isLoggedIn ? (
          <button
            style={styles.loginButton}
            onClick={() => setShowLogin(true)}
          >
            Login Étudiant
          </button>
        ) : (
          <button
            style={styles.loginButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        )}

        {/* Bouton de login admin */}
        <button
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/admin/login')}
        >
          Admin
        </button>
      </div>
    </nav>

    {/* Modal de login */}
    {showLogin && (
      <Login
        onClose={() => setShowLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    )}

    {/* Hero Section */}
    <section style={styles.heroSection}>
      <div style={styles.heroText}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color:'white'}}>Bienvenue sur le site officiel de l'ENSA Béni Mellal !</h1>
        <button
          style={styles.contactButton}
          onClick={() => setShowLogin(true)}
        >
          Contactez-nous
        </button>
      </div>
      <img src={heroImage} alt="Hero" style={styles.heroImage} />
    </section>

      {/* Services Section */}
      <section style={styles.servicesSection}>
        <div style={styles.servicesGrid}>
          {[{
            icon: <FileText className="w-6 h-6" />,
            title: "Examens",
            description: "Au-delà de l'épreuve : un pas vers votre carrière"
          }, {
            icon: <Calendar className="w-6 h-6" />,
            title: "Événements",
            description: "Au cœur de l'innovation et du savoir : les événements de l'ENSA Beni Mellal"
          }, {
            icon: <Clock className="w-6 h-6" />,
            title: "Emplois du temps",
            description: "Planifiez votre semaine pour un maximum de productivité"
          }].map((service, index) => (
            <div key={index} style={styles.serviceCard}>
              <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {service.icon} {service.title}
              </h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>{service.description}</p>
              <button
                style={styles.serviceButton}
                onClick={() => setShowLogin(true)}
              >
                GET STARTED →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Formations */}
      <section style={styles.formationsSection}>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Dernières formations</h2>
        <div style={styles.formationsContainer}>
          {loadingFormations ? (
            <div style={{ textAlign: 'center', gridColumn: 'span 3' }}>
              <p>Chargement des formations...</p>
            </div>
          ) : errorFormations ? (
            <div style={{ textAlign: 'center', gridColumn: 'span 3' }}>
              <p style={{ color: 'red' }}>Erreur: {errorFormations}</p>
              <p>Affichage des formations par défaut</p>

              {/* Afficher les formations par défaut en cas d'erreur */}
              <div style={styles.formationsContainer}>
                {[{
                  img: formation1,
                  title: "User Experience Design",
                  description: "Au-delà de l'épreuve : un pas vers votre carrière"
                }, {
                  img: formation2,
                  title: "Computer Science",
                  description: "Au cœur de l'innovation et du savoir : les événements de l'ENSA Beni Mellal"
                }, {
                  img: formation3,
                  title: "Business Management",
                  description: "Votre guide vers une semaine productive"
                }].map((formation, index) => (
                  <div key={index} style={styles.formationCard}>
                    <img src={formation.img} alt={formation.title} style={{ width: '100%', height: 'auto' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '1rem 0' }}>{formation.title}</h3>
                    <p style={{ color: '#666' }}>{formation.description}</p>
                    <button
                      style={styles.serviceButton}
                      onClick={() => setShowLogin(true)}
                    >
                      S'INSCRIRE →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : formations.length > 0 ? (
            formations.map((formation, index) => (
              <div key={formation._id || index} style={styles.formationCard}>
                <img
                  src={formation.imageUrl}
                  alt={formation.title}
                  style={{ width: '100%', height: 'auto' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    // Utiliser une image par défaut en cas d'erreur
                    if (index === 0) e.target.src = formation1;
                    else if (index === 1) e.target.src = formation2;
                    else e.target.src = formation3;
                  }}
                />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '1rem 0' }}>{formation.title}</h3>
                <p style={{ color: '#666' }}>{formation.description}</p>
                {formation.instructor && (
                  <p style={{ color: '#666', fontStyle: 'italic', marginTop: '0.5rem' }}>
                    Par: {formation.instructor}
                  </p>
                )}
                {formation.duration && (
                  <p style={{ color: '#666', marginTop: '0.5rem' }}>
                    Durée: {formation.duration}
                  </p>
                )}
                <button
                  style={styles.serviceButton}
                  onClick={() => setShowLogin(true)}
                >
                  S'INSCRIRE →
                </button>
              </div>
            ))
          ) : (
            // Si aucune formation n'est disponible, afficher les formations par défaut
            [{
              img: formation1,
              title: "User Experience Design",
              description: "Au-delà de l'épreuve : un pas vers votre carrière"
            }, {
              img: formation2,
              title: "Computer Science",
              description: "Au cœur de l'innovation et du savoir : les événements de l'ENSA Beni Mellal"
            }, {
              img: formation3,
              title: "Business Management",
              description: "Votre guide vers une semaine productive"
            }].map((formation, index) => (
              <div key={index} style={styles.formationCard}>
                <img src={formation.img} alt={formation.title} style={{ width: '100%', height: 'auto' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '1rem 0' }}>{formation.title}</h3>
                <p style={{ color: '#666' }}>{formation.description}</p>
                <button
                  style={styles.serviceButton}
                  onClick={() => setShowLogin(true)}
                >
                  S'INSCRIRE →
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Message du directeur */}
      <section style={styles.directeurSection}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Mot du directeur</h2>
        <div style={{ display: 'flex', alignItems: 'flex-start', width: '70%', margin: '0 auto', textAlign: 'center' }}>
          <img src={directeurImage} alt="Directeur" style={{ width: '199px', height: '199px', borderRadius: '50%', marginRight: '1.5rem' }} />
          <p style={{ color: '#666', marginTop: '1rem' }}>
            "L'ENSA Béni Mellal est un établissement public de l'Université Sultan Moulay Slimane (USMS). Elle forme des ingénieurs capables de s'adapter aux évolutions technologiques et aux besoins du marché."
            <br /><strong>PR. BELAID BOUIKHALENE, Directeur de L'ENSABM</strong>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.3)', width: '100%', marginBottom: '1rem' }}></div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.875rem' }}>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); setShowLogin(true); }}>About</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); setShowLogin(true); }}>Contact us</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); setShowLogin(true); }}>FAQs</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); setShowLogin(true); }}>Terms and conditions</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); setShowLogin(true); }}>Privacy</a>
        </div>
        <div style={styles.socialLinks}>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowLogin(true); }} style={{ color: 'white' }}>
            <Facebook className="w-6 h-6" />
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowLogin(true); }} style={{ color: 'white' }}>
            <Instagram className="w-6 h-6" />
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowLogin(true); }} style={{ color: 'white' }}>
            <Twitter className="w-6 h-6" />
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowLogin(true); }} style={{ color: 'white' }}>
            <Linkedin className="w-6 h-6" />
          </a>
        </div>
        <p style={{ fontSize: '0.875rem', opacity: '0.8', marginTop: '1rem' }}>Copyright © 2025 - ENSABM</p>
      </footer>
    </div>
  );
};

export default Accueil;