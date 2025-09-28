import Link from 'next/link'
import stories from '../lib/stories'

export default function Home(){
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-semibold mb-6">Golpo — Premium (Demo)</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.map(s => (
          <Link key={s.id} href={`/story/${s.id}`}> 
            <a className="block p-4 rounded-xl bg-white/3 hover:bg-white/6 transition">
              <img src="/placeholder.png" alt="cover" className="w-full h-40 object-cover rounded-md mb-3" />
              <h2 className="text-xl font-medium">{s.title_bn}</h2>
              <p className="text-sm opacity-80">{s.excerpt}</p>
            </a>
          </Link>
        ))}
      </div>
    </main>
  )
}