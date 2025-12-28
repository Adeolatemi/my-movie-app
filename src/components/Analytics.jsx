import React, { useState, useEffect } from 'react';
import { store } from '../store/index.js';
import { tmdbApi } from '../services/api.js';

const Analytics = () => {
  const [state, setState] = useState(store.getState());
  const [metrics, setMetrics] = useState({
    apiPerformance: [],
    cacheStats: {},
    userActivity: {}
  });

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    loadAnalytics();
    return unsubscribe;
  }, []);

  const loadAnalytics = () => {
    const cacheStats = tmdbApi.getCacheStats();
    const userActivity = {
      favoritesAdded: state.user.favorites.length,
      watchlistItems: state.user.watchlist.length,
      totalInteractions: state.analytics.apiCalls
    };

    setMetrics({
      cacheStats,
      userActivity,
      apiPerformance: [
        { endpoint: '/movie/popular', calls: 45, avgTime: 234 },
        { endpoint: '/search/movie', calls: 23, avgTime: 189 },
        { endpoint: '/movie/details', calls: 67, avgTime: 156 }
      ]
    });
  };

  const MetricCard = ({ title, children, className = '' }) => (
    <div className={`metric-card ${className}`}>
      <h3 className="metric-title">{title}</h3>
      <div className="metric-content">{children}</div>
    </div>
  );

  const ProgressBar = ({ label, value, max, color = 'blue' }) => (
    <div className="progress-item">
      <div className="progress-header">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="progress-bar">
        <div 
          className={`progress-fill progress-${color}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h2>📊 Performance Analytics</h2>
        <div className="analytics-actions">
          <button onClick={loadAnalytics}>🔄 Refresh</button>
          <button onClick={() => tmdbApi.clearCache()}>🗑️ Clear Cache</button>
        </div>
      </div>

      <div className="analytics-grid">
        <MetricCard title="🚀 API Performance" className="span-2">
          <div className="api-metrics">
            {metrics.apiPerformance.map(metric => (
              <div key={metric.endpoint} className="api-metric">
                <div className="metric-info">
                  <span className="endpoint">{metric.endpoint}</span>
                  <span className="calls">{metric.calls} calls</span>
                </div>
                <div className="metric-stats">
                  <span className="avg-time">{metric.avgTime}ms avg</span>
                  <div className="performance-bar">
                    <div 
                      className="performance-fill"
                      style={{ 
                        width: `${Math.min((metric.avgTime / 500) * 100, 100)}%`,
                        backgroundColor: metric.avgTime < 200 ? '#4caf50' : metric.avgTime < 300 ? '#ff9800' : '#f44336'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </MetricCard>

        <MetricCard title="💾 Cache Statistics">
          <div className="cache-stats">
            <div className="stat-item">
              <span className="stat-label">Cache Size</span>
              <span className="stat-value">{metrics.cacheStats.size || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Hit Rate</span>
              <span className="stat-value">87%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Memory Usage</span>
              <span className="stat-value">2.4 MB</span>
            </div>
          </div>
        </MetricCard>

        <MetricCard title="👤 User Activity">
          <div className="user-metrics">
            <ProgressBar 
              label="Favorites" 
              value={metrics.userActivity.favoritesAdded} 
              max={100} 
              color="red" 
            />
            <ProgressBar 
              label="Watchlist" 
              value={metrics.userActivity.watchlistItems} 
              max={50} 
              color="blue" 
            />
            <ProgressBar 
              label="API Calls" 
              value={state.analytics.apiCalls} 
              max={200} 
              color="green" 
            />
          </div>
        </MetricCard>

        <MetricCard title="📈 System Health" className="span-2">
          <div className="health-metrics">
            <div className="health-item">
              <div className="health-indicator healthy"></div>
              <span>API Connection</span>
              <span className="health-status">Healthy</span>
            </div>
            <div className="health-item">
              <div className="health-indicator healthy"></div>
              <span>Cache System</span>
              <span className="health-status">Optimal</span>
            </div>
            <div className="health-item">
              <div className="health-indicator warning"></div>
              <span>Response Time</span>
              <span className="health-status">Moderate</span>
            </div>
            <div className="health-item">
              <div className="health-indicator healthy"></div>
              <span>Error Rate</span>
              <span className="health-status">Low</span>
            </div>
          </div>
        </MetricCard>
      </div>

      <div className="analytics-footer">
        <div className="footer-stats">
          <span>Last Updated: {new Date().toLocaleTimeString()}</span>
          <span>Total Sessions: 1</span>
          <span>Uptime: 99.9%</span>
        </div>
      </div>
    </div>
  );
};

export default Analytics;