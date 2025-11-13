const db = require('./src/infrastructure/database/models');
const { Branch, User } = db;

async function testBranchesAPI() {
  try {
    console.log('Testing branches with users...');
    const branches = await Branch.findAll({
      include: [{
        model: User,
        as: 'users',
        attributes: ['id', 'first_name', 'last_name', 'email', 'role'],
        where: { is_active: true },
        required: false
      }]
    });
    
    console.log('Branches found:', branches.length);
    branches.forEach(branch => {
      console.log(`- ${branch.name}: ${branch.users?.length || 0} users`);
      branch.users?.forEach(user => {
        console.log(`  * ${user.first_name} ${user.last_name} (${user.role})`);
      });
    });
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  }
  process.exit(0);
}

testBranchesAPI();