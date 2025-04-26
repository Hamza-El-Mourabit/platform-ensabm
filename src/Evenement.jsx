import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Evenement.css';

const Evenement = () => {
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [evenements, setEvenements] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'today', 'past', 'all'
  const navigate = useNavigate();

  // Récupérer les informations de l'étudiant connecté
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      setMajor(userData.filiere);
      setYear(userData.annee);
      setSubmitted(true);
      fetchEvenements(userData.filiere, userData.annee);
    }
  }, []);

  const fetchEvenements = async (filiere, annee) => {
    try {
      setLoading(true);
      setError('');

      console.log(`Récupération des événements pour filière: ${filiere}, année: ${annee}`);

      const token = localStorage.getItem('userToken');
      const url = `http://localhost:5000/api/evenements/${filiere}/${annee}`;
      console.log('URL de l\'API:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur de connexion au serveur' }));
        console.error('Erreur de l\'API:', errorData);
        throw new Error(errorData.message || 'Erreur lors de la récupération des événements');
      }

      const data = await response.json();
      console.log(`${data.length} événements récupérés:`, data);

      // Vérifier si des événements avec filière 'tous' sont présents
      const tousEvents = data.filter(event => event.filiere === 'tous');
      console.log(`Nombre d'événements avec filière 'tous': ${tousEvents.length}`);
      if (tousEvents.length > 0) {
        console.log('Événements avec filière tous:', tousEvents);
      }

      setEvenements(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des événements:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (major && year) {
      setSubmitted(true);
      fetchEvenements(major, year);
    }
  };

  // Fonction pour déterminer le statut d'un événement
  const getEventStatus = (dateDebut, dateFin) => {
    const now = new Date();
    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);

    // Réinitialiser les heures pour comparer uniquement les dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateOnly = new Date(startDate);
    startDateOnly.setHours(0, 0, 0, 0);

    if (endDate < now) {
      return 'past'; // L'événement est terminé
    } else if (startDate > now) {
      return 'upcoming'; // L'événement n'a pas encore commencé
    } else if (startDateOnly.getTime() === today.getTime()) {
      return 'today'; // L'événement est aujourd'hui
    } else {
      return 'ongoing'; // L'événement est en cours
    }
  };

  // Fonction pour obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status) {
      case 'past':
        return 'Terminé';
      case 'upcoming':
        return 'À venir';
      case 'today':
        return 'Aujourd\'hui';
      case 'ongoing':
        return 'En cours';
      default:
        return '';
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };

    return `${date.toLocaleDateString('fr-FR', dateOptions)} à ${date.toLocaleTimeString('fr-FR', timeOptions)}`;
  };

  // Fonction pour formater l'heure
  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  // Fonction pour gérer le clic sur un événement
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  // Fonction pour fermer la modale
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
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

  // Fonction pour filtrer les événements par statut
  const filterEventsByStatus = (events) => {
    if (!events || !Array.isArray(events)) return [];

    return events.filter(event => {
      const status = getEventStatus(event.dateDebut, event.dateFin);

      if (activeTab === 'all') {
        return true;
      } else if (activeTab === 'upcoming') {
        return status === 'upcoming';
      } else if (activeTab === 'today') {
        return status === 'today' || status === 'ongoing';
      } else if (activeTab === 'past') {
        return status === 'past';
      }

      return true;
    });
  };

  return (
    <div className="evenement-container">
      <div className="header-actions">
        <h2>Événements</h2>
        <div className="buttons-container">
          <button className="return-btn" onClick={handleReturnToHome}>
            Retour à l'accueil
          </button>
          <button className="logout-btn" onClick={handleReturnToAccueil}>
            Déconnexion
          </button>
        </div>
      </div>

      <p>Consultez les événements à venir et passés.</p>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="evenement-form">
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
        <div className="evenement-result">
          {loading ? (
            <p>Chargement des événements...</p>
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
          ) : evenements && Array.isArray(evenements) ? (
            <>
              <div className="event-header">
                <div className="event-tabs">
                  <button
                    className={`event-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                  >
                    À venir
                  </button>
                  <button
                    className={`event-tab ${activeTab === 'today' ? 'active' : ''}`}
                    onClick={() => setActiveTab('today')}
                  >
                    Aujourd'hui
                  </button>
                  <button
                    className={`event-tab ${activeTab === 'past' ? 'active' : ''}`}
                    onClick={() => setActiveTab('past')}
                  >
                    Passés
                  </button>
                  <button
                    className={`event-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    Tous
                  </button>
                </div>
                <button
                  className={`refresh-btn ${loading ? 'loading' : ''}`}
                  onClick={() => fetchEvenements(major, year)}
                  title="Rafraîchir les événements"
                  disabled={loading}
                >
                  <span className="refresh-icon">↻</span>
                  {loading ? 'Chargement...' : 'Rafraîchir'}
                </button>
              </div>

              <div className="evenements-grid">
                {filterEventsByStatus(evenements).length > 0 ? (
                  filterEventsByStatus(evenements).map((event, index) => {
                    const status = getEventStatus(event.dateDebut, event.dateFin);
                    return (
                      <div
                        key={index}
                        className={`event-card event-status-${status}`}
                        onClick={() => handleEventClick(event)}
                      >
                        <div className={`event-status status-${status}`}>
                          {getStatusText(status)}
                        </div>
                        {event.image && (
                          <div className="event-card-image">
                            <img
                              src={event.image}
                              alt={event.titre}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="event-card-content">
                          <h3>{event.titre}</h3>
                          <p className="event-date">{formatDate(event.dateDebut)}</p>
                          <p className="event-time">
                            {new Date(event.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} -
                            {new Date(event.dateFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="event-location">{event.lieu}</p>
                          <div className="event-footer">
                            <span className={`event-type ${event.type.toLowerCase()}`}>
                              {event.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="no-events-message">Aucun événement {activeTab === 'upcoming' ? 'à venir' : activeTab === 'today' ? 'aujourd\'hui' : activeTab === 'past' ? 'passé' : ''} disponible</p>
                )}
              </div>
            </>
          ) : (
            <p>Aucun événement disponible</p>
          )}
        </div>
      )}

      {/* Modale de détails */}
      {showModal && selectedEvent && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvent.titre}</h2>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              {selectedEvent.image && (
                <div className="event-image">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.titre}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="event-details">
                <div className="event-detail-item">
                  <div className="event-detail-icon">📅</div>
                  <div className="event-detail-content">
                    <div className="event-detail-label">Date</div>
                    <div className="event-detail-value">{formatDate(selectedEvent.dateDebut)}</div>
                  </div>
                </div>

                <div className="event-detail-item">
                  <div className="event-detail-icon">⏰</div>
                  <div className="event-detail-content">
                    <div className="event-detail-label">Heure</div>
                    <div className="event-detail-value">
                      {new Date(selectedEvent.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} -
                      {new Date(selectedEvent.dateFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="event-detail-item">
                  <div className="event-detail-icon">📍</div>
                  <div className="event-detail-content">
                    <div className="event-detail-label">Lieu</div>
                    <div className="event-detail-value">{selectedEvent.lieu}</div>
                  </div>
                </div>

                <div className="event-detail-item">
                  <div className="event-detail-icon">🏷️</div>
                  <div className="event-detail-content">
                    <div className="event-detail-label">Type</div>
                    <div className="event-detail-value">
                      <span className={`event-type ${selectedEvent.type.toLowerCase()}`}>
                        {selectedEvent.type}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedEvent.organisateur && (
                  <div className="event-detail-item">
                    <div className="event-detail-icon">👤</div>
                    <div className="event-detail-content">
                      <div className="event-detail-label">Organisateur</div>
                      <div className="event-detail-value">{selectedEvent.organisateur}</div>
                    </div>
                  </div>
                )}

                {selectedEvent.etudiants && selectedEvent.etudiants.length > 0 && (
                  <div className="event-detail-item">
                    <div className="event-detail-icon">👥</div>
                    <div className="event-detail-content">
                      <div className="event-detail-label">Participants</div>
                      <div className="event-detail-value">{selectedEvent.etudiants.length} étudiants</div>
                    </div>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <div className="event-description">
                  <h3>Description</h3>
                  <p>{selectedEvent.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evenement;
