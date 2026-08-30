<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-indigo-500 selection:text-white">
    <div class="max-w-7xl mx-auto space-y-8">

      <!-- Top Navigation & Preset Bar -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              M
            </div>
            <h1 class="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              @sandlada/mcu-helper
            </h1>
            <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60">
              Dev Playground
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Pure functional curried theme generation & modern CSS serialization testbed
          </p>
        </div>

        <!-- Global Theme Preview Mode & Benchmark -->
        <div class="flex items-center gap-3">
          <div class="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Gen: <strong class="text-slate-200 font-mono">{{ latencyMs.toFixed(1) }}ms</strong></span>
          </div>

          <div class="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              v-for="mode in (['split', 'light', 'dark'] as const)"
              :key="mode"
              @click="previewMode = mode"
              :class="[
                'px-3 py-1.5 rounded-lg font-medium capitalize transition-all duration-150',
                previewMode === mode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              ]"
            >
              {{ mode }}
            </button>
          </div>
        </div>
      </header>

      <!-- Preset Seed Colors -->
      <section class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-medium text-slate-400 mr-1">Brand Presets:</span>
        <button
          v-for="preset in presets"
          :key="preset.hex"
          @click="selectPreset(preset.hex)"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          :class="{ 'ring-2 ring-indigo-500 border-transparent': sourceHex.toUpperCase() === preset.hex.toUpperCase() }"
        >
          <span class="w-3.5 h-3.5 rounded-full border border-black/20" :style="{ backgroundColor: preset.hex }"></span>
          <span>{{ preset.name }}</span>
        </button>
      </section>

      <!-- Main Controls Dashboard -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- 1. Color Definition & HCT Model -->
        <div class="bg-slate-900/90 rounded-2xl p-5 border border-slate-800/80 shadow-xl space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
              1. Source Color & HCT
            </h2>
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">{{ sourceHex }}</span>
          </div>

          <div class="flex items-center gap-3">
            <input
              type="color"
              v-model="sourceHex"
              @input="onHexInput"
              class="w-12 h-12 rounded-xl bg-transparent cursor-pointer border-0 p-0"
            />
            <input
              type="text"
              v-model="sourceHex"
              @input="onHexInput"
              placeholder="#6750A4"
              class="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div class="space-y-3 pt-2 text-xs">
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-slate-400">Hue (0° - 360°)</span>
                <span class="font-mono text-slate-200">{{ Math.round(hue) }}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                :value="hue"
                @input="onHueChange"
                class="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div class="flex justify-between mb-1">
                <span class="text-slate-400">Chroma (0 - 120)</span>
                <span class="font-mono text-slate-200">{{ Math.round(chroma) }}</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="1"
                :value="chroma"
                @input="onChromaChange"
                class="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div class="flex justify-between mb-1">
                <span class="text-slate-400">Tone (0 - 100)</span>
                <span class="font-mono text-slate-200">{{ Math.round(tone) }}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                :value="tone"
                @input="onToneChange"
                class="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        <!-- 2. Material Engine Configuration -->
        <div class="bg-slate-900/90 rounded-2xl p-5 border border-slate-800/80 shadow-xl space-y-4">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-purple-400"></span>
            2. Material Engine (createTheme)
          </h2>

          <div class="space-y-1.5">
            <label class="text-xs text-slate-400 block font-medium">Spec Version:</label>
            <div class="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                @click="specVersion = '2025'"
                :class="[
                  'py-1.5 rounded-lg font-medium transition-all cursor-pointer',
                  specVersion === '2025' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                ]"
              >
                2025 (59 Tokens)
              </button>
              <button
                @click="specVersion = '2021'"
                :class="[
                  'py-1.5 rounded-lg font-medium transition-all cursor-pointer',
                  specVersion === '2021' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                ]"
              >
                2021 (55 Tokens)
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div class="text-xs font-semibold text-slate-200">OLED Pitch-Black</div>
              <div class="text-[11px] text-slate-400">Tone 0 (#000000) for dark surfaces</div>
            </div>
            <button
              @click="oled = !oled"
              class="relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none"
              :class="oled ? 'bg-indigo-600' : 'bg-slate-800'"
            >
              <span
                class="block w-4 h-4 rounded-full bg-white transition-transform duration-200 transform"
                :class="oled ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs text-slate-400 block font-medium">Material Variant:</label>
            <select
              v-model="variant"
              class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option v-for="(val, key) in variantOptions" :key="key" :value="val">
                {{ key }}
              </option>
            </select>
          </div>

          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-slate-400 font-medium">Contrast Level:</span>
              <span class="font-mono text-slate-200">{{ contrastLevel.toFixed(1) }}</span>
            </div>
            <div class="grid grid-cols-4 gap-1.5">
              <button
                v-for="cl in contrastOptions"
                :key="cl.label"
                @click="contrastLevel = cl.value"
                :class="[
                  'py-1 text-[11px] rounded-lg border transition-all cursor-pointer',
                  contrastLevel === cl.value
                    ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                ]"
              >
                {{ cl.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- 3. CSS Serializer & Color Spaces -->
        <div class="bg-slate-900/90 rounded-2xl p-5 border border-slate-800/80 shadow-xl space-y-4">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-pink-400"></span>
            3. CSS Serializer (toCSS)
          </h2>

          <div class="space-y-1.5">
            <label class="text-xs text-slate-400 block font-medium">Color Format:</label>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <button
                v-for="fmt in (['hex', 'rgb', 'display-p3', 'color-mix'] as const)"
                :key="fmt"
                @click="format = fmt"
                :class="[
                  'py-1.5 rounded-xl border font-mono transition-all text-center cursor-pointer',
                  format === fmt
                    ? 'bg-pink-600/30 border-pink-500 text-pink-200 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                ]"
              >
                {{ fmt }}
              </button>
            </div>
          </div>

          <div v-if="format === 'color-mix'" class="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <label class="text-slate-400 block font-medium">Interpolation Color Space:</label>
            <div class="grid grid-cols-2 gap-2 mt-1">
              <button
                @click="colorMixSpace = 'srgb'"
                :class="[
                  'py-1 rounded-lg border text-center transition-all cursor-pointer',
                  colorMixSpace === 'srgb' ? 'bg-pink-600 text-white border-transparent' : 'border-slate-800 text-slate-400'
                ]"
              >
                in srgb
              </button>
              <button
                @click="colorMixSpace = 'display-p3'"
                :class="[
                  'py-1 rounded-lg border text-center transition-all cursor-pointer',
                  colorMixSpace === 'display-p3' ? 'bg-pink-600 text-white border-transparent' : 'border-slate-800 text-slate-400'
                ]"
              >
                in display-p3
              </button>
            </div>
          </div>

          <div class="space-y-2 text-xs">
            <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span class="text-slate-300">Wrap with light-dark()</span>
              <input type="checkbox" v-model="wrapLightDark" class="rounded accent-indigo-500 cursor-pointer" />
            </label>
            <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span class="text-slate-300">Include Tonal Palettes</span>
              <input type="checkbox" v-model="includePalettes" class="rounded accent-indigo-500 cursor-pointer" />
            </label>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label class="text-slate-400 block mb-1">varPrefix:</label>
              <input
                type="text"
                v-model="varPrefix"
                class="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="text-slate-400 block mb-1">palettePrefix:</label>
              <input
                type="text"
                v-model="paletteVarPrefix"
                class="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

      </section>

      <!-- Engine Diagnostics & Badges -->
      <section class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800">
            <span class="text-slate-400">Tokens Emitted:</span>
            <span class="font-bold text-indigo-400 font-mono">{{ Object.keys(themeTokens.light).length }} Light / {{ Object.keys(themeTokens.dark).length }} Dark</span>
          </div>

          <div class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800">
            <span class="text-slate-400">Spec Status:</span>
            <span :class="specVersion === '2025' ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'">
              {{ specVersion === '2025' ? '2025 (Dim Tokens Active)' : '2021 (Legacy 55 Tokens)' }}
            </span>
          </div>

          <div class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800">
            <span class="text-slate-400">OLED Status:</span>
            <span :class="isOledActive ? 'text-emerald-400 font-semibold flex items-center gap-1' : 'text-slate-400'">
              <span v-if="isOledActive" class="w-2 h-2 rounded-full bg-emerald-400"></span>
              {{ isOledActive ? 'True Pitch-Black Active (#000000)' : 'Standard Elevation' }}
            </span>
          </div>
        </div>

        <div v-if="specVersion === '2025'" class="flex items-center gap-2 text-[11px]">
          <span class="text-slate-400 font-medium">2025 Dim Tokens:</span>
          <span class="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">primary-dim</span>
          <span class="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/50">secondary-dim</span>
          <span class="px-2 py-0.5 rounded bg-pink-950/80 text-pink-300 border border-pink-800/50">tertiary-dim</span>
          <span class="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/50">error-dim</span>
        </div>
      </section>

      <!-- Live Theme Preview & Interactive UI Playground -->
      <section class="space-y-4">
        <h2 class="text-lg font-bold text-slate-200 flex items-center gap-2">
          <span>Live Theme Adoption & UI Component Playground</span>
        </h2>

        <div
          class="grid gap-6 transition-all duration-200"
          :class="previewMode === 'split' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'"
        >
          <!-- Light Theme Container -->
          <div
            v-if="previewMode === 'split' || previewMode === 'light'"
            class="mcu-theme-scope rounded-3xl p-6 shadow-2xl border border-slate-300/20 transition-all"
            style="color-scheme: light; background-color: var(--md-sys-color-background, #fff); color: var(--md-sys-color-on-background, #000);"
          >
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-black/10">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-amber-400"></span>
                <span class="font-bold text-sm tracking-wide uppercase">Light Theme Preview</span>
              </div>
              <span class="text-xs px-2.5 py-1 rounded-full font-medium" style="background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container);">
                color-scheme: light
              </span>
            </div>

            <div class="space-y-6">
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Surface Elevation Hierarchy</h4>
                <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                  <div class="p-3 rounded-xl border border-black/5" style="background: var(--md-sys-color-surface-container-lowest); color: var(--md-sys-color-on-surface);">
                    <div class="text-[10px] opacity-70">Lowest</div>
                  </div>
                  <div class="p-3 rounded-xl border border-black/5" style="background: var(--md-sys-color-surface-container-low); color: var(--md-sys-color-on-surface);">
                    <div class="text-[10px] opacity-70">Low</div>
                  </div>
                  <div class="p-3 rounded-xl border border-black/5" style="background: var(--md-sys-color-surface); color: var(--md-sys-color-on-surface);">
                    <div class="text-[10px] opacity-70">Surface</div>
                  </div>
                  <div class="p-3 rounded-xl border border-black/5" style="background: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface);">
                    <div class="text-[10px] opacity-70">Container</div>
                  </div>
                  <div class="p-3 rounded-xl border border-black/5" style="background: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface);">
                    <div class="text-[10px] opacity-70">High</div>
                  </div>
                  <div class="p-3 rounded-xl border border-black/5" style="background: var(--md-sys-color-surface-container-highest); color: var(--md-sys-color-on-surface);">
                    <div class="text-[10px] opacity-70">Highest</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Material 3 Buttons</h4>
                <div class="flex flex-wrap items-center gap-2">
                  <button class="px-4 py-2 rounded-full text-xs font-semibold shadow-md cursor-pointer" style="background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary);">
                    Filled Primary
                  </button>
                  <button class="px-4 py-2 rounded-full text-xs font-semibold cursor-pointer" style="background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container);">
                    Tonal Secondary
                  </button>
                  <button class="px-4 py-2 rounded-full text-xs font-semibold border cursor-pointer" style="border-color: var(--md-sys-color-outline); color: var(--md-sys-color-primary);">
                    Outlined
                  </button>
                  <button class="px-4 py-2 rounded-full text-xs font-semibold cursor-pointer" style="background: var(--md-sys-color-error); color: var(--md-sys-color-on-error);">
                    Error Action
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Dark Theme Container -->
          <div
            v-if="previewMode === 'split' || previewMode === 'dark'"
            class="mcu-theme-scope rounded-3xl p-6 shadow-2xl border border-white/10 transition-all"
            style="color-scheme: dark; background-color: var(--md-sys-color-background, #121212); color: var(--md-sys-color-on-background, #fff);"
          >
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full" :class="oled ? 'bg-black border border-indigo-400' : 'bg-indigo-400'"></span>
                <span class="font-bold text-sm tracking-wide uppercase">
                  {{ oled ? 'Dark Theme (OLED Pitch-Black)' : 'Dark Theme Preview' }}
                </span>
              </div>
              <span class="text-xs px-2.5 py-1 rounded-full font-medium" style="background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container);">
                color-scheme: dark
              </span>
            </div>

            <div class="space-y-6">
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Surface Elevation Hierarchy</h4>
                <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                  <div class="p-3 rounded-xl border border-white/5" style="background: var(--md-sys-color-surface-container-lowest); color: var(--md-sys-color-on-surface);">
                    <div class="text-[10px] opacity-70">Lowest</div>
                  </div>
                  <div class="p-3 rounded-xl border border-white/5" style="background: var(--md-sys-color-surface-container-low); color: var(--md-sys-color-on-surface);">
                    <div class="text-[10px] opacity-70">Low</div>
                  </div>
                  <div class="p-3 rounded-xl border border-white/5" style="background: var(--md-sys-color-surface); color: var(--md-sys-color-on-surface);">
                    <div class="text-[10px] opacity-70">Surface</div>
                  </div>
                  <div class="p-3 rounded-xl border border-white/5" style="background: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface);">
                    <div class="text-[10px] opacity-70">Container</div>
                  </div>
                  <div class="p-3 rounded-xl border border-white/5" style="background: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface);">
                    <div class="text-[10px] opacity-70">High</div>
                  </div>
                  <div class="p-3 rounded-xl border border-white/5" style="background: var(--md-sys-color-surface-container-highest); color: var(--md-sys-color-on-surface);">
                    <div class="text-[10px] opacity-70">Highest</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Material 3 Buttons</h4>
                <div class="flex flex-wrap items-center gap-2">
                  <button class="px-4 py-2 rounded-full text-xs font-semibold shadow-md cursor-pointer" style="background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary);">
                    Filled Primary
                  </button>
                  <button class="px-4 py-2 rounded-full text-xs font-semibold cursor-pointer" style="background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container);">
                    Tonal Secondary
                  </button>
                  <button class="px-4 py-2 rounded-full text-xs font-semibold border cursor-pointer" style="border-color: var(--md-sys-color-outline); color: var(--md-sys-color-primary);">
                    Outlined
                  </button>
                  <button class="px-4 py-2 rounded-full text-xs font-semibold cursor-pointer" style="background: var(--md-sys-color-error); color: var(--md-sys-color-on-error);">
                    Error Action
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6 Tonal Palettes Swatch Matrix -->
      <section class="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
          6 Standard Tonal Palettes (Tones 0 - 100)
        </h2>

        <div class="space-y-3 overflow-x-auto pb-2">
          <div v-for="family in paletteFamilies" :key="family.key" class="space-y-1">
            <div class="flex justify-between items-center text-xs text-slate-400 px-1">
              <span class="font-semibold capitalize">{{ family.name }} Palette</span>
              <span class="font-mono text-[11px] text-slate-500">
                Hue: {{ Math.round(themePalettes[family.key]?.hue || 0) }}° / Chroma: {{ Math.round(themePalettes[family.key]?.chroma || 0) }}
              </span>
            </div>
            <div class="grid grid-cols-16 gap-1 min-w-[640px]">
              <div
                v-for="tone in standardTones"
                :key="tone"
                class="group relative h-8 rounded flex items-center justify-center text-[9px] font-mono cursor-pointer transition-transform hover:scale-105 hover:z-10 shadow-sm"
                :style="{ backgroundColor: getPaletteToneHex(family.key, tone) }"
                :title="`${family.name}-${tone}: ${getPaletteToneHex(family.key, tone)}`"
              >
                <span :class="tone < 50 ? 'text-white' : 'text-black'" class="opacity-0 group-hover:opacity-100 font-bold">
                  {{ tone }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Dynamic Color Tokens Inspector -->
      <section class="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            Dynamic Color Tokens Inspector ({{ filteredTokens.length }} / {{ Object.keys(themeTokens.light).length }})
          </h2>

          <input
            type="text"
            v-model="tokenSearch"
            placeholder="Search tokens (e.g. primary, surface, dim)..."
            class="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[260px]"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
          <div
            v-for="token in filteredTokens"
            :key="token.name"
            class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-all"
          >
            <div class="space-y-1">
              <div class="font-mono font-medium text-slate-200">{{ token.kebabCasedName }}</div>
              <div class="text-[10px] text-slate-500 flex items-center gap-2">
                <span>L: <strong class="font-mono text-slate-400">{{ token.lightHex }}</strong></span>
                <span>D: <strong class="font-mono text-slate-400">{{ token.darkHex }}</strong></span>
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <div
                class="w-6 h-6 rounded-md border border-black/20 shadow-sm"
                :style="{ backgroundColor: token.lightHex }"
                title="Light Mode"
              ></div>
              <div
                class="w-6 h-6 rounded-md border border-white/20 shadow-sm"
                :style="{ backgroundColor: token.darkHex }"
                title="Dark Mode"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Live Serialized CSS Code Output -->
      <section class="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            Live Serialized CSS Output (toCSS)
          </h2>
          <button
            @click="copyCSS"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <span>{{ copied ? '✓ Copied!' : 'Copy CSS' }}</span>
          </button>
        </div>

        <div class="relative">
          <pre class="bg-slate-950 p-4 rounded-2xl text-xs font-mono text-slate-300 max-h-72 overflow-y-auto border border-slate-800/80 leading-relaxed">{{ serializedCSS }}</pre>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { Hct, hexFromArgb } from '@material/material-color-utilities'
import { computed, onMounted, ref, watchEffect } from 'vue'
import {
  createTheme,
  createPaletteTones,
  toCSS,
  toKebabCase,
  MaterialVariant,
  MaterialContrastLevel,
  type SpecVersion,
  type ColorFormat,
  type ColorMixSpace,
  type MaterialThemeData,
  type SchemePaletteName,
} from '@sandlada/mcu-helper'

// 1. Reactive State
const hue = ref(280)
const chroma = ref(48)
const tone = ref(40)
const sourceHex = ref('#6750A4')
const sourceHct = computed(() => Hct.from(hue.value, chroma.value, tone.value))
const specVersion = ref<SpecVersion>('2025')
const oled = ref(false)
const variant = ref<MaterialVariant>(MaterialVariant.TonalSpot)
const contrastLevel = ref<number>(MaterialContrastLevel.Default)
const format = ref<ColorFormat>('hex')
const colorMixSpace = ref<ColorMixSpace>('srgb')
const wrapLightDark = ref(true)
const includePalettes = ref(true)
const varPrefix = ref('md-sys-color')
const paletteVarPrefix = ref('md-ref-palette')
const previewMode = ref<'split' | 'light' | 'dark'>('split')
const tokenSearch = ref('')
const copied = ref(false)
const latencyMs = ref(0)

// Presets
const presets = [
  { name: 'Material Purple', hex: '#6750A4' },
  { name: 'Google Blue', hex: '#1A73E8' },
  { name: 'Coral Red', hex: '#E63946' },
  { name: 'Cyber Teal', hex: '#00B4D8' },
  { name: 'Emerald', hex: '#2D6A4F' },
  { name: 'AMOLED Blue', hex: '#0066FF' },
  { name: 'Amber Sunset', hex: '#FFB703' },
]

const variantOptions = {
  TonalSpot: MaterialVariant.TonalSpot,
  Neutral: MaterialVariant.Neutral,
  Vibrant: MaterialVariant.Vibrant,
  Expressive: MaterialVariant.Expressive,
  Fidelity: MaterialVariant.Fidelity,
  Content: MaterialVariant.Content,
  Monochrome: MaterialVariant.Monochrome,
  Rainbow: MaterialVariant.Rainbow,
  FruitSalad: MaterialVariant.FruitSalad,
}

const contrastOptions = [
  { label: 'Reduced', value: MaterialContrastLevel.Reduced },
  { label: 'Default', value: MaterialContrastLevel.Default },
  { label: 'Medium', value: MaterialContrastLevel.Medium },
  { label: 'High', value: MaterialContrastLevel.High },
]

const paletteFamilies = [
  { key: 'primaryPalette', name: 'primary' },
  { key: 'secondaryPalette', name: 'secondary' },
  { key: 'tertiaryPalette', name: 'tertiary' },
  { key: 'errorPalette', name: 'error' },
  { key: 'neutralPalette', name: 'neutral' },
  { key: 'neutralVariantPalette', name: 'neutral-variant' },
] as const

const standardTones = [0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100]

// 2. Source Color Handlers
function updateHctFromHex(hex: string) {
  try {
    const cleanHex = hex.trim().startsWith('#') ? hex.trim() : '#' + hex.trim()
    if (/^#[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      const hct = Hct.fromInt(parseInt(cleanHex.replace('#', '0xff'), 16))
      hue.value = hct.hue
      chroma.value = hct.chroma
      tone.value = hct.tone
    }
  } catch {}
}

function onHexInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  sourceHex.value = val
  updateHctFromHex(val)
}

