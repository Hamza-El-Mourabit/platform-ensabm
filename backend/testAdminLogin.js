const fetch = require('node-fetch');

async function testAdminLogin() {
  try {
    console.log('Test de connexion administrateur...');
    
    const response = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'gouskir',
        password: 'admin123'
      }),
    });
    
    const data = await response.json();
    
    console.log('Statut de la réponse:', response.status);
    console.log('Données de la réponse:', data);
    
    if (response.ok) {
      console.log('Connexion réussie!');
    } else {
      console.log('Échec de la connexion.');
    }
  } catch (error) {
    console.error('Erreur lors du test de connexion:', error);
  }
}

testAdminLogin();
