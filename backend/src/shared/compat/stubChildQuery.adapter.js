/**
 * COMPAT: Stub until Child module implements ChildQueryPort.
 * Remove when Child module registers a real adapter in app.js.
 * @see backend/docs/specs/03-child-module.md
 */

/** @implements {import('../ports/childQuery.port.js').ChildQueryPort} */
export class StubChildQueryAdapter {
  async listByParentId() {
    return [];
  }

  async existsForParent() {
    return false;
  }

  async countByParentId() {
    return 0;
  }

  async listChildIds() {
    return [];
  }
}
