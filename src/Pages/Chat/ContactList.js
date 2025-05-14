import React, { useEffect, useState, useCallback  } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown, FiLogOut, FiSettings, FiUser } from 'react-icons/fi';
import { RiDeleteBinLine } from "react-icons/ri";
import socket from './sockets'; // Assuming you have socket initialized

const ContactList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contactsData, setContactsData] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Get the stored user from session or local storage
  const storedUser =
    JSON.parse(sessionStorage.getItem('user')) ||
    JSON.parse(localStorage.getItem('user'));

  // Fetch contacts (excluding the logged-in user)
 
  // ✅ Wrapping fetchContacts with useCallback
  const fetchContacts = useCallback(async () => {
    try {
      const res = await axios.get('https://chatapplication-2o-backend-production.up.railway.app/api/auth/users/loggedin');
      const users = res.data.filter((user) => user.email !== storedUser?.email);

      const updatedUsers = await Promise.all(
        users.map(async (user) => {
          const lastMessageResponse = await axios.get(
            `https://chatapplication-2o-backend-production.up.railway.app/api/chat/lastMessage/${storedUser.email}/${user.email}`
          );

          const unseenCountResponse = await axios.get(
            `https://chatapplication-2o-backend-production.up.railway.app/api/chat/unseenCount/${storedUser.email}/${user.email}`
          );

          return {
            id: user._id,
            name: user.username,
            avatar: user.avatar || '/assets/default-profile.png',
            email: user.email,
            lastMessage: lastMessageResponse.data?.text || 'No messages yet',
            unseenCount: unseenCountResponse.data.count || 0,
          };
        })
      );

      setContactsData(updatedUsers);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  }, [storedUser.email]);


  // 🔄 Listen for new messages from the socket
 useEffect(() => {
    fetchContacts();

    const handleNewMessage = (newMessage) => {
      setContactsData((prevContacts) =>
        prevContacts.map((contact) => {
          if (contact.email === newMessage.senderEmail || contact.email === newMessage.receiverEmail) {
            return {
              ...contact,
              lastMessage: newMessage.text,
              unseenCount: contact.unseenCount + 1,
            };
          }
          return contact;
        })
      );
    };

    socket.on('receive_message', handleNewMessage);

    // Cleanup listener on unmount
    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, [fetchContacts]);

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

  const handleDeleteContact = async (email) => {
    try {
      await axios.delete('https://chatapplication-2o-backend-production.up.railway.app/api/auth/deleteProfile', {
        data: { email },
      });

      setContactsData((prevContacts) =>
        prevContacts.filter((contact) => contact.email !== email)
      );
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleContactClick = async (contact) => {
    try {
      // Mark all messages as seen when the chat is opened
      await axios.put(`https://chatapplication-2o-backend-production.up.railway.app/api/chat/markAsSeen/${contact.email}/${storedUser.email}`);

      // Navigate to chat page
      navigate(`/chatPage`, {
        state: { id: contact.id, username: contact.name },
      });

      // Reset the unseen count to 0 after clicking
      setContactsData((prevContacts) =>
        prevContacts.map((c) =>
          c.email === contact.email ? { ...c, unseenCount: 0 } : c
        )
      );
    } catch (error) {
      console.error('Error marking messages as seen:', error);
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
                src={storedUser?.avatar ? `https://chatapplication-2o-backend-production.up.railway.app${storedUser.avatar}` : "./assets/avator/1.jpeg"}
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
            onClick={() => handleContactClick(contact)}
            style={{ cursor: 'pointer' }}
          >
            <img src={`https://chatapplication-2o-backend-production.up.railway.app${contact.avatar}`} alt="avatar" />
            <div className="contact_list_member_info">
              <h3>{contact.name}</h3>
              <p className="last_message">{contact.lastMessage}</p>
            </div>

            <div className="contact_list_member_meta">
              {contact.unseenCount > 0 && (
                <span className="unseen_count">{contact.unseenCount}</span>
              )}
              <RiDeleteBinLine
                size={20}
                className='bin_icon'
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent click event
                  handleDeleteContact(contact.email);
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
