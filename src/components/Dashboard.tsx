import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Users, FileText, Eye, Heart, Share2, TrendingUp } from "lucide-react";

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  totalUsers: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
}

interface ChartData {
  name: string;
  value: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    totalUsers: 0,
    totalViews: 0,
    totalLikes: 0,
    totalShares: 0,
  });
  const [postViews, setPostViews] = useState<ChartData[]>([]);
  const [dailyViews, setDailyViews] = useState<ChartData[]>([]);
  const [eventTypes, setEventTypes] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Temel istatistikler
      const [postsResult, usersResult, analyticsResult] = await Promise.all([
        supabase.from("blog_posts").select("id, published"),
        supabase.from("auth.users").select("id"),
        supabase.from("blog_analytics").select("event_type"),
      ]);

      // Post istatistikleri
      const totalPosts = postsResult.data?.length || 0;
      const publishedPosts =
        postsResult.data?.filter((p) => p.published).length || 0;

      // Kullanıcı istatistikleri
      const totalUsers = usersResult.data?.length || 0;

      // Analytics istatistikleri
      const analytics = analyticsResult.data || [];
      const totalViews = analytics.filter(
        (a) => a.event_type === "view"
      ).length;
      const totalLikes = analytics.filter(
        (a) => a.event_type === "like"
      ).length;
      const totalShares = analytics.filter(
        (a) => a.event_type === "share"
      ).length;

      setStats({
        totalPosts,
        publishedPosts,
        totalUsers,
        totalViews,
        totalLikes,
        totalShares,
      });

      // Post bazında view'lar
      const { data: postViewsData } = await supabase
        .from("blog_analytics")
        .select(
          `
          post_id,
          blog_posts(title)
        `
        )
        .eq("event_type", "view");

      const postViewsMap = new Map();
      postViewsData?.forEach((item) => {
        const title = item.blog_posts?.title || `Post ${item.post_id}`;
        postViewsMap.set(title, (postViewsMap.get(title) || 0) + 1);
      });

      const postViewsChart = Array.from(postViewsMap.entries()).map(
        ([name, value]) => ({
          name,
          value,
        })
      );
      setPostViews(postViewsChart);

      // Günlük view'lar
      const { data: dailyData } = await supabase
        .from("blog_analytics")
        .select("created_at")
        .eq("event_type", "view")
        .gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        );

      const dailyMap = new Map();
      dailyData?.forEach((item) => {
        const date = new Date(item.created_at).toLocaleDateString("tr-TR");
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
      });

      const dailyChart = Array.from(dailyMap.entries()).map(
        ([name, value]) => ({
          name,
          value,
        })
      );
      setDailyViews(dailyChart);

      // Event türleri
      const eventMap = new Map();
      analytics.forEach((item) => {
        const type = item.event_type;
        eventMap.set(type, (eventMap.get(type) || 0) + 1);
      });

      const eventChart = Array.from(eventMap.entries()).map(
        ([name, value]) => ({
          name:
            name === "view"
              ? "Görüntüleme"
              : name === "like"
              ? "Beğeni"
              : "Paylaşım",
          value,
        })
      );
      setEventTypes(eventChart);
    } catch (error) {
      console.error("Dashboard verisi yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Dashboard yükleniyor...</div>
      </div>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Çıkış Yap
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Yazı</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPosts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Yayınlanmış</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.publishedPosts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Kullanıcılar
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Görüntüleme</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalViews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Beğeniler</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalLikes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Share2 className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Paylaşımlar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalShares}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Post Views Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              Yazı Bazında Görüntülemeler
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={postViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Event Types Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Etkinlik Türleri</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eventTypes.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Views Line Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Son 7 Gün Görüntüleme Trendi
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyViews}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
