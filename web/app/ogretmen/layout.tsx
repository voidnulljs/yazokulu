import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, BookOpen, Users, LayoutDashboard } from 'lucide-react';

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 font-bold text-xl">
          <BookOpen className="h-6 w-6" />
          <span>Öğretmen Paneli</span>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <Button asChild variant="ghost" className="justify-start text-white hover:text-white hover:bg-slate-800">
            <Link href="/ogretmen">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Genel Bakış
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start text-white hover:text-white hover:bg-slate-800">
            <Link href="/ogretmen/dersler">
              <BookOpen className="mr-2 h-4 w-4" />
              Ders Yönetimi
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start text-white hover:text-white hover:bg-slate-800">
            <Link href="/ogretmen/ogrenciler">
              <Users className="mr-2 h-4 w-4" />
              Öğrenci Yönetimi
            </Link>
          </Button>
        </nav>

        <form action="/auth/sign-out" method="post">
          <Button variant="destructive" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış Yap
          </Button>
        </form>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
