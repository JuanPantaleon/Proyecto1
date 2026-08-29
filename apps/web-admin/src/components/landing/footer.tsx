'use client';

import { Send, Camera, Video, Code, Dumbbell } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-gray-800/50 bg-black">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <Dumbbell className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Ranked Fitness</span>
            </div>
            <p className="text-gray-400 max-w-md mb-8">
              La única plataforma que cuantifica tu fuerza real, valida tus marcas sin trampas y te sitúa en un ranking global competitivo.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors" aria-label="Twitter">
                <Send className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors" aria-label="Instagram">
                <Camera className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors" aria-label="YouTube">
                <Video className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors" aria-label="GitHub">
                <Code className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Producto</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="/simulador" className="hover:text-red-400 transition-colors">Simulador ISG</a></li>
              <li><a href="/catalogo" className="hover:text-red-400 transition-colors">Catálogo de Ejercicios</a></li>
              <li><a href="/ranking" className="hover:text-red-400 transition-colors">Ranking Global</a></li>
              <li><a href="/marketplace" className="hover:text-red-400 transition-colors">Marketplace Coaches</a></li>
              <li><a href="/app" className="hover:text-red-400 transition-colors">Descargar App</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="/nosotros" className="hover:text-red-400 transition-colors">Sobre Nosotros</a></li>
              <li><a href="/blog" className="hover:text-red-400 transition-colors">Blog</a></li>
              <li><a href="/carreras" className="hover:text-red-400 transition-colors">Carreras</a></li>
              <li><a href="/prensa" className="hover:text-red-400 transition-colors">Prensa</a></li>
              <li><a href="/contacto" className="hover:text-red-400 transition-colors">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal y Comunidad</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="/terminos" className="hover:text-red-400 transition-colors">Términos de Uso</a></li>
              <li><a href="/privacidad" className="hover:text-red-400 transition-colors">Política de Privacidad</a></li>
              <li><a href="/anti-trampas" className="hover:text-red-400 transition-colors">Política Anti-Trampas</a></li>
              <li><a href="/moderacion" className="hover:text-red-400 transition-colors">Normas de Moderación</a></li>
              <li><a href="/cookies" className="hover:text-red-400 transition-colors">Política de Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800/50 flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 Ranked Fitness. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-red-400 transition-colors">iOS App Store</a>
            <a href="#" className="hover:text-red-400 transition-colors">Google Play</a>
            <a href="#" className="hover:text-red-400 transition-colors">PWA Web</a>
          </div>
        </div>
      </div>
    </footer>
  );
}