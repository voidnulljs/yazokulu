import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseActionButtons from "./course-action-buttons";

export default async function StudentCoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get all open courses
  const { data: acikDersler } = await supabase
    .from("dersler")
    .select(`
      *,
      ogretmenler (ad_soyad),
      ders_kayitlari (count),
      ders_talepleri (count)
    `)
    .eq("durum", "acik")
    .order("created_at", { ascending: false });

  // Get draft courses (for requests)
  const { data: taslakDersler } = await supabase
    .from("dersler")
    .select(`
      *,
      ogretmenler (ad_soyad),
      ders_talepleri (count)
    `)
    .eq("durum", "taslak")
    .order("created_at", { ascending: false });

  // Get user's registrations and requests to disable buttons
  const { data: myRegistrations } = await supabase
    .from("ders_kayitlari")
    .select("ders_id")
    .eq("ogrenci_id", user!.id);
    
  const { data: myRequests } = await supabase
    .from("ders_talepleri")
    .select("ders_id")
    .eq("ogrenci_id", user!.id);

  const registeredCourseIds = new Set(myRegistrations?.map(r => r.ders_id));
  const requestedCourseIds = new Set(myRequests?.map(r => r.ders_id));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Ders Seçimi</h1>

      <Tabs defaultValue="acik" className="w-full">
        <TabsList>
          <TabsTrigger value="acik">Açık Dersler</TabsTrigger>
          <TabsTrigger value="talep">Ders Talepleri</TabsTrigger>
        </TabsList>
        
        <TabsContent value="acik" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {acikDersler?.map((ders) => (
              <Card key={ders.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">{ders.kod}</Badge>
                    <Badge variant="secondary">{ders.fiyat} ₺</Badge>
                  </div>
                  <CardTitle className="mt-2">{ders.ad}</CardTitle>
                  <CardDescription>{ders.ogretmenler?.ad_soyad}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Kontenjan:</span>
                      <span className={ders.ders_kayitlari[0].count >= ders.kontenjan ? "text-red-500 font-bold" : ""}>
                        {ders.ders_kayitlari[0].count} / {ders.kontenjan}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Min. Talep:</span>
                      <span>{ders.min_talep}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <CourseActionButtons 
                    courseId={ders.id} 
                    type="register"
                    isRegistered={registeredCourseIds.has(ders.id)}
                    isFull={ders.ders_kayitlari[0].count >= ders.kontenjan}
                  />
                </CardFooter>
              </Card>
            ))}
            {(!acikDersler || acikDersler.length === 0) && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Şu anda kayıta açık ders bulunmamaktadır.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="talep" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {taslakDersler?.map((ders) => (
              <Card key={ders.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">{ders.kod}</Badge>
                    <Badge variant="secondary">{ders.fiyat} ₺</Badge>
                  </div>
                  <CardTitle className="mt-2">{ders.ad}</CardTitle>
                  <CardDescription>{ders.ogretmenler?.ad_soyad}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Mevcut Talep:</span>
                      <span>{ders.ders_talepleri[0].count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hedef Talep:</span>
                      <span>{ders.min_talep}</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full mt-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(100, (ders.ders_talepleri[0].count / ders.min_talep) * 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <CourseActionButtons 
                    courseId={ders.id} 
                    type="request"
                    isRequested={requestedCourseIds.has(ders.id)}
                  />
                </CardFooter>
              </Card>
            ))}
            {(!taslakDersler || taslakDersler.length === 0) && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Talep oluşturulabilecek ders bulunmamaktadır.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
