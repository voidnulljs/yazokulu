"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState } from "react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adSoyad, setAdSoyad] = useState("");
  const [role, setRole] = useState<"ogrenci" | "ogretmen">("ogrenci");
  const [ogrenciNo, setOgrenciNo] = useState("");
  const [unvan, setUnvan] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback`,
          data: {
            role,
            ad_soyad: adSoyad,
            ...(role === "ogrenci" ? { ogrenci_no: ogrenciNo } : { unvan }),
          },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-muted/50">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Kayıt Ol</CardTitle>
              <CardDescription>Yeni bir hesap oluşturun</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="role">Kayıt Türü</Label>
                    <Select
                      value={role}
                      onValueChange={(v: "ogrenci" | "ogretmen") => setRole(v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rol seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ogrenci">Öğrenci</SelectItem>
                        <SelectItem value="ogretmen">Öğretmen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="adSoyad">Ad Soyad</Label>
                    <Input
                      id="adSoyad"
                      required
                      value={adSoyad}
                      onChange={(e) => setAdSoyad(e.target.value)}
                    />
                  </div>

                  {role === "ogrenci" ? (
                    <div className="grid gap-2">
                      <Label htmlFor="ogrenciNo">Öğrenci No</Label>
                      <Input
                        id="ogrenciNo"
                        required
                        value={ogrenciNo}
                        onChange={(e) => setOgrenciNo(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <Label htmlFor="unvan">Ünvan</Label>
                      <Input
                        id="unvan"
                        placeholder="Prof. Dr., Arş. Gör. vb."
                        required
                        value={unvan}
                        onChange={(e) => setUnvan(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@okul.edu.tr"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Şifre</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Zaten hesabınız var mı?{" "}
                  <Link
                    href="/auth/login"
                    className="underline underline-offset-4"
                  >
                    Giriş Yap
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
