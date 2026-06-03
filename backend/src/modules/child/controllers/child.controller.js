import { sendSuccess } from '../../../shared/http/envelope.js';
import { ChildForbiddenError } from '../errors/child.errors.js';

export class ChildController {
  /**
   * @param {{
   *   childProfileService: import('../services/childProfile.service.js').ChildProfileService,
   *   studentProfileBundleService?: import('../services/studentProfileBundle.service.js').StudentProfileBundleService,
   * }} deps
   */
  constructor({ childProfileService, studentProfileBundleService }) {
    this.childProfileService = childProfileService;
    this.studentProfileBundleService = studentProfileBundleService;
  }

  list = async (req, res) => {
    const children = await this.childProfileService.listChildrenForParent(
      req.auth.parentId,
    );
    return sendSuccess(res, { children }, 'Children loaded');
  };

  create = async (req, res) => {
    const child = await this.childProfileService.createChild(
      req.auth.parentId,
      req.validated,
    );
    return sendSuccess(res, { child }, 'Learner profile created', 201);
  };

  getById = async (req, res) => {
    const childId = Number(req.params.id);

    if (req.auth.role === 'student') {
      if (String(req.auth.childId) !== String(childId)) {
        throw new ChildForbiddenError();
      }
      const child = await this.childProfileService.getChildForStudent(childId);
      return sendSuccess(res, { child }, 'Profile loaded');
    }

    const child = await this.childProfileService.getChildForParent(
      req.auth.parentId,
      childId,
    );
    return sendSuccess(res, { child }, 'Profile loaded');
  };

  update = async (req, res) => {
    const child = await this.childProfileService.updateChild(
      req.auth.parentId,
      Number(req.params.id),
      req.validated,
    );
    return sendSuccess(res, { child }, 'Learner profile updated');
  };

  remove = async (req, res) => {
    await this.childProfileService.deleteChild(
      req.auth.parentId,
      Number(req.params.id),
    );
    return sendSuccess(res, {}, 'Learner profile removed');
  };

  studentProfile = async (req, res) => {
    const bundle = await this.studentProfileBundleService.getProfileBundle(
      Number(req.auth.childId),
    );
    return sendSuccess(res, bundle, 'Student profile loaded');
  };

  updateStudentSelf = async (req, res) => {
    const child = await this.studentProfileBundleService.updateStudentAvatar(
      Number(req.auth.childId),
      req.validated.avatar_url,
    );
    return sendSuccess(res, { child }, 'Profile updated');
  };
}
