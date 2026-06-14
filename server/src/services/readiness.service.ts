import { Types } from 'mongoose';
import { Attempt, ReadinessStatus } from '../models';

export interface ReadinessOverviewDto {
  learnersAssessed: number;
  readyCount: number;
  atRiskCount: number;
  avgCompetency: number;
}

export interface AttemptSummaryDto {
  id: string;
  learnerName: string;
  learnerEmail: string;
  assessmentId: string;
  score: number;
  status: ReadinessStatus;
  gaps: string[];
  createdAt: Date;
}

const RECENT_ATTEMPTS_LIMIT = 50;

export async function getReadinessOverview(
  businessId: Types.ObjectId,
): Promise<ReadinessOverviewDto> {
  const [stats] = await Attempt.aggregate([
    { $match: { businessId } },
    {
      $group: {
        _id: null,
        learnersAssessed: { $sum: 1 },
        readyCount: {
          $sum: { $cond: [{ $eq: ['$readinessStatus', 'READY'] }, 1, 0] },
        },
        atRiskCount: {
          $sum: {
            $cond: [
              { $in: ['$readinessStatus', ['PARTIALLY_READY', 'NOT_READY']] },
              1,
              0,
            ],
          },
        },
        avgCompetency: { $avg: '$scorePercent' },
      },
    },
  ]);

  if (!stats) {
    return {
      learnersAssessed: 0,
      readyCount: 0,
      atRiskCount: 0,
      avgCompetency: 0,
    };
  }

  return {
    learnersAssessed: stats.learnersAssessed as number,
    readyCount: stats.readyCount as number,
    atRiskCount: stats.atRiskCount as number,
    avgCompetency: Math.round((stats.avgCompetency as number) * 10) / 10,
  };
}

export async function listRecentAttempts(
  businessId: Types.ObjectId,
): Promise<AttemptSummaryDto[]> {
  const attempts = await Attempt.find({ businessId })
    .sort({ createdAt: -1 })
    .limit(RECENT_ATTEMPTS_LIMIT)
    .lean();

  return attempts.map((a) => ({
    id: a._id.toString(),
    learnerName: a.learnerName,
    learnerEmail: a.learnerEmail,
    assessmentId: a.assessmentId.toString(),
    score: a.scorePercent,
    status: a.readinessStatus,
    gaps: a.gaps,
    createdAt: a.createdAt,
  }));
}
