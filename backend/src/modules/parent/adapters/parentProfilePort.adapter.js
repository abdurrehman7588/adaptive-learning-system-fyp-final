/** Implements ParentProfilePort for Auth module composition. */
export class ParentProfilePortAdapter {
  /**
   * @param {import('../services/parentProfile.service.js').ParentProfileService} parentProfileService
   */
  constructor(parentProfileService) {
    this.parentProfileService = parentProfileService;
  }

  ensureProfileExists(parentId) {
    return this.parentProfileService.ensureProfileExists(parentId);
  }
}
