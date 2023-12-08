import mysql from 'mysql';

export const queryAsync = (pool: mysql.Pool) => (sql: string, queryParams: string|number[] = []) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, queryParams, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};