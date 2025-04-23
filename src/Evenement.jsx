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
      
      const token = localStorage.getItem('userToken');
      const url = `http://localhost:5000/api/evenements/${filiere}/${annee}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur de connexion au serveur' }));
        throw new Error(errorData.message || 'Erreur lors de la récupération des événements');
      }

      const data = await response.json();
      setEvenements(data);
    } catch (err) {
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

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
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
          ) : evenements && evenements.evenements ? (
            <div className="evenements-grid">
              {evenements.evenements.map((event, index) => (
                <div 
                  key={index} 
                  className="event-card"
                  onClick={() => handleEventClick(event)}
                >
                  <h3>{event.titre}</h3>
                  <p className="event-date">{formatDate(event.date)}</p>
                  <p className="event-time">{formatTime(event.heureDebut)} - {formatTime(event.heureFin)}</p>
                  <p className="event-location">{event.lieu}</p>
                  <span className={`event-type ${event.type.toLowerCase()}`}>
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
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
              <div className="event-details">
                <p><strong>Date:</strong> {formatDate(selectedEvent.date)}</p>
                <p><strong>Heure:</strong> {formatTime(selectedEvent.heureDebut)} - {formatTime(selectedEvent.heureFin)}</p>
                <p><strong>Lieu:</strong> {selectedEvent.lieu}</p>
                <p><strong>Type:</strong> {selectedEvent.type}</p>
                {selectedEvent.description && (
                  <p><strong>Description:</strong> {selectedEvent.description}</p>
                )}
                {selectedEvent.organisateur && (
                  <p><strong>Organisateur:</strong> {selectedEvent.organisateur}</p>
                )}
                {selectedEvent.participants && (
                  <p><strong>Participants:</strong> {selectedEvent.participants}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evenement;
