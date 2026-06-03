import { UserRepository } from '../repositories/user.repository.js';
import { AuthError } from '../../../shared/http/errors.js';

/** Read-only bridge: Parent module reads parent identity via port, not Auth repository. */
export class ParentUserReadAdapter {
  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async findParentById(parentId) {
    const user = await this.userRepository.findById(parentId);
    if (!user || user.role !== 'parent') {
      throw new AuthError(401, 'Parent account not found', 'AUTH_UNAUTHORIZED');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };
  }
}
