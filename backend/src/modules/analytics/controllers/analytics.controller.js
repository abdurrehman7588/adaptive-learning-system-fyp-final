import { sendSuccess } from '../../../shared/http/envelope.js';

export class AnalyticsController {
  /**
   * @param {import('../services/analyticsOrchestrator.service.js').AnalyticsOrchestratorService} orchestrator
   */
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
  }

  parentAnalyticsOverview = async (req, res) => {
    const overview = await this.orchestrator.getParentAnalyticsOverview(req.auth.parentId);
    return sendSuccess(res, { overview }, 'Analytics overview loaded');
  };

  childAnalytics = async (req, res) => {
    const bundle = await this.orchestrator.getChildAnalyticsBundle(
      req.auth,
      Number(req.params.childId),
    );
    return sendSuccess(res, bundle, 'Child analytics loaded');
  };

  parentRecommendationsOverview = async (req, res) => {
    const overview = await this.orchestrator.getParentRecommendationsOverview(
      req.auth.parentId,
    );
    return sendSuccess(res, { overview }, 'Recommendations overview loaded');
  };

  childRecommendations = async (req, res) => {
    const bundle = await this.orchestrator.getChildRecommendationsBundle(
      req.auth,
      Number(req.params.childId),
    );
    return sendSuccess(res, bundle, 'Child recommendations loaded');
  };

  studentRecommendations = async (req, res) => {
    const bundle = await this.orchestrator.getChildRecommendationsBundle(
      req.auth,
      Number(req.auth.childId),
    );
    return sendSuccess(res, bundle, 'Student recommendations loaded');
  };
}
