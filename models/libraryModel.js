const db = require("../config/db");

const Library = {
    async create(name, description, uploadedBy, totalFiles) {
        const query = `INSERT INTO library (name, description, uploaded_by, total_files) 
                       VALUES ($1, $2, $3, $4) RETURNING *`;
        const values = [name, description, uploadedBy, totalFiles];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    async addFiles(libraryId, files) {
        const query = `INSERT INTO library_files (library_id, telegram_file_id, telegram_message_id, 
                       original_name, file_size, mime_type, upload_order) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
        
        const results = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const values = [
                libraryId, 
                file.telegram_file_id, 
                file.telegram_message_id,
                file.original_name, 
                file.file_size, 
                file.mime_type, 
                i + 1
            ];
            const result = await db.query(query, values);
            results.push(result.rows[0]);
        }
        return results;
    },

    async getAll() {
        const query = `SELECT l.*, u.full_name as uploaded_by_name 
                       FROM library l 
                       LEFT JOIN users u ON l.uploaded_by = u.id 
                       ORDER BY l.upload_date DESC`;
        const result = await db.query(query);
        return result.rows;
    },

    async getById(id) {
        const query = `SELECT * FROM library WHERE id = $1`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    async getFiles(libraryId) {
        const query = `SELECT * FROM library_files WHERE library_id = $1 ORDER BY upload_order`;
        const result = await db.query(query, [libraryId]);
        return result.rows;
    }
};

module.exports = Library;