import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSync } from 'react-icons/fa';
import './ProjetsDeadlines.css';

const ProjetsDeadlines = () => {
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [projets, setProjets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Récupérer les informations de l'étudiant connecté
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      setMajor(userData.filiere);
      setYear(userData.annee);
      setSubmitted(true);
      fetchProjets(userData.filiere, userData.annee);
    }
  }, []);

  const fetchProjets = async (filiere, annee) => {
    setLoading(true);
    setError('');

    try {
      // Normaliser la filière en minuscules pour correspondre au format du backend
      const filiereNormalisee = filiere.toLowerCase();
      console.log('Récupération des projets pour:', { filiere: filiereNormalisee, annee });

      const token = localStorage.getItem('userToken');
      const url = `http://localhost:5000/api/projets/${filiereNormalisee}/${annee}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Récupérer le texte brut de la réponse pour le débogage
      const responseText = await response.text();
      console.log('Réponse brute du serveur:', responseText);

      // Essayer de parser la réponse en JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse:', e);
        throw new Error('Format de réponse invalide');
      }

      if (!response.ok) {
        throw new Error(data?.message || `Erreur lors de la récupération des projets: ${response.status} ${response.statusText}`);
      }

      console.log('Projets récupérés:', data);
      setProjets(data);
      return data; // Retourner les données pour la promesse
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.message);
      throw err; // Propager l'erreur pour la promesse
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (major && year) {
      setSubmitted(true);
      fetchProjets(major, year);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
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

  // Fonction pour rafraîchir les projets
  const handleRefresh = () => {
    if (major && year && !refreshing) {
      setRefreshing(true);
      fetchProjets(major, year).finally(() => {
        // Désactiver l'animation après 1 seconde pour assurer une animation complète
        setTimeout(() => {
          setRefreshing(false);
        }, 1000);
      });
    }
  };

  // Fonction pour générer la classe CSS correcte pour chaque statut
  const getStatutClass = (statut) => {
    if (!statut) return '';

    // Normalisation du statut pour le CSS
    const statutLower = statut.toLowerCase();

    if (statutLower === 'à faire' || statutLower === 'a faire') {
      return 'afaire';
    } else if (statutLower === 'en cours') {
      return 'encours';
    } else if (statutLower === 'terminé' || statutLower === 'termine') {
      return 'termine';
    } else if (statutLower === 'prévu' || statutLower === 'prevu') {
      return 'prevu';
    }

    // Fallback: retourner une version simplifiée du statut
    return statut.replace(/\s/g, '').replace(/[àáâãäåçèéêëìíîïñòóôõöùúûüýÿ]/g, '').toLowerCase();
  };

  return (
    <div className="projets-deadlines-container">
      <div className="header-actions">
        <h2>Projets et Deadlines</h2>
        <div className="buttons-container">
          <button className="return-btn" onClick={handleReturnToHome}>
            Retour à l'accueil
          </button>
          <button className="logout-btn" onClick={handleReturnToAccueil}>
            Déconnexion
          </button>
        </div>
      </div>

      <p>Consultez et gérez vos projets et échéances ici.</p>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="projets-form">
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
        <div className="projets-result">
          {loading ? (
            <p>Chargement des projets...</p>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <p>Veuillez vérifier que :</p>
              <ul>
                <li>Le serveur backend est en cours d'exécution</li>
                <li>Votre filière et année sont correctes</li>
                <li>Vous êtes bien connecté</li>
              </ul>
            </div>
          ) : projets && projets.projets ? (
            <div>
              <div className="projets-header">
                <div className="refresh-container">
                  <button
                    className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
                    onClick={handleRefresh}
                    title="Rafraîchir les projets"
                    disabled={refreshing}
                  >
                    <FaSync className="refresh-icon" /> Rafraîchir
                  </button>
                </div>
              </div>
              <table className="projets-table">
              <thead>
                <tr>
                  <th>Projet</th>
                  <th>Module</th>
                  <th>Description</th>
                  <th>Deadline</th>
                  <th>Professeur</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {projets.projets.map((projet, index) => (
                  <tr key={index}>
                    <td>{projet.nom}</td>
                    <td>{typeof projet.module === 'object' ? projet.module.nom : projet.module}</td>
                    <td>{projet.description}</td>
                    <td>{formatDate(projet.deadline)}</td>
                    <td>{typeof projet.professeur === 'object' ? `${projet.professeur.nom} ${projet.professeur.prenom}` : projet.professeur}</td>
                    <td>
                      <span className={`statut ${getStatutClass(projet.statut)}`}>
                        {projet.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          ) : (
            <p>Aucun projet disponible</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjetsDeadlines;
