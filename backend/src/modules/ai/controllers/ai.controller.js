import { sendSuccess } from '../../../shared/http/envelope.js';

export class AiController {
  /**
   * @param {import('../services/aiOrchestrator.service.js').AiOrchestratorService} orchestrator
   */
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
  }

  childRecommendation = async (req, res) => {
    const prediction = await this.orchestrator.getChildRecommendation(
      req.auth,
      Number(req.params.childId),
    );

    return sendSuccess(
      res,
      {
        recommendation: prediction.recommendation,
        confidence: prediction.confidence,
      },
      'Recommendation loaded',
    );
  };
}
