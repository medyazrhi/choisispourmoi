"use client";

import { motion } from "framer-motion";
import { Share2, Crown, ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [pollData, setPollData] = useState<{ id: string; question: string; totalVotes: number; options: { id: string; image_url: string; votes: number }[] } | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
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

        const { data: votes, error: votesError } = await supabase
          .from('votes')
          .select('option_id')
          .in('option_id', options.map(o => o.id));

        if (votesError) throw votesError;

        let totalVotes = 0;
        const optionsWithVotes = options.map(opt => {
          const count = votes.filter(v => v.option_id === opt.id).length;
          totalVotes += count;
          return { ...opt, votes: count };
        });

        setPollData({
          ...poll,
          totalVotes,
          options: optionsWithVotes
        });

      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [params.id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Lien des résultats copié !");
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
        <h2 className="text-2xl font-bold mb-2">Erreur</h2>
        <p className="text-white/60 mb-6">Impossible de charger les résultats.</p>
        <Link href="/" className={buttonVariants()}>Retour</Link>
      </div>
    );
  }

  const winner = [...pollData.options].sort((a, b) => b.votes - a.votes)[0];

  return (
    <div className="relative min-h-dvh flex flex-col p-4 md:p-8 max-w-3xl mx-auto">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-pink-500/10 blur-[100px]" />
      </div>

      <header className="flex items-start justify-between mb-8 mt-2">
        <Link href={`/poll/${params.id}`} className={buttonVariants({ variant: "ghost", size: "icon", className: "rounded-full hover:bg-white/10 text-white/70" })}>
          <ArrowLeft size={20} />
        </Link>
        <div className="text-center flex-1 pr-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs font-semibold mb-3 border border-violet-500/30"
          >
            Résultats Live
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 tracking-tight text-balance"
          >
            {pollData.question}
          </motion.h1>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {pollData.options.map((option: { id: string; image_url: string; votes: number }, i: number) => {
            const isWinner = option.id === winner?.id && option.votes > 0;
            const percentage = pollData.totalVotes === 0 ? 0 : Math.round((option.votes / pollData.totalVotes) * 100);

            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className={`relative rounded-3xl overflow-hidden glass ${isWinner ? 'border-2 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.2)]' : 'border border-white/10'}`}
              >
                <div className="aspect-[4/5] w-full relative">
                  <img 
                    src={option.image_url} 
                    alt={`Option ${i+1}`}
                    className={`w-full h-full object-cover ${isWinner ? '' : 'filter grayscale-[30%]'}`}
                  />
                  
                  {isWinner && (
                    <div className="absolute -top-3 -right-3 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg transform rotate-12 z-10 border-4 border-[#0F011E]">
                      <Crown size={24} className="text-yellow-900" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col">
                    <div className="flex justify-between items-end mb-2">
                      <span className={`text-4xl font-black ${isWinner ? 'text-yellow-400' : 'text-white'}`}>
                        {percentage}%
                      </span>
                      <span className="text-white/60 text-sm font-medium pb-1">
                        {option.votes} votes
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${isWinner ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-white/40'}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center mt-4">
          <Button 
            onClick={handleShare}
            size="lg"
            className="rounded-2xl px-8 flex items-center gap-2 bg-white text-black hover:bg-gray-200 font-bold border-0 shadow-xl"
          >
            <Share2 size={18} />
            Partager les résultats
          </Button>
        </div>
      </main>

      <footer className="mt-10 text-center text-white/30 text-xs">
        <p>Total de {pollData.totalVotes} votes</p>
      </footer>
    </div>
  );
}
