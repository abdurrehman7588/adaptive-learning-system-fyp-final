import { ChildForbiddenError, ChildNotFoundError } from '../errors/child.errors.js';

export class ChildOwnershipRules {
  /**
   * @param {import('../repositories/child.repository.js').ChildRepository} childRepository
   */
  constructor(childRepository) {
    this.childRepository = childRepository;
  }

  async assertParentOwnsChild(parentId, childId) {
    const row = await this.childRepository.findByIdAndParentId(childId, parentId);
    if (!row) {
      throw new ChildNotFoundError();
    }
    return row;
  }

  async resolveParentIdForChild(childId) {
    const row = await this.childRepository.findById(childId);
    if (!row) {
      throw new ChildNotFoundError();
    }
    return row.parentId;
  }

  assertStudentSelfAccess(authChildId, requestedChildId) {
    if (String(authChildId) !== String(requestedChildId)) {
      throw new ChildForbiddenError();
    }
  }
}
