import 'dotenv/config';
import { db, clientsTable, authorizationCodesTable } from '../common/db/index.js';

async function clear() {
    try {
        // Delete foreign dependencies first
        await db.delete(authorizationCodesTable);

        // Then delete clients
        await db.delete(clientsTable);
        console.log('Successfully deleted all clients and their dependent authorization codes from the database.');
        process.exit(0);
    } catch (error) {
        console.error('Error deleting clients:', error);
        process.exit(1);
    }
}

clear();
