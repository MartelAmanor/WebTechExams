import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState, useEffect } from 'react';
import api from '../api/api.js';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/events', {
          headers: {
            'x-auth-token': token
          }
        });
        
        // Convert events to calendar format
        const calendarEvents = response.data.map(event => ({
          title: event.title,
          start: new Date(event.date),
          end: new Date(event.date), // Since we don't have end time, using same as start
          description: event.description,
          location: event.location
        }));
        
        setEvents(calendarEvents);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Event Calendar</h1>
        <p className="mt-2 text-gray-600">View and manage all campus events in one place.</p>
      </div>
      <div className="h-[600px] bg-white p-4 rounded-lg shadow">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={['month', 'week', 'day']}
          defaultView="month"
          tooltipAccessor={event => `${event.title}\nLocation: ${event.location}\n${event.description}`}
        />
      </div>
    </div>
  );
}
