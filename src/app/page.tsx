"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const mockPolls = [
  { img: "👟", label: "Celle-ci", votes: 45 },
  { img: "👞", label: "Ou celle-là", votes: 12 },
];

export default function Home() {
  return (
    <div className="relative min-h-dvh overflow-hidden flex flex-col">
      {/* Background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-pink-500/15 blur-[120px]" />
        <div className="absolute top-1/2 left-0 h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"
      />

      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-lg flex flex-col items-center gap-10">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-medium text-violet-300 border border-violet-500/20"
          >
            <Sparkles size={14} className="text-pink-400" />
            100% gratuit et sans compte
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center gap-5 text-center"
          >
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter">
              <span className="gradient-text">Choisis</span>
              <br />
              <span className="text-white">PourMoi</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 font-medium max-w-sm text-balance">
              Demande l&apos;avis de tes potes en 30 secondes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full sm:w-auto"
          >
            <Button
              asChild
              size="lg"
              className="gradient-bg group w-full sm:w-auto gap-3 rounded-full px-8 py-7 text-lg font-bold text-white shadow-[0_0_40px_rgba(167,139,250,0.3)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(167,139,250,0.5)] hover:scale-[1.02] active:scale-[0.98] border-0"
            >
              <Link href="/create">
                Créer un sondage
                <ArrowRight
                  size={20}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </Button>
          </motion.div>

          {/* Exemple Visuel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="w-full mt-8 relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-orange-500/10 blur-xl rounded-3xl" />
            <div className="glass p-5 rounded-3xl border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20">
                <Users size={40} />
              </div>
              <h3 className="font-semibold text-white/90 mb-4 text-center">🤔 Quelle paire choisir ?</h3>
              <div className="grid grid-cols-2 gap-3">
                {mockPolls.map((poll, i) => (
                  <div key={i} className="flex flex-col gap-2 relative">
                    {i === 0 && (
                      <div className="absolute -top-2 -right-2 z-10 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg transform rotate-6">
                        <Trophy size={10} /> {poll.votes} votes
                      </div>
                    )}
                    <div className={`aspect-square rounded-2xl flex items-center justify-center text-6xl ${i === 0 ? 'bg-gradient-to-br from-violet-500/20 to-pink-500/20 border-2 border-pink-500/50' : 'bg-white/5 border border-white/5'}`}>
                      {poll.img}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <footer className="py-6 text-center text-sm font-medium text-white/30">
        <p>Créé avec ♥ par Siham</p>
      </footer>
    </div>
  );
}
