'use client';

import * as React from 'react';
import {
  ThemeFamily,
  THEME_FAMILIES,
  generateTheme,
  themeToCSS,
  mapToSemanticVars,
} from '@/lib/theme';
import { cn } from '@/lib/utils';
import { Moon, Sun, ChefHat, User, Search, Bell, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function ThemeFamiliesShowcase() {
  const [activeFamily, setActiveFamily] = React.useState<ThemeFamily>('tomato');
  const [isDark, setIsDark] = React.useState(false);

  // Generate complete CSS variables for the wrapper
  // This simulates exactly how the theme is applied at the root level
  const themeStyles = React.useMemo(() => {
    const rawTheme = generateTheme(activeFamily, { isDark });
    const rawVars = themeToCSS(rawTheme);
    const semanticVars = mapToSemanticVars(rawVars, isDark);
    return { ...rawVars, ...semanticVars } as React.CSSProperties;
  }, [activeFamily, isDark]);

  const families: ThemeFamily[] = [
    'default',
    'tomato',
    'carrot',
    'yolk',
    'basil',
    'kale',
    'blueberry',
    'beet',
    'espresso',
    'charcoal',
  ];

  return (
    <div className="w-full transition-colors duration-500" style={themeStyles}>
      {/* Wrapper acts as the theme provider scope */}
      <div className="bg-background text-foreground min-h-screen transition-colors duration-500">
        {/* Sticky Header */}
        <div className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 border-b backdrop-blur transition-all duration-500">
          <div className="container mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 md:flex-row md:items-center md:justify-between">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm">
                <ChefHat className="size-6" />
              </div>
              <div className="hidden sm:block">
                <h2 className="text-sm leading-none font-bold">Tally Design</h2>
                <p className="text-muted-foreground mt-1 font-mono text-xs">
                  {THEME_FAMILIES[activeFamily].name}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-4">
              <div className="bg-muted/50 flex gap-1.5 rounded-full p-1">
                {families.map((f) => {
                  const isActive = activeFamily === f;
                  const familyScale = generateTheme(f).primary;

                  return (
                    <button
                      key={f}
                      onClick={() => setActiveFamily(f)}
                      className={cn(
                        'relative flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-300',
                        isActive
                          ? 'bg-background ring-border scale-110 shadow-sm ring-1'
                          : 'hover:bg-background/50 hover:scale-105'
                      )}
                      title={THEME_FAMILIES[f].name}
                    >
                      <div
                        className={cn(
                          'size-4 rounded-full transition-transform',
                          isActive ? 'scale-110' : ''
                        )}
                        style={{
                          backgroundColor: familyScale[9],
                        }}
                      />
                      {isActive && (
                        <div className="bg-foreground border-background absolute -right-1 -bottom-1 flex size-3 items-center justify-center rounded-full border-2">
                          <Check className="text-background size-2 stroke-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="bg-border mx-2 h-6 w-px shrink-0" />

              <button
                onClick={() => setIsDark(!isDark)}
                className="bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full p-2 transition-colors"
              >
                {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="mx-auto max-w-4xl space-y-16 p-6 pb-32 md:p-12">
          {/* Hero Section */}
          <section className="animate-in fade-in slide-in-from-bottom-4 space-y-8 text-center duration-700">
            <h1 className="text-foreground font-serif text-4xl leading-[1.1] font-medium tracking-tight md:text-6xl">
              Comida honesta,
              <br />
              <span className="text-primary decoration-primary/20 underline decoration-wavy decoration-2 underline-offset-8">
                experiencias memorables.
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto max-w-xl text-lg leading-relaxed">
              Explora cómo nuestra paleta de colores orgánicos se adapta a cada componente,
              manteniendo siempre la legibilidad y la calidez.
            </p>
            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
              <Button
                size="lg"
                className="shadow-primary/10 hover:shadow-primary/20 h-12 rounded-full px-8 text-base shadow-xl transition-all"
              >
                Empezar pedido
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-background/50 h-12 rounded-full px-8 text-base backdrop-blur-sm"
              >
                Ver el menú
              </Button>
            </div>
          </section>

          <div className="grid items-start gap-8 md:grid-cols-2">
            {/* Left Column: Forms & Structure */}
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                    Estructura & Formularios
                  </h3>
                </div>

                <Card className="shadow-sm transition-shadow duration-300 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="text-primary size-5" />
                      Configuración de cuenta
                    </CardTitle>
                    <CardDescription>Ejemplo de formulario denso</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-xs font-semibold uppercase">
                        Información Personal
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Nombre" defaultValue="Alvaro" />
                        <Input placeholder="Apellido" defaultValue="Lostal" />
                      </div>
                      <Input placeholder="Email" defaultValue="alvaro@tally.com" />
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="text-muted-foreground text-xs font-semibold uppercase">
                        Preferencias
                      </label>
                      <div className="bg-muted/10 flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">Notificaciones</label>
                          <p className="text-muted-foreground text-xs">
                            Recibir updates por correo
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 flex justify-end gap-3 border-t p-4">
                    <Button variant="ghost" size="sm">
                      Cancelar
                    </Button>
                    <Button size="sm">Guardar cambios</Button>
                  </CardFooter>
                </Card>
              </section>

              <section className="space-y-4">
                <Card className="bg-primary text-primary-foreground shadow-primary/20 relative overflow-hidden border-none shadow-xl">
                  <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 rounded-full bg-white/10 p-32 blur-3xl" />
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md">
                      <Bell className="size-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">Estado del Pedido</CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                      Tu pedido #382 está en cocina.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      variant="secondary"
                      className="text-primary w-full border-none bg-white shadow-none hover:bg-white/90"
                    >
                      Ver detalles
                    </Button>
                  </CardFooter>
                </Card>
              </section>
            </div>

            {/* Right Column: Interactive Elements */}
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                    Elementos Interactivos
                  </h3>
                </div>

                <div className="bg-card/50 space-y-6 rounded-2xl border p-6 backdrop-blur-sm">
                  {/* Search Bar Mock */}
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="text-muted-foreground group-focus-within:text-primary size-4 transition-colors" />
                    </div>
                    <Input
                      className="bg-background/50 border-muted-foreground/20 focus:bg-background pl-9 transition-all"
                      placeholder="Buscar platos, ingredientes..."
                    />
                  </div>

                  {/* Tabs Mock */}
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="all">Todo</TabsTrigger>
                      <TabsTrigger value="food">Comida</TabsTrigger>
                      <TabsTrigger value="drinks">Bebidas</TabsTrigger>
                    </TabsList>
                    <TabsContent
                      value="all"
                      className="bg-muted/10 text-muted-foreground mt-2 rounded-lg p-2 text-center text-sm"
                    >
                      Mostrando 24 resultados...
                    </TabsContent>
                    <TabsContent
                      value="food"
                      className="bg-muted/10 text-muted-foreground mt-2 rounded-lg p-2 text-center text-sm"
                    >
                      Mostrando 12 platos...
                    </TabsContent>
                    <TabsContent
                      value="drinks"
                      className="bg-muted/10 text-muted-foreground mt-2 rounded-lg p-2 text-center text-sm"
                    >
                      Mostrando 8 bebidas...
                    </TabsContent>
                  </Tabs>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge>Disponible</Badge>
                    <Badge variant="secondary">Agotado</Badge>
                    <Badge variant="outline">Vegetariano</Badge>
                    <Badge
                      className="animate-pulse border-none text-white shadow-sm"
                      style={{ backgroundColor: generateTheme('basil').primary[9] }}
                    >
                      Oferta
                    </Badge>
                  </div>
                </div>
              </section>

              {/* Button Variations */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                    Botones
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="w-full">Default</Button>
                  <Button variant="secondary" className="w-full">
                    Secondary
                  </Button>
                  <Button variant="outline" className="w-full">
                    Outline
                  </Button>
                  <Button variant="ghost" className="w-full">
                    Ghost
                  </Button>
                  <Button variant="destructive" className="col-span-2 w-full">
                    Destructive Action
                  </Button>
                </div>
              </section>

              {/* List Mock */}
              <section className="space-y-4">
                <div className="bg-card overflow-hidden rounded-2xl border">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="hover:bg-muted/40 group flex cursor-pointer items-center gap-4 border-b p-4 transition-colors last:border-0"
                    >
                      <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110">
                        <span className="text-muted-foreground text-xs font-bold">0{i}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">Mesa {i} - Zona Principal</p>
                        <p className="text-muted-foreground truncate text-xs">
                          Hace {i * 12} minutos • 3 comensales
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={cn(
                            'text-xs font-bold',
                            i === 1 ? 'text-primary' : 'text-muted-foreground'
                          )}
                        >
                          {i === 1 ? 'Activo' : 'Cerrado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
