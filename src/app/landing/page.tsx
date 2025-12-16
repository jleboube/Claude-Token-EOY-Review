'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Sparkles, Code2, Rocket, Brain, Clock,
  Star, ArrowRight, Trophy,
  MessageSquare, GitBranch, Terminal, Cpu,
  ChevronDown, Github, Linkedin
} from 'lucide-react'
import Link from 'next/link'

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
}

// Floating animation for cards
const floatingAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut" as const
  }
}

// Partner logos (placeholder companies that use AI coding tools)
const partners = [
  { name: 'Vercel', icon: '▲' },
  { name: 'Stripe', icon: '◈' },
  { name: 'Shopify', icon: '⬡' },
  { name: 'GitHub', icon: '◉' },
  { name: 'Discord', icon: '◎' },
  { name: 'Notion', icon: '◫' },
  { name: 'Linear', icon: '◇' },
  { name: 'Figma', icon: '◈' },
]

// Benefits data
const benefits = [
  {
    icon: <Rocket className="w-8 h-8" />,
    title: "10x Faster Development",
    description: "Ship features in hours, not days. AI assistance accelerates your entire development workflow.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "Intelligent Code Suggestions",
    description: "Get context-aware completions that understand your codebase and coding patterns.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: <Code2 className="w-8 h-8" />,
    title: "Clean, Maintainable Code",
    description: "AI helps you write code that follows best practices and modern patterns.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: "Save Hours Daily",
    description: "Automate repetitive tasks and focus on solving interesting problems.",
    gradient: "from-orange-500 to-yellow-500"
  },
  {
    icon: <GitBranch className="w-8 h-8" />,
    title: "Better Code Reviews",
    description: "Catch bugs and issues before they reach production with AI-powered analysis.",
    gradient: "from-red-500 to-rose-500"
  },
  {
    icon: <Terminal className="w-8 h-8" />,
    title: "Learn While You Code",
    description: "Understand complex codebases faster with AI explanations and documentation.",
    gradient: "from-indigo-500 to-violet-500"
  },
  {
    icon: <Trophy className="w-8 h-8" />,
    title: "Join the Leaderboard",
    description: "See how your Claude usage compares to other power users. Compete and showcase your AI journey.",
    gradient: "from-amber-500 to-orange-500"
  },
]

// How it works steps
const steps = [
  {
    number: "01",
    title: "Connect Your Account",
    description: "Sign in with X (Twitter) and enter your Claude Admin API key securely.",
    icon: <MessageSquare className="w-6 h-6" />
  },
  {
    number: "02",
    title: "View Your Stats",
    description: "See your total token usage, input/output breakdown, and AI coding journey for 2025.",
    icon: <Cpu className="w-6 h-6" />
  },
  {
    number: "03",
    title: "Share Your Journey",
    description: "Generate a beautiful stats card and share your AI coding story with the world.",
    icon: <Rocket className="w-6 h-6" />
  },
]

// Testimonials
const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior Developer @ TechCorp",
    avatar: "SC",
    content: "AI Token Share helped me realize I've been way more productive this year. Sharing my stats sparked great conversations about AI-assisted development!",
    rating: 5
  },
  {
    name: "Marcus Rodriguez",
    role: "Indie Hacker",
    avatar: "MR",
    content: "Love seeing my Claude usage stats! It's like Spotify Wrapped but for coding. The share cards look amazing on Twitter.",
    rating: 5
  },
  {
    name: "Emily Watson",
    role: "Full Stack Engineer",
    avatar: "EW",
    content: "Finally a way to quantify how much AI has helped my workflow. The token breakdown is super insightful.",
    rating: 5
  },
  {
    name: "Alex Kim",
    role: "Tech Lead @ StartupXYZ",
    avatar: "AK",
    content: "Shared my Claude stats and my whole team wanted to check theirs. Great tool for developer communities!",
    rating: 5
  },
]

