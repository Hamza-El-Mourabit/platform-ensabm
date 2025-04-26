const mongoose = require('mongoose');

const formationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: false,
    default: '/images/default-formation.jpg'
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Dates de début et fin pour une meilleure gestion de la durée
  dateDebut: {
    type: Date,
    required: true,
    default: Date.now
  },
  dateFin: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        if (!this.dateDebut || !value) return true; // Ignorer la validation si l'une des dates est manquante

        // Normaliser les dates pour la comparaison (ignorer l'heure)
        const dateDebut = new Date(this.dateDebut);
        const dateFin = new Date(value);

        // Réinitialiser les heures pour comparer uniquement les dates
        dateDebut.setHours(0, 0, 0, 0);
        dateFin.setHours(0, 0, 0, 0);

        // Vérifier que la date de fin est postérieure ou égale à la date de début
        return dateDebut <= dateFin;
      },
      message: 'La date de fin doit être postérieure ou égale à la date de début'
    }
  },
  // Heures de début et de fin pour une gestion plus précise
  heureDebut: {
    type: String,
    default: '09:00'
  },
  heureFin: {
    type: String,
    default: '17:00'
  },
  category: {
    type: String,
    trim: true
  },
  // Conserver le champ duration pour la rétrocompatibilité
  duration: {
    type: String,
    trim: true
  },
  instructor: {
    type: String,
    trim: true
  },
  filiere: {
    type: String,
    trim: true,
    default: 'tous',
    enum: ['iacs', 'aa', 'g2er', 'tdi', 'tous']
  },
  students: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    trim: true
  },
  etudiants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Propriétés virtuelles pour calculer la durée
formationSchema.virtual('dureeJours').get(function() {
  if (!this.dateDebut || !this.dateFin) return null;
  const diffTime = Math.abs(this.dateFin - this.dateDebut);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convertir en jours
});

formationSchema.virtual('dureeSemaines').get(function() {
  if (!this.dateDebut || !this.dateFin) return null;
  const diffTime = Math.abs(this.dateFin - this.dateDebut);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)); // Convertir en semaines
});

formationSchema.virtual('dureeMois').get(function() {
  if (!this.dateDebut || !this.dateFin) return null;

  // Calculer la différence en mois
  let months = (this.dateFin.getFullYear() - this.dateDebut.getFullYear()) * 12;
  months += this.dateFin.getMonth() - this.dateDebut.getMonth();

  // Ajuster en fonction des jours
  if (this.dateFin.getDate() < this.dateDebut.getDate()) {
    months--;
  }

  return months;
});

// Méthode pour formater la durée en texte lisible
formationSchema.methods.formatDuree = function() {
  if (!this.dateDebut || !this.dateFin) return this.duration || 'Durée non spécifiée';

  const jours = this.dureeJours;
  const semaines = this.dureeSemaines;
  const mois = this.dureeMois;

  if (mois > 0) {
    return mois === 1 ? '1 mois' : `${mois} mois`;
  } else if (semaines > 0) {
    return semaines === 1 ? '1 semaine' : `${semaines} semaines`;
  } else {
    return jours === 1 ? '1 jour' : `${jours} jours`;
  }
};

// Méthode pour vérifier si une formation est en cours
formationSchema.methods.estEnCours = function() {
  const now = new Date();
  const debut = this.dateHeureDebut;
  const fin = this.dateHeureFin;

  if (!debut || !fin) {
    // Fallback sur l'ancienne méthode si les heures ne sont pas définies
    return this.dateDebut <= now && now <= this.dateFin;
  }

  return debut <= now && now <= fin;
};

// Méthode pour vérifier si une formation est terminée
formationSchema.methods.estTerminee = function() {
  const now = new Date();
  const fin = this.dateHeureFin;

  if (!fin) {
    // Fallback sur l'ancienne méthode si l'heure de fin n'est pas définie
    return now > this.dateFin;
  }

  return now > fin;
};

// Méthode pour vérifier si une formation n'a pas encore commencé
formationSchema.methods.estAVenir = function() {
  const now = new Date();
  const debut = this.dateHeureDebut;

  if (!debut) {
    // Fallback sur l'ancienne méthode si l'heure de début n'est pas définie
    return now < this.dateDebut;
  }

  return now < debut;
};

// Méthode pour obtenir la date et l'heure de début complètes
formationSchema.virtual('dateHeureDebut').get(function() {
  if (!this.dateDebut || !this.heureDebut) return null;

  const date = new Date(this.dateDebut);
  const [heures, minutes] = this.heureDebut.split(':').map(Number);

  date.setHours(heures, minutes, 0, 0);
  return date;
});

// Méthode pour obtenir la date et l'heure de fin complètes
formationSchema.virtual('dateHeureFin').get(function() {
  if (!this.dateFin || !this.heureFin) return null;

  const date = new Date(this.dateFin);
  const [heures, minutes] = this.heureFin.split(':').map(Number);

  date.setHours(heures, minutes, 0, 0);
  return date;
});

// Méthode pour calculer le temps restant avant le début de la formation
formationSchema.virtual('tempsRestant').get(function() {
  const now = new Date();
  const debut = this.dateHeureDebut;

  if (!debut || now >= debut) return null;

  const diffMs = debut - now;
  const diffJours = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHeures = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return {
    jours: diffJours,
    heures: diffHeures,
    minutes: diffMinutes,
    total: diffMs
  };
});

// Méthode pour obtenir le statut de la formation (à venir, en cours, terminée)
formationSchema.virtual('statut').get(function() {
  const now = new Date();
  const debut = this.dateHeureDebut;
  const fin = this.dateHeureFin;

  if (!debut || !fin) return 'Non défini';

  if (now < debut) return 'À venir';
  if (now > fin) return 'Terminée';
  return 'En cours';
});

// Validation personnalisée pour vérifier que les heures sont cohérentes
formationSchema.pre('validate', function(next) {
  try {
    // Si les dates sont identiques, vérifier que l'heure de fin est postérieure à l'heure de début
    if (this.dateDebut && this.dateFin && this.heureDebut && this.heureFin) {
      // Normaliser les dates pour la comparaison (ignorer l'heure)
      const dateDebut = new Date(this.dateDebut);
      const dateFin = new Date(this.dateFin);

      // Réinitialiser les heures pour comparer uniquement les dates
      dateDebut.setHours(0, 0, 0, 0);
      dateFin.setHours(0, 0, 0, 0);

      // Si les dates sont identiques, vérifier les heures
      if (dateDebut.getTime() === dateFin.getTime()) {
        console.log('Dates identiques, vérification des heures');
        console.log('Heure début:', this.heureDebut);
        console.log('Heure fin:', this.heureFin);

        const [heureDebutH, heureDebutM] = this.heureDebut.split(':').map(Number);
        const [heureFinH, heureFinM] = this.heureFin.split(':').map(Number);

        // Comparer les heures
        if (heureDebutH > heureFinH || (heureDebutH === heureFinH && heureDebutM >= heureFinM)) {
          this.invalidate('heureFin', 'L\'heure de fin doit être postérieure à l\'heure de début pour une formation se déroulant le même jour');
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de la validation des heures:', error);
    // Ne pas bloquer la validation en cas d'erreur
  }

  next();
});

const Formation = mongoose.model('Formation', formationSchema);

module.exports = Formation;
