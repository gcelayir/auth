import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useSessionTimeout } from "./useSessionTimeout";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Session timeout hook'u - 15 dakika inaktivite sonrası çıkış
  const { resetTimeout } = useSessionTimeout({
    timeoutMinutes: 15,
    onTimeout: () => {
      console.log("Session timeout - kullanıcı otomatik çıkış yapıldı");
      setUser(null);
    },
  });

  useEffect(() => {
    // Mevcut session'ı kontrol et
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Eğer kullanıcı varsa timeout'u başlat
      if (session?.user) {
        resetTimeout();
      }
    });

    // Auth değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Kullanıcı giriş yaptığında timeout'u başlat
      if (session?.user) {
        resetTimeout();
      }
    });

    return () => subscription.unsubscribe();
  }, [resetTimeout]);

  return { user, loading };
}
