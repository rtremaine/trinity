export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col px-safe pt-safe pb-safe">
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-8">
        {children}
      </main>
    </div>
  );
}
