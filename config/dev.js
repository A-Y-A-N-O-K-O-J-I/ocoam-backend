// dev.js
const Database = require('better-sqlite3');
const db = new Database("dev.db");

// Convert $1, $2... to ? placeholders for SQLite
function normalizePlaceholders(query, params) {
  let placeholders = query.match(/\$\d+/g);
  if (!placeholders) return { sql: query, params };

  placeholders = [...new Set(placeholders)].sort(
    (a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))
  );

  const sql = query.replace(/\$\d+/g, '?');
  const newParams = placeholders.map(p => params[parseInt(p.slice(1)) - 1]);

  return { sql, params: newParams };
}

function close() {
  db.close();
}

module.exports = {
  async query(text, params = []) {
    const { sql, params: fixedParams } = normalizePlaceholders(text, params);
    const stmt = db.prepare(sql);

    if (/^\s*select/i.test(text)) {
      return { rows: stmt.all(fixedParams) }; // ✅ wrap in .rows
    } else {
      stmt.run(fixedParams);
      return { rows: [] }; // ✅ always consistent
    }
  },
  close
};
