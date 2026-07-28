# Correção de blocos móveis, concreto e painéis

Use `aplicar_correcao_blocos_menus_v2.html` com o arquivo-base `simulador_portais_android_limites_corrigidos.html`.

O gerador produz:

- `simulador_portais_blocos_paineis_corrigido.html` — versão standalone;
- `index.html`;
- `styles.css`;
- `app.js`;
- `README.txt`.

## Correções aplicadas

- estruturas fixas com restituição zero, eliminando quique artificial;
- atrito estático maior para plataformas e paredes;
- colisão entre os polígonos realmente visíveis dos blocos parcialmente atravessados;
- contato das extremidades dos portais contra o fragmento recortado, não contra a caixa invisível inteira;
- área mínima para abrir uma costura, reduzindo criação e remoção por ruído numérico;
- idade mínima da costura antes da poda;
- histerese na troca do chart principal;
- remoção de impulsos repetitivos causados apenas por alternância do chart lógico;
- menus arrastáveis no desktop e no Android pelo cabeçalho;
- posições dos menus salvas separadamente para retrato e paisagem;
- limites de arraste respeitando safe areas e a barra rápida;
- velocidade de simulação em 0,25×, 0,5×, 1×, 2× e 4× sem alterar o timestep físico.

## Uso

1. Abra `aplicar_correcao_blocos_menus_v2.html` em Chrome ou outro navegador moderno.
2. Selecione o arquivo-base.
3. Aguarde a lista de verificações ficar verde.
4. Baixe o HTML standalone ou os três arquivos separados.

O gerador interrompe a produção caso algum trecho esperado não seja encontrado, evitando gerar silenciosamente uma versão parcialmente modificada.