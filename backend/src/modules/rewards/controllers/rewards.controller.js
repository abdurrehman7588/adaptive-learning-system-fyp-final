import { sendSuccess } from '../../../shared/http/envelope.js';

export class RewardsController {
  /**
   * @param {import('../services/rewardsOrchestrator.service.js').RewardsOrchestratorService} orchestrator
   */
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
  }

  parentRewardsOverview = async (req, res) => {
    const overview = await this.orchestrator.getParentRewardsOverview(req.auth.parentId);
    return sendSuccess(res, { overview }, 'Rewards overview loaded');
  };

  childRewards = async (req, res) => {
    const bundle = await this.orchestrator.getChildRewardsBundle(
      req.auth,
      Number(req.params.childId),
    );
    return sendSuccess(res, bundle, 'Child rewards loaded');
  };
}
