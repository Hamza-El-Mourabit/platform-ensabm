const mongoose = require('mongoose');
const EmploiDuTemps = require('./models/EmploiDuTemps');
require('dotenv').config();

// Données d'exemple pour un emploi du temps
const sampleData = {
  emplois: [
    {
      jour: 'Lundi',
      creneaux: [
        {
          module: 'Mathématiques',
          debut: '08:30',
          fin: '10:30',
          salle: 'Salle A1',
          professeur: 'Dr. Martin'
        },
        {
          module: 'Informatique',
          debut: '10:45',
          fin: '12:45',
          salle: 'Labo Info 2',
          professeur: 'Prof. Dubois'
        },
        {
          module: 'Anglais',
          debut: '14:00',
          fin: '16:00',
          salle: 'Salle B3',
          professeur: 'Mme. Johnson'
        }
      ]
    },
    {
      jour: 'Mardi',
      creneaux: [
        {
          module: 'Physique',
          debut: '09:00',
          fin: '11:00',
          salle: 'Labo Physique',
          professeur: 'Dr. Leroy'
        },
        {
          module: 'Programmation',
          debut: '13:00',
          fin: '15:00',
          salle: 'Labo Info 1',
          professeur: 'M. Garcia'
        }
      ]
    },
    {
      jour: 'Mercredi',
      creneaux: [
        {
          module: 'Bases de données',
          debut: '08:00',
          fin: '10:00',
          salle: 'Salle C2',
          professeur: 'Prof. Chen'
        },
        {
          module: 'Réseaux',
          debut: '10:15',
          fin: '12:15',
          salle: 'Labo Réseaux',
          professeur: 'Dr. Moreau'
        }
      ]
    },
    {
      jour: 'Jeudi',
      creneaux: [
        {
          module: 'Intelligence Artificielle',
          debut: '09:30',
          fin: '11:30',
          salle: 'Amphi A',
          professeur: 'Prof. Dupont'
        },
        {
          module: 'Sécurité Informatique',
          debut: '13:30',
          fin: '15:30',
          salle: 'Salle D1',
          professeur: 'M. Lefebvre'
        },
        {
          module: 'Projet Tutoré',
          debut: '15:45',
          fin: '17:45',
          salle: 'Salle Projets',
          professeur: 'Mme. Rousseau'
        }
      ]
    },
    {
      jour: 'Vendredi',
      creneaux: [
        {
          module: 'Développement Web',
          debut: '08:30',
          fin: '10:30',
          salle: 'Labo Info 3',
          professeur: 'M. Bernard'
        },
        {
          module: 'Communication',
          debut: '10:45',
          fin: '12:45',
          salle: 'Salle E2',
          professeur: 'Mme. Petit'
        }
      ]
    }
  ]
};

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connecté');
    
    try {
      // Trouver l'emploi du temps existant pour IACS année 1
      const existingEmploi = await EmploiDuTemps.findOne({ filiere: 'IACS', annee: '1' });
      
      if (existingEmploi) {
        console.log('Emploi du temps trouvé, ID:', existingEmploi._id);
        
        // Mettre à jour avec les données d'exemple
        existingEmploi.emplois = sampleData.emplois;
        await existingEmploi.save();
        
        console.log('Emploi du temps mis à jour avec succès!');
      } else {
        console.log('Aucun emploi du temps trouvé pour IACS année 1');
        
        // Créer un nouvel emploi du temps
        const newEmploi = new EmploiDuTemps({
          filiere: 'IACS',
          annee: '1',
          emplois: sampleData.emplois
        });
        
        await newEmploi.save();
        console.log('Nouvel emploi du temps créé avec succès!');
      }
      
      // Vérifier les données après mise à jour
      const updatedEmploi = await EmploiDuTemps.findOne({ filiere: 'IACS', annee: '1' });
      console.log('Nombre de jours après mise à jour:', updatedEmploi.emplois.length);
      console.log('Premier jour:', updatedEmploi.emplois[0].jour);
      console.log('Nombre de créneaux le premier jour:', updatedEmploi.emplois[0].creneaux.length);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données:', error);
    } finally {
      // Fermer la connexion
      mongoose.connection.close();
      console.log('Connexion MongoDB fermée');
    }
  })
  .catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
  });
