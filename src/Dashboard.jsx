import React, { useState, useEffect } from 'react';
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

  // Fonction pour récupérer les statistiques
  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Récupérer le token d'authentification
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('Vous devez être connecté pour accéder à ces informations');
      }

      // Faire un appel API pour récupérer les statistiques réelles
      const response = await fetch('http://localhost:5000/api/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des statistiques');
      }

      const statsData = await response.json();
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
        }
      };

      setStats(fallbackStats);
    }
  };

  // Données pour le graphique des étudiants par filière
  const etudiantsParFiliereData = {
    labels: Object.keys(stats.etudiants.parFiliere).map(filiere => filiere.toUpperCase()),
    datasets: [
      {
        label: 'Nombre d\'étudiants',
        data: Object.values(stats.etudiants.parFiliere),
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
    labels: Object.keys(stats.etudiants.parAnnee).map(annee => `${annee}ère/ème année`),
    datasets: [
      {
        label: 'Nombre d\'étudiants',
        data: Object.values(stats.etudiants.parAnnee),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Données pour le graphique des projets par statut
  const projetsParStatutData = {
    labels: Object.keys(stats.projets.parStatut),
    datasets: [
      {
        label: 'Projets',
        data: Object.values(stats.projets.parStatut),
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

  // Données pour le graphique radar des compétences (simulées)
  const competencesData = {
    labels: ['Programmation', 'Mathématiques', 'Communication', 'Travail d\'équipe', 'Résolution de problèmes', 'Gestion de projet'],
    datasets: [
      {
        label: 'Compétences',
        data: [85, 70, 75, 90, 80, 65],
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

  // Calculer le nombre de jours jusqu'au prochain examen (simulé)
  const joursJusquAuProchainExamen = 5;

  // Calculer le nombre de projets à rendre cette semaine (simulé)
  const projetsASoumettreCetteSemaine = 2;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Tableau de bord</h1>
        {userData && (
          <div className="user-info">
            <p>Bienvenue, {userData.prenom} {userData.nom}</p>
            <p className="user-details">
              <span className="filiere">{userData.filiere?.toUpperCase()}</span>
              <span className="annee">{userData.annee}ème année</span>
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">Chargement des données...</div>
      ) : error ? (
        <div className="error">{error}</div>
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
                <p className="card-value">{stats.etudiants.total}</p>
                <p className="card-description">Nombre total d'étudiants</p>
              </div>
            </div>

            <div className="card">
              <div className="card-icon schedule-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <div className="card-content">
                <h3>Emplois du temps</h3>
                <p className="card-value">{stats.emplois.personnalises}</p>
                <p className="card-description">Emplois personnalisés</p>
              </div>
            </div>

            <div className="card">
              <div className="card-icon project-icon">
                <i className="fas fa-tasks"></i>
              </div>
              <div className="card-content">
                <h3>Projets</h3>
                <p className="card-value">{stats.projets.total}</p>
                <p className="card-description">Projets en cours</p>
              </div>
            </div>

            <div className="card">
              <div className="card-icon exam-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="card-content">
                <h3>Examens</h3>
                <p className="card-value">{stats.examens.prochains}</p>
                <p className="card-description">Examens à venir</p>
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
                  <i className="fas fa-exclamation-circle"></i>
                  <p>{projetsASoumettreCetteSemaine} projet{projetsASoumettreCetteSemaine > 1 ? 's' : ''} à soumettre cette semaine</p>
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
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-calendar-plus"></i>
                </div>
                <div className="activity-content">
                  <p className="activity-title">Nouvel emploi du temps personnalisé</p>
                  <p className="activity-time">Il y a 2 jours</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-tasks"></i>
                </div>
                <div className="activity-content">
                  <p className="activity-title">Nouveau projet ajouté: Développement Web</p>
                  <p className="activity-time">Il y a 3 jours</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="activity-content">
                  <p className="activity-title">Planning des examens mis à jour</p>
                  <p className="activity-time">Il y a 5 jours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
