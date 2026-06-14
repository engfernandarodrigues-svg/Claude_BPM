function fixBpmnPrompt(body) {
  if (!body.system || !body.system.includes('BPMN 2.0')) return body;

  body.system = `Você é especialista em BPMN 2.0 e deve gerar XML BPMN 2.0 válido e renderizável pelo bpmn-js.

REGRAS CRÍTICAS DE LAYOUT — siga exatamente:
1. Use APENAS estas tags de namespace na raiz:
   <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">

2. POOL principal com id="Pool_1" name="Processo" isExecutable="false"
   - Largura total do pool: número_de_elementos * 180 + 100
   - Altura total do pool: número_de_raias * 120 + 30

3. LANES (raias) — cada raia com altura exata de 120px:
   - Lane y começa em 30 (após header do pool)
   - Lane 1: y=30, height=120
   - Lane 2: y=150, height=120
   - Lane 3: y=270, height=120
   - etc.

4. ELEMENTOS dentro das lanes — posicionamento HORIZONTAL sequencial:
   - Evento início: width=36, height=36, centralizado verticalmente na lane (y_lane + 42)
   - UserTask/ScriptTask: width=100, height=80, y = y_lane + 20
   - Gateway: width=50, height=50, y = y_lane + 35
   - Evento fim: width=36, height=36, y = y_lane + 42
   - Espaçamento horizontal entre elementos: 180px
   - Primeiro elemento x=150, segundo x=330, terceiro x=510, etc.

5. SEQUENCE FLOWS — waypoints OBRIGATORIAMENTE em linha reta horizontal:
   - Fluxo entre elementos NA MESMA LANE: dois waypoints
     * sourceRef ponto de saída: x=source_x+width, y=source_y+(height/2)
     * targetRef ponto de entrada: x=target_x, y=target_y+(height/2)
   - Fluxo entre LANES DIFERENTES: três waypoints
     * Ponto 1: saída do source (x=source_x+width/2 ou +width, y=source_cy)
     * Ponto 2: meio do caminho, y=target_cy
     * Ponto 3: entrada do target

6. SHAPES no BPMNDiagram — cada elemento DEVE ter isHorizontal="true" se for pool/lane
   - Pool shape: x=130, y=80, width=(total), height=(total)
   - Lane shapes com isHorizontal="true"
   - Todos os outros shapes com x,y absolutos (relativo ao canvas, não à lane)

7. NUNCA use coordenadas negativas
8. NUNCA omita shapes de elementos no BPMNDiagram
9. Responda SOMENTE com o XML, sem texto antes ou depois, sem markdown`;

  return body;
}

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, anthropic-version',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/v1/messages') {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return new Response(JSON.stringify({ error: { message: 'JSON invalido' } }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const fixedBody = fixBpmnPrompt(body);

      const payload = JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: fixedBody.max_tokens || 8192,
        system: fixedBody.system,
        messages: fixedBody.messages || [],
      });

      const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: payload,
      });

      const data = await apiRes.json();

      if (apiRes.status === 200 && data.content && data.content[0] && data.content[0].text) {
        data.content[0].text = data.content[0].text.replace(/```xml|```json|```/g, '').trim();
      }

      return new Response(JSON.stringify(data), {
        status: apiRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};
