const { execSync } = require('child_process');
require('../scripts/loadTestEnv');

const run = (command) => {
    execSync(command, {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'test' },
        shell: true,
    });
};

module.exports = async () => {
    run('node scripts/resetTestDb.js');
    run('npx node-pg-migrate up --no-check-order');
    run('node seeds/seed_ruoli_permessi.js');
    run('node seeds/seed_admin.js');
    run('node scripts/seed_test_users.js');
};
