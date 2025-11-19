import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Clock } from 'lucide-react';

export default async function TeacherDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch stats
  const { count: dersSayisi } = await supabase
    .from("dersler")
    .select("*", { count: "exact", head: true })
    .eq("ogretmen_id", user!.id);

  const { count: talepSayisi } = await supabase
    .from("ders_talepleri")
    .select("*", { count: "exact", head: true });

  const { count: ogrenciSayisi } = await supabase
    .from("ogrenciler")
    .select("*", { count: "exact", head: true });

  // Get recent courses
  const { data: sonDersler } = await supabase
    .from("dersler")
    .select("*")
    .eq("ogretmen_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Hoş Geldiniz, Hocam</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Dersleriniz</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dersSayisi || 0}</div>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ogrenciSayisi || 0}</div>
            <p className="text-xs text-muted-foreground">Sistem geneli</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Son Açılan Dersler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sonDersler?.map((ders) => (
                <div key={ders.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{ders.ad}</p>
                    <p className="text-sm text-muted-foreground">{ders.kod}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      ders.durum === 'acik' ? 'bg-green-100 text-green-800' :
                      ders.durum === 'iptal' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ders.durum === 'acik' ? 'Açık' :
                       ders.durum === 'iptal' ? 'İptal' : 'Taslak'}
                    </span>
                  </div>
                </div>
              ))}
              {(!sonDersler || sonDersler.length === 0) && (
                <p className="text-muted-foreground text-sm">Henüz ders oluşturmadınız.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
