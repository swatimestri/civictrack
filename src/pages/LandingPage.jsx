import { ArrowRight, ClipboardList, MapPinned, Radar, ShieldCheck, ThumbsUp, Timer } from 'lucide-react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { useIssues } from '../context/IssueContext'

const features = [
  { icon: ClipboardList, title: 'Transparent reporting', description: 'Raise local issues in a few taps.' },
  { icon: ThumbsUp, title: 'Community voting', description: 'Help urgent issues get prioritized quickly.' },
  { icon: Radar, title: 'Real-time tracking', description: 'Track progress from pending to resolved.' },
  { icon: MapPinned, title: 'Location-first workflow', description: 'Capture exact problem locations for faster action.' },
  { icon: ShieldCheck, title: 'Accountable updates', description: 'Let authorities update status with clear visibility.' },
  { icon: Timer, title: 'Faster resolution', description: 'Prioritize city resources by urgency and public demand.' },
]

export default function LandingPage() {
  const { issues } = useIssues()
  const totalIssues = issues.length
  const resolvedIssues = issues.filter((item) => item.status === 'resolved').length
  const totalVotes = issues.reduce((sum, item) => sum + (item.upvotes || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-indigo-700">CivicTrack Lite</p>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>

        <div className="mt-14 grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
              Smart Civic Issue Platform
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">Report. Prioritize. Solve.</h1>
            <p className="mt-4 text-lg text-slate-600">
              Empower your locality with transparent reporting, photo evidence, public voting, and trackable issue resolution.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/issues/new">
                <Button size="lg" className="gap-2">
                  Report Issue <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/home">
                <Button size="lg" variant="outline">
                  Explore Dashboard
                </Button>
              </Link>
            </div>
          </div>

          <Card className="grid grid-cols-2 gap-4 p-6">
            <div className="rounded-2xl bg-indigo-50 p-4">
              <p className="text-sm text-slate-600">Total Reports</p>
              <p className="mt-1 text-2xl font-bold text-indigo-700">{totalIssues}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-slate-600">Resolved</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{resolvedIssues}</p>
            </div>
            <div className="col-span-2 rounded-2xl bg-slate-100 p-4">
              <p className="text-sm text-slate-600">Total Community Upvotes</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{totalVotes}</p>
            </div>
          </Card>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900">Features for Your Community Objectives</h2>
          <p className="mt-2 text-sm text-slate-600">Everything needed for citizen reporting and authority response in one flow.</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => (
              <Card key={item.title} className="p-6">
                <item.icon className="h-6 w-6 text-indigo-600" />
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-indigo-700">Step 1</p>
            <p className="mt-1 font-medium text-slate-900">Report with details</p>
            <p className="mt-1 text-sm text-slate-600">Share title, category, location and image proof.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-700">Step 2</p>
            <p className="mt-1 font-medium text-slate-900">Community prioritizes</p>
            <p className="mt-1 text-sm text-slate-600">Citizens upvote the most urgent problems.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-700">Step 3</p>
            <p className="mt-1 font-medium text-slate-900">Track resolution</p>
            <p className="mt-1 text-sm text-slate-600">Watch status updates from pending to resolved.</p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
