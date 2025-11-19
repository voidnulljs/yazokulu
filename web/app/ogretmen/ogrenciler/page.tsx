import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentActions } from "./student-actions";

export default async function StudentsPage() {
  const supabase = await createClient();

  const { data: ogrenciler } = await supabase
    .from("ogrenciler")
    .select(`
      *
    `)
    .order("ad_soyad");

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Öğrenci Yönetimi</h1>

      <Card>
        <CardHeader>
          <CardTitle>Kayıtlı Öğrenciler</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Öğrenci No</TableHead>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>Kayıt Tarihi</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ogrenciler?.map((ogrenci) => (
                <TableRow key={ogrenci.id}>
                  <TableCell className="font-medium">{ogrenci.ogrenci_no}</TableCell>
                  <TableCell>{ogrenci.ad_soyad}</TableCell>
                  <TableCell>
                    {new Date(ogrenci.created_at).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <StudentActions student={ogrenci} />
                  </TableCell>
                </TableRow>
              ))}
              {(!ogrenciler || ogrenciler.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Henüz kayıtlı öğrenci yok.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
