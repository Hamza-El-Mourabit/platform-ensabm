import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Radar } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    etudiants: {
      total: 0,
      parFiliere: {},
      parAnnee: {}
    },
    emplois: {
      total: 0,
      personnalises: 0
    },
    projets: {
      total: 0,
      parStatut: {}
    },
    examens: {
      prochains: 0,
      passes: 0
    },
    evenements: {
      total: 0,
      aVenir: 0,
      prochain: null
    }
  });

  // Récupérer les informations de l'utilisateur
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    // Simuler la récupération des statistiques
    fetchStatistics();
  }, []);

  // Fonction pour formater les dates
  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fonction pour formater les dates relatives (il y a X jours, heures, etc.)
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
      }
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return `Il y a ${diffWeeks} semaine${diffWeeks > 1 ? 's' : ''}`;
    } else {
      return formatDate(date);
    }
  };

  // Fonction pour récupérer les statistiques
  const fetchStatistics = async () => {
    try {
      console.log('Début de la récupération des statistiques');
      setLoading(true);

      // Récupérer le token d'authentification
      const token = localStorage.getItem('userToken');
      console.log('Token récupéré:', token ? 'Oui' : 'Non');

      if (!token) {
        throw new Error('Vous devez être connecté pour accéder à ces informations');
      }

      // Faire un appel API pour récupérer les statistiques réelles
      console.log('Envoi de la requête API...');
      const response = await fetch('http://localhost:5000/api/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Réponse reçue, statut:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur de réponse:', errorData);
        throw new Error(errorData.message || 'Erreur lors de la récupération des statistiques');
      }

      const statsData = await response.json();
      console.log('Données reçues:', statsData);
      setStats(statsData);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
      setError('Erreur lors de la récupération des données: ' + err.message);
      setLoading(false);

      // En cas d'erreur, utiliser des données simulées comme fallback
      const fallbackStats = {
        etudiants: {
          total: 0,
          parFiliere: { 'iacs': 0, 'aa': 0, 'g2er': 0, 'tdi': 0 },
          parAnnee: { '1': 0, '2': 0, '3': 0 }
        },
        emplois: {
          total: 0,
          personnalises: 0
        },
        projets: {
          total: 0,
          parStatut: { 'en cours': 0, 'termine': 0, 'a venir': 0 },
          aSoumettreCetteSemaine: 0,
          prochain: null
        },
        examens: {
          total: 0,
          prochains: 0,
          passes: 0,
          prochain: null,
          joursJusquAuProchainExamen: 0
        },
        evenements: {
          total: 0,
          aVenir: 0,
          prochain: null
        },
        competences: {
          programmation: 75,
          mathematiques: 75,
          communication: 75,
          travailEquipe: 75,
          resolutionProblemes: 75,
          gestionProjet: 75
        },
        activitesRecentes: []
      };

      setStats(fallbackStats);
    }
  };

  // Données pour le graphique des étudiants par filière
  const etudiantsParFiliereData = {
    labels: Object.keys(stats?.etudiants?.parFiliere || {}).map(filiere => {
      // Convertir la première lettre en majuscule et le reste en minuscules
      return filiere.charAt(0).toUpperCase() + filiere.slice(1).toLowerCase();
    }),
    datasets: [
      {
        label: 'Nombre d\'étudiants',
        data: Object.values(stats?.etudiants?.parFiliere || {}),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Données pour le graphique des étudiants par année
  const etudiantsParAnneeData = {
    labels: Object.keys(stats?.etudiants?.parAnnee || {}).map(annee => `${annee}ère/ème année`),
    datasets: [
      {
        label: 'Nombre d\'étudiants',
        data: Object.values(stats?.etudiants?.parAnnee || {}),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Données pour le graphique des projets par statut
  const projetsParStatutData = {
    labels: Object.keys(stats?.projets?.parStatut || {}),
    datasets: [
      {
        label: 'Projets',
        data: Object.values(stats?.projets?.parStatut || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Données pour le graphique radar des compétences (depuis le backend)
  const competencesData = {
    labels: ['Programmation', 'Mathématiques', 'Communication', 'Travail d\'équipe', 'Résolution de problèmes', 'Gestion de projet'],
    datasets: [
      {
        label: 'Compétences',
        data: [
          stats?.competences?.programmation || 75,
          stats?.competences?.mathematiques || 75,
          stats?.competences?.communication || 75,
          stats?.competences?.travailEquipe || 75,
          stats?.competences?.resolutionProblemes || 75,
          stats?.competences?.gestionProjet || 75
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
      },
    ],
  };

  // Options pour les graphiques
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '',
      },
    },
  };

  // Récupérer le nombre de jours jusqu'au prochain examen depuis le backend
  const joursJusquAuProchainExamen = stats?.examens?.joursJusquAuProchainExamen || 0;

  // Récupérer le nombre de projets à rendre cette semaine depuis le backend
  const projetsASoumettreCetteSemaine = stats?.projets?.aSoumettreCetteSemaine || 0;

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    navigate('/accueil');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Tableau de bord</h1>
        {userData && (
          <div className="user-info">
            <div className="user-details-container">
              <p>Bienvenue, {userData.prenom} {userData.nom}</p>
              <p className="user-details">
                <span className="filiere">{userData.filiere?.toUpperCase()}</span>
                <span className="annee">{userData.annee}ème année</span>
              </p>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <FontAwesomeIcon icon={faSignOutAlt} /> Déconnexion
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          Chargement des données...
        </div>
      ) : error ? (
        <div className="error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      ) : (
        <div className="dashboard-content">
          {/* Cartes d'informations */}
          <div className="info-cards">
            <div className="card">
              <div className="card-icon student-icon">
                <i className="fas fa-user-graduate"></i>
              </div>
              <div className="card-content">
                <h3>Étudiants</h3>
                <p className="card-value">{stats?.etudiants?.total || 0}</p>
                <p className="card-description">Nombre total d'étudiants</p>
              </div>
            </div>

            <div className="card">
              <div className="card-icon schedule-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <div className="card-content">
                <h3>Emplois du temps</h3>
                <p className="card-value">{stats?.emplois?.personnalises || 0}</p>
                <p className="card-description">Emplois personnalisés</p>
              </div>
            </div>

            <div className="card">
              <div className="card-icon project-icon">
                <i className="fas fa-tasks"></i>
              </div>
              <div className="card-content">
                <h3>Projets</h3>
                <p className="card-value">{stats?.projets?.total || 0}</p>
                <p className="card-description">Projets en cours</p>
              </div>
            </div>

            <div className="card">
              <div className="card-icon exam-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="card-content">
                <h3>Examens</h3>
                <p className="card-value">{stats?.examens?.prochains || 0}</p>
                <p className="card-description">Examens à venir</p>
              </div>
            </div>

            <div className="card">
              <div className="card-icon event-icon">
                <i className="fas fa-calendar-day"></i>
              </div>
              <div className="card-content">
                <h3>Événements</h3>
                <p className="card-value">{stats?.evenements?.aVenir || 0}</p>
                <p className="card-description">Événements à venir</p>
              </div>
            </div>
          </div>

          {/* Alertes */}
          <div className="alerts-section">
            <h2>Alertes et rappels</h2>
            <div className="alerts">
              {joursJusquAuProchainExamen <= 7 && (
                <div className="alert exam-alert">
                  <i className="fas fa-exclamation-circle"></i>
                  <p>Prochain examen dans {joursJusquAuProchainExamen} jour{joursJusquAuProchainExamen > 1 ? 's' : ''}</p>
                </div>
              )}
              {projetsASoumettreCetteSemaine > 0 && (
                <div className="alert project-alert">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>{projetsASoumettreCetteSemaine} projet{projetsASoumettreCetteSemaine > 1 ? 's' : ''} à soumettre cette semaine</p>
                </div>
              )}
              <div className="alert info-alert">
                <i className="fas fa-info-circle"></i>
                <p>Consultez régulièrement votre emploi du temps pour les mises à jour</p>
              </div>

              {stats?.evenements?.prochain && (
                <div className="alert event-alert">
                  <i className="fas fa-calendar-day"></i>
                  <p>
                    Prochain événement : {stats.evenements.prochain.titre || 'Événement'} - {stats.evenements.prochain.dateDebut ? new Date(stats.evenements.prochain.dateDebut).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date à venir'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Graphiques */}
          <div className="charts-section">
            <div className="chart-row">
              <div className="chart-container">
                <h2>Étudiants par filière</h2>
                <div className="chart">
                  <Pie data={etudiantsParFiliereData} options={chartOptions} />
                </div>
              </div>

              <div className="chart-container">
                <h2>Étudiants par année</h2>
                <div className="chart">
                  <Bar data={etudiantsParAnneeData} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="chart-row">
              <div className="chart-container">
                <h2>Projets par statut</h2>
                <div className="chart">
                  <Pie data={projetsParStatutData} options={chartOptions} />
                </div>
              </div>

              <div className="chart-container">
                <h2>Évaluation des compétences</h2>
                <div className="chart">
                  <Radar data={competencesData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Activités récentes */}
          <div className="recent-activities">
            <h2>Activités récentes</h2>
            <div className="activity-list">
              {stats?.activitesRecentes && stats.activitesRecentes.length > 0 ? (
                stats.activitesRecentes.map((activite, index) => {
                  // Déterminer la classe CSS en fonction du type d'activité
                  let iconClass = 'activity-calendar';
                  let iconName = 'fa-calendar-plus';

                  switch (activite.type) {
                    case 'emploi':
                      iconClass = 'activity-calendar';
                      iconName = 'fa-calendar-plus';
                      break;
                    case 'projet':
                      iconClass = 'activity-task';
                      iconName = 'fa-tasks';
                      break;
                    case 'examen':
                      iconClass = 'activity-exam';
                      iconName = 'fa-file-alt';
                      break;
                    case 'formation':
                      iconClass = 'activity-calendar';
                      iconName = 'fa-graduation-cap';
                      break;
                    case 'evenement':
                      iconClass = 'activity-event';
                      iconName = 'fa-calendar-day';
                      break;
                    default:
                      iconClass = 'activity-calendar';
                      iconName = 'fa-info-circle';
                  }

                  // Formater la date
                  const dateFormatee = activite.date
                    ? formatTimeAgo(new Date(activite.date))
                    : 'Date inconnue';

                  return (
                    <div className="activity-item" key={index}>
                      <div className={`activity-icon ${iconClass}`}>
                        <i className={`fas ${iconName}`}></i>
                      </div>
                      <div className="activity-content">
                        <p className="activity-title">{activite.titre}</p>
                        <p className="activity-time">{dateFormatee}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Afficher l'événement prochain s'il existe et qu'il n'y a pas d'activités récentes
                stats?.evenements?.prochain ? (
                  <div className="activity-item">
                    <div className="activity-icon activity-event">
                      <i className="fas fa-calendar-day"></i>
                    </div>
                    <div className="activity-content">
                      <p className="activity-title">Nouvel événement ajouté: {stats.evenements.prochain.titre || 'Événement'}</p>
                      <p className="activity-time">Date: {stats.evenements.prochain.dateDebut ? new Date(stats.evenements.prochain.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : 'Date à venir'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="no-activities">
                    <p>Aucune activité récente</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
