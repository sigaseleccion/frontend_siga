export function getNivelFormacionLabel(nivel) {
  const value = (nivel ?? "").toString().toLowerCase().trim();
  const labels = {
    tecnica: "Técnica",
    tecnologia: "Tecnología",
    profesional: "Profesional",
  };
  return labels[value] || (nivel ?? "-");
}