// FAQ data
const faqs = [
  {
    question: "Is my API key stored or shared?",
    answer: "No, your API key is only used to fetch your usage data and is never stored on our servers. All processing happens in your browser session."
  },
  {
    question: "What data do you collect?",
    answer: "We only access your token usage statistics from Claude. We don't read your conversations or any other personal data."
  },
  {
    question: "What type of API key do I need?",
    answer: "You need a Claude Admin API key (starts with sk-ant-admin-) to access usage data. Regular API keys don't have permission to view usage statistics. You can create one at console.anthropic.com/settings/keys."
  },
  {
    question: "Is this affiliated with Anthropic?",
    answer: "No, Claude Token Share is an independent project and is not affiliated with, endorsed by, or sponsored by Anthropic or X Corp."
  },
]

// Navbar Component
interface NavbarProps {
  onGetStarted?: () => void
}

function Navbar({ onGetStarted }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Benefits', href: '#benefits' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ]

  const handleClick = (e: React.MouseEvent) => {
    if (onGetStarted) {
      e.preventDefault()
      onGetStarted()
    }
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
            <span className="text-xl font-bold text-white">Claude Token Share</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleClick}
              className="px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-white transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-full h-0.5 bg-white transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-full h-0.5 bg-white transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-300 hover:text-white transition-colors py-2"
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={handleClick}
              className="block w-full text-center px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500"
            >
              Get Started
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}

// Hero Section
interface HeroSectionProps {
  onGetStarted?: () => void
}

function HeroSection({ onGetStarted }: HeroSectionProps) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  const handleClick = (e: React.MouseEvent) => {
    if (onGetStarted) {
      e.preventDefault()
      onGetStarted()
    }
  }

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        {/* Animated grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Glowing orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            style={{ y, opacity }}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Social proof badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <div className="flex -space-x-2">
                {['bg-amber-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500'].map((color, i) => (
                  <div key={i} className={`w-6 h-6 rounded-full ${color} border-2 border-gray-900 flex items-center justify-center text-xs text-white font-bold`}>
                    {['S', 'M', 'E', 'A'][i]}
                  </div>
                ))}
              </div>
              <span className="text-gray-400 text-sm">1,000+ developers sharing their AI journey</span>
            </motion.div>

            {/* Main heading */}
            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Discover Your{' '}
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
                AI Coding
              </span>{' '}
              Journey in 2025
            </motion.h1>

            {/* Subheading */}
            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-gray-400 mb-8 max-w-xl">
              See how many tokens you&apos;ve used with Claude this year.
              Generate beautiful stats cards and share your AI-powered development story.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleClick}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
              >
                Check Your Usage
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg font-semibold text-white border border-white/20 hover:bg-white/5 transition-all"
              >
                Learn More
                <ChevronDown className="w-5 h-5" />
              </a>
            </motion.div>
          </motion.div>

          {/* Right content - Preview card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Floating stats card preview */}
            <motion.div
              animate={floatingAnimation}
              className="relative mx-auto max-w-md"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-green-500/20 rounded-3xl blur-2xl" />

              {/* Card */}
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                  <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">2025 AI Usage</span>
                </div>

                <div className="text-center mb-6">
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                    className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"
                  >
                    2.4M
                  </motion.p>
                  <p className="text-gray-400 mt-1">Total Tokens</p>
                </div>

                <div className="flex justify-center gap-8 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">1.8M</p>
                    <p className="text-gray-500">Input</p>
                  </div>
                  <div className="w-px bg-gray-700" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">600K</p>
                    <p className="text-gray-500">Output</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700 text-center">
                  <p className="text-xs text-gray-500">Powered by AI Token Share</p>
                </div>
              </div>

              {/* Decorative elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Code2 className="w-6 h-6 text-white" />
              </motion.div>

              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg"
              >
                <Brain className="w-5 h-5 text-white" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

// Partners Section
function PartnersSection() {
  return (
    <section className="py-16 bg-gray-900/50 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-8"
        >
          <p className="text-gray-500 text-sm uppercase tracking-wider">
            Trusted by developers at
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              variants={scaleIn}
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <span className="text-2xl">{partner.icon}</span>
              <span className="font-medium">{partner.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Benefits Section
function BenefitsSection() {
  return (
    <section id="benefits" className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Why AI-Assisted Coding?
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join thousands of developers who&apos;ve transformed their workflow with AI coding assistants
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              variants={fadeInUp}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative bg-gray-800/50 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />

              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.gradient} mb-4`}>
                <div className="text-white">{benefit.icon}</div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
              <p className="text-gray-400">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// How it Works Section
function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How It Works
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-400 text-lg max-w-2xl mx-auto">
            Share your AI coding journey in three simple steps
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={fadeInUp}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-amber-500/50 to-transparent -translate-x-4" />
              )}

              <div className="relative bg-gray-800/50 rounded-2xl p-8 border border-white/5 h-full">
                {/* Step number */}
                <div className="absolute -top-4 left-6 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-white text-sm font-bold">
                  {step.number}
                </div>

                <div className="mt-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 mb-4">
                    <div className="text-amber-500">{step.icon}</div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Get Started Section (Claude focused)
