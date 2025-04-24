export const RecentActivities = ({ activities }) => (
  <div className="bg-black p-6 rounded-lg">
    <h2 className="text-white font-medium mb-4">Attività Recenti</h2>
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
            <div>
              <p className="text-white text-sm">{activity.clientName}</p>
              <p className="text-gray-400 text-sm">{activity.description}</p>
            </div>
          </div>
          <span className="text-gray-400 text-sm">
            {new Date(activity.timestamp).toLocaleTimeString('it-IT', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      ))}
    </div>
  </div>
); 