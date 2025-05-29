
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-6 md:py-8 text-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-sky-400">
        Procesador de Documentación Markdown
      </h1>
      <p className="mt-3 text-md sm:text-lg text-slate-300 max-w-2xl mx-auto">
        Seleccione una carpeta de su sistema. La aplicación leerá recursivamente los archivos Markdown (o la extensión especificada) y mostrará sus rutas relativas y contenido.
      </p>
    </header>
  );
};
