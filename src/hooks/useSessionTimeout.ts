import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface UseSessionTimeoutProps {
  timeoutMinutes?: number;
  onTimeout?: () => void;
}

export function useSessionTimeout({
  timeoutMinutes = 30, // 30 dakika varsayılan
  onTimeout,
}: UseSessionTimeoutProps = {}) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimeout = () => {
    // Önceki timeout'u temizle
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Son aktivite zamanını güncelle
    lastActivityRef.current = Date.now();

    // Yeni timeout ayarla
    timeoutRef.current = setTimeout(async () => {
      console.log("Session timeout - kullanıcı çıkış yapılıyor");
      await supabase.auth.signOut();
      onTimeout?.();
    }, timeoutMinutes * 60 * 1000); // Dakikayı milisaniyeye çevir
  };

  const checkActivity = () => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    const timeoutMs = timeoutMinutes * 60 * 1000;

    // Eğer timeout süresi geçmişse çıkış yap
    if (timeSinceLastActivity >= timeoutMs) {
      console.log("Session expired due to inactivity");
      supabase.auth.signOut();
      onTimeout?.();
      return;
    }

    // Timeout'u yenile
    resetTimeout();
  };

  useEffect(() => {
    // İlk timeout'u ayarla
    resetTimeout();

    // Aktivite event'lerini dinle
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      resetTimeout();
    };

    // Event listener'ları ekle
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Sayfa focus/blur event'lerini dinle
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Sayfa tekrar görünür olduğunda aktiviteyi kontrol et
        checkActivity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [timeoutMinutes]);

  return {
    resetTimeout,
    checkActivity,
    lastActivity: lastActivityRef.current,
  };
}
