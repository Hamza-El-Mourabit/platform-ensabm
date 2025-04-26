/**
 * Script pour tester la synchronisation des examens
 * 
 * Ce script permet de tester la synchronisation entre les collections Examen et PlanningExams
 * sans passer par l'API REST.
 * 
 * Utilisation:
 * 1. Assurez-vous que MongoDB est en cours d'exécution
 * 2. Exécutez ce script avec Node.js: node syncExams.js
 */

const mongoose = require('mongoose');
const Examen = require('../models/Examen');
const PlanningExams = require('../models/PlanningExams');
const Module = require('../models/Module');
const Professor = require('../models/Professor');

// URL de connexion à MongoDB
const mongoURI = 'mongodb://localhost:27017/ensah';

// Fonction pour mettre à jour le planning d'une filière et année spécifiques
const updatePlanningForFiliereAnnee = async (filiere, annee, examen) => {
  try {
    console.log(`Mise à jour du planning pour ${filiere} - ${annee} avec l'examen:`, examen.titre);
    
    // Chercher le planning existant ou en créer un nouveau
    let planning = await PlanningExams.findOne({ filiere, annee });
    
    if (!planning) {
      console.log(`Aucun planning trouvé pour ${filiere} - ${annee}, création d'un nouveau planning`);
      // Créer un nouveau planning s'il n'existe pas
      planning = new PlanningExams({
        filiere,
        annee,
        examens: []
      });
    }
    
    // Récupérer les informations complètes du module et du professeur
    let moduleInfo = examen.module;
    let professeurInfo = examen.professeur;
    
    // Si module et professeur sont des IDs, récupérer leurs noms
    if (examen.module && examen.module.length === 24 && /^[0-9a-fA-F]{24}$/.test(examen.module)) {
      try {
        const moduleDoc = await Module.findById(examen.module);
        if (moduleDoc) {
          moduleInfo = `${moduleDoc.code} - ${moduleDoc.nom}`;
        } else {
          console.log(`Module avec ID ${examen.module} non trouvé, utilisation de l'ID comme nom`);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du module:', err);
      }
    }
    
    if (examen.professeur && examen.professeur.length === 24 && /^[0-9a-fA-F]{24}$/.test(examen.professeur)) {
      try {
        const professorDoc = await Professor.findById(examen.professeur);
        if (professorDoc) {
          professeurInfo = `${professorDoc.nom} ${professorDoc.prenom}`;
        } else {
          console.log(`Professeur avec ID ${examen.professeur} non trouvé, utilisation de l'ID comme nom`);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du professeur:', err);
      }
    }
    
    // Vérifier que les champs requis sont présents
    if (!examen.heureDebut || !examen.heureFin) {
      console.error('Champs heureDebut ou heureFin manquants dans l\'examen:', examen);
      // Utiliser des valeurs par défaut si nécessaire
      examen.heureDebut = examen.heureDebut || '08:00';
      examen.heureFin = examen.heureFin || '10:00';
    }
    
    // Convertir l'examen au format attendu par PlanningExams
    const examForPlanning = {
      module: moduleInfo,
      date: examen.date,
      debut: examen.heureDebut,
      fin: examen.heureFin,
      salle: examen.salle || 'À déterminer',
      professeur: professeurInfo
    };
    
    console.log('Examen formaté pour le planning:', examForPlanning);
    
    // Vérifier si cet examen existe déjà dans le planning (en cas de mise à jour)
    const existingExamIndex = planning.examens.findIndex(
      e => e.module === examForPlanning.module && 
           new Date(e.date).toISOString().split('T')[0] === new Date(examForPlanning.date).toISOString().split('T')[0]
    );
    
    if (existingExamIndex >= 0) {
      console.log('Examen existant trouvé, mise à jour');
      // Mettre à jour l'examen existant
      planning.examens[existingExamIndex] = examForPlanning;
    } else {
      console.log('Ajout d\'un nouvel examen au planning');
      // Ajouter le nouvel examen
      planning.examens.push(examForPlanning);
    }
    
    // Sauvegarder le planning mis à jour
    const savedPlanning = await planning.save();
    console.log(`Planning mis à jour pour ${filiere} - ${annee}:`, savedPlanning.examens.length);
    return savedPlanning;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du planning pour ${filiere} - ${annee}:`, error);
    throw error;
  }
};

// Fonction pour synchroniser les examens avec la collection PlanningExams
const synchronizeExamsWithPlanning = async (examen) => {
  try {
    console.log('Synchronisation de l\'examen avec le planning:', examen.titre);
    
    // Vérifier que l'examen a tous les champs requis
    if (!examen || !examen.date) {
      throw new Error('Examen invalide ou incomplet');
    }
    
    // Normaliser la filière en minuscules
    if (examen.filiere) {
      examen.filiere = examen.filiere.toLowerCase();
    }
    
    // Si l'examen est pour "tous", nous devons le synchroniser avec tous les plannings concernés
    if (examen.filiere === 'tous' || examen.annee === 'tous') {
      // Déterminer les filières à mettre à jour
      const filieres = examen.filiere === 'tous' 
        ? ['iacs', 'aa', 'g2er', 'tdi'] 
        : [examen.filiere];
      
      // Déterminer les années à mettre à jour
      const annees = examen.annee === 'tous' 
        ? ['1', '2', '3'] 
        : [examen.annee];
      
      console.log(`Examen pour plusieurs filières/années: ${filieres.join(', ')} / ${annees.join(', ')}`);
      
      // Mettre à jour tous les plannings concernés
      for (const filiere of filieres) {
        for (const annee of annees) {
          await updatePlanningForFiliereAnnee(filiere, annee, examen);
        }
      }
    } else {
      // Cas simple: mettre à jour le planning pour une filière et une année spécifiques
      console.log(`Examen pour une filière/année spécifique: ${examen.filiere}/${examen.annee}`);
      await updatePlanningForFiliereAnnee(examen.filiere, examen.annee, examen);
    }
    
    console.log('Synchronisation terminée avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la synchronisation des examens:', error);
    return false;
  }
};

// Fonction principale
const main = async () => {
  try {
    // Connexion à MongoDB
    console.log('Connexion à MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connecté à MongoDB');
    
    // Supprimer tous les plannings existants
    console.log('Suppression de tous les plannings existants...');
    const deleteResult = await PlanningExams.deleteMany({});
    console.log(`${deleteResult.deletedCount} plannings supprimés`);
    
    // Créer un planning vide pour chaque combinaison filière/année
    const filieres = ['iacs', 'aa', 'g2er', 'tdi'];
    const annees = ['1', '2', '3'];
    
    console.log('Création de plannings vides pour toutes les combinaisons filière/année');
    for (const filiere of filieres) {
      for (const annee of annees) {
        const planning = new PlanningExams({
          filiere,
          annee,
          examens: []
        });
        await planning.save();
        console.log(`Planning vide créé pour ${filiere}/${annee}`);
      }
    }
    
    // Récupérer tous les examens
    console.log('Récupération de tous les examens...');
    const examens = await Examen.find({});
    console.log(`${examens.length} examens trouvés`);
    
    if (examens.length === 0) {
      console.log('Aucun examen trouvé, fin du script');
      await mongoose.disconnect();
      return;
    }
    
    // Synchroniser chaque examen
    console.log('Synchronisation des examens...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const examen of examens) {
      const success = await synchronizeExamsWithPlanning(examen);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }
    
    console.log(`Synchronisation terminée: ${successCount} examens synchronisés avec succès, ${errorCount} erreurs`);
    
    // Vérifier les plannings créés
    const plannings = await PlanningExams.find({});
    console.log(`${plannings.length} plannings trouvés après synchronisation`);
    
    for (const planning of plannings) {
      console.log(`Planning ${planning.filiere}/${planning.annee}: ${planning.examens.length} examens`);
    }
    
    // Déconnexion de MongoDB
    console.log('Déconnexion de MongoDB...');
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
    
  } catch (error) {
    console.error('Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Exécuter la fonction principale
main();
