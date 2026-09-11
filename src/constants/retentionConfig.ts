/**
 * GYM OS — Retention & Revenue Intelligence Configuration
 * Centralized business constants and deterministic scoring thresholds.
 */

export const RETENTION_CONFIG = {
  // Inactivity Alerts
  INACTIVITY_ALERT_DAYS: 7,
  INACTIVITY_CRITICAL_DAYS: 14,
  INACTIVITY_LAPSED_DAYS: 30,

  // Expiry Windows
  EXPIRY_WINDOW_URGENT_DAYS: 3,
  EXPIRY_WINDOW_7_DAYS: 7,
  EXPIRY_WINDOW_14_DAYS: 14,
  EXPIRY_WINDOW_30_DAYS: 30,

  // Maximum Signal Score Weights (Total Max = 100)
  WEIGHTS: {
    EXPIRY: 35,
    INACTIVITY: 35,
    ATTENDANCE_DECLINE: 20,
    PAYMENT_ISSUES: 10,
  },

  // Deterministic Risk Score Thresholds
  RISK_LEVELS: {
    LOW_MAX: 29,
    MODERATE_MAX: 59,
    HIGH_MAX: 79,
    CRITICAL_MAX: 100,
  },

  // Attendance Trend Parameters
  ATTENDANCE: {
    MIN_DAYS_FOR_TREND_ANALYSIS: 21,
    DECLINE_THRESHOLD_PERCENT: 30, // >= 30% drop is flagged
    SEVERE_DECLINE_PERCENT: 50, // >= 50% drop is severe
  },

  // Priority Ranking Weights
  PRIORITY: {
    RISK_WEIGHT: 0.6,
    REVENUE_WEIGHT: 0.4,
    EXPIRY_URGENCY_BONUS: 15,
  },

  // Default Outreach Action Labels
  ACTIONS: {
    EXPIRING_AND_INACTIVE: 'Send re-engagement + renewal offer',
    EXPIRING_ACTIVE: 'Send renewal reminder with discount link',
    INACTIVE_ONLY: 'Trigger trainer check-in & workout invite',
    PAYMENT_OVERDUE: 'Send payment reminder link',
    RECOVERY_OPPORTUNITY: 'Owner win-back outreach call',
    FROZEN_HOLD: 'Hold — Review freeze resume date',
    HEALTHY_ACTIVE: 'Maintain routine coaching support',
  },
} as const;
