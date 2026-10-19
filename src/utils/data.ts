/**
 * Formata a data ISO para exibição no perfil do usuário ("Membro desde ...")
 * Retorna por padrão o formato "19 de setembro de 2026" ou "Recentemente"
 */
export function formatarMembroDesde(dataIso?: string): string {
  if (!dataIso) return "Recentemente";

  const data = new Date(dataIso);
  if (isNaN(data.getTime())) return "Recentemente";

  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(data);
}
