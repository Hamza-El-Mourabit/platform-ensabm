import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
// Import des icônes Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt, faCalendarAlt, faPlus, faEye, faTrash,
  faEdit, faTimes, faExclamationTriangle, faUserGraduate,
  faChalkboardTeacher, faBuilding, faBook, faInfoCircle,
  faTasks, faClock, faGraduationCap, faSyncAlt, faBroom,
  faSearch, faChartLine
} from '@fortawesome/free-solid-svg-icons';
import GestionFormations from './GestionFormations';
import GestionCompetences from './GestionCompetences';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('emplois');
  const [formations, setFormations] = useState([]);
  const [emploisPersonnalises, setEmploisPersonnalises] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [modules, setModules] = useState([]);
  const [projets, setProjets] = useState([]);
  const [examens, setExamens] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminData, setAdminData] = useState(null);

  // États pour la gestion des étudiants
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const [showEtudiantForm, setShowEtudiantForm] = useState(false);
  const [etudiantFormMode, setEtudiantFormMode] = useState('add'); // 'add' ou 'edit'
  const [etudiantFormData, setEtudiantFormData] = useState({
    cin: '',
    apogee: '',
    nom: '',
    prenom: '',
    email: '',
    password: '',
    filiere: '',
    annee: ''
  });

  // États pour la gestion des professeurs
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [showProfessorForm, setShowProfessorForm] = useState(false);
  const [professorFormMode, setProfessorFormMode] = useState('add'); // 'add' ou 'edit'
  const [professorFormData, setProfessorFormData] = useState({
    cin: '',
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    password: '',
    specialite: '',
    telephone: '',
    modules: []
  });

  // États pour la gestion des modules
  const [selectedModule, setSelectedModule] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleFormMode, setModuleFormMode] = useState('add'); // 'add' ou 'edit'
  const [moduleFormData, setModuleFormData] = useState({
    code: '',
    nom: '',
    description: '',
    filiere: '',
    annee: '',
    professeurs: []
  });

  // États pour la gestion des projets
  const [selectedProjet, setSelectedProjet] = useState(null);
  const [showProjetForm, setShowProjetForm] = useState(false);
  const [projetFormMode, setProjetFormMode] = useState('add'); // 'add' ou 'edit'
  const [projetFormData, setProjetFormData] = useState({
    filiere: '',
    annee: '',
    projets: []
  });

  // État pour le formulaire d'ajout/modification d'un projet individuel
  const [showProjetItemForm, setShowProjetItemForm] = useState(false);
  const [projetItemFormMode, setProjetItemFormMode] = useState('add'); // 'add' ou 'edit'
  const [projetItemFormData, setProjetItemFormData] = useState({
    nom: '',
    description: '',
    deadline: '',
    statut: 'Prévu',
    module: '',
    professeur: ''
  });
  const [selectedProjetItemIndex, setSelectedProjetItemIndex] = useState(-1);

  // États pour la gestion des examens
  const [selectedExamen, setSelectedExamen] = useState(null);
  const [showExamenForm, setShowExamenForm] = useState(false);
  const [examenFormMode, setExamenFormMode] = useState('add'); // 'add' ou 'edit'
  const [syncingExams, setSyncingExams] = useState(false); // État pour suivre la synchronisation des examens
  const [examenFormData, setExamenFormData] = useState({
    titre: '',
    description: '',
    date: '',
    heureDebut: '',
    heureFin: '',
    salle: '',
    filiere: '',
    annee: '',
    module: '',
    professeur: '',
    type: 'Contrôle Continu',
    pourTouteFiliere: true,
    etudiants: []
  });

  // États pour la gestion des événements
  const [selectedEvenement, setSelectedEvenement] = useState(null);
  const [showEvenementForm, setShowEvenementForm] = useState(false);
  const [evenementFormMode, setEvenementFormMode] = useState('add'); // 'add' ou 'edit'
  const [evenementFormData, setEvenementFormData] = useState({
    titre: '',
    description: '',
    dateDebut: '',
    heureDebut: '',
    dateFin: '',
    heureFin: '',
    lieu: '',
    type: 'Conférence',
    organisateur: '',
    image: '',
    filiere: '',
    annee: '',
    pourTouteFiliere: true,
    etudiants: []
  });

  // État pour le formulaire de création/modification d'emploi personnalisé
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    filiere: '',
    annee: '',
    etudiants: [],
    pourTouteFiliere: true, // Par défaut, l'emploi est pour toute la filière
    emplois: [
      {
        jour: 'Lundi',
        creneaux: []
      },
      {
        jour: 'Mardi',
        creneaux: []
      },
      {
        jour: 'Mercredi',
        creneaux: []
      },
      {
        jour: 'Jeudi',
        creneaux: []
      },
      {
        jour: 'Vendredi',
        creneaux: []
      }
    ]
  });

  // État pour le mode du formulaire (création ou modification)
  const [formMode, setFormMode] = useState('add'); // 'add' ou 'edit'
  const [selectedEmploi, setSelectedEmploi] = useState(null);

  // État pour contrôler l'affichage de la sélection d'étudiants spécifiques
  const [showStudentSelection, setShowStudentSelection] = useState(false);

  // Vérifier si l'admin est connecté
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminDataStr = localStorage.getItem('adminData');

    if (!adminToken || !adminDataStr) {
      navigate('/admin/login');
      return;
    }

    setAdminData(JSON.parse(adminDataStr));

    // Charger les données
    fetchEmploisPersonnalises();
    fetchEtudiants();
  }, [navigate]);

  // Charger les étudiants, professeurs, modules, projets, examens, événements et formations lorsque l'onglet est sélectionné
  useEffect(() => {
    if (activeTab === 'etudiants') {
      fetchEtudiants();
    } else if (activeTab === 'professeurs') {
      fetchProfessors();
    } else if (activeTab === 'modules') {
      fetchModules();
    } else if (activeTab === 'projets') {
      fetchProjets();
      fetchModules();
      fetchProfessors();
    } else if (activeTab === 'examens') {
      fetchExamens();
      fetchModules();
      fetchProfessors();
      fetchEtudiants(); // Assurons-nous que les étudiants sont chargés
    } else if (activeTab === 'evenements') {
      fetchEvenements();
    } else if (activeTab === 'formations') {
      fetchFormations();
    } else if (activeTab === 'creer') {
      // Charger les professeurs et les modules pour le formulaire de création d'emploi du temps
      fetchProfessors();
      fetchModules();
    }
  }, [activeTab]);

  // Récupérer les emplois personnalisés
  const fetchEmploisPersonnalises = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch('http://localhost:5000/api/emplois-personnalises', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des emplois personnalisés');
      }

      const data = await response.json();
      setEmploisPersonnalises(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer la liste des étudiants
  const fetchEtudiants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch('http://localhost:5000/api/admin/etudiants', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des étudiants');
      }

      const data = await response.json();
      setEtudiants(data);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la récupération des étudiants: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un nouvel étudiant
  const addEtudiant = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      const response = await fetch('http://localhost:5000/api/admin/etudiants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(etudiantFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de l\'\u00e9tudiant');
      }

      // Réinitialiser le formulaire
      setEtudiantFormData({
        cin: '',
        apogee: '',
        nom: '',
        prenom: '',
        email: '',
        password: '',
        filiere: '',
        annee: ''
      });

      // Fermer le formulaire
      setShowEtudiantForm(false);

      // Rafraîchir la liste des étudiants
      fetchEtudiants();

      alert('Étudiant créé avec succès!');
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un étudiant existant
  const updateEtudiant = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      // Créer une copie des données du formulaire sans le mot de passe s'il est vide
      const updateData = { ...etudiantFormData };
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await fetch(`http://localhost:5000/api/admin/etudiants/${selectedEtudiant._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour de l\'\u00e9tudiant');
      }

      // Réinitialiser le formulaire
      setEtudiantFormData({
        cin: '',
        apogee: '',
        nom: '',
        prenom: '',
        email: '',
        password: '',
        filiere: '',
        annee: ''
      });

      // Fermer le formulaire
      setShowEtudiantForm(false);
      setSelectedEtudiant(null);

      // Rafraîchir la liste des étudiants
      fetchEtudiants();

      alert('Étudiant mis à jour avec succès!');
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un étudiant
  const deleteEtudiant = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      const response = await fetch(`http://localhost:5000/api/admin/etudiants/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression de l\'\u00e9tudiant');
      }

      // Rafraîchir la liste des étudiants
      fetchEtudiants();

      alert('Étudiant supprimé avec succès!');
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le formulaire d'ajout d'étudiant
  const openAddEtudiantForm = () => {
    setEtudiantFormData({
      cin: '',
      apogee: '',
      nom: '',
      prenom: '',
      email: '',
      password: '',
      filiere: '',
      annee: ''
    });
    setEtudiantFormMode('add');
    setShowEtudiantForm(true);
  };

  // Ouvrir le formulaire de modification d'étudiant
  const openEditEtudiantForm = (etudiant) => {
    setSelectedEtudiant(etudiant);
    setEtudiantFormData({
      cin: etudiant.cin,
      apogee: etudiant.apogee,
      nom: etudiant.nom,
      prenom: etudiant.prenom,
      email: etudiant.email,
      password: '', // Laisser vide pour ne pas changer le mot de passe
      filiere: etudiant.filiere,
      annee: etudiant.annee
    });
    setEtudiantFormMode('edit');
    setShowEtudiantForm(true);
  };

  // Gérer les changements dans le formulaire étudiant
  const handleEtudiantFormChange = (e) => {
    const { name, value } = e.target;
    setEtudiantFormData({
      ...etudiantFormData,
      [name]: value
    });
  };

  // Soumettre le formulaire étudiant
  const handleEtudiantFormSubmit = (e) => {
    e.preventDefault();
    if (etudiantFormMode === 'add') {
      addEtudiant();
    } else {
      updateEtudiant();
    }
  };

  // Gérer la déconnexion
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  // Gérer les changements dans le formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Si la filière ou l'année change, mettre à jour le titre par défaut
    if (name === 'filiere' || name === 'annee') {
      const filiere = name === 'filiere' ? value : formData.filiere;
      const annee = name === 'annee' ? value : formData.annee;

      if (filiere && annee) {
        const filiereMap = {
          'iacs': 'IACS',
          'aa': 'AA',
          'g2er': 'G2ER',
          'tdi': 'TDI',
          'tous': 'Toutes filières'
        };

        const anneeMap = {
          '1': '1ère année',
          '2': '2ème année',
          '3': '3ème année',
          'tous': 'Toutes années'
        };

        const titreAuto = `Emploi du temps - ${filiereMap[filiere]} - ${anneeMap[annee]}`;

        if (!formData.titre || formData.titre.startsWith('Emploi du temps -')) {
          setFormData(prev => ({
            ...prev,
            titre: titreAuto
          }));
        }
      }
    }
  };

  // Gérer le changement du mode d'attribution (toute filière ou étudiants spécifiques)
  const handleAttributionModeChange = (e) => {
    const pourTouteFiliere = e.target.value === 'filiere';
    setFormData({
      ...formData,
      pourTouteFiliere,
      // Réinitialiser la liste des étudiants si on passe en mode "toute filière"
      etudiants: pourTouteFiliere ? [] : formData.etudiants
    });
    setShowStudentSelection(!pourTouteFiliere);
  };

  // Gérer la sélection des étudiants
  const handleEtudiantSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({
      ...formData,
      etudiants: selectedOptions
    });
  };

  // Ajouter un créneau à un jour
  const addCreneau = (jour) => {
    const jourIndex = formData.emplois.findIndex(j => j.jour === jour);
    if (jourIndex !== -1) {
      const newEmplois = [...formData.emplois];
      newEmplois[jourIndex].creneaux.push({
        module: '', // Sera remplacé par l'ID du module sélectionné
        debut: '',
        fin: '',
        salle: '',
        professeur: '' // Sera remplacé par l'ID du professeur sélectionné
      });
      setFormData({
        ...formData,
        emplois: newEmplois
      });
    }
  };

  // Supprimer un créneau
  const removeCreneau = (jour, index) => {
    const jourIndex = formData.emplois.findIndex(j => j.jour === jour);
    if (jourIndex !== -1) {
      const newEmplois = [...formData.emplois];
      newEmplois[jourIndex].creneaux.splice(index, 1);
      setFormData({
        ...formData,
        emplois: newEmplois
      });
    }
  };

  // Gérer les changements dans les créneaux
  const handleCreneauChange = (jour, index, field, value) => {
    const jourIndex = formData.emplois.findIndex(j => j.jour === jour);
    if (jourIndex !== -1) {
      const newEmplois = [...formData.emplois];
      newEmplois[jourIndex].creneaux[index][field] = value;
      setFormData({
        ...formData,
        emplois: newEmplois
      });
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      let response;
      let successMessage;

      if (formMode === 'add') {
        // Créer un nouvel emploi du temps personnalisé
        response = await fetch('http://localhost:5000/api/emplois-personnalises', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        successMessage = 'Emploi du temps créé et automatiquement mis à jour pour les étudiants concernés!';
      } else {
        // Mettre à jour un emploi du temps existant
        response = await fetch(`http://localhost:5000/api/emplois-personnalises/${selectedEmploi._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        successMessage = 'Emploi du temps mis à jour avec succès!';
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur lors de la ${formMode === 'add' ? 'création' : 'mise à jour'} de l\'emploi du temps`);
      }

      const result = await response.json();
      console.log(`Emploi du temps ${formMode === 'add' ? 'créé' : 'mis à jour'} avec succès:`, result);

      // Mettre à jour automatiquement l'emploi du temps pour les étudiants concernés
      // Cette étape est gérée automatiquement par le backend grâce à la requête
      // getEmploisPersonnalisesEtudiant qui récupère les emplois du temps pour un étudiant
      // en fonction de sa filière et de son année

      // Réinitialiser le formulaire
      setFormData({
        titre: '',
        description: '',
        filiere: '',
        annee: '',
        etudiants: [],
        pourTouteFiliere: true,
        emplois: [
          { jour: 'Lundi', creneaux: [] },
          { jour: 'Mardi', creneaux: [] },
          { jour: 'Mercredi', creneaux: [] },
          { jour: 'Jeudi', creneaux: [] },
          { jour: 'Vendredi', creneaux: [] }
        ]
      });

      // Réinitialiser le mode du formulaire
      setFormMode('add');
      setSelectedEmploi(null);

      // Réinitialiser l'affichage de la sélection d'étudiants
      setShowStudentSelection(false);

      // Rafraîchir la liste des emplois
      fetchEmploisPersonnalises();

      alert(successMessage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer la liste des modules
  const fetchModules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch('http://localhost:5000/api/admin/modules', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des modules');
      }

      const data = await response.json();
      setModules(data);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la récupération des modules: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer la liste des professeurs
  const fetchProfessors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch('http://localhost:5000/api/admin/professors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des professeurs');
      }

      const data = await response.json();
      setProfessors(data);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la récupération des professeurs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un nouveau professeur
  const addProfessor = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      const response = await fetch('http://localhost:5000/api/admin/professors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(professorFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du professeur');
      }

      // Réinitialiser le formulaire
      setProfessorFormData({
        cin: '',
        matricule: '',
        nom: '',
        prenom: '',
        email: '',
        password: '',
        specialite: '',
        telephone: '',
        modules: []
      });

      // Fermer le formulaire
      setShowProfessorForm(false);

      // Rafraîchir la liste des professeurs
      fetchProfessors();

      alert('Professeur créé avec succès!');
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un professeur existant
  const updateProfessor = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      // Créer une copie des données du formulaire sans le mot de passe s'il est vide
      const updateData = { ...professorFormData };
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await fetch(`http://localhost:5000/api/admin/professors/${selectedProfessor._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du professeur');
      }

      // Réinitialiser le formulaire
      setProfessorFormData({
        cin: '',
        matricule: '',
        nom: '',
        prenom: '',
        email: '',
        password: '',
        specialite: '',
        telephone: '',
        modules: []
      });

      // Fermer le formulaire
      setShowProfessorForm(false);
      setSelectedProfessor(null);

      // Rafraîchir la liste des professeurs
      fetchProfessors();

      alert('Professeur mis à jour avec succès!');
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un professeur
  const deleteProfessor = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce professeur?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      const response = await fetch(`http://localhost:5000/api/admin/professors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression du professeur');
      }

      // Rafraîchir la liste des professeurs
      fetchProfessors();

      alert('Professeur supprimé avec succès!');
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le formulaire d'ajout de professeur
  const openAddProfessorForm = () => {
    setProfessorFormData({
      cin: '',
      matricule: '',
      nom: '',
      prenom: '',
      email: '',
      password: '',
      specialite: '',
      telephone: '',
      modules: []
    });
    setProfessorFormMode('add');
    setShowProfessorForm(true);
  };

  // Ouvrir le formulaire de modification de professeur
  const openEditProfessorForm = (professor) => {
    setSelectedProfessor(professor);
    setProfessorFormData({
      cin: professor.cin,
      matricule: professor.matricule,
      nom: professor.nom,
      prenom: professor.prenom,
      email: professor.email,
      password: '', // Laisser vide pour ne pas changer le mot de passe
      specialite: professor.specialite,
      telephone: professor.telephone || '',
      modules: professor.modules ? professor.modules.map(m => typeof m === 'object' ? m._id : m) : []
    });
    setProfessorFormMode('edit');
    setShowProfessorForm(true);
  };

  // Gérer les changements dans le formulaire professeur
  const handleProfessorFormChange = (e) => {
    const { name, value } = e.target;

    if (name === 'modules') {
      // Gérer les modules comme une liste multiple
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setProfessorFormData({
        ...professorFormData,
        modules: selectedOptions
      });
    } else {
      setProfessorFormData({
        ...professorFormData,
        [name]: value
      });
    }
  };

  // Soumettre le formulaire professeur
  const handleProfessorFormSubmit = (e) => {
    e.preventDefault();
    if (professorFormMode === 'add') {
      addProfessor();
    } else {
      updateProfessor();
    }
  };

  // Ajouter un nouveau module
  const addModule = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      const response = await fetch('http://localhost:5000/api/admin/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(moduleFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du module');
      }

      // Réinitialiser le formulaire
      setModuleFormData({
        code: '',
        nom: '',
        description: '',
        filiere: '',
        annee: '',
        professeurs: []
      });

      // Fermer le formulaire
      setShowModuleForm(false);

      // Rafraîchir la liste des modules
      fetchModules();

      alert('Module créé avec succès!');
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un module existant
  const updateModule = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      const response = await fetch(`http://localhost:5000/api/admin/modules/${selectedModule._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(moduleFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du module');
      }

      // Réinitialiser le formulaire
      setModuleFormData({
        code: '',
        nom: '',
        description: '',
        filiere: '',
        annee: '',
        professeurs: []
      });

      // Fermer le formulaire
      setShowModuleForm(false);
      setSelectedModule(null);

      // Rafraîchir la liste des modules
      fetchModules();

      alert('Module mis à jour avec succès!');
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un module
  const deleteModule = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce module?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      const response = await fetch(`http://localhost:5000/api/admin/modules/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression du module');
      }

      // Rafraîchir la liste des modules
      fetchModules();

      alert('Module supprimé avec succès!');
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le formulaire d'ajout de module
  const openAddModuleForm = () => {
    setModuleFormData({
      code: '',
      nom: '',
      description: '',
      filiere: '',
      annee: '',
      professeurs: []
    });
    setModuleFormMode('add');
    setShowModuleForm(true);
  };

  // Ouvrir le formulaire de modification de module
  const openEditModuleForm = (module) => {
    setSelectedModule(module);
    setModuleFormData({
      code: module.code,
      nom: module.nom,
      description: module.description || '',
      filiere: module.filiere,
      annee: module.annee,
      professeurs: module.professeurs ? module.professeurs.map(p => p._id) : []
    });
    setModuleFormMode('edit');
    setShowModuleForm(true);
  };

  // Gérer les changements dans le formulaire module
  const handleModuleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === 'professeurs') {
      // Gérer les professeurs comme une liste multiple
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setModuleFormData({
        ...moduleFormData,
        professeurs: selectedOptions
      });
    } else {
      setModuleFormData({
        ...moduleFormData,
        [name]: value
      });
    }
  };

  // Soumettre le formulaire module
  const handleModuleFormSubmit = (e) => {
    e.preventDefault();
    if (moduleFormMode === 'add') {
      addModule();
    } else {
      updateModule();
    }
  };

  // Récupérer les projets
  const fetchProjets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      // Utiliser une route qui récupère tous les projets
      const response = await fetch('http://localhost:5000/api/projets/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Récupérer le texte brut de la réponse pour le débogage
      const responseText = await response.text();
      console.log('Réponse brute du serveur (fetchProjets):', responseText);

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
      setProjets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur complète:', err);
      setError('Erreur lors de la récupération des projets: ' + err.message);
      setProjets([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les examens
  const fetchExamens = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch('http://localhost:5000/api/examens/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Récupérer le texte brut de la réponse pour le débogage
      const responseText = await response.text();
      console.log('Réponse brute du serveur (fetchExamens):', responseText);

      // Essayer de parser la réponse en JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse:', e);
        throw new Error('Format de réponse invalide');
      }

      if (!response.ok) {
        throw new Error(data?.message || `Erreur lors de la récupération des examens: ${response.status} ${response.statusText}`);
      }

      console.log('Examens récupérés:', data);
      setExamens(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur complète:', err);
      setError('Erreur lors de la récupération des examens: ' + err.message);
      setExamens([]);
    } finally {
      setLoading(false);
    }
  };

  // Synchroniser tous les examens avec les plannings
  const synchronizeAllExams = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir synchroniser tous les examens avec les plannings des étudiants? Cette opération peut prendre un moment.')) {
      return;
    }

    try {
      setSyncingExams(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      const response = await fetch('http://localhost:5000/api/examens/sync-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Récupérer le texte brut de la réponse pour le débogage
      const responseText = await response.text();
      console.log('Réponse brute du serveur (synchronizeAllExams):', responseText);

      // Essayer de parser la réponse en JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse:', e);
      }

      if (!response.ok) {
        throw new Error(data?.message || `Erreur lors de la synchronisation des examens: ${response.status} ${response.statusText}`);
      }

      alert('Tous les examens ont été synchronisés avec succès avec les plannings des étudiants!');
    } catch (err) {
      console.error('Erreur complète:', err);
      setError('Erreur lors de la synchronisation des examens: ' + err.message);
      alert('Erreur lors de la synchronisation des examens: ' + err.message);
    } finally {
      setSyncingExams(false);
    }
  };

  // Nettoyer les plannings d'examens (supprimer les doublons)
  const cleanupPlanningExams = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir nettoyer les plannings d\'examens pour supprimer les doublons?')) {
      return;
    }

    try {
      setSyncingExams(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      const response = await fetch('http://localhost:5000/api/examens/cleanup-plannings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Récupérer le texte brut de la réponse pour le débogage
      const responseText = await response.text();
      console.log('Réponse brute du serveur (cleanupPlanningExams):', responseText);

      // Essayer de parser la réponse en JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse:', e);
      }

      if (!response.ok) {
        throw new Error(data?.message || `Erreur lors du nettoyage des plannings: ${response.status} ${response.statusText}`);
      }

      const duplicatesRemoved = data?.details?.duplicatesRemoved || 0;
      alert(`Nettoyage terminé avec succès! ${duplicatesRemoved} doublons ont été supprimés.`);
    } catch (err) {
      console.error('Erreur complète:', err);
      setError('Erreur lors du nettoyage des plannings: ' + err.message);
      alert('Erreur lors du nettoyage des plannings: ' + err.message);
    } finally {
      setSyncingExams(false);
    }
  };

  // Supprimer les examens orphelins
  const removeOrphanExams = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer les examens qui n\'ont pas été créés par l\'administrateur (comme l\'examen "Gestion de projet")?')) {
      return;
    }

    try {
      setSyncingExams(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      const response = await fetch('http://localhost:5000/api/examens/remove-orphans', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Récupérer le texte brut de la réponse pour le débogage
      const responseText = await response.text();
      console.log('Réponse brute du serveur (removeOrphanExams):', responseText);

      // Essayer de parser la réponse en JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse:', e);
      }

      if (!response.ok) {
        throw new Error(data?.message || `Erreur lors de la suppression des examens orphelins: ${response.status} ${response.statusText}`);
      }

      const orphansRemoved = data?.details?.totalOrphansRemoved || 0;
      const specificExamRemoved = data?.details?.specificExamRemoved || false;

      let message = `Suppression terminée avec succès! ${orphansRemoved} examens orphelins ont été supprimés.`;
      if (specificExamRemoved) {
        message += '\nL\'examen "Gestion de projet" a été supprimé avec succès.';
      }

      alert(message);
    } catch (err) {
      console.error('Erreur complète:', err);
      setError('Erreur lors de la suppression des examens orphelins: ' + err.message);
      alert('Erreur lors de la suppression des examens orphelins: ' + err.message);
    } finally {
      setSyncingExams(false);
    }
  };

  // Comparer les examens entre les collections
  const compareExams = async () => {
    try {
      setSyncingExams(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      const response = await fetch('http://localhost:5000/api/examens/compare', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Récupérer le texte brut de la réponse pour le débogage
      const responseText = await response.text();
      console.log('Réponse brute du serveur (compareExams):', responseText);

      // Essayer de parser la réponse en JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse:', e);
      }

      if (!response.ok) {
        throw new Error(data?.message || `Erreur lors de la comparaison des examens: ${response.status} ${response.statusText}`);
      }

      const totalExamens = data?.details?.totalExamens || 0;
      const totalPlanningExams = data?.details?.totalPlanningExams || 0;
      const difference = data?.details?.difference || 0;

      let message = `Comparaison terminée:\n`;
      message += `- Examens dans la collection Examen: ${totalExamens}\n`;
      message += `- Examens dans les plannings: ${totalPlanningExams}\n`;
      message += `- Différence: ${difference}\n\n`;

      // Ajouter les détails par filière/année
      if (data?.details?.comparison) {
        message += `Détails par filière/année:\n`;
        for (const [key, value] of Object.entries(data.details.comparison)) {
          if (value.difference !== 0) {
            message += `- ${key}: ${value.examen} examens vs ${value.planning} dans le planning (diff: ${value.difference})\n`;
          }
        }
      }

      alert(message);
    } catch (err) {
      console.error('Erreur complète:', err);
      setError('Erreur lors de la comparaison des examens: ' + err.message);
      alert('Erreur lors de la comparaison des examens: ' + err.message);
    } finally {
      setSyncingExams(false);
    }
  };

  // Forcer une resynchronisation complète
  const forceResync = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir forcer une resynchronisation complète des examens? Cette opération va supprimer tous les plannings existants et les recréer.')) {
      return;
    }

    try {
      setSyncingExams(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      const response = await fetch('http://localhost:5000/api/examens/force-resync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Récupérer le texte brut de la réponse pour le débogage
      const responseText = await response.text();
      console.log('Réponse brute du serveur (forceResync):', responseText);

      // Essayer de parser la réponse en JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse:', e);
      }

      if (!response.ok) {
        throw new Error(data?.message || `Erreur lors de la resynchronisation forcée: ${response.status} ${response.statusText}`);
      }

      const total = data?.details?.total || 0;
      const totalExams = data?.details?.totalExams || 0;
      const duplicatesRemoved = data?.details?.duplicatesRemoved || 0;

      let message = `Resynchronisation forcée terminée avec succès!\n`;
      message += `- ${total} examens dans la collection Examen\n`;
      message += `- ${totalExams} examens ajoutés aux plannings\n`;
      message += `- ${duplicatesRemoved} doublons supprimés\n`;

      alert(message);
    } catch (err) {
      console.error('Erreur complète:', err);
      setError('Erreur lors de la resynchronisation forcée: ' + err.message);
      alert('Erreur lors de la resynchronisation forcée: ' + err.message);
    } finally {
      setSyncingExams(false);
    }
  };

  // Récupérer les événements
  const fetchEvenements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch('http://localhost:5000/api/evenements/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Récupérer le texte brut de la réponse pour le débogage
      const responseText = await response.text();
      console.log('Réponse brute du serveur (fetchEvenements):', responseText);

      // Essayer de parser la réponse en JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse:', e);
        throw new Error('Format de réponse invalide');
      }

      if (!response.ok) {
        throw new Error(data?.message || `Erreur lors de la récupération des événements: ${response.status} ${response.statusText}`);
      }

      console.log('Événements récupérés:', data);
      setEvenements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur complète:', err);
      setError('Erreur lors de la récupération des événements: ' + err.message);
      setEvenements([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les formations
  const fetchFormations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch('http://localhost:5000/api/formations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Récupérer le texte brut de la réponse pour le débogage
      const responseText = await response.text();
      console.log('Réponse brute du serveur (fetchFormations):', responseText);

      // Essayer de parser la réponse en JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse:', e);
        throw new Error('Format de réponse invalide');
      }

      if (!response.ok) {
        throw new Error(data?.message || `Erreur lors de la récupération des formations: ${response.status} ${response.statusText}`);
      }

      console.log('Formations récupérées:', data);
      setFormations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur complète:', err);
      setError('Erreur lors de la récupération des formations: ' + err.message);
      setFormations([]);
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un nouveau projet
  const addProjet = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      // Convertir les IDs ObjectId en chaînes de caractères pour les champs module et professeur
      const formattedData = {
        ...projetFormData,
        projets: projetFormData.projets.map(projet => ({
          ...projet,
          module: projet.module.toString(),
          professeur: projet.professeur.toString()
        }))
      };

      console.log('Données envoyées au serveur:', formattedData);

      const response = await fetch('http://localhost:5000/api/projets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      });

      // Récupérer le texte brut de la réponse pour le débogage
      const responseText = await response.text();
      console.log('Réponse brute du serveur:', responseText);

      // Essayer de parser la réponse en JSON
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse:', e);
      }

      if (!response.ok) {
        throw new Error(errorData?.message || `Erreur lors de la création du projet: ${response.status} ${response.statusText}`);
      }

      // Réinitialiser le formulaire
      setProjetFormData({
        filiere: '',
        annee: '',
        projets: []
      });

      // Fermer le formulaire
      setShowProjetForm(false);

      // Rafraîchir la liste des projets
      fetchProjets();

      alert('Projet créé avec succès!');
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un projet existant
  const updateProjet = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      // Convertir les IDs ObjectId en chaînes de caractères pour les champs module et professeur
      const formattedData = {
        ...projetFormData,
        projets: projetFormData.projets.map(projet => ({
          ...projet,
          module: projet.module.toString(),
          professeur: projet.professeur.toString()
        }))
      };

      console.log('Données envoyées au serveur pour mise à jour:', formattedData);

      // Utiliser la route correcte avec filiere et annee comme paramètres
      const response = await fetch(`http://localhost:5000/api/projets/${projetFormData.filiere}/${projetFormData.annee}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      });

      // Récupérer le texte brut de la réponse pour le débogage
      const responseText = await response.text();
      console.log('Réponse brute du serveur:', responseText);

      // Essayer de parser la réponse en JSON
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse:', e);
      }

      if (!response.ok) {
        throw new Error(errorData?.message || `Erreur lors de la mise à jour du projet: ${response.status} ${response.statusText}`);
      }

      // Réinitialiser le formulaire
      setProjetFormData({
        filiere: '',
        annee: '',
        projets: []
      });

      // Fermer le formulaire
      setShowProjetForm(false);
      setSelectedProjet(null);

      // Rafraîchir la liste des projets
      fetchProjets();

      alert('Projet mis à jour avec succès!');
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un projet
  const deleteProjet = async (projet) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      // Utiliser la route correcte avec filiere et annee comme paramètres
      const response = await fetch(`http://localhost:5000/api/projets/${projet.filiere}/${projet.annee}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Récupérer le texte brut de la réponse pour le débogage
      const responseText = await response.text();
      console.log('Réponse brute du serveur:', responseText);

      // Essayer de parser la réponse en JSON
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse:', e);
      }

      if (!response.ok) {
        throw new Error(errorData?.message || `Erreur lors de la suppression du projet: ${response.status} ${response.statusText}`);
      }

      // Rafraîchir la liste des projets
      fetchProjets();

      alert('Projet supprimé avec succès!');
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };





  // Ajouter un nouvel examen
  const addExamen = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      // Formater les données pour l'API
      const formattedData = {
        ...examenFormData,
        date: new Date(examenFormData.date).toISOString()
      };

      console.log('Données envoyées au serveur pour création d\'examen:', formattedData);

      const response = await fetch('http://localhost:5000/api/examens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
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
      }

      if (!response.ok) {
        throw new Error(data?.message || `Erreur lors de la création de l'examen: ${response.status} ${response.statusText}`);
      }

      // Réinitialiser le formulaire
      setExamenFormData({
        titre: '',
        description: '',
        date: '',
        heureDebut: '',
        heureFin: '',
        salle: '',
        filiere: '',
        annee: '',
        module: '',
        professeur: '',
        type: 'Contrôle Continu',
        pourTouteFiliere: true,
        etudiants: []
      });

      // Fermer le formulaire
      setShowExamenForm(false);

      // Rafraîchir la liste des examens
      fetchExamens();

      alert('Examen créé avec succès!');
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un examen existant
  const updateExamen = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      // Formater les données pour l'API
      const formattedData = {
        ...examenFormData,
        date: new Date(examenFormData.date).toISOString()
      };

      console.log('Données envoyées au serveur pour mise à jour d\'examen:', formattedData);

      const response = await fetch(`http://localhost:5000/api/examens/${selectedExamen._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
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
      }

      if (!response.ok) {
        throw new Error(data?.message || `Erreur lors de la mise à jour de l'examen: ${response.status} ${response.statusText}`);
      }

      // Réinitialiser le formulaire
      setExamenFormData({
        titre: '',
        description: '',
        date: '',
        heureDebut: '',
        heureFin: '',
        salle: '',
        filiere: '',
        annee: '',
        module: '',
        professeur: '',
        type: 'Contrôle Continu',
        pourTouteFiliere: true,
        etudiants: []
      });

      // Fermer le formulaire
      setShowExamenForm(false);
      setSelectedExamen(null);

      // Rafraîchir la liste des examens
      fetchExamens();

      alert('Examen mis à jour avec succès!');
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un examen
  const deleteExamen = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet examen?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      const response = await fetch(`http://localhost:5000/api/examens/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
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
      }

      if (!response.ok) {
        throw new Error(data?.message || `Erreur lors de la suppression de l'examen: ${response.status} ${response.statusText}`);
      }

      // Rafraîchir la liste des examens
      fetchExamens();

      alert('Examen supprimé avec succès!');
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le formulaire d'ajout d'examen
  const openAddExamenForm = () => {
    // S'assurer que les étudiants sont chargés
    if (etudiants.length === 0) {
      fetchEtudiants();
    }

    setExamenFormData({
      titre: '',
      description: '',
      date: '',
      heureDebut: '',
      heureFin: '',
      salle: '',
      filiere: '',
      annee: '',
      module: '',
      professeur: '',
      type: 'Contrôle Continu',
      pourTouteFiliere: true,
      etudiants: []
    });
    setExamenFormMode('add');
    setShowExamenForm(true);
  };

  // Ouvrir le formulaire de modification d'examen
  const openEditExamenForm = (examen) => {
    // S'assurer que les étudiants sont chargés
    if (etudiants.length === 0) {
      fetchEtudiants();
    }

    setSelectedExamen(examen);
    setExamenFormData({
      titre: examen.titre,
      description: examen.description || '',
      date: new Date(examen.date).toISOString().split('T')[0],
      heureDebut: examen.heureDebut,
      heureFin: examen.heureFin,
      salle: examen.salle,
      filiere: examen.filiere,
      annee: examen.annee,
      module: examen.module,
      professeur: examen.professeur,
      type: examen.type,
      pourTouteFiliere: examen.pourTouteFiliere,
      etudiants: examen.etudiants || []
    });
    setExamenFormMode('edit');
    setShowExamenForm(true);
  };

  // Gérer les changements dans le formulaire examen
  const handleExamenFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'etudiants' && type === 'select-multiple') {
      // Gérer les étudiants comme une liste multiple
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      console.log('Étudiants sélectionnés:', selectedOptions);
      setExamenFormData({
        ...examenFormData,
        etudiants: selectedOptions
      });
    } else if (name === 'pourTouteFiliere' && type === 'checkbox') {
      // Si on change l'option "Pour tous les étudiants", on met à jour le formulaire
      console.log('Option "Pour tous les étudiants" changée:', checked);
      setExamenFormData({
        ...examenFormData,
        pourTouteFiliere: checked,
        // Si on coche l'option, on vide la liste des étudiants spécifiques
        etudiants: checked ? [] : examenFormData.etudiants
      });

      // Si on décoche l'option, on vérifie que les étudiants sont bien chargés
      if (!checked) {
        console.log('Étudiants disponibles:', etudiants.length);
        console.log('Filière sélectionnée:', examenFormData.filiere);
        console.log('Année sélectionnée:', examenFormData.annee);

        // Filtrer les étudiants selon la filière et l'année
        const etudiantsFiltres = etudiants.filter(etudiant =>
          (examenFormData.filiere === 'tous' || etudiant.filiere.toLowerCase() === examenFormData.filiere.toLowerCase()) &&
          (examenFormData.annee === 'tous' || String(etudiant.annee) === String(examenFormData.annee))
        );
        console.log('Étudiants filtrés:', etudiantsFiltres.length);
      }
    } else if (name === 'filiere' || name === 'annee') {
      // Si la filière ou l'année change, mettre à jour le formulaire
      setExamenFormData({
        ...examenFormData,
        [name]: value,
        // Si on change la filière ou l'année, on vide la liste des étudiants spécifiques
        etudiants: examenFormData.pourTouteFiliere ? [] : examenFormData.etudiants
      });

      // Si on a décoché l'option "Pour tous les étudiants", on vérifie que les étudiants sont bien chargés
      if (!examenFormData.pourTouteFiliere) {
        console.log(`${name} changée à ${value}`);
        console.log('Étudiants disponibles:', etudiants.length);

        // Si on n'a pas encore chargé les étudiants, on les charge
        if (etudiants.length === 0) {
          fetchEtudiants();
        }
      }
    } else {
      setExamenFormData({
        ...examenFormData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Soumettre le formulaire examen
  const handleExamenFormSubmit = (e) => {
    e.preventDefault();
    if (examenFormMode === 'add') {
      addExamen();
    } else {
      updateExamen();
    }
  };

  // Ajouter un nouvel événement
  const addEvenement = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      // Formater les données pour l'API
      // Combiner la date et l'heure pour dateDebut et dateFin
      const dateDebutCombinee = `${evenementFormData.dateDebut}T${evenementFormData.heureDebut || '00:00'}:00`;
      const dateFinCombinee = `${evenementFormData.dateFin}T${evenementFormData.heureFin || '00:00'}:00`;

      const formattedData = {
        ...evenementFormData,
        dateDebut: new Date(dateDebutCombinee).toISOString(),
        dateFin: new Date(dateFinCombinee).toISOString()
      };

      console.log('Données envoyées au serveur pour création d\'événement:', formattedData);

      const response = await fetch('http://localhost:5000/api/evenements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
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
      }

      if (!response.ok) {
        throw new Error(data?.message || `Erreur lors de la création de l'événement: ${response.status} ${response.statusText}`);
      }

      // Réinitialiser le formulaire
      setEvenementFormData({
        titre: '',
        description: '',
        dateDebut: '',
        heureDebut: '',
        dateFin: '',
        heureFin: '',
        lieu: '',
        type: 'Conférence',
        organisateur: '',
        image: '',
        filiere: '',
        annee: '',
        pourTouteFiliere: true,
        etudiants: []
      });

      // Fermer le formulaire
      setShowEvenementForm(false);

      // Rafraîchir la liste des événements
      fetchEvenements();

      alert('Événement créé avec succès!');
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un événement existant
  const updateEvenement = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      // Formater les données pour l'API
      // Combiner la date et l'heure pour dateDebut et dateFin
      const dateDebutCombinee = `${evenementFormData.dateDebut}T${evenementFormData.heureDebut || '00:00'}:00`;
      const dateFinCombinee = `${evenementFormData.dateFin}T${evenementFormData.heureFin || '00:00'}:00`;

      const formattedData = {
        ...evenementFormData,
        dateDebut: new Date(dateDebutCombinee).toISOString(),
        dateFin: new Date(dateFinCombinee).toISOString()
      };

      console.log('Données envoyées au serveur pour mise à jour d\'événement:', formattedData);

      const response = await fetch(`http://localhost:5000/api/evenements/${selectedEvenement._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
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
      }

      if (!response.ok) {
        throw new Error(data?.message || `Erreur lors de la mise à jour de l'événement: ${response.status} ${response.statusText}`);
      }

      // Réinitialiser le formulaire
      setEvenementFormData({
        titre: '',
        description: '',
        dateDebut: '',
        heureDebut: '',
        dateFin: '',
        heureFin: '',
        lieu: '',
        type: 'Conférence',
        organisateur: '',
        image: '',
        filiere: '',
        annee: '',
        pourTouteFiliere: true,
        etudiants: []
      });

      // Fermer le formulaire
      setShowEvenementForm(false);
      setSelectedEvenement(null);

      // Rafraîchir la liste des événements
      fetchEvenements();

      alert('Événement mis à jour avec succès!');
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un événement
  const deleteEvenement = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');

      const response = await fetch(`http://localhost:5000/api/evenements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
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
      }

      if (!response.ok) {
        throw new Error(data?.message || `Erreur lors de la suppression de l'événement: ${response.status} ${response.statusText}`);
      }

      // Rafraîchir la liste des événements
      fetchEvenements();

      alert('Événement supprimé avec succès!');
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le formulaire d'ajout d'événement
  const openAddEvenementForm = () => {
    setEvenementFormData({
      titre: '',
      description: '',
      dateDebut: '',
      heureDebut: '',
      dateFin: '',
      heureFin: '',
      lieu: '',
      type: 'Conférence',
      organisateur: '',
      image: '',
      filiere: '',
      annee: '',
      pourTouteFiliere: true,
      etudiants: []
    });
    setEvenementFormMode('add');
    setShowEvenementForm(true);
  };

  // Ouvrir le formulaire de modification d'événement
  const openEditEvenementForm = (evenement) => {
    setSelectedEvenement(evenement);

    // Extraire la date et l'heure de début
    const dateDebutObj = new Date(evenement.dateDebut);
    const dateDebut = dateDebutObj.toISOString().split('T')[0];
    const heureDebut = dateDebutObj.toTimeString().substring(0, 5);

    // Extraire la date et l'heure de fin
    const dateFinObj = new Date(evenement.dateFin);
    const dateFin = dateFinObj.toISOString().split('T')[0];
    const heureFin = dateFinObj.toTimeString().substring(0, 5);

    setEvenementFormData({
      titre: evenement.titre,
      description: evenement.description || '',
      dateDebut: dateDebut,
      heureDebut: heureDebut,
      dateFin: dateFin,
      heureFin: heureFin,
      lieu: evenement.lieu,
      type: evenement.type,
      organisateur: evenement.organisateur,
      image: evenement.image || '',
      filiere: evenement.filiere,
      annee: evenement.annee,
      pourTouteFiliere: evenement.pourTouteFiliere,
      etudiants: evenement.etudiants || []
    });
    setEvenementFormMode('edit');
    setShowEvenementForm(true);
  };

  // Gérer les changements dans le formulaire événement
  const handleEvenementFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'etudiants' && type === 'select-multiple') {
      // Gérer les étudiants comme une liste multiple
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setEvenementFormData({
        ...evenementFormData,
        etudiants: selectedOptions
      });
    } else {
      setEvenementFormData({
        ...evenementFormData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Soumettre le formulaire événement
  const handleEvenementFormSubmit = (e) => {
    e.preventDefault();
    if (evenementFormMode === 'add') {
      addEvenement();
    } else {
      updateEvenement();
    }
  };

  // Ouvrir le formulaire d'ajout de projet
  const openAddProjetForm = () => {
    setProjetFormData({
      filiere: '',
      annee: '',
      projets: []
    });
    setProjetFormMode('add');
    setShowProjetForm(true);
  };

  // Ouvrir le formulaire de modification de projet
  const openEditProjetForm = (projet) => {
    setSelectedProjet(projet);
    setProjetFormData({
      filiere: projet.filiere,
      annee: projet.annee,
      projets: projet.projets || []
    });
    setProjetFormMode('edit');
    setShowProjetForm(true);
  };

  // Gérer les changements dans le formulaire projet
  const handleProjetFormChange = (e) => {
    const { name, value } = e.target;
    setProjetFormData({
      ...projetFormData,
      [name]: value
    });
  };

  // Ajouter un nouveau projet individuel à la liste
  const addProjetItem = () => {
    if (projetItemFormMode === 'add') {
      // Ajouter un nouveau projet à la liste
      setProjetFormData({
        ...projetFormData,
        projets: [...projetFormData.projets, projetItemFormData]
      });
    } else {
      // Mettre à jour un projet existant dans la liste
      const updatedProjets = [...projetFormData.projets];
      updatedProjets[selectedProjetItemIndex] = projetItemFormData;
      setProjetFormData({
        ...projetFormData,
        projets: updatedProjets
      });
    }

    // Réinitialiser le formulaire d'item
    setProjetItemFormData({
      nom: '',
      description: '',
      deadline: '',
      statut: 'Prévu',
      module: '',
      professeur: ''
    });
    setShowProjetItemForm(false);
    setSelectedProjetItemIndex(-1);
  };

  // Ouvrir le formulaire d'ajout d'un projet individuel
  const openAddProjetItemForm = () => {
    setProjetItemFormData({
      nom: '',
      description: '',
      deadline: '',
      statut: 'Prévu',
      module: '',
      professeur: ''
    });
    setProjetItemFormMode('add');
    setShowProjetItemForm(true);
  };

  // Ouvrir le formulaire de modification d'un projet individuel
  const openEditProjetItemForm = (index) => {
    setProjetItemFormData({
      ...projetFormData.projets[index]
    });
    setSelectedProjetItemIndex(index);
    setProjetItemFormMode('edit');
    setShowProjetItemForm(true);
  };

  // Supprimer un projet individuel de la liste
  const removeProjetItem = (index) => {
    const updatedProjets = [...projetFormData.projets];
    updatedProjets.splice(index, 1);
    setProjetFormData({
      ...projetFormData,
      projets: updatedProjets
    });
  };

  // Gérer les changements dans le formulaire d'item de projet
  const handleProjetItemFormChange = (e) => {
    const { name, value } = e.target;
    setProjetItemFormData({
      ...projetItemFormData,
      [name]: value
    });
  };

  // Soumettre le formulaire projet
  const handleProjetFormSubmit = (e) => {
    e.preventDefault();
    if (projetFormMode === 'add') {
      addProjet();
    } else {
      updateProjet();
    }
  };

  // Ouvrir le formulaire de modification d'un emploi du temps
  const openEditEmploiForm = async (id) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('adminToken');

      // Récupérer les détails de l'emploi du temps
      const response = await fetch(`http://localhost:5000/api/emplois-personnalises/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération de l\'emploi du temps');
      }

      const emploiData = await response.json();
      console.log('Données de l\'emploi du temps récupérées:', emploiData);
      setSelectedEmploi(emploiData);

      // Préparer les données pour le formulaire
      // Nous devons nous assurer que tous les jours sont présents, même s'ils n'ont pas de créneaux
      const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
      const emploisComplets = jours.map(jour => {
        const jourExistant = emploiData.emplois.find(e => e.jour === jour);
        if (jourExistant) {
          // Traiter les créneaux pour s'assurer que les modules et professeurs sont correctement formatés
          const creneauxFormattes = jourExistant.creneaux.map(creneau => {
            return {
              ...creneau,
              // Extraire l'ID du module si c'est un objet, sinon utiliser la valeur directement
              module: typeof creneau.module === 'object' && creneau.module !== null ? creneau.module._id : creneau.module,
              // Extraire l'ID du professeur si c'est un objet, sinon utiliser la valeur directement
              professeur: typeof creneau.professeur === 'object' && creneau.professeur !== null ? creneau.professeur._id : creneau.professeur
            };
          });
          return { ...jourExistant, creneaux: creneauxFormattes };
        } else {
          return { jour, creneaux: [] };
        }
      });

      console.log('Emplois complets formatés:', emploisComplets);

      // Mettre à jour le formulaire avec les données de l'emploi du temps
      setFormData({
        titre: emploiData.titre,
        description: emploiData.description || '',
        filiere: emploiData.filiere,
        annee: emploiData.annee,
        etudiants: emploiData.etudiants ? emploiData.etudiants.map(e => typeof e === 'object' ? e._id : e) : [],
        pourTouteFiliere: emploiData.pourTouteFiliere,
        emplois: emploisComplets
      });

      // Mettre à jour l'affichage de la sélection d'étudiants
      setShowStudentSelection(!emploiData.pourTouteFiliere);

      // Changer le mode du formulaire
      setFormMode('edit');

      // Changer l'onglet actif pour afficher le formulaire
      setActiveTab('creer');
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un emploi personnalisé
  const deleteEmploiPersonnalise = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet emploi du temps personnalisé?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      console.log(`Tentative de suppression de l'emploi du temps avec ID: ${id}`);

      const response = await fetch(`http://localhost:5000/api/emplois-personnalises/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Statut de la réponse:', response.status);

      // Tenter de lire le corps de la réponse pour plus d'informations
      let responseBody;
      try {
        responseBody = await response.text();
        console.log('Corps de la réponse:', responseBody);
      } catch (e) {
        console.log('Impossible de lire le corps de la réponse:', e);
      }

      if (!response.ok) {
        throw new Error(`Erreur lors de la suppression de l'emploi personnalisé: ${response.status} ${responseBody || ''}`);
      }

      // Attendre un peu avant de rafraîchir la liste pour s'assurer que la suppression est bien prise en compte
      setTimeout(() => {
        // Rafraîchir la liste des emplois
        fetchEmploisPersonnalises();
        setLoading(false);
        alert('Emploi du temps personnalisé supprimé avec succès!');
      }, 1000);

    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>Tableau de bord administrateur</h1>
          <div className="admin-header-subtitle">Gérez les emplois du temps et les étudiants</div>
        </div>
        {adminData && (
          <div className="admin-info">
            <div className="admin-user-details">
              <div className="admin-user-name">{adminData.prenom} {adminData.nom}</div>
              <div className="admin-user-role">Administrateur</div>
            </div>
            <div className="admin-avatar">
              {adminData.prenom.charAt(0)}{adminData.nom.charAt(0)}
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <FontAwesomeIcon icon={faSignOutAlt} /> Déconnexion
            </button>
          </div>
        )}
      </header>

      <div className="admin-tabs">
        <button
          className={activeTab === 'emplois' ? 'active' : ''}
          onClick={() => setActiveTab('emplois')}
        >
          <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
          Gestion des emplois du temps
        </button>
        <button
          className={activeTab === 'creer' ? 'active' : ''}
          onClick={() => setActiveTab('creer')}
        >
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
          Créer un emploi du temps
        </button>
        <button
          className={activeTab === 'etudiants' ? 'active' : ''}
          onClick={() => setActiveTab('etudiants')}
        >
          <FontAwesomeIcon icon={faUserGraduate} style={{ marginRight: '8px' }} />
          Gestion des étudiants
        </button>
        <button
          className={activeTab === 'professeurs' ? 'active' : ''}
          onClick={() => setActiveTab('professeurs')}
        >
          <FontAwesomeIcon icon={faChalkboardTeacher} style={{ marginRight: '8px' }} />
          Gestion des professeurs
        </button>
        <button
          className={activeTab === 'modules' ? 'active' : ''}
          onClick={() => setActiveTab('modules')}
        >
          <FontAwesomeIcon icon={faBook} style={{ marginRight: '8px' }} />
          Gestion des modules
        </button>
        <button
          className={activeTab === 'projets' ? 'active' : ''}
          onClick={() => setActiveTab('projets')}
        >
          <FontAwesomeIcon icon={faTasks} style={{ marginRight: '8px' }} />
          Gestion des projets
        </button>
        <button
          className={activeTab === 'examens' ? 'active' : ''}
          onClick={() => setActiveTab('examens')}
        >
          <FontAwesomeIcon icon={faBook} style={{ marginRight: '8px' }} />
          Gestion des examens
        </button>
        <button
          className={activeTab === 'evenements' ? 'active' : ''}
          onClick={() => setActiveTab('evenements')}
        >
          <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
          Gestion des événements
        </button>
        <button
          className={activeTab === 'formations' ? 'active' : ''}
          onClick={() => setActiveTab('formations')}
        >
          <FontAwesomeIcon icon={faGraduationCap} style={{ marginRight: '8px' }} />
          Gestion des formations
        </button>
        <button
          className={activeTab === 'competences' ? 'active' : ''}
          onClick={() => setActiveTab('competences')}
        >
          <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '8px' }} />
          Gestion des compétences
        </button>
      </div>

      {/* Statistiques */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon students">
            <FontAwesomeIcon icon={faUserGraduate} />
          </div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-value">{etudiants.length}</h3>
            <p className="admin-stat-label">Étudiants</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon schedules">
            <FontAwesomeIcon icon={faCalendarAlt} />
          </div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-value">{emploisPersonnalises.length}</h3>
            <p className="admin-stat-label">Emplois du temps</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon departments">
            <FontAwesomeIcon icon={faBuilding} />
          </div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-value">4</h3>
            <p className="admin-stat-label">Filières</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon professors">
            <FontAwesomeIcon icon={faChalkboardTeacher} />
          </div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-value">{professors.length}</h3>
            <p className="admin-stat-label">Professeurs</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon modules">
            <FontAwesomeIcon icon={faBook} />
          </div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-value">{modules.length}</h3>
            <p className="admin-stat-label">Modules</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon exams">
            <FontAwesomeIcon icon={faBook} />
          </div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-value">{examens.length}</h3>
            <p className="admin-stat-label">Examens</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon projects">
            <FontAwesomeIcon icon={faTasks} />
          </div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-value">{projets.length}</h3>
            <p className="admin-stat-label">Projets</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon formations">
            <FontAwesomeIcon icon={faGraduationCap} />
          </div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-value">{formations.length}</h3>
            <p className="admin-stat-label">Formations</p>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {error && (
          <div className="error-message">
            <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
            {error}
          </div>
        )}

        {activeTab === 'emplois' && (
          <div className="emplois-list">
            <h2>Liste des emplois du temps</h2>
            {loading ? (
              <p>Chargement...</p>
            ) : emploisPersonnalises.length === 0 ? (
              <p>Aucun emploi du temps trouvé.</p>
            ) : (
              <table className="emplois-table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Filière</th>
                    <th>Année</th>
                    <th>Nombre d'étudiants</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emploisPersonnalises.map(emploi => (
                    <tr key={emploi._id}>
                      <td>{emploi.titre}</td>
                      <td>{emploi.filiere}</td>
                      <td>{emploi.annee}</td>
                      <td>
                        {emploi.pourTouteFiliere
                          ? etudiants.filter(etudiant =>
                              (emploi.filiere === 'tous' || etudiant.filiere.toLowerCase() === emploi.filiere.toLowerCase()) &&
                              (emploi.annee === 'tous' || String(etudiant.annee) === String(emploi.annee))
                            ).length
                          : emploi.etudiants.length
                        }
                      </td>
                      <td>
                        <button
                          onClick={() => navigate(`/admin/emplois/${emploi._id}`)}
                          className="view-btn"
                        >
                          <FontAwesomeIcon icon={faEye} /> Voir
                        </button>
                        <button
                          onClick={() => openEditEmploiForm(emploi._id)}
                          className="edit-btn"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Modifier
                        </button>
                        <button
                          onClick={() => deleteEmploiPersonnalise(emploi._id)}
                          className="delete-btn"
                        >
                          <FontAwesomeIcon icon={faTrash} /> Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'creer' && (
          <div className="create-emploi">
            <h2>{formMode === 'add' ? 'Créer un emploi du temps' : 'Modifier un emploi du temps'}</h2>
            <form onSubmit={handleSubmit} className="emploi-form">
              <div className="form-group">
                <label>Titre:</label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Filière:</label>
                  <select
                    name="filiere"
                    value={formData.filiere}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    <option value="iacs">IACS</option>
                    <option value="aa">AA</option>
                    <option value="g2er">G2ER</option>
                    <option value="tdi">TDI</option>
                    <option value="tous">Toutes les filières</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Année:</label>
                  <select
                    name="annee"
                    value={formData.annee}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    <option value="1">1ère année</option>
                    <option value="2">2ème année</option>
                    <option value="3">3ème année</option>
                    <option value="tous">Toutes les années</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Attribuer à:</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="attributionMode"
                      value="filiere"
                      checked={formData.pourTouteFiliere}
                      onChange={handleAttributionModeChange}
                    />
                    Toute la filière/année sélectionnée
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="attributionMode"
                      value="etudiants"
                      checked={!formData.pourTouteFiliere}
                      onChange={handleAttributionModeChange}
                    />
                    Étudiants spécifiques
                  </label>
                </div>
                <div style={{ marginTop: '10px', color: '#4361ee', fontSize: '0.9rem' }}>
                  <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '5px' }} />
                  L'emploi du temps sera automatiquement mis à jour pour les étudiants concernés.
                </div>
              </div>

              {showStudentSelection && (
                <div className="form-group">
                  <label>Étudiants:</label>
                  <select
                    multiple
                    name="etudiants"
                    value={formData.etudiants}
                    onChange={handleEtudiantSelection}
                    className="students-select"
                    required={!formData.pourTouteFiliere}
                  >
                    {etudiants
                      .filter(etudiant => {
                        // Ignorer la casse lors de la comparaison des filières
                        const filiereMatch = formData.filiere === 'tous' ||
                          etudiant.filiere.toLowerCase() === formData.filiere.toLowerCase();

                        // Convertir l'année en string pour la comparaison
                        const anneeMatch = formData.annee === 'tous' ||
                          String(etudiant.annee) === String(formData.annee);

                        return filiereMatch && anneeMatch;
                      })
                      .map(etudiant => (
                        <option key={etudiant._id} value={etudiant._id}>
                          {etudiant.nom} {etudiant.prenom} ({etudiant.filiere} - {etudiant.annee})
                        </option>
                      ))
                    }
                  </select>
                  <small>Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs étudiants</small>
                </div>
              )}

              <h3>Emploi du temps</h3>

              {formData.emplois.map((jour, jourIndex) => (
                <div key={jour.jour} className="jour-section">
                  <h4>{jour.jour}</h4>

                  {jour.creneaux.map((creneau, creneauIndex) => (
                    <div key={creneauIndex} className="creneau-row">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Module:</label>
                          <select
                            value={creneau.module}
                            onChange={(e) => handleCreneauChange(jour.jour, creneauIndex, 'module', e.target.value)}
                            required
                          >
                            <option value="">-- Sélectionner un module --</option>
                            {modules
                              .filter(module =>
                                module.filiere === formData.filiere ||
                                module.filiere === 'tous'
                              )
                              .filter(module =>
                                module.annee === formData.annee ||
                                module.annee === 'tous'
                              )
                              .map(module => (
                                <option key={module._id} value={module._id}>
                                  {module.code} - {module.nom}
                                </option>
                              ))
                            }
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Début:</label>
                          <input
                            type="time"
                            value={creneau.debut}
                            onChange={(e) => handleCreneauChange(jour.jour, creneauIndex, 'debut', e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Fin:</label>
                          <input
                            type="time"
                            value={creneau.fin}
                            onChange={(e) => handleCreneauChange(jour.jour, creneauIndex, 'fin', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Salle:</label>
                          <input
                            type="text"
                            value={creneau.salle}
                            onChange={(e) => handleCreneauChange(jour.jour, creneauIndex, 'salle', e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Professeur:</label>
                          <select
                            value={creneau.professeur}
                            onChange={(e) => handleCreneauChange(jour.jour, creneauIndex, 'professeur', e.target.value)}
                            required
                          >
                            <option value="">-- Sélectionner un professeur --</option>
                            {professors.map(professor => (
                              <option key={professor._id} value={professor._id}>
                                {professor.nom} {professor.prenom} ({professor.specialite})
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeCreneau(jour.jour, creneauIndex)}
                          className="remove-btn"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addCreneau(jour.jour)}
                    className="add-btn"
                  >
                    + Ajouter un créneau
                  </button>
                </div>
              ))}

              <div className="form-actions">
                <button type="submit" disabled={loading} className="submit-btn">
                  <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
                  {loading ? (formMode === 'add' ? 'Création en cours...' : 'Mise à jour en cours...') : (formMode === 'add' ? 'Créer et appliquer l\'emploi du temps' : 'Mettre à jour l\'emploi du temps')}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'etudiants' && (
          <div className="manage-etudiants">
            <div className="header-actions">
              <h2>Gestion des étudiants</h2>
              <button
                className="add-btn"
                onClick={openAddEtudiantForm}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faPlus} /> Ajouter un étudiant
              </button>
            </div>

            {showEtudiantForm ? (
              <div className="etudiant-form-container">
                <h3>{etudiantFormMode === 'add' ? 'Ajouter un étudiant' : 'Modifier un étudiant'}</h3>
                <form onSubmit={handleEtudiantFormSubmit} className="etudiant-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>CIN:</label>
                      <input
                        type="text"
                        name="cin"
                        value={etudiantFormData.cin}
                        onChange={handleEtudiantFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Numéro Apogée:</label>
                      <input
                        type="text"
                        name="apogee"
                        value={etudiantFormData.apogee}
                        onChange={handleEtudiantFormChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Nom:</label>
                      <input
                        type="text"
                        name="nom"
                        value={etudiantFormData.nom}
                        onChange={handleEtudiantFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Prénom:</label>
                      <input
                        type="text"
                        name="prenom"
                        value={etudiantFormData.prenom}
                        onChange={handleEtudiantFormChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={etudiantFormData.email}
                      onChange={handleEtudiantFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{etudiantFormMode === 'add' ? 'Mot de passe:' : 'Nouveau mot de passe (laisser vide pour ne pas changer):'}</label>
                    <input
                      type="password"
                      name="password"
                      value={etudiantFormData.password}
                      onChange={handleEtudiantFormChange}
                      required={etudiantFormMode === 'add'}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Filière:</label>
                      <select
                        name="filiere"
                        value={etudiantFormData.filiere}
                        onChange={handleEtudiantFormChange}
                        required
                      >
                        <option value="">-- Sélectionner --</option>
                        <option value="iacs">IACS</option>
                        <option value="aa">AA</option>
                        <option value="g2er">G2ER</option>
                        <option value="tdi">TDI</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Année:</label>
                      <select
                        name="annee"
                        value={etudiantFormData.annee}
                        onChange={handleEtudiantFormChange}
                        required
                      >
                        <option value="">-- Sélectionner --</option>
                        <option value="1">1ère année</option>
                        <option value="2">2ème année</option>
                        <option value="3">3ème année</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setShowEtudiantForm(false);
                        setSelectedEtudiant(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} /> Annuler
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={etudiantFormMode === 'add' ? faPlus : faEdit} />
                      {loading ? 'Traitement en cours...' : (etudiantFormMode === 'add' ? 'Ajouter' : 'Mettre à jour')}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="etudiants-list">
                {loading && <p>Chargement...</p>}

                {!loading && etudiants.length === 0 ? (
                  <p>Aucun étudiant trouvé.</p>
                ) : (
                  <table className="etudiants-table">
                    <thead>
                      <tr>
                        <th>CIN</th>
                        <th>Apogée</th>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Email</th>
                        <th>Filière</th>
                        <th>Année</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {etudiants.map(etudiant => (
                        <tr key={etudiant._id}>
                          <td>{etudiant.cin}</td>
                          <td>{etudiant.apogee}</td>
                          <td>{etudiant.nom}</td>
                          <td>{etudiant.prenom}</td>
                          <td>{etudiant.email}</td>
                          <td>{etudiant.filiere.toUpperCase()}</td>
                          <td>{etudiant.annee}</td>
                          <td>
                            <button
                              className="edit-btn"
                              onClick={() => openEditEtudiantForm(etudiant)}
                            >
                              <FontAwesomeIcon icon={faEdit} /> Modifier
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => deleteEtudiant(etudiant._id)}
                            >
                              <FontAwesomeIcon icon={faTrash} /> Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'professeurs' && (
          <div className="manage-professors">
            <div className="header-actions">
              <h2>Gestion des professeurs</h2>
              <button
                className="add-btn"
                onClick={openAddProfessorForm}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faPlus} /> Ajouter un professeur
              </button>
            </div>

            {showProfessorForm ? (
              <div className="professor-form-container">
                <h3>{professorFormMode === 'add' ? 'Ajouter un professeur' : 'Modifier un professeur'}</h3>
                <form onSubmit={handleProfessorFormSubmit} className="professor-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>CIN:</label>
                      <input
                        type="text"
                        name="cin"
                        value={professorFormData.cin}
                        onChange={handleProfessorFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Matricule:</label>
                      <input
                        type="text"
                        name="matricule"
                        value={professorFormData.matricule}
                        onChange={handleProfessorFormChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Nom:</label>
                      <input
                        type="text"
                        name="nom"
                        value={professorFormData.nom}
                        onChange={handleProfessorFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Prénom:</label>
                      <input
                        type="text"
                        name="prenom"
                        value={professorFormData.prenom}
                        onChange={handleProfessorFormChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={professorFormData.email}
                      onChange={handleProfessorFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{professorFormMode === 'add' ? 'Mot de passe:' : 'Nouveau mot de passe (laisser vide pour ne pas changer):'}</label>
                    <input
                      type="password"
                      name="password"
                      value={professorFormData.password}
                      onChange={handleProfessorFormChange}
                      required={professorFormMode === 'add'}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Spécialité:</label>
                      <input
                        type="text"
                        name="specialite"
                        value={professorFormData.specialite}
                        onChange={handleProfessorFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Téléphone:</label>
                      <input
                        type="text"
                        name="telephone"
                        value={professorFormData.telephone}
                        onChange={handleProfessorFormChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Modules enseignés:</label>
                    <select
                      name="modules"
                      value={professorFormData.modules}
                      onChange={handleProfessorFormChange}
                      multiple
                      size="5"
                    >
                      {modules.map(module => (
                        <option key={module._id} value={module._id}>
                          {module.code} - {module.nom}
                        </option>
                      ))}
                    </select>
                    <small>Maintenez la touche Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs modules.</small>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setShowProfessorForm(false);
                        setSelectedProfessor(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} /> Annuler
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={professorFormMode === 'add' ? faPlus : faEdit} />
                      {loading ? 'Traitement en cours...' : (professorFormMode === 'add' ? 'Ajouter' : 'Mettre à jour')}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="professors-list">
                {loading && <p>Chargement...</p>}

                {!loading && professors.length === 0 ? (
                  <p>Aucun professeur trouvé.</p>
                ) : (
                  <table className="professors-table">
                    <thead>
                      <tr>
                        <th>CIN</th>
                        <th>Matricule</th>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Email</th>
                        <th>Spécialité</th>
                        <th>Modules</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {professors.map(professor => (
                        <tr key={professor._id}>
                          <td>{professor.cin}</td>
                          <td>{professor.matricule}</td>
                          <td>{professor.nom}</td>
                          <td>{professor.prenom}</td>
                          <td>{professor.email}</td>
                          <td>{professor.specialite}</td>
                          <td>
                            {professor.modules && professor.modules.length > 0
                              ? professor.modules.map(m => typeof m === 'object' ? `${m.code} - ${m.nom}` : m).join(', ')
                              : 'Aucun'}
                          </td>
                          <td>
                            <button
                              className="edit-btn"
                              onClick={() => openEditProfessorForm(professor)}
                            >
                              <FontAwesomeIcon icon={faEdit} /> Modifier
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => deleteProfessor(professor._id)}
                            >
                              <FontAwesomeIcon icon={faTrash} /> Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'modules' && (
          <div className="manage-modules">
            <div className="header-actions">
              <h2>Gestion des modules</h2>
              <button
                className="add-btn"
                onClick={openAddModuleForm}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faPlus} /> Ajouter un module
              </button>
            </div>

            {showModuleForm ? (
              <div className="module-form-container">
                <h3>{moduleFormMode === 'add' ? 'Ajouter un module' : 'Modifier un module'}</h3>
                <form onSubmit={handleModuleFormSubmit} className="module-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Code:</label>
                      <input
                        type="text"
                        name="code"
                        value={moduleFormData.code}
                        onChange={handleModuleFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Nom:</label>
                      <input
                        type="text"
                        name="nom"
                        value={moduleFormData.nom}
                        onChange={handleModuleFormChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      name="description"
                      value={moduleFormData.description}
                      onChange={handleModuleFormChange}
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Filière:</label>
                      <select
                        name="filiere"
                        value={moduleFormData.filiere}
                        onChange={handleModuleFormChange}
                        required
                      >
                        <option value="">-- Sélectionner une filière --</option>
                        <option value="iacs">IACS</option>
                        <option value="aa">AA</option>
                        <option value="g2er">G2ER</option>
                        <option value="tdi">TDI</option>
                        <option value="tous">Tous</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Année:</label>
                      <select
                        name="annee"
                        value={moduleFormData.annee}
                        onChange={handleModuleFormChange}
                        required
                      >
                        <option value="">-- Sélectionner une année --</option>
                        <option value="1">1ère année</option>
                        <option value="2">2ème année</option>
                        <option value="3">3ème année</option>
                        <option value="tous">Tous</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Professeurs:</label>
                    <select
                      name="professeurs"
                      value={moduleFormData.professeurs}
                      onChange={handleModuleFormChange}
                      multiple
                      size="5"
                    >
                      {professors.map(professor => (
                        <option key={professor._id} value={professor._id}>
                          {professor.nom} {professor.prenom} ({professor.specialite})
                        </option>
                      ))}
                    </select>
                    <small>Maintenez la touche Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs professeurs.</small>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setShowModuleForm(false);
                        setSelectedModule(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} /> Annuler
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={moduleFormMode === 'add' ? faPlus : faEdit} />
                      {loading ? 'Traitement en cours...' : (moduleFormMode === 'add' ? 'Ajouter' : 'Mettre à jour')}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="modules-list">
                {loading && <p>Chargement...</p>}

                {!loading && modules.length === 0 ? (
                  <p>Aucun module trouvé.</p>
                ) : (
                  <table className="modules-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Nom</th>
                        <th>Filière</th>
                        <th>Année</th>
                        <th>Professeurs</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map(module => (
                        <tr key={module._id}>
                          <td>{module.code}</td>
                          <td>{module.nom}</td>
                          <td>{module.filiere === 'tous' ? 'Tous' : module.filiere.toUpperCase()}</td>
                          <td>{module.annee === 'tous' ? 'Tous' : `${module.annee}ème année`}</td>
                          <td>
                            {module.professeurs && module.professeurs.length > 0
                              ? module.professeurs.map(p => `${p.nom} ${p.prenom}`).join(', ')
                              : 'Aucun'}
                          </td>
                          <td>
                            <button
                              className="edit-btn"
                              onClick={() => openEditModuleForm(module)}
                            >
                              <FontAwesomeIcon icon={faEdit} /> Modifier
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => deleteModule(module._id)}
                            >
                              <FontAwesomeIcon icon={faTrash} /> Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'projets' && (
          <div className="manage-projets">
            <div className="header-actions">
              <h2>Gestion des projets et deadlines</h2>
              <button
                className="add-btn"
                onClick={openAddProjetForm}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faPlus} /> Ajouter des projets
              </button>
            </div>

            {showProjetForm ? (
              <div className="projet-form-container">
                <h3>{projetFormMode === 'add' ? 'Ajouter des projets' : 'Modifier des projets'}</h3>
                <form onSubmit={handleProjetFormSubmit} className="projet-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Filière:</label>
                      <select
                        name="filiere"
                        value={projetFormData.filiere}
                        onChange={handleProjetFormChange}
                        required
                      >
                        <option value="">-- Sélectionner --</option>
                        <option value="iacs">IACS</option>
                        <option value="aa">AA</option>
                        <option value="g2er">G2ER</option>
                        <option value="tdi">TDI</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Année:</label>
                      <select
                        name="annee"
                        value={projetFormData.annee}
                        onChange={handleProjetFormChange}
                        required
                      >
                        <option value="">-- Sélectionner --</option>
                        <option value="1">1ère année</option>
                        <option value="2">2ème année</option>
                        <option value="3">3ème année</option>
                      </select>
                    </div>
                  </div>

                  <h4>Liste des projets</h4>

                  {projetFormData.projets.length === 0 ? (
                    <p>Aucun projet ajouté. Utilisez le bouton ci-dessous pour ajouter des projets.</p>
                  ) : (
                    <table className="projets-table">
                      <thead>
                        <tr>
                          <th>Nom</th>
                          <th>Description</th>
                          <th>Deadline</th>
                          <th>Statut</th>
                          <th>Module</th>
                          <th>Professeur</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projetFormData.projets.map((projet, index) => (
                          <tr key={index}>
                            <td>{projet.nom}</td>
                            <td>{projet.description}</td>
                            <td>{new Date(projet.deadline).toLocaleDateString()}</td>
                            <td>
                              <span className={`statut ${projet.statut.replace(/\s/g, '').toLowerCase()}`}>
                                {projet.statut}
                              </span>
                            </td>
                            <td>
                              {modules.find(m => m._id === projet.module)?.nom || 'Non spécifié'}
                            </td>
                            <td>
                              {professors.find(p => p._id === projet.professeur)?.nom || 'Non spécifié'}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="edit-btn"
                                onClick={() => openEditProjetItemForm(index)}
                              >
                                <FontAwesomeIcon icon={faEdit} /> Modifier
                              </button>
                              <button
                                type="button"
                                className="delete-btn"
                                onClick={() => removeProjetItem(index)}
                              >
                                <FontAwesomeIcon icon={faTrash} /> Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {!showProjetItemForm ? (
                    <button
                      type="button"
                      className="add-btn"
                      onClick={openAddProjetItemForm}
                      style={{ marginTop: '1rem' }}
                    >
                      <FontAwesomeIcon icon={faPlus} /> Ajouter un projet
                    </button>
                  ) : (
                    <div className="projet-item-form">
                      <h4>{projetItemFormMode === 'add' ? 'Ajouter un projet' : 'Modifier un projet'}</h4>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Nom:</label>
                          <input
                            type="text"
                            name="nom"
                            value={projetItemFormData.nom}
                            onChange={handleProjetItemFormChange}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Deadline:</label>
                          <input
                            type="date"
                            name="deadline"
                            value={projetItemFormData.deadline}
                            onChange={handleProjetItemFormChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Description:</label>
                        <textarea
                          name="description"
                          value={projetItemFormData.description}
                          onChange={handleProjetItemFormChange}
                          rows="3"
                        ></textarea>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Statut:</label>
                          <select
                            name="statut"
                            value={projetItemFormData.statut}
                            onChange={handleProjetItemFormChange}
                            required
                          >
                            <option value="Prévu">Prévu</option>
                            <option value="À faire">À faire</option>
                            <option value="En cours">En cours</option>
                            <option value="Terminé">Terminé</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Module:</label>
                          <select
                            name="module"
                            value={projetItemFormData.module}
                            onChange={handleProjetItemFormChange}
                          >
                            <option value="">-- Sélectionner un module --</option>
                            {modules
                              .filter(module =>
                                !projetFormData.filiere ||
                                module.filiere === projetFormData.filiere ||
                                module.filiere === 'tous'
                              )
                              .filter(module =>
                                !projetFormData.annee ||
                                module.annee === projetFormData.annee ||
                                module.annee === 'tous'
                              )
                              .map(module => (
                                <option key={module._id} value={module._id}>
                                  {module.code} - {module.nom}
                                </option>
                              ))
                            }
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Professeur:</label>
                        <select
                          name="professeur"
                          value={projetItemFormData.professeur}
                          onChange={handleProjetItemFormChange}
                        >
                          <option value="">-- Sélectionner un professeur --</option>
                          {professors.map(professor => (
                            <option key={professor._id} value={professor._id}>
                              {professor.nom} {professor.prenom} ({professor.specialite})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-actions">
                        <button
                          type="button"
                          className="cancel-btn"
                          onClick={() => {
                            setShowProjetItemForm(false);
                            setSelectedProjetItemIndex(-1);
                          }}
                        >
                          <FontAwesomeIcon icon={faTimes} /> Annuler
                        </button>
                        <button
                          type="button"
                          className="submit-btn"
                          onClick={addProjetItem}
                        >
                          <FontAwesomeIcon icon={projetItemFormMode === 'add' ? faPlus : faEdit} />
                          {projetItemFormMode === 'add' ? 'Ajouter' : 'Mettre à jour'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="form-actions" style={{ marginTop: '2rem' }}>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setShowProjetForm(false);
                        setSelectedProjet(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} /> Annuler
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={loading || projetFormData.projets.length === 0}
                    >
                      <FontAwesomeIcon icon={projetFormMode === 'add' ? faPlus : faEdit} />
                      {loading ? 'Traitement en cours...' : (projetFormMode === 'add' ? 'Enregistrer les projets' : 'Mettre à jour les projets')}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="projets-list">
                {loading && <p>Chargement...</p>}

                {!loading && projets.length === 0 ? (
                  <p>Aucun projet trouvé.</p>
                ) : (
                  <table className="projets-table">
                    <thead>
                      <tr>
                        <th>Filière</th>
                        <th>Année</th>
                        <th>Nombre de projets</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projets.map(projet => (
                        <tr key={projet._id}>
                          <td>{projet.filiere.toUpperCase()}</td>
                          <td>{projet.annee}ème année</td>
                          <td>{projet.projets ? projet.projets.length : 0}</td>
                          <td>
                            <button
                              className="edit-btn"
                              onClick={() => openEditProjetForm(projet)}
                            >
                              <FontAwesomeIcon icon={faEdit} /> Modifier
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => deleteProjet(projet)}
                            >
                              <FontAwesomeIcon icon={faTrash} /> Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'examens' && (
          <div className="manage-examens">
            <div className="header-actions">
              <h2>Gestion des examens</h2>
              <div className="action-buttons">
                <div className="sync-buttons">
                  <button
                    className="sync-btn"
                    onClick={synchronizeAllExams}
                    disabled={loading || syncingExams}
                    title="Synchroniser tous les examens avec les plannings des étudiants"
                  >
                    <FontAwesomeIcon icon={faSyncAlt} spin={syncingExams} />
                    {syncingExams ? 'Synchronisation en cours...' : 'Synchroniser avec les plannings'}
                  </button>
                  <button
                    className="cleanup-btn"
                    onClick={cleanupPlanningExams}
                    disabled={loading || syncingExams}
                    title="Nettoyer les doublons dans les plannings"
                  >
                    <FontAwesomeIcon icon={faBroom} spin={syncingExams} />
                    {syncingExams ? 'Nettoyage en cours...' : 'Nettoyer les doublons'}
                  </button>
                  <button
                    className="remove-orphans-btn"
                    onClick={removeOrphanExams}
                    disabled={loading || syncingExams}
                    title="Supprimer les examens qui n'ont pas été créés par l'administrateur"
                  >
                    <FontAwesomeIcon icon={faTrash} spin={syncingExams} />
                    {syncingExams ? 'Suppression en cours...' : 'Supprimer examens non admin'}
                  </button>
                  <button
                    className="compare-btn"
                    onClick={compareExams}
                    disabled={loading || syncingExams}
                    title="Comparer les examens entre les collections"
                  >
                    <FontAwesomeIcon icon={faSearch} spin={syncingExams} />
                    {syncingExams ? 'Comparaison en cours...' : 'Comparer les examens'}
                  </button>
                  <button
                    className="force-resync-btn"
                    onClick={forceResync}
                    disabled={loading || syncingExams}
                    title="Forcer une resynchronisation complète (méthode alternative)"
                  >
                    <FontAwesomeIcon icon={faExclamationTriangle} spin={syncingExams} />
                    {syncingExams ? 'Resynchronisation en cours...' : 'Forcer resynchronisation'}
                  </button>
                </div>
                <button
                  className="add-btn"
                  onClick={openAddExamenForm}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faPlus} /> Ajouter un examen
                </button>
              </div>
            </div>

            {showExamenForm ? (
              <div className="examen-form-container">
                <h3>{examenFormMode === 'add' ? 'Ajouter un examen' : 'Modifier un examen'}</h3>
                <form onSubmit={handleExamenFormSubmit} className="examen-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Titre:</label>
                      <input
                        type="text"
                        name="titre"
                        value={examenFormData.titre}
                        onChange={handleExamenFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Type:</label>
                      <select
                        name="type"
                        value={examenFormData.type}
                        onChange={handleExamenFormChange}
                        required
                      >
                        <option value="Contrôle Continu">Contrôle Continu</option>
                        <option value="Examen Final">Examen Final</option>
                        <option value="Rattrapage">Rattrapage</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      name="description"
                      value={examenFormData.description}
                      onChange={handleExamenFormChange}
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date:</label>
                      <input
                        type="date"
                        name="date"
                        value={examenFormData.date}
                        onChange={handleExamenFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Heure de début:</label>
                      <input
                        type="time"
                        name="heureDebut"
                        value={examenFormData.heureDebut}
                        onChange={handleExamenFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Heure de fin:</label>
                      <input
                        type="time"
                        name="heureFin"
                        value={examenFormData.heureFin}
                        onChange={handleExamenFormChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Salle:</label>
                      <input
                        type="text"
                        name="salle"
                        value={examenFormData.salle}
                        onChange={handleExamenFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Module:</label>
                      <select
                        name="module"
                        value={examenFormData.module}
                        onChange={handleExamenFormChange}
                        required
                      >
                        <option value="">-- Sélectionner un module --</option>
                        {modules.map(module => (
                          <option key={module._id} value={module._id}>
                            {module.code} - {module.nom}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Professeur:</label>
                      <select
                        name="professeur"
                        value={examenFormData.professeur}
                        onChange={handleExamenFormChange}
                        required
                      >
                        <option value="">-- Sélectionner un professeur --</option>
                        {professors.map(professor => (
                          <option key={professor._id} value={professor._id}>
                            {professor.nom} {professor.prenom} ({professor.specialite})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Filière:</label>
                      <select
                        name="filiere"
                        value={examenFormData.filiere}
                        onChange={handleExamenFormChange}
                        required
                      >
                        <option value="">-- Sélectionner une filière --</option>
                        <option value="iacs">IACS</option>
                        <option value="aa">AA</option>
                        <option value="g2er">G2ER</option>
                        <option value="tdi">TDI</option>
                        <option value="tous">Tous</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Année:</label>
                      <select
                        name="annee"
                        value={examenFormData.annee}
                        onChange={handleExamenFormChange}
                        required
                      >
                        <option value="">-- Sélectionner une année --</option>
                        <option value="1">1ère année</option>
                        <option value="2">2ème année</option>
                        <option value="3">3ème année</option>
                        <option value="tous">Tous</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="pourTouteFiliere"
                        checked={examenFormData.pourTouteFiliere}
                        onChange={handleExamenFormChange}
                      />
                      Pour tous les étudiants de cette filière et année
                    </label>
                  </div>

                  {!examenFormData.pourTouteFiliere && (
                    <div className="form-group">
                      <label>Étudiants spécifiques:</label>
                      {etudiants.length === 0 ? (
                        <div className="alert alert-warning">
                          Chargement des étudiants... Si cette alerte persiste, veuillez rafraîchir la page.
                        </div>
                      ) : (
                        <>
                          <select
                            name="etudiants"
                            value={examenFormData.etudiants}
                            onChange={handleExamenFormChange}
                            multiple
                            size="5"
                            style={{ width: '100%', minHeight: '150px' }}
                          >
                            {etudiants
                              .filter(etudiant =>
                                (examenFormData.filiere === 'tous' || etudiant.filiere.toLowerCase() === examenFormData.filiere.toLowerCase()) &&
                                (examenFormData.annee === 'tous' || String(etudiant.annee) === String(examenFormData.annee))
                              )
                              .map(etudiant => (
                                <option key={etudiant._id} value={etudiant._id}>
                                  {etudiant.nom} {etudiant.prenom} ({etudiant.filiere.toUpperCase()} - {etudiant.annee}ème année)
                                </option>
                              ))
                            }
                          </select>
                          <small>Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs étudiants</small>
                          <div style={{ marginTop: '5px', fontSize: '0.9em', color: '#666' }}>
                            {examenFormData.filiere && examenFormData.annee ?
                              `${etudiants.filter(etudiant =>
                                (examenFormData.filiere === 'tous' || etudiant.filiere.toLowerCase() === examenFormData.filiere.toLowerCase()) &&
                                (examenFormData.annee === 'tous' || String(etudiant.annee) === String(examenFormData.annee))
                              ).length} étudiants disponibles` :
                              'Veuillez sélectionner une filière et une année pour voir les étudiants disponibles'
                            }
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setShowExamenForm(false);
                        setSelectedExamen(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} /> Annuler
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={examenFormMode === 'add' ? faPlus : faEdit} />
                      {loading ? 'Traitement en cours...' : (examenFormMode === 'add' ? 'Ajouter' : 'Mettre à jour')}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="examens-list">
                {loading && <p>Chargement...</p>}

                {!loading && examens.length === 0 ? (
                  <p>Aucun examen trouvé.</p>
                ) : (
                  <table className="examens-table">
                    <thead>
                      <tr>
                        <th>Titre</th>
                        <th>Date</th>
                        <th>Heure</th>
                        <th>Salle</th>
                        <th>Module</th>
                        <th>Filière</th>
                        <th>Année</th>
                        <th>Type</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examens.map(examen => (
                        <tr key={examen._id}>
                          <td>{examen.titre}</td>
                          <td>{new Date(examen.date).toLocaleDateString()}</td>
                          <td>{examen.heureDebut} - {examen.heureFin}</td>
                          <td>{examen.salle}</td>
                          <td>{examen.module}</td>
                          <td>{examen.filiere === 'tous' ? 'Tous' : examen.filiere.toUpperCase()}</td>
                          <td>{examen.annee === 'tous' ? 'Tous' : `${examen.annee}ème année`}</td>
                          <td>{examen.type}</td>
                          <td>
                            <button
                              className="edit-btn"
                              onClick={() => openEditExamenForm(examen)}
                            >
                              <FontAwesomeIcon icon={faEdit} /> Modifier
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => deleteExamen(examen._id)}
                            >
                              <FontAwesomeIcon icon={faTrash} /> Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'evenements' && (
          <div className="manage-evenements">
            <div className="header-actions">
              <h2>Gestion des événements</h2>
              <button
                className="add-btn"
                onClick={openAddEvenementForm}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faPlus} /> Ajouter un événement
              </button>
            </div>

            {showEvenementForm ? (
              <div className="evenement-form-container">
                <h3>{evenementFormMode === 'add' ? 'Ajouter un événement' : 'Modifier un événement'}</h3>
                <form onSubmit={handleEvenementFormSubmit} className="evenement-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Titre:</label>
                      <input
                        type="text"
                        name="titre"
                        value={evenementFormData.titre}
                        onChange={handleEvenementFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Type:</label>
                      <select
                        name="type"
                        value={evenementFormData.type}
                        onChange={handleEvenementFormChange}
                        required
                      >
                        <option value="Conférence">Conférence</option>
                        <option value="Atelier">Atelier</option>
                        <option value="Séminaire">Séminaire</option>
                        <option value="Compétition">Compétition</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      name="description"
                      value={evenementFormData.description}
                      onChange={handleEvenementFormChange}
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date de début:</label>
                      <input
                        type="date"
                        name="dateDebut"
                        value={evenementFormData.dateDebut}
                        onChange={handleEvenementFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Heure de début:</label>
                      <input
                        type="time"
                        name="heureDebut"
                        value={evenementFormData.heureDebut}
                        onChange={handleEvenementFormChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date de fin:</label>
                      <input
                        type="date"
                        name="dateFin"
                        value={evenementFormData.dateFin}
                        onChange={handleEvenementFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Heure de fin:</label>
                      <input
                        type="time"
                        name="heureFin"
                        value={evenementFormData.heureFin}
                        onChange={handleEvenementFormChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Lieu:</label>
                      <input
                        type="text"
                        name="lieu"
                        value={evenementFormData.lieu}
                        onChange={handleEvenementFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Organisateur:</label>
                      <input
                        type="text"
                        name="organisateur"
                        value={evenementFormData.organisateur}
                        onChange={handleEvenementFormChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Image (URL):</label>
                    <input
                      type="text"
                      name="image"
                      value={evenementFormData.image}
                      onChange={handleEvenementFormChange}
                      placeholder="URL de l'image (optionnel)"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Filière:</label>
                      <select
                        name="filiere"
                        value={evenementFormData.filiere}
                        onChange={handleEvenementFormChange}
                        required
                      >
                        <option value="">-- Sélectionner une filière --</option>
                        <option value="iacs">IACS</option>
                        <option value="aa">AA</option>
                        <option value="g2er">G2ER</option>
                        <option value="tdi">TDI</option>
                        <option value="tous">Tous</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Année:</label>
                      <select
                        name="annee"
                        value={evenementFormData.annee}
                        onChange={handleEvenementFormChange}
                        required
                      >
                        <option value="">-- Sélectionner une année --</option>
                        <option value="1">1ère année</option>
                        <option value="2">2ème année</option>
                        <option value="3">3ème année</option>
                        <option value="tous">Tous</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="pourTouteFiliere"
                        checked={evenementFormData.pourTouteFiliere}
                        onChange={handleEvenementFormChange}
                      />
                      Pour tous les étudiants de cette filière et année
                    </label>
                  </div>

                  {!evenementFormData.pourTouteFiliere && (
                    <div className="form-group">
                      <label>Étudiants spécifiques:</label>
                      <select
                        name="etudiants"
                        value={evenementFormData.etudiants}
                        onChange={handleEvenementFormChange}
                        multiple
                        size="5"
                      >
                        {etudiants
                          .filter(etudiant =>
                            (evenementFormData.filiere === 'tous' || etudiant.filiere.toLowerCase() === evenementFormData.filiere.toLowerCase()) &&
                            (evenementFormData.annee === 'tous' || String(etudiant.annee) === String(evenementFormData.annee))
                          )
                          .map(etudiant => (
                            <option key={etudiant._id} value={etudiant._id}>
                              {etudiant.nom} {etudiant.prenom} ({etudiant.filiere} - {etudiant.annee})
                            </option>
                          ))
                        }
                      </select>
                      <small>Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs étudiants</small>
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setShowEvenementForm(false);
                        setSelectedEvenement(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} /> Annuler
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={evenementFormMode === 'add' ? faPlus : faEdit} />
                      {loading ? 'Traitement en cours...' : (evenementFormMode === 'add' ? 'Ajouter' : 'Mettre à jour')}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="evenements-list">
                {loading && <p>Chargement...</p>}

                {!loading && evenements.length === 0 ? (
                  <p>Aucun événement trouvé.</p>
                ) : (
                  <table className="evenements-table">
                    <thead>
                      <tr>
                        <th>Titre</th>
                        <th>Date de début</th>
                        <th>Date de fin</th>
                        <th>Lieu</th>
                        <th>Type</th>
                        <th>Filière</th>
                        <th>Année</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evenements.map(evenement => (
                        <tr key={evenement._id}>
                          <td>{evenement.titre}</td>
                          <td>
                            {new Date(evenement.dateDebut).toLocaleDateString()}
                            {' '}
                            {new Date(evenement.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td>
                            {new Date(evenement.dateFin).toLocaleDateString()}
                            {' '}
                            {new Date(evenement.dateFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td>{evenement.lieu}</td>
                          <td>{evenement.type}</td>
                          <td>{evenement.filiere === 'tous' ? 'Tous' : evenement.filiere.toUpperCase()}</td>
                          <td>{evenement.annee === 'tous' ? 'Tous' : `${evenement.annee}ème année`}</td>
                          <td>
                            <button
                              className="edit-btn"
                              onClick={() => openEditEvenementForm(evenement)}
                            >
                              <FontAwesomeIcon icon={faEdit} /> Modifier
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => deleteEvenement(evenement._id)}
                            >
                              <FontAwesomeIcon icon={faTrash} /> Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'formations' && (
          <div className="manage-formations">
            <GestionFormations />
          </div>
        )}

        {activeTab === 'competences' && (
          <div className="manage-competences">
            <GestionCompetences />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
