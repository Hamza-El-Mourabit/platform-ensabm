const Professor = require('../models/Professor');

// @desc    Récupérer tous les professeurs
// @route   GET /api/admin/professors
// @access  Private (Admin only)
const getProfessors = async (req, res) => {
  try {
    const professors = await Professor.find().select('-password').populate('modules', 'code nom');
    res.json(professors);
  } catch (error) {
    console.error('Erreur lors de la récupération des professeurs:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer un professeur par ID
// @route   GET /api/admin/professors/:id
// @access  Private (Admin only)
const getProfessorById = async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id).select('-password').populate('modules', 'code nom');

    if (!professor) {
      return res.status(404).json({ message: 'Professeur non trouvé' });
    }

    res.json(professor);
  } catch (error) {
    console.error('Erreur lors de la récupération du professeur:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Créer un nouveau professeur
// @route   POST /api/admin/professors
// @access  Private (Admin only)
const createProfessor = async (req, res) => {
  try {
    const { cin, matricule, nom, prenom, email, password, specialite, telephone, modules } = req.body;

    // Vérifier si le professeur existe déjà
    const professorExists = await Professor.findOne({
      $or: [
        { email },
        { cin },
        { matricule }
      ]
    });

    if (professorExists) {
      return res.status(400).json({ message: 'Un professeur avec cet email, CIN ou matricule existe déjà' });
    }

    // Créer le professeur
    const professor = await Professor.create({
      cin,
      matricule,
      nom,
      prenom,
      email,
      password,
      specialite,
      telephone,
      modules: modules || []
    });

    if (professor) {
      res.status(201).json({
        _id: professor._id,
        cin: professor.cin,
        matricule: professor.matricule,
        nom: professor.nom,
        prenom: professor.prenom,
        email: professor.email,
        specialite: professor.specialite,
        telephone: professor.telephone,
        modules: professor.modules
      });
    } else {
      res.status(400).json({ message: 'Données de professeur invalides' });
    }
  } catch (error) {
    console.error('Erreur lors de la création du professeur:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour un professeur
// @route   PUT /api/admin/professors/:id
// @access  Private (Admin only)
const updateProfessor = async (req, res) => {
  try {
    const { cin, matricule, nom, prenom, email, password, specialite, telephone, modules } = req.body;

    const professor = await Professor.findById(req.params.id);

    if (!professor) {
      return res.status(404).json({ message: 'Professeur non trouvé' });
    }

    // Vérifier si l'email est déjà utilisé par un autre professeur
    if (email && email !== professor.email) {
      const emailExists = await Professor.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    // Vérifier si le CIN est déjà utilisé par un autre professeur
    if (cin && cin !== professor.cin) {
      const cinExists = await Professor.findOne({ cin });
      if (cinExists) {
        return res.status(400).json({ message: 'Ce CIN est déjà utilisé' });
      }
    }

    // Vérifier si le matricule est déjà utilisé par un autre professeur
    if (matricule && matricule !== professor.matricule) {
      const matriculeExists = await Professor.findOne({ matricule });
      if (matriculeExists) {
        return res.status(400).json({ message: 'Ce matricule est déjà utilisé' });
      }
    }

    // Mettre à jour les champs
    professor.cin = cin || professor.cin;
    professor.matricule = matricule || professor.matricule;
    professor.nom = nom || professor.nom;
    professor.prenom = prenom || professor.prenom;
    professor.email = email || professor.email;
    professor.specialite = specialite || professor.specialite;
    professor.telephone = telephone || professor.telephone;
    professor.modules = modules || professor.modules;

    // Mettre à jour le mot de passe seulement s'il est fourni
    if (password) {
      professor.password = password;
    }

    const updatedProfessor = await professor.save();

    res.json({
      _id: updatedProfessor._id,
      cin: updatedProfessor.cin,
      matricule: updatedProfessor.matricule,
      nom: updatedProfessor.nom,
      prenom: updatedProfessor.prenom,
      email: updatedProfessor.email,
      specialite: updatedProfessor.specialite,
      telephone: updatedProfessor.telephone,
      modules: updatedProfessor.modules
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du professeur:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer un professeur
// @route   DELETE /api/admin/professors/:id
// @access  Private (Admin only)
const deleteProfessor = async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id);

    if (!professor) {
      return res.status(404).json({ message: 'Professeur non trouvé' });
    }

    await Professor.deleteOne({ _id: req.params.id });

    res.json({ message: 'Professeur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du professeur:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfessors,
  getProfessorById,
  createProfessor,
  updateProfessor,
  deleteProfessor
};
