"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';

export default function CourseApproval({ 
  courseId, 
  currentStatus 
}: { 
  courseId: string; 
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const updateStatus = async (status: 'acik' | 'iptal' | 'taslak') => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('dersler')
        .update({ durum: status })
        .eq('id', courseId);

      if (error) throw error;
      
      router.refresh();
    } catch (error) {
      console.error('Error updating course status:', error);
      alert('Ders durumu güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === 'acik') {
    return (
      <Button 
        variant="destructive" 
        onClick={() => updateStatus('iptal')}
        disabled={loading}
      >
        <XCircle className="mr-2 h-4 w-4" />
        Dersi İptal Et
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      {currentStatus !== 'taslak' && (
        <Button 
          variant="outline" 
          onClick={() => updateStatus('taslak')}
          disabled={loading}
        >
          Taslağa Çek
        </Button>
      )}
      <Button 
        onClick={() => updateStatus('acik')}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Dersi Onayla ve Aç
      </Button>
    </div>
  );
}
