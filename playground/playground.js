(function () {
  'use strict';

  /* ── Module registry ─────────────────────────────────────── */

  const MODULES = {
    perception: {
      minigrid:          { label: 'MiniGrid (basic)',    import: 'from modules.perception import MiniGridPerceptionModule',                           init: 'MiniGridPerceptionModule()' },
      minigrid_relation: { label: 'MiniGrid (relation)', import: 'from modules.perception import MiniGridRelationPerceptionModule',                   init: 'MiniGridRelationPerceptionModule()' },
      deliverybench:     { label: 'DeliveryBench',       import: 'from modules.perception.deliverybench_adapter import DeliveryBenchPerceptionModule', init: 'DeliveryBenchPerceptionModule()' },
      gym:               { label: 'Gym',                 import: 'from modules.perception import GymPerceptionModule',                                init: 'GymPerceptionModule()' },
      thor:              { label: 'THOR',                import: 'from modules.perception import THORPerceptionModule',                               init: 'THORPerceptionModule()' },
    },
    reasoning: {
      /* No LLM */
      simple:           { label: 'Simple (rule-based)',        llm: false, import: '# Built-in rule-based planner (no import needed)',                        init: 'None  # adapter uses built-in BFS planner' },
      /* Prompt-based */
      react:            { label: 'ReAct',                      llm: true,  import: 'from modules.reasoning import ReActReasoning',                            init: 'ReActReasoning(llm_client=llm_client, max_iterations=10, enable_history=True)' },
      cot:              { label: 'Chain-of-Thought (CoT)',      llm: true,  import: 'from modules.reasoning import COTReasoning',                              init: 'COTReasoning(llm_client=llm_client, max_iterations=10, enable_history=True)' },
      plan_and_solve:   { label: 'Plan-and-Solve',             llm: true,  import: 'from modules.reasoning import PlanAndSolveReasoning',                     init: 'PlanAndSolveReasoning(llm_client=llm_client, enable_history=True)' },
      self_consistency: { label: 'Self-Consistency',           llm: true,  import: 'from modules.reasoning import SelfConsistencyReasoning',                  init: 'SelfConsistencyReasoning(llm_client=llm_client, num_samples=5, sampling_temperature=0.7)' },
      sitsup:           { label: 'SitSup (Situation-aware)',   llm: true,  import: 'from modules.reasoning import SitSupReasoning',                           init: 'SitSupReasoning(llm_client=llm_client, max_iterations=10, enable_state_prediction=True)' },
      mad:              { label: 'Multi-Agent Debate',         llm: true,  import: 'from modules.reasoning import MultiAgentDebateReasoning',                 init: 'MultiAgentDebateReasoning(llm_client=llm_client, num_agents=3, num_rounds=2)' },
      /* Search-based */
      tot:              { label: 'Tree of Thoughts (ToT)',     llm: true,  import: 'from modules.reasoning import ToTReasoning',                              init: 'ToTReasoning(llm_client=llm_client, search_strategy="BFS", evaluation_strategy="value", num_thoughts=3)' },
      guided_search:    { label: 'Guided Search',              llm: true,  import: 'from modules.reasoning.guided_search import GuidedSearchReasoning',       init: 'GuidedSearchReasoning(llm_client=llm_client)' },
      rap:              { label: 'RAP (MCTS)',                 llm: true,  import: 'from modules.reasoning.rap import RAPReasoning',                          init: 'RAPReasoning(llm_client=llm_client, num_iterations=10)' },
      lats:             { label: 'LATS (Language Agent Tree)', llm: true,  import: 'from modules.reasoning.lats import LATSReasoning',                        init: 'LATSReasoning(llm_client=llm_client, num_iterations=30, max_depth=7, n_generate_sample=5)' },
    },
    memory: {
      none:               { label: 'None',                          llm: false, import: null, init: null },
      /* Simple / Buffer */
      bot:                { label: 'Buffer-of-Thought',             llm: false, import: 'from modules.memory import BufferOfThoughtMemory',                        init: 'BufferOfThoughtMemory(max_size=200)' },
      chatdb:             { label: 'ChatDB (SQLite)',                llm: false, import: 'from modules.memory import ChatDBMemory',                                 init: 'ChatDBMemory(db_path="runs/chatdb.sqlite3")' },
      memorybank:         { label: 'MemoryBank',                    llm: false, import: 'from modules.memory import MemoryBankMemory',                             init: 'MemoryBankMemory()' },
      /* Graph / Context */
      graph:              { label: 'GraphContextMemory',            llm: false, import: 'from modules.memory import GraphContextMemory',                           init: 'GraphContextMemory(max_memories=200)' },
      gmemory:            { label: 'GMemory (LangChain Graph)',     llm: true,  import: 'from modules.memory import GMemoryAdapter',                               init: 'GMemoryAdapter()' },
      /* LLM-enhanced */
      ace:                { label: 'ACE (Agentic Context Engine)',  llm: true,  import: 'from modules.memory import AgenticContextEngine',                         init: 'AgenticContextEngine(llm=llm_client)' },
      dynamic_cheatsheet: { label: 'Dynamic Cheatsheet',           llm: true,  import: 'from modules.memory import DynamicCheatsheet',                            init: 'DynamicCheatsheet(llm=llm_client)' },
      ranked:             { label: 'Ranked Memory',                 llm: true,  import: 'from modules.memory import RankedMemory',                                 init: 'RankedMemory(max_memories=500, weight_recency=0.4, weight_relevance=0.4)' },
      cam:                { label: 'CAM (Contextual Agent Memory)', llm: true,  import: 'from modules.memory import CAMMemory',                                    init: 'CAMMemory()' },
      /* Associative / Vector */
      amem:               { label: 'A-Mem (Associative Memory)',    llm: true,  import: 'from modules.memory import AMemModule, ChromaRetriever, LLMInterface',   init: 'AMemModule(llm=LLMInterface(llm_client), retriever=ChromaRetriever())' },
      mirix:              { label: 'MIRIX',                         llm: true,  import: 'from modules.memory import MirixMemory, MirixEmbodiedMemoryConfig',       init: 'MirixMemory(api_key=os.getenv("OPENAI_API_KEY"), cfg=MirixEmbodiedMemoryConfig())' },
      lightmem:           { label: 'LightMem (Qdrant)',             llm: true,  import: 'from modules.memory import LightMemMemoryModule',                         init: 'LightMemMemoryModule()' },
      langmem:            { label: 'LangMem',                       llm: true,  import: 'from modules.memory import LangMem',                                      init: 'LangMem()' },
      /* External Services */
      letta:              { label: 'Letta (Structured Blocks)',     llm: false, import: 'from modules.memory import LettaEnvMemoryModule',                         init: 'LettaEnvMemoryModule()' },
      mem0:               { label: 'Mem0',                          llm: false, import: 'from modules.memory import Mem0Adapter',                                  init: 'Mem0Adapter()' },
      zep:                { label: 'Zep',                           llm: false, import: 'from modules.memory import ZepMemory',                                    init: 'ZepMemory()' },
      simplemem:          { label: 'SimpleMem',                     llm: false, import: 'from modules.memory import SimpleMemAdapter',                              init: 'SimpleMemAdapter()' },
    },
    reflection: {
      none:        { label: 'None',         import: null, init: null },
      self_refine: { label: 'Self-Refine',  import: 'from modules.reflection import SelfRefineReflection',   init: 'SelfRefineReflection(llm_client=llm_client, max_iterations=3)' },
      reflexion:   { label: 'Reflexion',    import: 'from modules.reflection.reflexion import ReflexionReflection', init: 'ReflexionReflection(llm_client=llm_client, max_reflections=3)' },
      retroformer: { label: 'Retroformer',  import: 'from modules.reflection import RetroformerReflection',  init: 'RetroformerReflection(actor_llm=llm_client, retro_llm=llm_client, max_prompt_updates=3)' },
    },
  };

  /* ── Environment family config ───────────────────────────── */

  const ENV_FAMILIES = {
    minigrid: {
      label:          'MiniGrid',
      defaultPerc:    'minigrid',
      compatPerc:     ['minigrid', 'minigrid_relation'],
      subWrap:        'env-name-wrap',
      subEl:          'sel-env-name',
      getEnvId:       () => $('#sel-env-name').value,
      install:        'pip install minigrid',
      hint:           '2D grid-world tasks. Lightweight, runs on CPU.',
      benchmarkImport:'import benchmarks.minigrid  # register adapter',
      adapterKey:     '"minigrid"',
    },
    babyai: {
      label:          'BabyAI',
      defaultPerc:    'minigrid',
      compatPerc:     ['minigrid', 'minigrid_relation'],
      subWrap:        'env-name-wrap',
      subEl:          'sel-env-name',
      getEnvId:       () => $('#sel-env-name').value,
      install:        'pip install minigrid',
      hint:           'Language-grounded grid-world tasks built on MiniGrid.',
      benchmarkImport:'import benchmarks.minigrid  # register adapter',
      adapterKey:     '"minigrid"',
    },
    thor: {
      label:          'AI2-THOR',
      defaultPerc:    'thor',
      compatPerc:     ['thor'],
      subWrap:        'env-scene-wrap',
      subEl:          'sel-env-scene',
      getEnvId:       () => $('#sel-env-scene').value,
      install:        'pip install ai2thor',
      hint:           '3D photo-realistic indoor environments. Requires GPU.',
      benchmarkImport:'from benchmarks.thor.thor_wrapper import THOREnvironment',
      adapterKey:     '"thor"',
    },
    robothor: {
      label:          'RoboTHOR',
      defaultPerc:    'thor',
      compatPerc:     ['thor'],
      subWrap:        'env-robothor-wrap',
      subEl:          'sel-env-robothor',
      getEnvId:       () => $('#sel-env-robothor').value,
      install:        'pip install ai2thor==2.7.2',
      hint:           'Object-nav episodes in RoboTHOR. Requires ai2thor 2.7.2.',
      benchmarkImport:'from benchmarks.robothor.robothor_wrapper import RoboTHOREnvironment',
      adapterKey:     '"robothor"',
    },
    deliverybench: {
      label:          'DeliveryBench',
      defaultPerc:    'deliverybench',
      compatPerc:     ['deliverybench'],
      subWrap:        null,
      subEl:          null,
      getEnvId:       () => 'deliverybench',
      install:        null,
      hint:           'Simulated food-delivery task inside a virtual restaurant.',
      benchmarkImport:'from benchmarks.simworld.deliverybench_wrapper import DeliveryBenchEnvironment',
      adapterKey:     '"deliverybench"',
    },
    gym: {
      label:          'Gym',
      defaultPerc:    'gym',
      compatPerc:     ['gym'],
      subWrap:        'env-gym-wrap',
      subEl:          'sel-env-gym',
      getEnvId:       () => $('#sel-env-gym').value,
      install:        'pip install gymnasium',
      hint:           'Standard Gymnasium environments (CartPole, LunarLander, …).',
      benchmarkImport:'from benchmarks.simworld.gym_wrapper import GymEnvironment',
      adapterKey:     '"gym"',
    },
  };

  /* ── DOM refs ─────────────────────────────────────────────── */

  const $ = (s) => document.querySelector(s);
  const els = {
    env:          $('#sel-env'),
    envName:      $('#sel-env-name'),
    envWrap:      $('#env-name-wrap'),
    perception:   $('#sel-perception'),
    percAutoBadge:$('#perc-auto-badge'),
    reasoning:    $('#sel-reasoning'),
    memory:       $('#sel-memory'),
    reflection:   $('#sel-reflection'),
    compatWarn:   $('#env-compat-warn'),
    compatMsg:    $('#env-compat-msg'),
    installHint:  $('#env-install-hint'),
    installCmd:   $('#env-install-cmd'),
    envHintText:  $('#env-hint-text'),
    codeOut:      $('#code-output'),
    gutter:       $('#line-numbers'),
    copyBtn:      $('#btn-copy'),
    copyInline:   $('#btn-copy-inline'),
    dlBtn:        $('#btn-download'),
    startBtn:     $('#btn-start'),
  };

  let lastCode = '';

  /* ── Syntax highlighting ─────────────────────────────────── */

  function highlight(code) {
    code = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const tokens = [
      { name: 'str', re: /("""[^]*?"""|'[^']*'|"[^"]*")/ },
      { name: 'cmt', re: /(#[^\n]*)/ },
      { name: 'kw',  re: /\b(from|import|if|for|in|not|def|class|return|break|None|True|False|as|and|or)\b/ },
      { name: 'num', re: /\b(\d+)\b/ },
      { name: 'fn',  re: /\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\()/ },
    ];
    const re = new RegExp(tokens.map(t => t.re.source).join('|'), 'g');
    return code.replace(re, (...args) => {
      for (let i = 0; i < tokens.length; i++) {
        if (args[i + 1] !== undefined) return '<span class="' + tokens[i].name + '">' + args[0] + '</span>';
      }
      return args[0];
    });
  }

  /* ── Environment switching ───────────────────────────────── */

  const ALL_SUB_WRAPS = ['env-name-wrap', 'env-scene-wrap', 'env-robothor-wrap', 'env-gym-wrap'];

  function onEnvChange() {
    const family = ENV_FAMILIES[els.env.value];
    if (!family) return;

    /* 1. Show the right sub-selector, hide others */
    ALL_SUB_WRAPS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('is-hidden', id !== family.subWrap);
    });

    /* 2. Auto-select perception */
    const percOpts = els.perception.options;
    for (let i = 0; i < percOpts.length; i++) {
      if (percOpts[i].value === family.defaultPerc) {
        els.perception.selectedIndex = i;
        break;
      }
    }

    /* 3. Dim incompatible perception options */
    for (let i = 0; i < percOpts.length; i++) {
      const envs = (percOpts[i].dataset.env || '').split(' ');
      const compat = envs.includes(els.env.value);
      percOpts[i].disabled = !compat;
      percOpts[i].classList.toggle('pg-opt-incompat', !compat);
    }

    /* 4. Show auto badge */
    els.percAutoBadge.classList.remove('is-hidden');
    setTimeout(() => els.percAutoBadge.classList.add('is-hidden'), 2000);

    /* 5. Install hint */
    if (family.install) {
      els.installHint.classList.remove('is-hidden');
      els.installCmd.textContent = family.install;
    } else {
      els.installHint.classList.add('is-hidden');
    }

    /* 6. Env hint text */
    if (els.envHintText) els.envHintText.textContent = family.hint;

    /* 7. For BabyAI — reload sub-env list with BabyAI entries */
    if (els.env.value === 'babyai') {
      populateBabyAIEnvs();
    } else if (els.env.value === 'minigrid') {
      populateMiniGridEnvs();
    }
  }

  function populateMiniGridEnvs() {
    const select = document.getElementById('sel-env-name');
    if (!select) return;
    select.innerHTML = `
      <optgroup label="— Navigation —">
        <option value="MiniGrid-Empty-5x5-v0">Empty 5×5</option>
        <option value="MiniGrid-Empty-6x6-v0">Empty 6×6</option>
        <option value="MiniGrid-Empty-8x8-v0">Empty 8×8</option>
        <option value="MiniGrid-FourRooms-v0">Four Rooms</option>
        <option value="MiniGrid-MultiRoom-N2-S4-v0">MultiRoom N2-S4</option>
        <option value="MiniGrid-MultiRoom-N4-S5-v0">MultiRoom N4-S5</option>
        <option value="MiniGrid-SimpleCrossingS9N1-v0">SimpleCrossing S9N1</option>
        <option value="MiniGrid-LavaCrossingS9N1-v0">LavaCrossing S9N1</option>
        <option value="MiniGrid-LavaGapS7-v0">LavaGap S7</option>
      </optgroup>
      <optgroup label="— Key &amp; Door —">
        <option value="MiniGrid-DoorKey-5x5-v0">DoorKey 5×5</option>
        <option value="MiniGrid-DoorKey-6x6-v0">DoorKey 6×6</option>
        <option value="MiniGrid-DoorKey-8x8-v0">DoorKey 8×8</option>
        <option value="MiniGrid-Unlock-v0">Unlock</option>
        <option value="MiniGrid-LockedRoom-v0">Locked Room</option>
        <option value="MiniGrid-KeyCorridorS3R1-v0">KeyCorridor S3R1</option>
        <option value="MiniGrid-KeyCorridorS4R3-v0">KeyCorridor S4R3</option>
      </optgroup>
      <optgroup label="— Object Manipulation —">
        <option value="MiniGrid-Fetch-5x5-N2-v0">Fetch 5×5</option>
        <option value="MiniGrid-Fetch-8x8-N3-v0">Fetch 8×8</option>
        <option value="MiniGrid-GoToObject-6x6-N2-v0">GoToObject 6×6</option>
        <option value="MiniGrid-PutNear-6x6-N2-v0">PutNear 6×6</option>
        <option value="MiniGrid-UnlockPickup-v0">UnlockPickup</option>
        <option value="MiniGrid-BlockedUnlockPickup-v0">BlockedUnlockPickup</option>
        <option value="MiniGrid-ObstructedMaze-2Dl-v0">ObstructedMaze 2Dl</option>
      </optgroup>
      <optgroup label="— Dynamic —">
        <option value="MiniGrid-Dynamic-Obstacles-5x5-v0">DynObstacles 5×5</option>
        <option value="MiniGrid-Dynamic-Obstacles-8x8-v0">DynObstacles 8×8</option>
        <option value="MiniGrid-DistShift1-v0">DistShift 1</option>
        <option value="MiniGrid-RedBlueDoors-6x6-v0">RedBlueDoors 6×6</option>
      </optgroup>`;
  }

  function populateBabyAIEnvs() {
    const select = document.getElementById('sel-env-name');
    if (!select) return;
    select.innerHTML = `
      <optgroup label="— GoTo —">
        <option value="BabyAI-GoToRedBall-v0">GoToRedBall</option>
        <option value="BabyAI-GoToObj-v0">GoToObj</option>
        <option value="BabyAI-GoToLocal-v0">GoToLocal</option>
        <option value="BabyAI-GoToDoor-v0">GoToDoor</option>
        <option value="BabyAI-GoToObjMazeS4-v0">GoToObjMaze S4</option>
        <option value="BabyAI-GoToObjMazeS5-v0">GoToObjMaze S5</option>
        <option value="BabyAI-GoToSeq-v0">GoToSeq</option>
      </optgroup>
      <optgroup label="— Pickup —">
        <option value="BabyAI-Pickup-v0">Pickup</option>
        <option value="BabyAI-PickupDist-v0">PickupDist</option>
        <option value="BabyAI-PickupLoc-v0">PickupLoc</option>
        <option value="BabyAI-PickupAbove-v0">PickupAbove</option>
        <option value="BabyAI-UnblockPickup-v0">UnblockPickup</option>
      </optgroup>
      <optgroup label="— Open / Unlock —">
        <option value="BabyAI-Open-v0">Open</option>
        <option value="BabyAI-OpenDoor-v0">OpenDoor</option>
        <option value="BabyAI-OpenRedDoor-v0">OpenRedDoor</option>
        <option value="BabyAI-Unlock-v0">Unlock</option>
        <option value="BabyAI-UnlockLocal-v0">UnlockLocal</option>
        <option value="BabyAI-UnlockPickup-v0">UnlockPickup</option>
        <option value="BabyAI-KeyInBox-v0">KeyInBox</option>
        <option value="BabyAI-BlockedUnlockPickup-v0">BlockedUnlockPickup</option>
      </optgroup>
      <optgroup label="— PutNext —">
        <option value="BabyAI-PutNextLocal-v0">PutNextLocal</option>
        <option value="BabyAI-PutNextS4N1-v0">PutNext S4N1</option>
        <option value="BabyAI-PutNextS5N2-v0">PutNext S5N2</option>
      </optgroup>
      <optgroup label="— Synthesis / Boss —">
        <option value="BabyAI-Synth-v0">Synth</option>
        <option value="BabyAI-SynthLoc-v0">SynthLoc</option>
        <option value="BabyAI-MiniBossLevel-v0">MiniBossLevel</option>
        <option value="BabyAI-BossLevel-v0">BossLevel</option>
      </optgroup>`;
  }

  /* ── Compatibility check ──────────────────────────────────── */

  function checkCompat() {
    const envFam = els.env.value;
    const percVal = els.perception.value;
    const family = ENV_FAMILIES[envFam];
    if (!family) return;
    const ok = family.compatPerc.includes(percVal);
    els.compatWarn.classList.toggle('is-hidden', ok);
    if (!ok) {
      const percLabel = els.perception.options[els.perception.selectedIndex]?.text || percVal;
      els.compatMsg.textContent = percLabel + ' adapter may not work with ' + family.label + '. Consider ' + family.defaultPerc + '.';
    }
  }

  /* ── Selections ──────────────────────────────────────────── */

  function sel() {
    const envFam = els.env.value;
    const family = ENV_FAMILIES[envFam] || ENV_FAMILIES.minigrid;
    return {
      env:        envFam,
      envName:    family.getEnvId ? family.getEnvId() : '',
      perception: els.perception.value,
      reasoning:  els.reasoning.value,
      memory:     els.memory.value,
      reflection: els.reflection.value,
      family,
    };
  }

  function selectedText(el) {
    return el.options[el.selectedIndex]?.text || '';
  }

  /* ── Code generation ─────────────────────────────────────── */

  /* ── THOR / RoboTHOR code template ────────────────────────── */
  function genTHOR(s) {
    const isRobo = s.env === 'robothor';
    const perc   = MODULES.perception[s.perception] || MODULES.perception.thor;
    const reas   = MODULES.reasoning[s.reasoning];
    const mem    = MODULES.memory[s.memory];
    const refl   = MODULES.reflection[s.reflection];
    const needsLLM = reas.llm || mem.llm || (refl.import !== null);
    const L = [];
    L.push('"""Generated agent setup — ' + (isRobo ? 'RoboTHOR' : 'AI2-THOR') + ' — AgentFactory"""');
    L.push('import sys, os');
    L.push('');
    L.push('project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))');
    L.push('if project_root not in sys.path:');
    L.push('    sys.path.insert(0, project_root)');
    L.push('');
    if (isRobo) {
      L.push('from benchmarks.robothor.robothor_wrapper import RoboTHOREnvironment');
      L.push('env = RoboTHOREnvironment(scene_name="' + s.envName + '", headless=True)');
    } else {
      L.push('from benchmarks.thor.thor_wrapper import THOREnvironment');
      L.push('env = THOREnvironment(scene_name="' + s.envName + '", headless=True)');
    }
    L.push('');
    L.push('# ── Perception ──');
    L.push('from modules.perception import THORPerceptionModule');
    L.push('perception = THORPerceptionModule()');
    L.push('');
    if (needsLLM) {
      L.push('# ── LLM client ──');
      L.push('from modules.llm import OpenAIClient');
      L.push('llm_client = OpenAIClient(');
      L.push('    api_key=os.getenv("OPENAI_API_KEY"),');
      L.push('    model="gpt-4o-mini",');
      L.push('    temperature=0.0,');
      L.push(')');
      L.push('');
    }
    L.push('# ── Reasoning ──');
    if (reas.import && !reas.import.startsWith('#')) L.push(reas.import);
    L.push('reasoning = ' + reas.init);
    L.push('');
    L.push('# ── Memory ──');
    if (mem.import) { L.push(mem.import); L.push('memory = ' + mem.init); }
    else L.push('memory = None');
    L.push('');
    L.push('# ── Reflection ──');
    if (refl.import) { L.push(refl.import); L.push('reflection = ' + refl.init); }
    else L.push('reflection = None');
    L.push('');
    L.push('from agents import EmbodiedAgent');
    L.push('agent = EmbodiedAgent(');
    L.push('    perception=perception,');
    L.push('    reasoning=reasoning,');
    L.push('    memory=memory,');
    L.push('    reflection=reflection,');
    L.push(')');
    L.push('');
    L.push('obs, _ = env.reset()');
    L.push('agent.run(env=env)');
    return L.join('\n');
  }

  /* ── Gym code template ─────────────────────────────────────── */
  function genGym(s) {
    const reas = MODULES.reasoning[s.reasoning];
    const mem  = MODULES.memory[s.memory];
    const refl = MODULES.reflection[s.reflection];
    const needsLLM = reas.llm || mem.llm || (refl.import !== null);
    const L = [];
    L.push('"""Generated agent setup — Gym — AgentFactory"""');
    L.push('import sys, os');
    L.push('import gymnasium as gym');
    L.push('');
    L.push('project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))');
    L.push('if project_root not in sys.path:');
    L.push('    sys.path.insert(0, project_root)');
    L.push('');
    L.push('from benchmarks.simworld.gym_wrapper import GymEnvironment');
    L.push('from modules.perception import GymPerceptionModule');
    L.push('');
    L.push('gym_env = gym.make("' + s.envName + '")');
    L.push('env = GymEnvironment(env=gym_env)');
    L.push('perception = GymPerceptionModule()');
    L.push('');
    if (needsLLM) {
      L.push('# ── LLM client ──');
      L.push('from modules.llm import OpenAIClient');
      L.push('llm_client = OpenAIClient(');
      L.push('    api_key=os.getenv("OPENAI_API_KEY"),');
      L.push('    model="gpt-4o-mini",');
      L.push('    temperature=0.0,');
      L.push(')');
      L.push('');
    }
    L.push('# ── Reasoning ──');
    if (reas.import && !reas.import.startsWith('#')) L.push(reas.import);
    L.push('reasoning = ' + reas.init);
    L.push('');
    L.push('# ── Memory ──');
    if (mem.import) { L.push(mem.import); L.push('memory = ' + mem.init); }
    else L.push('memory = None');
    L.push('');
    L.push('# ── Reflection ──');
    if (refl.import) { L.push(refl.import); L.push('reflection = ' + refl.init); }
    else L.push('reflection = None');
    L.push('');
    L.push('from agents import EmbodiedAgent');
    L.push('agent = EmbodiedAgent(');
    L.push('    perception=perception,');
    L.push('    reasoning=reasoning,');
    L.push('    memory=memory,');
    L.push('    reflection=reflection,');
    L.push(')');
    L.push('agent.run(env=env)');
    return L.join('\n');
  }

  /* ── Generic MiniGrid / BabyAI template ───────────────────── */
  function genMiniGrid(s) {
    const perc = MODULES.perception[s.perception] || MODULES.perception.minigrid;
    const reas = MODULES.reasoning[s.reasoning];
    const mem  = MODULES.memory[s.memory];
    const refl = MODULES.reflection[s.reflection];
    const needsLLM = reas.llm || mem.llm || (refl.import !== null);
    const L = [];

    L.push('"""Generated agent setup — AgentFactory"""');
    L.push('import sys, os');
    L.push('');
    L.push('project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))');
    L.push('if project_root not in sys.path:');
    L.push('    sys.path.insert(0, project_root)');
    L.push('');
    L.push('import benchmarks.minigrid  # register adapter');
    L.push('from agents import EmbodiedAgent');
    L.push('from modules.adapters import get_adapter');
    L.push('');
    L.push('# ── Perception ──');
    L.push(perc.import);
    L.push('perception = ' + perc.init);
    L.push('');

    if (needsLLM) {
      L.push('# ── LLM client ──');
      L.push('from modules.llm import OpenAIClient');
      L.push('llm_client = OpenAIClient(');
      L.push('    api_key=os.getenv("OPENAI_API_KEY"),');
      L.push('    model="gpt-4o-mini",');
      L.push('    temperature=0.0,');
      L.push(')');
      L.push('');
    }

    L.push('# ── Reasoning ──');
    if (reas.import && !reas.import.startsWith('#')) L.push(reas.import);
    L.push('reasoning = ' + reas.init);
    L.push('');
    L.push('# ── Memory ──');
    if (mem.import) { L.push(mem.import); L.push('memory = ' + mem.init); }
    else L.push('memory = None');
    L.push('');
    L.push('# ── Reflection ──');
    if (refl.import) { L.push(refl.import); L.push('reflection = ' + refl.init); }
    else L.push('reflection = None');
    L.push('');

    L.push('adapter = get_adapter("minigrid")');
    L.push('agent = EmbodiedAgent(');
    L.push('    perception=perception,');
    L.push('    reasoning=reasoning,');
    L.push('    memory=memory,');
    L.push('    reflection=reflection,');
    L.push('    adapter=adapter,');
    L.push('    env_id="' + s.envName + '"');
    L.push(')');
    L.push('');
    L.push('agent.run()');
    return L.join('\n');
  }

  /* ── DeliveryBench template ────────────────────────────────── */
  function genDeliveryBench(s) {
    const reas = MODULES.reasoning[s.reasoning];
    const mem  = MODULES.memory[s.memory];
    const refl = MODULES.reflection[s.reflection];
    const needsLLM = reas.llm || mem.llm || (refl.import !== null);
    const L = [];
    L.push('"""Generated agent setup — DeliveryBench — AgentFactory"""');
    L.push('# Shortcut: python examples/deliverybench_example.py --reasoning-method ' + s.reasoning);
    L.push('');
    L.push('import sys, os');
    L.push('');
    L.push('project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))');
    L.push('if project_root not in sys.path:');
    L.push('    sys.path.insert(0, project_root)');
    L.push('');
    L.push('from benchmarks.simworld.deliverybench_wrapper import DeliveryBenchEnvironment');
    L.push('from modules.perception.deliverybench_adapter import DeliveryBenchPerceptionModule');
    L.push('');
    L.push('env = DeliveryBenchEnvironment()');
    L.push('perception = DeliveryBenchPerceptionModule()');
    L.push('');
    if (needsLLM) {
      L.push('# ── LLM client ──');
      L.push('from modules.llm import OpenAIClient');
      L.push('llm_client = OpenAIClient(');
      L.push('    api_key=os.getenv("OPENAI_API_KEY"),');
      L.push('    model="gpt-4o-mini",');
      L.push('    temperature=0.0,');
      L.push(')');
      L.push('');
    }
    L.push('# ── Reasoning ──');
    if (reas.import && !reas.import.startsWith('#')) L.push(reas.import);
    L.push('reasoning = ' + reas.init);
    L.push('');
    L.push('# ── Memory ──');
    if (mem.import) { L.push(mem.import); L.push('memory = ' + mem.init); }
    else L.push('memory = None');
    L.push('');
    L.push('# ── Reflection ──');
    if (refl.import) { L.push(refl.import); L.push('reflection = ' + refl.init); }
    else L.push('reflection = None');
    L.push('');
    L.push('from agents import EmbodiedAgent');
    L.push('agent = EmbodiedAgent(');
    L.push('    perception=perception,');
    L.push('    reasoning=reasoning,');
    L.push('    memory=memory,');
    L.push('    reflection=reflection,');
    L.push(')');
    L.push('agent.run(env=env)');
    return L.join('\n');
  }

  function generate() {
    const s = sel();
    let code;
    if (s.env === 'thor' || s.env === 'robothor') code = genTHOR(s);
    else if (s.env === 'gym')                      code = genGym(s);
    else if (s.env === 'deliverybench')            code = genDeliveryBench(s);
    else                                           code = genMiniGrid(s);
    lastCode = code;
    els.codeOut.innerHTML = highlight(code);
    const lines = code.split('\n').length;
    els.gutter.innerHTML = Array.from({ length: lines }, (_, i) => '<div>' + (i + 1) + '</div>').join('');
  }

  /* ── Update UI panels ────────────────────────────────────── */

  function getSubEnvLabel() {
    const fam = ENV_FAMILIES[els.env.value];
    if (!fam || !fam.subEl) return '';
    const el = document.getElementById(fam.subEl);
    return el ? (el.options[el.selectedIndex]?.text || '') : '';
  }

  function updateMap() {
    const s = sel();
    const fam = ENV_FAMILIES[s.env] || {};
    $('#map-env').textContent = fam.label || selectedText(els.env);
    const envSub = $('#map-env-sub');
    envSub.textContent = s.envName && s.envName !== 'deliverybench' ? getSubEnvLabel() : '';

    $('#map-perc').textContent = selectedText(els.perception);
    const reasText = selectedText(els.reasoning);
    const reasParts = reasText.match(/^(.+?)(\s*\(.+\))?$/);
    $('#map-reas').textContent = reasParts ? reasParts[1] : reasText;
    const reasSub = $('#map-reas-sub');
    reasSub.textContent = reasParts && reasParts[2] ? reasParts[2].trim() : '';

    $('#map-mem').textContent = selectedText(els.memory);
    $('#map-refl').textContent = selectedText(els.reflection);
  }

  function updateSummary() {
    const s = sel();
    const fam = ENV_FAMILIES[s.env] || {};
    const envLabel = fam.label || selectedText(els.env);
    const subLabel = getSubEnvLabel();
    $('#sum-env').textContent = subLabel ? envLabel + ' — ' + subLabel : envLabel;
    $('#sum-perc').textContent = selectedText(els.perception);
    $('#sum-reas').textContent = selectedText(els.reasoning);
    $('#sum-mem').textContent = selectedText(els.memory);
    $('#sum-refl').textContent = selectedText(els.reflection);
    $('#setup-env-name').textContent = subLabel || envLabel;
  }

  function refresh() {
    checkCompat();
    generate();
    updateMap();
    updateSummary();
  }

  /* ── Actions ─────────────────────────────────────────────── */

  function copyCode(btn) {
    function flash() {
      btn.classList.add('is-copied');
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('is-copied'); }, 1500);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lastCode).then(flash).catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
    function fallbackCopy() {
      const ta = document.createElement('textarea');
      ta.value = lastCode;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand('copy'); flash(); } catch (e) {}
      document.body.removeChild(ta);
    }
  }

  function downloadCode() {
    const blob = new Blob([lastCode], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'generated_agent.py';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ── Simulation data ─────────────────────────────────────── */

  const SIM = {
    /* MiniGrid + Simple (rule-based, fast) */
    'minigrid-simple': {
      meta: { recovery_type: 'rule_based_search', diagnostic_action: 'BFS_PATHFIND()' },
      steps: [
        { status: 'init',    action: 'ENV_RESET',        detail: 'MiniGrid-DoorKey-5x5-v0 initialized' },
        { status: 'init',    action: 'PERCEPTION_INIT',  detail: 'MiniGridPerceptionModule loaded' },
        { status: 'init',    action: 'REASONING_INIT',   detail: 'SimpleReasoning (BFS) ready' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: empty cell ahead' },
        { status: 'action',  action: 'TURN_LEFT',        detail: 'obs: key visible at (2,3)' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: approaching key' },
        { status: 'action',  action: 'PICKUP_KEY',       detail: 'carrying: yellow_key' },
        { status: 'action',  action: 'TURN_RIGHT',       detail: 'obs: door at (4,2)' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: door 2 steps ahead' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: adjacent to door' },
        { status: 'action',  action: 'TOGGLE_DOOR',      detail: 'door unlocked with yellow_key' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: goal visible' },
        { status: 'success', action: 'REACH_GOAL',       detail: 'task completed in 9 steps' },
      ],
    },

    /* MiniGrid + LLM direct */
    'minigrid-llm': {
      meta: { recovery_type: 'llm_direct_policy', diagnostic_action: 'LLM_STEP()' },
      steps: [
        { status: 'init',    action: 'ENV_RESET',        detail: 'MiniGrid-DoorKey-5x5-v0 initialized' },
        { status: 'init',    action: 'LLM_CONNECT',      detail: 'OpenAIClient → gpt-4o-mini' },
        { status: 'reason',  action: 'LLM_QUERY',        detail: 'thought: I see an open grid. The key should be nearby. Move forward first.' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: empty cell, key not visible yet' },
        { status: 'reason',  action: 'LLM_QUERY',        detail: 'thought: Key still not visible. Try turning to expand field of view.' },
        { status: 'action',  action: 'TURN_LEFT',        detail: 'obs: yellow key spotted at (2,3)' },
        { status: 'reason',  action: 'LLM_QUERY',        detail: 'thought: Key is to my left. Navigate and pick it up.' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: moved closer to key' },
        { status: 'action',  action: 'PICKUP_KEY',       detail: 'inventory: yellow_key acquired' },
        { status: 'reason',  action: 'LLM_QUERY',        detail: 'thought: I have the key. Now find and unlock the door.' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: door visible at (4,2)' },
        { status: 'action',  action: 'TOGGLE_DOOR',      detail: 'door opened successfully' },
        { status: 'success', action: 'REACH_GOAL',       detail: 'task completed in 12 steps' },
      ],
    },

    /* MiniGrid + ReAct */
    'minigrid-react': {
      meta: { recovery_type: 'react_loop', diagnostic_action: 'REASON_ACT_OBSERVE()' },
      steps: [
        { status: 'init',    action: 'ENV_RESET',        detail: 'MiniGrid-DoorKey-5x5-v0 initialized' },
        { status: 'init',    action: 'LLM_CONNECT',      detail: 'OpenAIClient → gpt-4o-mini' },
        { status: 'reason',  action: 'THOUGHT',          detail: 'I need to find a key to unlock the door and reach the goal.' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'Observation: wall to the north, key visible south-east' },
        { status: 'reason',  action: 'THOUGHT',          detail: 'Key is south-east. I should turn right and move toward it.' },
        { status: 'action',  action: 'TURN_RIGHT',       detail: 'Observation: key now ahead at distance 2' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'Observation: adjacent to key' },
        { status: 'action',  action: 'PICKUP_KEY',       detail: 'Observation: yellow_key added to inventory' },
        { status: 'reason',  action: 'THOUGHT',          detail: 'Key acquired. I remember seeing a locked door to the west.' },
        { status: 'action',  action: 'TURN_LEFT',        detail: 'Observation: door visible, distance 3' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'Observation: moving toward door' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'Observation: adjacent to locked door' },
        { status: 'reason',  action: 'THOUGHT',          detail: 'I am adjacent to the door and have the key. Toggle to unlock.' },
        { status: 'action',  action: 'TOGGLE_DOOR',      detail: 'Observation: door unlocked and opened' },
        { status: 'reason',  action: 'THOUGHT',          detail: 'Door open. The goal cell should be just beyond.' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'Observation: goal cell reached!' },
        { status: 'success', action: 'REACH_GOAL',       detail: 'task completed in 14 steps  |  reward: 0.93' },
      ],
    },

    /* MiniGrid + Chain-of-Thought */
    'minigrid-cot': {
      meta: { recovery_type: 'chain_of_thought', diagnostic_action: 'COT_STEP()' },
      steps: [
        { status: 'init',    action: 'ENV_RESET',        detail: 'MiniGrid-DoorKey-5x5-v0 initialized' },
        { status: 'init',    action: 'LLM_CONNECT',      detail: 'OpenAIClient → gpt-4o-mini' },
        { status: 'reason',  action: 'COT_CHAIN',        detail: 'Step 1: Survey surroundings. Step 2: Locate key. Step 3: Pick up key. Step 4: Locate door. Step 5: Unlock and enter.' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: open cell, no items' },
        { status: 'action',  action: 'TURN_LEFT',        detail: 'obs: key at (1,3)' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: approaching key' },
        { status: 'action',  action: 'PICKUP_KEY',       detail: 'inventory: yellow_key' },
        { status: 'reason',  action: 'COT_CHAIN',        detail: 'Key obtained. Re-plan: navigate to door at (3,0) and unlock.' },
        { status: 'action',  action: 'TURN_RIGHT',       detail: 'facing north' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: moved north' },
        { status: 'action',  action: 'TURN_RIGHT',       detail: 'facing east, door visible' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: adjacent to door' },
        { status: 'action',  action: 'TOGGLE_DOOR',      detail: 'door opened' },
        { status: 'success', action: 'REACH_GOAL',       detail: 'task completed in 11 steps  |  reward: 0.95' },
      ],
    },

    /* MiniGrid + Tree of Thoughts */
    'minigrid-tot': {
      meta: { recovery_type: 'tree_of_thoughts_bfs', diagnostic_action: 'TOT_EXPAND()' },
      steps: [
        { status: 'init',    action: 'ENV_RESET',        detail: 'MiniGrid-DoorKey-5x5-v0 initialized' },
        { status: 'init',    action: 'LLM_CONNECT',      detail: 'OpenAIClient → gpt-4o-mini' },
        { status: 'reason',  action: 'TOT_EXPAND',       detail: 'Expanding 3 candidate paths: [north, east, south]' },
        { status: 'reason',  action: 'TOT_EVALUATE',     detail: 'Scores: north=0.4, east=0.7, south=0.3 → select east' },
        { status: 'action',  action: 'TURN_RIGHT',       detail: 'obs: key visible ahead' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: key at distance 1' },
        { status: 'action',  action: 'PICKUP_KEY',       detail: 'inventory: yellow_key' },
        { status: 'reason',  action: 'TOT_EXPAND',       detail: 'Expanding 3 paths to door: [north, west, backtrack]' },
        { status: 'reason',  action: 'TOT_EVALUATE',     detail: 'Scores: north=0.8, west=0.5, back=0.2 → select north' },
        { status: 'action',  action: 'TURN_LEFT',        detail: 'facing north' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: door ahead' },
        { status: 'action',  action: 'TOGGLE_DOOR',      detail: 'door unlocked' },
        { status: 'success', action: 'REACH_GOAL',       detail: 'task completed in 10 steps  |  reward: 0.96  |  tree nodes: 6' },
      ],
    },

    /* MiniGrid + RAP */
    'minigrid-rap': {
      meta: { recovery_type: 'rap_mcts', diagnostic_action: 'MCTS_ROLLOUT()' },
      steps: [
        { status: 'init',    action: 'ENV_RESET',        detail: 'MiniGrid-DoorKey-5x5-v0 initialized' },
        { status: 'init',    action: 'LLM_CONNECT',      detail: 'OpenAIClient → gpt-4o-mini' },
        { status: 'reason',  action: 'MCTS_ROLLOUT',     detail: 'Iteration 1/10: simulating 4 random rollouts' },
        { status: 'reason',  action: 'MCTS_BACKPROP',    detail: 'Best UCB1 node: TURN_RIGHT (score 0.68)' },
        { status: 'action',  action: 'TURN_RIGHT',       detail: 'obs: key spotted' },
        { status: 'reason',  action: 'MCTS_ROLLOUT',     detail: 'Iteration 2/10: refining path to key' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: adjacent to key' },
        { status: 'action',  action: 'PICKUP_KEY',       detail: 'inventory: yellow_key' },
        { status: 'reason',  action: 'MCTS_ROLLOUT',     detail: 'Iteration 3/10: planning route to door' },
        { status: 'reason',  action: 'MCTS_BACKPROP',    detail: 'Best path: 3 moves to door (score 0.91)' },
        { status: 'action',  action: 'NAVIGATE_TO_DOOR', detail: 'executed 3-step path' },
        { status: 'action',  action: 'TOGGLE_DOOR',      detail: 'door unlocked' },
        { status: 'success', action: 'REACH_GOAL',       detail: 'task completed in 8 steps  |  reward: 0.97  |  MCTS nodes: 24' },
      ],
    },

    /* DeliveryBench */
    'deliverybench-react': {
      meta: { recovery_type: 'decomposed_reintegration', diagnostic_action: 'VIEW_BAG()' },
      steps: [
        { status: 'init',    action: 'ENV_RESET',        detail: 'DeliveryBench environment loaded' },
        { status: 'init',    action: 'LLM_CONNECT',      detail: 'OpenAIClient → gpt-4o-mini' },
        { status: 'reason',  action: 'THOUGHT',          detail: 'I see 5 pending orders. Start with order #1.' },
        { status: 'action',  action: 'VIEW_ORDER',       detail: 'order 1: burger×1 → bag A' },
        { status: 'action',  action: 'PICK_FOOD',        detail: 'picked: burger from station 2' },
        { status: 'action',  action: 'PLACE_FOOD_IN_BAG',detail: 'order 1: burger → A ✓' },
        { status: 'reason',  action: 'THOUGHT',          detail: 'Order 1 done. Process order 2.' },
        { status: 'action',  action: 'VIEW_ORDER',       detail: 'order 2: fries×2, drink×1 → bag B' },
        { status: 'action',  action: 'PICK_FOOD',        detail: 'picked: fries×2 from station 1' },
        { status: 'action',  action: 'PICK_FOOD',        detail: 'picked: drink from station 3' },
        { status: 'action',  action: 'PLACE_FOOD_IN_BAG',detail: 'order 2: fries, drink → B ✓' },
        { status: 'reason',  action: 'THOUGHT',          detail: 'Orders 1-2 done. Checking remaining orders.' },
        { status: 'action',  action: 'VIEW_BAG',         detail: 'bag A: complete  |  bag B: complete' },
        { status: 'success', action: 'DELIVER_BAGS',     detail: '2/2 orders fulfilled  |  accuracy: 100%' },
      ],
    },

    /* MiniGrid + Plan-and-Solve */
    'minigrid-plan_and_solve': {
      meta: { recovery_type: 'plan_and_solve', diagnostic_action: 'PLAN_THEN_SOLVE()' },
      steps: [
        { status: 'init',    action: 'ENV_RESET',        detail: 'MiniGrid-DoorKey-5x5-v0 initialized' },
        { status: 'init',    action: 'LLM_CONNECT',      detail: 'OpenAIClient → gpt-4o-mini' },
        { status: 'reason',  action: 'PLAN',             detail: 'Plan: [1] find key, [2] pick up key, [3] locate door, [4] unlock door, [5] reach goal' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'Solving step 1: searching for key' },
        { status: 'action',  action: 'TURN_LEFT',        detail: 'obs: key spotted at (2,3)' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'Solving step 2: approaching key' },
        { status: 'action',  action: 'PICKUP_KEY',       detail: 'inventory: yellow_key ✓' },
        { status: 'reason',  action: 'REPLAN',           detail: 'Steps 1-2 done. Proceeding to step 3.' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'Solving step 3: door visible at (4,2)' },
        { status: 'action',  action: 'TOGGLE_DOOR',      detail: 'Solving step 4: door unlocked ✓' },
        { status: 'success', action: 'REACH_GOAL',       detail: 'task completed in 9 steps  |  reward: 0.95' },
      ],
    },

    /* MiniGrid + Self-Consistency */
    'minigrid-self_consistency': {
      meta: { recovery_type: 'self_consistency_voting', diagnostic_action: 'SAMPLE_AND_VOTE()' },
      steps: [
        { status: 'init',    action: 'ENV_RESET',        detail: 'MiniGrid-DoorKey-5x5-v0 initialized' },
        { status: 'init',    action: 'LLM_CONNECT',      detail: 'OpenAIClient → gpt-4o-mini (temp=0.7)' },
        { status: 'reason',  action: 'SAMPLE_x5',        detail: 'Sampling 5 independent reasoning paths...' },
        { status: 'reason',  action: 'VOTE',             detail: 'Majority action: TURN_LEFT (4/5 paths agree)' },
        { status: 'action',  action: 'TURN_LEFT',        detail: 'obs: key visible south-east' },
        { status: 'reason',  action: 'SAMPLE_x5',        detail: 'Sampling 5 paths for next action...' },
        { status: 'reason',  action: 'VOTE',             detail: 'Majority action: MOVE_FORWARD (5/5 agree)' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: adjacent to key' },
        { status: 'action',  action: 'PICKUP_KEY',       detail: 'inventory: yellow_key' },
        { status: 'reason',  action: 'SAMPLE_x5',        detail: 'Sampling 5 paths toward door...' },
        { status: 'reason',  action: 'VOTE',             detail: 'Majority action: NAVIGATE_TO_DOOR (4/5)' },
        { status: 'action',  action: 'TOGGLE_DOOR',      detail: 'door unlocked' },
        { status: 'success', action: 'REACH_GOAL',       detail: 'task completed  |  consistency score: 0.88' },
      ],
    },

    /* MiniGrid + SitSup */
    'minigrid-sitsup': {
      meta: { recovery_type: 'situation_aware_planning', diagnostic_action: 'SITUATION_SNAPSHOT()' },
      steps: [
        { status: 'init',    action: 'ENV_RESET',        detail: 'MiniGrid-DoorKey-5x5-v0 initialized' },
        { status: 'init',    action: 'LLM_CONNECT',      detail: 'OpenAIClient → gpt-4o-mini' },
        { status: 'reason',  action: 'SITUATION_SNAPSHOT', detail: 'entities: {agent@(1,1), key@(2,3), door@(4,2), goal@(4,4)}' },
        { status: 'reason',  action: 'STATE_PREDICT',    detail: 'predicted next state: agent@(1,2) after MOVE_FORWARD' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: matches prediction ✓' },
        { status: 'reason',  action: 'SITUATION_SNAPSHOT', detail: 'agent@(1,2) — key now distance 1' },
        { status: 'action',  action: 'PICKUP_KEY',       detail: 'situation updated: carrying yellow_key' },
        { status: 'reason',  action: 'STATE_PREDICT',    detail: 'path to door: 4 steps via east corridor' },
        { status: 'action',  action: 'NAVIGATE_TO_DOOR', detail: 'executed predicted path' },
        { status: 'action',  action: 'TOGGLE_DOOR',      detail: 'situation: door open, goal reachable' },
        { status: 'success', action: 'REACH_GOAL',       detail: 'task completed in 10 steps  |  prediction accuracy: 91%' },
      ],
    },

    /* MiniGrid + Multi-Agent Debate */
    'minigrid-mad': {
      meta: { recovery_type: 'multi_agent_debate', diagnostic_action: 'DEBATE_ROUND()' },
      steps: [
        { status: 'init',    action: 'ENV_RESET',        detail: 'MiniGrid-DoorKey-5x5-v0 initialized' },
        { status: 'init',    action: 'LLM_CONNECT',      detail: 'OpenAIClient → gpt-4o-mini (3 agents)' },
        { status: 'reason',  action: 'DEBATE_R1',        detail: 'Agent A: "move forward". Agent B: "turn left first". Agent C: "turn left first".' },
        { status: 'reason',  action: 'CONSENSUS',        detail: 'Final: TURN_LEFT (2/3 agents)' },
        { status: 'action',  action: 'TURN_LEFT',        detail: 'obs: key visible' },
        { status: 'reason',  action: 'DEBATE_R1',        detail: 'All 3 agents agree: MOVE_FORWARD toward key' },
        { status: 'reason',  action: 'CONSENSUS',        detail: 'Final: MOVE_FORWARD (3/3 agents)' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: adjacent to key' },
        { status: 'action',  action: 'PICKUP_KEY',       detail: 'inventory: yellow_key' },
        { status: 'reason',  action: 'DEBATE_R1',        detail: 'Agents debate: navigate north vs east. North wins 2/3.' },
        { status: 'action',  action: 'NAVIGATE_TO_DOOR', detail: 'north path to door' },
        { status: 'action',  action: 'TOGGLE_DOOR',      detail: 'door unlocked' },
        { status: 'success', action: 'REACH_GOAL',       detail: 'task completed  |  debate rounds: 4  |  avg consensus: 82%' },
      ],
    },

    /* MiniGrid + LATS */
    'minigrid-lats': {
      meta: { recovery_type: 'language_agent_tree_search', diagnostic_action: 'LATS_EXPAND()' },
      steps: [
        { status: 'init',    action: 'ENV_RESET',        detail: 'MiniGrid-DoorKey-5x5-v0 initialized' },
        { status: 'init',    action: 'LLM_CONNECT',      detail: 'OpenAIClient → gpt-4o-mini' },
        { status: 'reason',  action: 'LATS_EXPAND',      detail: 'Depth 1: generating 5 candidate thoughts' },
        { status: 'reason',  action: 'LATS_EVALUATE',    detail: 'Best: "Turn left to expose key" (score 0.72)' },
        { status: 'action',  action: 'TURN_LEFT',        detail: 'obs: key visible at distance 2' },
        { status: 'reason',  action: 'LATS_EXPAND',      detail: 'Depth 2: 5 thoughts, pruning low-value branches' },
        { status: 'reason',  action: 'LATS_ROLLOUT',     detail: 'Rollout depth 4: simulating pick-key path' },
        { status: 'action',  action: 'MOVE_FORWARD',     detail: 'obs: adjacent to key' },
        { status: 'action',  action: 'PICKUP_KEY',       detail: 'inventory: yellow_key' },
        { status: 'reason',  action: 'LATS_EXPAND',      detail: 'Depth 3: optimal path to door found' },
        { status: 'action',  action: 'NAVIGATE_TO_DOOR', detail: 'executing optimal sub-path' },
        { status: 'action',  action: 'TOGGLE_DOOR',      detail: 'door unlocked' },
        { status: 'success', action: 'REACH_GOAL',       detail: 'task completed  |  tree nodes expanded: 31  |  reward: 0.98' },
      ],
    },

    /* AI2-THOR */
    'thor-react': {
      meta: { recovery_type: 'react_loop_3d', diagnostic_action: 'GetReachablePositions()' },
      steps: [
        { status: 'init',    action: 'THOR_INIT',         detail: 'AI2-THOR controller started (headless)' },
        { status: 'init',    action: 'SCENE_LOAD',        detail: 'Scene FloorPlan1 loaded — Kitchen' },
        { status: 'init',    action: 'LLM_CONNECT',       detail: 'OpenAIClient → gpt-4o-mini' },
        { status: 'reason',  action: 'THOUGHT',           detail: 'I am in a kitchen. I can see a countertop, fridge, and sink.' },
        { status: 'action',  action: 'GetReachablePositions', detail: '48 reachable cells computed' },
        { status: 'reason',  action: 'THOUGHT',           detail: 'Task: find and pick up the apple. Look around first.' },
        { status: 'action',  action: 'RotateRight',        detail: 'obs: countertop with apple visible' },
        { status: 'reason',  action: 'THOUGHT',           detail: 'Apple is on the countertop to my right.' },
        { status: 'action',  action: 'MoveAhead',          detail: 'obs: moved closer to countertop' },
        { status: 'action',  action: 'PickupObject',       detail: 'object: Apple_1  |  success: true' },
        { status: 'reason',  action: 'THOUGHT',           detail: 'Apple picked up. Task complete.' },
        { status: 'success', action: 'TASK_COMPLETE',      detail: 'apple found and picked up  |  steps: 6' },
      ],
    },

    'thor-simple': {
      meta: { recovery_type: 'rule_based_nav', diagnostic_action: 'MoveAhead()' },
      steps: [
        { status: 'init',    action: 'THOR_INIT',         detail: 'AI2-THOR controller started (headless)' },
        { status: 'init',    action: 'SCENE_LOAD',        detail: 'Scene FloorPlan1 loaded' },
        { status: 'action',  action: 'MoveAhead',          detail: 'obs: path clear' },
        { status: 'action',  action: 'RotateRight',        detail: 'obs: object visible' },
        { status: 'action',  action: 'MoveAhead',          detail: 'obs: adjacent to object' },
        { status: 'action',  action: 'PickupObject',       detail: 'object acquired' },
        { status: 'success', action: 'TASK_COMPLETE',      detail: 'rule-based run complete' },
      ],
    },

    /* RoboTHOR */
    'robothor-react': {
      meta: { recovery_type: 'objectnav_react', diagnostic_action: 'OBJECTNAV_STEP()' },
      steps: [
        { status: 'init',    action: 'THOR_INIT',         detail: 'RoboTHOR controller started (locobot mode)' },
        { status: 'init',    action: 'SCENE_LOAD',        detail: 'FloorPlan_Train1_1 loaded' },
        { status: 'init',    action: 'LLM_CONNECT',       detail: 'OpenAIClient → gpt-4o-mini' },
        { status: 'reason',  action: 'THOUGHT',           detail: 'ObjectNav task: find "Television". Start by scanning room.' },
        { status: 'action',  action: 'RotateRight',        detail: 'obs: living room, no television yet' },
        { status: 'action',  action: 'RotateRight',        detail: 'obs: television spotted on far wall' },
        { status: 'reason',  action: 'THOUGHT',           detail: 'Television at ~3m. Navigate toward it.' },
        { status: 'action',  action: 'MoveAhead',          detail: 'obs: moving toward TV' },
        { status: 'action',  action: 'MoveAhead',          detail: 'obs: TV closer, distance ~1m' },
        { status: 'reason',  action: 'THOUGHT',           detail: 'Close enough — Stop action to end episode.' },
        { status: 'action',  action: 'Stop',              detail: 'distance to TV: 0.8m (< threshold 1.0m)' },
        { status: 'success', action: 'OBJECTNAV_SUCCESS', detail: 'Television found  |  SPL: 0.81  |  steps: 8' },
      ],
    },

    /* Gym */
    'gym-react': {
      meta: { recovery_type: 'llm_gym_policy', diagnostic_action: 'STEP()' },
      steps: [
        { status: 'init',    action: 'GYM_MAKE',          detail: 'CartPole-v1 created' },
        { status: 'init',    action: 'LLM_CONNECT',       detail: 'OpenAIClient → gpt-4o-mini' },
        { status: 'action',  action: 'RESET',             detail: 'obs: [cart_pos=0.02, cart_vel=-0.01, pole_angle=0.04, pole_vel=0.03]' },
        { status: 'reason',  action: 'THOUGHT',           detail: 'Pole is tilting right (angle=0.04). Push cart right to balance.' },
        { status: 'action',  action: 'PUSH_RIGHT',        detail: 'obs: angle=0.03, reward=1.0' },
        { status: 'reason',  action: 'THOUGHT',           detail: 'Pole still tilting right. Continue right.' },
        { status: 'action',  action: 'PUSH_RIGHT',        detail: 'obs: angle=0.01, reward=1.0' },
        { status: 'reason',  action: 'THOUGHT',           detail: 'Pole nearly balanced. Slight correction left.' },
        { status: 'action',  action: 'PUSH_LEFT',         detail: 'obs: angle=-0.005, reward=1.0' },
        { status: 'action',  action: 'PUSH_RIGHT',        detail: 'obs: angle=0.002, reward=1.0' },
        { status: 'action',  action: 'PUSH_LEFT',         detail: 'obs: angle=0.001, reward=1.0' },
        { status: 'success', action: 'EPISODE_END',       detail: 'survived 200 steps  |  total reward: 200.0' },
      ],
    },

    'gym-simple': {
      meta: { recovery_type: 'random_policy', diagnostic_action: 'SAMPLE()' },
      steps: [
        { status: 'init',    action: 'GYM_MAKE',          detail: 'CartPole-v1 created' },
        { status: 'action',  action: 'RESET',             detail: 'initial obs received' },
        { status: 'action',  action: 'RANDOM_ACTION',     detail: 'action: 1  |  reward: 1.0  |  done: false' },
        { status: 'action',  action: 'RANDOM_ACTION',     detail: 'action: 0  |  reward: 1.0  |  done: false' },
        { status: 'action',  action: 'RANDOM_ACTION',     detail: 'action: 1  |  reward: 1.0  |  done: true' },
        { status: 'success', action: 'EPISODE_END',       detail: 'episode done  |  total reward: 3.0' },
      ],
    },

    /* Fallback */
    'default': {
      meta: { recovery_type: 'general_policy', diagnostic_action: 'STEP()' },
      steps: [
        { status: 'init',    action: 'ENV_RESET',         detail: 'Environment initialized' },
        { status: 'init',    action: 'MODULES_INIT',      detail: 'All modules loaded' },
        { status: 'action',  action: 'OBSERVE',           detail: 'Collecting initial observation' },
        { status: 'action',  action: 'STEP',              detail: 'Executing first action' },
        { status: 'action',  action: 'STEP',              detail: 'Executing second action' },
        { status: 'success', action: 'COMPLETE',          detail: 'Run finished successfully' },
      ],
    },
  };

  function getSimKey(s) {
    if (s.env === 'deliverybench') return 'deliverybench-react';
    if (s.env === 'thor')     { const k = 'thor-' + s.reasoning;     return SIM[k] ? k : 'thor-react'; }
    if (s.env === 'robothor') { const k = 'robothor-' + s.reasoning; return SIM[k] ? k : 'robothor-react'; }
    if (s.env === 'gym')      { const k = 'gym-' + s.reasoning;      return SIM[k] ? k : 'gym-react'; }
    /* minigrid / babyai */
    const key = 'minigrid-' + s.reasoning;
    return SIM[key] ? key : 'default';
  }

  /* ── Simulation runner ────────────────────────────────────── */

  let simTimer = null;

  function resetObv() {
    $('#obv-recovery').textContent = '—';
    $('#obv-diagnostic').textContent = '—';
    $('#obv-steps').innerHTML = '';
  }

  function setObvStatus(label, cssClass) {
    const head = $('#pg-obv-status');
    if (head) { head.textContent = label; head.className = 'pg-obv-status ' + cssClass; }
  }

  function appendStep(stepData, stepNum) {
    const stepsEl = $('#obv-steps');
    const detail = stepData.detail || '';
    const div = document.createElement('div');
    div.className = 'pg-obv-step pg-obv-step--' + stepData.status + ' pg-obv-step--enter';
    div.innerHTML =
      '<div class="pg-obv-step-head">' +
        '<span class="pg-obv-step-num">Step ' + stepNum + '</span>' +
        '<span class="pg-obv-step-badge">' + stepData.status.replace(/_/g, ' ') + '</span>' +
      '</div>' +
      '<div class="pg-obv-step-action">' + stepData.action.replace(/_/g, ' ') + '</div>' +
      (detail ? '<div class="pg-obv-step-detail">' + detail + '</div>' : '');
    stepsEl.appendChild(div);
    requestAnimationFrame(() => div.classList.remove('pg-obv-step--enter'));
    div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function runSimulation() {
    if (simTimer) { clearTimeout(simTimer); simTimer = null; }
    resetObv();

    const s = sel();
    const key = getSimKey(s);
    const sim = SIM[key] || SIM['default'];

    const btn = els.startBtn;
    btn.disabled = true;
    btn.classList.add('is-running');
    btn.innerHTML = '<span class="pg-spinner"></span> Running…';

    $('#obv-recovery').textContent = sim.meta.recovery_type.replace(/_/g, ' ');
    $('#obv-diagnostic').textContent = sim.meta.diagnostic_action;

    const delays = { init: 400, reason: 700, action: 500, success: 600, fail: 600 };
    let i = 0;
    let elapsed = 0;

    function scheduleNext() {
      if (i >= sim.steps.length) {
        const last = sim.steps[sim.steps.length - 1];
        const isSuccess = last.status === 'success';
        btn.disabled = false;
        btn.classList.remove('is-running');
        btn.classList.add(isSuccess ? 'is-done' : 'is-failed');
        btn.innerHTML = isSuccess
          ? '<i class="fas fa-check"></i> Completed'
          : '<i class="fas fa-times"></i> Failed';
        setTimeout(() => {
          btn.classList.remove('is-done', 'is-failed');
          btn.innerHTML = 'Run Again <i class="fas fa-redo"></i>';
        }, 2500);
        return;
      }
      const step = sim.steps[i];
      const delay = delays[step.status] || 500;
      elapsed += delay;
      simTimer = setTimeout(() => {
        appendStep(step, i + 1);
        i++;
        scheduleNext();
      }, delay);
    }

    scheduleNext();
  }

  /* ── Init ────────────────────────────────────────────────── */

  function init() {
    /* env family change: auto-perception + sub-selector swap */
    els.env.addEventListener('change', () => { onEnvChange(); refresh(); });

    /* sub-env selectors */
    ['sel-env-name','sel-env-scene','sel-env-robothor','sel-env-gym'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', refresh);
    });

    /* module selectors */
    [els.perception, els.reasoning, els.memory, els.reflection].forEach(
      el => el.addEventListener('change', () => { checkCompat(); refresh(); })
    );

    els.copyBtn.addEventListener('click', () => copyCode(els.copyBtn));
    els.copyInline.addEventListener('click', () => copyCode(els.copyInline));
    els.dlBtn.addEventListener('click', downloadCode);
    els.startBtn.addEventListener('click', runSimulation);

    /* boot: apply env-family defaults */
    onEnvChange();
    refresh();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
