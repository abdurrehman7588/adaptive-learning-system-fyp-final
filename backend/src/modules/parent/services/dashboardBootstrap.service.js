import { ParentProfileService } from './parentProfile.service.js';
import { ParentOwnershipService } from './parentOwnership.service.js';

export class DashboardBootstrapService {
  /**
   * @param {{
   *   parentProfileService: ParentProfileService,
   *   ownershipService: ParentOwnershipService,
   * }} deps
   */
  constructor(deps) {
    this.parentProfileService = deps.parentProfileService;
    this.ownershipService = deps.ownershipService;
  }

  async getBootstrap(parentId) {
    const profile = await this.parentProfileService.getProfile(parentId);
    const children = await this.ownershipService.listChildrenSummary(parentId);

    return {
      profile,
      children: children.map((child) => ({
        id: child.id,
        name: child.name,
        gradeLevel: child.gradeLevel ?? null,
        avatarUrl: child.avatarUrl ?? null,
      })),
      defaultChildId: children[0]?.id ?? null,
    };
  }
}
