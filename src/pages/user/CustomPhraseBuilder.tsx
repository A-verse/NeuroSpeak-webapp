import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MobileLayout from "@/components/MobileLayout";
import { ArrowLeft, Plus, Trash2, Volume2, Sparkles, Check, Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";
import { useTTS } from "@/hooks/useTTS";
import { useApp } from "@/contexts/AppContext";

const iconOptions = ["💬", "💊", "🍽️", "💧", "😊", "😢", "🆘", "🛁", "🌙", "❤️", "🎵", "📞"];
const categoryOptions = ["Food", "Health", "Emotions", "Needs", "Activities", "Custom"];

const CUSTOM_PHRASES_KEY = "neurospeak_custom_phrases";

interface CustomPhrase {
  id: number;
  text: string;
  icon: string;
  category: string;
}

const CustomPhraseBuilder = () => {
  const navigate = useNavigate();
  const { speechRate } = useApp();
  const tts = useTTS({ rate: speechRate });
  const [phrases, setPhrases] = useState<CustomPhrase[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [newIcon, setNewIcon] = useState("💬");
  const [newCategory, setNewCategory] = useState("Custom");

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_PHRASES_KEY);
      if (stored) {
        setPhrases(JSON.parse(stored));
      } else {
        const defaults: CustomPhrase[] = [
          { id: 1, text: "I want my medicine", icon: "💊", category: "Health" },
          { id: 2, text: "Can we go outside?", icon: "🌙", category: "Activities" },
          { id: 3, text: "I miss you", icon: "❤️", category: "Emotions" },
        ];
        setPhrases(defaults);
        localStorage.setItem(CUSTOM_PHRASES_KEY, JSON.stringify(defaults));
      }
    } catch {
      setPhrases([]);
    }
  }, []);

  // Persist to localStorage
  const persist = (updated: CustomPhrase[]) => {
    setPhrases(updated);
    localStorage.setItem(CUSTOM_PHRASES_KEY, JSON.stringify(updated));
  };

  const addPhrase = () => {
    if (!newText.trim()) return;
    haptics.success();
    const updated = [
      ...phrases,
      { id: Date.now(), text: newText.trim(), icon: newIcon, category: newCategory },
    ];
    persist(updated);
    setNewText("");
    setNewIcon("💬");
    setNewCategory("Custom");
    setIsAdding(false);
  };

  const removePhrase = (id: number) => {
    haptics.medium();
    persist(phrases.filter((p) => p.id !== id));
  };

  const startEdit = (phrase: CustomPhrase) => {
    haptics.light();
    setEditingId(phrase.id);
    setEditText(phrase.text);
  };

  const saveEdit = (id: number) => {
    if (!editText.trim()) return;
    haptics.success();
    persist(phrases.map((p) => (p.id === id ? { ...p, text: editText.trim() } : p)));
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const speakPhrase = (text: string) => {
    haptics.light();
    tts.speak(text);
  };


  return (
    <MobileLayout role="user">
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="text-primary">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground flex-1">Custom Phrases</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              haptics.light();
              setIsAdding(true);
            }}
            className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-card"
          >
            <Plus className="h-5 w-5 text-primary-foreground" />
          </motion.button>
        </div>

        <p className="text-sm text-muted-foreground mb-5">
          Create personalized phrases — they appear in your Communication Board automatically
        </p>

        {/* Add new phrase form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-5 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">New Phrase</span>
              </div>

              <Input
                placeholder="Type your phrase..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="h-14 rounded-xl bg-card border-border text-base mb-3"
                autoFocus
              />

              <p className="text-xs text-muted-foreground font-medium mb-2">Choose an icon</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => {
                      haptics.light();
                      setNewIcon(icon);
                    }}
                    className={`h-10 w-10 rounded-lg border text-lg flex items-center justify-center transition-all ${
                      newIcon === icon
                        ? "border-primary bg-primary/10 scale-110"
                        : "border-border bg-card"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground font-medium mb-2">Category</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      haptics.light();
                      setNewCategory(cat);
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                      newCategory === cat
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setIsAdding(false)}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addPhrase}
                  disabled={!newText.trim()}
                  className="flex-1 h-12 rounded-xl bg-gradient-primary text-primary-foreground"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Add Phrase
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phrases list */}
        <div className="flex flex-col gap-3">
          {phrases.map((phrase, i) => (
            <motion.div
              key={phrase.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              layout
              className="rounded-xl bg-card p-4 shadow-card border border-border"
            >
              {editingId === phrase.id ? (
                /* ── Edit mode ── */
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{phrase.icon}</span>
                    <span className="text-xs text-muted-foreground">{phrase.category}</span>
                  </div>
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="h-11 rounded-xl bg-muted border-border text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(phrase.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEdit}
                      className="flex-1 h-9 rounded-lg border border-border text-sm font-medium text-muted-foreground flex items-center justify-center gap-1"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(phrase.id)}
                      disabled={!editText.trim()}
                      className="flex-1 h-9 rounded-lg bg-gradient-primary text-sm font-medium text-primary-foreground flex items-center justify-center gap-1 disabled:opacity-40"
                    >
                      <Check className="h-3.5 w-3.5" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Normal mode ── */
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{phrase.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground text-sm truncate">{phrase.text}</p>
                    <p className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full w-fit mt-1">
                      {phrase.category}
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => speakPhrase(phrase.text)}
                    aria-label="Speak phrase"
                    className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"
                  >
                    <Volume2 className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => startEdit(phrase)}
                    aria-label="Edit phrase"
                    className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removePhrase(phrase.id)}
                    aria-label="Delete phrase"
                    className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {phrases.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No custom phrases yet</p>
            <p className="text-sm text-muted-foreground mt-1">Tap + to create your first phrase</p>
          </motion.div>
        )}
      </div>
    </MobileLayout>
  );
};

export default CustomPhraseBuilder;
