import { Application, CmsCourse, AnalyticsSummary } from '@/types';

export function calculateAnalytics(applications: Application[], courses: CmsCourse[], feePerApplicant = 3500): AnalyticsSummary {
  const total = applications.length;
  const approved = applications.filter(a => a.status === 'approved').length;
  const underReview = applications.filter(a => a.status === 'under_review').length;
  const pending = applications.filter(a => a.status === 'pending').length;
  const rejected = applications.filter(a => a.status === 'rejected').length;
  const cancelled = applications.filter(a => a.status === 'cancelled').length;

  // Financial calculations
  // Realized revenue = Approved applications
  // Pending revenue = Applications awaiting review & verification (under_review + pending)
  const totalRevenueEtb = approved * feePerApplicant;
  const pendingRevenueEtb = (underReview + pending) * feePerApplicant;

  // Qualification distribution
  const qualMap: Record<string, number> = {};
  applications.forEach(app => {
    const q = app.qualification || "Bachelor's Degree";
    qualMap[q] = (qualMap[q] || 0) + 1;
  });

  const qualificationBreakdown = Object.entries(qualMap).map(([qualification, count]) => ({
    qualification,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  // Popular Courses Ranking
  const courseAppMap: Record<string, number> = {};
  applications.forEach(app => {
    const c = app.course_applied || "General Track";
    courseAppMap[c] = (courseAppMap[c] || 0) + 1;
  });

  const popularCourses = courses.map(course => {
    const appsCount = courseAppMap[course.title] || 0;
    const viewsCount = course.clicks_count || Math.max(appsCount * 12, 25);
    return {
      courseTitle: course.title,
      applicationsCount: appsCount,
      viewsCount,
    };
  }).sort((a, b) => b.applicationsCount - a.applicationsCount || b.viewsCount - a.viewsCount);

  // Application Trend Over Time (Last 7 Days)
  const dateMap: Record<string, number> = {};
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dateMap[dateStr] = 0;
  }

  applications.forEach(app => {
    const appDate = app.created_at ? app.created_at.split('T')[0] : app.submission_date;
    if (dateMap[appDate] !== undefined) {
      dateMap[appDate]++;
    } else {
      // Add if within window
      const lastKey = Object.keys(dateMap)[0];
      if (lastKey) dateMap[lastKey] = (dateMap[lastKey] || 0) + 1;
    }
  });

  let cumulative = 0;
  const applicationTrends = Object.entries(dateMap).map(([date, count]) => {
    cumulative += count;
    const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      date: formattedDate,
      count,
      cumulative,
    };
  });

  return {
    totalApplications: total,
    pendingCount: pending,
    underReviewCount: underReview,
    approvedCount: approved,
    rejectedCount: rejected,
    cancelledCount: cancelled,
    totalRevenueEtb,
    pendingRevenueEtb,
    feePerApplicant,
    qualificationBreakdown,
    popularCourses,
    applicationTrends,
  };
}
