import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  if (!user) return <div className="page-wrap"><p>Please <Link to="/login">log in</Link>.</p></div>;
  return (
    <div className="page-wrap">
      <div className="page-head"><h1>My Profile</h1></div>
      <div className="card-flat">
        <div className="row"><span className="muted">Name</span><span>{user.name}</span></div>
        <div className="row"><span className="muted">Email</span><span>{user.email}</span></div>
        <div className="row"><span className="muted">Role</span><span className="badge neutral">{user.role}</span></div>
      </div>
    </div>
  );
}
