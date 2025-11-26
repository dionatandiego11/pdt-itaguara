# 🧪 Guia de Teste - Melhorias Visuais PDT Itaguara

## 🎯 Como Visualizar as Melhorias

### Pré-requisitos
- Node.js 16+ instalado
- Projeto frontend clonado
- Dependências instaladas (`npm install`)

---

## 🚀 Iniciar o Frontend

### Via Terminal
```bash
cd frontend
npm run dev
```

### Esperado
```
VITE v4.x.x
ready in XX ms

➜  Local:   http://localhost:5173/
```

Acesse: **http://localhost:5173/**

---

## ✅ Checklist Visual - O que Conferir

### 1. 🎨 Navbar (Está visível em todas as páginas)
- [ ] Background com gradient Azul → Verde
- [ ] Logo "📋 PDT Itaguara"
- [ ] Subtítulo "Democracia Direta"
- [ ] Navegação com hover effect
- [ ] Responsivo em mobile (hamburger menu)
- [ ] Sombra visível na parte inferior

**Cores esperadas:**
- Fundo: Gradient Azul (#1e77fd) → Verde (#22c55e)
- Texto: Branco
- Links active: Fundo branco com transparência

---

### 2. 🏠 HomePage (Principal)

#### Hero Section
- [ ] Background gradient Azul → Verde
- [ ] Título grande em branco
- [ ] Subtítulo com boa legibilidade
- [ ] Badge com "Plataforma de Democracia Direta"
- [ ] 2 botões com contraste (um branco, um com border)
- [ ] Texto em branco sobre gradient
- [ ] Responsivo (texto legível em mobile)

#### Seção de Funcionalidades
- [ ] 4 cards em grid
- [ ] Ícones coloridos com backgrounds gradiente
- [ ] Hover effect com shadow
- [ ] Rounded corners suave (xl)
- [ ] Cards: Repositórios, Propostas, Votação, Demandas
- [ ] Descrições claras

**Cards esperados:**
1. 🔵 Azul → Primário (Repositórios)
2. 🔵→🟢 Gradient (Propostas)
3. 🟢→ Escuro (Votação)
4. 🟠→ Vermelho (Demandas)

#### Seção de Benefícios
- [ ] 3 cards em background cinza claro
- [ ] Ícones em círculos coloridos
- [ ] Títulos: Rapidez, Segurança, Participação
- [ ] Sem hover, apenas estático

#### Stats Section (Após login)
- [ ] Background gradient Azul → Verde
- [ ] Texto: "Bem-vindo, [Nome]!"
- [ ] 3 cards com glass morphism (transparência)
- [ ] Ícones acompanhando stats
- [ ] Números grandes em branco
- [ ] Background: Branco com 10% opacity

#### CTA Section
- [ ] Título: "Sua voz importa"
- [ ] Ícone de lâmpada
- [ ] 2 botões destacados
- [ ] Background: Cinza muito claro

---

### 3. 🔘 Componentes

#### Botões (procure ao longo da app)
```
Primary (Azul PDT com gradient):
  [ ] Hover com shadow mais escura
  [ ] Transição suave
  [ ] Text branco

Accent (Verde):
  [ ] Diferente do primary
  [ ] Também com gradient
  [ ] Shadow no hover

Outline:
  [ ] Border 2px
  [ ] Hover muda cor

Danger:
  [ ] Fundo vermelho
  [ ] Branco em cima
```

#### Badges
- [ ] Primário: Fundo Azul claro, texto Azul escuro
- [ ] Accent: Fundo Verde claro, texto Verde escuro
- [ ] Success: Verde mais escuro
- [ ] Warning: Laranja
- [ ] Danger: Vermelho

#### Inputs
- [ ] Border 2px (não 1px)
- [ ] Focus com ring Azul
- [ ] Transição suave no focus

#### Cards
- [ ] Rounded corners (xl = 12px)
- [ ] Shadow md (padrão)
- [ ] Shadow lg (hover)
- [ ] Border 1px cinza claro

---

### 4. 📱 Responsividade

#### Mobile (< 768px)
- [ ] Navbar menu collapsa em hamburger
- [ ] Hero text redimensiona corretamente
- [ ] Cards em stack vertical
- [ ] Botões 100% width em mobile
- [ ] Nenhum overflow horizontal
- [ ] Padding/margin apropriado

#### Tablet (768px - 1024px)
- [ ] Grid de 2 colunas para cards
- [ ] Navbar com navegação completa
- [ ] Hero com layout bom

#### Desktop (> 1024px)
- [ ] Grid de 3-4 colunas
- [ ] Layout máximo 7xl
- [ ] Navbar horizontal completo

---

### 5. 🎨 Cores Verificadas

```
Visual Check:
☐ Azul PDT (#1e77fd) presente em:
  - Navbar background
  - Botões primary
  - Links ativos
  - Texto destacado

☐ Verde (#22c55e) presente em:
  - Parte final dos gradients
  - Botões accent
  - Badges accent

☐ Cinza neutro presente em:
  - Backgrounds neutros
  - Texto secundário
  - Borders

☐ Sem cores aleatórias fora da paleta
```

---

## 🔍 Testes Específicos

### Teste 1: Gradients
```
Acesse: HomePage
Procure: Navbar, Hero Section, CTAs
Verificar:
  - [ ] Gradient suave de Azul para Verde
  - [ ] Ângulo: 135deg (diagonal)
  - [ ] Cores corretas nos extremos
```

### Teste 2: Typography
```
Acesse: HomePage
Procure: Todos os títulos e textos
Verificar:
  - [ ] Títulos: Bold, legível, hierarquia clara
  - [ ] Subtítulos: Semibold
  - [ ] Body: Regular, good contrast
  - [ ] Font: Inter (check no DevTools)
```

### Teste 3: Spacing/Layout
```
Acesse: HomePage
Procure: Gaps entre elementos
Verificar:
  - [ ] Consistent spacing (gap-8, py-24, etc)
  - [ ] Elementos alinhados
  - [ ] Max-width respeitado (7xl)
  - [ ] Padding simétrico
```

### Teste 4: Interações
```
Acesse: HomePage
Ações:
  - [ ] Hover em botão: sombra muda
  - [ ] Hover em card: sombra aumenta
  - [ ] Focus em input: ring azul aparece
  - [ ] Mobile: menu abre/fecha suave
```

### Teste 5: Acessibilidade
```
Verificar:
  - [ ] Contraste suficiente (WCAG AA)
  - [ ] Texto branco sobre Azul PDT: OK
  - [ ] Texto branco sobre Verde: OK
  - [ ] Cores não são único diferencial
  - [ ] Elementos têm aria-labels quando necessário
```

---

## 🐛 Debugging no DevTools

### Inspecionar Navbar
```javascript
// Chrome DevTools Console
document.querySelector('nav').className
// Deve conter: bg-gradient-pdt, shadow-lg, sticky

// Verificar gradient
getComputedStyle(document.querySelector('nav')).backgroundImage
// Deve mostrar o gradient
```

### Inspecionar Cores
```javascript
// Verificar cor primária
getComputedStyle(document.querySelector('nav')).backgroundColor

// Ou via CSS variables
getComputedStyle(document.querySelector('nav'))
  .getPropertyValue('--color-primary')
```

---

## 📊 Comparativo Esperado

### ANTES vs DEPOIS

```
NAVBAR
❌ Antes: bg-white border-b border-gray-200
✅ Depois: bg-gradient-pdt shadow-lg

BUTTONS
❌ Antes: bg-primary-600 hover:bg-primary-700
✅ Depois: bg-gradient-to-r from-primary-600 to-primary-500 hover:shadow-lg

HERO
❌ Antes: bg-gradient-to-b from-primary-50 to-white
✅ Depois: bg-gradient-pdt (Azul→Verde full-width)

CARDS
❌ Antes: rounded-lg shadow-md
✅ Depois: rounded-xl shadow-md hover:shadow-lg
```

---

## ✨ Visual Expectations

### Cores RGB (referência)
```
Azul PDT:
- rgb(30, 119, 253)  ← #1e77fd
- Deve parecer: Azul brilhante, profissional

Verde:
- rgb(34, 197, 94)   ← #22c55e
- Deve parecer: Verde fresco, natural

Cinza:
- rgb(17, 24, 39)    ← #111827
- Deve parecer: Cinza bem escuro, quase preto
```

---

## 📋 Checklist Final

### Antes de Deployar
- [ ] Navbar aparece com gradient
- [ ] HomePage carrega com novo design
- [ ] Todos os botões aplicam estilos corretos
- [ ] Cards com rounded-xl
- [ ] Responsividade funciona
- [ ] Sem console errors
- [ ] Performance é boa (sem jank)
- [ ] Cores consistentes
- [ ] Contraste acessível

### Para Produção
- [ ] Build otimizado: `npm run build`
- [ ] Tamanho CSS não inflacionou muito
- [ ] Performance scores mantidos
- [ ] Nenhum breaking change
- [ ] Documentação atualizada

---

## 🎬 Vídeo Mental

Se tudo estiver correto, ao acessar a página você deve ver:

1. **Tela carrega** → Navbar já com gradient Azul→Verde
2. **Scroll down** → Hero com gradient grande, botões destacados
3. **Mais abaixo** → 4 cards com ícones e gradients diferentes
4. **Bottom** → CTA section com layout limpo

**Impressão geral:** Profissional, moderno, alinhado com identidade PDT

---

## 💬 Feedback

Se notar algo diferente:

1. Verifique o terminal por erros
2. Limpe cache: `Ctrl+Shift+R` (Windows)
3. Verifique DevTools (Colors, Console, Network)
4. Tire print para comparar
5. Verifique se fez `npm install` após mudanças

---

## 📞 Referência Rápida

| Elemento | Deve ter | Cor |
|----------|----------|-----|
| Navbar | gradient-pdt, shadow-lg | Azul→Verde |
| Hero | bg-gradient-pdt, text-white | Azul→Verde |
| Buttons | gradient ou solid | Primary/Accent |
| Cards | rounded-xl, shadow | Branco com border |
| Badges | rounded-full | Conforme variant |

---

**Testado em:** 26 de novembro de 2025  
**Status:** ✅ Pronto para Visualização
