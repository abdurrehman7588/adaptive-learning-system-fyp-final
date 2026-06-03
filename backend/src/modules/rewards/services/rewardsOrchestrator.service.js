import { AuthError } from '../../../shared/http/errors.js';
import { ParentForbiddenError } from '../../../shared/http/parentErrors.js';
import { buildChildRewards } from './rewardsCalculator.service.js';

export class RewardsOrchestratorService {
  /**
   * @param {{
   *   rewardsAttemptRepository: import('../repositories/rewardsAttempt.repository.js').RewardsAttemptRepository,
   *   childQueryPort: import('../../../shared/ports/childQuery.port.js').ChildQueryPort,
   * }} deps
   */
  constructor(deps) {
    this.repository = deps.rewardsAttemptRepository;
    this.childQueryPort = deps.childQueryPort;
  }

  async assertParentOwnsChild(parentId, childId) {
    const owns = await this.childQueryPort.existsForParent(
      Number(parentId),
      Number(childId),
    );
    if (!owns) {
      throw new ParentForbiddenError('You do not have access to this learner profile');
    }
  }

  async assertCanAccessChild(auth, childId) {
    if (auth.role === 'student') {
      if (String(auth.childId) !== String(childId)) {
        throw new AuthError(403, 'Access denied', 'AUTH_FORBIDDEN');
      }
      const exists = await this.childQueryPort.existsById(Number(childId));
      if (!exists) {
        throw new AuthError(403, 'Learner profile not found', 'AUTH_FORBIDDEN');
      }
      return;
    }

    if (auth.role === 'parent') {
      await this.assertParentOwnsChild(auth.parentId, childId);
      return;
    }

    throw new AuthError(403, 'Access denied', 'AUTH_FORBIDDEN');
  }

  async getParentRewardsOverview(parentId) {
    const children = await this.childQueryPort.listByParentId(Number(parentId));
    const attempts = await this.repository.findAttemptsForParentChildren(parentId);

    const attemptsByChild = new Map();
    for (const attempt of attempts) {
      const list = attemptsByChild.get(attempt.childId) ?? [];
      list.push(attempt);
      attemptsByChild.set(attempt.childId, list);
    }

    const childrenRewards = children.map((child) => ({
      id: child.id,
      name: child.name,
      gradeLevel: child.gradeLevel ?? null,
      rewards: buildChildRewards(attemptsByChild.get(child.id) ?? []),
    }));

    return { children: childrenRewards };
  }

  async getChildRewardsBundle(auth, childId) {
    await this.assertCanAccessChild(auth, childId);

    const childSummary = await this.#resolveChildSummary(auth, childId);
    const attempts = await this.repository.findAttemptsForChild(childId);

    return {
      child: childSummary,
      rewards: buildChildRewards(attempts),
    };
  }

  async #resolveChildSummary(auth, childId) {
    if (auth.role === 'parent') {
      const children = await this.childQueryPort.listByParentId(Number(auth.parentId));
      const child = children.find((row) => row.id === Number(childId));
      if (!child) {
        throw new ParentForbiddenError('Learner profile not found');
      }
      return {
        id: child.id,
        name: child.name,
        gradeLevel: child.gradeLevel ?? null,
      };
    }

    const child = await this.childQueryPort.findById(Number(childId));
    if (!child) {
      throw new AuthError(403, 'Learner profile not found', 'AUTH_FORBIDDEN');
    }

    return {
      id: child.id,
      name: child.name,
      gradeLevel: child.gradeLevel ?? null,
    };
  }
}
