import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  slug: string;
  published: boolean;
  created_at: string;
}

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Blog posts data:", data);
      setPosts(data || []);
    } catch (error) {
      console.error("Blog posts yüklenirken hata:", error);
      setPosts([]);
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
        <div className="text-lg">Blog yazıları yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog Yazıları</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Çıkış Yap
          </button>
        </div>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Henüz blog yazısı yok.</p>
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {post.title}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString("tr-TR")}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">
                  {post.content?.substring(0, 200)}...
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Slug: {post.slug}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Devamını Oku →
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
