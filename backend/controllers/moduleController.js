const Module = require('../models/Module');
const Professor = require('../models/Professor');

// @desc    Récupérer tous les modules
// @route   GET /api/admin/modules
// @access  Private (Admin only)
const getModules = async (req, res) => {
  try {
    const modules = await Module.find().populate('professeurs', 'nom prenom');
    res.json(modules);
  } catch (error) {
    console.error('Erreur lors de la récupération des modules:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer un module par ID
// @route   GET /api/admin/modules/:id
// @access  Private (Admin only)
const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate('professeurs', 'nom prenom');
    
    if (!module) {
      return res.status(404).json({ message: 'Module non trouvé' });
    }
    
    res.json(module);
  } catch (error) {
    console.error('Erreur lors de la récupération du module:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Créer un nouveau module
// @route   POST /api/admin/modules
// @access  Private (Admin only)
const createModule = async (req, res) => {
  try {
    const { code, nom, description, filiere, annee, professeurs } = req.body;
    
    // Vérifier si le module existe déjà
    const moduleExists = await Module.findOne({ code });
    
    if (moduleExists) {
      return res.status(400).json({ message: 'Un module avec ce code existe déjà' });
    }
    
    // Vérifier si les professeurs existent
    if (professeurs && professeurs.length > 0) {
      const existingProfessors = await Professor.find({ _id: { $in: professeurs } });
      if (existingProfessors.length !== professeurs.length) {
        return res.status(400).json({ message: 'Certains professeurs n\'existent pas' });
      }
    }
    
    // Créer le module
    const module = await Module.create({
      code,
      nom,
      description,
      filiere,
      annee,
      professeurs: professeurs || []
    });
    
    res.status(201).json(module);
  } catch (error) {
    console.error('Erreur lors de la création du module:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour un module
// @route   PUT /api/admin/modules/:id
// @access  Private (Admin only)
const updateModule = async (req, res) => {
  try {
    const { code, nom, description, filiere, annee, professeurs } = req.body;
    
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ message: 'Module non trouvé' });
    }
    
    // Vérifier si le code est déjà utilisé par un autre module
    if (code && code !== module.code) {
      const codeExists = await Module.findOne({ code });
      if (codeExists) {
        return res.status(400).json({ message: 'Ce code est déjà utilisé' });
      }
    }
    
    // Vérifier si les professeurs existent
    if (professeurs && professeurs.length > 0) {
      const existingProfessors = await Professor.find({ _id: { $in: professeurs } });
      if (existingProfessors.length !== professeurs.length) {
        return res.status(400).json({ message: 'Certains professeurs n\'existent pas' });
      }
    }
    
    // Mettre à jour les champs
    module.code = code || module.code;
    module.nom = nom || module.nom;
    module.description = description || module.description;
    module.filiere = filiere || module.filiere;
    module.annee = annee || module.annee;
    module.professeurs = professeurs || module.professeurs;
    
    const updatedModule = await module.save();
    
    res.json(updatedModule);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du module:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer un module
// @route   DELETE /api/admin/modules/:id
// @access  Private (Admin only)
const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ message: 'Module non trouvé' });
    }
    
    await Module.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Module supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du module:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer les modules par filière et année
// @route   GET /api/admin/modules/filiere/:filiere/annee/:annee
// @access  Private
const getModulesByFiliereAndAnnee = async (req, res) => {
  try {
    const { filiere, annee } = req.params;
    
    const modules = await Module.find({
      $or: [
        { filiere: filiere, annee: annee },
        { filiere: filiere, annee: 'tous' },
        { filiere: 'tous', annee: annee },
        { filiere: 'tous', annee: 'tous' }
      ]
    }).populate('professeurs', 'nom prenom');
    
    res.json(modules);
  } catch (error) {
    console.error('Erreur lors de la récupération des modules:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer les modules par professeur
// @route   GET /api/admin/modules/professeur/:id
// @access  Private
const getModulesByProfessor = async (req, res) => {
  try {
    const professorId = req.params.id;
    
    const modules = await Module.find({
      professeurs: professorId
    }).populate('professeurs', 'nom prenom');
    
    res.json(modules);
  } catch (error) {
    console.error('Erreur lors de la récupération des modules:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer la liste des modules pour le formulaire de création d'emploi du temps
// @route   GET /api/admin/modules/list
// @access  Private
const getModulesList = async (req, res) => {
  try {
    const modules = await Module.find().select('code nom filiere annee');
    res.json(modules);
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste des modules:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  getModulesByFiliereAndAnnee,
  getModulesByProfessor,
  getModulesList
};
