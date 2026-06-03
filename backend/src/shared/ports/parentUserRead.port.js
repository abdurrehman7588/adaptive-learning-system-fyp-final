/**
 * Read-only parent identity from Auth domain (users table).
 * @typedef {Object} ParentUserRecord
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string|null} [avatarUrl]
 */

/**
 * @typedef {Object} ParentUserReadPort
 * @property {(parentId: number) => Promise<ParentUserRecord|null>} findParentById
 */

export {};
