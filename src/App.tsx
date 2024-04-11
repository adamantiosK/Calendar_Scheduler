import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import IosCalendar from './CalendarFile';

function App() {
  return (
    <Router>
      <Routes>
        <Route  path="/" element={<Home />} />
        <Route  path="/calendar/:api_token/:user_id/:list_id" element={<IosCalendar />} />
      </Routes>
    </Router>
  );
}

export default App;
