import React from 'react'

export default function Reader({ content }: { content: string }){
  return (
    <article className="prose prose-invert max-w-none">
      {content.split('\n\n').map((p, i) => (
        <p key={i} className="text-lg leading-8">{p}</p>
      ))}
    </article>
  )
}