import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Wallet, Clock } from 'lucide-react';

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch stats
  const { count: kayitliDersSayisi } = await supabase
    .from("ders_kayitlari")
    .select("*", { count: "exact", head: true })
    .eq("ogrenci_id", user!.id);

  const { data: bakiye } = await supabase
    .from("bakiyeler")
    .select("miktar")
    .eq("ogrenci_id", user!.id)
    .single();

  const { count: talepSayisi } = await supabase
    .from("ders_talepleri")
    .select("*", { count: "exact", head: true })
    .eq("ogrenci_id", user!.id);

  // Get registered courses
  const { data: kayitliDersler } = await supabase
    .from("ders_kayitlari")
    .select(`
      *,
      dersler (
        ad,
        kod,
        ogretmenler (ad_soyad)
      )
    `)
    .eq("ogrenci_id", user!.id)
    .order("tarih", { ascending: false });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Hoş Geldin</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kayıtlı Dersler</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kayitliDersSayisi || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mevcut Bakiye</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bakiye?.miktar || 0} ₺</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Talepler</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{talepSayisi || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ders Programım ve Notlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kayitliDersler?.map((kayit) => (
                <div key={kayit.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{kayit.dersler?.ad}</p>
                    <p className="text-sm text-muted-foreground">
                      {kayit.dersler?.kod} - {kayit.dersler?.ogretmenler?.ad_soyad}
                    </p>
                  </div>
                  <div className="text-right">
                    {kayit.not_degeri !== null ? (
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-primary">
                          Not: {kayit.not_degeri}
                        </span>
                        {kayit.not_aciklamasi && (
                          <span className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {kayit.not_aciklamasi}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not Girilmedi</span>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(kayit.tarih).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>
              ))}
              {(!kayitliDersler || kayitliDersler.length === 0) && (
                <p className="text-muted-foreground text-sm">Henüz ders kaydınız bulunmamaktadır.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
