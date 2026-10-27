import React, { useState } from 'react';
import { AlertTriangle, Database, ExternalLink, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from './Modal.jsx';

export default function DbStatusBanner() {
  const { dbStatus, checkHealth } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [retrying, setRetrying] = useState(false);

  if (dbStatus.connected) {
    return null;
  }

  const handleRetry = async () => {
    setRetrying(true);
    await checkHealth();
    setTimeout(() => setRetrying(false), 500);
  };

  return (
    <>
      <div className="db-status-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0 }} />
          <span>
            <strong>Database Not Connected:</strong> MongoDB URI is not configured or reachable. Data persistence requires a valid connection.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="db-banner-btn"
            onClick={handleRetry}
            disabled={retrying}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <RefreshCw size={12} className={retrying ? 'spin' : ''} />
            {retrying ? 'Checking...' : 'Retry'}
          </button>
          <button
            type="button"
            className="db-banner-btn"
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Database size={12} />
            Atlas Setup Guide
          </button>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="MongoDB Atlas Setup Guide (Free 500MB Cloud Database)"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            ApplyPilot uses MongoDB for multi-tenant data storage. Follow these 4 quick steps to connect a 100% free MongoDB Atlas database:
          </p>

          <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <li>
              <strong>Create a free cluster:</strong> Go to{' '}
              <a
                href="https://www.mongodb.com/cloud/atlas/register"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#818cf8', textDecoration: 'underline' }}
              >
                MongoDB Atlas <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
              </a>{' '}
              and create a free M0 cluster.
            </li>
            <li>
              <strong>Create a Database User:</strong> In Atlas &gt; <em>Security</em> &gt; <em>Database Access</em>, add a username and password (e.g. <code>applypilot_user</code>).
            </li>
            <li>
              <strong>Allow Network Access:</strong> Under <em>Network Access</em>, click <em>Add IP Address</em> and choose <strong>Allow Access from Anywhere (0.0.0.0/0)</strong>.
            </li>
            <li>
              <strong>Set your connection string:</strong> Copy your connection URI and put it in your <code>.env</code> file in the project root:
              <pre
                style={{
                  background: 'var(--bg-input)',
                  padding: '10px 14px',
                  borderRadius: 6,
                  marginTop: 6,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  overflowX: 'auto',
                }}
              >
                MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.xxxxx.mongodb.net/applypilot?retryWrites=true&amp;w=majority
              </pre>
            </li>
          </ol>

          <div
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 8,
              padding: 12,
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}
          >
            💡 <em>Note:</em> For local automated tests, you can always run <code>npm test</code> which executes on an in-memory MongoDB engine without needing any cloud credentials!
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" className="btn btn-primary" onClick={() => setShowModal(false)}>
              Got it
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
