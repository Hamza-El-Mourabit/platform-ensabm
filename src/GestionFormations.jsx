import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaPlus, FaUsers, FaTimes, FaUpload, FaImage } from 'react-icons/fa';
import './GestionFormations.css';

const GestionFormations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [currentFormation, setCurrentFormation] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [currentStudents, setCurrentStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    filiere: 'tous',
    dateDebut: '',
    dateFin: '',
    heureDebut: '09:00',
    heureFin: '17:00',
    duration: '',
    instructor: '',
    location: '',
    students: 0
  });

  // Récupérer toutes les formations
  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/formations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des formations');
      }

      const data = await response.json();
      setFormations(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      // Validation des dates et heures
      if (formData.dateDebut && formData.dateFin) {
        const dateDebut = new Date(formData.dateDebut);
        const dateFin = new Date(formData.dateFin);

        // Vérifier que la date de fin n'est pas antérieure à la date de début
        if (dateDebut > dateFin) {
          setError('La date de fin doit être postérieure ou égale à la date de début');
          return;
        }

        // Si les dates sont identiques, vérifier les heures
        if (dateDebut.toDateString() === dateFin.toDateString()) {
          if (formData.heureDebut && formData.heureFin) {
            // Comparer les heures
            if (formData.heureDebut >= formData.heureFin) {
              setError('L\'heure de fin doit être postérieure à l\'heure de début pour une formation se déroulant le même jour');
              return;
            }
          } else {
            setError('Les heures de début et de fin sont requises');
            return;
          }
        }
      } else {
        setError('Les dates de début et de fin sont requises');
        return;
      }

      // Uploader l'image si une nouvelle image a été sélectionnée
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        try {
          console.log('Tentative d\'upload de l\'image...');
          const uploadedImageUrl = await uploadImage();
          if (uploadedImageUrl) {
            console.log('Image uploadée avec succès, URL:', uploadedImageUrl);
            imageUrl = uploadedImageUrl;
          } else {
            // Si l'upload a échoué mais que ce n'est pas obligatoire, on continue
            console.warn('L\'upload de l\'image a échoué, mais ce n\'est pas obligatoire');
            if (!imageUrl) {
              // Si aucune URL d'image n'est définie, on utilise l'image par défaut
              imageUrl = '';
            }
          }
        } catch (uploadError) {
          console.error('Erreur lors de l\'upload de l\'image:', uploadError);
          // Si l'upload échoue mais qu'une URL d'image existe déjà, on la conserve
          if (!imageUrl) {
            imageUrl = '';
          }
        }
      }

      const token = localStorage.getItem('adminToken');
      const url = currentFormation
        ? `http://localhost:5000/api/formations/${currentFormation._id}`
        : 'http://localhost:5000/api/formations';

      const method = currentFormation ? 'PUT' : 'POST';

      // Créer une copie des données du formulaire sans le champ students
      const formDataToSend = { ...formData };
      delete formDataToSend.students; // Supprimer le champ students car il est géré automatiquement par le serveur

      // Mettre à jour l'URL de l'image si une nouvelle a été uploadée
      if (imageUrl) {
        formDataToSend.imageUrl = imageUrl;
      } else if (!formDataToSend.imageUrl || formDataToSend.imageUrl.trim() === '') {
        // Si l'URL de l'image est vide, ne pas l'inclure dans les données envoyées
        // Le backend utilisera une image par défaut
        delete formDataToSend.imageUrl;
      }

      // Convertir les dates en objets Date si elles sont définies
      if (formDataToSend.dateDebut) {
        // Créer une date à midi pour éviter les problèmes de fuseau horaire
        const dateDebut = new Date(formDataToSend.dateDebut);
        dateDebut.setHours(12, 0, 0, 0);
        formDataToSend.dateDebut = dateDebut;
      }
      if (formDataToSend.dateFin) {
        // Créer une date à midi pour éviter les problèmes de fuseau horaire
        const dateFin = new Date(formDataToSend.dateFin);
        dateFin.setHours(12, 0, 0, 0);
        formDataToSend.dateFin = dateFin;
      }

      // Vérifier que la date de fin n'est pas antérieure à la date de début
      if (formDataToSend.dateDebut && formDataToSend.dateFin) {
        const dateDebut = new Date(formDataToSend.dateDebut);
        const dateFin = new Date(formDataToSend.dateFin);

        // Si les dates sont identiques, s'assurer que l'heure de fin est postérieure à l'heure de début
        if (dateDebut.toDateString() === dateFin.toDateString() &&
            formDataToSend.heureDebut && formDataToSend.heureFin) {
          console.log('Dates identiques, vérification des heures');
          console.log('Heure début:', formDataToSend.heureDebut);
          console.log('Heure fin:', formDataToSend.heureFin);
        }
      }

      console.log('Données envoyées au serveur:', formDataToSend);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formDataToSend)
      });

      if (!response.ok) {
        // Essayer de récupérer les détails de l'erreur
        const errorData = await response.json().catch(() => ({}));
        console.error('Détails de l\'erreur:', errorData);

        // Afficher les erreurs de validation spécifiques si elles existent
        if (errorData.validationErrors) {
          const errorMessages = Object.entries(errorData.validationErrors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          throw new Error(`Erreurs de validation:\n${errorMessages}`);
        }

        throw new Error(errorData.message || 'Erreur lors de l\'enregistrement de la formation');
      }

      // Afficher un message de succès
      setSuccess(currentFormation
        ? 'Formation mise à jour avec succès'
        : 'Formation ajoutée avec succès'
      );

      // Rafraîchir la liste des formations
      fetchFormations();

      // Réinitialiser le formulaire
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        filiere: 'tous',
        dateDebut: '',
        dateFin: '',
        heureDebut: '09:00',
        heureFin: '17:00',
        duration: '',
        instructor: '',
        location: '',
        students: 0
      });

      // Réinitialiser les états liés à l'image
      setImageFile(null);
      setImagePreview('');

      setShowForm(false);
      setCurrentFormation(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    }
  };

  // Supprimer une formation
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/formations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la formation');
      }

      setSuccess('Formation supprimée avec succès');

      // Rafraîchir la liste des formations
      fetchFormations();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    }
  };

  // Modifier une formation
  const handleEdit = (formation) => {
    setCurrentFormation(formation);

    // Formater les dates pour l'input de type date (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date)
        ? date.toISOString().split('T')[0]
        : '';
    };



    setFormData({
      title: formation.title,
      description: formation.description,
      imageUrl: formation.imageUrl,
      filiere: formation.filiere || 'tous',
      dateDebut: formatDateForInput(formation.dateDebut),
      dateFin: formatDateForInput(formation.dateFin),
      heureDebut: formation.heureDebut || '09:00',
      heureFin: formation.heureFin || '17:00',
      duration: formation.duration || '',
      instructor: formation.instructor || '',
      location: formation.location || '',
      students: formation.students || 0
    });
    setShowForm(true);
  };

  // Voir les étudiants inscrits
  const viewStudents = async (id) => {
    try {
      setError('');
      const token = localStorage.getItem('adminToken');

      // Récupérer les détails complets de la formation avec les modules
      const formationResponse = await fetch(`http://localhost:5000/api/formations/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!formationResponse.ok) {
        throw new Error('Erreur lors de la récupération des détails de la formation');
      }

      const formationData = await formationResponse.json();
      setCurrentFormation(formationData);

      // Récupérer les étudiants inscrits
      const studentsResponse = await fetch(`http://localhost:5000/api/formations/${id}/etudiants`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!studentsResponse.ok) {
        throw new Error('Erreur lors de la récupération des étudiants inscrits');
      }

      const studentsData = await studentsResponse.json();
      console.log('Étudiants récupérés:', studentsData.length);

      // Stocker les étudiants dans les deux états
      setCurrentStudents(studentsData);
      setAllStudents(studentsData);
      setShowStudentsModal(true);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    }
  };

  // Désinscrire un étudiant
  const removeStudent = async (formationId, studentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir désinscrire cet étudiant ?')) {
      return;
    }

    try {
      setError('');
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/formations/${formationId}/inscription/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la désinscription de l\'étudiant');
      }

      // Mettre à jour la liste des étudiants
      setCurrentStudents(currentStudents.filter(student => student._id !== studentId));

      // Rafraîchir la liste des formations
      fetchFormations();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    }
  };

  // Gérer la sélection d'une image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setImageFile(file);
    setError('');

    // Créer une URL pour la prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Uploader l'image
  const uploadImage = async () => {
    if (!imageFile) {
      setError('Veuillez sélectionner une image');
      return null;
    }

    try {
      setUploadingImage(true);
      setError('');

      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('image', imageFile);

      console.log('Envoi de l\'image au serveur...');
      const response = await fetch('http://localhost:5000/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Réponse du serveur:', response.status);

      if (!response.ok) {
        // Essayer de récupérer les détails de l'erreur
        const errorData = await response.json().catch(() => ({}));
        console.error('Détails de l\'erreur d\'upload:', errorData);
        throw new Error(errorData.message || 'Erreur lors de l\'upload de l\'image');
      }

      const data = await response.json();
      console.log('Image uploadée avec succès:', data);
      return data.imageUrl;
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="gestion-formations-container">
      <div className="header-actions">
        <h2>Gestion des Formations</h2>
        <button
          className="add-btn"
          onClick={() => {
            setCurrentFormation(null);
            setFormData({
              title: '',
              description: '',
              imageUrl: '',
              filiere: 'tous',
              dateDebut: '',
              dateFin: '',
              heureDebut: '09:00',
              heureFin: '17:00',
              duration: '',
              instructor: '',
              location: '',
              students: 0
            });
            setShowForm(true);
          }}
        >
          <FaPlus /> Ajouter une formation
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="formation-form-container">
          <h3>{currentFormation ? 'Modifier la formation' : 'Ajouter une formation'}</h3>
          <form onSubmit={handleSubmit} className="formation-form">
            <div className="form-group">
              <label>Titre</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Image de la formation (optionnel)</label>
              <div className="image-upload-container">
                <div className="image-upload-input">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="URL de l'image (optionnel)"
                    className="image-url-input"
                  />
                  <span className="or-separator">OU</span>
                  <button
                    type="button"
                    className="upload-btn"
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploadingImage}
                  >
                    <FaUpload /> {uploadingImage ? 'Chargement...' : 'Importer une image'}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>

                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Prévisualisation" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}

                {formData.imageUrl && !imagePreview && (
                  <div className="image-preview">
                    <img src={formData.imageUrl} alt="Image actuelle" />
                  </div>
                )}

                <p className="form-help">
                  Vous pouvez soit entrer une URL d'image, soit importer une image depuis votre ordinateur.
                  Si vous ne spécifiez pas d'image, une image par défaut sera utilisée.
                </p>
              </div>
            </div>

            <div className="form-group">
              <label>Filière</label>
              <select
                value={formData.filiere}
                onChange={(e) => setFormData({...formData, filiere: e.target.value})}
                required
              >
                <option value="tous">Toutes les filières</option>
                <option value="iacs">IACS</option>
                <option value="g2er">G2ER</option>
                <option value="tdi">TDI</option>
                <option value="aa">AA</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group form-group-half">
                <label>Date de début</label>
                <input
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                  required
                />
              </div>

              <div className="form-group form-group-half">
                <label>Heure de début</label>
                <input
                  type="time"
                  value={formData.heureDebut || '09:00'}
                  onChange={(e) => setFormData({...formData, heureDebut: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group form-group-half">
                <label>Date de fin</label>
                <input
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({...formData, dateFin: e.target.value})}
                  required
                  min={formData.dateDebut} // Empêcher de sélectionner une date antérieure à la date de début
                />
                {formData.dateDebut && formData.dateFin && new Date(formData.dateDebut) > new Date(formData.dateFin) && (
                  <p className="form-error">La date de fin doit être postérieure ou égale à la date de début</p>
                )}
              </div>

              <div className="form-group form-group-half">
                <label>Heure de fin</label>
                <input
                  type="time"
                  value={formData.heureFin || '17:00'}
                  onChange={(e) => setFormData({...formData, heureFin: e.target.value})}
                  required
                />
                {formData.dateDebut && formData.dateFin &&
                 new Date(formData.dateDebut).toDateString() === new Date(formData.dateFin).toDateString() &&
                 formData.heureDebut && formData.heureFin &&
                 formData.heureDebut >= formData.heureFin && (
                  <p className="form-error">L'heure de fin doit être postérieure à l'heure de début pour une formation se déroulant le même jour</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Durée (calculée automatiquement)</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                placeholder="Sera calculée automatiquement"
                disabled={formData.dateDebut && formData.dateFin}
              />
              {formData.dateDebut && formData.dateFin && (
                <p className="form-help">
                  La durée sera calculée automatiquement à partir des dates de début et de fin.
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Responsable</label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData({...formData, instructor: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Lieu</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Nombre d'étudiants inscrits</label>
              <input
                type="number"
                value={formData.students}
                readOnly
                disabled
                className="read-only-input"
              />
              <p className="form-help">
                Ce nombre est automatiquement mis à jour en fonction des inscriptions des étudiants.
              </p>
            </div>



            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {currentFormation ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Chargement des formations...</p>
      ) : (
        <div className="formations-table-container">
          <table className="formations-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Filière</th>
                <th>Responsable</th>
                <th>Durée</th>
                <th>Statut</th>
                <th>Étudiants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {formations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">Aucune formation disponible</td>
                </tr>
              ) : (
                formations.map((formation) => (
                  <tr key={formation._id}>
                    <td>{formation.title}</td>
                    <td>{formation.filiere ? formation.filiere.toUpperCase() : 'Toutes'}</td>
                    <td>{formation.instructor || '-'}</td>
                    <td>{formation.dureeFormatee || formation.duration || '-'}</td>
                    <td>
                      <span className={`status-badge status-${formation.statut ? formation.statut.toLowerCase().replace(' ', '-') : 'non-defini'}`}>
                        {formation.statut || 'Non défini'}
                      </span>
                    </td>
                    <td>{formation.students || 0}</td>
                    <td className="actions-cell">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(formation)}
                        title="Modifier"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(formation._id)}
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                      <button
                        className="action-btn students-btn"
                        onClick={() => viewStudents(formation._id)}
                        title="Voir les étudiants inscrits"
                      >
                        <FaUsers />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal pour afficher les étudiants inscrits */}
      {showStudentsModal && currentFormation && (
        <div className="students-modal-overlay">
          <div className="students-modal">
            <div className="students-modal-header">
              <h3>Étudiants inscrits à la formation</h3>
              <button
                className="close-modal-btn"
                onClick={() => setShowStudentsModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="formation-info-modal">
              <h4>{currentFormation.title}</h4>
              <div className="formation-meta-modal">
                <span className="formation-filiere">
                  Filière: {currentFormation.filiere ? currentFormation.filiere.toUpperCase() : 'Toutes'}
                </span>
                {currentFormation.instructor && (
                  <span className="formation-instructor">
                    Responsable: {currentFormation.instructor}
                  </span>
                )}
                <span className="formation-students-count">
                  Nombre d'étudiants: {currentStudents.length}
                </span>
              </div>


            </div>

            <div className="students-search">
              <input
                type="text"
                placeholder="Rechercher un étudiant..."
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();

                  // Stocker tous les étudiants dans une variable d'état si ce n'est pas déjà fait
                  if (!allStudents || allStudents.length === 0) {
                    setAllStudents([...currentStudents]);
                  }

                  if (searchTerm === '') {
                    // Si le champ de recherche est vide, afficher tous les étudiants
                    setCurrentStudents(allStudents);
                  } else {
                    // Filtrer les étudiants en fonction du terme de recherche
                    const filteredStudents = allStudents.filter(student =>
                      student.nom.toLowerCase().includes(searchTerm) ||
                      student.prenom.toLowerCase().includes(searchTerm) ||
                      (student.apogee && student.apogee.toLowerCase().includes(searchTerm)) ||
                      student.filiere.toLowerCase().includes(searchTerm)
                    );
                    setCurrentStudents(filteredStudents);
                  }
                }}
              />
            </div>

            {currentStudents.length === 0 ? (
              <p className="no-data">Aucun étudiant inscrit à cette formation</p>
            ) : (
              <>
                <div className="students-count">
                  {currentStudents.length} étudiant{currentStudents.length > 1 ? 's' : ''} inscrit{currentStudents.length > 1 ? 's' : ''}
                </div>
                <div className="students-table-container">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Apogée</th>
                        <th>Filière</th>
                        <th>Année</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStudents.map((student) => (
                        <tr key={student._id} className="student-row">
                          <td>{student.nom}</td>
                          <td>{student.prenom}</td>
                          <td>{student.apogee}</td>
                          <td>{student.filiere.toUpperCase()}</td>
                          <td>{student.annee}</td>
                          <td>
                            <button
                              className="remove-student-btn"
                              onClick={() => removeStudent(currentFormation._id, student._id)}
                              title="Désinscrire"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionFormations;
