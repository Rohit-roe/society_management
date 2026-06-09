import { useEffect, useState } from 'react';
import VisitorLogPage from '../resident/VisitorLogPage';
import API from '../../api/axios';
import { BookOpen, CheckCircle2, Clock, DoorOpen, ListChecks, Plus, QrCode, Users } from 'lucide-react';
import ActivityFeed from '../../components/common/ActivityFeed';
import {
  DashboardActionGrid,
  DashboardActionLink,
  DashboardCard,
  DashboardCardSkeleton,
  DashboardEmptyState,
  DashboardHeader,
  DashboardKpiCard,
  DashboardKpiGrid,
  DashboardKpiSkeleton,
  DashboardPage,
  DashboardSection,
  DashboardStatusBadge,
} from '../../components/common/DashboardSections';

const SecurityDashboard = () => {
  const [visitors, setVisitors] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActivitiesLoading(true);
    API.get('/visitors')
      .then((res) => {
        setVisitors(res.data);
        // Map visitor logs to activity items
        const mappedActivities = res.data.slice(0, 5).map((v) => ({
          _id: v._id,
          actor: v.visitorName,
          action: `Visitor log entry for Flat ${v.flatToVisit}. Purpose: ${v.purpose || 'Visit'}.`,
          timestamp: v.updatedAt || v.createdAt,
          status: v.approvalStatus?.replace('_', ' '),
          priority: v.approvalStatus === 'pending' ? 'important' : 'normal'
        }));
        setActivities(mappedActivities);
      })
      .catch((err) => console.error('Failed to load security dashboard visitors', err))
      .finally(() => {
        setLoading(false);
        setActivitiesLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <DashboardPage>
        <div className="page-skeleton">
          <div className="skeleton-box" style={{ height: 110, borderRadius: 'var(--radius)' }} />
          <DashboardKpiSkeleton count={4} />
          <DashboardCardSkeleton rows={4} />
          <DashboardCardSkeleton rows={3} />
        </div>
      </DashboardPage>
    );
  }

  const pending = visitors.filter((visitor) => visitor.approvalStatus === 'pending').length;
  const approved = visitors.filter((visitor) => visitor.approvalStatus === 'approved').length;
  const checkedIn = visitors.filter((visitor) => visitor.approvalStatus === 'checked_in').length;
  const checkedOut = visitors.filter((visitor) => visitor.approvalStatus === 'checked_out').length;
  const recentVisitors = visitors.slice(0, 4);

  return (
    <DashboardPage>
      <DashboardHeader
        title="Security Dashboard"
        subtitle="Gate operations for visitor logging, QR validation, check-ins, and check-outs."
        summary={
          <div className="dashboard-header-summary">
            <span>Inside Now</span>
            <strong>{checkedIn}</strong>
          </div>
        }
      />

      <DashboardKpiGrid>
        <DashboardKpiCard icon={Users} label="Total Visitors" value={loading ? '...' : visitors.length} helper="All gate records" />
        <DashboardKpiCard icon={Clock} label="Pending Approval" value={loading ? '...' : pending} helper="Awaiting resident/admin action" tone={pending ? 'warning' : 'default'} />
        <DashboardKpiCard icon={DoorOpen} label="Checked In" value={loading ? '...' : checkedIn} helper="Visitors currently inside" tone={checkedIn ? 'warning' : 'default'} />
        <DashboardKpiCard icon={CheckCircle2} label="Checked Out" value={loading ? '...' : checkedOut} helper="Completed visits" />
      </DashboardKpiGrid>

      <DashboardSection
        title="Urgent Work"
        description="Primary gate actions for active security operations."
        icon={ListChecks}
        priority="urgent"
      >
        <div className="dashboard-card-grid">
          <DashboardCard emphasis="urgent">
            <h4>Log gated visitor request</h4>
            <p>Open the visitor logging workflow to notify residents and prepare gate approval.</p>
            <div className="dashboard-inline-actions">
              <DashboardActionLink to="/visitors/log" icon={BookOpen} title="Open Visitor Log" description="Create a gate entry" />
            </div>
          </DashboardCard>

          <DashboardCard emphasis="urgent">
            <h4>Scan visitor QR</h4>
            <p>Validate pre-approved visitors and move them through the gate faster.</p>
            <div className="dashboard-inline-actions">
              <DashboardActionLink to="/security/scan" icon={QrCode} title="Scan QR Code" description="Verify visitor pass" />
            </div>
          </DashboardCard>

          {pending > 0 && (
            <DashboardCard emphasis="urgent">
              <h4>Pending approvals</h4>
              <p>{pending} visitor request{pending === 1 ? '' : 's'} still need approval before check-in.</p>
              <DashboardStatusBadge tone="warning" icon={Clock}>Awaiting Approval</DashboardStatusBadge>
            </DashboardCard>
          )}
        </div>
      </DashboardSection>

      <DashboardSection
        title="Recent Activity"
        description="Latest visitor movement and gate status."
        icon={Clock}
      >
        <DashboardCard>
          <h4>Visitor & Gate Timeline</h4>
          <ActivityFeed
            activities={activities}
            loading={activitiesLoading}
            emptyTitle="No visitor records logged"
            emptyMessage="Visitor entries and check-in updates will be tracked here in real-time."
          />
        </DashboardCard>
      </DashboardSection>

      <DashboardSection
        title="Quick Actions"
        description="Security shortcuts for repeated gate tasks."
        icon={Plus}
        priority="tertiary"
      >
        <DashboardActionGrid>
          <DashboardActionLink to="/visitors/log" icon={BookOpen} title="Open Visitor Log" description="Log and update visitors" />
          <DashboardActionLink to="/security/scan" icon={QrCode} title="Scan QR" description="Validate pre-approval" />
        </DashboardActionGrid>
      </DashboardSection>

      <DashboardSection
        title="Secondary Content"
        description="Full gate ledger with check-in and check-out controls."
        icon={BookOpen}
      >
        <VisitorLogPage showAll embedded />
      </DashboardSection>
    </DashboardPage>
  );
};

export default SecurityDashboard;
