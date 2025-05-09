import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown, FiLogOut, FiSettings, FiUser } from 'react-icons/fi';



const ContactList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contactsData, setContactsData] = useState([]);
   const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const storedUser =
    JSON.parse(sessionStorage.getItem("user")) ||
    JSON.parse(localStorage.getItem("user"));


  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/users/loggedin');

        const users = res.data
          .filter(user => user._id !== storedUser?.id)
          .map((user, index) => ({
            id: user._id || index,
            name: user.username,
            message: 'Last message...',
            avatar: user.avatar || '/assets/default-profile.png'
          }));

        setContactsData(users);
      } catch (err) {
        console.error('Failed to fetch contacts:', err);
      }
    };

    fetchContacts();
  }, []);

  const filteredContacts = [...contactsData].sort((a, b) => {
    const aMatch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const bMatch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
    return bMatch - aMatch;
  });

  
  const handleDropdownToggle = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    navigate('/login');
  };


  return (
    <div className="contact_list">
      <div className="contact_list_header">
        <h2>Contact List</h2>
        {storedUser && (
          <div className="current_user">
            <div onClick={handleDropdownToggle} className="user_info">
              <span>{storedUser.username}</span>
              <img
                src="./assets/avator/1.jpeg"
                alt={storedUser.username}
              />
              <FiChevronDown size={16} />
            </div>

            {dropdownOpen && (
              <div className="dropdown_menu">
                <div onClick={() => navigate('/profile')}>
                  <FiUser size={14} />
                  Profile
                </div>
                <div onClick={() => navigate('/settings')}>
                  <FiSettings size={14} />
                  Settings
                </div>
                <div onClick={handleLogout}>
                  <FiLogOut size={14} />
                  Logout
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="contact_list_members_container">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="contact_list_member"
            onClick={() => navigate(`/chatPage`, { state: { id: contact.id, username: contact.name } })}
            style={{ cursor: 'pointer' }}
          >
            <img src={`http://localhost:5000${contact.avatar}`} alt="avatar" />
            <div className="contact_list_member_info">
              <h3>{contact.name}</h3>
              <p>{contact.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactList;
