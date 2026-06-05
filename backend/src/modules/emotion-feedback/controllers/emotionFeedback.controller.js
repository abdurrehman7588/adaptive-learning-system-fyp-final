import { sendSuccess } from '../../../shared/http/envelope.js';

export class EmotionFeedbackController {
  /**
   * @param {import('../services/emotionFeedbackOrchestrator.service.js').EmotionFeedbackOrchestratorService} orchestrator
   */
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
  }

  submit = async (req, res) => {
    const result = await this.orchestrator.submitFeedback(req.auth, req.validated);
    return sendSuccess(res, result, 'Emotion feedback saved', 201);
  };

  listByChild = async (req, res) => {
    const data = await this.orchestrator.listForChild(req.auth, Number(req.params.childId));
    return sendSuccess(res, data, 'Emotion feedback loaded');
  };
}
