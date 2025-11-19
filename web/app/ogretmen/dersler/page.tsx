import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from 'lucide-react';
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: dersler } = await supabase
    .from("dersler")
    .select("*")
    .eq("ogretmen_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Ders Yönetimi</h1>
        <Button asChild>
          <Link href="/ogretmen/dersler/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ders Oluştur
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kod</TableHead>
              <TableHead>Ders Adı</TableHead>
              <TableHead>Kontenjan</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>Min. Talep</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dersler?.map((ders) => (
              <TableRow key={ders.id}>
                <TableCell className="font-medium">{ders.kod}</TableCell>
                <TableCell>{ders.ad}</TableCell>
                <TableCell>{ders.kontenjan}</TableCell>
                <TableCell>{ders.fiyat} ₺</TableCell>
                <TableCell>{ders.min_talep}</TableCell>
                <TableCell>
                  <Badge variant={
                    ders.durum === 'acik' ? 'default' :
                    ders.durum === 'iptal' ? 'destructive' : 'secondary'
                  }>
                    {ders.durum === 'acik' ? 'Açık' :
                     ders.durum === 'iptal' ? 'İptal' : 'Taslak'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/ogretmen/dersler/${ders.id}`}>Detay</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!dersler || dersler.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Henüz ders oluşturulmamış.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
