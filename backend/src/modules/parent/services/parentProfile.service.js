import { ParentProfileRepository } from '../repositories/parentProfile.repository.js';
import { ParentOwnershipService } from './parentOwnership.service.js';
import {
  buildParentProfileResponse,
  normalizePreferences,
} from '../mappers/parentDto.mapper.js';

export class ParentProfileService {
  /**
   * @param {{
   *   parentProfileRepository?: ParentProfileRepository,
   *   parentUserReadPort: import('../../../shared/ports/parentUserRead.port.js').ParentUserReadPort,
   *   ownershipService: ParentOwnershipService,
   * }} deps
   */
  constructor(deps) {
    this.repository = deps.parentProfileRepository ?? new ParentProfileRepository();
    this.parentUserReadPort = deps.parentUserReadPort;
    this.ownershipService = deps.ownershipService;
  }

  async ensureProfileExists(parentId) {
    const existing = await this.repository.findByParentId(parentId);
    if (!existing) {
      await this.repository.insertDefault(parentId);
    }
  }

  async getProfile(parentId) {
    await this.ensureProfileExists(parentId);
    const user = await this.parentUserReadPort.findParentById(parentId);
    const profileRow = await this.repository.findByParentId(parentId);
    const childCount = await this.ownershipService.countChildren(parentId);
    return buildParentProfileResponse(user, profileRow, childCount);
  }

  async updateProfileFields(parentId, { preferredLanguage }) {
    await this.ensureProfileExists(parentId);
    const data = {};
    if (preferredLanguage !== undefined) {
      data.preferredLanguage = preferredLanguage || null;
    }
    if (Object.keys(data).length) {
      await this.repository.update(parentId, data);
    }
    return this.getProfile(parentId);
  }

  async mergePreferences(parentId, partial) {
    await this.ensureProfileExists(parentId);
    const sanitized = normalizePreferences(partial);
    await this.repository.updatePreferences(parentId, sanitized);
    return this.getProfile(parentId);
  }
}
