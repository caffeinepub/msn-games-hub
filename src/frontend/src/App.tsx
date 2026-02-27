import { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap, Settings, Search, ChevronDown, X, Check, Monitor,
  Gamepad2, ExternalLink, Heart, Star, Clock, Trophy,
  Flame, Sparkles, MessageCircle, Send, Loader2, UserCircle, Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useActor } from "@/hooks/useActor";

// ─── Types ────────────────────────────────────────────────────────────────────

type GameCategory =
  | "All"
  | "Favorites"
  | "Recent"
  | "IO"
  | "Action"
  | "Shooting"
  | "Arcade"
  | "Puzzle"
  | "Card"
  | "Sports"
  | "Word"
  | "Racing"
  | "Casual"
  | "Classic"
  | "Strategy"
  | "Multiplayer";

interface Game {
  id: string;
  title: string;
  category: Exclude<GameCategory, "All" | "Favorites" | "Recent">;
  embedUrl: string;
  seed: number;
  featured?: boolean;
  popular?: boolean;
  isNew?: boolean;
  description?: string;
}

interface CloakPreset {
  id: string;
  title: string;
  faviconUrl: string;
  emoji: string;
  color: string;
}

type BackgroundTheme =
  | "default"
  | "space"
  | "ocean"
  | "forest"
  | "sunset"
  | "neon"
  | "paper"
  | "pastel"
  | "minecraft"
  | "aurora"
  | "cotton-candy"
  | "cyberpunk"
  | "custom";

interface AppSettings {
  cloakPresetId: string | null;
  customCloakTitle: string;
  customCloakFavicon: string;
  backgroundTheme: BackgroundTheme;
  customBgColor: string;
  panicUrl: string;
  showPanicButton: boolean;
}

// ─── Chat Types ───────────────────────────────────────────────────────────────

