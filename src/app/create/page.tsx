"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ImagePlus, X, Rocket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [images, setImages] = useState<{ id: string; url: string; file: File }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newImages = filesArray.map((file) => ({
        id: Math.random().toString(36).substring(7),
        url: URL.createObjectURL(file), // for preview
        file,
      }));
      setImages((prev) => [...prev, ...newImages].slice(0, 4)); // Max 4
    }
  };

  const removeImage = (id: string) => {
    // Note: URL.revokeObjectURL would be cleaner, but this is fine for now
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length < 2) return;
    
    setIsSubmitting(true);
    try {
      // 1. Generate short_id
      const shortId = Math.random().toString(36).substring(2, 8);

      // 2. Import supabase (dynamic import or normal import at top. Let's do normal import but we must add it at the top of file)
      const { supabase } = await import('@/lib/supabase');

      // 3. Create Poll
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({ short_id: shortId, question })
        .select()
        .single();
        
      if (pollError) throw pollError;
      const pollId = pollData.id;

      // 4. Upload Images
      const uploadedUrls = await Promise.all(
        images.map(async (img, index) => {
          const ext = img.file.name.split('.').pop();
          const filePath = `${shortId}/${index}-${Date.now()}.${ext}`;
          
          const { error: uploadError } = await supabase.storage
            .from('poll-images')
            .upload(filePath, img.file);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('poll-images')
            .getPublicUrl(filePath);

          return publicUrlData.publicUrl;
        })
      );

      // 5. Insert Options
      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(
          uploadedUrls.map((url, index) => ({
            poll_id: pollId,
            image_url: url,
            position: index,
          }))
        );

      if (optionsError) throw optionsError;

      // 6. Redirect to poll page
      router.push(`/poll/${shortId}`);
    } catch (error) {
      console.error("Error creating poll:", error);
      alert("Une erreur est survenue lors de la création du sondage.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-dvh flex flex-col p-4">
      {/* Background blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-pink-500/10 blur-[100px]" />
      </div>

      <header className="flex items-center mb-8 mt-2">
        <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white/70">
          <Link href="/">
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <h1 className="text-xl font-bold ml-2">Créer un sondage</h1>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto flex flex-col gap-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          <div className="space-y-3">
            <label className="text-sm font-medium pl-1 text-white/80">Ta question</label>
            <Input
              type="text"
              placeholder="Ex: Quelle chaussure je prends ?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-white/5 border-white/10 text-lg py-6 px-5 rounded-2xl placeholder:text-white/20 focus-visible:ring-violet-500 shadow-inner"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end pl-1">
              <label className="text-sm font-medium text-white/80">
                Choix ({images.length}/4)
              </label>
              <span className="text-xs text-white/40">Min. 2 photos</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence>
                {images.map((img) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square rounded-2xl overflow-hidden glass border-white/10 group bg-cover bg-center"
                    style={{ backgroundImage: `url(${img.url})` }}
                  >
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-black transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-violet-500/50 rounded-2xl transition-colors pointer-events-none" />
                  </motion.div>
                ))}
              </AnimatePresence>

              {images.length < 4 && (
                <motion.div
                  layout
                  className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-violet-500/50 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-white/40 hover:text-violet-300"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus size={28} />
                  <span className="text-xs font-medium">Ajouter</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </motion.div>
              )}
            </div>
          </div>

          <div className="mt-4 pb-10">
            <Button
              type="submit"
              disabled={images.length < 2 || !question.trim() || isSubmitting}
              className="w-full h-14 rounded-2xl text-base font-bold bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:bg-white/10 disabled:text-white/30 transition-all flex border-0 items-center justify-center gap-2"
            >
              <Rocket size={18} className={isSubmitting ? "animate-pulse" : ""} />
              {isSubmitting ? "Création en cours..." : "Lancer le sondage"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
