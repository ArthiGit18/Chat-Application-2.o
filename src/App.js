import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from './components/Main';
import { Home } from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Chat from './Pages/Chat/Chat';
import ChatPage from './Pages/Chat/ChatPage';


function App() {
  return (
   <Router>
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/chatPage" element={<ChatPage />} />
    </Routes>
   </Router>
  );
}

export default App;
