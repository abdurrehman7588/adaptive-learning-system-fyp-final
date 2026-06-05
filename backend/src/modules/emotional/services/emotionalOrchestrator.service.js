import { AppError, AuthError } from '../../../shared/http/errors.js';
import {
  isPrismaMissingTableError,
  markEmotionalSchemaUnavailable,
} from '../../../shared/db/emotionalSchema.js';
import { ParentForbiddenError } from '../../../shared/http/parentErrors.js';
import { EmotionalSchemaNotReadyError } from '../errors/emotional.errors.js';
import { EI_ACTIVITIES, XP_EI_ACTIVITY } from '../constants/eiCatalog.js';
import { EmotionalRepository } from '../repositories/emotional.repository.js';
import { scoreAssessment } from '../services/emotionalScoring.service.js';
import {
  toActivityCompletionDto,
  toAssessmentResultDto,
  toHistoryDto,
  toProfileDto,
  toUnavailableProfileDto,
} from '../mappers/emotionalDto.mapper.js';

export class EmotionalOrchestratorService {
  /**
   * @param {{
   *   emotionalRepository: EmotionalRepository,
   *   childQueryPort: import('../../../shared/ports/childQuery.port.js').ChildQueryPort,
   * }} deps
   */
  constructor(deps) {
    this.repository = deps.emotionalRepository;
    this.childQueryPort = deps.childQueryPort;
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
      const owns = await this.childQueryPort.existsForParent(
        Number(auth.parentId),
        Number(childId),
      );
      if (!owns) {
        throw new ParentForbiddenError('You do not have access to this learner profile');
      }
      return;
    }

    throw new AuthError(403, 'Access denied', 'AUTH_FORBIDDEN');
  }

  async getProfile(auth, childId) {
    await this.assertCanAccessChild(auth, childId);
    return this.#runRead(() => this.#loadProfile(Number(childId)), toUnavailableProfileDto());
  }

  async getHistory(auth, childId) {
    await this.assertCanAccessChild(auth, childId);
    return this.#runRead(
      async () => {
        const rows = await this.repository.findAssessmentHistory(Number(childId));
        return { schemaStatus: 'ready', history: toHistoryDto(rows) };
      },
      { schemaStatus: 'unavailable', history: [] },
    );
  }

  async submitAssessment(auth, childId, validated) {
    await this.assertCanAccessChild(auth, childId);
    return this.#runWrite(async () => {
      /** @type {Record<string, number[]>} */
      const valuesByDimension = {
        self_awareness: [],
        empathy: [],
        self_regulation: [],
      };

      for (const row of validated.responses) {
        valuesByDimension[row.dimension][row.questionIndex] = row.value;
      }

      const scored = scoreAssessment(valuesByDimension);
      const assessment = await this.repository.createAssessment(Number(childId), {
        selfAwarenessPercent: scored.categories.self_awareness.percent,
        empathyPercent: scored.categories.empathy.percent,
        selfRegulationPercent: scored.categories.self_regulation.percent,
        overallPercent: scored.overallPercent,
        selfAwarenessStatus: scored.categories.self_awareness.status,
        empathyStatus: scored.categories.empathy.status,
        selfRegulationStatus: scored.categories.self_regulation.status,
        responses: validated.responses,
      });

      const feelingsCompletions = await this.repository.findFeelingsJournalCompletions(
        Number(childId),
      );
      return toAssessmentResultDto(assessment, feelingsCompletions);
    });
  }

  async completeActivity(auth, childId, slug, body) {
    await this.assertCanAccessChild(auth, childId);
    return this.#runWrite(async () => {
      const activity = EI_ACTIVITIES[slug];
      if (!activity) {
        throw new AppError(404, 'Unknown activity', 'NOT_FOUND');
      }

      let xpAwarded = 0;
      let payload = {};
      let success = true;

      if (activity.type === 'feelings_journal') {
        payload = { feeling: body.feeling, reason: body.reason };
        xpAwarded = XP_EI_ACTIVITY;
      } else {
        payload = { answer: body.answer };
        success = body.answer === activity.correctAnswer;
        xpAwarded = success ? XP_EI_ACTIVITY : 0;
      }

      const completion = await this.repository.createActivityCompletion(Number(childId), {
        activitySlug: slug,
        dimension: activity.dimension,
        xpAwarded,
        payload,
      });

      return toActivityCompletionDto(completion, success);
    });
  }

  async sumBonusXp(childId) {
    try {
      const result = await this.repository.sumXpAwarded(Number(childId));
      return result._sum.xpAwarded ?? 0;
    } catch (error) {
      if (isPrismaMissingTableError(error)) {
        markEmotionalSchemaUnavailable();
        return 0;
      }
      throw error;
    }
  }

  async #loadProfile(childId) {
    const latest = await this.repository.findLatestAssessment(childId);
    const feelingsCompletions =
      await this.repository.findFeelingsJournalCompletions(childId);
    return toProfileDto(latest, feelingsCompletions);
  }

  /**
   * @template T
   * @param {() => Promise<T>} operation
   * @param {T} fallback
   */
  async #runRead(operation, fallback) {
    try {
      return await operation();
    } catch (error) {
      if (isPrismaMissingTableError(error)) {
        markEmotionalSchemaUnavailable();
        return fallback;
      }
      throw error;
    }
  }

  /**
   * @template T
   * @param {() => Promise<T>} operation
   */
  async #runWrite(operation) {
    try {
      return await operation();
    } catch (error) {
      if (isPrismaMissingTableError(error)) {
        markEmotionalSchemaUnavailable();
        throw new EmotionalSchemaNotReadyError();
      }
      throw error;
    }
  }
}
