import React from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/components/_lockedPage.scss';

interface LockedPageProps {
  pageName: string;
  description?: string;
}

const LockedPage: React.FC<LockedPageProps> = ({ pageName, description }) => {
  const navigate = useNavigate();

  return (
    <div className="locked-page">
      <div className="locked-page__content">
        <div className="locked-page__icon">
          <Lock className="lock-icon" />
        </div>
        
        <h2 className="locked-page__title">Sign In Required</h2>
        
        <p className="locked-page__description">
          You need to sign in to access <strong>{pageName}</strong>
        </p>
        
        {description && (
          <p className="locked-page__info">{description}</p>
        )}
        
        <div className="locked-page__actions">
          <button
            onClick={() => navigate('/auth/signin')}
            className="btn-primary"
          >
            Sign In
          </button>
          
          <button
            onClick={() => navigate('/auth/signup')}
            className="btn-secondary"
          >
            Create Account
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default LockedPage;