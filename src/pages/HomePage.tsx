import hero from '../assets/hero.png'

export function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6">
      <img
        src={hero}
        alt="REZERV — резервирай своя час"
        className="w-full rounded-2xl object-cover"
      />
    </main>
  )
}
