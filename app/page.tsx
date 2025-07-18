import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Users, Bell, Shield, Zap, Target, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-teal-400/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">TaskMate</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-teal-400 hover:bg-teal-500 text-slate-950 font-semibold px-6">Get Started</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-teal-400/10 text-teal-400 border-teal-400/20 hover:bg-teal-400/20">
              ✨ The Future of Productivity
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-tight">
              Stay Accountable.
              <br />
              <span className="text-teal-400">Achieve More.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              TaskMate transforms your productivity with AI-powered accountability partners, automated reminders, and
              beautiful progress tracking that keeps you motivated.
            </p>
            <div className="text-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-teal-400 hover:bg-teal-500 text-slate-950 font-semibold px-8 py-4 text-lg group"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Everything you need to
              <span className="text-teal-400"> stay on track</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Powerful features designed to boost your productivity and keep you accountable to your goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Accountability Partners",
                description: "Invite partners via email to track your progress. No signup required for them.",
                gradient: "from-teal-400/20 to-cyan-400/20",
              },
              {
                icon: Bell,
                title: "Smart Reminders",
                description: "Beautiful, automated email reminders 24 hours before, on, and after deadlines.",
                gradient: "from-purple-400/20 to-pink-400/20",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Row-level security ensures only you and your partners can access your tasks.",
                gradient: "from-green-400/20 to-emerald-400/20",
              },
              {
                icon: Zap,
                title: "Real-time Dashboard",
                description: "Filter, sort, and track your tasks with live updates and progress insights.",
                gradient: "from-yellow-400/20 to-orange-400/20",
              },
              {
                icon: Target,
                title: "Goal Tracking",
                description: "Set deadlines, track completion rates, and build productive streaks.",
                gradient: "from-blue-400/20 to-indigo-400/20",
              },
              {
                icon: CheckCircle,
                title: "Task Management",
                description: "Create, edit, and organize tasks with rich descriptions and status tracking.",
                gradient: "from-red-400/20 to-rose-400/20",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-teal-400/50 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-teal-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to <span className="text-teal-400">achieve more</span>?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of productive professionals who trust TaskMate to keep them accountable and on track.
            </p>
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-teal-400 hover:bg-teal-500 text-slate-950 font-semibold px-8 py-4 text-lg group"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-sm text-slate-400 mt-4">Join thousands of productive professionals</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">TaskMate</span>
            </div>
            <div className="text-slate-400 text-center md:text-left">Made with ♥ by the TaskMate team</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
