import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        phone: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const payload = {
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            };

            const res = await axios.post('https://chatapplication-2o-backend-production.up.railway.app/api/auth/register', payload);
            alert(res.data.msg || 'Registration successful!');
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.msg || 'Registration failed!');
        }
    };

    return (
        <div className='Register'>
            <div className='container'>
                <div className="register_form">
                    <h2>Register</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form_group">
                            <input type="text" name="username" placeholder='Enter Username' value={formData.username} onChange={handleChange} required />
                        </div>
                        <div className="form_group">
                            <input type="email" name="email" placeholder='Enter Email Address' value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="form_group">
                            <input type="password" name="password" placeholder='Enter Password' value={formData.password} onChange={handleChange} required />
                        </div>
                        <div className="form_group">
                            <input type="password" name="confirm_password" placeholder='Confirm Password' value={formData.confirm_password} onChange={handleChange} required />
                        </div>
                        <div className="form_group">
                            <input type="text" name="phone" placeholder='Enter Phone Number' value={formData.phone} onChange={handleChange} required />
                        </div>
                        <button type="submit">Register</button>
                    </form>
                    <div className="login_link">
                        <p>Already have an account? <a href="/login">Login here</a></p>
                    </div>

                     <div className='robo'>
                        <img src="assets/welcome/2.png" alt="robot" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
