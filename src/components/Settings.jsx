import React, { useState, useEffect } from 'react';
import { store } from '../store/index.js';

const Settings = () => {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return unsubscribe;
  }, []);

  return (
    <div className="settings">
      <h2>⚙️ Settings & Preferences</h2>
      
      <div className="settings-sections">
        <div className="settings-section">
          <h3>🎨 Appearance</h3>
          <div className="setting-item">
            <label>Theme</label>
            <select 
              value={state.user.theme}
              onChange={(e) => store.setState({
                user: { ...state.user, theme: e.target.value }
              })}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>📊 Data Management</h3>
          <div className="setting-actions">
            <button onClick={() => {
              const data = JSON.stringify(state.user.favorites, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'favorites.json';
              a.click();
            }}>
              📥 Export Favorites
            </button>
            <button onClick={() => localStorage.clear()}>
              🗑️ Clear All Data
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>📈 Analytics</h3>
          <div className="analytics-summary">
            <p>API Calls: {state.analytics.apiCalls}</p>
            <p>Favorites: {state.user.favorites.length}</p>
            <p>Watchlist: {state.user.watchlist.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;