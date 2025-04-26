// Effet de code binaire pour le thème cryptographique
document.addEventListener('DOMContentLoaded', function() {
  // Ajouter l'arrière-plan binaire aux contenus
  const adminContent = document.querySelector('.admin-content');
  if (adminContent) {
    const binaryBackground = document.createElement('div');
    binaryBackground.className = 'binary-background';
    adminContent.appendChild(binaryBackground);
    
    // Créer des colonnes de code binaire
    for (let i = 0; i < 10; i++) {
      createBinaryColumn(binaryBackground);
    }
  }
  
  // Ajouter l'attribut data-text aux boutons d'onglets pour l'effet de code
  const tabButtons = document.querySelectorAll('.admin-tabs button');
  tabButtons.forEach(button => {
    const text = button.textContent.trim();
    button.setAttribute('data-text', generateRandomBinary(text.length * 2));
  });
  
  // Ajouter l'attribut data-value aux cellules des tableaux de formations et compétences
  const formationsTables = document.querySelectorAll('.formations-table, .competences-table');
  formationsTables.forEach(table => {
    const cells = table.querySelectorAll('td');
    cells.forEach(cell => {
      if (cell.textContent.trim()) {
        cell.setAttribute('data-value', cell.textContent.trim());
      }
    });
  });
});

// Fonction pour créer une colonne de code binaire
function createBinaryColumn(container) {
  const column = document.createElement('div');
  column.className = 'binary-column';
  
  // Position aléatoire
  column.style.left = `${Math.random() * 100}%`;
  
  // Vitesse aléatoire
  const duration = 10 + Math.random() * 20;
  column.style.animation = `binary-rain ${duration}s linear infinite`;
  
  // Délai aléatoire
  column.style.animationDelay = `${Math.random() * 10}s`;
  
  // Contenu binaire
  column.innerHTML = generateRandomBinary(30);
  
  container.appendChild(column);
}

// Fonction pour générer du code binaire aléatoire
function generateRandomBinary(length) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.random() > 0.5 ? '1' : '0';
    if (i % 8 === 7) result += '<br>';
  }
  return result;
}
