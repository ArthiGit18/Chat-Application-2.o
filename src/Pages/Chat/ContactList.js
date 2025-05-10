import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown, FiLogOut, FiSettings, FiUser } from 'react-icons/fi';
import { RiDeleteBinLine } from "react-icons/ri";

const ContactList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contactsData, setContactsData] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // 🔄 Get the stored user from session or local storage
  const storedUser =
    JSON.parse(sessionStorage.getItem('user')) ||
    JSON.parse(localStorage.getItem('user'));

  // 🔄 Function to fetch contacts (excluding the logged-in user)
  const fetchContacts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users/loggedin');
      const users = res.data
        .filter((user) => user.email !== storedUser?.email) // Exclude logged-in user by email
        .map((user) => ({
          id: user._id,
          name: user.username,
          message: 'Last message...',
          avatar: user.avatar || '/assets/default-profile.png',
          email: user.email, // Add email to the contact data
        }));

      setContactsData(users);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  };

  useEffect(() => {
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

  const handleProfileNavigate = () => {
    navigate('/profile', { state: { userId: storedUser._id } });
  };

  // Function to handle delete request
  const handleDeleteContact = async (email) => {
  try {
    // Send email in the request body
    const response = await axios.delete('http://localhost:5000/api/auth/deleteProfile', {
      data: { email }, // Send the email in the data field
    });
    console.log('Contact deleted:', response.data);

    // Remove the deleted contact from the local state
    setContactsData((prevContacts) => prevContacts.filter((contact) => contact.email !== email));
  } catch (error) {
    console.error('Error deleting contact:', error);
  }
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
                src={storedUser?.avatar ? `http://localhost:5000${storedUser.avatar}` : "./assets/avator/1.jpeg"}
                alt={storedUser?.username || 'User Avatar'}
              />
              <FiChevronDown size={16} />
            </div>

            {dropdownOpen && (
              <div className="dropdown_menu">
                <div onClick={handleProfileNavigate}>
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

        <input
          type="text"
          placeholder="Search Contacts"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="contact_list_members_container">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="contact_list_member"
            onClick={() =>
              navigate(`/chatPage`, {
                state: { id: contact.id, username: contact.name },
              })
            }
            style={{ cursor: 'pointer' }}
          >
            <img src={`http://localhost:5000${contact.avatar}`} alt="avatar" />
            <div className="contact_list_member_info">
              <h3>{contact.name}</h3>
              <p>{contact.message}</p>
            </div>

            <div className="delete_icon">
              <RiDeleteBinLine
                size={20}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent click event
                  handleDeleteContact(contact.email); // Call delete function with contact's email
                }}
                style={{ cursor: 'pointer', color: 'red' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactList;
