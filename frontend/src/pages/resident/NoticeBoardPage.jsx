import { useState, useEffect } from 'react';
import API from '../../api/axios';

const NoticeBoardPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/notices')
      .then((res) => setNotices(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="page-container">Loading notices...</p>;

  return (
    <div className="page-container">
      <h2>Notice Board</h2>
      {notices.length === 0 && <p>No notices posted yet.</p>}
      {notices.map((n) => (
        <div key={n._id} className={`notice-card ${n.priority}`}>
          {n.priority === 'urgent' && <span className="badge urgent">URGENT</span>}
          <h3>{n.title}</h3>
          <p>{n.body}</p>
          <small>
            Posted by {n.postedBy?.name} on {new Date(n.createdAt).toLocaleDateString()}
          </small>
        </div>
      ))}
    </div>
  );
};

export default NoticeBoardPage;
