import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api.js';

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  const categories = ['social', 'academic', 'sports', 'cultural', 'other'];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth');
        setIsAdmin(response.data.role === 'admin' || response.data.isAdmin);
      } catch (err) {
        console.error('Error checking auth:', err);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(response.data);
        
        // Initialize RSVP status for each event
        const status = {};
        const userId = localStorage.getItem('userId');
        response.data.forEach(event => {
          status[event._id] = {
            isRegistered: event.registeredUsers?.some(user => user._id === userId),
            loading: false,
            error: null
          };
        });
        setRsvpStatus(status);
        setError('');
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleRSVP = async (eventId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setRsvpStatus(prev => ({
      ...prev,
      [eventId]: { ...prev[eventId], loading: true, error: null }
    }));

    try {
      const isRegistered = rsvpStatus[eventId]?.isRegistered;
      const method = isRegistered ? 'delete' : 'post';
      
      const response = await (method === 'post' 
        ? api.post(`/events/${eventId}/register`, {})
        : api.delete(`/events/${eventId}/register`)
      );

      // Update the events list with the response data
      setEvents(prev => prev.map(event => 
        event._id === eventId ? response.data : event
      ));

      // Update RSVP status
      setRsvpStatus(prev => ({
        ...prev,
        [eventId]: {
          isRegistered: !isRegistered,
          loading: false,
          error: null
        }
      }));
    } catch (err) {
      console.error('RSVP error:', err.response || err);
      const errorMessage = err.response?.data?.msg || 'Failed to update RSVP status';
      setRsvpStatus(prev => ({
        ...prev,
        [eventId]: {
          ...prev[eventId],
          loading: false,
          error: errorMessage
        }
      }));
    }
  };

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Campus Events</h1>
          {isAdmin && (
            <button
              onClick={handleCreateEvent}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Create Event
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search events..."
            className="flex-1 p-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="p-2 border rounded-lg"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <div key={event._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
              <p className="text-gray-600 mb-4">{event.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                  {event.category}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{event.location}</span>
                <button
                  onClick={() => handleRSVP(event._id)}
                  disabled={rsvpStatus[event._id]?.loading}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    rsvpStatus[event._id]?.isRegistered
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {rsvpStatus[event._id]?.loading ? 'Loading...' :
                   rsvpStatus[event._id]?.isRegistered ? 'Cancel RSVP' : 'RSVP'}
                </button>
              </div>
              {rsvpStatus[event._id]?.error && (
                <p className="mt-2 text-sm text-red-600">{rsvpStatus[event._id].error}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
