import { ParentProfileRepository } from './repositories/parentProfile.repository.js';
import { ParentProfileService } from './services/parentProfile.service.js';
import { ParentOwnershipService } from './services/parentOwnership.service.js';
import { OnboardingService } from './services/onboarding.service.js';
import { DashboardBootstrapService } from './services/dashboardBootstrap.service.js';
import { ParentController } from './controllers/parent.controller.js';
import { ParentProfilePortAdapter } from './adapters/parentProfilePort.adapter.js';

/**
 * @param {{
 *   childQueryPort: import('../../shared/ports/childQuery.port.js').ChildQueryPort,
 *   parentUserReadPort: import('../../shared/ports/parentUserRead.port.js').ParentUserReadPort,
 * }} deps
 */
export function createParentModule(deps) {
  const ownershipService = new ParentOwnershipService(deps.childQueryPort);
  const parentProfileRepository = new ParentProfileRepository();

  const parentProfileService = new ParentProfileService({
    parentProfileRepository,
    parentUserReadPort: deps.parentUserReadPort,
    ownershipService,
  });

  const onboardingService = new OnboardingService({
    parentProfileRepository,
    parentProfileService,
    ownershipService,
  });

  const dashboardBootstrapService = new DashboardBootstrapService({
    parentProfileService,
    ownershipService,
  });

  const controller = new ParentController({
    parentProfileService,
    onboardingService,
    dashboardBootstrapService,
  });

  const parentProfilePort = new ParentProfilePortAdapter(parentProfileService);

  return {
    controller,
    parentProfileService,
    ownershipService,
    parentProfilePort,
  };
}
