/** @implements {import('../../auth/ports/childAuth.port.js').ChildAuthPort} */
export class ChildAuthPortAdapter {
  /**
   * @param {import('../services/childCredential.service.js').ChildCredentialService} credentialService
   */
  constructor(credentialService) {
    this.credentialService = credentialService;
  }

  verifyUsernamePin(username, pin) {
    return this.credentialService.verifyUsernamePin(username, pin);
  }
}
