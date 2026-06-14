import Link from 'next/link'
import { ArrowRight, Pencil, GitCommit, LayoutIcon, FileOutput } from 'lucide-react'
import ChapterDemo from '@/components/landing/ChapterDemo'

const landingThemeVars = {
  backgroundColor: '#fdfcfb', 
  color: '#27272a',          
  '--background': '#fdfcfb',
  '--foreground': '#27272a',
  '--primary': '#18181b',
  '--muted': '#f4f4f5',
  '--border': '#e4e4e7',
  '--accent': '#f4f4f5',
  '--card': '#ffffff',
  '--card-foreground': '#27272a',
  '--popover': '#ffffff',
  '--popover-foreground': '#27272a',
  '--primary-foreground': '#ffffff',
  '--secondary': '#f4f4f5',
  '--secondary-foreground': '#27272a',
  '--muted-foreground': '#71717a',
  '--accent-foreground': '#18181b',
  '--destructive': '#ef4444',
  '--input': '#e4e4e7',
  '--ring': '#a1a1aa',
  '--chart-1': '#18181b',
  '--chart-2': '#27272a',
  '--chart-3': '#3f3f46',
  '--chart-4': '#52525b',
  '--chart-5': '#71717a',
  '--sidebar': '#ffffff',
  '--sidebar-foreground': '#27272a',
  '--sidebar-primary': '#18181b',
  '--sidebar-primary-foreground': '#ffffff',
  '--sidebar-accent': '#f4f4f5',
  '--sidebar-accent-foreground': '#27272a',
  '--sidebar-border': '#e4e4e7',
  '--sidebar-ring': '#a1a1aa',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground" style={landingThemeVars}>
      <div className="max-w-[640px] mx-auto px-6 py-20 pb-24">
        {/* Nav */}
        <nav className="flex items-center justify-between mb-24">
          <span 
            className="text-sm font-semibold text-foreground transition hover:text-primary">Chaptr</span>
          <Link
            href="/login"
            className="h-8 px-3.5 rounded-lg border border-border/60 text-[13px] text-foreground hover:bg-accent/30 transition-colors flex items-center"
          >
            Sign in
          </Link>
        </nav>

        {/* Hero */}
        <div className="mb-20">
          <p className="text-[11px] font-medium tracking-[0.5px] uppercase text-muted-foreground mb-5">
            A writing tool built for long-form
          </p>
          <h1 className="text-[38px] font-medium leading-[1.15] tracking-[-0.8px] text-foreground mb-5">
            Your story,<br />
            <span className="text-muted-foreground">chapter by chapter.</span>
          </h1>
          <p className="text-base leading-[1.7] text-muted-foreground max-w-[480px] mb-8">
            Chaptr turns every Heading 1 into its own focused workspace. Navigate between chapters like tabs — no endless scrolling, no losing your place.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/documents"
              className="h-[38px] px-[18px] rounded-lg bg-foreground text-background text-sm font-medium flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <Pencil className="h-4 w-4" />
              Start writing
            </Link>
            
            <a
              href="#how-it-works"
              className="h-[38px] px-[18px] rounded-lg border border-border/50 text-sm text-muted-foreground hover:bg-accent/30 transition-colors flex items-center"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50 mb-14" />

        {/* Chapter Demo */}
        <div className="mb-16" id="how-it-works">
          <p className="text-[11px] font-medium tracking-[0.5px] uppercase text-muted-foreground mb-6">
            Chapter navigation
          </p>
          <ChapterDemo />
          <p className="text-[12px] text-muted-foreground text-center mt-3">
            Each tab is a focused editor. Changes sync back to the full document.
          </p>
        </div>

        {/* Diff section */}
        <div className="mb-16">
          <p className="text-[11px] font-medium tracking-[0.5px] uppercase text-muted-foreground mb-6">
            Why not just use Google Docs
          </p>
          <ul className="divide-y divide-border/50 border-y border-border/50">
            {[
              {
                icon: <GitCommit className="h-4 w-4" />,
                title: 'Version history you control',
                desc: 'Save a named version when it matters. Not auto-saved noise — intentional commits you can read and roll back to anytime.',
              },
              {
                icon: <LayoutIcon className="h-4 w-4" />,
                title: 'Chapter tabs, not infinite scroll',
                desc: 'Long documents are hard to navigate. Chaptr surfaces your Heading 1s as tabs — switch chapters in one click, stay in the zone.',
              },
              {
                icon: <FileOutput className="h-4 w-4" />,
                title: 'Export anything, any format',
                desc: 'Copy as rich text, download as HTML or DOC — per chapter or the whole document. Your words, your format.',
              },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-3.5 py-4">
                <div className="w-8 h-8 rounded-lg border border-border/60 bg-muted/50 flex items-center justify-center shrink-0 text-muted-foreground">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-foreground mb-0.5">{item.title}</p>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer CTA */}
        <div className="text-center pt-4">
          <Link
            href="/documents"
            className="h-[42px] px-6 rounded-lg bg-foreground text-background text-[15px] font-medium inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ArrowRight className="h-4 w-4" />
            Open my documents
          </Link>
          <p className="text-[13px] text-muted-foreground mt-4">
            Free to use. No credit card needed.
          </p>
        </div>
      </div>
    </div> 
  )
}