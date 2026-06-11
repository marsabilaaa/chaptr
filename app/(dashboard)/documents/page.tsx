import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DocumentList from '@/components/layout/DocumentList'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      <DocumentList userId={user.id} />
    </div>
  )
}