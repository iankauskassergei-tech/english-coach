import { getDb } from '@/lib/db';
import { StreakCard } from '@/components/dashboard/streak-card';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { WeeklyChart } from '@/components/dashboard/weekly-chart';
import { GoalTracker } from '@/components/dashboard/goal-tracker';
import { DueReviews } from '@/components/dashboard/due-reviews';
import { Header } from '@/components/layout/header';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const db = getDb();

  const totalWords = (db.prepare('SELECT COUNT(*) as c FROM words').get() as { c: number }).c;
  const mastered = (db.prepare("SELECT COUNT(*) as c FROM reviews WHERE state = 'mastered'").get() as { c: number }).c;
  const dueNow = (db.prepare("SELECT COUNT(*) as c FROM reviews WHERE next_review <= datetime('now') AND state != 'new'").get() as { c: number }).c;

  const today = new Date().toISOString().split('T')[0];
  const todaySession = db.prepare('SELECT * FROM study_sessions WHERE date = ?').get(today) as any;

  const weeklyData = db.prepare(
    "SELECT date, reviews_done FROM study_sessions WHERE date >= date('now', '-7 days') ORDER BY date"
  ).all() as { date: string; reviews_done: number }[];

  const allSessions = db.prepare('SELECT date FROM study_sessions ORDER BY date DESC').all() as { date: string }[];

  let streak = 0;
  if (allSessions.length > 0) {
    const dates = allSessions.map((s) => s.date);
    streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const d1 = new Date(dates[i]);
      const d2 = new Date(dates[i + 1]);
      const diff = Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else break;
    }
  }

  const settings = db.prepare("SELECT value FROM settings WHERE key = 'daily_goal'").get() as { value: string } | undefined;
  const dailyGoal = settings ? parseInt(settings.value) : 20;

  return (
    <div>
      <Header title="Dashboard" subtitle="Track your learning progress" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StreakCard streak={streak} />
        <GoalTracker current={todaySession?.reviews_done || 0} goal={dailyGoal} />
        <DueReviews count={dueNow} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsGrid
          totalWords={totalWords}
          mastered={mastered}
          accuracy={todaySession?.accuracy ? Math.round(todaySession.accuracy * 100) : null}
          dueNow={dueNow}
        />
        <WeeklyChart data={weeklyData} />
      </div>
    </div>
  );
}
