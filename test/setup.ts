import { rm } from 'fs/promises';
import { join } from 'path';

// runs before each e2e test case; removes test SQLite file
global.beforeEach(async () => {
  try {
    await rm(join(__dirname, '..', 'db.sqlite.test'));
  } catch {
    // file does not exist, continue with the test
  }
});
