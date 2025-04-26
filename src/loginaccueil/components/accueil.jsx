import React, { useState, useEffect } from 'react';
import {
  FileText, Calendar, Clock, Facebook, Instagram, Twitter, Linkedin,
  Bell, BookOpen, AlarmClock, Info, LogIn, LogOut, UserCog,
  GraduationCap, Users, Timer, Award, ArrowRight, User,
  ChevronRight, Play, School, Building, BookOpen as Book, Lightbulb
} from "lucide-react";
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
  const [showAbout, setShowAbout] = useState(false); // Nouvel état pour la modal À propos
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formations, setFormations] = useState([]);
  const [filieres, setFilieres] = useState([]); // Nouvel état pour les filières
  const [loadingFilieres, setLoadingFilieres] = useState(false); // État de chargement des filières
  const [errorFilieres, setErrorFilieres] = useState(null); // État d'erreur pour les filières
  const [loadingFormations, setLoadingFormations] = useState(false);
  const [errorFormations, setErrorFormations] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [statistics, setStatistics] = useState({
    students: 0,
    filieres: 0,
    professors: 0,
    modules: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);
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

  // Effet pour détecter le défilement et afficher/masquer le bouton "Retour en haut"
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Nettoyage de l'écouteur d'événement
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fonction pour remonter en haut de la page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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

  // Récupérer les statistiques depuis l'API
  useEffect(() => {
    const fetchStatistics = async () => {
      setLoadingStats(true);
      try {
        console.log('Tentative de récupération des statistiques...');
        const response = await fetch('http://localhost:5000/api/statistics/home');
        console.log('Réponse statistiques reçue:', response.status);

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Statistiques reçues:', data);

        setStatistics(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        // En cas d'erreur, on garde les valeurs par défaut
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStatistics();
  }, []);

  // Récupérer les filières depuis l'API
  useEffect(() => {
    const fetchFilieres = async () => {
      // Ne récupérer les filières que lorsque la modal est ouverte
      if (!showAbout) return;

      setLoadingFilieres(true);
      setErrorFilieres(null);

      try {
        console.log('Tentative de récupération des filières...');
        const response = await fetch('http://localhost:5000/api/filieres');
        console.log('Réponse filières reçue:', response.status);

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Filières reçues:', data);

        setFilieres(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des filières:', error);
        setErrorFilieres('Impossible de charger les filières. Veuillez réessayer plus tard.');
      } finally {
        setLoadingFilieres(false);
      }
    };

    fetchFilieres();
  }, [showAbout]); // Déclencher l'effet lorsque showAbout change

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

  // Définition des animations CSS
  const animationStyles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `;

  // Injecter les animations dans le document
  useEffect(() => {
    // Créer un élément style
    const styleElement = document.createElement('style');
    styleElement.innerHTML = animationStyles;

    // Ajouter l'élément au head du document
    document.head.appendChild(styleElement);

    // Nettoyer lors du démontage du composant
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Styles JSX améliorés
  const styles = {
    nav: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 40px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
      position: 'sticky',
      top: 0,
      background: 'linear-gradient(120deg, #ffffff, #f0f7ff)',
      borderBottom: '1px solid rgba(37, 99, 235, 0.08)',
      zIndex: 100,
      transition: 'all 0.4s ease',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    },
    logo: {
      height: '80px',
      marginRight: '10px',
      transition: 'transform 0.3s ease',
    },
    navList: {
      listStyle: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    navItem: {
      margin: '0 8px',
    },
    navLink: {
      color: '#1e293b',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '0.95rem',
      padding: '8px 16px',
      borderRadius: '8px',
      position: 'relative',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      letterSpacing: '0.3px',
    },
    loginButton: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      letterSpacing: '0.3px',
    },
    closeButton: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      backgroundColor: '#e53e3e',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      padding: '5px 10px',
      cursor: 'pointer',
      zIndex: 1001,
      transition: 'background-color 0.3s ease',
    },
    heroSection: {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#f0f7ff',
      minHeight: '700px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroContainer: {
      display: 'flex',
      flexDirection: window.innerWidth < 1024 ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: '1400px',
      padding: '0 40px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 2,
    },
    heroContent: {
      flex: '1',
      maxWidth: window.innerWidth < 1024 ? '100%' : '600px',
      padding: window.innerWidth < 1024 ? '60px 0' : '0',
      textAlign: window.innerWidth < 1024 ? 'center' : 'left',
      order: window.innerWidth < 1024 ? '2' : '1',
    },
    heroImageContainer: {
      flex: '1',
      maxWidth: window.innerWidth < 1024 ? '100%' : '600px',
      position: 'relative',
      order: window.innerWidth < 1024 ? '1' : '2',
      display: 'flex',
      justifyContent: 'center',
    },
    heroTitle: {
      fontSize: window.innerWidth < 768 ? '2.5rem' : '3.5rem',
      fontWeight: '800',
      color: '#1e293b',
      marginBottom: '1.5rem',
      lineHeight: '1.2',
      position: 'relative',
    },
    heroHighlight: {
      color: '#2563eb',
      position: 'relative',
      display: 'inline-block',
    },
    heroSubtitle: {
      fontSize: '1.25rem',
      color: '#64748b',
      marginBottom: '2.5rem',
      lineHeight: '1.7',
    },
    heroButtonsContainer: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      justifyContent: window.innerWidth < 1024 ? 'center' : 'flex-start',
    },
    heroPrimaryButton: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '16px 32px',
      border: 'none',
      borderRadius: '50px',
      fontWeight: '700',
      fontSize: '1.1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)',
      position: 'relative',
      overflow: 'hidden',
      zIndex: 1,
      letterSpacing: '0.5px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    heroSecondaryButton: {
      backgroundColor: 'white',
      color: '#2563eb',
      padding: '16px 32px',
      border: '2px solid #2563eb',
      borderRadius: '50px',
      fontWeight: '700',
      fontSize: '1.1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
      position: 'relative',
      overflow: 'hidden',
      zIndex: 1,
      letterSpacing: '0.5px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    heroImage: {
      width: '100%',
      maxWidth: '550px',
      height: 'auto',
      objectFit: 'cover',
      borderRadius: '20px',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
      transform: 'perspective(1000px) rotateY(-5deg)',
      transition: 'transform 0.5s ease',
      border: '10px solid white',
    },
    heroImageDecoration: {
      position: 'absolute',
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #2563eb, #1e40af)',
      opacity: '0.1',
      zIndex: -1,
    },
    heroStats: {
      display: 'flex',
      gap: '2rem',
      marginTop: '3rem',
      flexWrap: 'wrap',
      justifyContent: window.innerWidth < 1024 ? 'center' : 'flex-start',
    },
    heroStatItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: window.innerWidth < 1024 ? 'center' : 'flex-start',
    },
    heroStatNumber: {
      fontSize: '2.5rem',
      fontWeight: '800',
      color: '#2563eb',
      marginBottom: '0.5rem',
      lineHeight: '1',
    },
    heroStatLabel: {
      fontSize: '1rem',
      color: '#64748b',
      fontWeight: '500',
    },
    servicesSection: {
      padding: '4rem 0',
      backgroundColor: '#f9fafb',
    },
    servicesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
      padding: '0 10%',
    },
    serviceCard: {
      backgroundColor: 'white',
      padding: '2.5rem',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
      textAlign: 'center',
      transition: 'all 0.5s ease',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      position: 'relative',
      overflow: 'hidden',
      zIndex: 1,
    },
    serviceButton: {
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '30px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      boxShadow: '0 5px 15px rgba(37, 99, 235, 0.2)',
      position: 'relative',
      overflow: 'hidden',
      zIndex: 1,
      letterSpacing: '0.5px',
      marginTop: '10px',
    },
    formationsSection: {
      padding: '6rem 0',
      backgroundColor: '#f8fafc',
      position: 'relative',
      overflow: 'hidden',
    },
    formationsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2.5rem',
      padding: '0 10%',
      position: 'relative',
      zIndex: 2,
    },
    formationButton: {
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '30px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 5px 15px rgba(37, 99, 235, 0.2)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      letterSpacing: '0.5px',
      width: 'fit-content',
    },
    formationCard: {
      textAlign: 'left',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.5s ease',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      backgroundColor: 'white',
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '0 0 25px 0',
    },
    formationImage: {
      width: '100%',
      height: '220px',
      objectFit: 'cover',
      transition: 'transform 0.8s ease',
      borderTopLeftRadius: '20px',
      borderTopRightRadius: '20px',
    },
    formationContent: {
      padding: '25px 25px 15px',
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
    },
    formationBadge: {
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      marginBottom: '15px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    formationTitle: {
      fontSize: '1.4rem',
      fontWeight: 'bold',
      marginBottom: '12px',
      color: '#1e293b',
      lineHeight: '1.3',
    },
    formationDescription: {
      color: '#64748b',
      marginBottom: '20px',
      lineHeight: '1.6',
      fontSize: '0.95rem',
    },
    formationMeta: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
      color: '#64748b',
      fontSize: '0.9rem',
    },
    formationFooter: {
      padding: '0 25px',
      marginTop: 'auto',
    },
    directeurSection: {
      padding: '5rem 3rem',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #f9fafb 0%, #eef2ff 100%)',
      borderRadius: '20px',
      margin: '0 10% 5rem 10%',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(37, 99, 235, 0.1)',
      position: 'relative',
      overflow: 'hidden',
    },
    footer: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '3rem 2rem 2rem',
      position: 'relative',
      boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.1)',
    },
    socialLinks: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1.5rem',
      marginTop: '1rem',
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
    scrollTopButton: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: '#2563eb',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
      zIndex: 99,
      border: 'none',
      transition: 'all 0.3s ease',
      opacity: 0,
      transform: 'translateY(20px)',
    },
  };

  return (
    <div>
    {/* Navigation */}
    <nav style={styles.nav}>
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}>
        <img
          src={logo}
          alt="Logo"
          style={styles.logo}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
      </div>
      <ul style={styles.navList}>
        <li style={styles.navItem}>
          <a
            href="#"
            style={{
              ...styles.navLink
            }}
            onClick={(e) => {
              e.preventDefault();
              setShowLogin(true);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.08)';
              e.currentTarget.style.color = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#1e293b';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Bell size={18} strokeWidth={2.5} />
            Actualité
          </a>
        </li>
        <li style={styles.navItem}>
          <a
            href="#"
            style={{
              ...styles.navLink
            }}
            onClick={(e) => {
              e.preventDefault();
              setShowLogin(true);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.08)';
              e.currentTarget.style.color = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#1e293b';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <BookOpen size={18} strokeWidth={2.5} />
            Examens
          </a>
        </li>
        <li style={styles.navItem}>
          <a
            href="#"
            style={{
              ...styles.navLink
            }}
            onClick={(e) => {
              e.preventDefault();
              setShowLogin(true);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.08)';
              e.currentTarget.style.color = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#1e293b';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <AlarmClock size={18} strokeWidth={2.5} />
            Emplois du temps
          </a>
        </li>
        <li style={styles.navItem}>
          <a
            href="#"
            style={{
              ...styles.navLink
            }}
            onClick={(e) => {
              e.preventDefault();
              setShowLogin(true);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.08)';
              e.currentTarget.style.color = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#1e293b';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Calendar size={18} strokeWidth={2.5} />
            Événements
          </a>
        </li>
        <li style={styles.navItem}>
          <a
            href="#"
            style={{
              ...styles.navLink
            }}
            onClick={(e) => {
              e.preventDefault();
              setShowAbout(true); // Ouvrir la modal À propos au lieu du login
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.08)';
              e.currentTarget.style.color = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#1e293b';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Info size={18} strokeWidth={2.5} />
            À propos
          </a>
        </li>
      </ul>

      <div style={{ display: 'flex', gap: '10px' }}>
        {/* Bouton de login/logout étudiant */}
        {!isLoggedIn ? (
          <button
            style={styles.loginButton}
            onClick={() => setShowLogin(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e40af';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(37, 99, 235, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15)';
            }}
          >
            <LogIn size={18} strokeWidth={2.5} />
            Espace Étudiant
          </button>
        ) : (
          <button
            style={styles.loginButton}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e40af';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(37, 99, 235, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15)';
            }}
          >
            <LogOut size={18} strokeWidth={2.5} />
            Déconnexion
          </button>
        )}

        {/* Bouton de login admin */}
        <button
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            letterSpacing: '0.3px'
          }}
          onClick={() => navigate('/admin/login')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#b91c1c';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(220, 38, 38, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.2)';
          }}
        >
          <UserCog size={18} strokeWidth={2.5} />
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

    {/* Modal À propos */}
    {showAbout && (
      <div
        onClick={() => setShowAbout(false)} // Fermer la modal en cliquant à l'extérieur
        style={{
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
          animation: 'fadeIn 0.3s ease',
        }}>
        <div
          onClick={(e) => e.stopPropagation()} // Empêcher la propagation du clic
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '85vh',
            overflow: 'auto',
            position: 'relative',
            animation: 'slideUp 0.4s ease',
          }}>
          {/* Bouton de fermeture */}
          <button
            onClick={() => setShowAbout(false)}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Contenu de la modal */}
          <div style={{ padding: '40px' }}>
            <header style={{
              textAlign: 'center',
              marginBottom: '30px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              paddingBottom: '20px',
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#2563eb',
                marginBottom: '10px',
              }}>
                À propos de l'ENSA Béni Mellal
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#64748b',
                maxWidth: '700px',
                margin: '0 auto',
              }}>
                L'École Nationale des Sciences Appliquées de Béni Mellal est un établissement d'excellence dédié à la formation d'ingénieurs hautement qualifiés.
              </p>
            </header>

            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
              gap: '30px',
              marginBottom: '30px',
            }}>
              {/* Colonne de gauche */}
              <div>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <School size={22} color="#2563eb" />
                  Notre Mission
                </h3>
                <p style={{
                  fontSize: '1rem',
                  lineHeight: '1.7',
                  color: '#4b5563',
                  marginBottom: '25px',
                }}>
                  L'ENSA de Béni Mellal a pour mission de former des ingénieurs polyvalents, créatifs et responsables,
                  capables de relever les défis technologiques et scientifiques du monde moderne. Nous nous engageons
                  à offrir une formation de qualité qui allie théorie et pratique, tout en favorisant l'innovation et
                  l'esprit entrepreneurial.
                </p>

                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <Lightbulb size={22} color="#2563eb" />
                  Notre Vision
                </h3>
                <p style={{
                  fontSize: '1rem',
                  lineHeight: '1.7',
                  color: '#4b5563',
                  marginBottom: '25px',
                }}>
                  Devenir un centre d'excellence reconnu internationalement dans la formation d'ingénieurs et la recherche
                  scientifique, contribuant activement au développement socio-économique du Maroc et à l'innovation
                  technologique à l'échelle mondiale.
                </p>
              </div>

              {/* Colonne de droite */}
              <div>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <Award size={22} color="#2563eb" />
                  Nos Valeurs
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '15px',
                  marginBottom: '25px',
                }}>
                  {[
                    { name: 'Excellence', desc: 'Viser constamment le plus haut niveau de qualité dans tous nos programmes' },
                    { name: 'Innovation', desc: 'Encourager la créativité et l\'exploration de nouvelles idées' },
                    { name: 'Intégrité', desc: 'Agir avec honnêteté, transparence et respect dans toutes nos interactions' },
                    { name: 'Collaboration', desc: 'Favoriser le travail d\'équipe et les partenariats stratégiques' }
                  ].map((value, index) => (
                    <div key={index} style={{
                      padding: '15px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(37, 99, 235, 0.05)',
                      border: '1px solid rgba(37, 99, 235, 0.1)',
                    }}>
                      <h4 style={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: '#2563eb',
                        marginBottom: '5px',
                      }}>
                        {value.name}
                      </h4>
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#64748b',
                        lineHeight: '1.5',
                      }}>
                        {value.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <Building size={22} color="#2563eb" />
                  Notre Campus
                </h3>
                <p style={{
                  fontSize: '1rem',
                  lineHeight: '1.7',
                  color: '#4b5563',
                }}>
                  Situé à Béni Mellal, notre campus moderne offre un environnement propice à l'apprentissage et à
                  l'épanouissement personnel. Il dispose d'infrastructures de qualité, notamment des laboratoires
                  équipés des dernières technologies, des espaces de travail collaboratif, une bibliothèque riche
                  et des installations sportives.
                </p>
              </div>
            </div>

            {/* Section Filières */}
            <div style={{
              marginTop: '20px',
              backgroundColor: 'rgba(37, 99, 235, 0.03)',
              padding: '25px',
              borderRadius: '12px',
              border: '1px solid rgba(37, 99, 235, 0.1)',
            }}>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: 'bold',
                color: '#1e293b',
                marginBottom: '20px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}>
                <GraduationCap size={22} color="#2563eb" />
                Nos Filières de Formation
              </h3>

              {/* Indicateur de chargement */}
              {loadingFilieres && (
                <div style={{
                  textAlign: 'center',
                  padding: '30px 0',
                }}>
                  <div style={{
                    display: 'inline-block',
                    width: '40px',
                    height: '40px',
                    border: '4px solid rgba(37, 99, 235, 0.1)',
                    borderTopColor: '#2563eb',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}></div>
                  <p style={{
                    marginTop: '15px',
                    color: '#64748b',
                    fontSize: '0.95rem',
                  }}>
                    Chargement des filières...
                  </p>
                </div>
              )}

              {/* Message d'erreur */}
              {errorFilieres && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginBottom: '20px',
                }}>
                  <p>{errorFilieres}</p>
                </div>
              )}

              {/* Affichage des filières */}
              {!loadingFilieres && !errorFilieres && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
                  gap: '20px',
                }}>
                  {filieres.length > 0 ? (
                    filieres.map((filiere, index) => (
                      <div key={index} style={{
                        padding: '20px',
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 12px 25px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.backgroundColor = 'white';
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '15px',
                          gap: '15px',
                        }}>
                          <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            flexShrink: 0,
                          }}>
                            {filiere.code.toUpperCase()}
                          </div>
                          <div>
                            <h4 style={{
                              fontSize: '1.1rem',
                              fontWeight: '700',
                              color: '#1e293b',
                              marginBottom: '5px',
                            }}>
                              {filiere.nom}
                            </h4>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                            }}>
                              <span style={{
                                fontSize: '0.85rem',
                                color: '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}>
                                <BookOpen size={14} />
                                {filiere.stats.modules || 0} modules
                              </span>
                            </div>
                          </div>
                        </div>
                        <p style={{
                          fontSize: '0.95rem',
                          lineHeight: '1.6',
                          color: '#64748b',
                          flex: '1',
                          marginBottom: '15px',
                        }}>
                          {filiere.description}
                        </p>
                        <div style={{
                          marginTop: 'auto',
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}>
                          <button style={{
                            backgroundColor: 'transparent',
                            color: '#2563eb',
                            border: 'none',
                            padding: '8px 0',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#1e40af';
                            e.currentTarget.style.transform = 'translateX(5px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#2563eb';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}>
                            En savoir plus <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      padding: '30px',
                      backgroundColor: 'rgba(37, 99, 235, 0.05)',
                      borderRadius: '8px',
                      color: '#64748b',
                    }}>
                      <p>Aucune filière disponible pour le moment.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Ajouter l'animation de rotation */}
              <style dangerouslySetInnerHTML={{
                __html: `
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `
              }} />
            </div>

            {/* Pied de page */}
            <footer style={{
              marginTop: '40px',
              textAlign: 'center',
              padding: '20px 0 0',
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            }}>
              <p style={{
                fontSize: '0.95rem',
                color: '#64748b',
              }}>
                Pour plus d'informations, n'hésitez pas à nous contacter ou à visiter notre campus.
              </p>
              <button
                onClick={() => setShowAbout(false)}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 25px',
                  marginTop: '15px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e40af';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Retour à l'accueil
              </button>
            </footer>
          </div>
        </div>
      </div>
    )}

    {/* Hero Section */}
    <section style={styles.heroSection}>
      {/* Cercles décoratifs */}
      <div style={{
        ...styles.heroImageDecoration,
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
      }}></div>
      <div style={{
        ...styles.heroImageDecoration,
        bottom: '15%',
        right: '10%',
        width: '200px',
        height: '200px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      }}></div>

      <div style={styles.heroContainer}>
        {/* Contenu textuel */}
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Bienvenue à l'<span style={styles.heroHighlight}>ENSA</span> de Béni Mellal
          </h1>
          <p style={styles.heroSubtitle}>
            L'École Nationale des Sciences Appliquées forme les ingénieurs de demain dans un environnement d'excellence académique et d'innovation technologique.
          </p>

          <div style={styles.heroButtonsContainer}>
            <button
              style={styles.heroPrimaryButton}
              onClick={() => setShowLogin(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1e40af';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(37, 99, 235, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.3)';
              }}
            >
              <LogIn size={20} />
              Espace Étudiant
            </button>

            <button
              style={styles.heroSecondaryButton}
              onClick={() => {
                // Faire défiler jusqu'à la section des formations
                const formationsSection = document.querySelector('[style*="formationsSection"]');
                if (formationsSection) {
                  formationsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f7ff';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.05)';
              }}
            >
              <School size={20} />
              Nos Formations
            </button>
          </div>

          <div style={styles.heroStats}>
            <div style={styles.heroStatItem}>
              <span style={styles.heroStatNumber}>
                {loadingStats ? (
                  <span style={{ fontSize: '1.5rem' }}>...</span>
                ) : (
                  `${statistics.students}+`
                )}
              </span>
              <span style={styles.heroStatLabel}>Étudiants</span>
            </div>
            <div style={styles.heroStatItem}>
              <span style={styles.heroStatNumber}>
                {loadingStats ? (
                  <span style={{ fontSize: '1.5rem' }}>...</span>
                ) : (
                  statistics.filieres
                )}
              </span>
              <span style={styles.heroStatLabel}>Filières</span>
            </div>
            <div style={styles.heroStatItem}>
              <span style={styles.heroStatNumber}>
                {loadingStats ? (
                  <span style={{ fontSize: '1.5rem' }}>...</span>
                ) : (
                  `${statistics.professors}+`
                )}
              </span>
              <span style={styles.heroStatLabel}>Professeurs</span>
            </div>
            <div style={styles.heroStatItem}>
              <span style={styles.heroStatNumber}>
                {loadingStats ? (
                  <span style={{ fontSize: '1.5rem' }}>...</span>
                ) : (
                  statistics.modules
                )}
              </span>
              <span style={styles.heroStatLabel}>Modules</span>
            </div>
          </div>
        </div>

        {/* Image */}
        <div style={styles.heroImageContainer}>
          <img
            src={heroImage}
            alt="ENSA Béni Mellal"
            style={styles.heroImage}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateY(-5deg)';
            }}
          />

          {/* Badge décoratif */}
          <div style={{
            position: 'absolute',
            bottom: '30px',
            right: '-20px',
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '15px',
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 3,
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#ebf5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
            }}>
              <GraduationCap size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#1e293b' }}>Excellence</div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Académique</div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Services Section */}
      <section style={styles.servicesSection}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          color: '#2d3748'
        }}>
          Nos Services
        </h2>
        <div style={styles.servicesGrid}>
          {[{
            icon: <FileText size={24} />,
            title: "Examens",
            description: "Au-delà de l'épreuve : un pas vers votre carrière"
          }, {
            icon: <Calendar size={24} />,
            title: "Événements",
            description: "Au cœur de l'innovation et du savoir : les événements de l'ENSA Beni Mellal"
          }, {
            icon: <Clock size={24} />,
            title: "Emplois du temps",
            description: "Planifiez votre semaine pour un maximum de productivité"
          }].map((service, index) => (
            <div
              key={index}
              style={styles.serviceCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-15px) rotateX(5deg)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(37, 99, 235, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.3)';

                // Ajouter un effet de brillance
                const shine = document.createElement('div');
                shine.style.position = 'absolute';
                shine.style.top = '0';
                shine.style.left = '0';
                shine.style.width = '100%';
                shine.style.height = '100%';
                shine.style.background = 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)';
                shine.style.transform = 'translateX(-100%)';
                shine.style.transition = 'transform 0.6s ease';
                shine.style.zIndex = '0';
                shine.className = 'card-shine';
                e.currentTarget.appendChild(shine);

                // Animation de la brillance
                setTimeout(() => {
                  shine.style.transform = 'translateX(100%)';
                }, 10);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) rotateX(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';

                // Supprimer l'effet de brillance
                const shine = e.currentTarget.querySelector('.card-shine');
                if (shine) {
                  shine.remove();
                }
              }}
            >
              <div style={{
                backgroundColor: '#ebf5ff',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                color: '#2563eb'
              }}>
                {service.icon}
              </div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: '#2d3748'
              }}>
                {service.title}
              </h2>
              <p style={{
                color: '#718096',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                {service.description}
              </p>
              <button
                style={styles.serviceButton}
                onClick={() => setShowLogin(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e40af';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(37, 99, 235, 0.3)';
                  e.currentTarget.style.paddingLeft = '30px';
                  e.currentTarget.style.paddingRight = '18px';

                  // Ajouter un effet de brillance
                  const shine = document.createElement('div');
                  shine.style.position = 'absolute';
                  shine.style.top = '0';
                  shine.style.left = '0';
                  shine.style.width = '100%';
                  shine.style.height = '100%';
                  shine.style.background = 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)';
                  shine.style.transform = 'translateX(-100%)';
                  shine.style.transition = 'transform 0.6s ease';
                  shine.style.zIndex = '0';
                  shine.className = 'button-shine';
                  e.currentTarget.appendChild(shine);

                  // Animation de la brillance
                  setTimeout(() => {
                    shine.style.transform = 'translateX(100%)';
                  }, 10);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(37, 99, 235, 0.2)';
                  e.currentTarget.style.paddingLeft = '24px';
                  e.currentTarget.style.paddingRight = '24px';

                  // Supprimer l'effet de brillance
                  const shine = e.currentTarget.querySelector('.button-shine');
                  if (shine) {
                    shine.remove();
                  }
                }}
              >
                DÉCOUVRIR →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Formations */}
      <section style={styles.formationsSection}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            color: '#2563eb',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '1rem',
            letterSpacing: '0.5px'
          }}>
            EXCELLENCE ACADÉMIQUE
          </span>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#1e293b',
            position: 'relative',
            display: 'inline-block'
          }}>
            Nos Formations
            <span style={{
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px',
              height: '4px',
              backgroundColor: '#2563eb',
              borderRadius: '2px'
            }}></span>
          </h2>
          <p style={{
            color: '#64748b',
            fontSize: '1.1rem',
            maxWidth: '700px',
            margin: '1.5rem auto 0',
            lineHeight: '1.6'
          }}>
            Découvrez nos programmes d'ingénierie de pointe conçus pour former les leaders de demain
          </p>
        </div>
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
                  title: "Génie Informatique",
                  description: "Formation d'excellence en développement logiciel, intelligence artificielle et sécurité informatique",
                  badge: "IACS",
                  badgeColor: "#2563eb",
                  badgeBg: "rgba(37, 99, 235, 0.1)",
                  duration: "3 ans",
                  students: "120 étudiants"
                }, {
                  img: formation2,
                  title: "Génie Industriel",
                  description: "Maîtrisez les processus industriels, l'automatisation et la gestion de production",
                  badge: "G2ER",
                  badgeColor: "#059669",
                  badgeBg: "rgba(5, 150, 105, 0.1)",
                  duration: "3 ans",
                  students: "90 étudiants"
                }, {
                  img: formation3,
                  title: "Génie Civil",
                  description: "Conception, réalisation et maintenance des infrastructures et bâtiments modernes",
                  badge: "TDI",
                  badgeColor: "#d97706",
                  badgeBg: "rgba(217, 119, 6, 0.1)",
                  duration: "3 ans",
                  students: "100 étudiants"
                }].map((formation, index) => (
                  <div
                    key={index}
                    style={styles.formationCard}
                    onMouseEnter={(e) => {
                      // Effet de zoom sur l'image
                      const img = e.currentTarget.querySelector('img');
                      if (img) img.style.transform = 'scale(1.05)';

                      // Effet d'élévation sur la carte
                      e.currentTarget.style.transform = 'translateY(-10px)';
                      e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      // Réinitialiser l'effet de zoom
                      const img = e.currentTarget.querySelector('img');
                      if (img) img.style.transform = 'scale(1)';

                      // Réinitialiser l'effet d'élévation
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.08)';
                    }}
                  >
                    <div style={{ overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={formation.img}
                        alt={formation.title}
                        style={styles.formationImage}
                      />
                    </div>

                    <div style={styles.formationContent}>
                      <span style={{
                        ...styles.formationBadge,
                        backgroundColor: formation.badgeBg,
                        color: formation.badgeColor
                      }}>
                        {formation.badge}
                      </span>

                      <h3 style={styles.formationTitle}>{formation.title}</h3>
                      <p style={styles.formationDescription}>{formation.description}</p>

                      <div style={styles.formationMeta}>
                        <Timer size={16} style={{ marginRight: '6px' }} />
                        <span style={{ marginRight: '15px' }}>{formation.duration}</span>
                        <Users size={16} style={{ marginRight: '6px' }} />
                        <span>{formation.students}</span>
                      </div>
                    </div>

                    <div style={styles.formationFooter}>
                      <button
                        style={styles.formationButton}
                        onClick={() => setShowLogin(true)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1e40af';
                          e.currentTarget.style.transform = 'translateX(5px)';
                          e.currentTarget.style.boxShadow = '0 10px 20px rgba(37, 99, 235, 0.25)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = '0 5px 15px rgba(37, 99, 235, 0.2)';
                        }}
                      >
                        <span>S'inscrire</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : formations.length > 0 ? (
            formations.map((formation, index) => {
              // Déterminer la couleur du badge en fonction de la filière
              let badgeColor = "#2563eb";
              let badgeBg = "rgba(37, 99, 235, 0.1)";

              if (formation.filiere && formation.filiere.toLowerCase) {
                const filiere = formation.filiere.toLowerCase();
                if (filiere.includes('g2er')) {
                  badgeColor = "#059669";
                  badgeBg = "rgba(5, 150, 105, 0.1)";
                } else if (filiere.includes('tdi')) {
                  badgeColor = "#d97706";
                  badgeBg = "rgba(217, 119, 6, 0.1)";
                } else if (filiere.includes('aa')) {
                  badgeColor = "#7c3aed";
                  badgeBg = "rgba(124, 58, 237, 0.1)";
                }
              }

              return (
                <div
                  key={formation._id || index}
                  style={styles.formationCard}
                  onMouseEnter={(e) => {
                    // Effet de zoom sur l'image
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(1.05)';

                    // Effet d'élévation sur la carte
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    // Réinitialiser l'effet de zoom
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(1)';

                    // Réinitialiser l'effet d'élévation
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  <div style={{ overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={formation.imageUrl}
                      alt={formation.title}
                      style={styles.formationImage}
                      onError={(e) => {
                        e.target.onerror = null;
                        // Utiliser une image par défaut en cas d'erreur
                        if (index === 0) e.target.src = formation1;
                        else if (index === 1) e.target.src = formation2;
                        else e.target.src = formation3;
                      }}
                    />
                  </div>

                  <div style={styles.formationContent}>
                    <span style={{
                      ...styles.formationBadge,
                      backgroundColor: badgeBg,
                      color: badgeColor
                    }}>
                      {formation.filiere ? formation.filiere.toUpperCase() : 'FORMATION'}
                    </span>

                    <h3 style={styles.formationTitle}>{formation.title}</h3>
                    <p style={styles.formationDescription}>{formation.description}</p>

                    <div style={{ marginTop: 'auto' }}>
                      {formation.instructor && (
                        <div style={styles.formationMeta}>
                          <User size={16} style={{ marginRight: '6px' }} />
                          <span>{formation.instructor}</span>
                        </div>
                      )}

                      {formation.duration && (
                        <div style={styles.formationMeta}>
                          <Timer size={16} style={{ marginRight: '6px' }} />
                          <span>{formation.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={styles.formationFooter}>
                    <button
                      style={styles.formationButton}
                      onClick={() => setShowLogin(true)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1e40af';
                        e.currentTarget.style.transform = 'translateX(5px)';
                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(37, 99, 235, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(37, 99, 235, 0.2)';
                      }}
                    >
                      <span>S'inscrire</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })
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
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            color: '#2563eb',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '1rem',
            letterSpacing: '0.5px'
          }}>
            LEADERSHIP
          </span>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#1e293b',
            position: 'relative',
            display: 'inline-block'
          }}>
            Mot du directeur
            <span style={{
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px',
              height: '4px',
              backgroundColor: '#2563eb',
              borderRadius: '2px'
            }}></span>
          </h2>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          width: '90%',
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'left',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            position: 'relative',
            marginRight: window.innerWidth < 768 ? '0' : '3rem',
            marginBottom: window.innerWidth < 768 ? '2rem' : '0'
          }}>
            {/* Cercles décoratifs */}
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '-15px',
              width: '250px',
              height: '250px',
              borderRadius: '50%',
              border: '2px dashed rgba(37, 99, 235, 0.2)',
              zIndex: -1
            }}></div>

            <div style={{
              position: 'relative',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #1e40af)',
              padding: '5px',
              boxShadow: '0 15px 35px rgba(37, 99, 235, 0.2)'
            }}>
              <img
                src={directeurImage}
                alt="Directeur"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid white'
                }}
              />
            </div>

            {/* Badge */}
            <div style={{
              position: 'absolute',
              bottom: '5px',
              right: '-10px',
              backgroundColor: 'white',
              color: '#2563eb',
              borderRadius: '12px',
              padding: '8px 15px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
                <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                <path d="M12 2v2"></path>
                <path d="M12 22v-2"></path>
                <path d="m17 20.66-1-1.73"></path>
                <path d="M11 10.27 7 3.34"></path>
                <path d="m20.66 17-1.73-1"></path>
                <path d="m3.34 7 1.73 1"></path>
                <path d="M14 12h8"></path>
                <path d="M2 12h2"></path>
                <path d="m20.66 7-1.73 1"></path>
                <path d="m3.34 17 1.73-1"></path>
                <path d="m17 3.34-1 1.73"></path>
                <path d="m7 20.66 1-1.73"></path>
              </svg>
              Directeur
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            position: 'relative'
          }}>
            {/* Guillemets décoratifs */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(37, 99, 235, 0.1)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 0
              }}
            >
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
            </svg>

            <p style={{
              color: '#4a5568',
              fontSize: '1.1rem',
              lineHeight: '1.8',
              fontStyle: 'italic',
              position: 'relative',
              zIndex: 1,
              marginBottom: '1.5rem'
            }}>
              L'ENSA Béni Mellal est un établissement public de l'Université Sultan Moulay Slimane (USMS). Elle forme des ingénieurs capables de s'adapter aux évolutions technologiques et aux besoins du marché.
              <br /><br />
              Notre mission est de préparer les étudiants à devenir des leaders dans leurs domaines respectifs et de contribuer au développement technologique et économique de notre pays.
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
              paddingTop: '1.5rem',
              marginTop: '1.5rem'
            }}>
              <div style={{
                width: '3px',
                height: '40px',
                backgroundColor: '#2563eb',
                borderRadius: '3px',
                marginRight: '15px'
              }}></div>
              <div>
                <p style={{
                  fontWeight: 'bold',
                  color: '#1e293b',
                  fontSize: '1.1rem',
                  margin: 0
                }}>
                  PR. BELAID BOUIKHALENE
                </p>
                <p style={{
                  fontWeight: 'normal',
                  fontSize: '0.9rem',
                  color: '#64748b',
                  margin: '5px 0 0 0'
                }}>
                  Directeur de L'ENSABM
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div style={{
            flex: '1',
            minWidth: '250px',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <img src={logo} alt="Logo" style={{
              height: '80px',
              marginBottom: '1rem',
              filter: 'brightness(0) invert(1)'
            }} />
            <p style={{
              fontSize: '0.95rem',
              lineHeight: '1.6',
              marginBottom: '1.5rem',
              opacity: '0.9'
            }}>
              L'École Nationale des Sciences Appliquées de Béni Mellal forme les ingénieurs de demain dans un environnement d'excellence.
            </p>
          </div>

          <div style={{
            flex: '1',
            minWidth: '250px',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: '1.2rem'
            }}>Liens rapides</h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '0.8rem' }}>
                <a
                  href="#"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    display: 'inline-block',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowLogin(true);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  → À propos
                </a>
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <a
                  href="#"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    display: 'inline-block',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowLogin(true);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  → Formations
                </a>
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <a
                  href="#"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    display: 'inline-block',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowLogin(true);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  → Événements
                </a>
              </li>
            </ul>
          </div>

          <div style={{
            flex: '1',
            minWidth: '250px',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: '1.2rem'
            }}>Contact</h3>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: '1.6',
              marginBottom: '0.8rem'
            }}>
              <strong>Adresse:</strong> BP 669, Mghila, Béni Mellal
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: '1.6',
              marginBottom: '0.8rem'
            }}>
              <strong>Téléphone:</strong> +212 523 48 02 18
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: '1.6',
              marginBottom: '1.5rem'
            }}>
              <strong>Email:</strong> contact@ensabm.ma
            </p>

            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setShowLogin(true); }}
                style={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s ease, transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setShowLogin(true); }}
                style={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s ease, transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setShowLogin(true); }}
                style={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s ease, transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setShowLogin(true); }}
                style={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s ease, transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          paddingTop: '1.5rem',
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.9rem',
            opacity: '0.8'
          }}>
            Copyright © {new Date().getFullYear()} - ENSABM. Tous droits réservés.
          </p>
        </div>
      </footer>

      {/* Bouton "Retour en haut" */}
      <button
        style={{
          ...styles.scrollTopButton,
          opacity: showScrollTop ? 1 : 0,
          transform: showScrollTop ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: showScrollTop ? 'auto' : 'none'
        }}
        onClick={scrollToTop}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1e40af';
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#2563eb';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
        }}
        aria-label="Retour en haut"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m18 15-6-6-6 6"/>
        </svg>
      </button>
    </div>
  );
};

export default Accueil;