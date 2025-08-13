// Utilitários de aleatoriedade

// Retorna um ângulo aleatório de 0 a 2π
export const randAng = () => Math.random() * Math.PI * 2;

// Retorna um número aleatório entre a e b
export function rrand(a, b) {
  return a + Math.random() * (b - a);
}