interface GetStartedSectionProps {
  onGetStarted?: () => void
}

function GetStartedSection({ onGetStarted }: GetStartedSectionProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onGetStarted) {
      e.preventDefault()
      onGetStarted()
    }
  }

  return (
    <section id="get-started" className="py-24 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Get Started with Claude
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-400 text-lg max-w-2xl mx-auto">
            View and share your Claude usage stats for 2025
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleIn}
          className="max-w-2xl mx-auto"
        >
          {/* Claude Card */}
          <motion.button
            onClick={handleClick}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group relative block w-full text-left bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-10 border border-amber-500/20 hover:border-amber-500/50 transition-all overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>

              <h3 className="text-3xl font-bold text-white mb-2">Claude Token Share</h3>
              <p className="text-gray-400 mb-2">by Anthropic</p>

              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                View your Claude API and Claude Code usage statistics for 2025. See your total tokens, model breakdown, and monthly trends.
              </p>

              <div className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 group-hover:from-amber-600 group-hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25">
                Check Your Claude Usage
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

// Testimonials Section
function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Loved by Developers Worldwide
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-400 text-lg max-w-2xl mx-auto">
            See what developers are saying about sharing their AI journey
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-gray-800/50 rounded-2xl p-6 border border-white/5"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{testimonial.name}</p>
                  <p className="text-gray-500 text-xs">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// FAQ Section
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-400 text-lg">
            Everything you need to know about AI Token Share
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-gray-800/50 rounded-xl border border-white/5 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
              >
                <span className="text-white font-medium">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? 'auto' : 0,
                  opacity: openIndex === index ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-4 text-gray-400">
                  {faq.answer}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// CTA Section
interface CTASectionProps {
  onGetStarted?: () => void
}

function CTASection({ onGetStarted }: CTASectionProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onGetStarted) {
      e.preventDefault()
      onGetStarted()
    }
  }

  return (
    <section className="py-24 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleIn}
          className="relative bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-3xl p-12 text-center overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />

          {/* Glowing orbs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 mb-6 shadow-lg shadow-amber-500/25"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Share Your AI Journey?
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              Join thousands of developers celebrating their AI-powered coding achievements in 2025.
            </p>

            <button
              onClick={handleClick}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/landing" className="flex items-center gap-2 mb-4">
              <div className="relative">
                <Sparkles className="w-8 h-8 text-amber-500" />
              </div>
              <span className="text-xl font-bold text-white">Claude Token Share</span>
            </Link>
            <p className="text-gray-400 text-sm max-w-md mb-4">
              Discover and share your AI coding journey. See how many tokens you&apos;ve used with Claude in 2025.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/in/joe-leboube" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#benefits" className="text-gray-400 hover:text-white transition-colors">Benefits</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</a></li>
              <li><a href="#faq" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Claude Token Share. Not affiliated with Anthropic or X Corp.
          </p>
          <p className="text-center text-gray-600 text-xs mt-2">
            Made with <span className="text-red-500">&#x2764;</span> by{' '}
            <a href="https://linkedin.com/in/joe-leboube" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">
              Joe LeBoube
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

// Main Landing Page
interface LandingPageProps {
  onGetStarted?: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar onGetStarted={onGetStarted} />
      <HeroSection onGetStarted={onGetStarted} />
      <PartnersSection />
      <BenefitsSection />
      <HowItWorksSection />
      <GetStartedSection onGetStarted={onGetStarted} />
      <TestimonialsSection />
      <FAQSection />
      <CTASection onGetStarted={onGetStarted} />
      <Footer />
    </div>
  )
}
