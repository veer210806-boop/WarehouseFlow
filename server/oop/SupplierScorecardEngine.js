import { BaseService } from './BaseService.js';

/**
 * SupplierScorecardEngine
 * OOP Service calculating automated 1 to 5 Star ratings, on-time delivery %, quality defect rates, and reliability grades
 */
class SupplierScorecardEngine extends BaseService {
  constructor() {
    super(null, 'SupplierScorecard');
  }

  /**
   * Calculate 1-5 Star rating and Grade from performance metrics
   * @param {Object} metrics { onTimeDeliveryRate, qualityDefectRate, priceStabilityScore }
   * @returns {Object} { rating, grade, reliabilityScore, summaryText }
   */
  evaluateSupplierMetrics({ onTimeDeliveryRate = 95, qualityDefectRate = 1.0, priceStabilityScore = 90 }) {
    // 1. On-Time Delivery component (45% weight)
    const onTimeScore = Math.max(0, Math.min(100, Number(onTimeDeliveryRate)));

    // 2. Quality / Damaged Goods component (35% weight)
    // 0% defects = 100 points, 10% defects = 0 points
    const qualityScore = Math.max(0, Math.min(100, 100 - (Number(qualityDefectRate) * 10)));

    // 3. Price Stability component (20% weight)
    const priceScore = Math.max(0, Math.min(100, Number(priceStabilityScore)));

    // Weighted composite score (0 - 100)
    const compositeScore = (0.45 * onTimeScore) + (0.35 * qualityScore) + (0.20 * priceScore);

    // Convert to 1.0 - 5.0 Star scale
    const rating = Math.min(5.0, Math.max(1.0, Number((compositeScore / 20).toFixed(1))));

    // Determine Letter Grade
    let grade = 'B';
    let summaryText = 'Moderate vendor with occasional delays or price fluctuations.';

    if (rating >= 4.6) {
      grade = 'A+';
      summaryText = 'Top Tier Partner — exceptional punctuality, zero damage rates, and rock-solid pricing.';
    } else if (rating >= 4.0) {
      grade = 'A';
      summaryText = 'Highly Reliable Vendor — consistent delivery timeline and strong quality control.';
    } else if (rating >= 3.2) {
      grade = 'B';
      summaryText = 'Average Reliability — monitor lead times and inspect incoming fragile packaging.';
    } else {
      grade = 'C';
      summaryText = 'High Risk Vendor — recurring shipment delays and elevated damaged goods rate.';
    }

    return {
      compositeScore: Math.round(compositeScore),
      rating,
      grade,
      summaryText
    };
  }

  /**
   * Recalculate supplier stats after a new delivery inspection
   * @param {Object} currentSupplier
   * @param {Object} inspection { wasOnTime: boolean, totalUnits: number, damagedUnits: number, priceHikePercent: number }
   * @returns {Object} updated supplier fields
   */
  applyDeliveryInspection(currentSupplier, inspection) {
    const totalOrders = (Number(currentSupplier.totalOrdersCompleted) || 10) + 1;

    // Rolling On-Time rate
    const currentOnTime = Number(currentSupplier.onTimeDeliveryRate) || 95;
    const newOnTime = inspection.wasOnTime ? 100 : 0;
    const updatedOnTime = Number((((currentOnTime * (totalOrders - 1)) + newOnTime) / totalOrders).toFixed(1));

    // Rolling Defect rate
    const currentDefect = Number(currentSupplier.qualityDefectRate) || 1.0;
    const batchDefect = inspection.totalUnits > 0
      ? (Number(inspection.damagedUnits || 0) / Number(inspection.totalUnits)) * 100
      : 0;
    const updatedDefect = Number((((currentDefect * (totalOrders - 1)) + batchDefect) / totalOrders).toFixed(1));

    // Rolling Price Stability
    let updatedPriceStability = Number(currentSupplier.priceStabilityScore) || 90;
    if (inspection.priceHikePercent && inspection.priceHikePercent > 0) {
      updatedPriceStability = Math.max(50, updatedPriceStability - (inspection.priceHikePercent * 2));
    }

    // Re-evaluate Star rating and grade
    const evaluated = this.evaluateSupplierMetrics({
      onTimeDeliveryRate: updatedOnTime,
      qualityDefectRate: updatedDefect,
      priceStabilityScore: updatedPriceStability
    });

    return {
      totalOrdersCompleted: totalOrders,
      onTimeDeliveryRate: updatedOnTime,
      qualityDefectRate: updatedDefect,
      priceStabilityScore: updatedPriceStability,
      rating: evaluated.rating,
      grade: evaluated.grade,
      evaluationNotes: evaluated.summaryText
    };
  }
}

export default new SupplierScorecardEngine();

