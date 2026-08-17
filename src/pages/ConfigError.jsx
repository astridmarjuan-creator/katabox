export default function ConfigError() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-mist px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500 text-2xl font-extrabold text-white shadow-pop">
            !
          </div>
          <h1 className="text-2xl font-extrabold text-ink">Missing Supabase configuration</h1>
        </div>
        <div className="card p-6 text-sm text-ink/70 space-y-3">
          <p>
            KataBox can&apos;t connect to Supabase because <code className="pill bg-mist">VITE_SUPABASE_URL</code>{' '}
            and/or <code className="pill bg-mist">VITE_SUPABASE_ANON_KEY</code> aren&apos;t set.
          </p>
          <p className="font-semibold text-ink">To fix on Vercel:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Project Settings → Environment Variables</li>
            <li>
              Add both keys with the values from your Supabase project&apos;s Settings → API page
            </li>
            <li>Redeploy</li>
          </ol>
          <p className="font-semibold text-ink">To fix locally:</p>
          <p>
            Copy <code className="pill bg-mist">.env.example</code> to{' '}
            <code className="pill bg-mist">.env</code> and fill in the same two values.
          </p>
        </div>
      </div>
    </div>
  )
}
