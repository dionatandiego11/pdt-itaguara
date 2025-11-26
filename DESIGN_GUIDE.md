# 🎨 Guia de Uso - Design System PDT Itaguara

## 📋 Índice
1. [Paleta de Cores](#paleta-de-cores)
2. [Componentes](#componentes)
3. [Utilitários](#utilitários)
4. [Exemplos de Uso](#exemplos-de-uso)
5. [Regras de Design](#regras-de-design)

---

## 🎨 Paleta de Cores

### Cores Primárias

#### Azul PDT (Primary)
```
500: #1e77fd  ← Principal
600: #1b5fc7  ← Hover/Active
700: #1548a0  ← Darker
```
**Uso:** Botões primários, links, navbar, cards destacados

#### Verde (Accent)
```
500: #22c55e  ← Principal
600: #16a34a  ← Hover/Active
700: #15803d  ← Darker
```
**Uso:** CTAs secundárias, botões accent, destaque visual

### Cores de Status

| Status | Cor | Código | Uso |
|--------|-----|--------|-----|
| Success | Verde | #16a34a | Confirmações, OK |
| Warning | Laranja | #d97706 | Avisos, atenção |
| Danger | Vermelho | #dc2626 | Erros, deletar |

### Cores Neutras

| Elemento | Cor | Código |
|----------|-----|--------|
| Texto principal | Cinza 900 | #111827 |
| Texto secundário | Cinza 600 | #4b5563 |
| Borders | Cinza 200 | #e5e7eb |
| Background | Branco | #ffffff |

---

## 🧩 Componentes

### Button

#### Variantes
```tsx
// Primária (Principal)
<Button variant="primary">Ação Principal</Button>
// Background gradient Azul PDT

// Secundária (Cinza neutro)
<Button variant="secondary">Ação Secundária</Button>
// Background cinza 100

// Outline (Border)
<Button variant="outline">Cancelar</Button>
// Border 2px Cinza 300

// Danger (Vermelho)
<Button variant="danger">Deletar</Button>
// Background Vermelho

// Accent (Verde)
<Button variant="accent">Ação Especial</Button>
// Background gradient Verde
```

#### Tamanhos
```tsx
<Button size="sm">Pequeno</Button>    {/* px-3 py-1.5 text-sm */}
<Button size="md">Médio</Button>      {/* px-4 py-2 text-base */}
<Button size="lg">Grande</Button>     {/* px-6 py-3 text-lg */}
```

#### Estados
```tsx
<Button disabled>Desativado</Button>
<Button isLoading>Carregando...</Button>
```

#### Exemplo Completo
```tsx
<Button 
  variant="primary" 
  size="lg" 
  onClick={handleSubmit}
  className="w-full"
>
  Enviar Proposta
</Button>
```

---

### Badge

#### Variantes
```tsx
<Badge variant="primary">Novo</Badge>       {/* Azul PDT */}
<Badge variant="accent">Featured</Badge>    {/* Verde */}
<Badge variant="success">Aprovado</Badge>   {/* Verde escuro */}
<Badge variant="warning">Pendente</Badge>   {/* Laranja */}
<Badge variant="danger">Rejeitado</Badge>   {/* Vermelho */}
```

#### Exemplo de Uso
```tsx
<div className="flex gap-2">
  <Badge variant="primary">Democracia</Badge>
  <Badge variant="accent">PDT</Badge>
  <Badge variant="success">Ativo</Badge>
</div>
```

---

### Modal

#### Estrutura
```tsx
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal
      </Button>

      <Modal
        isOpen={isOpen}
        title="Confirmar Ação"
        onClose={() => setIsOpen(false)}
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleConfirm}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <p>Tem certeza que deseja prosseguir?</p>
      </Modal>
    </>
  )
}
```

---

### Card

#### Tamanho padrão
```tsx
<div className="card">
  {/* Conteúdo */}
</div>

{/* Gera: */}
{/* bg-white rounded-xl shadow-md border border-gray-100 p-6 */}
{/* hover:shadow-lg transition-shadow */}
```

#### Com hover especial
```tsx
<div className="card-hover">
  {/* Conteúdo com hover aprimorado */}
</div>
```

#### Exemplo Completo
```tsx
<div className="card">
  <h3 className="text-lg font-bold text-gray-900 mb-2">
    Título da Proposta
  </h3>
  <p className="text-gray-600 mb-4">
    Descrição da proposta...
  </p>
  <div className="flex gap-2">
    <Badge variant="primary">Pendente</Badge>
    <span className="text-sm text-gray-500">5 votos</span>
  </div>
</div>
```

---

## 🎨 Utilitários CSS

### Backgrounds
```tsx
// Gradients
<div className="bg-gradient-pdt">      {/* Azul → Verde */}
<div className="bg-gradient-dark">     {/* Azul dark → Verde dark */}

// Cores de fundo
<div className="bg-primary-50">        {/* Muito claro */}
<div className="bg-primary-600">       {/* Escuro */}

// Backgrounds especiais
<div className="bg-gradient-pdt-light">  {/* Gradient claro */}
```

### Texts
```tsx
// Cores de texto
<span className="text-primary-600">       {/* Azul PDT */}
<span className="text-accent-500">        {/* Verde */}
<span className="text-gray-600">         {/* Cinza */}

// Estilos
<h1 className="section-header">           {/* Grande, bold */}
<p className="section-subtitle">          {/* Médio, cinza */}
```

### Buttons (CSS Utilities)
```tsx
<button className="btn-primary">         {/* Azul com gradient */}
<button className="btn-secondary">       {/* Cinza */}
<button className="btn-outline">         {/* Border */}
<button className="btn-danger">          {/* Vermelho */}
```

### Inputs
```tsx
<input className="input-field" />
{/* 
  - Border 2px cinza
  - Focus com ring Azul PDT
  - Transições suaves
*/}
```

### Cards
```tsx
<div className="card">                    {/* Card padrão */}
<div className="card-hover">              {/* Com efeito hover */}
```

---

## 💡 Exemplos de Uso

### Hero Section
```tsx
<section className="bg-gradient-pdt text-white py-24">
  <div className="max-w-7xl mx-auto px-4">
    <h1 className="text-6xl font-bold mb-4">
      PDT Itaguara
    </h1>
    <p className="text-xl text-blue-100 mb-8">
      Gestão Participativa
    </p>
    <Button variant="primary" size="lg">
      Começar Agora
    </Button>
  </div>
</section>
```

### Feature Cards
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  <div className="card">
    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 text-white flex items-center justify-center mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">
      Título
    </h3>
    <p className="text-gray-600">
      Descrição...
    </p>
  </div>
</div>
```

### Form Section
```tsx
<div className="card max-w-md mx-auto">
  <h2 className="text-2xl font-bold text-gray-900 mb-6">
    Criar Proposta
  </h2>
  
  <input className="input-field mb-4" placeholder="Título" />
  <textarea className="input-field mb-6" placeholder="Descrição" />
  
  <div className="flex gap-3">
    <Button variant="outline" className="flex-1">
      Cancelar
    </Button>
    <Button variant="primary" className="flex-1">
      Enviar
    </Button>
  </div>
</div>
```

### Stats Section
```tsx
<section className="bg-gradient-pdt text-white py-16">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div className="text-center">
      <div className="text-5xl font-bold mb-2">42</div>
      <p className="text-blue-100">Propostas Ativas</p>
    </div>
    {/* Mais stats... */}
  </div>
</section>
```

---

## 📐 Regras de Design

### 1. Espaçamento
- **Gaps**: 4px (sm), 8px (md), 16px (lg)
- **Padding**: 4px, 8px, 16px, 24px, 32px
- **Margins**: usar classes Tailwind

### 2. Tipografia
- **Headers (h1, h2)**: font-bold com tracking-tight
- **Subtitles (h3)**: font-semibold
- **Body text**: 400-500 weight
- **Buttons**: 600+ weight

### 3. Rounded Corners
- **Buttons/Inputs**: `rounded-lg` (8px)
- **Cards**: `rounded-xl` (12px)
- **Modals**: `rounded-2xl` (16px)
- **Badges**: `rounded-full`

### 4. Shadows
- **Cards**: `shadow-md` (padrão) → `shadow-lg` (hover)
- **Buttons**: `shadow-lg` (hover)
- **Modals**: `shadow-2xl`

### 5. Transições
- **Padrão**: 0.3s ease-in-out
- **Aplicar em**: colors, shadows, transforms
- **Hover**: `transition-all` para múltiplas propriedades

### 6. Contraste
- ✅ Texto branco sobre Azul PDT
- ✅ Texto branco sobre Verde
- ✅ Texto cinza 900 sobre branco
- ⚠️ Evitar texto cinza 600 sobre cinza 100

### 7. Estados
- **Default**: cor base
- **Hover**: shadow + lighter ou darker (dependendo da cor)
- **Active/Focus**: ring de cor primária
- **Disabled**: opacity 50%
- **Loading**: cursor pointer + animação

---

## 🚀 Próximos Passos

1. Aplicar novos estilos em todas as páginas
2. Criar storybook para documentação visual
3. Implementar temas escuro (dark mode)
4. Adicionar mais animações micro
5. Otimizar performance de CSS

---

## ❓ FAQ

**P: Como uso a cor Azul PDT em um elemento customizado?**
A: Use a classe `text-primary-600` ou `bg-primary-600`

**P: Como faço um botão com sombra no hover?**
A: Use `hover:shadow-lg` + `transition-all`

**P: Posso usar cores diferentes das da paleta?**
A: Sim, mas mantenha a consistência. Preferencialmente use a paleta definida.

**P: Como adiciono um novo componente?**
A: Crie em `src/components/` e siga o padrão dos existentes.

---

**Última atualização:** 26 de novembro de 2025
**Versão:** 1.0
**Mantido por:** Equipe de Design
