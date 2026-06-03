import { ChildRepository } from './repositories/child.repository.js';
import { ChildCredentialService } from './services/childCredential.service.js';
import { ChildOwnershipRules } from './services/childOwnership.rules.js';
import { ChildProfileService } from './services/childProfile.service.js';
import { ChildQueryService } from './services/childQuery.service.js';
import { ChildController } from './controllers/child.controller.js';
import { ChildAuthPortAdapter } from './adapters/childAuthPort.adapter.js';
import { ChildQueryPortAdapter } from './adapters/childQueryPort.adapter.js';
import { RewardsAttemptRepository } from '../rewards/repositories/rewardsAttempt.repository.js';
import { StudentProfileBundleService } from './services/studentProfileBundle.service.js';

export function createChildModule() {
  const childRepository = new ChildRepository();
  const credentialService = new ChildCredentialService(childRepository);
  const ownershipRules = new ChildOwnershipRules(childRepository);
  const childQueryService = new ChildQueryService(childRepository);

  const childProfileService = new ChildProfileService({
    childRepository,
    ownershipRules,
    credentialService,
  });

  const studentProfileBundleService = new StudentProfileBundleService({
    childRepository,
    rewardsAttemptRepository: new RewardsAttemptRepository(),
    childProfileService,
  });

  const controller = new ChildController({
    childProfileService,
    studentProfileBundleService,
  });

  const childAuthPort = new ChildAuthPortAdapter(credentialService);
  const childQueryPort = new ChildQueryPortAdapter(childQueryService);

  return {
    controller,
    childProfileService,
    childAuthPort,
    childQueryPort,
  };
}
