import { useRouter } from 'next/router'
import stories from '../../lib/stories'
import Reader from '../../components/Reader'
import AudioManager from '../../components/AudioManager'

export default function StoryPage(){
  const router = useRouter()
  const { slug } = router.query
  const story = stories.find(s => s.id === slug)
  if(!story) return <div className="p-6">Story not found</div>
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl mb-4">{story.title_bn}</h1>
      <Reader content={story.content} />
      <AudioManager defaultSrc={story.audio || ''} />
    </main>
  )
}