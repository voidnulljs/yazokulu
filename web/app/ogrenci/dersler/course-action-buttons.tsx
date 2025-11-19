"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from 'next/navigation';

interface CourseActionButtonsProps {
  courseId: string;
  type: "register" | "request";
  isRegistered?: boolean;
  isRequested?: boolean;
  isFull?: boolean;
}

export default function CourseActionButtons({ 
  courseId, 
  type, 
  isRegistered, 
  isRequested,
  isFull 
}: CourseActionButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Call the stored procedure for registration logic
      const { data, error } = await supabase.rpc('ders_kayit_ol', {
        p_ders_id: courseId,
        p_ogrenci_id: user!.id
      });

      if (error) throw error;

      if (data.success) {
        alert(data.message);
        router.refresh();
      } else {
        alert("Hata: " + data.message);
      }
    } catch (error: any) {
      alert("Bir hata oluştu: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("ders_talepleri")
        .insert({
          ders_id: courseId,
          ogrenci_id: user!.id
        });

      if (error) throw error;
      
      alert("Talep başarıyla oluşturuldu.");
      router.refresh();
    } catch (error: any) {
      alert("Bir hata oluştu: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (type === "register") {
    if (isRegistered) {
      return <Button disabled className="w-full" variant="secondary">Kayıtlısınız</Button>;
    }
    return (
      <Button 
        className="w-full" 
        onClick={handleRegister} 
        disabled={isLoading}
        variant={isFull ? "secondary" : "default"}
      >
        {isLoading ? "İşleniyor..." : isFull ? "Yedek Listeye Katıl" : "Dersi Seç"}
      </Button>
    );
  }

  if (type === "request") {
    if (isRequested) {
      return <Button disabled className="w-full" variant="secondary">Talep Edildi</Button>;
    }
    return (
      <Button 
        className="w-full" 
        onClick={handleRequest} 
        disabled={isLoading}
        variant="outline"
      >
        {isLoading ? "İşleniyor..." : "Talep Et"}
      </Button>
    );
  }

  return null;
}
