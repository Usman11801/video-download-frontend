import React, { useState } from 'react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
const response = await fetch('https://nowatermark.io/preview', {

      // const response = await fetch('https://video-downlaod-backend-mmkd.vercel.app/api/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch video preview');
      }

      const data = await response.json();
      setPreview(data);
    } catch (err) {
      setError(err.message);
      console.error('Preview error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setError('');
      setDownloadLoading(true);
      setDownloadSuccess(false);
      setDownloadProgress(0);

      // const response = await fetch('https://video-downlaod-backend-mmkd.vercel.app/api/download', {
            const response = await fetch('https://nowatermark.io/download', {
// http://104.248.229.92/
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }

              if (data.progress !== undefined) {
                setDownloadProgress(data.progress);
              }

              if (data.completed && data.fileId) {
                // Trigger file download
                window.location.href = `https://nowatermark.io/download-file/${data.fileId}`;
                setDownloadSuccess(true);
                setTimeout(() => {
                  setDownloadSuccess(false);
                  setDownloadProgress(0);
                }, 3000);
              }
            } catch (err) {
              throw new Error(err.message);
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Download error:', err);
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <h1>Social Media Video Downloader</h1>
        
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Instagram, YouTube or TikTok URL"
            className="url-input"
          />
          <button type="submit" className="preview-btn">
            {loading ? 'Loading...' : 'Preview'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}
        {downloadSuccess && <div className="success">Video downloaded successfully!</div>}

        {preview && (
          <div className="preview-container">
            <div className="video-preview">
              {preview.thumbnail && (
                <img src={preview.thumbnail} alt="Video thumbnail" />
              )}
            </div>
            <div className="video-info">
              <h3>{preview.title}</h3>
              <p>{preview.description}</p>
              <div className="download-section">
                {downloadLoading && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                    <span className="progress-text">{downloadProgress}%</span>
                  </div>
                )}
                <button 
                  onClick={handleDownload} 
                  className="download-btn"
                  disabled={downloadLoading}
                >
                  {downloadLoading ? 'Downloading...' : 'Download Video'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 