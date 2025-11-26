# 🚀 QUICK START - Design System PDT Itaguara

## ⚡ Tl;dr - O que mudou?

### Cores
```
🔵 Azul PDT: #1e77fd (primary)
🟢 Verde: #22c55e (accent)
```

### Navbar
- ✅ Gradient Azul → Verde
- ✅ Branding "PDT Itaguara"
- ✅ Moderna com sombra

### HomePage
- ✅ Hero section com gradient
- ✅ 4 feature cards coloridos
- ✅ Stats section modern
- ✅ CTA compelling

---

## 📝 Usando os Componentes

### Botões
```tsx
// Primário (use assim por padrão)
<Button variant="primary">Ação Principal</Button>

// Verde/Accent (para ações especiais)
<Button variant="accent">Ação Especial</Button>

// Outline (cancelar)
<Button variant="outline">Cancelar</Button>

// Perigo (deletar)
<Button variant="danger">Deletar</Button>
```

### Cores em Texto
```tsx
// Azul PDT
<span className="text-primary-600">Texto destaque</span>

// Verde
<span className="text-accent-500">Texto especial</span>
```

### Cards
```tsx
<div className="card">
  {/* Seu conteúdo */}
</div>
```

---

## 🎨 Paleta Rápida

| Elemento | Classe | Cor |
|----------|--------|-----|
| Botão primário | `btn-primary` | 🔵 Azul PDT |
| Botão accent | `bg-accent-500` | 🟢 Verde |
| Botão danger | `btn-danger` | 🔴 Vermelho |
| Texto primário | `text-primary-600` | 🔵 Azul |
| Texto accent | `text-accent-500` | 🟢 Verde |
| Background claro | `bg-primary-50` | 💙 Muito claro |

---

## 📋 Exemplo: Criar uma Nova Seção

```tsx
// 1. Hero section
<section className="bg-gradient-pdt text-white py-24">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 className="text-5xl font-bold mb-6">Seu Título</h1>
    <Button variant="primary">Ação</Button>
  </div>
</section>

// 2. Cards grid
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  <div className="card">
    <h3 className="text-lg font-bold text-gray-900 mb-2">Card 1</h3>
    <p className="text-gray-600">Descrição...</p>
  </div>
</div>

// 3. CTA section
<section className="bg-gray-50 py-24">
  <div className="max-w-3xl mx-auto text-center">
    <h2 className="text-4xl font-bold mb-4">Chamada à Ação</h2>
    <Button variant="primary" size="lg">Comece Agora</Button>
  </div>
</section>
```

---

## 📚 Documentação Completa

- 📄 `DESIGN_IMPROVEMENTS.md` - Detalhes das melhorias
- 📄 `DESIGN_GUIDE.md` - Guia completo de componentes
- 📄 `VISUAL_SUMMARY.md` - Resumo visual

---

## ✅ Checklist: Aplicar em Suas Páginas

Para cada página que criar, use:

- [ ] Navbar com branding PDT
- [ ] Hero section com `bg-gradient-pdt`
- [ ] Cards com classe `card`
- [ ] Botões primários com `variant="primary"`
- [ ] Badges para status
- [ ] CTA com `variant="primary"` ou `accent`
- [ ] Cores seguindo a paleta
- [ ] Responsive design (mobile-first)

---

## 🎯 Próximas Páginas a Melhorar

1. ProposalsPage - aplicar cards moderno
2. VotingPage - estilos de votação
3. AdminPage - dashboard moderno
4. ProfilePage - layout harmonizado

---

## 💡 Dicas Rápidas

### Para botões grandes/destaque:
```tsx
<Button variant="primary" size="lg" className="w-full">
  Ação Importante
</Button>
```

### Para seção com fundo colorido:
```tsx
<section className="bg-gradient-pdt text-white py-24">
```

### Para título em destaque:
```tsx
<h2 className="text-4xl font-bold text-gray-900">Seu Título</h2>
```

### Para grid responsivo:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
```

---

## 🐛 Problemas Comuns

**P: Meu botão não está com gradient?**
A: Use `variant="primary"` ou `accent`

**P: Texto está muito claro/escuro?**
A: Use classes de tom (600, 700, 900 para escuro; 50, 100 para claro)

**P: Card está muito quadrado?**
A: Use `rounded-xl` em vez de `rounded-lg`

---

## 📞 Referências Rápidas

- Azul PDT: `#1e77fd` → `text-primary-600`, `bg-primary-600`, `btn-primary`
- Verde: `#22c55e` → `text-accent-500`, `bg-accent-500`, `variant="accent"`
- Gradient PDT: `bg-gradient-pdt`
- Card padrão: `className="card"`
- Botão padrão: `<Button variant="primary">`

---

**Desenvolvido em:** 26 de novembro de 2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para Usar
