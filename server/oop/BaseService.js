import ActivityLog from '../models/ActivityLog.js';

/**
 * BaseService - Abstract Base Class for OOP Business Services
 * Encapsulates common CRUD workflows, validation, and audit logging.
 */
export class BaseService {
  constructor(model, entityName = 'Entity') {
    this.model = model;
    this.entityName = entityName;
  }

  async getAll(filter = {}, sort = { createdAt: -1 }) {
    return await this.model.find(filter).sort(sort);
  }

  async getById(id) {
    const item = await this.model.findById(id);
    if (!item) {
      const error = new Error(`${this.entityName} with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }
    return item;
  }

  async create(data, activityDetails = null) {
    const entity = await this.model.create(data);
    if (activityDetails) {
      await this.logActivity(
        `${this.entityName} Created`,
        activityDetails.details || `Created ${this.entityName}: ${entity.name || entity.sku || entity._id}`,
        activityDetails.badge || 'SUCCESS',
        { entityId: entity._id }
      );
    }
    return entity;
  }

  async update(id, updateData, activityDetails = null) {
    const entity = await this.model.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    if (!entity) {
      const error = new Error(`${this.entityName} with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }
    if (activityDetails) {
      await this.logActivity(
        `${this.entityName} Updated`,
        activityDetails.details || `Updated ${this.entityName}: ${entity.name || entity.sku || entity._id}`,
        activityDetails.badge || 'INFO',
        { entityId: entity._id }
      );
    }
    return entity;
  }

  async delete(id, activityDetails = null) {
    const entity = await this.model.findByIdAndDelete(id);
    if (!entity) {
      const error = new Error(`${this.entityName} with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }
    if (activityDetails) {
      await this.logActivity(
        `${this.entityName} Deleted`,
        activityDetails.details || `Deleted ${this.entityName}: ${entity.name || entity.sku || entity._id}`,
        activityDetails.badge || 'DANGER',
        { entityId: id }
      );
    }
    return entity;
  }

  async logActivity(action, details, badgeType = 'INFO', metadata = {}) {
    try {
      await ActivityLog.create({
        action,
        entityType: this.entityName.toUpperCase(),
        details,
        badgeType,
        metadata
      });
    } catch (err) {
      console.error('Failed to write activity log:', err.message);
    }
  }
}
