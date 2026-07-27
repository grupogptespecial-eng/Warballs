# Controle de velocidade do simulador de portais

Este pacote adiciona controle temporal ao simulador final sem aumentar o timestep físico.

## Velocidades

- 0,25×
- 0,5×
- 1×
- 2×
- 4×

O motor continua usando passos de `1/240 s`. A velocidade altera a quantidade de tempo simulado acumulada por segundo real.

## Uso

1. Baixe o núcleo final do simulador e salve-o como `simulador-core.html`.
2. Abra `index.html`.
3. Na primeira execução, selecione `simulador-core.html` no seletor de arquivos.
4. O núcleo fica salvo no navegador, quando o armazenamento local estiver disponível.

## Controles

- `Pausar/Continuar`: pausa o tempo simulado.
- seletor de velocidade: escolhe diretamente o multiplicador.
- botão `1×`, `2×` etc.: alterna entre as cinco velocidades.
- `[` diminui a velocidade.
- `]` aumenta a velocidade.
- `\` retorna para 1×.
- `Espaço` pausa ou continua.

## Android

Os controles ficam próximos à parte inferior e respeitam a área segura da navegação por gestos. Em aparelhos que não sustentem 2× ou 4×, a proteção de desempenho limita o número de passos por frame e mantém a interface responsiva.

## Arquivos

- `index.html`: interface principal.
- `styles.css`: layout responsivo.
- `app.js`: acumulador temporal e integração com `window.__portalDebug`.
- `simulador_portais_velocidade_exportador.html`: versão em um único arquivo do controlador/exportador.
