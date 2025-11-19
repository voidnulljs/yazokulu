"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function BalanceActions({ userId }: { userId: string }) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLoadBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    
    setIsLoading(true);
    try {
      // In a real app, this would integrate with a payment gateway
      // For this demo, we'll just add the balance directly via the islemler table
      // Note: In production, this should be a server action or API route with proper validation
      
      const { error } = await supabase
        .from("islemler")
        .insert({
          ogrenci_id: userId,
          tur: "yukleme",
          miktar: Number(amount),
          aciklama: "Kredi Kartı ile Yükleme"
        });

      if (error) throw error;

      alert("Bakiye başarıyla yüklendi!");
      setAmount("");
      router.refresh();
    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLoadBalance} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Bakiye Yükle</Label>
        <div className="flex gap-2">
          <Input
            id="amount"
            type="number"
            min="1"
            placeholder="Tutar giriniz"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Yükleniyor..." : "Yükle"}
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        * Demo modunda bakiye anında yüklenir.
    </form>
  );
}
