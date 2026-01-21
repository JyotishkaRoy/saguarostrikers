const crypto = require('crypto');

/**
 * Generate a 12-digit alphanumeric ID
 * Format: [A-Za-z0-9]{12}
 * Examples: "aB3x9Km2Pq7w", "Zx4K8mN1vR2y"
 */
function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const randomBytes = crypto.randomBytes(12);
  
  for (let i = 0; i < 12; i++) {
    id += chars[randomBytes[i] % chars.length];
  }
  
  return id;
}

/**
 * Validate if a string is a valid 12-digit alphanumeric ID
 */
function isValidId(id) {
  return /^[A-Za-z0-9]{12}$/.test(id);
}

/**
 * Generate multiple unique IDs
 */
function generateIds(count) {
  const ids = new Set();
  
  while (ids.size < count) {
    ids.add(generateId());
  }
  
  return Array.from(ids);
}

module.exports = {
  generateId,
  isValidId,
  generateIds
};