function onHueChange(e: Event) {
  hue.value = parseFloat((e.target as HTMLInputElement).value)
  sourceHex.value = hexFromArgb(sourceHct.value.toInt())
}

function onChromaChange(e: Event) {
  chroma.value = parseFloat((e.target as HTMLInputElement).value)
  sourceHex.value = hexFromArgb(sourceHct.value.toInt())
}

function onToneChange(e: Event) {
  tone.value = parseFloat((e.target as HTMLInputElement).value)
  sourceHex.value = hexFromArgb(sourceHct.value.toInt())
}

function selectPreset(hex: string) {
  sourceHex.value = hex
  updateHctFromHex(hex)
}

// 3. Functional Curried Theme Calculation
const currentTheme = computed<MaterialThemeData>(() => {
  const start = performance.now()
  const themeFactory = createTheme({
    specVersion: specVersion.value,
    oled: oled.value,
    variant: variant.value,
    contrastLevel: contrastLevel.value,
  })
  const res = themeFactory(sourceHct.value)
  latencyMs.value = performance.now() - start
  return res
})

const themeTokens = computed(() => {
  return {
    light: currentTheme.value.light || {},
    dark: currentTheme.value.dark || {},
  }
})

const themePalettes = computed(() => currentTheme.value.palettes)

const isOledActive = computed(() => {
  return (
    oled.value &&
    currentTheme.value.dark['background'] === 0xff000000 &&
    currentTheme.value.dark['surface'] === 0xff000000
  )
})

