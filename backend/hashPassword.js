const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log('Mot de passe en clair:', password);
  console.log('Mot de passe haché:', hashedPassword);
  console.log('\nUtilisez ce mot de passe haché dans MongoDB Compass');
}

// Remplacez 'admin123' par le mot de passe que vous souhaitez utiliser
hashPassword('admin123');
