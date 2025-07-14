
import MainLayout from '@/components/layout/MainLayout';

export default function DashboardPage() {
  return (
  
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Hoş geldiniz! Topluluk aktivitelerinizi buradan takip edebilirsiniz.</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Toplam Kulüp</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">12</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Aktif Görev</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">8</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Bu Hafta Toplantı</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">3</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Toplam Üye</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">156</p>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">English Club'da yeni bir görev oluşturuldu</span>
                <span className="text-xs text-gray-400">2 saat önce</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Tech Club toplantısı planlandı</span>
                <span className="text-xs text-gray-400">5 saat önce</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Yeni üye katıldı: John Doe</span>
                <span className="text-xs text-gray-400">1 gün önce</span>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>

  );
}