// Evaluated tone ladders for the 6 standard palettes using createPaletteTones
const evaluatedPaletteTones = computed(() => {
  const tonesGen = createPaletteTones({ tones: standardTones })
  const result: Partial<Record<SchemePaletteName, Record<number, number>>> = {}
  for (const family of paletteFamilies) {
    const pal = currentTheme.value.palettes[family.key]
    if (pal) {
      result[family.key] = tonesGen(pal)
    }
  }
  return result
})

function getPaletteToneHex(familyKey: SchemePaletteName, tone: number): string {
  const toneMap = evaluatedPaletteTones.value[familyKey]
  if (!toneMap || toneMap[tone] === undefined) return '#000000'
  return hexFromArgb(toneMap[tone])
}

const filteredTokens = computed(() => {
  const search = tokenSearch.value.trim().toLowerCase()
  const light = currentTheme.value.light || {}
  const dark = currentTheme.value.dark || {}

  return Object.keys(light)
    .map((name) => {
      const kebabCasedName = toKebabCase(name)
      const lightArgb = light[name]
      const darkArgb = dark[name] ?? lightArgb
      return {
        name,
        kebabCasedName,
        lightHex: hexFromArgb(lightArgb),
        darkHex: hexFromArgb(darkArgb),
      }
    })
    .filter(
      (token) =>
        !search ||
        token.name.toLowerCase().includes(search) ||
        token.kebabCasedName.toLowerCase().includes(search)
    )
})

