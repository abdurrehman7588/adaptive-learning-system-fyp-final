/**
 * Implemented by Child module. Auth uses a stub until Child is wired.
 * @typedef {Object} ChildAuthIdentity
 * @property {number} childId
 * @property {string} name
 * @property {string|null} gradeLevel
 * @property {string|null} avatarUrl
 * @property {number} parentId
 * @property {number|null} age
 */

/**
 * @typedef {Object} ChildAuthPort
 * @property {(username: string, pin: string) => Promise<ChildAuthIdentity|null>} verifyUsernamePin
 */

export {};
