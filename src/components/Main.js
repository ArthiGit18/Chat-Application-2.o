import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Welcome from '../Pages/Welcome';
import Login from '../Pages/Login';

const Main = () => {
  const [showHome, setShowHome] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');

    if (userData) {
      navigate('/chat');
    } else {
      const timer = setTimeout(() => {
        setShowHome(true);
      }, 9000);

      return () => clearTimeout(timer);
    }
  }, [navigate]);

  return <div>{showHome ? <Login /> : <Welcome />}</div>;
};

export default Main;
