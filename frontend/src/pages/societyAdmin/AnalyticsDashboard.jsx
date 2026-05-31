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
const PIE_COLORS = { paid: '#1E7A4A', pending: '#9A7D0A', overdue: '#C0392B' };

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/analytics/revenue'),
      API.get('/analytics/collection'),
      API.get('/analytics/visitors'),
      API.get('/analytics/facilities'),
      API.get('/analytics/summary'),
      API.get('/analytics/notices'),
      API.get('/maintenance/analytics'),
      API.get('/maintenance'),
      API.get('/visitors'),
    ])
      .then(([rev, col, traf, fac, sum, notices, agg, maint, vis]) => {
        setRevenue(rev.data);
        setCollection(col.data);
        setTraffic(traf.data);
        setFacilities(fac.data);
        setSummary(sum.data);
        setNoticeEngagement(notices.data);
        setAggData(agg.data);
        setMaintenance(maint.data);
        setVisitors(vis.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="page-container">Loading analytics...</p>;

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
      {summary && (
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
      )}

      <h3>Monthly Maintenance Collection (INR)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData.length ? monthlyData : revenue}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="paid" fill="#1E7A4A" name="Paid" />
          <Bar dataKey="pending" fill="#9A7D0A" name="Pending" />
          <Bar dataKey="overdue" fill="#C0392B" name="Overdue" />
          {revenue.length > 0 && !monthlyData.length && <Bar dataKey="revenue" fill="#2E86AB" name="Revenue" />}
        </BarChart>
      </ResponsiveContainer>

      <h3>Visitor Traffic — Last 7 Days</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={traffic.length ? traffic.slice(-7) : last7}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={traffic.length ? 'date' : 'name'} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey={traffic.length ? 'visitors' : 'visitors'} stroke="#2E86AB" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      <h3>Payment Status (Current Month)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {pieData.map((entry) => (
              <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#888'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <h3>Facility Usage (Approved)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={facilities}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="facility" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="bookings" fill="#6C3483" />
        </BarChart>
      </ResponsiveContainer>

      <h3>Notice Board Activity (Last 90 Days)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={noticeEngagement} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={120} />
          <Tooltip />
          <Bar dataKey="engagement" fill="#2E86AB" name="Notices posted" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsDashboard;