interface ChatMessage {
  id: bigint;
  text: string;
  sender: string;
  timestamp: bigint;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "msn-games-settings";
const FAVORITES_KEY = "msn-games-favorites";
const RECENT_KEY = "msn-games-recent";
const USERNAME_KEY = "msn-username";
const MAX_RECENT = 8;

const DEFAULT_SETTINGS: AppSettings = {
  cloakPresetId: null,
  customCloakTitle: "",
  customCloakFavicon: "",
  backgroundTheme: "default",
  customBgColor: "#e8f0ff",
  panicUrl: "https://classroom.google.com",
  showPanicButton: true,
};

const GAMES: Game[] = [
  // ── IO Games ──────────────────────────────────────────────
  { id: "poxel-io", title: "Poxel.io", category: "IO", embedUrl: "https://poxel.io", seed: 5, popular: true, isNew: true, description: "Multiplayer pixel battle royale" },
  { id: "agar-io", title: "Agar.io", category: "IO", embedUrl: "https://agar.io", seed: 11, featured: true, popular: true, description: "Eat cells, grow bigger" },
  { id: "slither-io", title: "Slither.io", category: "IO", embedUrl: "https://slither.io", seed: 22, featured: true, popular: true, description: "Snake multiplayer online" },
  { id: "diep-io", title: "Diep.io", category: "IO", embedUrl: "https://diep.io", seed: 33, popular: true, description: "Tank shooter io game" },
  { id: "paper-io-2", title: "Paper.io 2", category: "IO", embedUrl: "https://poki.com/embed/paper-io-2", seed: 44, popular: true, description: "Claim territory" },
  { id: "krunker", title: "Krunker.io", category: "IO", embedUrl: "https://krunker.io", seed: 55, featured: true, popular: true, description: "Fast FPS io game" },
  { id: "skribbl-io", title: "Skribbl.io", category: "IO", embedUrl: "https://skribbl.io", seed: 66, popular: true, description: "Draw and guess multiplayer" },
  { id: "wormate-io", title: "Wormate.io", category: "IO", embedUrl: "https://wormate.io", seed: 77, isNew: true, description: "Cute worm io game" },
  { id: "stabfish-io", title: "Stabfish.io", category: "IO", embedUrl: "https://stabfish.io", seed: 88, isNew: true, description: "Stab fish io battle" },
  { id: "superhex-io", title: "Superhex.io", category: "IO", embedUrl: "https://superhex.io", seed: 99, description: "Hexagonal territory io" },
  { id: "wings-io", title: "Wings.io", category: "IO", embedUrl: "https://poki.com/embed/wings-io", seed: 110, popular: true, description: "Aerial combat io" },
  { id: "zombsroyale", title: "Zombs Royale", category: "IO", embedUrl: "https://zombsroyale.io", seed: 121, featured: true, popular: true, description: "Battle royale io game" },
  { id: "territorial-io", title: "Territorial.io", category: "IO", embedUrl: "https://territorial.io", seed: 132, isNew: true, description: "Territory conquest" },
  { id: "deeeep-io", title: "Deeeep.io", category: "IO", embedUrl: "https://deeeep.io", seed: 143, description: "Ocean evolution io" },
  { id: "surviv-io", title: "Surviv.io", category: "IO", embedUrl: "https://surviv.io", seed: 154, popular: true, description: "2D battle royale io" },

  // ── Action ────────────────────────────────────────────────
  { id: "temple-run-2", title: "Temple Run 2", category: "Action", embedUrl: "https://poki.com/embed/temple-run-2", seed: 165, featured: true, popular: true, description: "Endless runner classic" },
  { id: "moto-x3m", title: "Moto X3M", category: "Racing", embedUrl: "https://poki.com/embed/moto-x3m", seed: 176, featured: true, popular: true, description: "Extreme motorcycle racing" },
  { id: "vex-5", title: "Vex 5", category: "Action", embedUrl: "https://poki.com/embed/vex-5", seed: 187, popular: true, description: "Stickman obstacle course" },
  { id: "rooftop-snipers", title: "Rooftop Snipers", category: "Shooting", embedUrl: "https://poki.com/embed/rooftop-snipers", seed: 198, popular: true, description: "2 player sniper duel" },
  { id: "combat-online", title: "Combat Online", category: "Shooting", embedUrl: "https://poki.com/embed/combat-online", seed: 209, description: "Online shooter game" },
  { id: "stickman-hook", title: "Stickman Hook", category: "Action", embedUrl: "https://poki.com/embed/stickman-hook", seed: 220, popular: true, description: "Swing through levels" },
  { id: "bob-the-robber", title: "Bob The Robber", category: "Action", embedUrl: "https://poki.com/embed/bob-the-robber", seed: 231, popular: true, description: "Stealth robbery game" },
  { id: "drift-boss", title: "Drift Boss", category: "Racing", embedUrl: "https://poki.com/embed/drift-boss", seed: 242, popular: true, description: "One-tap drift racing" },
  { id: "drift-hunters", title: "Drift Hunters", category: "Racing", embedUrl: "https://poki.com/embed/drift-hunters", seed: 253, popular: true, description: "3D drift simulation" },

  // ── Shooting ──────────────────────────────────────────────
  { id: "shell-shockers", title: "Shell Shockers", category: "Shooting", embedUrl: "https://shellshock.io", seed: 264, featured: true, popular: true, description: "Egg-based FPS shooter" },
  { id: "1v1-lol", title: "1v1.LOL", category: "Shooting", embedUrl: "https://1v1.lol", seed: 275, featured: true, popular: true, description: "Build and shoot battle" },
  { id: "bullet-force", title: "Bullet Force", category: "Shooting", embedUrl: "https://poki.com/embed/bullet-force-multiplayer", seed: 286, popular: true, description: "3D multiplayer FPS" },
  { id: "smash-karts", title: "Smash Karts", category: "Multiplayer", embedUrl: "https://smashkarts.io", seed: 297, featured: true, popular: true, description: "Kart battle arena" },

  // ── Arcade/Casual ─────────────────────────────────────────
  { id: "subway-surfers", title: "Subway Surfers", category: "Arcade", embedUrl: "https://poki.com/embed/subway-surfers", seed: 308, featured: true, popular: true, description: "Endless runner on subway" },
  { id: "crossy-road", title: "Crossy Road", category: "Arcade", embedUrl: "https://poki.com/embed/crossy-road", seed: 319, popular: true, description: "Hop across traffic" },
  { id: "slope", title: "Slope", category: "Arcade", embedUrl: "https://slope-game.github.io", seed: 330, featured: true, popular: true, description: "Roll down endless slope" },
  { id: "dino-game", title: "Dino Game", category: "Classic", embedUrl: "https://chromedino.com", seed: 341, featured: true, popular: true, description: "Chrome dino runner" },
  { id: "geometry-dash", title: "Geometry Dash", category: "Arcade", embedUrl: "https://poki.com/embed/geometry-dash-meltdown", seed: 352, popular: true, description: "Rhythm-based platformer" },
  { id: "snake", title: "Snake", category: "Classic", embedUrl: "https://poki.com/embed/snake", seed: 363, popular: true, description: "Classic snake game" },
  { id: "pacman", title: "Pac-Man", category: "Classic", embedUrl: "https://poki.com/embed/pac-man", seed: 374, featured: true, popular: true, description: "Classic arcade legend" },
  { id: "tetris", title: "Tetris", category: "Classic", embedUrl: "https://poki.com/embed/tetris", seed: 385, featured: true, popular: true, description: "Block stacking classic" },
  { id: "flappy-bird", title: "Flappy Bird", category: "Casual", embedUrl: "https://flappybird.io", seed: 396, popular: true, description: "Tap to fly through pipes" },
  { id: "bouncy-rush", title: "Bouncy Rush", category: "Casual", embedUrl: "https://poki.com/embed/bouncy-rush", seed: 407, isNew: true, description: "Bounce through obstacles" },
  { id: "stack", title: "Stack", category: "Casual", embedUrl: "https://poki.com/embed/stack", seed: 418, popular: true, description: "Stack blocks perfectly" },
  { id: "count-masters", title: "Count Masters", category: "Casual", embedUrl: "https://poki.com/embed/count-masters-crowd-smash", seed: 429, isNew: true, description: "Crowd running battle" },
  { id: "roller-baller", title: "Roller Baller", category: "Arcade", embedUrl: "https://poki.com/embed/roller-baller", seed: 440, description: "Roll the ball to goal" },

  // ── Puzzle ────────────────────────────────────────────────
  { id: "fireboy-watergirl", title: "Fireboy & Watergirl", category: "Puzzle", embedUrl: "https://poki.com/embed/fireboy-and-watergirl-in-the-forest-temple", seed: 451, featured: true, popular: true, description: "Two-player puzzle adventure" },
  { id: "cut-the-rope", title: "Cut the Rope", category: "Puzzle", embedUrl: "https://poki.com/embed/cut-the-rope-remastered", seed: 462, popular: true, description: "Feed candy to Om Nom" },
  { id: "2048", title: "2048", category: "Puzzle", embedUrl: "https://poki.com/embed/2048", seed: 473, popular: true, description: "Merge tiles to 2048" },
  { id: "sudoku", title: "Sudoku", category: "Puzzle", embedUrl: "https://poki.com/embed/sudoku", seed: 484, description: "Number placement puzzle" },
  { id: "mahjong", title: "Mahjong Classic", category: "Puzzle", embedUrl: "https://poki.com/embed/mahjong-classic", seed: 495, popular: true, description: "Tile matching classic" },
  { id: "jigsaw-puzzles", title: "Jigsaw Puzzles", category: "Puzzle", embedUrl: "https://poki.com/embed/jigsaw-puzzles-epic", seed: 506, description: "Epic jigsaw collection" },
  { id: "word-wipe", title: "Word Wipe", category: "Word", embedUrl: "https://poki.com/embed/word-wipe", seed: 517, popular: true, description: "Wipe words from board" },
  { id: "unblock-it", title: "Unblock It", category: "Puzzle", embedUrl: "https://poki.com/embed/unblock-it", seed: 528, description: "Slide blocks to escape" },
  { id: "bubble-shooter", title: "Bubble Shooter", category: "Arcade", embedUrl: "https://poki.com/embed/bubble-shooter", seed: 539, popular: true, description: "Pop colored bubbles" },
  { id: "zuma-deluxe", title: "Zuma Deluxe", category: "Arcade", embedUrl: "https://poki.com/embed/zuma-deluxe", seed: 550, popular: true, description: "Aztec frog ball shooter" },

  // ── Card/Board ────────────────────────────────────────────
  { id: "solitaire", title: "Solitaire", category: "Card", embedUrl: "https://poki.com/embed/solitaire", seed: 561, featured: true, popular: true, description: "Classic card solitaire" },
  { id: "spider-solitaire", title: "Spider Solitaire", category: "Card", embedUrl: "https://poki.com/embed/spider-solitaire", seed: 572, popular: true, description: "Two-suit card patience" },
  { id: "freecell", title: "FreeCell", category: "Card", embedUrl: "https://poki.com/embed/freecell", seed: 583, description: "Strategic card game" },
  { id: "klondike-solitaire", title: "Klondike Solitaire", category: "Card", embedUrl: "https://poki.com/embed/klondike-solitaire", seed: 594, popular: true, description: "Classic klondike variant" },
  { id: "hearts", title: "Hearts", category: "Card", embedUrl: "https://poki.com/embed/hearts", seed: 605, description: "Classic hearts card game" },
  { id: "chess", title: "Chess", category: "Strategy", embedUrl: "https://poki.com/embed/chess", seed: 616, popular: true, description: "Classic chess online" },
  { id: "checkers", title: "Checkers", category: "Strategy", embedUrl: "https://poki.com/embed/checkers", seed: 627, description: "Classic checkers board" },

  // ── Sports ────────────────────────────────────────────────
  { id: "8-ball-pool", title: "8 Ball Pool", category: "Sports", embedUrl: "https://poki.com/embed/8-ball-pool", seed: 638, featured: true, popular: true, description: "Online pool billiards" },
  { id: "basketball-stars", title: "Basketball Stars", category: "Sports", embedUrl: "https://poki.com/embed/basketball-stars", seed: 649, popular: true, description: "Street basketball 1v1" },
  { id: "soccer-skills", title: "Soccer Skills Euro Cup", category: "Sports", embedUrl: "https://poki.com/embed/soccer-skills-euro-cup", seed: 660, isNew: true, description: "Euro cup soccer skills" },
  { id: "mini-golf", title: "Mini Golf", category: "Sports", embedUrl: "https://poki.com/embed/mini-golf", seed: 671, popular: true, description: "Miniature golf courses" },
  { id: "baseball-pro", title: "Baseball Pro", category: "Sports", embedUrl: "https://poki.com/embed/baseball-pro", seed: 682, description: "Baseball batting game" },
  { id: "penalty-shooters", title: "Penalty Shooters", category: "Sports", embedUrl: "https://poki.com/embed/penalty-shooters-2", seed: 693, popular: true, description: "Soccer penalty kicks" },

  // ── Word/Trivia ───────────────────────────────────────────
  { id: "word-search", title: "Word Search", category: "Word", embedUrl: "https://poki.com/embed/word-search", seed: 704, popular: true, description: "Find hidden words" },
  { id: "crossword", title: "Daily Crossword", category: "Word", embedUrl: "https://poki.com/embed/daily-crossword", seed: 715, description: "Daily crossword puzzle" },
  { id: "wordle", title: "Wordle Unlimited", category: "Word", embedUrl: "https://poki.com/embed/wordle-unlimited", seed: 726, popular: true, isNew: true, description: "Guess the 5-letter word" },

  // ── Strategy/Multiplayer ──────────────────────────────────
  { id: "among-us", title: "Among Us Online", category: "Multiplayer", embedUrl: "https://poki.com/embed/among-us-online-edition", seed: 737, featured: true, popular: true, description: "Find the imposter" },
  { id: "gold-miner", title: "Gold Miner Classic", category: "Casual", embedUrl: "https://poki.com/embed/gold-miner-classic", seed: 748, popular: true, description: "Mine gold with a claw" },
  { id: "tower-defense", title: "Kingdom Rush", category: "Strategy", embedUrl: "https://poki.com/embed/kingdom-rush", seed: 759, featured: true, popular: true, description: "Epic tower defense" },
  { id: "minecraft-classic", title: "Minecraft Classic", category: "Classic", embedUrl: "https://classic.minecraft.net", seed: 770, featured: true, popular: true, description: "Original Minecraft browser" },

  // ── Additional Popular Games ──────────────────────────────
  { id: "cookie-clicker", title: "Cookie Clicker", category: "Casual", embedUrl: "https://poki.com/embed/cookie-clicker", seed: 781, popular: true, isNew: false, description: "Click to bake cookies" },
  { id: "hungry-shark", title: "Hungry Shark", category: "Action", embedUrl: "https://poki.com/embed/hungry-shark-arena", seed: 792, popular: true, description: "Eat everything as shark" },
  { id: "crazy-roll-3d", title: "Crazy Roll 3D", category: "Arcade", embedUrl: "https://poki.com/embed/crazy-roll-3d", seed: 803, isNew: true, description: "Rolling ball madness" },
  { id: "car-rush", title: "Car Rush", category: "Racing", embedUrl: "https://poki.com/embed/car-rush", seed: 814, isNew: true, description: "Dodge traffic and race" },
  { id: "head-soccer", title: "Head Soccer", category: "Sports", embedUrl: "https://poki.com/embed/head-soccer", seed: 825, popular: true, description: "Big head soccer game" },
  { id: "tower-of-colors", title: "Tower of Colors", category: "Puzzle", embedUrl: "https://poki.com/embed/tower-of-colors", seed: 836, isNew: true, description: "Color matching tower" },
  { id: "run-3", title: "Run 3", category: "Arcade", embedUrl: "https://poki.com/embed/run-3", seed: 847, featured: true, popular: true, description: "Run through space tunnels" },
  { id: "happy-wheels", title: "Happy Wheels", category: "Action", embedUrl: "https://poki.com/embed/happy-wheels", seed: 858, popular: true, description: "Wacky physics game" },
  { id: "tank-trouble", title: "Tank Trouble", category: "Shooting", embedUrl: "https://poki.com/embed/tank-trouble", seed: 869, popular: true, description: "Multiplayer tank maze" },
  { id: "ultimate-chess", title: "Ultimate Chess", category: "Strategy", embedUrl: "https://poki.com/embed/ultimate-chess", seed: 880, description: "Advanced chess game" },
  { id: "stickman-archer", title: "Stickman Archer", category: "Action", embedUrl: "https://poki.com/embed/stickman-archer-online", seed: 891, isNew: true, description: "Archery battle game" },
  { id: "mario-kart-tour", title: "Racing Fury", category: "Racing", embedUrl: "https://poki.com/embed/racing-fury", seed: 902, isNew: true, description: "Intense kart racing" },
  { id: "dirt-bike", title: "Dirt Bike", category: "Racing", embedUrl: "https://poki.com/embed/dirt-bike-3", seed: 913, popular: true, description: "Off-road dirt biking" },
];

const CLOAK_PRESETS: CloakPreset[] = [
  { id: "google-docs", title: "Google Docs", faviconUrl: "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico", emoji: "📄", color: "#1a73e8" },
  { id: "khan-academy", title: "Khan Academy", faviconUrl: "https://cdn.kastatic.org/images/favicon.ico", emoji: "🎓", color: "#14bf96" },
  { id: "google-classroom", title: "Google Classroom", faviconUrl: "https://ssl.gstatic.com/classroom/favicon.png", emoji: "🏫", color: "#1e8e3e" },
  { id: "youtube", title: "YouTube", faviconUrl: "https://www.youtube.com/favicon.ico", emoji: "▶️", color: "#ff0000" },
  { id: "wikipedia", title: "Wikipedia", faviconUrl: "https://www.wikipedia.org/favicon.ico", emoji: "📚", color: "#000000" },
  { id: "bing", title: "Bing", faviconUrl: "https://www.bing.com/favicon.ico", emoji: "🔍", color: "#008373" },
  { id: "google-drive", title: "Google Drive", faviconUrl: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png", emoji: "💾", color: "#1fa463" },
  { id: "quizlet", title: "Quizlet", faviconUrl: "https://quizlet.com/favicon.ico", emoji: "📋", color: "#4255ff" },
  { id: "canvas", title: "Canvas LMS", faviconUrl: "https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico", emoji: "📚", color: "#e66000" },
  { id: "schoology", title: "Schoology", faviconUrl: "https://asset-cdn.schoology.com/sites/all/themes/schoology_theme/favicon.ico", emoji: "🏫", color: "#0770bc" },
  { id: "google-slides", title: "Google Slides", faviconUrl: "https://ssl.gstatic.com/docs/presentations/images/favicon5.ico", emoji: "📊", color: "#fbbc04" },
  { id: "duolingo", title: "Duolingo", faviconUrl: "https://d35aaqx5ub95lt.cloudfront.net/favicon.ico", emoji: "🦜", color: "#58cc02" },
  { id: "google-forms", title: "Google Forms", faviconUrl: "https://ssl.gstatic.com/docs/spreadsheets/forms/favicon_qp2.png", emoji: "📝", color: "#673ab7" },
  { id: "nearpod", title: "Nearpod", faviconUrl: "https://nearpod.com/favicon.ico", emoji: "📱", color: "#ff7043" },
];

const BACKGROUND_THEMES: { id: BackgroundTheme; label: string; preview: string }[] = [
  { id: "default", label: "Default", preview: "linear-gradient(135deg, #f0f4ff, #eef2ff)" },
  { id: "space", label: "Space", preview: "linear-gradient(135deg, #0a0a1a, #1a0533)" },
  { id: "ocean", label: "Ocean", preview: "linear-gradient(180deg, #0077b6, #90e0ef)" },
  { id: "forest", label: "Forest", preview: "linear-gradient(135deg, #1b4332, #52b788)" },
  { id: "sunset", label: "Sunset", preview: "linear-gradient(135deg, #ff6b6b, #ffcb47)" },
  { id: "neon", label: "Neon City", preview: "linear-gradient(135deg, #0a0015, #0d1b3e)" },
  { id: "paper", label: "Paper", preview: "linear-gradient(135deg, #f5f5dc, #fffef5)" },
  { id: "pastel", label: "Pastel", preview: "linear-gradient(135deg, #ffc8dd, #a2d2ff)" },
  { id: "minecraft", label: "Minecraft", preview: "linear-gradient(135deg, #3d3d3d, #1a1a1a)" },
  { id: "aurora", label: "Aurora", preview: "linear-gradient(135deg, #0d1b2a, #1b4332, #2d6a4f, #0d1b2a)" },
  { id: "cotton-candy", label: "Cotton Candy", preview: "linear-gradient(135deg, #ff9a9e, #fecfef, #a18cd1)" },
  { id: "cyberpunk", label: "Cyberpunk", preview: "linear-gradient(135deg, #ff0080, #7928ca, #4f00bc)" },
  { id: "custom", label: "Custom", preview: "" },
];

const CATEGORY_TABS: GameCategory[] = [
  "All", "Favorites", "Recent", "IO", "Action", "Shooting", "Arcade",
  "Puzzle", "Card", "Sports", "Word", "Racing", "Casual", "Classic",
  "Strategy", "Multiplayer"
];

type NonSpecialCategory = Exclude<GameCategory, "All" | "Favorites" | "Recent">;

const CATEGORY_COLORS: Record<NonSpecialCategory, string> = {
  IO: "badge-io",
  Action: "badge-action",
  Shooting: "badge-shooting",
  Arcade: "badge-arcade",
  Puzzle: "badge-puzzle",
  Card: "badge-card",
  Sports: "badge-sports",
  Word: "badge-word",
  Racing: "badge-racing",
  Casual: "badge-casual",
  Classic: "badge-classic",
  Strategy: "badge-strategy",
  Multiplayer: "badge-multiplayer",
};

const CATEGORY_ICONS: Record<GameCategory, string> = {
  All: "🎮",
  Favorites: "❤️",
  Recent: "🕐",
  IO: "🌐",
  Action: "⚔️",
  Shooting: "🔫",
  Arcade: "🕹️",
  Puzzle: "🧩",
  Card: "🃏",
  Sports: "⚽",
  Word: "📝",
  Racing: "🏎️",
  Casual: "😊",
  Classic: "👾",
  Strategy: "♟️",
  Multiplayer: "👥",
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as AppSettings;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(s: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveFavorites(ids: string[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveRecent(ids: string[]): void {
  localStorage.setItem(RECENT_KEY, JSON.stringify(ids));
}

function addToRecent(gameId: string, currentRecent: string[]): string[] {
  const filtered = currentRecent.filter((id) => id !== gameId);
  return [gameId, ...filtered].slice(0, MAX_RECENT);
}

function updateFavicon(url: string): void {
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
}

function applyCloak(s: AppSettings): void {
  const preset = CLOAK_PRESETS.find((p) => p.id === s.cloakPresetId);
  if (preset) {
    document.title = preset.title;
    updateFavicon(preset.faviconUrl);
  } else if (s.customCloakTitle) {
    document.title = s.customCloakTitle;
    if (s.customCloakFavicon) updateFavicon(s.customCloakFavicon);
  } else {
    document.title = "MSN Games";
  }
}

function getBackgroundClass(theme: BackgroundTheme): string {
  const map: Record<BackgroundTheme, string> = {
    default: "bg-theme-default",
    space: "bg-theme-space",
    ocean: "bg-theme-ocean",
    forest: "bg-theme-forest",
    sunset: "bg-theme-sunset",
    neon: "bg-theme-neon",
    paper: "bg-theme-paper",
    pastel: "bg-theme-pastel",
    minecraft: "bg-theme-minecraft",
    aurora: "bg-theme-aurora",
    "cotton-candy": "bg-theme-cotton-candy",
    cyberpunk: "bg-theme-cyberpunk",
    custom: "",
  };
  return map[theme];
}

function isLightTheme(theme: BackgroundTheme): boolean {
  return ["default", "ocean", "paper", "pastel", "sunset", "cotton-candy"].includes(theme);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// ── Lock Screen ──────────────────────────────────────────────────────────────

function LockScreen({ onEnter }: { onEnter: (name: string) => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name to continue.");
      return;
    }
    onEnter(trimmed);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
            <Gamepad2 className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold font-display text-white">
              <span className="text-blue-300">MSN</span> Games
            </h1>
            <p className="text-blue-200 text-sm mt-1">Your free games hub</p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-400/30">
              <UserCircle className="w-8 h-8 text-blue-200" />
            </div>
            <h2 className="text-2xl font-bold text-white font-display">What is your name?</h2>
            <p className="text-blue-200 text-sm mt-1.5">Used for the chat — say hi to other players!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                maxLength={32}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/25 text-white placeholder:text-blue-300/70 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-sm font-medium"
              />
              {error && <p className="text-red-300 text-xs mt-1.5 text-center">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-bold rounded-xl transition-all text-sm shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              Let&apos;s Play! 🎮
            </button>
          </form>
        </div>

        <p className="text-blue-300/60 text-xs text-center">
          Your name is stored locally on your device
        </p>
      </div>
    </div>
  );
}

// ── Chat Panel ───────────────────────────────────────────────────────────────

function formatChatTime(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface ChatPanelProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

function ChatPanel({ username, isOpen, onClose, isDark }: ChatPanelProps) {
  const { actor } = useActor();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!actor) return;
    try {
      const msgs = await actor.getMessages();
      setMessages(msgs as ChatMessage[]);
    } catch {
      // silently fail on poll
    }
  }, [actor]);

  useEffect(() => {
    if (!isOpen) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    // Initial load with spinner
    setIsLoading(true);
    fetchMessages().finally(() => setIsLoading(false));

    // Poll every 2s
    pollingRef.current = setInterval(fetchMessages, 2000);
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isOpen, fetchMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, scrollToBottom]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isSending || !actor) return;
    setIsSending(true);
    setInputText("");
    try {
      await actor.postMessage(username, trimmed);
      await fetchMessages();
    } catch {
      toast.error("Failed to send message");
      setInputText(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden border",
        "animate-slide-up",
        isDark
          ? "bg-gray-900/95 backdrop-blur-md border-white/10"
          : "bg-white/95 backdrop-blur-md border-gray-200"
      )}
      style={{ height: "420px", maxWidth: "calc(100vw - 32px)" }}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 border-b shrink-0",
        isDark ? "border-white/10 bg-blue-900/30" : "border-gray-100 bg-blue-600"
      )}>
        <div className="flex items-center gap-2.5">
          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center", isDark ? "bg-blue-500/30" : "bg-white/20")}>
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">MSN Chat</h3>
            <p className="text-[10px] text-blue-200">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Close chat"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className={cn("w-6 h-6 animate-spin", isDark ? "text-blue-400" : "text-blue-600")} />
              <span className={cn("text-xs", isDark ? "text-white/60" : "text-gray-500")}>Loading messages...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <MessageCircle className={cn("w-10 h-10 opacity-20", isDark ? "text-white" : "text-gray-400")} />
            <p className={cn("text-sm font-medium", isDark ? "text-white/50" : "text-gray-400")}>No messages yet</p>
            <p className={cn("text-xs", isDark ? "text-white/30" : "text-gray-300")}>Be the first to say hi! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender === username;
            return (
              <div
                key={String(msg.id)}
                className={cn("flex flex-col gap-0.5", isOwn ? "items-end" : "items-start")}
              >
                <span className={cn("text-[10px] font-semibold px-1", isDark ? "text-white/50" : "text-gray-400")}>
                  {msg.sender}
                </span>
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words shadow-sm",
                  isOwn
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : isDark
                      ? "bg-white/10 text-white rounded-tl-sm"
                      : "bg-gray-100 text-gray-800 rounded-tl-sm"
                )}>
                  {msg.text}
                </div>
                <span className={cn("text-[9px] px-1", isDark ? "text-white/30" : "text-gray-300")}>
                  {formatChatTime(msg.timestamp)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={cn("px-3 py-2.5 border-t shrink-0 flex items-center gap-2", isDark ? "border-white/10" : "border-gray-100")}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          maxLength={500}
          className={cn(
            "flex-1 px-3 py-2 rounded-xl text-sm outline-none transition-all",
            isDark
              ? "bg-white/10 border border-white/15 text-white placeholder:text-white/40 focus:ring-1 focus:ring-blue-500"
              : "bg-gray-100 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500"
          )}
          disabled={isSending}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!inputText.trim() || isSending}
          className="w-9 h-9 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
          aria-label="Send message"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
}

function GameCard({ game, onPlay, isFavorite, onToggleFavorite }: GameCardProps) {
  return (
    <article className="game-card group relative bg-card rounded-xl overflow-hidden border border-border shadow-card">
      <button
        type="button"
        className="relative overflow-hidden cursor-pointer w-full p-0 border-0 bg-transparent block"
        onClick={() => onPlay(game)}
        aria-label={`Play ${game.title}`}
      >
        <img
          src={`https://picsum.photos/seed/${game.seed}/400/220`}
          alt={game.title}
          className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges overlay */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
          {game.featured && (
            <span className="bg-msn-orange text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full font-display leading-tight flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-white" /> Featured
            </span>
          )}
          {game.isNew && !game.featured && (
            <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full font-display leading-tight flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> New
            </span>
          )}
          {game.popular && !game.featured && !game.isNew && (
            <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full font-display leading-tight flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5" /> Hot
            </span>
          )}
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg">
              <Gamepad2 className="w-5 h-5 text-msn-blue" />
            </div>
          </div>
        </div>
      </button>

      {/* Favorite button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(game.id);
        }}
        className={cn(
          "absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm z-10",
          isFavorite
            ? "bg-red-500 text-white"
            : "bg-black/40 text-white/80 hover:bg-red-500 hover:text-white backdrop-blur-sm"
        )}
        aria-label={isFavorite ? `Remove ${game.title} from favorites` : `Add ${game.title} to favorites`}
      >
        <Heart className={cn("w-3 h-3", isFavorite && "fill-white")} />
      </button>

      <div className="p-2.5">
        <div className="flex items-start justify-between gap-1.5 mb-1.5">
          <h3 className="font-semibold text-xs text-card-foreground font-display leading-tight line-clamp-1">
            {game.title}
          </h3>
          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0", CATEGORY_COLORS[game.category])}>
            {game.category}
          </span>
        </div>
        {game.description && (
          <p className="text-[10px] text-muted-foreground line-clamp-1 mb-1.5">{game.description}</p>
        )}
        <Button
          type="button"
          size="sm"
          className="w-full bg-msn-blue hover:bg-msn-blue-dark text-white text-[11px] font-semibold h-6"
          onClick={() => onPlay(game)}
        >
          Play Now
        </Button>
      </div>
    </article>
  );
}

function RecentCard({ game, onPlay }: { game: Game; onPlay: (game: Game) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPlay(game)}
      className="recent-card shrink-0 w-28 flex flex-col items-center gap-1.5 p-2 rounded-xl border border-border bg-card hover:border-msn-blue/50 hover:bg-accent/30 transition-all group"
    >
      <img
        src={`https://picsum.photos/seed/${game.seed}/200/120`}
        alt={game.title}
        className="w-full h-14 object-cover rounded-lg"
      />
      <span className="text-[10px] font-semibold text-card-foreground text-center leading-tight line-clamp-2 font-display">
        {game.title}
      </span>
    </button>
  );
}

function GameModal({ game, onClose }: { game: Game; onClose: () => void }) {
  return (
    <div className="game-overlay fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-msn-blue rounded-lg flex items-center justify-center">
            <Gamepad2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm font-display">{game.title}</h2>
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", CATEGORY_COLORS[game.category])}>
              {game.category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={game.embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded hover:bg-gray-700"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded hover:bg-gray-700"
            aria-label="Close game"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex-1 relative">
        <iframe
          src={game.embedUrl}
          title={game.title}
          className="w-full h-full border-0"
          allow="fullscreen; autoplay; encrypted-media"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock allow-top-navigation"
        />
      </div>
    </div>
  );
}

function CloakTab({ settings, onChange }: { settings: AppSettings; onChange: (u: Partial<AppSettings>) => void }) {
  const selectedPreset = CLOAK_PRESETS.find((p) => p.id === settings.cloakPresetId);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground font-display mb-1">Tab Disguise</h3>
        <p className="text-sm text-muted-foreground">Change what your tab looks like — the title and icon update instantly.</p>
      </div>

      {(settings.cloakPresetId || settings.customCloakTitle) && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm text-green-700 dark:text-green-300 font-medium">
            Cloak active: &quot;{selectedPreset?.title ?? settings.customCloakTitle}&quot;
          </span>
        </div>
      )}

      <div>
        <Label className="text-sm font-semibold mb-3 block">Quick Presets ({CLOAK_PRESETS.length} sites)</Label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {CLOAK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={cn(
                "cloak-preset relative flex flex-col items-center gap-1.5 p-2 border-2 rounded-xl",
                settings.cloakPresetId === preset.id
                  ? "selected border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              )}
              onClick={() => {
                onChange({ cloakPresetId: preset.id });
                document.title = preset.title;
                updateFavicon(preset.faviconUrl);
                toast.success(`Cloaked as ${preset.title}`);
              }}
            >
              <img
                src={preset.faviconUrl}
                alt={preset.title}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = "none";
                  const sib = img.nextElementSibling as HTMLElement | null;
                  if (sib) sib.style.display = "block";
                }}
              />
              <span className="hidden text-xl">{preset.emoji}</span>
              <span className="text-[10px] font-semibold text-center text-foreground leading-tight">{preset.title}</span>
              {settings.cloakPresetId === preset.id && (
                <Check className="w-3 h-3 text-primary absolute top-1 right-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border">
        <Label className="text-sm font-semibold">Custom Cloak</Label>
        <div className="space-y-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Tab Title</Label>
            <Input
              placeholder="e.g. My Notes - Google Docs"
              value={settings.customCloakTitle}
              onChange={(e) => onChange({ customCloakTitle: e.target.value, cloakPresetId: null })}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Favicon URL (optional)</Label>
            <Input
              placeholder="https://example.com/favicon.ico"
              value={settings.customCloakFavicon}
              onChange={(e) => onChange({ customCloakFavicon: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          className="bg-msn-blue hover:bg-msn-blue-dark text-white"
          onClick={() => {
            if (settings.customCloakTitle) {
              document.title = settings.customCloakTitle;
              if (settings.customCloakFavicon) updateFavicon(settings.customCloakFavicon);
              toast.success("Custom cloak applied!");
            } else {
              toast.error("Enter a title first");
            }
          }}
        >
          Apply Custom Cloak
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => {
          onChange({ cloakPresetId: null, customCloakTitle: "", customCloakFavicon: "" });
          document.title = "MSN Games";
          updateFavicon("/favicon.ico");
          toast.success("Cloak removed");
        }}
      >
        Remove Cloak
      </Button>
    </div>
  );
}

function BackgroundsTab({ settings, onChange }: { settings: AppSettings; onChange: (u: Partial<AppSettings>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground font-display mb-1">Background Theme</h3>
        <p className="text-sm text-muted-foreground">Customize the look of your games hub. Changes apply immediately.</p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {BACKGROUND_THEMES.filter((t) => t.id !== "custom").map((theme) => (
          <button
            key={theme.id}
            type="button"
            className={cn(
              "bg-preset relative h-16 rounded-xl border-2 transition-all overflow-hidden",
              settings.backgroundTheme === theme.id
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-primary/40"
            )}
            style={{ background: theme.preview }}
            onClick={() => onChange({ backgroundTheme: theme.id })}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-end p-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/50 text-white backdrop-blur">
                {theme.label}
              </span>
            </div>
            {settings.backgroundTheme === theme.id && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </button>
        ))}

        {/* Custom color picker */}
        <div
          className={cn(
            "bg-preset relative h-16 rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center gap-1",
            settings.backgroundTheme === "custom"
              ? "border-primary ring-2 ring-primary/30"
              : "border-border hover:border-primary/40"
          )}
          style={{ background: settings.customBgColor }}
        >
          <span className="text-[10px] font-bold text-foreground/80 drop-shadow">Custom</span>
          <input
            type="color"
            value={settings.customBgColor}
            onChange={(e) => onChange({ backgroundTheme: "custom", customBgColor: e.target.value })}
            className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
            title="Pick a custom background color"
          />
        </div>
      </div>
    </div>
  );
}

function PanicTab({ settings, onChange }: { settings: AppSettings; onChange: (u: Partial<AppSettings>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground font-display mb-1">Panic Button</h3>
        <p className="text-sm text-muted-foreground">Instantly navigate away if someone approaches.</p>
      </div>

      <div className="space-y-2 p-4 bg-muted/30 rounded-xl border border-border">
        <Label className="text-sm font-semibold">Redirect URL</Label>
        <p className="text-xs text-muted-foreground">Where you&apos;ll be sent when panic is triggered.</p>
        <Input
          placeholder="https://classroom.google.com"
          value={settings.panicUrl}
          onChange={(e) => onChange({ panicUrl: e.target.value })}
          className="h-9"
        />
      </div>

      <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-xl">
        <div className="text-2xl">⌨️</div>
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Keyboard Shortcuts</p>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 space-y-1">
            <p>
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-amber-200 dark:bg-amber-800 rounded text-xs font-mono font-bold">
                Escape
              </kbd>{" "}
              to instantly trigger panic (when not in a game)
            </p>
            <p>
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-amber-200 dark:bg-amber-800 rounded text-xs font-mono font-bold">
                Alt+P
              </kbd>{" "}
              to trigger panic from anywhere (even in a game!)
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
        <div>
          <Label className="text-sm font-semibold cursor-pointer">Show Panic Button</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Display the red button in the bottom-left corner</p>
        </div>
        <Switch
          checked={settings.showPanicButton}
          onCheckedChange={(v) => onChange({ showPanicButton: v })}
        />
      </div>

      <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl space-y-3">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">⚠️ Test Panic Button</p>
        <p className="text-xs text-red-600 dark:text-red-400">Make sure your redirect URL is correct before you need it!</p>
        <Button
          type="button"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => {
            if (settings.panicUrl) {
              window.location.href = settings.panicUrl;
            } else {
              toast.error("No panic URL set!");
            }
          }}
        >
          <Zap className="w-3.5 h-3.5 mr-1.5" />
          Test Panic Now
        </Button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [activeCategory, setActiveCategory] = useState<GameCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [recentIds, setRecentIds] = useState<string[]>(() => loadRecent());
  const panicTriggered = useRef(false);

  // ── Username / Lock Screen ──────────────────────────────────────────────────
  const [username, setUsername] = useState<string>(() => localStorage.getItem(USERNAME_KEY) ?? "");

  const handleEnterName = useCallback((name: string) => {
    localStorage.setItem(USERNAME_KEY, name);
    setUsername(name);
  }, []);

  const handleChangeName = useCallback(() => {
    localStorage.removeItem(USERNAME_KEY);
    setUsername("");
  }, []);

  // ── Chat ────────────────────────────────────────────────────────────────────
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastSeenCountRef = useRef(0);

  // Track unread messages when chat is closed
  useEffect(() => {
    if (chatOpen) {
      setUnreadCount(0);
    }
  }, [chatOpen]);

  // Apply cloak on mount
  useEffect(() => {
    const stored = loadSettings();
    applyCloak(stored);
  }, []);

  // Persist + reapply cloak whenever settings change
  useEffect(() => {
    saveSettings(settings);
    applyCloak(settings);
  }, [settings]);

  // Persist favorites
  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  // Persist recent
  useEffect(() => {
    saveRecent(recentIds);
  }, [recentIds]);

  // Global panic key — Escape (when not in game) + Alt+P (always)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+P — works even inside game iframe (as long as focus is on the page)
      if (e.altKey && e.key === "p" && !panicTriggered.current) {
        panicTriggered.current = true;
        window.location.href = settings.panicUrl || "https://classroom.google.com";
        return;
      }
      // Escape — only when not in a modal/game
      if (e.key === "Escape" && !activeGame && !settingsOpen && !panicTriggered.current) {
        panicTriggered.current = true;
        window.location.href = settings.panicUrl || "https://classroom.google.com";
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [settings.panicUrl, activeGame, settingsOpen]);

  const handleSettingsChange = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handlePanic = useCallback(() => {
    window.location.href = settings.panicUrl || "https://classroom.google.com";
  }, [settings.panicUrl]);

  const handleToggleFavorite = useCallback((gameId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId];
      const game = GAMES.find((g) => g.id === gameId);
      if (game) {
        toast(prev.includes(gameId) ? `Removed from favorites` : `❤️ Added to favorites`, {
          description: game.title,
        });
      }
      return next;
    });
  }, []);

