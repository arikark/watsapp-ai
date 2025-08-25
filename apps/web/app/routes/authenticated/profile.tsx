export default function ProfilePage() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Profile Settings
        </h1>
        <p className="text-gray-600 mb-6">
          Manage your account settings and preferences.
        </p>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Account Information
            </h3>
            <p className="text-sm text-gray-600">
              Update your personal information and account details.
            </p>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Security</h3>
            <p className="text-sm text-gray-600">
              Manage your password and security settings.
            </p>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Preferences
            </h3>
            <p className="text-sm text-gray-600">
              Customize your app experience and notification settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
