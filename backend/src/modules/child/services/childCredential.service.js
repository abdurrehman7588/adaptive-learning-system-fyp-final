import bcrypt from 'bcryptjs';
import { ChildConflictError } from '../errors/child.errors.js';

const BCRYPT_ROUNDS = 12;

export class ChildCredentialService {
  /**
   * @param {import('../repositories/child.repository.js').ChildRepository} childRepository
   */
  constructor(childRepository) {
    this.childRepository = childRepository;
  }

  normalizeUsername(username) {
    return username.trim().toLowerCase();
  }

  async hashPin(pin) {
    return bcrypt.hash(pin, BCRYPT_ROUNDS);
  }

  async isUsernameAvailable(username, excludeChildId) {
    const normalized = this.normalizeUsername(username);
    const taken = await this.childRepository.isUsernameTaken(normalized, excludeChildId);
    return !taken;
  }

  async assertUsernameAvailable(username, excludeChildId) {
    const available = await this.isUsernameAvailable(username, excludeChildId);
    if (!available) {
      throw new ChildConflictError();
    }
  }

  async verifyUsernamePin(username, pin) {
    const normalized = this.normalizeUsername(username);
    const row = await this.childRepository.findByUsername(normalized);

    if (!row || !row.isActive) {
      return null;
    }

    const valid = await bcrypt.compare(pin, row.pinHash);
    if (!valid) {
      return null;
    }

    return {
      childId: row.id,
      name: row.name,
      gradeLevel: row.gradeLevel,
      avatarUrl: row.avatarUrl,
      parentId: row.parentId,
      age: row.age,
    };
  }
}
