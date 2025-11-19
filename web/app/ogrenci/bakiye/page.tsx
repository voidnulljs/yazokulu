import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BalanceActions from "./balance-actions";

export default async function BalancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: bakiye } = await supabase
    .from("bakiyeler")
    .select("miktar")
    .eq("ogrenci_id", user!.id)
    .single();

  const { data: islemler } = await supabase
    .from("islemler")
    .select("*")
    .eq("ogrenci_id", user!.id)
    .order("tarih", { ascending: false });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Bakiye İşlemleri</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mevcut Bakiye</CardTitle>
            <CardDescription>Hesabınızdaki güncel bakiye durumu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-6">
              {bakiye?.miktar || 0} ₺
            </div>
            <BalanceActions userId={user!.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>İşlem Geçmişi</CardTitle>
            <CardDescription>Son hesap hareketleriniz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>İşlem</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead className="text-right">Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {islemler?.map((islem) => (
                    <TableRow key={islem.id}>
                      <TableCell>
                        <div className="font-medium">
                          {islem.tur === 'yukleme' ? 'Bakiye Yükleme' : 
                           islem.tur === 'harcama' ? 'Ders Kaydı' : 'İade'}
                        </div>
                        <div className="text-xs text-muted-foreground">{islem.aciklama}</div>
                      </TableCell>
                      <TableCell className={
                        islem.tur === 'yukleme' || islem.tur === 'iade' 
                          ? "text-green-600 font-medium" 
                          : "text-red-600 font-medium"
                      }>
                        {islem.tur === 'yukleme' || islem.tur === 'iade' ? '+' : '-'}
                        {islem.miktar} ₺
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {new Date(islem.tarih).toLocaleDateString('tr-TR')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!islemler || islemler.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        Henüz işlem geçmişi yok.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
