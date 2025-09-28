import React, {useRef, useState} from 'react'

export default function AudioManager({ defaultSrc }: { defaultSrc?: string }){
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  const toggle = () =>{
    if(!audioRef.current) return
    if(playing){ audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play(); setPlaying(true) }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white/5 p-3 rounded-xl flex items-center gap-3">
      <audio ref={audioRef} src={defaultSrc} loop />
      <button onClick={toggle} className="px-3 py-2 bg-blue-600 rounded">{playing ? 'Pause' : 'Play'}</button>
      <div className="text-sm opacity-80">Ambient</div>
    </div>
  )
}