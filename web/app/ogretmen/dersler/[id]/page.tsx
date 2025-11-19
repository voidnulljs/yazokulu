import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { notFound } from 'next/navigation';
import { BookOpen, Users, Clock, Calendar } from 'lucide-react';
import CourseApproval from "./course-approval";
import GradeEntry from "./grade-entry";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch course details
  const { data: ders, error } = await supabase
    .from("dersler")
    .select(`
      *,
      ogretmenler (
        ad_soyad,
        unvan
      )
    `)
    .eq("id", id)
    .single();

  if (error || !ders) {
    notFound();
  }

  // Fetch enrolled students
  const { data: kayitlar } = await supabase
    .from("ders_kayitlari")
    .select(`
      *,
      ogrenciler (
        ad_soyad,
        ogrenci_no
      )
    `)
    .eq("ders_id", id)
    .order("tarih", { ascending: false });

  const { data: yedekler } = await supabase
    .from("yedek_listesi")
    .select(`
      *,
      ogrenciler (
        ad_soyad,
        ogrenci_no
      )
    `)
    .eq("ders_id", id)
    .order("sira", { ascending: true });

  const kesinKayitlar = kayitlar || [];
  const yedekKayitlar = yedekler || [];

  // Fetch pending requests
  const { data: talepler } = await supabase
    .from("ders_talepleri")
    .select(`
      *,
      ogrenciler (
        ad_soyad,
        ogrenci_no
      )
    `)
    .eq("ders_id", id)
    .eq("durum", "beklemede")
    .order("tarih", { ascending: false });

  const durumRenk = {
    acik: "bg-green-100 text-green-800",
    taslak: "bg-yellow-100 text-yellow-800",
    iptal: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{ders.ad}</h1>
          <p className="text-muted-foreground">{ders.kod}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={durumRenk[ders.durum as keyof typeof durumRenk]}>
            {ders.durum === 'acik' ? 'Açık' : ders.durum === 'iptal' ? 'İptal' : 'Taslak'}
          </Badge>
          <CourseApproval courseId={ders.id} currentStatus={ders.durum} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kontenjan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ders.kontenjan}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kayıtlı</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kesinKayitlar.length}</div>
            {yedekKayitlar.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                + {yedekKayitlar.length} yedek
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ücret</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ders.ucret} ₺</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Talep</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{talepler?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kesin Kayıtlı Öğrenciler</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Öğrenci No</TableHead>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Not</TableHead>
                <TableHead>Kayıt Tarihi</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kesinKayitlar.map((kayit) => (
                <TableRow key={kayit.id}>
                  <TableCell className="font-medium">
                    {kayit.ogrenciler?.ogrenci_no}
                  </TableCell>
                  <TableCell>{kayit.ogrenciler?.ad_soyad}</TableCell>
                  <TableCell>
                    <Badge variant="default">Kayıtlı</Badge>
                  </TableCell>
                  <TableCell>
                    {kayit.not_degeri !== null ? (
                      <div className="flex flex-col">
                        <span className="font-bold">{kayit.not_degeri}</span>
                        {kayit.not_aciklamasi && (
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {kayit.not_aciklamasi}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(kayit.tarih).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <GradeEntry 
                      registrationId={kayit.id}
                      currentGrade={kayit.not_degeri}
                      currentNote={kayit.not_aciklamasi}
                      studentName={kayit.ogrenciler?.ad_soyad || ""}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {kesinKayitlar.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Henüz kesin kayıtlı öğrenci yok.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {yedekKayitlar.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Yedek Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sıra</TableHead>
                  <TableHead>Öğrenci No</TableHead>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yedekKayitlar.map((kayit) => (
                  <TableRow key={kayit.id}>
                    <TableCell className="font-medium">
                      {kayit.sira}
                    </TableCell>
                    <TableCell className="font-medium">
                      {kayit.ogrenciler?.ogrenci_no}
                    </TableCell>
                    <TableCell>{kayit.ogrenciler?.ad_soyad}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Yedek Liste</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(kayit.tarih).toLocaleDateString('tr-TR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {talepler && talepler.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bekleyen Talepler</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Öğrenci No</TableHead>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>Talep Tarihi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {talepler.map((talep) => (
                  <TableRow key={talep.id}>
                    <TableCell className="font-medium">
                      {talep.ogrenciler?.ogrenci_no}
                    </TableCell>
                    <TableCell>{talep.ogrenciler?.ad_soyad}</TableCell>
                    <TableCell>
                      {new Date(talep.tarih).toLocaleDateString('tr-TR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
