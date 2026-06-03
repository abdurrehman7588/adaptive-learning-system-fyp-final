/** @implements {import('../../../shared/ports/childQuery.port.js').ChildQueryPort} */
export class ChildQueryPortAdapter {
  /**
   * @param {import('../services/childQuery.service.js').ChildQueryService} childQueryService
   */
  constructor(childQueryService) {
    this.childQueryService = childQueryService;
  }

  listByParentId(parentId) {
    return this.childQueryService.listByParentId(parentId);
  }

  existsForParent(parentId, childId) {
    return this.childQueryService.existsForParent(parentId, childId);
  }

  countByParentId(parentId) {
    return this.childQueryService.countByParentId(parentId);
  }

  listChildIds(parentId) {
    return this.childQueryService.listChildIds(parentId);
  }

  existsById(childId) {
    return this.childQueryService.existsById(childId);
  }

  findById(childId) {
    return this.childQueryService.findById(childId);
  }
}
