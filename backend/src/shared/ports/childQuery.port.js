/**
 * @typedef {Object} ChildSummary
 * @property {number} id
 * @property {string} name
 * @property {string|null} [gradeLevel]
 * @property {string|null} [avatarUrl]
 */

/**
 * @typedef {Object} ChildQueryPort
 * @property {(parentId: number) => Promise<ChildSummary[]>} listByParentId
 * @property {(parentId: number, childId: number) => Promise<boolean>} existsForParent
 * @property {(parentId: number) => Promise<number>} countByParentId
 * @property {(parentId: number) => Promise<string[]>} listChildIds
 * @property {(childId: number) => Promise<boolean>} existsById
 * @property {(childId: number) => Promise<ChildSummary|null>} findById
 */

export {};
