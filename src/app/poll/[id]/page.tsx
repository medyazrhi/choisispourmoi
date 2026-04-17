"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function PollPage({ params }: { params: { id: string } }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pollData, setPollData] = useState<{ id: string; question: string; options: { id: string; image_url: string }[] } | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const { data: poll, error: pollError } = await supabase
          .from('polls')
          .select('id, question')
          .eq('short_id', params.id)
          .single();

        if (pollError) throw pollError;

        const { data: options, error: optionsError } = await supabase
          .from('poll_options')
          .select('id, image_url, position')
          .eq('poll_id', poll.id)
          .order('position', { ascending: true });

        if (optionsError) throw optionsError;

        // Count votes
        const { count, error: countError } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .in('option_id', options.map(o => o.id));

        if (!countError && count !== null) {
          setTotalVotes(count); // Not totally precise due to concurrency, but good enough
        }

        setPollData({ ...poll, options });
      } catch (err) {
        console.error("Error fetching poll:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPoll();
  }, [params.id]);

  const handleVote = async (optionId: string) => {
    setSelectedId(optionId);
    
    try {
      // Get or create a fingerprint for this browser
      let fingerprint = localStorage.getItem('voter_fingerprint');
      if (!fingerprint) {
        fingerprint = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('voter_fingerprint', fingerprint);
      }

      await supabase.from('votes').insert({
        option_id: optionId,
        voter_fingerprint: fingerprint,
      });

      // Even if unique constraint fails (already voted), we just show success to the user
      setTimeout(() => {
        setVoted(true);
      }, 600);
    } catch (e) {
      console.error(e);
      // Still show success to not block UI if RLS or unique constraint blocks
      setTimeout(() => setVoted(true), 600);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="animate-spin text-white/50" size={32} />
      </div>
    );
  }

  if (!pollData) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Sondage introuvable</h2>
        <p className="text-white/60 mb-6">Le lien est peut-être invalide ou expiré.</p>
        <Link href="/" className={buttonVariants()}>Créer un sondage</Link>
      </div>
    );
  }

  if (voted) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass p-8 rounded-3xl flex flex-col items-center text-center gap-4 max-w-sm w-full"
        >
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Vote enregistré !</h2>
          <p className="text-white/60 mb-4">Merci d&apos;avoir aidé ton pote.</p>
          <Link href={`/poll/${params.id}/results`} className={buttonVariants({ className: "w-full rounded-2xl py-6 bg-violet-600 hover:bg-violet-500 text-white font-semibold" })}>
            Voir les résultats
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh flex flex-col p-4 md:p-8 max-w-3xl mx-auto">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-0 h-[400px] w-[400px] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-pink-900/20 blur-[100px]" />
      </div>

      <header className="mb-8 mt-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-3 py-1 bg-white/5 rounded-full text-xs text-white/50 mb-4 font-medium"
        >
          Sondage anonyme
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight text-balance leading-tight max-w-md mx-auto"
        >
          {pollData.question}
        </motion.h1>
      </header>

      <main className="flex-1 w-full flex flex-col">
        <div className={`grid gap-3 sm:gap-4 ${pollData.options.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'}`}>
          {pollData.options.map((option: { id: string; image_url: string }, i: number) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`relative glass rounded-3xl overflow-hidden group border-2 ${selectedId === option.id ? 'border-violet-500 bg-violet-500/10' : 'border-white/5 hover:border-white/20'}`}
              onClick={() => !selectedId && handleVote(option.id)}
            >
              <div className="aspect-[4/5] w-full relative">
                <img 
                  src={option.image_url} 
                  alt={`Option ${i+1}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent" />
                
                <div className="absolute bottom-0 left-0 w-full p-3 sm:p-4 opacity-100 sm:opacity-0 sm:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <Button 
                    className={`w-full rounded-xl font-bold border-0 ${selectedId === option.id ? 'bg-violet-500 text-white' : 'bg-white text-black hover:bg-gray-200'}`}
                  >
                    {selectedId === option.id ? 'Choisi !' : 'Voter'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="mt-8 text-center flex flex-col items-center gap-4 text-white/40 text-sm">
        <p>{totalVotes} votes pour le moment</p>
        <Link href="/" className="underline decoration-white/20 underline-offset-4 hover:text-white/60 transition-colors">
          Créer mon propre sondage
        </Link>
      </footer>
    </div>
  );
}
