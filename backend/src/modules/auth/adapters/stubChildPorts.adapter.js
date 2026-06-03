/**
 * COMPAT: Student auth stub until Child module ships.
 * @see backend/docs/specs/03-child-module.md
 */

/** @implements {import('../ports/childAuth.port.js').ChildAuthPort} */
export class StubChildAuthAdapter {
  async verifyUsernamePin() {
    return null;
  }
}

export { StubChildQueryAdapter } from '../../../shared/compat/stubChildQuery.adapter.js';
