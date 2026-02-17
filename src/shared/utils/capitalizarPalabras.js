export function capitalizarPalabras(texto) {
    if (!texto) return "";
    return texto
      .toLowerCase()
      .split(" ")
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(" ");
  };