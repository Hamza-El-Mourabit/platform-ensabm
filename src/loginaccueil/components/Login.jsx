import React, { useState, useEffect } from "react";
import Image from "../assets/images.png";
import Logo from "../assets/ENSA-BENI-MELLAL-LOGO.png";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import { FaExclamationCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Login = ({ onClose, onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [apogee, setApogee] = useState("");
  const [cin, setCin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({ apogee: "", cin: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();

  // Animation d'entrée
  useEffect(() => {
    setFadeIn(true);

    // Vérifier si les identifiants sont stockés dans localStorage
    const savedApogee = localStorage.getItem("savedApogee");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (savedApogee && savedRememberMe) {
      setApogee(savedApogee);
      setRememberMe(true);
    }
  }, []);

  // Fermer le formulaire lorsque l'utilisateur clique en dehors
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setFadeIn(false);
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    let valid = true;
    const errors = { apogee: "", cin: "" };

    if (!apogee.trim()) {
      errors.apogee = "Le numéro Apogée est requis";
      valid = false;
    } else if (!/^\d+$/.test(apogee)) {
      errors.apogee = "Le numéro Apogée doit contenir uniquement des chiffres";
      valid = false;
    }

    if (!cin.trim()) {
      errors.cin = "Le CIN est requis";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  // Gérer la touche Escape pour fermer le modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setFadeIn(false);
        setTimeout(() => {
          onClose();
        }, 300);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validation du formulaire
    if (!validateForm()) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apogee, cin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur de connexion");
      }

      // Gérer l'option "Se souvenir de moi"
      if (rememberMe) {
        localStorage.setItem("savedApogee", apogee);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("savedApogee");
        localStorage.removeItem("rememberMe");
      }

      // Stocker le token et les informations de l'utilisateur
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userData", JSON.stringify({
        id: data._id,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        filiere: data.filiere,
        annee: data.annee
      }));

      // Animation de sortie avant redirection
      setFadeIn(false);
      setTimeout(() => {
        // Appeler la fonction de succès qui gérera la redirection
        if (onLoginSuccess) {
          onLoginSuccess(data);
        }
      }, 300);
    } catch (err) {
      setError(err.message || "Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      ...styles.overlay,
      opacity: fadeIn ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out'
    }} onClick={handleOverlayClick}>
      <div style={{
        ...styles.loginMain,
        transform: fadeIn ? 'translateY(0)' : 'translateY(-20px)',
        opacity: fadeIn ? 1 : 0,
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-in-out'
      }}>
        <div style={styles.loginLeft}>
          <img src={Image} alt="Login Illustration" style={styles.loginImage} />
        </div>
        <div style={styles.loginRight}>
          <div style={styles.loginRightContainer}>
            <div style={styles.loginLogo}>
              <img src={Logo} alt="ENSA Beni Mellal Logo" style={styles.logoImage} />
            </div>
            <div style={styles.loginCenter}>
              <h2 style={styles.welcomeText}>Welcome back!</h2>
              <p style={styles.subText}>Please enter your details</p>
              {error && (
                <div style={styles.errorContainer}>
                  <FaExclamationCircle style={styles.errorIcon} />
                  <p style={styles.errorText}>{error}</p>
                </div>
              )}
              <form style={styles.loginForm} onSubmit={handleLogin}>
                <div style={styles.inputContainer}>
                  <input
                    type="text"
                    placeholder="Numéro Apogée"
                    style={{
                      ...styles.inputField,
                      borderColor: formErrors.apogee ? '#e53e3e' : '#cbd5e0',
                      transition: 'all 0.2s ease'
                    }}
                    value={apogee}
                    onChange={(e) => {
                      setApogee(e.target.value);
                      if (formErrors.apogee) {
                        setFormErrors({...formErrors, apogee: ""});
                      }
                    }}
                    required
                  />
                  {formErrors.apogee && (
                    <p style={styles.fieldError}>{formErrors.apogee}</p>
                  )}
                </div>
                <div style={styles.inputContainer}>
                  <div style={styles.passInputDiv}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="CIN"
                      style={{
                        ...styles.inputField,
                        borderColor: formErrors.cin ? '#e53e3e' : '#cbd5e0',
                        transition: 'all 0.2s ease'
                      }}
                      value={cin}
                      onChange={(e) => {
                        setCin(e.target.value);
                        if (formErrors.cin) {
                          setFormErrors({...formErrors, cin: ""});
                        }
                      }}
                      required
                    />
                    <span
                      style={styles.eyeIcon}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      role="button"
                      tabIndex="0"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {formErrors.cin && (
                    <p style={styles.fieldError}>{formErrors.cin}</p>
                  )}
                </div>

                <div style={styles.loginCenterOptions}>
                  <div style={styles.rememberDiv}>
                    <input
                      type="checkbox"
                      id="remember-checkbox"
                      style={styles.checkbox}
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label htmlFor="remember-checkbox" style={styles.checkboxLabel}>
                      Remember for 30 days
                    </label>
                  </div>
                </div>
                <div style={styles.loginCenterButtons}>
                  <button
                    type="submit"
                    style={{
                      ...styles.loginButton,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <div style={styles.loadingContainer}>
                        <div style={styles.loadingSpinner}></div>
                        <span>Connexion...</span>
                      </div>
                    ) : "Log In"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles JSX améliorés
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loginMain: {
    display: 'flex',
    backgroundColor: '#fff',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    maxWidth: '900px',
    width: '90%',
    maxHeight: '90vh',
  },
  loginLeft: {
    flex: 1,
    backgroundImage: "url('src/assets/Rectangle 4.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginImage: {
    maxWidth: '80%',
    height: 'auto',
    animation: 'float 6s ease-in-out infinite',
  },
  loginRight: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '30px',
  },
  loginRightContainer: {
    width: '100%',
    maxWidth: '400px',
  },
  loginLogo: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  logoImage: {
    width: '100px',
    height: 'auto',
    transition: 'transform 0.3s ease',
  },
  loginCenter: {
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#2d3748',
  },
  subText: {
    fontSize: '16px',
    color: '#718096',
    marginBottom: '25px',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f5',
    border: '1px solid #fed7d7',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '15px',
  },
  errorIcon: {
    color: '#e53e3e',
    marginRight: '8px',
    fontSize: '16px',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: '14px',
    margin: 0,
  },
  fieldError: {
    color: '#e53e3e',
    fontSize: '12px',
    textAlign: 'left',
    marginTop: '4px',
    marginBottom: 0,
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  inputContainer: {
    marginBottom: '5px',
  },
  inputField: {
    width: '100%',
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #cbd5e0',
    fontSize: '14px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  passInputDiv: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#718096',
    transition: 'color 0.2s',
  },
  loginCenterOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    marginTop: '5px',
  },
  rememberDiv: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  checkbox: {
    cursor: 'pointer',
    width: '16px',
    height: '16px',
    accentColor: '#2563eb',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#4a5568',
    cursor: 'pointer',
  },
  loginCenterButtons: {
    display: 'flex',
    justifyContent: 'center',
  },
  loginButton: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s, transform 0.1s',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  loadingSpinner: {
    width: '18px',
    height: '18px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTop: '3px solid white',
    animation: 'spin 1s linear infinite',
  },
};

// Ajout des animations CSS
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Login;