import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import api from './api';

const AuthCard = ({ children, title }) => (
  <div className="auth-wrapper">
    <div className="glass auth-card">
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{title}</h2>
      {children}
    </div>
  </div>
);

const Login = ({ setAuth }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.data.accessToken);
      setAuth(true);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <AuthCard title="Welcome Back">
      <form onSubmit={handleLogin}>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" style={{ width: '100%' }}>Sign In</button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
        Don't have an account? <a href="/register">Register</a>
      </p>
    </AuthCard>
  );
};

const Register = ({ setAuth }) => {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('accessToken', res.data.data.accessToken);
      setAuth(true);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <AuthCard title="Create Account">
      <form onSubmit={handleRegister}>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" style={{ width: '100%' }}>Sign Up</button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
        Already have an account? <a href="/login">Sign In</a>
      </p>
    </AuthCard>
  );
};

const Dashboard = ({ setAuth }) => {
  const [tasks, setTasks] = React.useState([]);
  const [title, setTitle] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const [editingTask, setEditingTask] = React.useState(null);
  const [editForm, setEditForm] = React.useState({});

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.data.tasks);
    } catch (err) {
      if(err.response?.status === 401) handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if(!title) return;
    setIsSubmitting(true);
    try {
      await api.post('/tasks', { title, description: desc });
      setTitle(''); setDesc('');
      fetchTasks();
    } catch (err) {
      alert('Error creating task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this task?')) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      alert('Error deleting task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (task) => {
    setEditingTask(task._id);
    setEditForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'MEDIUM'
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/tasks/${editingTask}`, editForm);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      alert('Error updating task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setAuth(false);
  };

  return (
    <div>
      <div className="glass nav-bar" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <h2>Secure Task Manager</h2>
        <button className="danger" onClick={handleLogout}>Logout</button>
      </div>
      <div className="container">
        
        <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3>Create New Task</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <input placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ marginBottom: 0 }} disabled={isSubmitting} />
            <input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} style={{ marginBottom: 0 }} disabled={isSubmitting} />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add Task'}
            </button>
          </form>
        </div>

        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading tasks...</p>
        ) : (
          <div className="task-grid">
            {tasks.map(t => (
              <div key={t._id} className="glass task-card">
                {editingTask === t._id ? (
                  <form onSubmit={handleEditSubmit}>
                    <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} required placeholder="Title" disabled={isSubmitting} />
                    <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="Description" disabled={isSubmitting} rows="2" />
                    
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} disabled={isSubmitting}>
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                      <select value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})} disabled={isSubmitting}>
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</button>
                      <button type="button" className="danger" onClick={() => setEditingTask(null)} disabled={isSubmitting}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1.1rem' }}>{t.title}</h4>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span className={`badge ${t.priority ? t.priority.toLowerCase() : 'medium'}`}>{t.priority || 'MEDIUM'}</span>
                        <span className={`badge ${t.status.toLowerCase()}`}>{t.status}</span>
                      </div>
                    </div>
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{t.description || 'No description provided.'}</p>
                    
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                      <div>Created: {new Date(t.createdAt).toLocaleDateString()}</div>
                      {t.dueDate && <div>Due: {new Date(t.dueDate).toLocaleDateString()}</div>}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => startEdit(t)} style={{ padding: '6px 12px', fontSize: '0.85rem' }} disabled={isSubmitting}>Edit</button>
                      <button className="danger" onClick={() => handleDelete(t._id)} style={{ padding: '6px 12px', fontSize: '0.85rem' }} disabled={isSubmitting}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {tasks.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No tasks found. Create one above!</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('accessToken'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login setAuth={setIsAuthenticated} />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register setAuth={setIsAuthenticated} />} />
        <Route path="/" element={isAuthenticated ? <Dashboard setAuth={setIsAuthenticated} /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
