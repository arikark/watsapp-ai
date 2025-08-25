export default function DashboardPage() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Your analytics and insights dashboard.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-blue-800">Total Messages</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-green-800">Conversations</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-purple-800">AI Responses</div>
          </div>
        </div>
      </div>
    </div>
  );
}
