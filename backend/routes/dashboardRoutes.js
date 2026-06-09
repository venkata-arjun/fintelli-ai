import express from "express";
import {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrend,
  getOverallSummary,
} from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/summary", getSummary);
router.get("/category-breakdown", getCategoryBreakdown);
router.get("/monthly-trend", getMonthlyTrend);
router.get("/summary/overall", getOverallSummary);
export default router;
