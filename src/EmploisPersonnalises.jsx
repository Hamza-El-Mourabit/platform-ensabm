import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmploisPersonnalises.css';

const EmploisPersonnalises = () => {
  const navigate = useNavigate();
  const [emploisPersonnalises, setEmploisPersonnalises] = useState([]);
  const [selectedEmploi, setSelectedEmploi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Récupérer les informations de l'étudiant connecté
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      navigate('/accueil');
      return;
    }

    // Récupérer les emplois personnalisés au chargement
    fetchEmploisPersonnalises();

    // Mettre en place un rafraîchissement automatique toutes les 30 secondes
    const refreshInterval = setInterval(() => {
      fetchEmploisPersonnalises();
    }, 30000); // 30 secondes

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(refreshInterval);
  }, [navigate]);

  // Récupérer les emplois du temps personnalisés de l'étudiant
  const fetchEmploisPersonnalises = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Tentative de récupération des emplois personnalisés...');
      const userData = JSON.parse(localStorage.getItem('userData'));
      console.log('Informations utilisateur:', userData);

      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/api/emplois-personnalises/etudiant', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des emplois personnalisés');
      }

      let data = await response.json();
      console.log('Emplois personnalisés reçus:', data);

      // Vérifier si les emplois ont le champ pourTouteFiliere
      if (data && data.length > 0) {
        // S'assurer que le champ pourTouteFiliere est correctement interprété comme un booléen
        data = data.map(emploi => ({
          ...emploi,
          pourTouteFiliere: emploi.pourTouteFiliere === true || emploi.pourTouteFiliere === 'true'
        }));

        data.forEach((emploi, index) => {
          console.log(`Emploi #${index + 1} après conversion:`, {
            id: emploi._id,
            titre: emploi.titre,
            filiere: emploi.filiere,
            annee: emploi.annee,
            pourTouteFiliere: emploi.pourTouteFiliere,
            nombreEtudiants: emploi.etudiants ? emploi.etudiants.length : 0
          });
        });
      } else {
        console.log('Aucun emploi personnalisé reçu');
      }

      setEmploisPersonnalises(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Afficher les détails d'un emploi personnalisé
  const viewEmploiDetails = async (id) => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5000/api/emplois-personnalises/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails de l\'emploi personnalisé');
      }

      let data = await response.json();
      console.log('Détails de l\'emploi reçus:', data);

      // S'assurer que le champ pourTouteFiliere est correctement interprété comme un booléen
      data = {
        ...data,
        pourTouteFiliere: data.pourTouteFiliere === true || data.pourTouteFiliere === 'true'
      };

      console.log('Détails de l\'emploi après conversion:', {
        id: data._id,
        titre: data.titre,
        filiere: data.filiere,
        annee: data.annee,
        pourTouteFiliere: data.pourTouteFiliere
      });

      setSelectedEmploi(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour formater l'heure
  const formatTime = (time) => {
    return time.substring(0, 5); // Format HH:MM
  };

  // Fonction pour retourner à la page d'accueil de l'application
  const handleReturnToHome = () => {
    navigate('/');
  };

  // Fonction pour retourner à la liste des emplois personnalisés
  const handleReturnToList = () => {
    setSelectedEmploi(null);
  };

  return (
    <div className="emplois-personnalises-container">
      <div className="header-actions">
        <h2>Emplois du Temps Personnalisés</h2>
        <div className="buttons-container">
          <button className="refresh-btn" onClick={fetchEmploisPersonnalises}>
            ⟳ Rafraîchir les emplois du temps
          </button>
          <button className="return-btn" onClick={handleReturnToHome}>
            Retour à l'accueil
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="info-message">
        <p>
          <strong>Note:</strong> Si vous ne voyez pas votre emploi du temps après sa création par l'administrateur,
          cliquez sur le bouton "Rafraîchir" ci-dessus pour mettre à jour la liste.
        </p>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : selectedEmploi ? (
        <div className="emploi-details">
          <div className="emploi-header">
            <button className="back-btn" onClick={handleReturnToList}>
              &larr; Retour à la liste
            </button>
            <h3>{selectedEmploi.titre}</h3>
            {selectedEmploi.description && (
              <p className="emploi-description">{selectedEmploi.description}</p>
            )}
            <div className="emploi-type-detail">
              {selectedEmploi.pourTouteFiliere ? (
                <span className="badge filiere-badge">Pour toute la filière</span>
              ) : (
                <span className="badge personal-badge">Personnel</span>
              )}
            </div>
            <div className="emploi-meta">
              <span>Filière: {selectedEmploi.filiere === 'tous' ? 'Toutes' : selectedEmploi.filiere.toUpperCase()}</span>
              <span>Année: {selectedEmploi.annee === 'tous' ? 'Toutes' : selectedEmploi.annee}</span>
              <span>Créé par: {selectedEmploi.creePar?.nom} {selectedEmploi.creePar?.prenom}</span>
            </div>
          </div>

          <div className="emplois-grid">
            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((jour) => {
              const jourEmploi = selectedEmploi.emplois.find(e => e.jour === jour);
              return (
                <div key={jour} className="jour-column">
                  <h3>{jour}</h3>
                  <div className="cours-list">
                    {jourEmploi && jourEmploi.creneaux.length > 0 ? (
                      jourEmploi.creneaux.map((cours, index) => (
                        <div key={index} className="cours-card">
                          <h4>
                            {typeof cours.module === 'object' && cours.module !== null
                              ? `${cours.module.code} - ${cours.module.nom}`
                              : cours.module}
                          </h4>
                          <p className="cours-time">{formatTime(cours.debut)} - {formatTime(cours.fin)}</p>
                          <p className="cours-location">{cours.salle}</p>
                          <p className="cours-prof">
                            {typeof cours.professeur === 'object' && cours.professeur !== null
                              ? `${cours.professeur.nom} ${cours.professeur.prenom}`
                              : cours.professeur}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p>Aucun cours ce jour</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="emplois-list">
          <p>Voici les emplois du temps personnalisés qui vous ont été assignés :</p>

          {emploisPersonnalises.length === 0 ? (
            <p className="no-emplois">Aucun emploi du temps personnalisé n'est disponible pour le moment.</p>
          ) : (
            <div className="emplois-cards">
              {emploisPersonnalises.map((emploi) => (
                <div key={emploi._id} className="emploi-card" onClick={() => viewEmploiDetails(emploi._id)}>
                  <h3>{emploi.titre}</h3>
                  {emploi.description && (
                    <p className="emploi-description">{emploi.description.substring(0, 100)}...</p>
                  )}
                  <div className="emploi-type">
                    {emploi.pourTouteFiliere ? (
                      <span className="badge filiere-badge">Pour toute la filière</span>
                    ) : (
                      <span className="badge personal-badge">Personnel</span>
                    )}
                  </div>
                  <div className="emploi-footer">
                    <span>Filière: {emploi.filiere === 'tous' ? 'Toutes' : emploi.filiere.toUpperCase()}</span>
                    <span>Année: {emploi.annee === 'tous' ? 'Toutes' : emploi.annee}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmploisPersonnalises;

