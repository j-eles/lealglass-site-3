/**
 * Loading state para /contato
 * Aparece instantaneamente quando o usuário clica no link "Contato",
 * dando feedback visual antes da página carregar. Suaviza a transição.
 */
export default function Loading() {
  return (
    <div className="min-h-[100svh] bg-background pt-32 lg:pt-28 pb-20">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        {/* Skeleton do header da página */}
        <div className="max-w-[680px] mb-14 animate-pulse">
          <div className="h-3 w-32 bg-white/[0.08] rounded mb-5" />
          <div className="h-12 w-3/4 bg-white/[0.08] rounded mb-5" />
          <div className="h-4 w-full bg-white/[0.06] rounded mb-2" />
          <div className="h-4 w-2/3 bg-white/[0.06] rounded" />
        </div>

        {/* Skeleton do grid */}
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16">
          {/* Skeleton do quadro de contatos */}
          <div className="space-y-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface border border-white/[0.04] rounded-xl p-6 animate-pulse">
                <div className="h-3 w-20 bg-white/[0.08] rounded mb-5" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2 w-16 bg-white/[0.06] rounded" />
                    <div className="h-3 w-32 bg-white/[0.08] rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton do formulário */}
          <div className="bg-surface border border-white/[0.04] rounded-xl p-6 lg:p-10 animate-pulse">
            <div className="h-7 w-48 bg-white/[0.08] rounded mb-2" />
            <div className="h-3 w-72 bg-white/[0.06] rounded mb-8" />
            <div className="space-y-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <div className="h-2 w-20 bg-white/[0.06] rounded mb-2" />
                  <div className="h-11 w-full bg-white/[0.04] rounded-md" />
                </div>
              ))}
              <div className="h-12 w-full bg-white/[0.06] rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
