import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

type Tab = "home" | "generator" | "editor";

const BLOCKS_DB = [
  { id: "grass", name: "Трава", emoji: "🟩", category: "Блоки" },
  { id: "stone", name: "Камень", emoji: "⬜", category: "Блоки" },
  { id: "wood", name: "Дерево", emoji: "🟫", category: "Блоки" },
  { id: "sand", name: "Песок", emoji: "🟡", category: "Блоки" },
  { id: "water", name: "Вода", emoji: "🔵", category: "Блоки" },
  { id: "lava", name: "Лава", emoji: "🔴", category: "Блоки" },
  { id: "diamond", name: "Алмаз", emoji: "💎", category: "Блоки" },
  { id: "gold", name: "Золото", emoji: "🟨", category: "Блоки" },
  { id: "iron", name: "Железо", emoji: "⚙️", category: "Блоки" },
  { id: "obsidian", name: "Обсидиан", emoji: "🟣", category: "Блоки" },
  { id: "sword", name: "Меч", emoji: "⚔️", category: "Предметы" },
  { id: "bow", name: "Лук", emoji: "🏹", category: "Предметы" },
  { id: "potion", name: "Зелье", emoji: "🧪", category: "Предметы" },
  { id: "shield", name: "Щит", emoji: "🛡️", category: "Предметы" },
  { id: "helmet", name: "Шлем", emoji: "⛑️", category: "Предметы" },
  { id: "pickaxe", name: "Кирка", emoji: "⛏️", category: "Предметы" },
  { id: "torch", name: "Факел", emoji: "🔦", category: "Предметы" },
  { id: "chest", name: "Сундук", emoji: "📦", category: "Предметы" },
  { id: "recipe_sword", name: "Рецепт: Меч", emoji: "📜", category: "Рецепты" },
  { id: "recipe_potion", name: "Рецепт: Зелье", emoji: "📜", category: "Рецепты" },
  { id: "recipe_armor", name: "Рецепт: Броня", emoji: "📜", category: "Рецепты" },
  { id: "recipe_tools", name: "Рецепт: Инструменты", emoji: "📜", category: "Рецепты" },
];

const CATEGORIES = ["Все", "Блоки", "Предметы", "Рецепты"];

const EXAMPLE_PROMPTS = [
  "Добавь меч из обсидиана с уроном x3",
  "Создай блок телепортации при нажатии",
  "Добавь летающего дракона-компаньона",
  "Сделай зелье невидимости на 10 минут",
  "Создай мод с магическим посохом молний",
];

const MOCK_GENERATED_CODE = `// Сгенерировано ModForge AI
package com.modforge.generated;

import net.minecraft.world.item.Item;
import net.minecraft.world.item.Tier;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.entity.Entity;

public class CustomSword extends SwordItem {
    public static final Item OBSIDIAN_SWORD = 
        new CustomSword(Tiers.OBSIDIAN, 7, -2.4f,
            new Item.Properties());
    
    // Урон: +7 к базовому
    // Скорость атаки: 2.4
    // Прочность: 1800
    
    @Override
    public void onAttack(Player player, Entity target) {
        target.hurt(DamageSource.MAGIC, 3.0f);
        player.addEffect(new MobEffectInstance(
            MobEffects.STRENGTH, 100, 0));
        // Эффект горения на 5 секунд
        target.setSecondsOnFire(5);
    }
    
    @Override
    public boolean isFoil(ItemStack stack) {
        return true; // Визуальный эффект зачарования
    }
}`;

interface ModItem {
  id: string;
  name: string;
  emoji: string;
  category: string;
}

interface EditorMod {
  name: string;
  description: string;
  version: string;
  properties: {
    damage: number;
    durability: number;
    speed: number;
  };
}

