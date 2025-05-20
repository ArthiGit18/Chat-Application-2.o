import React, { useState } from 'react';
import axios from 'axios';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.post(
            'http://localhost:5000/api/auth/login', 
            formData,
            {
                withCredentials: true  // <---- This is very important for CORS and sessions
            }
        );

        // Store token in both sessionStorage and localStorage
        localStorage.setItem('token', res.data.token);
        sessionStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        sessionStorage.setItem('user', JSON.stringify(res.data.user));

        alert('Login successful!');
        navigate('/chat');
    } catch (err) {
        alert(err.response?.data?.msg || 'Login failed!');
    }
};

    
    return (
        <div className='Login'>
            <div className='container'>
                <div className="login_form">
                    <h2>Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form_group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form_group">
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit">Login</button>
                    </form>

                    <div className="register_link">
                        <p>Don't have an account? <a href="/register">Register here</a></p>
                    </div>

                    <hr style={{ margin: "20px 0" }} />

                    <div className="social_login">
                        <p>Or login with:</p>
                        <div className="social_buttons">
                            <button
                                className="google-btn"
                                onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}

                            >
                               <p> <GoogleIcon style={{marginRight : "10px"}} /> Sign in with Google</p>
                            </button>
                        </div>
                    </div>

                    <div className="forgot_password">
                        <p>Forgot your password? <a href="/reset-password">Reset it here</a></p>
                    </div>

                    <div className='robo'>
                        <img src="assets/welcome/2.png" alt="robot" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