  const handlePlayGame = useCallback((game: Game) => {
    setActiveGame(game);
    setRecentIds((prev) => addToRecent(game.id, prev));
  }, []);

  // Derived filtered games
  const filteredGames = GAMES.filter((game) => {
    const matchesSearch = !searchQuery || game.title.toLowerCase().includes(searchQuery.toLowerCase()) || (game.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    if (!matchesSearch) return false;

    if (activeCategory === "All") return true;
    if (activeCategory === "Favorites") return favorites.includes(game.id);
    if (activeCategory === "Recent") return recentIds.includes(game.id);
    return game.category === activeCategory;
  });

  // Sort recent by recency
  const sortedFilteredGames =
    activeCategory === "Recent"
      ? [...filteredGames].sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id))
      : filteredGames;

  // Recently played games for the row
  const recentGames = recentIds
    .map((id) => GAMES.find((g) => g.id === id))
    .filter((g): g is Game => g !== undefined);

  const bgClass = getBackgroundClass(settings.backgroundTheme);
  const bgStyle = settings.backgroundTheme === "custom" ? { background: settings.customBgColor } : undefined;
  const isDark = !isLightTheme(settings.backgroundTheme);

  // Show lock screen if no username
  if (!username) {
    return <LockScreen onEnter={handleEnterName} />;
  }

  return (
    <div
      className={cn("min-h-screen transition-all duration-700 font-sans", bgClass, isDark && "dark")}
      style={bgStyle}
    >
      <Toaster />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-sm",
        isDark ? "bg-black/30 border-white/10" : "bg-white/80 border-border"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top row */}
          <div className="flex items-center justify-between py-2.5 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-msn-blue rounded-xl flex items-center justify-center shadow-sm">
                <Gamepad2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base font-display tracking-tight leading-none">
                  <span className="text-msn-blue">MSN</span>
                  <span className={isDark ? " text-white" : " text-foreground"}> Games</span>
                </span>
                <span className={cn("text-[10px] font-medium", isDark ? "text-white/50" : "text-muted-foreground")}>
                  {GAMES.length} free games
                </span>
              </div>
              {/* Username display + change name */}
              <button
                type="button"
                onClick={handleChangeName}
                title="Change your name"
                className={cn(
                  "hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  isDark
                    ? "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
                    : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                )}
              >
                <UserCircle className="w-3.5 h-3.5" />
                <span className="max-w-[80px] truncate">{username}</span>
                <Edit2 className="w-3 h-3 opacity-60" />
              </button>
            </div>

            {/* Search — desktop */}
            <div className="flex-1 max-w-sm hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder={`Search ${GAMES.length} games...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "search-glow w-full pl-9 pr-4 py-2 text-sm rounded-xl border outline-none transition-all",
                    isDark
                      ? "bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15"
                      : "bg-muted/60 border-border text-foreground placeholder:text-muted-foreground"
                  )}
                />
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2 shrink-0">
              <div className={cn(
                "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold",
                isDark ? "bg-white/10 text-white" : "bg-msn-blue/10 text-msn-blue"
              )}>
                <Trophy className="w-3.5 h-3.5" />
                <span>{GAMES.length} Games</span>
              </div>
              {favorites.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategory("Favorites")}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold transition-all",
                    isDark ? "bg-red-500/20 text-red-300 hover:bg-red-500/30" : "bg-red-50 text-red-500 hover:bg-red-100"
                  )}
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{favorites.length}</span>
                </button>
              )}
            </div>
          </div>

          {/* Search — mobile */}
          <div className="sm:hidden pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "search-glow w-full pl-9 pr-4 py-2 text-sm rounded-xl border outline-none",
                  isDark
                    ? "bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    : "bg-muted/60 border-border text-foreground placeholder:text-muted-foreground"
                )}
              />
            </div>
          </div>

          {/* Category nav */}
          <nav className="flex items-center gap-0.5 overflow-x-auto pb-0 -mb-px scrollbar-none" aria-label="Game categories">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "settings-tab shrink-0 px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1",
                  activeCategory === cat
                    ? "border-msn-blue text-msn-blue"
                    : isDark
                    ? "border-transparent text-white/60 hover:text-white hover:border-white/30"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/30"
                )}
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                <span>{cat}</span>
                {cat === "Favorites" && favorites.length > 0 && (
                  <span className={cn(
                    "ml-0.5 text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center",
                    activeCategory === cat ? "bg-msn-blue text-white" : "bg-red-500 text-white"
                  )}>
                    {favorites.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        {/* Hero banner */}
        {activeCategory === "All" && !searchQuery && (
          <section className="mb-5" aria-label="Welcome banner">
            <div className={cn(
              "rounded-2xl p-5 relative overflow-hidden",
              isDark
                ? "bg-gradient-to-r from-blue-900/60 to-purple-900/60 border border-white/10"
                : "bg-gradient-to-r from-msn-blue to-blue-600"
            )}>
              <div className="relative z-10">
                <Badge className="bg-white/20 text-white border-0 text-xs mb-2">
                  🎮 Welcome to MSN Games Hub
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
                  Play {GAMES.length}+ Free Games Online
                </h1>
                <p className="text-blue-100 mt-1 text-sm max-w-md">
                  No downloads needed. IO games, action, puzzles, card games &amp; more — just click and play!
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {(["IO", "Action", "Puzzle", "Arcade", "Sports"] as GameCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-semibold transition-colors"
                    >
                      {CATEGORY_ICONS[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 text-9xl pointer-events-none select-none" aria-hidden="true">
                🎮
              </div>
            </div>
          </section>
        )}

        {/* Recently Played Row */}
        {activeCategory === "All" && !searchQuery && recentGames.length > 0 && (
          <section className="mb-5" aria-label="Recently played games">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className={cn("text-sm font-bold font-display flex items-center gap-1.5", isDark ? "text-white" : "text-foreground")}>
                <Clock className="w-4 h-4" /> Recently Played
              </h2>
              <button
                type="button"
                onClick={() => setActiveCategory("Recent")}
                className={cn("text-xs font-medium hover:underline", isDark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground")}
              >
                See all
              </button>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {recentGames.map((game) => (
                <RecentCard key={game.id} game={game} onPlay={handlePlayGame} />
              ))}
            </div>
          </section>
        )}

        {/* Featured row (only on All tab with no search) */}
        {activeCategory === "All" && !searchQuery && (
          <section className="mb-5" aria-label="Featured games">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className={cn("text-sm font-bold font-display flex items-center gap-1.5", isDark ? "text-white" : "text-foreground")}>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Featured Games
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {GAMES.filter((g) => g.featured).slice(0, 6).map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onPlay={handlePlayGame}
                  isFavorite={favorites.includes(game.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        {/* Section header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className={cn("text-base font-bold font-display flex items-center gap-1.5", isDark ? "text-white" : "text-foreground")}>
            <span>{CATEGORY_ICONS[activeCategory]}</span>
            {searchQuery
              ? `Results for "${searchQuery}"`
              : activeCategory === "All"
              ? "All Games"
              : activeCategory === "Favorites"
              ? "My Favorites"
              : activeCategory === "Recent"
              ? "Recently Played"
              : `${activeCategory} Games`}
            <span className={cn("ml-1 text-xs font-normal", isDark ? "text-white/50" : "text-muted-foreground")}>
              ({sortedFilteredGames.length})
            </span>
          </h2>
          {activeCategory !== "All" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveCategory("All")}
              className={cn("text-xs", isDark ? "text-white/70 hover:text-white" : "")}
            >
              View All <ChevronDown className="w-3 h-3 ml-1 -rotate-90" />
            </Button>
          )}
        </div>

        {/* Empty states */}
        {activeCategory === "Favorites" && favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="text-5xl" aria-hidden="true">❤️</div>
            <p className={cn("text-lg font-semibold font-display", isDark ? "text-white/70" : "text-muted-foreground")}>
              No favorites yet
            </p>
            <p className={cn("text-sm text-center max-w-xs", isDark ? "text-white/40" : "text-muted-foreground")}>
              Click the heart icon on any game card to save it here
            </p>
          </div>
        ) : activeCategory === "Recent" && recentIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="text-5xl" aria-hidden="true">🕐</div>
            <p className={cn("text-lg font-semibold font-display", isDark ? "text-white/70" : "text-muted-foreground")}>
              No games played yet
            </p>
            <p className={cn("text-sm", isDark ? "text-white/40" : "text-muted-foreground")}>
              Play a game and it will appear here
            </p>
          </div>
        ) : sortedFilteredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 animate-fade-in">
            {sortedFilteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onPlay={handlePlayGame}
                isFavorite={favorites.includes(game.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="text-5xl" aria-hidden="true">🎮</div>
            <p className={cn("text-lg font-semibold font-display", isDark ? "text-white/70" : "text-muted-foreground")}>
              No games found
            </p>
            <p className={cn("text-sm", isDark ? "text-white/40" : "text-muted-foreground")}>
              Try a different search or category
            </p>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className={cn("mt-10 py-5 border-t text-center text-xs", isDark ? "border-white/10 text-white/40" : "border-border text-muted-foreground")}>
        <p className="flex items-center justify-center gap-1.5">
          © 2026 MSN Games Hub &bull; {GAMES.length} free browser games &bull; Built with{" "}
          <Heart className="w-3 h-3 text-red-500 fill-red-500" aria-label="love" />{" "}
          using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className={cn("font-medium hover:underline", isDark ? "text-blue-300" : "text-msn-blue")}
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* ── Floating: Panic Button ───────────────────────────────────────────── */}
      {settings.showPanicButton && (
        <button
          type="button"
          onClick={handlePanic}
          className="panic-pulse fixed bottom-6 left-6 z-50 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="PANIC! Navigate away instantly (or press Alt+P / Escape)"
          aria-label="Panic button - navigate away immediately"
        >
          <Zap className="w-6 h-6" />
        </button>
      )}

      {/* ── Floating: Chat Button ────────────────────────────────────────────── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          type="button"
          onClick={() => { setChatOpen((prev) => !prev); setUnreadCount(0); lastSeenCountRef.current = 0; }}
          className={cn(
            "relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110",
            chatOpen
              ? "bg-blue-700 text-white"
              : isDark
              ? "bg-blue-600/80 hover:bg-blue-500 text-white border border-white/20 backdrop-blur-sm"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          )}
          title="MSN Chat"
          aria-label="Toggle chat"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && !chatOpen && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Chat Panel ───────────────────────────────────────────────────────── */}
      <ChatPanel
        username={username}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        isDark={isDark}
      />

      {/* ── Floating: Settings Button ────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110",
          isDark
            ? "bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
            : "bg-msn-blue hover:bg-msn-blue-dark text-white"
        )}
        title="Settings"
        aria-label="Open settings"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* ── Game Modal ───────────────────────────────────────────────────────── */}
      {activeGame && (
        <GameModal game={activeGame} onClose={() => setActiveGame(null)} />
      )}

      {/* ── Settings Modal ───────────────────────────────────────────────────── */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-msn-blue rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-display">Settings</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Customize your games hub experience</p>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="cloak" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="mx-6 mt-4 grid grid-cols-3 shrink-0">
              <TabsTrigger value="cloak" className="text-xs sm:text-sm">🎭 Tab Cloak</TabsTrigger>
              <TabsTrigger value="background" className="text-xs sm:text-sm">🎨 Background</TabsTrigger>
              <TabsTrigger value="panic" className="text-xs sm:text-sm">⚡ Panic</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <TabsContent value="cloak" className="m-0">
                <CloakTab settings={settings} onChange={handleSettingsChange} />
              </TabsContent>
              <TabsContent value="background" className="m-0">
                <BackgroundsTab settings={settings} onChange={handleSettingsChange} />
              </TabsContent>
              <TabsContent value="panic" className="m-0">
                <PanicTab settings={settings} onChange={handleSettingsChange} />
              </TabsContent>
            </div>

            <div className="px-6 pb-6 pt-2 border-t border-border shrink-0">
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => setSettingsOpen(false)}>
                  Close
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-msn-blue hover:bg-msn-blue-dark text-white"
                  onClick={() => {
                    saveSettings(settings);
                    setSettingsOpen(false);
                    toast.success("Settings saved!");
                  }}
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Save Settings
                </Button>
              </div>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Hidden: keeps unused imports in bundle */}
      <span className="sr-only" aria-hidden="true"><Monitor className="hidden" /></span>
    </div>
  );
}
