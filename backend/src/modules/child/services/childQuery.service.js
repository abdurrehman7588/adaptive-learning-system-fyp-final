import { toChildSummary } from '../mappers/childDto.mapper.js';

export class ChildQueryService {
  /**
   * @param {import('../repositories/child.repository.js').ChildRepository} childRepository
   */
  constructor(childRepository) {
    this.childRepository = childRepository;
  }

  async listByParentId(parentId) {
    const rows = await this.childRepository.listByParentId(parentId);
    return rows.map(toChildSummary);
  }

  async existsForParent(parentId, childId) {
    const row = await this.childRepository.findByIdAndParentId(childId, parentId);
    return Boolean(row);
  }

  async countByParentId(parentId) {
    return this.childRepository.countByParentId(parentId);
  }

  async listChildIds(parentId) {
    const rows = await this.childRepository.listByParentId(parentId);
    return rows.map((row) => String(row.id));
  }

  async existsById(childId) {
    const row = await this.childRepository.findById(childId);
    return Boolean(row);
  }

  async findById(childId) {
    const row = await this.childRepository.findById(childId);
    return row ? toChildSummary(row) : null;
  }
}
