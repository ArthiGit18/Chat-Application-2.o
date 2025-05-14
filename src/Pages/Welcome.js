import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const user = localStorage.getItem('user');
      if (user) {
        navigate('/chat');
      } else {
        navigate('/login');
      }
    }, 9000); 

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="welcome_container">
      <h1 className="welcome_text">Welcome</h1>
      <img className="welcome_image" src="/assets/welcome/3.png" alt="Welcome" />
    </div>
  );
};

export default Welcome;
