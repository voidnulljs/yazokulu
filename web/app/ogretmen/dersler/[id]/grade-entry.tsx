"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';

interface GradeEntryProps {
  registrationId: string;
  currentGrade?: number | null;
  currentNote?: string | null;
  studentName: string;
}

export default function GradeEntry({ 
  registrationId, 
  currentGrade, 
  currentNote,
  studentName 
}: GradeEntryProps) {
  const [open, setOpen] = useState(false);
  const [grade, setGrade] = useState<string>(currentGrade?.toString() || "");
  const [note, setNote] = useState(currentNote || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("ders_kayitlari")
        .update({
          not_degeri: grade ? parseInt(grade) : null,
          not_aciklamasi: note || null
        })
        .eq("id", registrationId);

      if (error) throw error;

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating grade:", error);
      alert("Not güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Not Gir</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Not Girişi</DialogTitle>
          <DialogDescription>
            {studentName} için not ve açıklama giriniz.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="grade" className="text-right">
              Not
            </Label>
            <Input
              id="grade"
              type="number"
              min="0"
              max="100"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note" className="text-right">
              Açıklama
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
