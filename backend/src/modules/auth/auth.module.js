import { AuthController } from './controllers/auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { StudentAuthService } from './services/studentAuth.service.js';
import { TokenService } from './services/token.service.js';
import {
  StubChildAuthAdapter,
  StubChildQueryAdapter,
} from './adapters/stubChildPorts.adapter.js';

/**
 * Composition root for Auth module (services + controller).
 * Routes file only mounts HTTP paths; no business logic here.
 *
 * @param {{
 *   childAuthPort?: import('./ports/childAuth.port.js').ChildAuthPort,
 *   childQueryPort?: import('./ports/childQuery.port.js').ChildQueryPort,
 *   parentProfilePort?: import('../../shared/ports/parentProfile.port.js').ParentProfilePort,
 * }} [deps]
 */
export function createAuthModule(deps = {}) {
  const childAuthPort = deps.childAuthPort ?? new StubChildAuthAdapter();
  const childQueryPort = deps.childQueryPort ?? new StubChildQueryAdapter();
  const tokenService = new TokenService();

  const authService = new AuthService({ childQueryPort, parentProfilePort: deps.parentProfilePort });
  const studentAuthService = new StudentAuthService({ childAuthPort, tokenService });
  const controller = new AuthController({ authService, studentAuthService });

  return { controller, authService, studentAuthService };
}
