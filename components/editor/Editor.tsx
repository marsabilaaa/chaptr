'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import './editor.css'

interface EditorProps {
  content?: string
  onChange?: (content: string) => void
  editable?: boolean
}

export default function Editor({ content = '', onChange, editable = true }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your story...',
      }),
      CharacterCount,
    ],
    content,
    editable,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML())
    },
  })

  if (!editor) return null

  return (
    <div className="editor-wrapper">
      <EditorContent editor={editor} />
      <div className="character-count">
        {editor.storage.characterCount.words()} words
      </div>
    </div>
  )
}