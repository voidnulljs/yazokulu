import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="max-w-2xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Yaz Okulu Yönetim Sistemi
          </h1>
          <p className="text-lg text-muted-foreground">
            Öğrenci ve öğretmenler için modern, hızlı ve kolay kullanımlı ders yönetim platformu.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="text-lg">
            <Link href="/auth/login">Giriş Yap</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg">
            <Link href="/auth/sign-up">Kayıt Ol</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
