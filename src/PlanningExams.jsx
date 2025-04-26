import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./PlanningExams.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faSignOutAlt,
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faChalkboardTeacher,
  faBook,
  faExclamationTriangle,
  faSearch,
  faFilter,
  faSyncAlt
} from '@fortawesome/free-solid-svg-icons';

const PlanningExams = () => {
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [planningExams, setPlanningExams] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  // Récupérer les informations de l'étudiant connecté
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      setMajor(userData.filiere);
      setYear(userData.annee);
      setSubmitted(true);
      fetchPlanningExams(userData.filiere, userData.annee);
    }
  }, []);

  const fetchPlanningExams = async (filiere, annee) => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('userToken');
      const url = `http://localhost:5000/api/planning-exams/${filiere}/${annee}`;

      console.log(`Récupération du planning des examens pour ${filiere}/${annee}...`);

      // Vérifier si le token est présent
      if (!token) {
        throw new Error('Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à votre planning.');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Si le planning n'est pas trouvé (404), on crée un planning vide plutôt que d'afficher une erreur
      if (response.status === 404) {
        console.log('Aucun planning trouvé, création d\'un planning vide');
        setPlanningExams({
          filiere,
          annee,
          examens: []
        });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur de connexion au serveur' }));
        throw new Error(errorData.message || 'Erreur lors de la récupération du planning');
      }

      const data = await response.json();
      console.log('Planning récupéré:', data);

      // Vérifier que les données sont valides
      if (!data) {
        throw new Error('Données de planning invalides');
      }

      // Vérifier que le champ examens existe
      if (!data.examens) {
        console.warn('Le champ examens est manquant dans les données du planning, création d\'un tableau vide');
        data.examens = [];
      }

      // Vérifier que les examens sont bien un tableau
      if (!Array.isArray(data.examens)) {
        console.warn('Le champ examens n\'est pas un tableau, conversion en tableau vide');
        data.examens = [];
      }

      // Afficher des informations sur les examens récupérés
      console.log(`${data.examens.length} examens récupérés pour ${filiere}/${annee}`);
      if (data.examens.length > 0) {
        console.log('Premier examen:', data.examens[0]);
      }

      setPlanningExams(data);
    } catch (err) {
      console.error('Erreur lors de la récupération du planning:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (major && year) {
      setSubmitted(true);
      fetchPlanningExams(major, year);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fonction pour formater la date courte
  const formatShortDate = (dateString) => {
    const options = { day: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fonction pour formater l'heure
  const formatTime = (time) => {
    return time.substring(0, 5);
  };

  // Fonction pour retourner à la page d'accueil
  const handleReturnToHome = () => {
    navigate('/');
  };

  // Fonction pour retourner à la page d'accueil initiale
  const handleReturnToAccueil = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    navigate('/accueil');
  };

  // Fonction pour déterminer le statut d'un examen
  const getExamStatus = (dateString) => {
    const examDate = new Date(dateString);
    const today = new Date();

    // Réinitialiser les heures pour comparer uniquement les dates
    today.setHours(0, 0, 0, 0);
    const examDateOnly = new Date(examDate);
    examDateOnly.setHours(0, 0, 0, 0);

    if (examDateOnly.getTime() === today.getTime()) {
      return 'today';
    } else if (examDate > today) {
      return 'upcoming';
    } else {
      return 'past';
    }
  };

  // Fonction pour calculer le temps restant avant un examen
  const getRemainingTime = (dateString, heureDebut) => {
    const examDate = new Date(dateString);
    const today = new Date();

    // Configurer l'heure de début de l'examen
    const [hours, minutes] = heureDebut.split(':').map(Number);
    examDate.setHours(hours, minutes, 0, 0);

    // Si l'examen est déjà passé, retourner null
    if (examDate < today) {
      return null;
    }

    // Calculer la différence en millisecondes
    const diffMs = examDate - today;

    // Convertir en jours, heures, minutes
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    // Formater le résultat
    if (diffDays > 0) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''} ${diffHours}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return "Moins d'une minute";
    }
  };

  // Fonction pour obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming':
        return 'À venir';
      case 'today':
        return "Aujourd'hui";
      case 'past':
        return 'Passé';
      default:
        return '';
    }
  };

  // Fonction pour grouper les examens par date
  const groupExamsByDate = (exams) => {
    if (!exams) return {};

    const grouped = {};

    exams.forEach(exam => {
      const dateKey = new Date(exam.date).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(exam);
    });

    // Trier les dates
    return Object.keys(grouped)
      .sort()
      .reduce((obj, key) => {
        obj[key] = grouped[key];
        return obj;
      }, {});
  };

  // Filtrer les examens en fonction de la recherche, du filtre de statut et des étudiants spécifiques
  const filterExams = (exams) => {
    if (!exams) return [];

    // Récupérer l'ID de l'étudiant connecté
    let studentId = null;
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      studentId = userData ? userData._id : null;

      // Si l'ID n'est pas dans userData._id, essayer de le récupérer dans userData.id
      if (!studentId && userData && userData.id) {
        studentId = userData.id;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
    }

    return exams.filter(exam => {
      // Vérifier si l'examen est pour des étudiants spécifiques
      if (exam.pourEtudiantsSpecifiques === true && Array.isArray(exam.etudiants)) {
        // Si l'examen est pour des étudiants spécifiques, vérifier si l'étudiant connecté est dans la liste
        console.log(`Examen spécifique (client): ${exam.module}, étudiants:`, exam.etudiants);
        console.log(`ID étudiant connecté: ${studentId}`);

        if (!studentId || !exam.etudiants.includes(studentId)) {
          console.log(`L'étudiant ${studentId} n'est pas dans la liste, examen filtré`);
          return false; // L'étudiant n'est pas dans la liste, ne pas afficher cet examen
        }
        console.log(`L'étudiant ${studentId} est dans la liste, examen affiché`);
      }

      const matchesSearch = searchTerm === '' ||
        exam.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.professeur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.salle.toLowerCase().includes(searchTerm.toLowerCase());

      const status = getExamStatus(exam.date);
      const matchesFilter = filterStatus === 'all' || status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  };

  // Obtenir le nom de la filière formaté
  const getFormattedMajor = (majorCode) => {
    const majors = {
      'iacs': 'IACS',
      'aa': 'AA',
      'g2er': 'G2ER',
      'tdi': 'TDI'
    };
    return majors[majorCode] || majorCode.toUpperCase();
  };

  // Obtenir l'année formatée
  const getFormattedYear = (yearCode) => {
    const years = {
      '1': '1ère année',
      '2': '2ème année',
      '3': '3ème année'
    };
    return years[yearCode] || `${yearCode}ème année`;
  };

  return (
    <div className="page-container">
      <div className="header-actions">
        <h1>Planning des Examens</h1>
        <div className="buttons-container">
          <button className="return-btn" onClick={handleReturnToHome}>
            <FontAwesomeIcon icon={faHome} /> Accueil
          </button>
          <button className="logout-btn" onClick={handleReturnToAccueil}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Déconnexion
          </button>
        </div>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="planning-form">
          <div className="form-group">
            <label>Filière :</label>
            <select value={major} onChange={(e) => setMajor(e.target.value)} required>
              <option value="">-- Choisir la filière --</option>
              <option value="iacs">IACS</option>
              <option value="aa">AA</option>
              <option value="g2er">G2ER</option>
              <option value="tdi">TDI</option>
            </select>
          </div>

          <div className="form-group">
            <label>Année :</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} required>
              <option value="">-- Choisir l'année --</option>
              <option value="1">1ère année</option>
              <option value="2">2ème année</option>
              <option value="3">3ème année</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">Valider</button>
        </form>
      ) : (
        <div className="planning-result">
          <div className="welcome-message">
            <div className="welcome-header">
              <h2>Planning des examens - {getFormattedMajor(major)} - {getFormattedYear(year)}</h2>
              <button
                className="refresh-btn"
                onClick={() => fetchPlanningExams(major, year)}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSyncAlt} spin={loading} /> Rafraîchir
              </button>
            </div>
            <p>Consultez vos examens à venir et passés. Bonne préparation !</p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Chargement du planning des examens...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <h3><FontAwesomeIcon icon={faExclamationTriangle} /> Erreur</h3>
              <p>{error}</p>
              <p>Veuillez vérifier que :</p>
              <ul>
                <li>Le serveur backend est en cours d'exécution</li>
                <li>Votre filière et année sont correctes</li>
                <li>Vous êtes bien connecté</li>
              </ul>
            </div>
          ) : planningExams && planningExams.examens && planningExams.examens.length > 0 ? (
            <>
              <div className="filters-container">
                <div className="filter-group">
                  <span className="filter-label">Statut :</span>
                  <select
                    className="filter-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Tous</option>
                    <option value="upcoming">À venir</option>
                    <option value="today">Aujourd'hui</option>
                    <option value="past">Passés</option>
                  </select>
                </div>
                <div className="search-container">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Rechercher un module, professeur..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {Object.entries(groupExamsByDate(filterExams(planningExams.examens))).length > 0 ? (
                Object.entries(groupExamsByDate(filterExams(planningExams.examens))).map(([date, exams]) => (
                  <div key={date} className="date-group">
                    <div className="date-header">
                      <h3>{formatDate(date)}</h3>
                      <span className="date-badge">
                        {exams.length} examen{exams.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="exams-container">
                      {exams.map((exam, index) => {
                        const status = getExamStatus(exam.date);
                        const remainingTime = status !== 'past' ? getRemainingTime(exam.date, exam.debut) : null;
                        return (
                          <div key={index} className="exam-card">
                            <div className={`exam-status status-${status}`}>
                              {getStatusText(status)}
                            </div>
                            <div className="exam-card-header">
                              <h4>{exam.module}</h4>
                              {exam.pourEtudiantsSpecifiques && (
                                <span className="specific-exam-badge" title="Examen pour étudiants spécifiques">
                                  Personnalisé
                                </span>
                              )}
                            </div>
                            <div className="exam-card-body">
                              <div className="exam-info">
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                <span>{formatShortDate(exam.date)}</span>
                              </div>
                              <div className="exam-info">
                                <FontAwesomeIcon icon={faClock} />
                                <span>{formatTime(exam.debut)} - {formatTime(exam.fin)}</span>
                              </div>
                              <div className="exam-info">
                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                <span>{exam.salle}</span>
                              </div>
                              <div className="exam-info">
                                <FontAwesomeIcon icon={faChalkboardTeacher} />
                                <span>{exam.professeur}</span>
                              </div>
                              {remainingTime && (
                                <div className="exam-info remaining-time">
                                  <FontAwesomeIcon icon={faClock} />
                                  <span>Commence dans: <strong>{remainingTime}</strong></span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-exams">
                  <FontAwesomeIcon icon={faBook} />
                  <p>Aucun examen ne correspond à votre recherche</p>
                </div>
              )}
            </>
          ) : (
            <div className="no-exams">
              <FontAwesomeIcon icon={faBook} />
              <p>Aucun examen planifié pour le moment</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanningExams;
