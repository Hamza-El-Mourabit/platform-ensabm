import React, { useState, useEffect } from 'react';
import { FaEdit, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import './GestionCompetences.css';

const GestionCompetences = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [competences, setCompetences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    programmation: 0,
    mathematiques: 0,
    communication: 0,
    travailEquipe: 0,
    resolutionProblemes: 0,
    gestionProjet: 0
  });

  // Récupérer la liste des étudiants et leurs compétences
  useEffect(() => {
    fetchEtudiants();
    fetchCompetences();
  }, []);

  // Récupérer la liste des étudiants
  const fetchEtudiants = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Récupération des étudiants...');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Token d\'authentification non trouvé. Veuillez vous reconnecter.');
      }

      console.log('Envoi de la requête à l\'API...');
      const response = await fetch('http://localhost:5000/api/admin/etudiants', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Réponse reçue, statut:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Réponse d\'erreur:', errorText);
        throw new Error(`Erreur lors de la récupération des étudiants: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`${data.length} étudiants récupérés avec succès`);
      setEtudiants(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des étudiants:', err);
      setError(err.message || 'Erreur lors de la récupération des étudiants');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les compétences de tous les étudiants
  const fetchCompetences = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Récupération des compétences...');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Token d\'authentification non trouvé. Veuillez vous reconnecter.');
      }

      console.log('Envoi de la requête à l\'API pour les compétences...');
      const response = await fetch('http://localhost:5000/api/competences/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Réponse reçue pour les compétences, statut:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Réponse d\'erreur pour les compétences:', errorText);
        throw new Error(`Erreur lors de la récupération des compétences: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`${data.length} enregistrements de compétences récupérés avec succès`);
      setCompetences(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des compétences:', err);
      setError(err.message || 'Erreur lors de la récupération des compétences');
    } finally {
      setLoading(false);
    }
  };

  // Commencer l'édition des compétences d'un étudiant
  const startEditing = (etudiantId) => {
    // Trouver les compétences de l'étudiant
    const etudiantCompetences = competences.find(c => c.etudiant._id === etudiantId);

    if (etudiantCompetences) {
      setEditFormData({
        programmation: etudiantCompetences.programmation,
        mathematiques: etudiantCompetences.mathematiques,
        communication: etudiantCompetences.communication,
        travailEquipe: etudiantCompetences.travailEquipe,
        resolutionProblemes: etudiantCompetences.resolutionProblemes,
        gestionProjet: etudiantCompetences.gestionProjet
      });
    } else {
      // Si l'étudiant n'a pas encore de compétences enregistrées
      setEditFormData({
        programmation: 0,
        mathematiques: 0,
        communication: 0,
        travailEquipe: 0,
        resolutionProblemes: 0,
        gestionProjet: 0
      });
    }

    setEditingId(etudiantId);
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({
      programmation: 0,
      mathematiques: 0,
      communication: 0,
      travailEquipe: 0,
      resolutionProblemes: 0,
      gestionProjet: 0
    });
  };

  // Gérer les changements dans le formulaire d'édition
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    // Limiter les valeurs entre 0 et 100
    const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
    setEditFormData({
      ...editFormData,
      [name]: numValue
    });
  };

  // Sauvegarder les modifications
  const saveCompetences = async (etudiantId) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/competences/${etudiantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des compétences');
      }

      // Rafraîchir les compétences
      await fetchCompetences();

      setSuccess('Compétences mises à jour avec succès');
      setEditingId(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les étudiants en fonction du terme de recherche
  const filteredEtudiants = etudiants.filter(etudiant => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      etudiant.nom.toLowerCase().includes(searchTermLower) ||
      etudiant.prenom.toLowerCase().includes(searchTermLower) ||
      etudiant.filiere.toLowerCase().includes(searchTermLower) ||
      etudiant.annee.toString().includes(searchTermLower)
    );
  });

  // Obtenir les compétences d'un étudiant
  const getEtudiantCompetences = (etudiantId) => {
    return competences.find(c => c.etudiant._id === etudiantId) || {
      programmation: 0,
      mathematiques: 0,
      communication: 0,
      travailEquipe: 0,
      resolutionProblemes: 0,
      gestionProjet: 0
    };
  };

  // Calculer la moyenne des compétences d'un étudiant
  const calculateAverage = (etudiantId) => {
    const comp = getEtudiantCompetences(etudiantId);
    const values = [
      comp.programmation,
      comp.mathematiques,
      comp.communication,
      comp.travailEquipe,
      comp.resolutionProblemes,
      comp.gestionProjet
    ];

    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  // Obtenir la couleur en fonction de la valeur
  const getColorForValue = (value) => {
    if (value < 30) return '#ef4444'; // Rouge
    if (value < 50) return '#f97316'; // Orange
    if (value < 70) return '#eab308'; // Jaune
    if (value < 90) return '#22c55e'; // Vert
    return '#3b82f6'; // Bleu
  };

  return (
    <div className="gestion-competences-container">
      <div className="header-actions">
        <h2>Gestion des Compétences</h2>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un étudiant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {loading ? (
        <p>Chargement des données...</p>
      ) : (
        <div className="competences-table-container">
          <table className="competences-table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Filière</th>
                <th>Année</th>
                <th>Programmation</th>
                <th>Mathématiques</th>
                <th>Communication</th>
                <th>Travail d'équipe</th>
                <th>Résolution de problèmes</th>
                <th>Gestion de projet</th>
                <th>Moyenne</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEtudiants.length === 0 ? (
                <tr>
                  <td colSpan="11" className="no-data">Aucun étudiant trouvé</td>
                </tr>
              ) : (
                filteredEtudiants.map((etudiant) => {
                  const etudiantCompetences = getEtudiantCompetences(etudiant._id);
                  const average = calculateAverage(etudiant._id);

                  return (
                    <tr key={etudiant._id}>
                      <td>{etudiant.prenom} {etudiant.nom}</td>
                      <td>{etudiant.filiere.toUpperCase()}</td>
                      <td>{etudiant.annee}ème année</td>

                      {editingId === etudiant._id ? (
                        // Mode édition
                        <>
                          <td>
                            <input
                              type="number"
                              name="programmation"
                              value={editFormData.programmation}
                              onChange={handleEditFormChange}
                              min="0"
                              max="100"
                              className="competence-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              name="mathematiques"
                              value={editFormData.mathematiques}
                              onChange={handleEditFormChange}
                              min="0"
                              max="100"
                              className="competence-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              name="communication"
                              value={editFormData.communication}
                              onChange={handleEditFormChange}
                              min="0"
                              max="100"
                              className="competence-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              name="travailEquipe"
                              value={editFormData.travailEquipe}
                              onChange={handleEditFormChange}
                              min="0"
                              max="100"
                              className="competence-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              name="resolutionProblemes"
                              value={editFormData.resolutionProblemes}
                              onChange={handleEditFormChange}
                              min="0"
                              max="100"
                              className="competence-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              name="gestionProjet"
                              value={editFormData.gestionProjet}
                              onChange={handleEditFormChange}
                              min="0"
                              max="100"
                              className="competence-input"
                            />
                          </td>
                          <td>
                            {((
                              editFormData.programmation +
                              editFormData.mathematiques +
                              editFormData.communication +
                              editFormData.travailEquipe +
                              editFormData.resolutionProblemes +
                              editFormData.gestionProjet
                            ) / 6).toFixed(1)}
                          </td>
                          <td className="actions-cell">
                            <button
                              className="action-btn save-btn"
                              onClick={() => saveCompetences(etudiant._id)}
                              title="Enregistrer"
                            >
                              <FaCheck />
                            </button>
                            <button
                              className="action-btn cancel-btn"
                              onClick={cancelEditing}
                              title="Annuler"
                            >
                              <FaTimes />
                            </button>
                          </td>
                        </>
                      ) : (
                        // Mode affichage
                        <>
                          <td>
                            <div className="competence-bar-container">
                              <div
                                className="competence-bar"
                                style={{
                                  width: `${etudiantCompetences.programmation}%`,
                                  backgroundColor: getColorForValue(etudiantCompetences.programmation)
                                }}
                              ></div>
                              <span className="competence-value">{etudiantCompetences.programmation}</span>
                            </div>
                          </td>
                          <td>
                            <div className="competence-bar-container">
                              <div
                                className="competence-bar"
                                style={{
                                  width: `${etudiantCompetences.mathematiques}%`,
                                  backgroundColor: getColorForValue(etudiantCompetences.mathematiques)
                                }}
                              ></div>
                              <span className="competence-value">{etudiantCompetences.mathematiques}</span>
                            </div>
                          </td>
                          <td>
                            <div className="competence-bar-container">
                              <div
                                className="competence-bar"
                                style={{
                                  width: `${etudiantCompetences.communication}%`,
                                  backgroundColor: getColorForValue(etudiantCompetences.communication)
                                }}
                              ></div>
                              <span className="competence-value">{etudiantCompetences.communication}</span>
                            </div>
                          </td>
                          <td>
                            <div className="competence-bar-container">
                              <div
                                className="competence-bar"
                                style={{
                                  width: `${etudiantCompetences.travailEquipe}%`,
                                  backgroundColor: getColorForValue(etudiantCompetences.travailEquipe)
                                }}
                              ></div>
                              <span className="competence-value">{etudiantCompetences.travailEquipe}</span>
                            </div>
                          </td>
                          <td>
                            <div className="competence-bar-container">
                              <div
                                className="competence-bar"
                                style={{
                                  width: `${etudiantCompetences.resolutionProblemes}%`,
                                  backgroundColor: getColorForValue(etudiantCompetences.resolutionProblemes)
                                }}
                              ></div>
                              <span className="competence-value">{etudiantCompetences.resolutionProblemes}</span>
                            </div>
                          </td>
                          <td>
                            <div className="competence-bar-container">
                              <div
                                className="competence-bar"
                                style={{
                                  width: `${etudiantCompetences.gestionProjet}%`,
                                  backgroundColor: getColorForValue(etudiantCompetences.gestionProjet)
                                }}
                              ></div>
                              <span className="competence-value">{etudiantCompetences.gestionProjet}</span>
                            </div>
                          </td>
                          <td>
                            <div className="average-container">
                              <div
                                className="average-circle"
                                style={{ backgroundColor: getColorForValue(average) }}
                              >
                                {average.toFixed(1)}
                              </div>
                            </div>
                          </td>
                          <td className="actions-cell">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => startEditing(etudiant._id)}
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GestionCompetences;
