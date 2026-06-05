import { parseGradeLevel } from '../../../shared/content/taxonomy.js';
import { ChildLimitError } from '../errors/child.errors.js';
import { ChildNotFoundError } from '../errors/child.errors.js';
import { ChildValidationError } from '../errors/child.errors.js';
import { toChildResponse } from '../mappers/childDto.mapper.js';
import { ChildOwnershipRules } from './childOwnership.rules.js';
import { ChildCredentialService } from './childCredential.service.js';

const MAX_CHILDREN_PER_PARENT = 10;

export class ChildProfileService {
  /**
   * @param {{
   *   childRepository: import('../repositories/child.repository.js').ChildRepository,
   *   ownershipRules: ChildOwnershipRules,
   *   credentialService: ChildCredentialService,
   * }} deps
   */
  constructor(deps) {
    this.childRepository = deps.childRepository;
    this.ownershipRules = deps.ownershipRules;
    this.credentialService = deps.credentialService;
  }

  async createChild(parentId, dto) {
    const count = await this.childRepository.countByParentId(parentId);
    if (count >= MAX_CHILDREN_PER_PARENT) {
      throw new ChildLimitError();
    }

    const username = this.credentialService.normalizeUsername(dto.username);
    await this.credentialService.assertUsernameAvailable(username);
    const pinHash = await this.credentialService.hashPin(dto.pin);
    const gradeLevel = parseGradeLevel(dto.grade_level);
    if (!gradeLevel) {
      throw new ChildValidationError('Please select a valid grade level', [
        { field: 'grade_level', message: 'Grade must be Pre-K through Grade 6' },
      ]);
    }

    const row = await this.childRepository.insert({
      parentId: Number(parentId),
      name: dto.name.trim(),
      username,
      pinHash,
      gradeLevel,
      avatarUrl: dto.avatar_url?.trim() || null,
      age: dto.age ?? null,
      dateOfBirth: dto.date_of_birth ? new Date(dto.date_of_birth) : null,
      learningPreferences: dto.learning_preferences ?? {},
    });

    return toChildResponse(row);
  }

  async listChildrenForParent(parentId) {
    const rows = await this.childRepository.listByParentId(parentId);
    return rows.map(toChildResponse);
  }

  async getChildForParent(parentId, childId) {
    const row = await this.ownershipRules.assertParentOwnsChild(parentId, childId);
    return toChildResponse(row);
  }

  async getChildForStudent(childId) {
    const row = await this.childRepository.findById(childId);
    if (!row) {
      throw new ChildNotFoundError();
    }
    return toChildResponse(row);
  }

  async updateChild(parentId, childId, dto) {
    await this.ownershipRules.assertParentOwnsChild(parentId, childId);

    const patch = {};

    if (dto.name !== undefined) {
      patch.name = dto.name.trim();
    }
    if (dto.grade_level !== undefined) {
      patch.gradeLevel = parseGradeLevel(dto.grade_level);
    }
    if (dto.avatar_url !== undefined) {
      patch.avatarUrl = dto.avatar_url?.trim() || null;
    }
    if (dto.age !== undefined) {
      patch.age = dto.age;
    }
    if (dto.date_of_birth !== undefined) {
      patch.dateOfBirth = dto.date_of_birth ? new Date(dto.date_of_birth) : null;
    }
    if (dto.learning_preferences !== undefined) {
      patch.learningPreferences = dto.learning_preferences;
    }

    if (dto.username !== undefined) {
      const username = this.credentialService.normalizeUsername(dto.username);
      await this.credentialService.assertUsernameAvailable(username, childId);
      patch.username = username;
    }

    if (dto.pin !== undefined) {
      patch.pinHash = await this.credentialService.hashPin(dto.pin);
    }

    if (!Object.keys(patch).length) {
      const existing = await this.childRepository.findByIdAndParentId(childId, parentId);
      if (!existing) {
        throw new ChildNotFoundError();
      }
      return toChildResponse(existing);
    }

    const row = await this.childRepository.update(childId, patch);
    return toChildResponse(row);
  }

  async deleteChild(parentId, childId) {
    await this.ownershipRules.assertParentOwnsChild(parentId, childId);
    await this.childRepository.deleteById(childId);
  }

  /**
   * Student self-service: avatar only.
   * @param {number} childId
   * @param {string | null} avatarUrl
   */
  async updateChildAvatarAsStudent(childId, avatarUrl) {
    const existing = await this.childRepository.findById(childId);
    if (!existing) {
      throw new ChildNotFoundError();
    }

    const row = await this.childRepository.update(childId, {
      avatarUrl: avatarUrl?.trim() || null,
    });
    return toChildResponse(row);
  }
}
