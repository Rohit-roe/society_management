import { Link } from 'react-router-dom';
import VisitorLogPage from '../resident/VisitorLogPage';

const SecurityDashboard = () => (
  <section className="page-container">
    <h2>Security Dashboard</h2>
    <p>Log visitors at the gate and mark check-outs.</p>
    <Link to="/visitors/log">Open visitor log →</Link>
    <br />
    <Link to="/security/scan">Scan QR code →</Link>
    <hr style={{ margin: '24px 0' }} />
    <VisitorLogPage showAll />
  </section>
);

export default SecurityDashboard;