export default function Index() {
  const [tab, setTab] = useState<Tab>("home");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Все");
  const [editorMod, setEditorMod] = useState<EditorMod>({
    name: "Мой первый мод",
    description: "Описание мода",
    version: "1.0.0",
    properties: { damage: 5, durability: 500, speed: 1 },
  });
  const [addedItems, setAddedItems] = useState<ModItem[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (tab !== "home") return;
    const example = EXAMPLE_PROMPTS[currentPromptIdx];
    let i = 0;
    setTypedPrompt("");
    const interval = setInterval(() => {
      if (i <= example.length) {
        setTypedPrompt(example.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setCurrentPromptIdx((p) => (p + 1) % EXAMPLE_PROMPTS.length);
        }, 2000);
      }
    }, 55);
    return () => clearInterval(interval);
  }, [currentPromptIdx, tab]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedCode("");
    let i = 0;
    const interval = setInterval(() => {
      if (i <= MOCK_GENERATED_CODE.length) {
        setGeneratedCode(MOCK_GENERATED_CODE.slice(0, i));
        i += 3;
        if (codeRef.current) {
          codeRef.current.scrollTop = codeRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 20);
  };

  const filteredItems = BLOCKS_DB.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(searchFilter.toLowerCase());
    const matchCat = categoryFilter === "Все" || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const addItemToMod = (item: ModItem) => {
    if (!addedItems.find((i) => i.id === item.id)) {
      setAddedItems((prev) => [...prev, item]);
    }
  };

  const removeItem = (id: string) => {
    setAddedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDownloadJar = () => {
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CustomMod.java";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const items = addedItems.map((i) => `  - ${i.name} (${i.emoji})`).join("\n");
    const content = `# ${editorMod.name}\n# Версия: ${editorMod.version}\n# ${editorMod.description}\n# Урон: ${editorMod.properties.damage}, Прочность: ${editorMod.properties.durability}\n\nЭлементы мода:\n${items || "  (пусто)"}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${editorMod.name.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[hsl(220,20%,5%)] text-mc-text font-golos mc-grid relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-mc-border bg-[hsl(220,20%,5%)]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => setTab("home")} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-mc-green/20 border border-mc-green/40 flex items-center justify-center glow-green group-hover:scale-110 transition-transform">
              <span className="text-base">⛏️</span>
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-mc-green-bright text-glow">Mod</span>
              <span className="text-mc-text">Forge</span>
            </span>
          </button>

          <nav className="flex items-center gap-1 bg-mc-surface/60 border border-mc-border rounded-xl p-1">
            {(["home", "generator", "editor"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === t
                    ? "bg-mc-green text-[hsl(220,20%,5%)] shadow-lg"
                    : "text-mc-muted hover:text-mc-text hover:bg-mc-border/50"
                }`}
              >
                {t === "home" ? "Главная" : t === "generator" ? "Генератор" : "Редактор"}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 text-xs text-mc-muted font-mono">
            <span className="w-2 h-2 rounded-full bg-mc-green-bright animate-pulse-green inline-block" />
            ИИ онлайн
          </div>
        </div>
      </header>

      {/* HOME */}
      {tab === "home" && (
        <main className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-mc-green/10 border border-mc-green/30 rounded-full px-4 py-1.5 text-sm text-mc-green-bright font-mono mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-mc-green-bright animate-pulse-green inline-block" />
              Minecraft Mod Builder · AI-powered
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-none tracking-tight">
              Создавай моды
              <br />
              <span className="text-mc-green-bright text-glow">силой ИИ</span>
            </h1>

            <p className="text-mc-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Опиши идею — получи готовый мод. Или собери с нуля в визуальном редакторе
              с базой блоков, предметов и рецептов.
            </p>

            {/* Typewriter */}
            <div className="max-w-xl mx-auto bg-mc-surface/80 border border-mc-border rounded-2xl p-4 mb-8 text-left font-mono text-sm backdrop-blur-sm">
              <div className="text-mc-muted text-xs mb-2">{"// попробуй написать:"}</div>
              <span className="text-mc-green-bright">{typedPrompt}</span>
              <span className="animate-blink text-mc-green-bright">|</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setTab("generator")}
                className="shimmer-btn text-[hsl(220,20%,5%)] font-bold px-8 py-3.5 rounded-xl text-base transition-all hover:scale-105 hover:shadow-xl flex items-center gap-2 glow-green-strong"
              >
                <Icon name="Sparkles" size={18} />
                Генерировать мод
              </button>
              <button
                onClick={() => setTab("editor")}
                className="bg-mc-surface border border-mc-border text-mc-text font-semibold px-8 py-3.5 rounded-xl text-base transition-all hover:border-mc-green/50 hover:text-mc-green-bright flex items-center gap-2"
              >
                <Icon name="Wrench" size={18} />
                Открыть редактор
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: "Sparkles",
                title: "ИИ-генератор",
                desc: "Опиши мод текстом — нейросеть создаст полный код на Java для Minecraft Forge",
                accent: "text-mc-green-bright",
                delay: "delay-100",
              },
              {
                icon: "Wrench",
                title: "Визуальный редактор",
                desc: "Конструктор с базой блоков, предметов и рецептов — без единой строки кода",
                accent: "text-mc-amber",
                delay: "delay-200",
              },
              {
                icon: "Database",
                title: "База данных",
                desc: "Блоки, предметы и рецепты Minecraft для быстрой сборки любого мода",
                accent: "text-mc-blue",
                delay: "delay-300",
              },
            ].map((f) => (
              <div
                key={f.title}
                className={`animate-fade-in ${f.delay} opacity-0 bg-mc-surface/50 border border-mc-border rounded-2xl p-6 hover:border-mc-green/30 transition-all`}
              >
                <div className={`${f.accent} mb-4`}>
                  <Icon name={f.icon as "Sparkles" | "Wrench" | "Database"} size={28} />
                </div>
                <h3 className="font-bold text-mc-text text-lg mb-2">{f.title}</h3>
                <p className="text-mc-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* GENERATOR */}
      {tab === "generator" && (
        <main className="max-w-5xl mx-auto px-4 py-10 animate-fade-in">
          <div className="mb-8">
            <h2 className="text-3xl font-black mb-2">
              <span className="text-mc-green-bright text-glow">ИИ</span>-генератор модов
            </h2>
            <p className="text-mc-muted">Опиши, что хочешь добавить в Minecraft — нейросеть напишет код</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input */}
            <div className="space-y-4">
              <div className="bg-mc-surface/60 border border-mc-border rounded-2xl p-5">
                <label className="block text-sm font-semibold text-mc-text mb-3">Опиши свой мод</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Например: добавь меч из обсидиана с уроном x3, который поджигает врагов..."
                  className="w-full bg-[hsl(220,20%,5%)] border border-mc-border rounded-xl px-4 py-3 text-mc-text placeholder-mc-muted/60 resize-none h-32 text-sm font-mono focus:outline-none focus:border-mc-green/60 transition-colors"
                />

                <div className="mt-3">
                  <div className="text-xs text-mc-muted mb-2 font-mono">{"// быстрые примеры:"}</div>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_PROMPTS.slice(0, 3).map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setPrompt(ex)}
                        className="text-xs bg-mc-border/50 border border-mc-border hover:border-mc-green/40 hover:text-mc-green-bright text-mc-muted px-2.5 py-1 rounded-lg transition-all"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full mt-4 shimmer-btn disabled:opacity-40 disabled:cursor-not-allowed text-[hsl(220,20%,5%)] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  {isGenerating ? (
                    <>
                      <Icon name="LoaderCircle" size={18} className="animate-spin" />
                      Генерирую...
                    </>
                  ) : (
                    <>
                      <Icon name="Sparkles" size={18} />
                      Создать мод
                    </>
                  )}
                </button>
              </div>

              {/* Settings */}
              <div className="bg-mc-surface/60 border border-mc-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-mc-text mb-4 flex items-center gap-2">
                  <Icon name="Settings" size={14} className="text-mc-muted" />
                  Параметры генерации
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Версия Minecraft", options: ["1.20.1", "1.19.4", "1.18.2"] },
                    { label: "Mod Loader", options: ["Forge", "Fabric", "Quilt"] },
                    { label: "Язык", options: ["Java", "Kotlin"] },
                  ].map((setting) => (
                    <div key={setting.label} className="flex items-center justify-between">
                      <span className="text-sm text-mc-muted">{setting.label}</span>
                      <select className="bg-mc-border/50 border border-mc-border text-mc-text text-sm rounded-lg px-2.5 py-1 focus:outline-none focus:border-mc-green/60">
                        {setting.options.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Output */}
            <div className="bg-mc-surface/60 border border-mc-border rounded-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-5 py-3 border-b border-mc-border">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-mc-green/60" />
                  </div>
                  <span className="text-xs font-mono text-mc-muted ml-2">CustomSword.java</span>
                </div>
                {generatedCode && (
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedCode)}
                    className="text-xs text-mc-muted hover:text-mc-green-bright transition-colors flex items-center gap-1"
                  >
                    <Icon name="Copy" size={12} />
                    Копировать
                  </button>
                )}
              </div>

              <pre
                ref={codeRef}
                className="flex-1 p-5 text-xs font-mono text-mc-green-bright/90 overflow-auto min-h-64 max-h-96 leading-relaxed"
              >
                {generatedCode || (
                  <span className="text-mc-muted italic">
                    {"// Здесь появится сгенерированный код...\n// Опиши мод и нажми «Создать мод»"}
                  </span>
                )}
                {isGenerating && <span className="animate-blink">█</span>}
              </pre>

              {generatedCode && !isGenerating && (
                <div className="px-5 py-3 border-t border-mc-border flex gap-2">
                  <button onClick={handleDownloadJar} className="flex-1 bg-mc-green/20 border border-mc-green/40 text-mc-green-bright text-sm font-semibold py-2 rounded-lg hover:bg-mc-green/30 transition-all flex items-center justify-center gap-1.5">
                    <Icon name="Download" size={14} />
                    Скачать .java
                  </button>
                  <button
                    onClick={() => setTab("editor")}
                    className="flex-1 bg-mc-surface border border-mc-border text-mc-muted text-sm font-medium py-2 rounded-lg hover:border-mc-green/30 hover:text-mc-text transition-all flex items-center justify-center gap-1.5"
                  >
                    <Icon name="FolderOpen" size={14} />
                    В редактор
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* EDITOR */}
      {tab === "editor" && (
        <main className="max-w-6xl mx-auto px-4 py-10 animate-fade-in">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-black mb-2">
                Визуальный <span className="text-mc-amber text-glow-amber">редактор</span>
              </h2>
              <p className="text-mc-muted">Собери мод из готовых элементов без кода</p>
            </div>
            <button
              onClick={handleExport}
              className="bg-mc-green/20 border border-mc-green/50 text-mc-green-bright font-semibold px-5 py-2.5 rounded-xl hover:bg-mc-green/30 transition-all flex items-center gap-2 glow-green"
            >
              <Icon name="Download" size={16} />
              Экспорт мода
            </button>
          </div>

          {showSuccess && (
            <div className="mb-4 animate-scale-in bg-mc-green/10 border border-mc-green/40 rounded-xl px-5 py-3 flex items-center gap-3 text-mc-green-bright font-semibold">
              <Icon name="CheckCircle" size={18} />
              Мод успешно экспортирован! (демо-режим)
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Settings */}
            <div className="space-y-4">
              <div className="bg-mc-surface/60 border border-mc-border rounded-2xl p-5">
                <h3 className="text-sm font-bold text-mc-text mb-4 flex items-center gap-2">
                  <Icon name="FileCode" size={14} className="text-mc-amber" />
                  Настройки мода
                </h3>
                <div className="space-y-3">
                  {(["name", "description", "version"] as const).map((key) => (
                    <div key={key}>
                      <label className="text-xs text-mc-muted block mb-1 capitalize">
                        {key === "name" ? "Название" : key === "description" ? "Описание" : "Версия"}
                      </label>
                      <input
                        value={editorMod[key]}
                        onChange={(e) => setEditorMod((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="w-full bg-[hsl(220,20%,5%)] border border-mc-border rounded-lg px-3 py-2 text-sm text-mc-text focus:outline-none focus:border-mc-amber/60 transition-colors"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <h4 className="text-xs font-bold text-mc-muted mb-3 uppercase tracking-wider">Характеристики</h4>
                  <div className="space-y-3">
                    {([
                      { label: "Урон", key: "damage" as const, min: 1, max: 20 },
                      { label: "Прочность", key: "durability" as const, min: 50, max: 2000 },
                    ]).map(({ label, key, min, max }) => (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-mc-muted">{label}</span>
                          <span className="text-mc-green-bright font-mono">{editorMod.properties[key]}</span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          value={editorMod.properties[key]}
                          onChange={(e) =>
                            setEditorMod((prev) => ({
                              ...prev,
                              properties: { ...prev.properties, [key]: Number(e.target.value) },
                            }))
                          }
                          className="w-full accent-green-500 h-1.5 rounded cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Added items */}
              <div className="bg-mc-surface/60 border border-mc-border rounded-2xl p-5">
                <h3 className="text-sm font-bold text-mc-text mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon name="Package" size={14} className="text-mc-blue" />
                    В моде
                  </span>
                  <span className="text-xs font-mono text-mc-green-bright bg-mc-green/10 px-2 py-0.5 rounded-full">
                    {addedItems.length}
                  </span>
                </h3>
                {addedItems.length === 0 ? (
                  <p className="text-xs text-mc-muted italic text-center py-4">
                    Добавь элементы из базы →
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {addedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-mc-border/30 rounded-lg px-3 py-1.5 group">
                        <span className="text-sm flex items-center gap-2">
                          <span>{item.emoji}</span>
                          <span className="text-mc-text">{item.name}</span>
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-mc-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Database */}
            <div className="lg:col-span-2 bg-mc-surface/60 border border-mc-border rounded-2xl p-5">
              <h3 className="text-sm font-bold text-mc-text mb-4 flex items-center gap-2">
                <Icon name="Database" size={14} className="text-mc-blue" />
                База данных
              </h3>

              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mc-muted" />
                  <input
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Поиск..."
                    className="w-full bg-[hsl(220,20%,5%)] border border-mc-border rounded-lg pl-9 pr-3 py-2 text-sm text-mc-text placeholder-mc-muted/50 focus:outline-none focus:border-mc-blue/60 transition-colors"
                  />
                </div>
                <div className="flex gap-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        categoryFilter === cat
                          ? "bg-mc-blue/20 border border-mc-blue/50 text-mc-blue"
                          : "text-mc-muted hover:text-mc-text border border-transparent"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredItems.map((item) => {
                  const isAdded = addedItems.some((a) => a.id === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => addItemToMod(item)}
                      disabled={isAdded}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                        isAdded
                          ? "border-mc-green/50 bg-mc-green/10 cursor-default"
                          : "border-mc-border hover:border-mc-blue/50 hover:bg-mc-blue/5 hover:scale-105"
                      }`}
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="text-xs text-mc-muted text-center leading-tight">{item.name}</span>
                      {isAdded && (
                        <span className="text-[10px] text-mc-green-bright font-mono">✓ добавлен</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-mc-border flex items-center justify-between text-xs text-mc-muted">
                <span>Показано: {filteredItems.length} из {BLOCKS_DB.length}</span>
                <span className="font-mono text-mc-green-bright/70">v1.20.1 · Forge</span>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-mc-border mt-16 py-6">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-xs text-mc-muted">
          <span>ModForge · ИИ-генератор модов Minecraft</span>
          <span className="font-mono">2026</span>
        </div>
      </footer>
    </div>
  );
}