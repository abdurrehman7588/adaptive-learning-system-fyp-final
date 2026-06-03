import { sendSuccess } from '../../../shared/http/envelope.js';

export class ParentController {
  /**
   * @param {{
   *   parentProfileService: import('../services/parentProfile.service.js').ParentProfileService,
   *   onboardingService: import('../services/onboarding.service.js').OnboardingService,
   *   dashboardBootstrapService: import('../services/dashboardBootstrap.service.js').DashboardBootstrapService,
   * }} deps
   */
  constructor(deps) {
    this.parentProfileService = deps.parentProfileService;
    this.onboardingService = deps.onboardingService;
    this.dashboardBootstrapService = deps.dashboardBootstrapService;
  }

  getMe = async (req, res) => {
    const profile = await this.parentProfileService.getProfile(req.auth.parentId);
    return sendSuccess(res, { profile }, 'Profile loaded');
  };

  updatePreferences = async (req, res) => {
    const profile = await this.parentProfileService.mergePreferences(
      req.auth.parentId,
      req.validated,
    );
    return sendSuccess(res, { profile }, 'Preferences saved');
  };

  getOnboarding = async (req, res) => {
    const onboarding = await this.onboardingService.getStatus(req.auth.parentId);
    return sendSuccess(res, { onboarding }, 'Onboarding status loaded');
  };

  updateOnboarding = async (req, res) => {
    const onboarding = await this.onboardingService.update(
      req.auth.parentId,
      req.validated,
    );
    return sendSuccess(res, { onboarding }, 'Onboarding updated');
  };

  getBootstrap = async (req, res) => {
    const bootstrap = await this.dashboardBootstrapService.getBootstrap(
      req.auth.parentId,
    );
    return sendSuccess(res, bootstrap, 'Dashboard bootstrap loaded');
  };
}
