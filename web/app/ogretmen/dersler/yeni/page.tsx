"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { ArrowLeft } from 'lucide-react';
import Link from "next/link";

export default function NewCoursePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("dersler").insert({
      ad: formData.get("ad"),
      kod: formData.get("kod"),
      kontenjan: Number(formData.get("kontenjan")),
      fiyat: Number(formData.get("fiyat")),
      min_talep: Number(formData.get("min_talep")),
      ogretmen_id: user!.id,
      durum: "taslak"
    });

    if (!error) {
      router.push("/ogretmen/dersler");
      router.refresh();
    } else {
      alert("Hata oluştu: " + error.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ogretmen/dersler">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Yeni Ders Oluştur</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ders Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kod">Ders Kodu</Label>
                <Input id="kod" name="kod" placeholder="CS101" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad">Ders Adı</Label>
                <Input id="ad" name="ad" placeholder="Bilgisayar Bilimine Giriş" required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kontenjan">Kontenjan</Label>
                <Input id="kontenjan" name="kontenjan" type="number" min="1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiyat">Ücret (₺)</Label>
                <Input id="fiyat" name="fiyat" type="number" min="0" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_talep">Min. Talep</Label>
                <Input id="min_talep" name="min_talep" type="number" min="0" required />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" asChild>
                <Link href="/ogretmen/dersler">İptal</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Oluşturuluyor..." : "Dersi Oluştur"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
