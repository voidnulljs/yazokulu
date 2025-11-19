"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

interface Student {
  id: string;
  ad_soyad: string;
  ogrenci_no: string;
}

export function StudentActions({ student }: { student: Student }) {
  const [open, setOpen] = useState(false);
  const [adSoyad, setAdSoyad] = useState(student.ad_soyad);
  const [ogrenciNo, setOgrenciNo] = useState(student.ogrenci_no);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("ogrenciler")
        .update({
          ad_soyad: adSoyad,
          ogrenci_no: ogrenciNo,
        })
        .eq("id", student.id);

      if (error) throw error;

      toast.success("Öğrenci bilgileri güncellendi");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Güncelleme sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("ogrenciler")
        .delete()
        .eq("id", student.id);

      if (error) throw error;

      toast.success("Öğrenci silindi");
      router.refresh();
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Silme sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Öğrenci Düzenle</DialogTitle>
            <DialogDescription>
              Öğrenci bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ad-soyad">Ad Soyad</Label>
              <Input
                id="ad-soyad"
                value={adSoyad}
                onChange={(e) => setAdSoyad(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ogrenci-no">Öğrenci No</Label>
              <Input
                id="ogrenci-no"
                value={ogrenciNo}
                onChange={(e) => setOgrenciNo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Öğrenciyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {student.ad_soyad} adlı öğrenciyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
