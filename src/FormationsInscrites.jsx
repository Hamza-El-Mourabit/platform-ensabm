import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, User, Calendar, BookOpen, GraduationCap,
  Users, Timer, Award, FileText, MapPin, AlarmClock
} from "lucide-react";
import './FormationsInscrites.css';

// Images par défaut pour les formations
import formation1 from './loginaccueil/assets/istockphoto-1192947841-170667a.png';
import formation2 from './loginaccueil/assets/istockphoto-1396019181-170667a.png';
import formation3 from './loginaccueil/assets/istockphoto-1226452601-170667a.png';

const FormationsInscrites = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [formationsDisponibles, setFormationsDisponibles] = useState([]);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('inscrites'); // 'inscrites' ou 'disponibles'

  // Récupérer les informations de l'étudiant connecté et les formations inscrites
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      navigate('/accueil');
      return;
    }

    // Récupérer les formations inscrites au chargement
    fetchFormationsInscrites();
  }, [navigate]);

  // Récupérer les formations disponibles après avoir chargé les formations inscrites
  useEffect(() => {
    // Utiliser un effet séparé pour s'assurer que les formations inscrites sont chargées d'abord
    fetchFormationsDisponibles();
  }, [formations]);

  // Récupérer les formations inscrites de l'étudiant
  const fetchFormationsInscrites = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Tentative de récupération des formations inscrites...');
      const userData = JSON.parse(localStorage.getItem('userData'));
      console.log('Informations utilisateur:', userData);

      const token = localStorage.getItem('userToken');

      // Utiliser la nouvelle route qui récupère uniquement les formations auxquelles l'étudiant est inscrit
      const response = await fetch('http://localhost:5000/api/formations/etudiant/inscriptions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des formations inscrites');
      }

      const data = await response.json();
      console.log('Formations inscrites reçues:', data);

      if (data && data.length > 0) {
        // Toutes les formations retournées par cette route sont déjà marquées comme inscrites (isInscrit = true)
        console.log('Formations inscrites avec statut d\'inscription:',
          data.map(f => ({ id: f._id, titre: f.title, inscrit: f.isInscrit })));

        setFormations(data);
      } else {
        console.log('Aucune formation inscrite reçue');
        setFormations([]);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des formations inscrites:', err);
      setError(err.message);
      setFormations([]);
    } finally {
      setLoading(false);
    }
  };

  // Afficher les détails d'une formation
  // Récupérer toutes les formations disponibles
  const fetchFormationsDisponibles = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Tentative de récupération de toutes les formations...');
      const token = localStorage.getItem('userToken');

      // Récupérer toutes les formations disponibles pour l'étudiant
      const response = await fetch('http://localhost:5000/api/formations/etudiant', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des formations disponibles');
      }

      const data = await response.json();
      console.log('Formations disponibles reçues:', data);

      if (data && data.length > 0) {
        // Les formations retournées par cette route ont déjà la propriété isInscrit correctement définie
        console.log('Formations disponibles avec statut d\'inscription:',
          data.map(f => ({ id: f._id, titre: f.title, inscrit: f.isInscrit })));

        setFormationsDisponibles(data);
      } else {
        console.log('Aucune formation disponible reçue');
        setFormationsDisponibles([]);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des formations disponibles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // S'inscrire à une formation
  const inscrireFormation = async (formationId, e) => {
    // Empêcher la propagation de l'événement pour éviter d'ouvrir les détails
    if (e) {
      e.stopPropagation();
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('Tentative d\'inscription à la formation:', formationId);

      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('Vous devez être connecté pour vous inscrire à une formation');
      }

      console.log('Token récupéré, envoi de la requête...');

      const response = await fetch(`http://localhost:5000/api/formations/${formationId}/inscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Réponse reçue, statut:', response.status);

      const responseData = await response.json();
      console.log('Données de réponse:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Erreur lors de l\'inscription à la formation');
      }

      console.log('Inscription réussie !');

      // Afficher un message de succès
      setSuccess('Inscription réussie !');

      // Mettre à jour les listes de formations
      // Forcer un changement d'onglet pour rafraîchir l'interface
      const currentTab = activeTab;
      setActiveTab(currentTab === 'inscrites' ? 'disponibles' : 'inscrites');

      // Attendre un court instant pour que le changement d'onglet soit effectif
      setTimeout(async () => {
        await fetchFormationsInscrites();
        await fetchFormationsDisponibles();

        // Revenir à l'onglet d'origine
        setActiveTab(currentTab);

        // Si nous sommes dans l'onglet "Formations disponibles", basculer vers "Mes formations"
        // pour montrer à l'utilisateur qu'il est maintenant inscrit
        if (currentTab === 'disponibles') {
          setTimeout(() => {
            setActiveTab('inscrites');
          }, 500);
        }
      }, 100);

      // Si une formation est sélectionnée, mettre à jour son statut d'inscription
      if (selectedFormation && selectedFormation._id === formationId) {
        setSelectedFormation({
          ...selectedFormation,
          isInscrit: true
        });
      }

    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  // Se désinscrire d'une formation
  const desinscrireFormation = async (formationId, e) => {
    // Empêcher la propagation de l'événement pour éviter d'ouvrir les détails
    if (e) {
      e.stopPropagation();
    }

    if (!window.confirm('Êtes-vous sûr de vouloir vous désinscrire de cette formation ?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('Tentative de désinscription de la formation:', formationId);

      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('Vous devez être connecté pour vous désinscrire d\'une formation');
      }

      console.log('Token récupéré, envoi de la requête...');

      const response = await fetch(`http://localhost:5000/api/formations/${formationId}/inscription`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Réponse reçue, statut:', response.status);

      const responseData = await response.json();
      console.log('Données de réponse:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Erreur lors de la désinscription de la formation');
      }

      console.log('Désinscription réussie !');

      // Afficher un message de succès
      setSuccess('Désinscription réussie !');

      // Mettre à jour les listes de formations
      // Forcer un changement d'onglet pour rafraîchir l'interface
      const currentTab = activeTab;
      setActiveTab(currentTab === 'inscrites' ? 'disponibles' : 'inscrites');

      // Attendre un court instant pour que le changement d'onglet soit effectif
      setTimeout(async () => {
        await fetchFormationsInscrites();
        await fetchFormationsDisponibles();

        // Revenir à l'onglet d'origine
        setActiveTab(currentTab);
      }, 100);

      // Si une formation est sélectionnée, mettre à jour son statut d'inscription
      if (selectedFormation && selectedFormation._id === formationId) {
        setSelectedFormation({
          ...selectedFormation,
          isInscrit: false
        });
      }

      // Si nous sommes dans l'onglet "Mes formations", et que la formation sélectionnée est celle dont on vient de se désinscrire,
      // retourner à la liste des formations
      if (activeTab === 'inscrites' && selectedFormation && selectedFormation._id === formationId) {
        setSelectedFormation(null);
      }

    } catch (err) {
      console.error('Erreur lors de la désinscription:', err);
      setError(err.message || 'Une erreur est survenue lors de la désinscription');
    } finally {
      setLoading(false);
    }
  };

  const viewFormationDetails = async (id) => {
    try {
      setLoading(true);
      setError('');

      console.log('Récupération des détails de la formation:', id);

      // Vérifier si la formation est dans la liste des formations inscrites
      const formationInscrite = formations.find(f => f._id === id);

      // Vérifier si la formation est dans la liste des formations disponibles
      const formationDisponible = formationsDisponibles.find(f => f._id === id);

      let formation;

      if (formationInscrite) {
        // Si la formation est trouvée dans les formations inscrites, elle est inscrite
        formation = formationInscrite;
        console.log('Formation trouvée dans les formations inscrites');
      } else if (formationDisponible) {
        // Si la formation est trouvée dans les formations disponibles, utiliser cette formation
        formation = formationDisponible;
        console.log('Formation trouvée dans les formations disponibles, statut d\'inscription:', formation.isInscrit);
      } else {
        // Si la formation n'est pas trouvée, essayer de la récupérer depuis l'API
        console.log('Formation non trouvée localement, récupération depuis l\'API');
        const token = localStorage.getItem('userToken');

        // Récupérer les détails de la formation
        const response = await fetch(`http://localhost:5000/api/formations/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des détails de la formation');
        }

        const data = await response.json();
        console.log('Détails de la formation reçus:', data);

        // Vérifier si l'étudiant est inscrit à cette formation
        const inscritResponse = await fetch('http://localhost:5000/api/formations/etudiant/inscriptions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!inscritResponse.ok) {
          throw new Error('Erreur lors de la vérification des inscriptions');
        }

        const inscritData = await inscritResponse.json();
        const estInscrit = inscritData.some(f => f._id === id);
        console.log('Vérification si l\'étudiant est inscrit à la formation:', estInscrit);

        // Ajouter le statut d'inscription
        formation = { ...data, isInscrit: estInscrit };
      }

      console.log('Formation sélectionnée avec statut d\'inscription:', formation.isInscrit);
      setSelectedFormation(formation);
    } catch (err) {
      console.error('Erreur lors de la récupération des détails de la formation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour retourner à la page d'accueil de l'application
  const handleReturnToHome = () => {
    navigate('/');
  };

  // Fonction pour retourner à la liste des formations inscrites
  const handleReturnToList = () => {
    setSelectedFormation(null);
  };

  // Déterminer la couleur du badge en fonction de la filière
  const getBadgeColors = (filiere) => {
    if (!filiere) return { bg: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' };

    const filiereLC = filiere.toLowerCase();
    if (filiereLC.includes('iacs') || filiereLC.includes('informatique')) {
      return { bg: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' };
    } else if (filiereLC.includes('g2er') || filiereLC.includes('industriel')) {
      return { bg: 'rgba(5, 150, 105, 0.1)', color: '#059669' };
    } else if (filiereLC.includes('tdi') || filiereLC.includes('civil')) {
      return { bg: 'rgba(217, 119, 6, 0.1)', color: '#d97706' };
    } else if (filiereLC.includes('aa') || filiereLC.includes('automatique')) {
      return { bg: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' };
    }

    return { bg: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' };
  };

  // Déterminer la couleur du badge de statut
  const getStatusBadgeColors = (statut) => {
    if (!statut) return { bg: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af' };

    const statutLC = statut.toLowerCase();
    if (statutLC === 'en cours') {
      return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
    } else if (statutLC === 'terminée') {
      return { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' };
    } else if (statutLC === 'à venir') {
      return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
    }

    return { bg: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af' };
  };

  // Formater le temps restant
  const formatTempsRestant = (tempsRestant) => {
    if (!tempsRestant) return null;

    const { jours, heures, minutes } = tempsRestant;

    if (jours > 0) {
      return `${jours} jour${jours > 1 ? 's' : ''} ${heures}h`;
    } else if (heures > 0) {
      return `${heures}h ${minutes}min`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="formations-inscrites-container">
      <div className="header-actions">
        <h2>Formations</h2>
        <div className="buttons-container">
          <button
            className="refresh-btn"
            onClick={async () => {
              setLoading(true);
              setError('');
              setSuccess('');
              try {
                // Forcer un rafraîchissement complet des données
                await fetchFormationsInscrites();
                await fetchFormationsDisponibles();

                // Forcer une mise à jour de l'interface utilisateur
                const currentTab = activeTab;
                setActiveTab(currentTab === 'inscrites' ? 'disponibles' : 'inscrites');
                setTimeout(() => {
                  setActiveTab(currentTab);
                }, 100);

                setSuccess('Données rafraîchies avec succès !');
              } catch (err) {
                console.error('Erreur lors du rafraîchissement:', err);
                setError('Erreur lors du rafraîchissement des données');
              } finally {
                setLoading(false);
              }
            }}
          >
            ⟳ Rafraîchir
          </button>
          <button className="return-btn" onClick={handleReturnToHome}>
            Retour à l'accueil
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="formations-tabs">
        <button
          className={`tab-btn ${activeTab === 'inscrites' ? 'active' : ''}`}
          onClick={() => setActiveTab('inscrites')}
        >
          Mes formations
        </button>
        <button
          className={`tab-btn ${activeTab === 'disponibles' ? 'active' : ''}`}
          onClick={() => setActiveTab('disponibles')}
        >
          Formations disponibles
        </button>
      </div>

      <div className="info-message">
        {activeTab === 'inscrites' ? (
          <p>
            <strong>Note:</strong> Cette section affiche les formations auxquelles vous êtes inscrit(e).
            Vous pouvez consulter les détails de chaque formation en cliquant sur sa carte.
          </p>
        ) : (
          <p>
            <strong>Note:</strong> Cette section affiche toutes les formations disponibles.
            Vous pouvez vous inscrire à une formation en cliquant sur le bouton "S'inscrire".
          </p>
        )}
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : selectedFormation ? (
        <div className="formation-details">
          <div className="formation-header">
            <button className="back-btn" onClick={handleReturnToList}>
              &larr; Retour à la liste
            </button>

            {selectedFormation.imageUrl && (
              <img
                src={selectedFormation.imageUrl}
                alt={selectedFormation.title}
                className="formation-image-detail"
                onError={(e) => {
                  e.target.onerror = null;
                  // Utiliser une image par défaut en cas d'erreur
                  e.target.src = formation1;
                }}
              />
            )}

            <h3>{selectedFormation.title}</h3>

            <div className="formation-type-detail">
              {selectedFormation.filiere && (
                <span
                  className="formation-badge"
                  style={{
                    backgroundColor: getBadgeColors(selectedFormation.filiere).bg,
                    color: getBadgeColors(selectedFormation.filiere).color
                  }}
                >
                  {selectedFormation.filiere}
                </span>
              )}

              {selectedFormation.statut && (
                <span
                  className="formation-badge status-badge-detail"
                  style={{
                    backgroundColor: getStatusBadgeColors(selectedFormation.statut).bg,
                    color: getStatusBadgeColors(selectedFormation.statut).color,
                    marginLeft: '10px'
                  }}
                >
                  {selectedFormation.statut}
                </span>
              )}
            </div>

            {selectedFormation.statut === 'À venir' && selectedFormation.tempsRestant && (
              <div className="formation-countdown formation-countdown-detail">
                <Timer size={18} />
                <span>Commence dans {formatTempsRestant(selectedFormation.tempsRestant)}</span>
              </div>
            )}

            <div className="formation-description-detail">
              {selectedFormation.description}
            </div>

            <div className="formation-meta-detail">
              {selectedFormation.instructor && (
                <div className="formation-meta-item">
                  <User size={18} />
                  <span>Responsable: {selectedFormation.instructor}</span>
                </div>
              )}

              {selectedFormation.duration && (
                <div className="formation-meta-item">
                  <Clock size={18} />
                  <span>Durée: {selectedFormation.duration}</span>
                </div>
              )}

              {selectedFormation.heureDebut && selectedFormation.heureFin && (
                <div className="formation-meta-item">
                  <AlarmClock size={18} />
                  <span>Horaires: {selectedFormation.heureDebut} - {selectedFormation.heureFin}</span>
                </div>
              )}

              {selectedFormation.students && (
                <div className="formation-meta-item">
                  <Users size={18} />
                  <span>Étudiants: {selectedFormation.students}</span>
                </div>
              )}

              {selectedFormation.location && (
                <div className="formation-meta-item">
                  <MapPin size={18} />
                  <span>Lieu: {selectedFormation.location}</span>
                </div>
              )}
            </div>

            <div className="formation-actions">
              {/* Vérifier si l'étudiant est inscrit à cette formation */}
              {selectedFormation.isInscrit === true ? (
                <button
                  className="formation-action-btn desinscription-btn"
                  onClick={() => desinscrireFormation(selectedFormation._id)}
                >
                  Se désinscrire de cette formation
                </button>
              ) : (
                /* Afficher le bouton d'inscription seulement si la formation n'est pas terminée */
                selectedFormation.statut !== 'Terminée' ? (
                  <button
                    className="formation-action-btn inscription-btn"
                    onClick={() => inscrireFormation(selectedFormation._id)}
                  >
                    S'inscrire à cette formation
                  </button>
                ) : (
                  <div className="formation-ended-message formation-ended-message-detail">
                    Formation terminée - Inscription impossible
                  </div>
                )
              )}
            </div>
          </div>


        </div>
      ) : (
        <div className="formations-list">
          {activeTab === 'inscrites' ? (
            <>
              <p>Voici les formations auxquelles vous êtes inscrit(e) :</p>

              {formations.length === 0 ? (
                <p className="no-formations">Vous n'êtes inscrit(e) à aucune formation pour le moment.</p>
              ) : (
                <div className="formations-cards">
                  {formations.map((formation) => {
                    const badgeColors = getBadgeColors(formation.filiere);
                    return (
                      <div key={formation._id} className="formation-card" onClick={() => viewFormationDetails(formation._id)}>
                        <img
                          src={formation.imageUrl}
                          alt={formation.title}
                          className="formation-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            // Utiliser une image par défaut en cas d'erreur
                            e.target.src = formation1;
                          }}
                        />
                        <div className="formation-content">
                          {formation.filiere && (
                            <span
                              className="formation-badge"
                              style={{
                                backgroundColor: badgeColors.bg,
                                color: badgeColors.color
                              }}
                            >
                              {formation.filiere}
                            </span>
                          )}

                          <h3 className="formation-title">{formation.title}</h3>
                          <p className="formation-description">
                            {formation.description && formation.description.length > 100
                              ? `${formation.description.substring(0, 100)}...`
                              : formation.description}
                          </p>

                          {formation.instructor && (
                            <div className="formation-meta">
                              <User size={16} />
                              <span>{formation.instructor}</span>
                            </div>
                          )}

                          {formation.duration && (
                            <div className="formation-meta">
                              <Clock size={16} />
                              <span>{formation.duration}</span>
                            </div>
                          )}

                          {formation.statut && (
                            <div className="formation-status">
                              <span
                                className="status-badge"
                                style={{
                                  backgroundColor: getStatusBadgeColors(formation.statut).bg,
                                  color: getStatusBadgeColors(formation.statut).color
                                }}
                              >
                                {formation.statut}
                              </span>

                              {formation.statut === 'À venir' && formation.tempsRestant && (
                                <div className="formation-countdown">
                                  <Timer size={16} />
                                  <span>Commence dans {formatTempsRestant(formation.tempsRestant)}</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="formation-footer">
                            <span>{formation.students ? `${formation.students} étudiants` : '0 étudiant'}</span>

                            {formation.heureDebut && formation.heureFin && (
                              <span className="formation-hours">
                                {formation.heureDebut} - {formation.heureFin}
                              </span>
                            )}
                          </div>

                          {/* Vérifier si l'étudiant est inscrit à cette formation */}
                          {formation.isInscrit === true ? (
                            <button
                              className="formation-action-btn desinscription-btn"
                              onClick={(e) => desinscrireFormation(formation._id, e)}
                            >
                              Se désinscrire
                            </button>
                          ) : (
                            /* Afficher le bouton d'inscription seulement si la formation n'est pas terminée */
                            formation.statut !== 'Terminée' ? (
                              <button
                                className="formation-action-btn inscription-btn"
                                onClick={(e) => inscrireFormation(formation._id, e)}
                              >
                                S'inscrire
                              </button>
                            ) : (
                              <div className="formation-ended-message">
                                Formation terminée
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <p>Voici les formations disponibles :</p>

              {formationsDisponibles.length === 0 ? (
                <p className="no-formations">Aucune formation disponible pour le moment.</p>
              ) : (
                <div className="formations-cards">
                  {formationsDisponibles.map((formation) => {
                    const badgeColors = getBadgeColors(formation.filiere);
                    // Vérifier si l'étudiant est déjà inscrit à cette formation
                    // Utiliser uniquement la propriété isInscrit qui est définie dans fetchFormationsDisponibles
                    const estInscrit = formation.isInscrit === true;

                    return (
                      <div key={formation._id} className="formation-card" onClick={() => viewFormationDetails(formation._id)}>
                        <img
                          src={formation.imageUrl}
                          alt={formation.title}
                          className="formation-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            // Utiliser une image par défaut en cas d'erreur
                            e.target.src = formation1;
                          }}
                        />
                        <div className="formation-content">
                          {formation.filiere && (
                            <span
                              className="formation-badge"
                              style={{
                                backgroundColor: badgeColors.bg,
                                color: badgeColors.color
                              }}
                            >
                              {formation.filiere}
                            </span>
                          )}

                          <h3 className="formation-title">{formation.title}</h3>
                          <p className="formation-description">
                            {formation.description && formation.description.length > 100
                              ? `${formation.description.substring(0, 100)}...`
                              : formation.description}
                          </p>

                          {formation.instructor && (
                            <div className="formation-meta">
                              <User size={16} />
                              <span>{formation.instructor}</span>
                            </div>
                          )}

                          {formation.duration && (
                            <div className="formation-meta">
                              <Clock size={16} />
                              <span>{formation.duration}</span>
                            </div>
                          )}

                          {formation.statut && (
                            <div className="formation-status">
                              <span
                                className="status-badge"
                                style={{
                                  backgroundColor: getStatusBadgeColors(formation.statut).bg,
                                  color: getStatusBadgeColors(formation.statut).color
                                }}
                              >
                                {formation.statut}
                              </span>

                              {formation.statut === 'À venir' && formation.tempsRestant && (
                                <div className="formation-countdown">
                                  <Timer size={16} />
                                  <span>Commence dans {formatTempsRestant(formation.tempsRestant)}</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="formation-footer">
                            <span>{formation.students ? `${formation.students} étudiants` : '0 étudiant'}</span>

                            {formation.heureDebut && formation.heureFin && (
                              <span className="formation-hours">
                                {formation.heureDebut} - {formation.heureFin}
                              </span>
                            )}
                          </div>

                          {estInscrit ? (
                            <button
                              className="formation-action-btn desinscription-btn"
                              onClick={(e) => desinscrireFormation(formation._id, e)}
                            >
                              Se désinscrire
                            </button>
                          ) : (
                            /* Afficher le bouton d'inscription seulement si la formation n'est pas terminée */
                            formation.statut !== 'Terminée' ? (
                              <button
                                className="formation-action-btn inscription-btn"
                                onClick={(e) => inscrireFormation(formation._id, e)}
                              >
                                S'inscrire
                              </button>
                            ) : (
                              <div className="formation-ended-message">
                                Formation terminée
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FormationsInscrites;
