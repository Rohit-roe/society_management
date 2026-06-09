import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import API from '../../api/axios';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AnalyticsDashboard = () => {
  const [revenue, setRevenue] = useState([]);
  const [collection, setCollection] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [summary, setSummary] = useState(null);
  const [aggData, setAggData] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [noticeEngagement, setNoticeEngagement] = useState([]);

  // Section Loading States
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [trafficLoading, setTrafficLoading] = useState(true);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [noticesLoading, setNoticesLoading] = useState(true);

  // Dynamic Theme Colors State
  const [colors, setColors] = useState({
    primary: '#2E86AB',
    success: '#1E7A4A',
    warning: '#9A7D0A',
    danger: '#C0392B',
    textSecondary: '#6d5f56'
  });

  // Track Theme changes in document body class
  useEffect(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const updateColors = () => {
      const p = rootStyle.getPropertyValue('--primary').trim() || '#2E86AB';
      const s = rootStyle.getPropertyValue('--status-success-text').trim() || '#1E7A4A';
      const w = rootStyle.getPropertyValue('--status-warning-text').trim() || '#9A7D0A';
      const d = rootStyle.getPropertyValue('--status-danger-text').trim() || '#C0392B';
      const ts = rootStyle.getPropertyValue('--text-secondary').trim() || '#6d5f56';
      setColors({
        primary: p,
        success: s,
        warning: w,
        danger: d,
        textSecondary: ts
      });
    };

    updateColors();

    const observer = new MutationObserver(() => {
      updateColors();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Independent API Requests
  useEffect(() => {
    // 1. Summary Card Data
    API.get('/analytics/summary')
      .then((res) => setSummary(res.data))
      .catch((err) => console.error('Summary API error:', err))
      .finally(() => setSummaryLoading(false));

    // 2. Revenue & Monthly Collection
    Promise.all([
      API.get('/analytics/revenue'),
      API.get('/maintenance/analytics')
    ])
      .then(([rev, agg]) => {
        setRevenue(rev.data);
        setAggData(agg.data);
      })
      .catch((err) => console.error('Revenue API error:', err))
      .finally(() => setRevenueLoading(false));

    // 3. Visitor Traffic (Line chart)
    Promise.all([
      API.get('/analytics/visitors'),
      API.get('/visitors')
    ])
      .then(([traf, vis]) => {
        setTraffic(traf.data);
        setVisitors(vis.data);
      })
      .catch((err) => console.error('Visitors API error:', err))
      .finally(() => setTrafficLoading(false));

    // 4. Payment Status Collection (Pie chart)
    Promise.all([
      API.get('/analytics/collection'),
      API.get('/maintenance')
    ])
      .then(([col, maint]) => {
        setCollection(col.data);
        setMaintenance(maint.data);
      })
      .catch((err) => console.error('Collection API error:', err))
      .finally(() => setCollectionLoading(false));

    // 5. Facility Usage
    API.get('/analytics/facilities')
      .then((res) => setFacilities(res.data))
      .catch((err) => console.error('Facilities API error:', err))
      .finally(() => setFacilitiesLoading(false));

    // 6. Notice board activity
    API.get('/analytics/notices')
      .then((res) => setNoticeEngagement(res.data))
      .catch((err) => console.error('Notices API error:', err))
      .finally(() => setNoticesLoading(false));
  }, []);

  const monthlyData = aggData.reduce((acc, item) => {
    const key = `${MONTH_NAMES[item._id.month - 1]} ${item._id.year}`;
    let row = acc.find((d) => d.name === key);
    if (!row) {
      row = { name: key, paid: 0, pending: 0, overdue: 0 };
      acc.push(row);
    }
    row[item._id.status] += item.total;
    return acc;
  }, []);

  const pieData =
    collection.length > 0
      ? collection
      : Object.entries(
          maintenance.reduce((acc, r) => {
            acc[r.status] = (acc[r.status] || 0) + 1;
            return acc;
          }, {})
        ).map(([name, value]) => ({ name, value }));

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
    const count = visitors.filter((v) => v.checkIn && new Date(v.checkIn).toDateString() === d.toDateString()).length;
    return { name: label, visitors: count };
  });

  return (
    <div className="page-container">
      <h2>Analytics Dashboard</h2>
      
      {summaryLoading ? (
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-box" style={{ height: 110, borderRadius: 'var(--radius)' }} />
          ))}
        </div>
      ) : (
        summary && (
          <div className="stats-grid">
            <article className="stat-card">
              <h4>Residents</h4>
              <p>
                {summary.totalResidents} / {summary.totalFlats} flats
              </p>
              <small>{summary.occupancyPercent}% occupancy</small>
            </article>
            <article className="stat-card">
              <h4>Vacant Flats</h4>
              <p>{summary.vacantFlats}</p>
            </article>
            <article className="stat-card pending">
              <h4>Pending Dues</h4>
              <p>{summary.pendingDues}</p>
            </article>
            <article className="stat-card overdue">
              <h4>Overdue</h4>
              <p>{summary.overdueCount}</p>
            </article>
          </div>
        )
      )}

      <h3>Monthly Maintenance Collection (INR)</h3>
      {revenueLoading ? (
        <div className="skeleton-box" style={{ height: 300, marginBottom: '24px', borderRadius: 'var(--radius)' }} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData.length ? monthlyData : revenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke={colors.textSecondary} />
            <YAxis stroke={colors.textSecondary} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <Legend />
            <Bar dataKey="paid" fill={colors.success} name="Paid" />
            <Bar dataKey="pending" fill={colors.warning} name="Pending" />
            <Bar dataKey="overdue" fill={colors.danger} name="Overdue" />
            {revenue.length > 0 && !monthlyData.length && <Bar dataKey="revenue" fill={colors.primary} name="Revenue" />}
          </BarChart>
        </ResponsiveContainer>
      )}

      <h3>Visitor Traffic — Last 7 Days</h3>
      {trafficLoading ? (
        <div className="skeleton-box" style={{ height: 260, marginBottom: '24px', borderRadius: 'var(--radius)' }} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={traffic.length ? traffic.slice(-7) : last7}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={traffic.length ? 'date' : 'name'} stroke={colors.textSecondary} />
            <YAxis allowDecimals={false} stroke={colors.textSecondary} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <Line type="monotone" dataKey="visitors" stroke={colors.primary} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}

      <h3>Payment Status (Current Month)</h3>
      {collectionLoading ? (
        <div className="skeleton-box" style={{ height: 260, marginBottom: '24px', borderRadius: 'var(--radius)' }} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={entry.name === 'paid' ? colors.success : entry.name === 'pending' ? colors.warning : colors.danger} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}

      <h3>Facility Usage (Approved)</h3>
      {facilitiesLoading ? (
        <div className="skeleton-box" style={{ height: 260, marginBottom: '24px', borderRadius: 'var(--radius)' }} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={facilities}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="facility" stroke={colors.textSecondary} />
            <YAxis allowDecimals={false} stroke={colors.textSecondary} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <Bar dataKey="bookings" fill={colors.primary} />
          </BarChart>
        </ResponsiveContainer>
      )}

      <h3>Notice Board Activity (Last 90 Days)</h3>
      {noticesLoading ? (
        <div className="skeleton-box" style={{ height: 280, marginBottom: '24px', borderRadius: 'var(--radius)' }} />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={noticeEngagement} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" allowDecimals={false} stroke={colors.textSecondary} />
            <YAxis type="category" dataKey="name" width={120} stroke={colors.textSecondary} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <Bar dataKey="engagement" fill={colors.primary} name="Notices posted" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
