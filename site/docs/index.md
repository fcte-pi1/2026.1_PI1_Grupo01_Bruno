---
hide:
  - navigation
  - toc
  
---

<link rel="stylesheet" href="assets/css/index.css">
<link rel="stylesheet" href="assets/css/team.css">
<link rel="stylesheet" href="assets/css/telemetry.css">
<link rel="stylesheet" href="assets/css/fases.css">
<link rel="stylesheet" href="assets/css/lab-size.css">
<link rel="stylesheet" href="assets/css/algorithm.css">
<link rel="stylesheet" href="assets/css/footer.css">

<div class="page">
  <section class="hero">
    <div class="hero-container">
      <div class="status-badge">
        <span class="status-dot"></span>
        <p>UNB · PROJETO INTEGRADOR · 2026.1</p>
      </div>
      <div class="hero-content">
        <h1>MICROMOUSE <br> <span class="highlight-orange">DE COMPETIÇÃO.</span></h1>
        <p>Este projeto, desenvolvido na disciplina <span class="highlight-bold">Projeto Integrador de Engenharia</span> da Universidade de Brasília, tem como objetivo construir um minirrobô autônomo capaz de percorrer e encontrar a saída de labirintos.</p>
        <div class="btn-containers">
          <a href="https://github.com/fcte-pi1/2026.1_PI1_Grupo01_Bruno" class="btn-repo1" target="_blank">REPOSITÓRIO DO PROJETO</a>
          <a href="#team-section-start" class="btn-repo2">SOBRE A EQUIPE </a>
        </div>
      </div>
    </div>
  </section>

  <section class="system lab-size-section">
    <div style="display:flex; flex-direction:column; text-align:center;">
      <div class="system-header">
        <div class="line-header">
          <p class="subtitle">// TAMANHOS DE LABIRINTO</p>
          <p class="line"> </p>
        </div>
        <h1 style="display: align-items: center;text-align: center;">
          OS TRÊS TIPOS <span class="highlight"> DE LABIRINTO. </span>
        </h1>
      </div>
      <div class="lab-cards-container">
        <div class="lab-card">
          <div class="lab-card-content">
            <p class="lab-level">// NÍVEL 01</p>
            <h2>LABIRINTO 4×4</h2>
          </div>
          <div class="maze-visual grid-4x4"></div>
          <p class="lab-desc">16 células. O ponto de entrada para calibração de sensores e validação do algoritmo de busca.</p>
        </div>
        <div class="lab-card">
          <div class="lab-card-content">
            <p class="lab-level">// NÍVEL 02</p>
            <h2>LABIRINTO 8×8</h2>
          </div>
          <div class="maze-visual grid-8x8"></div>
          <p class="lab-desc">64 células. Exige mapeamento progressivo e otimização de rota durante o percurso.</p>
        </div>
        <div class="lab-card border-none">
          <div class="lab-card-content">
            <p class="lab-level">// NÍVEL 03</p>
            <h2>LABIRINTO 16×16</h2>
          </div>
          <div class="maze-visual grid-16x16"></div>
          <p class="lab-desc">256 células. Padrão de competição internacional. </p>
        </div>
      </div>
      <p class="lab-size-obs"> *Um ponto muito importante é que o ratinho não sabe de antemão o tipo de labirinto, ele precisa descobrir enquanto o explora.</p>
    </div>
  </section>
  
  <section class="system algorithm-section">
    <div class="system-header" style="margin-bottom:0;">
      <div class="line-header">
        <p class="subtitle">// ALGORITMO</p>
        <p class="line"> </p>
      </div>
      <h1>
          FLOOD FILL,<br>
          <span class="highlight"> A MELHOR ROTA. </span>
      </h1>
    </div>
    <div class="flood-container">
      <div class="flood-content">
        <p class="flood-description">
          O flood fill atribui a cada célula um valor que representa a distância até o objetivo. O micromouse sempre se move para a célula vizinha com o menor valor.
        </p>
        <div class="steps-container">
          <div class="step-card active" onclick="changeActiveStep(this)">
            <div class="step-number">1</div>
            <div class="step-text">
              <h3>Inicialização</h3>
              <p>O objetivo recebe valor 0, enquanto as demais células começam com 
        distâncias altas. </p>
            </div>
          </div>
          <div class="step-card" onclick="changeActiveStep(this)">
            <div class="step-number">2</div>
            <div class="step-text">
              <h3>Propagação</h3>
              <p>Os valores se propagam em ondas a partir do objetivo.</p>
            </div>
          </div>
          <div class="step-card" onclick="changeActiveStep(this)">
            <div class="step-number">3</div>
            <div class="step-text">
              <h3>Navegação</h3>
              <p>O micromouse segue o gradiente decrescente até chegar ao objetivo.</p>
            </div>
          </div>
          <div class="step-card" onclick="changeActiveStep(this)">
            <div class="step-number">4</div>
            <div class="step-text">
              <h3>Atualização dinâmica</h3>
              <p>Ao descobrir nova parede, o mapa é recalculado em tempo real.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="flood-visual">
        <div class="gif-placeholder">
          <img src="assets/gifs/flood-fill.gif" alt="Animação do algoritmo Flood Fill">
        </div>
      </div>
    </div>
  </section>

  <script>
    function changeActiveStep(clickedCard) {
      const cards = document.querySelectorAll('.step-card');
      cards.forEach(card => card.classList.remove('active'));
      clickedCard.classList.add('active');
    }
  </script>

  <section class="telemetry-section-custom">
    <div class="telemetry-header-custom">
      <div class="telemetry-line-header">
        <p class="telemetry-subtitle">// INTERFACE WEB</p>
        <p class="telemetry-line"></p>
      </div>
    </div>
    <div class="telemetry-content-custom">
      <div class="telemetry-left">
        <h1>
          TELEMETRIA<br>
          <span class="highlight-orange"> EM TEMPO REAL. </span>
        </h1>
        <p class="telemetry-def">
          O sistema web exibe, via WebSocket e em tempo real, o mapeamento do labirinto, a identificação do tipo de percurso, a posição do micromouse, o nível de bateria, a velocidade média e o status da execução, com atualização contínua e baixa latência.
        </p>
        <div style="display:flex; justify-content:center; margin-top:50px;">
          <img src="assets/images/logo-xaropi-cropped.svg" alt="Logo XAROPi" width="600" height="500">
        </div>
      </div>
      <div class="telemetry-example">
        <div class="telemetry-row-1">
          <p>XAROPI · LIVE</p>
          <div class="status-connected">
            <span class="status-dot"></span>
            <span class="highlight-orange">CONNECTED</span>
          </div>
        </div>
        <div class="telemetry-divider"></div>
      <div class="maze-grid">
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell path"></div>
        <div class="maze-cell path"></div>
        <div class="maze-cell path"></div>
        <div class="maze-cell path"></div>
        <div class="maze-cell path"></div>
        <div class="maze-cell path"></div>
        <div class="maze-cell path"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell path"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell empty"></div>
        <div class="maze-cell path"></div>
        <div class="maze-cell path"></div>
        <div class="maze-cell path"></div>
        <div class="maze-cell path"></div>
        <div class="maze-cell path"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell empty"></div>
        <div class="maze-cell path"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell empty"></div>
        <div class="maze-cell path"></div>
        <div class="maze-cell path"></div>
        <div class="maze-cell active"></div>
        <div class="maze-cell empty"></div>
        <div class="maze-cell empty"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell empty"></div>
        <div class="maze-cell empty"></div>
        <div class="maze-cell empty"></div>
        <div class="maze-cell empty"></div>
        <div class="maze-cell empty"></div>
        <div class="maze-cell empty"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
        <div class="maze-cell wall"></div>
      </div>
        <div class="telemetry-stats">
          <div class="telemetry-stat-card">
            <h2>73<span>%</span></h2>
            <p>BATERIA</p>
            <div class="stat-bar">
              <div class="stat-fill"></div>
            </div>
          </div>
          <div class="telemetry-stat-card">
            <h2>0.42<span>m/s</span></h2>
            <p>VELOCIDADE</p>
          </div>
          <div class="telemetry-stat-card">
            <h2>1:47</h2>
            <p>TEMPO</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="system">
    <div class="system-header">
      <div class="line-header">
        <p class="subtitle">// COMO FUNCIONA</p>
        <p class="line"> </p>
      </div>
      <h1>
          TRÊS FASES,<br>
          <span class="highlight"> UM CAMINHO. </span>
      <h1>
    </div>
    <div class="system-container" >
      <div class="system-card-1">
        <div class="card-visual">
          <div class="system-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5722" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <span class="card-number">01</span>
        </div>
        <p class="card-tag">SENSORES · HARDWARE · RESPOSTA</p>
        <div class="system-info">
          <h3>EXPLORA</h3>
          <ul>
            <li>Sensores infravermelhos</li>
            <li>Detecção de paredes </li>
            <li>Atualização < 10ms</li>
          </ul>
        </div>
      </div>
      <div class="system-card-2">
        <div class="card-visual">
          <div class="system-icon"  >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FF5722" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>
          </div>
          <span id="team-section-start" class="card-number" >02</span>
        </div>
        <p class="card-tag">ALGORITMO · GRAFOS · WEBSOCKET</p>
        <div class="system-info">
          <h3>CALCULA</h3>
        <ul>
            <li>Algoritmo de navegação que explora o labirinto</li>
            <li>Identificação do tipo de labirinto</li>
            <li>Construção Progressiva do grafo</li>
            <li>Dados de mapeamento transmitidos via WebSocket</li>
          </ul>
        </div>
      </div>
      <div class="system-card-3" >
        <div class="card-visual">
          <div class="system-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5722" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
          <span class="card-number">03</span>
        </div>
        <p class="card-tag">OUTPUT · MOVIMENTO · PRECISÃO</p>
        <div class="system-info">
          <h3>EXECUTA</h3>
          <ul>
            <li>Motores DC </li>
            <li>Controle por PWM independente</li>
            <li>Curvas de 90° e 180°</li>
            <li>Centralização no corredor</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
  

  <section class="system team-section" >
    <div class="system-header" >
      <div class="line-header">
        <p class="subtitle">// EQUIPE</p>
        <p class="line"> </p>
      </div>
      <h1>
          QUATRO FRENTES,<br>
          <span class="highlight"> UM OBJETIVO. </span>
      </h1>
    </div>
    <!-- ESTRUTURAS -->
    <div class="team-row-1">
        <div class="teams-header">
          <svg class="team-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FF5722" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <polyline points="9 6 3 12 9 18"/><polyline points="15 6 21 12 15 18"/></svg>
          <h2 class="team-title">// 01. <br> Estruturas</h2>
        </div>
        <div class="team-members">
            <div class="member-card">
                <img src="https://github.com/DaviMarques.png" alt="Davi Marques" onerror="this.src='https://github.com/ghost.png'">
                <div class="member-info">
                    <h3>Davi Marques</h3>
                    <p class="role">Líder do Projeto</p>
                    <p class="matricula">23/1030421</p>
                    <a href="https://github.com/DaviMarques" target="_blank">@DaviMarques</a>
                </div>
            </div>
            <div class="member-card">
                <img src="https://github.com/sardinhasamara-png.png" alt="Samara Sardinha">
                <div class="member-info">
                    <h3>Samara Sardinha</h3>
                    <p class="role">Líder da Equipe</p>
                    <p class="matricula">23/1011829</p>
                    <a href="https://github.com/sardinhasamara-png" target="_blank">@sardinhasamara-png</a>
                </div>
            </div>
            <div class="member-card">
                <img src="https://github.com/gabfreitasss.png" alt="Gabriela Assis">
                <div class="member-info">
                    <h3>Gabriela Assis</h3>
                    <p class="role">Tesoureira</p>
                    <p class="matricula">24/2015192</p>
                    <a href="https://github.com/gabfreitasss" target="_blank">@gabfreitasss</a>
                </div>
            </div>
            <div class="member-card">
                <img src="https://github.com/Donnk61.png" alt="Luís Henrique">
                <div class="member-info">
                    <h3>Luís Henrique</h3>
                    <p class="role">Membro</p>
                    <p class="matricula">24/2004869</p>
                    <a href="https://github.com/Donnk61" target="_blank">@Donnk61</a>
                </div>
            </div>
        </div>
    </div>
    <!-- ENERGIA -->
    <div class="team-row" >
        <div class="teams-header">
          <svg class="team-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FF5722" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 11 14 9 22 21 9 13 9 13 2"/></svg>
          <h2 class="team-title">// 02. <br> Energia</h2>
        </div>
        <div class="team-members">
            <div class="member-card">
                <img src="https://github.com/leticiacarvalho-lg.png" alt="Letícia Geovana">
                <div class="member-info">
                    <h3>Letícia Geovana</h3>
                    <p class="role">Líder da Equipe</p>
                    <p class="matricula">23/1026868</p>
                    <a href="https://github.com/leticiacarvalho-lg" target="_blank">@leticiacarvalho-lg</a>
                </div>
            </div>
            <div class="member-card">
                <img src="https://github.com/Felipej3ds.png" alt="Felipe Júnior">
                <div class="member-info">
                    <h3>Felipe Júnior</h3>
                    <p class="role">Membro</p>
                    <p class="matricula">23/1012192</p>
                    <a href="https://github.com/Felipej3ds" target="_blank">@Felipej3ds</a>
                </div>
            </div>
            <div class="member-card">
                <img src="https://github.com/Laisczt.png" alt="Laís Cecília">
                <div class="member-info">
                    <h3>Laís Cecília</h3>
                    <p class="role">Membro</p>
                    <p class="matricula">21/1029512</p>
                    <a href="https://github.com/Laisczt" target="_blank">@Laisczt</a>
                </div>
            </div>
            <div class="member-card">
                <img src="https://github.com/TerminaKng05.png" alt="Samuel Felipe">
                <div class="member-info">
                    <h3>Samuel Felipe</h3>
                    <p class="role">Membro</p>
                    <p class="matricula">23/2022148</p>
                    <a href="https://github.com/TerminaKng05" target="_blank">@TerminaKng05</a>
                </div>
            </div>
        </div>
    </div>
    <!-- HARDWARE -->
    <div class="team-row">
        <div class="teams-header">
          <svg class="team-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FF5722" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="10" height="10" rx="1"/><line x1="3" y1="9" x2="7" y2="9"/><line x1="3" y1="12" x2="7" y2="12"/><line x1="3" y1="15" x2="7" y2="15"/><line x1="17" y1="9" x2="21" y2="9"/><line x1="17" y1="12" x2="21" y2="12"/><line x1="17" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="7"/><line x1="12" y1="3" x2="12" y2="7"/><line x1="15" y1="3" x2="15" y2="7"/><line x1="9" y1="17" x2="9" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="15" y1="17" x2="15" y2="21"/></svg>
          <h2 class="team-title">// 03. <br> Hardware</h2>
        </div>
        <div class="team-members">
            <div class="member-card">
                <img src="https://github.com/Gabreeles.png" alt="Gabriel Celestino">
                <div class="member-info">
                    <h3>Gabriel Celestino</h3>
                    <p class="role">Líder da Equipe</p>
                    <p class="matricula">23/1027079</p>
                    <a href="https://github.com/Gabreeles" target="_blank">@Gabreeles</a>
                </div>
            </div>
            <div class="member-card">
                <img src="https://github.com/RafaelSchadt.png" alt="Rafael Welz">
                <div class="member-info">
                    <h3>Rafael Welz</h3>
                    <p class="role">Gestão de Pessoas</p>
                    <p class="matricula">23/1011800</p>
                    <a href="https://github.com/RafaelSchadt" target="_blank">@RafaelSchadt</a>
                </div>
            </div>
            <div class="member-card">
                <img src="https://github.com/JtAires.png" alt="João Victor">
                <div class="member-info">
                    <h3>João Victor</h3>
                    <p class="role">Membro</p>
                    <p class="matricula">23/1011560</p>
                    <a href="https://github.com/JtAires" target="_blank">@JtAires</a>
                </div>
            </div>
            <div class="member-card">
                <img src="https://github.com/SirJorgito.png" alt="Jorge Henrique">
                <div class="member-info">
                    <h3>Jorge Henrique</h3>
                    <p class="role">Membro</p>
                    <p class="matricula">23/1011570</p>
                    <a href="https://github.com/SirJorgito" target="_blank">@SirJorgito</a>
                </div>
            </div>
            <div class="member-card">
                <img src="https://github.com/luanaa2005.png" alt="Luana Carvalho">
                <div class="member-info">
                    <h3>Luana Carvalho</h3>
                    <p class="role">Membro</p>
                    <p class="matricula">24/2004840</p>
                    <a href="https://github.com/luanaa2005" target="_blank">@luanaa2005</a>
                </div>
            </div>
        </div>
    </div>
    <!--  SOFTWARE -->
    <div class="team-row">
        <div class="teams-header">
          <svg class="team-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FF5722" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 11 14 9 22 21 9 13 9 13 2"/></svg>
          <h2 class="team-title">// 04. <br> Software</h2>
        </div>
        <div class="team-members">
            <div class="member-card">
                <img src="https://github.com/ludmilaaysha.png" alt="Ludmila Aysha">
                <div class="member-info">
                    <h3>Ludmila Aysha</h3>
                    <p class="role">Líder da Equipe</p>
                    <p class="matricula">23/1026750</p>
                    <a href="https://github.com/ludmilaaysha" target="_blank">@ludmilaaysha</a>
                </div>
            </div>
            <div class="member-card">
                <img src="https://github.com/Isaqzin.png" alt="Isaque Camargos">
                <div class="member-info">
                    <h3>Isaque Camargos</h3>
                    <p class="role">Vice-Líder do Projeto</p>
                    <p class="matricula">23/1011515</p>
                    <a href="https://github.com/Isaqzin" target="_blank">@Isaqzin</a>
                </div>
            </div>
            <div class="member-card">
                <img src="https://github.com/Marjoriemitzi.png" alt="Marjorie Mitzi">
                <div class="member-info">
                    <h3>Marjorie Mitzi</h3>
                    <p class="role">Membro</p>
                    <p class="matricula">23/1039140</p>
                    <a href="https://github.com/Marjoriemitzi" target="_blank">@Marjoriemitzi</a>
                </div>
            </div>
            <div class="member-card">
                <img src="https://github.com/bolzanMGB.png" alt="Othavio Araújo">
                <div class="member-info">
                    <h3>Othavio Araújo</h3>
                    <p class="role">Membro</p>
                    <p class="matricula">23/1039150</p>
                    <a href="https://github.com/bolzanMGB" target="_blank">@bolzanMGB</a>
                </div>
            </div>
        </div>
    </div>
  </section>


<div>

<footer class="terminal-footer">
    <div class="terminal-footer-container">
      <div class="footer-left">
        <h2 class="footer-logo">XARO<span class="highlight-orange">Pi</span></h2>
        <p class="footer-mono">Micromouse · Projeto Integrador de Engenharia · UnB · FCTE · 2026.1</p>
      </div>
      <div class="footer-right">
        <p class="footer-highlight">Universidade de Brasília</p>
        <p class="footer-highlight">Faculdade do Gama</p>
      </div>  
    </div>
  </footer>