import { useState } from 'react';

const sampleUserEvents = [
  {
    id: 1,
    title: 'Tech Workshop: Introduction to AI',
    date: '2024-12-20',
    time: '14:00',
    location: 'Computer Science Building',
    status: 'upcoming',
  },
  {
    id: 2,
    title: 'Business Seminar: Entrepreneurship 101',
    date: '2024-12-22',
    time: '15:30',
    location: 'Business School Auditorium',
    status: 'upcoming',
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('upcoming');
  
  const filteredEvents = sampleUserEvents.filter(
    event => event.status === activeTab
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your registered events and preferences
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {['upcoming', 'past', 'saved'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === tab
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} Events
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Date:</span> {event.date}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Time:</span> {event.time}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Location:</span> {event.location}
                        </p>
                      </div>
                    </div>
                    <button className="text-red-600 hover:text-red-800">
                      Cancel Registration
                    </button>
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No {activeTab} events found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
