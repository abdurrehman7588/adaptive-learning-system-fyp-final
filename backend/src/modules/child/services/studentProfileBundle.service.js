import { ChildNotFoundError } from '../errors/child.errors.js';
import { buildStudentProfileBundle } from '../mappers/studentProfileDto.mapper.js';

export class StudentProfileBundleService {
  /**
   * @param {{
   *   childRepository: import('../repositories/child.repository.js').ChildRepository,
   *   rewardsAttemptRepository: import('../../rewards/repositories/rewardsAttempt.repository.js').RewardsAttemptRepository,
   *   childProfileService: import('./childProfile.service.js').ChildProfileService,
   * }} deps
   */
  constructor(deps) {
    this.childRepository = deps.childRepository;
    this.rewardsAttemptRepository = deps.rewardsAttemptRepository;
    this.childProfileService = deps.childProfileService;
  }

  async getProfileBundle(childId) {
    const row = await this.childRepository.findByIdWithParent(childId);
    if (!row) {
      throw new ChildNotFoundError();
    }

    const attempts = await this.rewardsAttemptRepository.findAttemptsForChild(childId);
    return buildStudentProfileBundle(row, attempts);
  }

  async updateStudentAvatar(childId, avatarUrl) {
    return this.childProfileService.updateChildAvatarAsStudent(childId, avatarUrl);
  }
}
