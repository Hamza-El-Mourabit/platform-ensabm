import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./PlanningExams.css";

const PlanningExams = () => {
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [planningExams, setPlanningExams] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur de connexion au serveur' }));
        throw new Error(errorData.message || 'Erreur lors de la récupération du planning');
      }

      const data = await response.json();
      setPlanningExams(data);
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
      fetchPlanningExams(major, year);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
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

  return (
    <div className="page-container">
      <div className="header-actions">
        <h1>Planning des Exams</h1>
        <div className="buttons-container">
          <button className="return-btn" onClick={handleReturnToHome}>
            Retour à l'accueil
          </button>
          <button className="logout-btn" onClick={handleReturnToAccueil}>
            Déconnexion
          </button>
        </div>
      </div>

      <p>Bienvenue sur la page de planning des examens.</p>

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
          {loading ? (
            <p>Chargement du planning des examens...</p>
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
          ) : planningExams && planningExams.examens ? (
            <table className="exam-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Date</th>
                  <th>Horaire</th>
                  <th>Salle</th>
                  <th>Professeur</th>
                </tr>
              </thead>
              <tbody>
                {planningExams.examens.map((exam, index) => (
                  <tr key={index}>
                    <td>{exam.module}</td>
                    <td>{formatDate(exam.date)}</td>
                    <td>{formatTime(exam.debut)} - {formatTime(exam.fin)}</td>
                    <td>{exam.salle}</td>
                    <td>{exam.professeur}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aucun examen planifié</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanningExams;
