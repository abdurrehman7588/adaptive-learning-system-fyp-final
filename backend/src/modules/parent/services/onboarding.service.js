import { ParentProfileRepository } from '../repositories/parentProfile.repository.js';
import { ParentProfileService } from './parentProfile.service.js';
import { ParentOwnershipService } from './parentOwnership.service.js';
import { buildOnboardingStatus } from '../mappers/parentDto.mapper.js';

export class OnboardingService {
  /**
   * @param {{
   *   parentProfileRepository?: ParentProfileRepository,
   *   parentProfileService: ParentProfileService,
   *   ownershipService: ParentOwnershipService,
   * }} deps
   */
  constructor(deps) {
    this.repository = deps.parentProfileRepository ?? new ParentProfileRepository();
    this.parentProfileService = deps.parentProfileService;
    this.ownershipService = deps.ownershipService;
  }

  async getStatus(parentId) {
    await this.parentProfileService.ensureProfileExists(parentId);
    const profileRow = await this.repository.findByParentId(parentId);
    const childCount = await this.ownershipService.countChildren(parentId);
    return buildOnboardingStatus(profileRow, childCount);
  }

  async update(parentId, { completed, skipped, preferences }) {
    await this.parentProfileService.ensureProfileExists(parentId);

    const patch = {};
    if (completed === true) {
      patch.onboardingCompleted = true;
      patch.onboardingSkipped = false;
    }
    if (skipped === true) {
      patch.onboardingSkipped = true;
    }

    if (Object.keys(patch).length) {
      await this.repository.update(parentId, patch);
    }

    if (preferences && typeof preferences === 'object') {
      await this.parentProfileService.mergePreferences(parentId, preferences);
    }

    return this.getStatus(parentId);
  }
}
