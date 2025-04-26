import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Emploisdutemps.css";

const EmploisDuTemps = () => {
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [emploiDuTemps, setEmploiDuTemps] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [semaines, setSemaines] = useState([]);
  const [selectedSemaine, setSelectedSemaine] = useState(null);
  const [loadingSemaines, setLoadingSemaines] = useState(false);
  const navigate = useNavigate();

  // Récupérer les informations de l'étudiant connecté
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    console.log('Données utilisateur:', userData);
    if (userData) {
      setMajor(userData.filiere);
      setYear(userData.annee);
      setSubmitted(true);

      // Récupérer les semaines disponibles
      fetchSemainesDisponibles(userData.filiere, userData.annee);
    }
  }, []);

  // Fonction pour récupérer les semaines disponibles
  const fetchSemainesDisponibles = async (filiere, annee) => {
    try {
      setLoadingSemaines(true);

      const token = localStorage.getItem('userToken');
      const url = `http://localhost:5000/api/emplois-du-temps/${filiere}/${annee}/semaines`;

      console.log('Récupération des semaines disponibles:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur de connexion au serveur' }));
        console.error('Erreur lors de la récupération des semaines:', errorData);
        throw new Error(errorData.message || 'Erreur lors de la récupération des semaines disponibles');
      }

      const data = await response.json();
      console.log('Semaines disponibles:', data);

      setSemaines(data);

      // Si des semaines sont disponibles, sélectionner la première et charger l'emploi du temps
      if (data && data.length > 0) {
        setSelectedSemaine(data[0]);

        // Récupérer l'emploi du temps pour la première semaine
        const userData = JSON.parse(localStorage.getItem('userData'));
        fetchEmploiDuTemps(filiere, annee, userData.apogee, data[0]);
      } else {
        // Si aucune semaine n'est disponible, récupérer l'emploi du temps sans spécifier de semaine
        const userData = JSON.parse(localStorage.getItem('userData'));
        fetchEmploiDuTemps(filiere, annee, userData.apogee);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des semaines:', error);
    } finally {
      setLoadingSemaines(false);
    }
  };

  const fetchEmploiDuTemps = async (filiere, annee, apogee, semaine = null) => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('userToken');
      // Construire l'URL de base
      let url = `http://localhost:5000/api/emplois-du-temps/${filiere}/${annee}`;

      // Ajouter les paramètres de requête (apogée et semaine)
      const params = new URLSearchParams();
      if (apogee) params.append('apogee', apogee);
      if (semaine) params.append('semaine', semaine);

      // Ajouter les paramètres à l'URL si nécessaire
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('URL de la requête:', url);
      console.log('Token:', token);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Statut de la réponse:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur de connexion au serveur' }));
        console.error('Erreur détaillée:', errorData);
        throw new Error(errorData.message || 'Erreur lors de la récupération de l\'emploi du temps');
      }

      const data = await response.json();
      console.log('Données reçues:', data);

      // Vérifier si les données reçues sont un emploi du temps personnalisé
      const isPersonnalise = data.estPersonnalise === true;
      const titre = data.titre || '';

      // Transformer les données pour correspondre à la structure attendue
      let formattedData;

      if (data.emplois && Array.isArray(data.emplois)) {
        // Format déjà correct (emploi personnalisé)
        formattedData = {
          emplois: data.emplois,
          estPersonnalise: isPersonnalise,
          titre: titre
        };
      } else {
        // Format standard (emploi normal)
        formattedData = {
          emplois: [
            { jour: 'Lundi', creneaux: data.lundi || [] },
            { jour: 'Mardi', creneaux: data.mardi || [] },
            { jour: 'Mercredi', creneaux: data.mercredi || [] },
            { jour: 'Jeudi', creneaux: data.jeudi || [] },
            { jour: 'Vendredi', creneaux: data.vendredi || [] }
          ],
          estPersonnalise: false,
          titre: ''
        };
      }

      setEmploiDuTemps(formattedData);
    } catch (err) {
      console.error('Erreur complète:', err);
      setError('Erreur de connexion au serveur. Veuillez vérifier que le serveur est en cours d\'exécution.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (major && year) {
      setSubmitted(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      console.log('Soumission avec données:', { major, year, apogee: userData.apogee });

      // Récupérer les semaines disponibles d'abord
      fetchSemainesDisponibles(major, year);
    }
  };

  // Fonction pour gérer le changement de semaine
  const handleSemaineChange = (e) => {
    const semaine = parseInt(e.target.value);
    setSelectedSemaine(semaine);

    // Récupérer l'emploi du temps pour la semaine sélectionnée
    const userData = JSON.parse(localStorage.getItem('userData'));
    fetchEmploiDuTemps(major, year, userData.apogee, semaine);
  };

  // Fonction pour formater l'heure
  const formatTime = (time) => {
    return time.substring(0, 5); // Format HH:MM
  };

  // Fonction pour calculer les dates de début et de fin d'une semaine
  const getWeekDates = (weekNumber) => {
    if (!weekNumber) return { debut: null, fin: null };

    const currentYear = new Date().getFullYear();

    // Trouver le premier jour de l'année
    const firstDayOfYear = new Date(currentYear, 0, 1);

    // Calculer le jour de la semaine du premier jour de l'année (0 = dimanche, 1 = lundi, etc.)
    const firstDayOfWeek = firstDayOfYear.getDay();

    // Calculer le nombre de jours à ajouter pour atteindre le premier lundi de l'année
    // Si le premier jour est un lundi (1), on ajoute 0 jour
    // Si c'est un dimanche (0), on ajoute 1 jour, etc.
    const daysToFirstMonday = (8 - firstDayOfWeek) % 7;

    // Calculer la date du premier lundi de l'année
    const firstMonday = new Date(currentYear, 0, 1 + daysToFirstMonday);

    // Calculer la date du lundi de la semaine demandée
    // On ajoute (weekNumber - 1) * 7 jours au premier lundi de l'année
    const mondayOfWeek = new Date(firstMonday);
    mondayOfWeek.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);

    // Calculer la date du vendredi de la semaine demandée (lundi + 4 jours)
    const fridayOfWeek = new Date(mondayOfWeek);
    fridayOfWeek.setDate(mondayOfWeek.getDate() + 4);

    // Formater les dates
    const formatDate = (date) => {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long'
      });
    };

    return {
      debut: formatDate(mondayOfWeek),
      fin: formatDate(fridayOfWeek)
    };
  };

  // Fonction pour retourner à la page d'accueil de l'application
  const handleReturnToHome = () => {
    navigate('/');
  };

  // Fonction pour retourner à la page d'accueil initiale (avec login)
  const handleReturnToAccueil = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    navigate('/accueil');
  };

  return (
    <div className="emplois-container">
      <div className="header-actions">
        <h2>Emplois du temps</h2>
        <div className="buttons-container">
          {submitted && (
            <button className="refresh-btn" onClick={() => fetchSemainesDisponibles(major, year)}>
              ⟳ Rafraîchir
            </button>
          )}
          <button className="return-btn" onClick={handleReturnToHome}>
            Retour à l'accueil
          </button>
          <button className="logout-btn" onClick={handleReturnToAccueil}>
            Déconnexion
          </button>
        </div>
      </div>

      <p>Consultez votre emploi du temps hebdomadaire.</p>

      {/* Sélecteur de semaine avec dates */}
      {submitted && semaines.length > 0 && (
        <div className="semaine-selector">
          <div className="semaine-label">
            <label htmlFor="semaine">Semaine :</label>
            {selectedSemaine && (
              <div className="semaine-dates">
                {getWeekDates(selectedSemaine).debut} - {getWeekDates(selectedSemaine).fin}
              </div>
            )}
          </div>
          <select
            id="semaine"
            value={selectedSemaine || ''}
            onChange={handleSemaineChange}
            className="semaine-select"
          >
            {semaines.map((semaine) => {
              const dates = getWeekDates(semaine);
              return (
                <option key={semaine} value={semaine}>
                  Semaine {semaine} ({dates.debut} - {dates.fin})
                </option>
              );
            })}
          </select>
        </div>
      )}

      <div className="info-message">
        <p>
          <strong>Note:</strong> Si vous ne voyez pas votre emploi du temps après sa création par l'administrateur,
          cliquez sur le bouton "Rafraîchir" ci-dessus.
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="emplois-form">
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
        <div className="emplois-result">
          {loading ? (
            <p>Chargement de l'emploi du temps...</p>
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
          ) : emploiDuTemps ? (
            <div>
              {emploiDuTemps.estPersonnalise && (
                <div className="info-message">
                  <p>
                    <strong>Note:</strong> Cet emploi du temps a été personnalisé par l'administrateur.
                    {emploiDuTemps.titre && (
                      <span> Titre: <strong>{emploiDuTemps.titre}</strong></span>
                    )}
                  </p>
                </div>
              )}

              {/* Titre avec la semaine actuelle */}
              {selectedSemaine && (
                <div className="current-week-title">
                  <h3>
                    Emploi du temps : Semaine {selectedSemaine}
                    <span className="week-dates">
                      Du {getWeekDates(selectedSemaine).debut} au {getWeekDates(selectedSemaine).fin}
                    </span>
                  </h3>
                </div>
              )}

              <div className="emplois-grid">
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((jour) => {
                const jourEmploi = emploiDuTemps.emplois.find(e => e.jour === jour);
                return (
                  <div key={jour} className="jour-column">
                    <h3>{jour}</h3>
                    <div className="cours-list">
                      {jourEmploi ? (
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
            <p>Aucun emploi du temps disponible</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EmploisDuTemps;
