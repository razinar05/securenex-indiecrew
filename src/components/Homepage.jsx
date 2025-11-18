import { useState } from 'react';
import './Homepage.css';

export default function Homepage({ onModuleSelect }) {
  const categories = {
    hr: {
      title: 'HR',
      description: 'Human Resources Intelligence',
      modules: [
        {
          id: 'vanguard',
          name: 'Vanguard 1.0',
          description: 'Image Intelligence & Candidate Vetting',
          icon: '🔍'
        }
      ]
    },
    dataSecurity: {
      title: 'Data Security',
      description: 'Intelligence & Risk Assessment',
      modules: [
        {
          id: 'sentinel',
          name: 'Sentinel 1.0',
          description: 'Digital Breach Monitoring',
          icon: '🛡️'
        },
        {
          id: 'citadel',
          name: 'Citadel 1.0',
          description: 'Risk Assessment & Threat Intelligence',
          icon: '📊'
        }
      ]
    }
  };

  const handleModuleClick = (moduleId) => {
    onModuleSelect(moduleId);
  };

  return (
    <div className="homepage-container">
      <div className="homepage-content">
        <div className="products-section">
          <h2 className="section-header sentry-glow-text">SENTRY</h2>
        
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-badge">{categories.hr.title}</div>
            <h3 className="category-title-large">{categories.hr.description}</h3>
            
            <div className="modules-container">
              {categories.hr.modules.map((module) => (
                <div
                  key={module.id}
                  className="module-card"
                  onClick={() => handleModuleClick(module.id)}
                >
                  <span className="module-icon">{module.icon}</span>
                  <h3 className="module-name">{module.name}</h3>
                  <p className="module-description">{module.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="category-card">
            <div className="category-badge">{categories.dataSecurity.title}</div>
            <h3 className="category-title-large">{categories.dataSecurity.description}</h3>
            
            <div className="modules-container">
              {categories.dataSecurity.modules.map((module) => (
                <div
                  key={module.id}
                  className="module-card"
                  onClick={() => handleModuleClick(module.id)}
                >
                  <span className="module-icon">{module.icon}</span>
                  <h3 className="module-name">{module.name}</h3>
                  <p className="module-description">{module.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>

        <div className="footer">
          <p className="footer-text">Powered by The Indie Crew</p>
        </div>
      </div>
    </div>
  );
}
