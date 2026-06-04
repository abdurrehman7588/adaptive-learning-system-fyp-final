import { sendSuccess } from '../../../shared/http/envelope.js';

export class EmotionalController {
  /**
   * @param {import('../services/emotionalOrchestrator.service.js').EmotionalOrchestratorService} orchestrator
   */
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
  }

  studentProfile = async (req, res) => {
    const profile = await this.orchestrator.getProfile(req.auth, Number(req.auth.childId));
    return sendSuccess(res, profile, 'Emotional profile loaded');
  };

  studentHistory = async (req, res) => {
    const data = await this.orchestrator.getHistory(req.auth, Number(req.auth.childId));
    return sendSuccess(res, data, 'Emotional history loaded');
  };

  studentSubmitAssessment = async (req, res) => {
    const result = await this.orchestrator.submitAssessment(
      req.auth,
      Number(req.auth.childId),
      req.validated,
    );
    return sendSuccess(res, result, 'Emotional assessment saved', 201);
  };

  studentCompleteActivity = async (req, res) => {
    const result = await this.orchestrator.completeActivity(
      req.auth,
      Number(req.auth.childId),
      req.activitySlug,
      req.validated,
    );
    return sendSuccess(res, result, 'Activity completed', 201);
  };

  childProfile = async (req, res) => {
    const profile = await this.orchestrator.getProfile(req.auth, Number(req.params.childId));
    return sendSuccess(res, profile, 'Emotional profile loaded');
  };
}
