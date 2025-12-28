import React, { useState, useEffect } from 'react';
import { store } from '../store/index.js';

const Sidebar = () => {
  const [state, setState] = useState(store.getState());
  const [showFaq, setShowFaq] = useState(false);

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return unsubscribe;
  }, []);

  const faqData = [
    {
      question: "How do I add movies to my favorites?",
      answer: "Click the heart icon on any movie card. Favorited movies will be saved to your browser."
    },
    {
      question: "What's the difference between Favorites and Watchlist?",
      answer: "Favorites are movies you've enjoyed, while Watchlist contains movies you want to watch later."
    },
    {
      question: "How do I use the dashboard?",
      answer: "Use the sidebar to navigate between Dashboard, Movies, Analytics, and Settings sections."
    },
    {
      question: "Where is my data stored?",
      answer: "Your preferences are stored locally in your browser and persist between sessions."
    }
  ];

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', description: 'Overview & Stats' },
    { id: 'movies', icon: '🎬', label: 'Movies', description: 'Browse & Search' },
    { id: 'analytics', icon: '📈', label: 'Analytics', description: 'Performance Metrics' },
    { id: 'settings', icon: '⚙️', label: 'Settings', description: 'Preferences' }
  ];

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🎭</span>
            <span className="logo-text">MovieFlix Pro</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${state.ui.activeView === item.id ? 'active' : ''}`}
              onClick={() => store.setActiveView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-stats">
            <div className="stat-row">
              <span>Favorites</span>
              <span className="stat-badge">{state.user.favorites.length}</span>
            </div>
            <div className="stat-row">
              <span>Watchlist</span>
              <span className="stat-badge">{state.user.watchlist.length}</span>
            </div>
          </div>
          
          <div className="footer-links">
            <button 
              className="footer-link"
              onClick={() => setShowFaq(true)}
            >
              ❓ FAQ
            </button>
            <a 
              href="https://github.com/Adeolatemi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link github-link"
            >
              🔗 GitHub
            </a>
          </div>
          
          <div className="developer-credit">
            <p>Developed by <strong>Adeola</strong></p>
            <p>© 2024 MovieFlix Pro</p>
          </div>
        </div>
      </aside>
      
      {showFaq && (
        <div className="modal-overlay" onClick={() => setShowFaq(false)}>
          <div className="modal faq-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowFaq(false)}>×</button>
            <div className="faq-content">
              <h2>❓ Frequently Asked Questions</h2>
              <div className="faq-list">
                {faqData.map((faq, index) => (
                  <div key={index} className="faq-item">
                    <h3>{faq.question}</h3>
                    <p>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;