import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart3, FileText, LogOut } from "lucide-react";
import Dashboard from "./Dashboard";
import BlogList from "./BlogList";

type ActiveTab = "dashboard" | "blog";

export default function Layout() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "dashboard"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab("blog")}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "blog"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Blog Yazıları
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "blog" && <BlogList />}
      </main>
    </div>
  );
}
