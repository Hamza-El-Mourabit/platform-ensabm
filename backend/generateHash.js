const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  console.log('Mot de passe en clair:', password);
  console.log('Mot de passe haché:', hashedPassword);
  console.log('\nCopiez ce mot de passe haché pour l\'utiliser dans MongoDB Compass');
}

generateHash();