// 4. Functional Curried CSS Serialization
const serializedCSS = computed<string>(() => {
  const cssSerializer = toCSS({
    format: format.value,
    colorMixSpace: colorMixSpace.value,
    varPrefix: varPrefix.value,
    paletteVarPrefix: paletteVarPrefix.value,
    wrapLightDark: wrapLightDark.value,
    includePalettes: includePalettes.value,
    includeRoot: true,
  })
  return cssSerializer(currentTheme.value)
})

// 5. Live CSS Stylesheet Adoption
let adoptedThemeSheet: CSSStyleSheet | null = null

function applyThemeStyles(cssText: string): void {
  if (typeof document === 'undefined') return

  if ('adoptedStyleSheets' in document && typeof CSSStyleSheet !== 'undefined') {
    if (!adoptedThemeSheet) {
      adoptedThemeSheet = new CSSStyleSheet()
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, adoptedThemeSheet]
    }
    try {
      adoptedThemeSheet.replaceSync(cssText)
      return
    } catch (e) {
      console.warn('CSSStyleSheet.replaceSync error, using style fallback:', e)
    }
  }

  let styleEl = document.getElementById('mcu-helper-live-theme') as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'mcu-helper-live-theme'
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = cssText
}

watchEffect(() => {
  applyThemeStyles(serializedCSS.value)
})

onMounted(() => {
  updateHctFromHex(sourceHex.value)
})

async function copyCSS() {
  try {
    await navigator.clipboard.writeText(serializedCSS.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy CSS to clipboard:', err)
  }
}
</script>

<style>
/* Custom grid 16 columns for tonal palettes */
.grid-cols-16 {
  grid-template-columns: repeat(16, minmax(0, 1fr));
}
</style>
