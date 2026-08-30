import { AnalyticsEngine } from '../oop/AnalyticsEngine.js';

// @desc    Get complete dashboard overview with KPIs and chart metrics
// @route   GET /api/dashboard
export async function getDashboardData(req, res, next) {
  try {
    const dashboardData = await AnalyticsEngine.getDashboardOverview();
    res.json({ success: true, data: dashboardData });
  } catch (error) {
    next(error);
  }
}
