import { ParentForbiddenError } from '../../../shared/http/parentErrors.js';

export class ParentOwnershipService {
  /**
   * @param {import('../../../shared/ports/childQuery.port.js').ChildQueryPort} childQueryPort
   */
  constructor(childQueryPort) {
    this.childQueryPort = childQueryPort;
  }

  async assertOwnsChild(parentId, childId) {
    const owns = await this.childQueryPort.existsForParent(
      Number(parentId),
      Number(childId),
    );
    if (!owns) {
      throw new ParentForbiddenError('You do not have access to this learner profile');
    }
  }

  listChildIds(parentId) {
    return this.childQueryPort.listChildIds(Number(parentId));
  }

  listChildrenSummary(parentId) {
    return this.childQueryPort.listByParentId(Number(parentId));
  }

  countChildren(parentId) {
    return this.childQueryPort.countByParentId(Number(parentId));
  }
}
