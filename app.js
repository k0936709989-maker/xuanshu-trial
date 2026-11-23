/* ==========================================================================
   玄樞閣 — 前端互動核心引擎 (app.js)
   純記憶體暫態管理（100% 沙盒預覽與 GitHub Pages 靜態相容）
   ========================================================================== */
(() => {
  const DEPLOY_API = window.__API_BASE__ || "__PORT_8088__";
  const API_BASE = DEPLOY_API.startsWith("__PORT_") ? "" : DEPLOY_API;

  const state = {
    activeTab: "tarot",
    bgMode: "star-pavilion",
    tarotMentor: "vera",
    yijingMentor: "fubo",
    yijingMethod: "liuyao_coins",
    namingMode: "baby",
    coinThrows: [],
    fanTargetCount: 4,
    fanPickedIndices: [],
    mentors: {
      vera: {
        name: "薇拉",
        title: "星夜秘境・首席塔羅導師",
        avatar: "./assets/mentors/vera.webp",
        opener: "先把焦慮放下來，牌面已經把這件事最真實的底牌攤開了。",
      },
      rien: {
        name: "里恩",
        title: "星軌樞機・冷冽決策占卜師",
        avatar: "./assets/mentors/rien.webp",
        opener: "我們不談空泛的安慰，直接看這件事的籌碼、代價與勝算。",
      },
      meiniang: {
        name: "梅娘",
        title: "澄心書院・梅花易數名師",
        avatar: "./assets/mentors/meiniang.webp",
        opener: "萬事起心即有數，卦氣已經把眼前的順逆節奏映出來了。",
      },
      fubo: {
        name: "福伯",
        title: "玄樞宗師・京房六爻與八字大家",
        avatar: "./assets/mentors/fubo.webp",
        opener: "坐下來喝口茶，不用看那些難懂的卦名，我直接講重點給你聽。",
      },
    },
  };

  const HALL_COPY = {
    tarot: {
      headline: "秘境塔羅問事館｜針對你的問題直球拆解結果與原因",
      lead: "寫下你心裡最卡的一件事，系統自動辨識問型並配置最適牌陣，翻牌後直接告訴你成不成、為什麼、接下來怎麼做。",
      mentorKey: () => state.tarotMentor,
    },
    yijing: {
      headline: "太極易經問事館｜京房六爻三枚銅錢與梅花易數直斷",
      lead: "底層嚴格推演月建、日辰、世應與六親生剋，前台不丟艱深古文，直接用正常人聽得懂的白話講明吉凶與對策。",
      mentorKey: () => state.yijingMentor,
    },
    naming: {
      headline: "八術姓名學宗師館｜嬰兒取名・成人改名・公司品牌與組織命名",
      lead: "先以雙曆零誤差排出四柱八字與《窮通寶鑑》調候用神，再通過康熙五格、三才、生肖父母防沖、易經六十四卦等八術零否決嚴選。",
      mentorKey: () => "fubo",
    },
    bazi: {
      headline: "四柱八字零誤差排盤｜雙窗隔離 17 條審核 SOP",
      lead: "落實產書與審書雙對話窗物理隔離、CP05 單一真值鎖（年份・門檻・好日子只算一次）及全 17 條責任歸屬追責矩陣。",
      mentorKey: () => "fubo",
    },
    journal: {
      headline: "玄樞問事與命名紀錄簿｜歷次直斷與命名方案封存查閱",
      lead: "所有占卜解答、現名病灶診斷與企業命名方案皆安全記錄於系統資料庫，隨時對照印證。",
      mentorKey: () => "meiniang",
    },
  };

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const TRIAL_END_MS = Date.parse("2026-11-30T23:59:59+08:00");

  function handleTrialExpiredUI(reasonText) {
    const overlay = document.getElementById("trialExpiredOverlay");
    if (overlay) overlay.classList.remove("hidden");
    const badge = document.getElementById("trialBadgeText");
    if (badge) badge.textContent = "七日試用期已屆滿";
    const dot = document.getElementById("trialStatusDot");
    if (dot) dot.style.background = "#e06d5b";
    if (reasonText) {
      const p = overlay ? overlay.querySelector(".plain-body") : null;
      if (p) p.textContent = reasonText;
    }
  }

  function updateTrialCountdownUI(policy) {
    let remSec = Math.floor((TRIAL_END_MS - Date.now()) / 1000);
    if (policy && typeof policy.remaining_seconds === "number") {
      remSec = policy.remaining_seconds;
    }
    const urlParams = new URLSearchParams(window.location.search || "");
    if (urlParams.get("preview_expired") === "1") {
      remSec = -1;
    }
    if (remSec <= 0 || (policy && policy.trial_active === false)) {
      handleTrialExpiredUI("本連結為專屬一週免驗證碼體驗版（有效期間：2026 年 11 月 24 日至 2026 年 11 月 30 日 23:59 台灣時間，共七日）。試用期限已結束，如需開通正式商業授權版請聯繫專屬專案負責人。");
      return;
    }
    const days = Math.floor(remSec / 86400);
    const hours = Math.floor((remSec % 86400) / 3600);
    const badge = document.getElementById("trialBadgeText");
    if (badge) {
      badge.textContent = `免碼試用剩 ${days}天${hours}時・手機分享`;
    }
    const detail = document.getElementById("trialCountdownDetail");
    if (detail) {
      detail.textContent = `免驗證碼點開即用｜試用期間：2026-11-24 至 2026-11-30 23:59（台灣時間，共七日），目前剩餘 ${days} 天 ${hours} 小時，屆滿自動關閉試用權限。`;
    }
  }

  function getCleanShareUrl() {
    try {
      const u = new URL(window.location.href);
      u.searchParams.delete("preview_expired");
      return u.toString();
    } catch (_) {
      return window.location.href;
    }
  }

  function populateShareModal() {
    const shareUrl = getCleanShareUrl();
    const inviteMsg = `《玄樞閣》七日免驗證碼手機試用版（點開即可直接試用塔羅直斷、易經六爻、八術姓名學與雙窗17條SOP，效期一週至 2026-11-30 23:59）：\n${shareUrl}`;
    const box = document.getElementById("shareInviteText");
    if (box) box.value = inviteMsg;

    const qrBox = document.getElementById("trialQrBox");
    if (qrBox && typeof window.qrcode === "function") {
      try {
        const qr = window.qrcode(0, "M");
        qr.addData(shareUrl);
        qr.make();
        qrBox.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 1, scalable: true });
      } catch (_) {
        qrBox.textContent = "手機掃描連結";
      }
    }
  }

  function showShareFeedback(msg) {
    const el = document.getElementById("shareFeedbackMsg");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
  }

  async function copyInviteToClipboard() {
    const box = document.getElementById("shareInviteText");
    const txt = box ? box.value : getCleanShareUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(txt);
      } else if (box) {
        box.focus();
        box.select();
        document.execCommand("copy");
      }
      showShareFeedback("已複製試用邀請文案與網址，可直接貼到 LINE 或訊息傳給老闆、主管與朋友試用。");
    } catch (_) {
      if (box) {
        box.focus();
        box.select();
      }
      showShareFeedback("請長按上方文字框複製試用網址。");
    }
  }

  function resolveVisitorId() {
    return "v_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }
  const VISITOR_ID = resolveVisitorId();
  let useStandalone = Boolean(
    window.__FORCE_STANDALONE__ ||
    (window.location && /\.github\.io$/i.test(window.location.hostname || ""))
  );

  async function apiGet(path) {
    if (useStandalone && window.XuanshuStandalone) {
      const j = await window.XuanshuStandalone.handleRequest("GET", path, {});
      if (j && j.trial_expired) handleTrialExpiredUI(j.error);
      return j;
    }
    try {
      const r = await fetch(`${API_BASE}${path}`, {
        headers: { "X-Visitor-Id": VISITOR_ID },
      });
      if (!r.ok && r.status !== 403) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      if (j && j.trial_expired) handleTrialExpiredUI(j.error);
      return j;
    } catch (_) {
      if (window.XuanshuStandalone) {
        useStandalone = true;
        const j = await window.XuanshuStandalone.handleRequest("GET", path, {});
        if (j && j.trial_expired) handleTrialExpiredUI(j.error);
        return j;
      }
      throw _;
    }
  }

  async function apiPost(path, payload) {
    if (useStandalone && window.XuanshuStandalone) {
      const j = await window.XuanshuStandalone.handleRequest("POST", path, payload || {});
      if (j && j.trial_expired) handleTrialExpiredUI(j.error);
      return j;
    }
    try {
      const r = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Visitor-Id": VISITOR_ID,
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok && r.status !== 403 && r.status !== 429) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      if (j && j.trial_expired) handleTrialExpiredUI(j.error);
      return j;
    } catch (_) {
      if (window.XuanshuStandalone) {
        useStandalone = true;
        const j = await window.XuanshuStandalone.handleRequest("POST", path, payload || {});
        if (j && j.trial_expired) handleTrialExpiredUI(j.error);
        return j;
      }
      throw _;
    }
  }

  function updateMentorBanner(mentorKey) {
    const m = state.mentors[mentorKey] || state.mentors.vera;
    const img = document.getElementById("heroMentorImg");
    img.src = m.avatar.startsWith("/assets") ? `.${m.avatar}` : m.avatar;
    img.alt = `駐館導師${m.name}肖像`;
    document.getElementById("heroMentorTitle").textContent = m.title;
    document.getElementById("heroMentorName").textContent = m.name;
    document.getElementById("heroMentorQuote").textContent = m.opener;
  }

  function switchTab(tabId) {
    state.activeTab = tabId;
    document.querySelectorAll(".hall-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    document.querySelectorAll(".hall-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `panel-${tabId}`);
    });
    const info = HALL_COPY[tabId] || HALL_COPY.tarot;
    document.getElementById("hallHeadline").textContent = info.headline;
    document.getElementById("hallLead").textContent = info.lead;
    updateMentorBanner(info.mentorKey());

    if (tabId === "journal") {
      loadJournal();
    }
  }

  /* ==================== 秘境動態星軌／羅盤／竹墨 Canvas ==================== */
  function initCelestialCanvas() {
    const canvas = document.getElementById("celestialCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let angle = 0;

    const particles = Array.from({ length: 46 }, (_, i) => ({
      x: ((i * 197) % 100) / 100,
      y: ((i * 313) % 100) / 100,
      r: 0.9 + (i % 3) * 0.65,
      s: 0.00012 + (i % 5) * 0.00005,
    }));

    window.addEventListener("resize", () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function drawFrame() {
      ctx.clearRect(0, 0, w, h);
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      const strokeGold = isLight ? "rgba(135, 99, 32, 0.16)" : "rgba(200, 163, 90, 0.16)";
      const dotGold = isLight ? "rgba(135, 99, 32, 0.30)" : "rgba(227, 197, 133, 0.42)";

      const cx = w * 0.76;
      const cy = h * 0.34;
      const baseR = Math.min(w, h) * 0.34;

      if (state.bgMode === "luopan-compass") {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        [0.55, 0.82, 1.08, 1.32].forEach((mult, idx) => {
          ctx.beginPath();
          ctx.arc(0, 0, baseR * mult, 0, Math.PI * 2);
          ctx.strokeStyle = strokeGold;
          ctx.lineWidth = idx === 1 ? 1.4 : 0.9;
          ctx.stroke();
        });
        for (let i = 0; i < 24; i++) {
          const a = (Math.PI * 2 * i) / 24;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * baseR * 0.55, Math.sin(a) * baseR * 0.55);
          ctx.lineTo(Math.cos(a) * baseR * 1.08, Math.sin(a) * baseR * 1.08);
          ctx.strokeStyle = strokeGold;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
        ctx.restore();
      } else if (state.bgMode === "star-pavilion") {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle * 0.6);
        [0.65, 1.05, 1.45].forEach((m) => {
          ctx.beginPath();
          ctx.arc(0, 0, baseR * m, 0, Math.PI * 1.45);
          ctx.strokeStyle = strokeGold;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        });
        ctx.restore();
      }

      particles.forEach((p) => {
        if (!reducedMotion) {
          p.y -= p.s;
          if (p.y < 0) p.y = 1;
        }
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dotGold;
        ctx.fill();
      });

      if (!reducedMotion) {
        angle += 0.0007;
        requestAnimationFrame(drawFrame);
      }
    }
    drawFrame();
  }

  /* ==================== 78 張黑曜鎏金雕刻塔羅 SVG 渲染器 ==================== */
  function renderTarotBackSVG() {
    return `
      <svg viewBox="0 0 120 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="2" y="2" width="116" height="196" rx="8" fill="#13100b" stroke="#c8a35a" stroke-width="1.6"/>
        <rect x="8" y="8" width="104" height="184" rx="5" fill="none" stroke="#c8a35a" stroke-opacity="0.45" stroke-width="0.9"/>
        <circle cx="60" cy="100" r="32" fill="none" stroke="#c8a35a" stroke-width="1.1"/>
        <circle cx="60" cy="100" r="20" fill="none" stroke="#c8a35a" stroke-opacity="0.55" stroke-width="0.8"/>
        <path d="M60 58 L66 94 L102 100 L66 106 L60 142 L54 106 L18 100 L54 94 Z" fill="#c8a35a" fill-opacity="0.22" stroke="#c8a35a" stroke-width="0.9"/>
        <circle cx="60" cy="34" r="4" fill="#c8a35a" fill-opacity="0.6"/>
        <circle cx="60" cy="166" r="4" fill="#c8a35a" fill-opacity="0.6"/>
      </svg>`;
  }

  function renderTarotFaceSVG(card) {
    const cid = card.card_id || "M00";
    const suit = cid[0];
    const rot = card.is_upright ? "" : 'transform="rotate(180 70 105)"';
    let motif = "";

    if (suit === "M") {
      motif = `
        <circle cx="70" cy="102" r="36" fill="none" stroke="#e3c585" stroke-width="1.4"/>
        <circle cx="70" cy="102" r="24" fill="none" stroke="#c8a35a" stroke-dasharray="3 3" stroke-width="1"/>
        <polygon points="70,62 79,93 110,102 79,111 70,142 61,111 30,102 61,93" fill="#c8a35a" fill-opacity="0.22" stroke="#e3c585" stroke-width="1.2"/>
        <circle cx="70" cy="102" r="7" fill="#e3c585"/>`;
    } else if (suit === "C") {
      motif = `
        <path d="M46 76 H94 C94 104 82 116 70 118 C58 116 46 104 46 76 Z" fill="#c8a35a" fill-opacity="0.2" stroke="#e3c585" stroke-width="1.5"/>
        <line x1="70" y1="118" x2="70" y2="142" stroke="#e3c585" stroke-width="2"/>
        <path d="M52 142 H88" stroke="#e3c585" stroke-width="2"/>
        <circle cx="70" cy="64" r="6" fill="none" stroke="#c8a35a" stroke-width="1.1"/>`;
    } else if (suit === "S") {
      motif = `
        <line x1="70" y1="56" x2="70" y2="148" stroke="#e3c585" stroke-width="2.2"/>
        <path d="M50 122 Q70 114 90 122" fill="none" stroke="#e3c585" stroke-width="2"/>
        <polygon points="70,50 65,64 75,64" fill="#e3c585"/>
        <circle cx="70" cy="150" r="4" fill="#c8a35a"/>`;
    } else if (suit === "W") {
      motif = `
        <line x1="56" y1="146" x2="84" y2="58" stroke="#e3c585" stroke-width="2.6"/>
        <path d="M84 68 C94 64 96 74 86 76" fill="none" stroke="#7ed1a4" stroke-width="1.5"/>
        <path d="M66 112 C54 108 54 118 64 120" fill="none" stroke="#7ed1a4" stroke-width="1.5"/>
        <circle cx="84" cy="58" r="5" fill="#e3c585"/>`;
    } else {
      motif = `
        <circle cx="70" cy="102" r="32" fill="#c8a35a" fill-opacity="0.16" stroke="#e3c585" stroke-width="1.5"/>
        <polygon points="70,73 78,94 100,94 82,107 89,128 70,115 51,128 58,107 40,94 62,94" fill="none" stroke="#e3c585" stroke-width="1.3"/>`;
    }

    return `
      <svg viewBox="0 0 140 230" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(card.name_zh)}${esc(card.orientation)}">
        <rect x="2" y="2" width="136" height="226" rx="10" fill="#14110c" stroke="#c8a35a" stroke-width="1.8"/>
        <rect x="9" y="9" width="122" height="212" rx="6" fill="none" stroke="#c8a35a" stroke-opacity="0.38" stroke-width="1"/>
        <text x="70" y="27" text-anchor="middle" fill="#c8a35a" font-size="10" font-family="JetBrains Mono, monospace">${esc(cid)} · ${esc(card.element || "星")}</text>
        <g ${rot}>${motif}</g>
        <rect x="16" y="182" width="108" height="30" rx="4" fill="#1f1a13" stroke="#c8a35a" stroke-opacity="0.5" stroke-width="0.9"/>
        <text x="70" y="201" text-anchor="middle" fill="#f3efe6" font-size="12.5" font-weight="700" font-family="Noto Serif TC, serif">${esc(card.name_zh)}</text>
      </svg>`;
  }

  function badgeClassFromText(txt) {
    if (txt.includes("暫緩") || txt.includes("阻力")) return "warn";
    if (txt.includes("條件") || txt.includes("先磨") || txt.includes("相當")) return "caution";
    return "good";
  }

  /* ==================== 大廳一：塔羅互動與渲染 ==================== */
  function renderTarotResult(data) {
    const box = document.getElementById("tarotResultContainer");
    const bCls = badgeClassFromText(data.verdict_badge);

    const cardsHtml = data.drawn_cards
      .map(
        (c) => `
        <article class="tarot-Explain-card">
          <div class="pos-kicker">位置 ${c.position_index} · ${esc(c.position_title)}</div>
          <div class="tarot-svg-wrap">
            <div class="tarot-svg-inner">${renderTarotFaceSVG(c)}</div>
          </div>
          <div class="card-title-line">
            <h3>《${esc(c.name_zh)}》</h3>
            <span class="ori-tag">${esc(c.orientation)}</span>
          </div>
          <div class="sharp-quote">${esc(c.sharp_one_liner)}</div>
          <p class="plain-body">${esc(c.plain_explanation)}</p>
        </article>`
      )
      .join("");

    const actionsHtml = data.three_actions.map((a) => `<li>${esc(a)}</li>`).join("");

    box.innerHTML = `
      <div class="verdict-hero-card">
        <div class="verdict-top-meta">
          <span class="status-pill ${bCls}">${esc(data.verdict_badge)}</span>
          <span class="spread-caption">導師：${esc(data.mentor.name)} ｜ 自動配陣：${esc(data.spread.name)}</span>
        </div>
        <h2>照你問的，一句話直球結論</h2>
        <p class="verdict-direct-text">${esc(data.direct_verdict)}</p>
      </div>

      <div class="drawn-cards-grid">${cardsHtml}</div>

      <div class="action-box">
        <h3>關鍵時間點與觀察信號</h3>
        <p class="plain-body">${esc(data.timing_window)}</p>
      </div>

      <div class="action-box">
        <h3>你接下來最該做的三件事</h3>
        <ol class="action-list">${actionsHtml}</ol>
        <p class="compliance-note">${esc(data.compliance_footer)}</p>
      </div>
    `;
  }

  function scrollResultOnMobile(containerId) {
    if (window.innerWidth <= 980) {
      const el = document.getElementById(containerId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      }
    }
  }

  async function executeTarotReading(pickedIndices = null) {
    const q = document.getElementById("tarotQuestionInput").value.trim();
    const spreadId = document.getElementById("tarotSpreadSelect").value;
    const box = document.getElementById("tarotResultContainer");
    box.innerHTML = `<div class="ritual-empty-state"><h2>正在洗牌對焦你的問題並拆解底牌...</h2></div>`;

    const res = await apiPost("/api/tarot", {
      question: q,
      mentor_id: state.tarotMentor,
      spread_id: spreadId,
      selected_indices: pickedIndices,
    });
    if (res.ok) {
      document.getElementById("tarotFanStage").classList.add("hidden");
      renderTarotResult(res.data);
      scrollResultOnMobile("tarotResultContainer");
    }
  }

  function openManualFan() {
    const spreadSel = document.getElementById("tarotSpreadSelect").value;
    const q = document.getElementById("tarotQuestionInput").value;
    let needed = 3;
    if (spreadSel === "single_verdict") needed = 1;
    else if (spreadSel === "love_mirror_4") needed = 4;
    else if (spreadSel === "two_choice_5") needed = 5;
    else if (spreadSel === "auto") {
      if (q.includes("還是") || q.includes("哪個")) needed = 5;
      else if (/(喜歡|愛|心裡|復合|冷戰|感情)/.test(q)) needed = 4;
      else needed = 3;
    }

    state.fanTargetCount = needed;
    state.fanPickedIndices = [];
    const stage = document.getElementById("tarotFanStage");
    const row = document.getElementById("tarotFanCards");
    const counter = document.getElementById("fanCounterBadge");
    document.getElementById("fanPromptText").textContent = `請默念問題，憑直覺點選 ${needed} 張牌卡翻開解答`;
    counter.textContent = `已選 0 / ${needed} 張`;
    stage.classList.remove("hidden");

    row.innerHTML = "";
    for (let i = 0; i < 15; i++) {
      const deg = (i - 7) * 2.4;
      const yOff = Math.abs(i - 7) * 2.2;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "fan-card-slot";
      btn.setAttribute("aria-label", `抽取第 ${i + 1} 張秘境牌卡`);
      btn.style.transform = `rotate(${deg}deg) translateY(${yOff}px)`;
      btn.innerHTML = renderTarotBackSVG();
      btn.addEventListener("click", () => {
        if (state.fanPickedIndices.length >= state.fanTargetCount) return;
        btn.classList.add("picked");
        state.fanPickedIndices.push(i * 5 + 1);
        counter.textContent = `已選 ${state.fanPickedIndices.length} / ${state.fanTargetCount} 張`;
        if (state.fanPickedIndices.length === state.fanTargetCount) {
          setTimeout(() => executeTarotReading(state.fanPickedIndices), 260);
        }
      });
      row.appendChild(btn);
    }
  }

  /* ==================== 大廳二：太極易經六爻與梅花易數 ==================== */
  function renderHexLines(lines, isChanged) {
    return lines
      .map((l) => {
        let yy = l.yin_yang;
        if (isChanged && l.is_moving) {
          yy = yy === "陽" ? "陰" : "陽";
        }
        const cls = `${yy === "陽" ? "yang" : "yin"} ${!isChanged && l.is_moving ? "moving" : ""}`;
        const bars = yy === "陽" ? `<span></span>` : `<span></span><span></span>`;
        const tag = !isChanged
          ? `${l.line_label} ${l.six_kin}${l.shi_ying ? "・" + l.shi_ying : ""}`
          : `${l.line_label} ${l.is_moving ? l.changed_to.split("(")[0] : l.najia}`;
        return `
          <div class="hex-line-row">
            <span class="mono-num" style="width:92px">${esc(tag)}</span>
            <div class="hex-bar-visual ${cls}">${bars}</div>
            <span style="width:52px;text-align:right;color:var(--text-muted)">${!isChanged && l.is_moving ? "動爻" : esc(l.six_spirit)}</span>
          </div>`;
      })
      .join("");
  }

  function renderYijingResult(data) {
    const box = document.getElementById("yijingResultContainer");
    const bCls = badgeClassFromText(data.verdict_badge);
    const movHtml = data.moving_plain_notes.map((m) => `<li>${esc(m)}</li>`).join("");
    const actHtml = data.three_actions.map((a) => `<li>${esc(a)}</li>`).join("");

    const proRows = data.lines_bottom_to_top
      .slice()
      .reverse()
      .map(
        (l) =>
          `<tr>
            <td>${esc(l.line_label)}</td>
            <td>${esc(l.six_spirit)}</td>
            <td>${esc(l.six_kin)}${l.shi_ying ? `（${esc(l.shi_ying)}）` : ""}</td>
            <td>${esc(l.najia)}（${esc(l.element)}）</td>
            <td>${esc(l.throw_label)}</td>
            <td>${esc(l.status_plain)}</td>
          </tr>`
      )
      .join("");

    box.innerHTML = `
      <div class="verdict-hero-card">
        <div class="verdict-top-meta">
          <span class="status-pill ${bCls}">${esc(data.verdict_badge)}</span>
          <span class="spread-caption">宗師：${esc(data.mentor.name)} ｜ ${esc(data.method_label)} ｜ ${esc(data.casting_pillars.month_gz)}月 ${esc(data.casting_pillars.day_gz)}日</span>
        </div>
        <h2>照你問的，一句話直球結論</h2>
        <p class="verdict-direct-text">${esc(data.direct_verdict)}</p>
      </div>

      <div class="hexagram-compare-grid">
        <div class="hex-box">
          <div class="pos-kicker">當下局勢本卦・${esc(data.ben_hexagram.palace)}</div>
          <h3 style="margin:4px 0;font-family:var(--font-serif)">《${esc(data.ben_hexagram.name)}》（${esc(data.ben_hexagram.rating)}）</h3>
          <p class="plain-body">${esc(data.ben_hexagram.plain_meaning)}</p>
          <div class="hex-lines-stack">${renderHexLines(data.lines_bottom_to_top, false)}</div>
        </div>
        <div class="hex-box">
          <div class="pos-kicker">最終演變結局卦・${esc(data.bian_hexagram.palace)}</div>
          <h3 style="margin:4px 0;font-family:var(--font-serif)">《${esc(data.bian_hexagram.name)}》（${esc(data.bian_hexagram.rating)}）</h3>
          <p class="plain-body">${esc(data.bian_hexagram.plain_meaning)}</p>
          <div class="hex-lines-stack">${renderHexLines(data.lines_bottom_to_top, true)}</div>
        </div>
      </div>

      <div class="action-box">
        <h3>為什麼這樣判（白話拆解轉折關鍵）</h3>
        <ul class="action-list">${movHtml}</ul>
      </div>

      <div class="action-box">
        <h3>應期時間點與三步具體對策</h3>
        <p class="plain-body" style="margin-bottom:10px">${esc(data.timing_window)}</p>
        <ol class="action-list">${actHtml}</ol>
        <details class="advanced-drawer" style="margin-top:14px">
          <summary>展開京房納甲六爻專業細盤（世應・六親・六神・旺衰）</summary>
          <div class="drawer-body" style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:0.8rem;text-align:left">
              <thead>
                <tr style="border-bottom:1px solid var(--gold-line);color:var(--gold-solid)">
                  <th>爻位</th><th>六神</th><th>六親世應</th><th>納甲五行</th><th>陰陽動靜</th><th>月日旺衰</th>
                </tr>
              </thead>
              <tbody>${proRows}</tbody>
            </table>
          </div>
        </details>
        <p class="compliance-note">${esc(data.compliance_footer)}</p>
      </div>
    `;
  }

  async function submitYijing(throwsArr = null, numsArr = null) {
    const q = document.getElementById("yijingQuestionInput").value.trim();
    const box = document.getElementById("yijingResultContainer");
    box.innerHTML = `<div class="ritual-empty-state"><h2>正在排定納甲世應與月建日辰...</h2></div>`;

    const res = await apiPost("/api/yijing", {
      question: q,
      method: state.yijingMethod,
      mentor_id: state.yijingMentor,
      coin_throws: throwsArr,
      numbers: numsArr,
    });
    if (res.ok) {
      state.coinThrows = [];
      document.getElementById("throwOnceBtn").textContent = "逐爻親擲（第 1 爻）";
      document.getElementById("coinThrowsProgress").textContent = "已完成六擲起卦（可隨時重新逐爻親擲）";
      renderYijingResult(res.data);
      scrollResultOnMobile("yijingResultContainer");
    }
  }

  /* ==================== 大廳三：八術姓名學全體系 ==================== */
  function setNamingScenario(mode) {
    state.namingMode = mode;
    document.querySelectorAll(".scenario-card").forEach((c) => {
      c.classList.toggle("active", c.dataset.nmode === mode);
    });

    const isPersonal = mode === "baby" || mode === "adult_rename";
    document.getElementById("personalNamingFields").classList.toggle("hidden", !isPersonal);
    document.getElementById("companyNamingFields").classList.toggle("hidden", isPersonal);
    document.getElementById("babyParentsWrap").classList.toggle("hidden", mode !== "baby");
    document.getElementById("adultCurrentNameWrap").classList.toggle("hidden", mode !== "adult_rename");

    const heading = document.getElementById("namingFormHeading");
    if (mode === "baby") {
      heading.textContent = "新生兒嬰兒取名設定（含父母生肖防沖檢核）";
      document.getElementById("nmYear").value = "2026";
      document.getElementById("nmMonth").value = "8";
      document.getElementById("nmDay").value = "15";
    } else if (mode === "adult_rename") {
      heading.textContent = "成人改名與現名病灶診斷（先拆病灶再給新名）";
      document.getElementById("nmYear").value = "1990";
      document.getElementById("nmMonth").value = "2";
      document.getElementById("nmDay").value = "10";
    } else if (mode === "company_brand") {
      heading.textContent = "公司行號・店面品牌八術命名設定";
      document.getElementById("nmYear").value = "1991";
      document.getElementById("nmMonth").value = "11";
      document.getElementById("nmDay").value = "20";
    } else {
      heading.textContent = "集團控股與組織會盟「外正內霸」雙棲命名設定";
      document.getElementById("nmIndustry").value = "集團控股與特殊組織會盟";
      document.getElementById("nmYear").value = "1992";
      document.getElementById("nmMonth").value = "10";
      document.getElementById("nmDay").value = "12";
      document.getElementById("nmHour").value = "8";
      document.getElementById("nmMinute").value = "0";
    }
  }

  function renderBaziMiniStrip(bazi) {
    const pCells = bazi.pillars
      .map(
        (p) => `
        <div class="pillar-cell">
          <div class="p-label">${esc(p.pillar)}（${esc(p.stem_ten_god)}）</div>
          <div class="p-gz">${esc(p.ganzhi)}</div>
          <div class="p-sub">${esc(p.stem_wx)}${esc(p.branch_wx)}・${esc(p.nayin)}</div>
        </div>`
      )
      .join("");

    return `
      <div class="bazi-summary-strip">
        <div class="verdict-top-meta">
          <span class="status-pill good">雙曆零誤差核驗通過・屬${esc(bazi.zodiac_animal)}</span>
          <span class="spread-caption">真太陽時：${esc(bazi.input.true_solar_time)}（${esc(bazi.input.city)}）</span>
        </div>
        <div class="pillars-4-grid">${pCells}</div>
        <p class="plain-body">
          <strong>命局白話定錨：</strong>${esc(bazi.strength_plain)}
          <br/><strong>八術鎖定主補喜用五行：</strong><span style="color:var(--gold-solid);font-weight:700">${esc(bazi.recommended_primary_wx.join("、"))}</span>
          ｜ <strong>嚴格避開忌神五行：</strong>${esc(bazi.recommended_avoid_wx.join("、"))}
          ｜ <strong>《窮通寶鑑》調候提要：</strong>${esc(bazi.qiongtong_card.tiyao || "依四柱扶抑平衡取用")}
        </p>
      </div>`;
  }

  function renderPersonalNamingResult(data) {
    const box = document.getElementById("namingResultContainer");
    let diagBlock = "";
    if (data.current_name_diagnosis) {
      const d = data.current_name_diagnosis;
      const items = d.plain_diagnosis.map((x) => `<li>${esc(x)}</li>`).join("");
      diagBlock = `
        <div class="verdict-hero-card">
          <div class="verdict-top-meta">
            <span class="status-pill ${d.valid ? "good" : "warn"}">現名「${esc(d.name)}」八術體檢：${d.total_score} 分</span>
            <span class="spread-caption">康熙筆畫：${esc(d.strokes_breakdown)} ｜ 三才：${esc(d.five_grids.三才.combo)}（${esc(d.five_grids.三才.rating)}）</span>
          </div>
          <h2>現用姓名病灶白話診斷</h2>
          <ul class="action-list">${items}</ul>
        </div>`;
    }

    const renderCard = (item, rankLabel, isTop) => {
      const g = item.five_grids;
      const hx = item.hexagram;
      const charMeanings = item.chars
        .filter((c) => c.role === "名字")
        .map((c) => `『${esc(c.char)}』（${c.kangxi_strokes}畫屬${esc(c.wuxing)}）：${esc(c.meaning)}`)
        .join("<br/>");
      return `
        <article class="name-master-card ${isTop ? "top-rank" : ""}">
          <div class="nm-head">
            <div>
              <div class="pos-kicker">${esc(rankLabel)}</div>
              <div class="nm-title">${esc(item.name)}</div>
            </div>
            <span class="nm-score">${item.total_score} 分</span>
          </div>
          <div class="nm-meta-tags">
            <span class="mini-badge">康熙 ${esc(item.strokes_breakdown)} 畫</span>
            <span class="mini-badge">補 ${esc(item.wuxing_combo)}</span>
            <span class="mini-badge">三才 ${esc(g.三才.combo)}（${esc(g.三才.rating)}）</span>
            <span class="mini-badge">本卦《${esc(hx.ben_gua.name)}》→《${esc(hx.bian_gua.name)}》</span>
          </div>
          <p class="plain-body">${charMeanings}</p>
          <div class="sharp-quote">人格 ${g.人格.strokes}（${esc(g.人格.rating)}）・地格 ${g.地格.strokes}（${esc(g.地格.rating)}）・總格 ${g.總格.strokes}（${esc(g.總格.rating)}）</div>
        </article>`;
    };

    const topHtml = data.top5_primary.map((x, i) => renderCard(x, `八術共同認可首選 TOP ${i + 1}`, true)).join("");
    const bakHtml = data.top5_backup.map((x, i) => renderCard(x, `高分零否決備選 #${i + 1}`, false)).join("");

    const sopHtml = data.practical_activation_sop
      ? `<div class="action-box"><h3>台灣戶政改名與九十天開運啟用標準流程</h3><ol class="action-list">${data.practical_activation_sop.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>`
      : "";

    box.innerHTML = `
      ${renderBaziMiniStrip(data.bazi_profile)}
      ${diagBlock}
      <div class="action-box" style="margin-bottom:18px">
        <h3>八術零否決全庫窮舉結果（測試 ${data.total_tested} 組・全過八關 ${data.total_passed_all_8_schools} 組）</h3>
        <p class="plain-body">父母生肖防沖狀態：父親（${esc(data.parents_zodiac_checked.father)}）｜母親（${esc(data.parents_zodiac_checked.mother)}）</p>
      </div>
      <h3 style="font-family:var(--font-serif);margin:0 0 12px">前五名八術共同認可首選方案</h3>
      <div class="name-cards-grid">${topHtml}</div>
      <h3 style="font-family:var(--font-serif);margin:0 0 12px">五組高分不撞字備選方案</h3>
      <div class="name-cards-grid">${bakHtml}</div>
      ${sopHtml}
      <p class="compliance-note">以上命名與命理分析是提醒與建議，不是定論。</p>
    `;
  }

  function renderCompanyNamingResult(data) {
    const box = document.getElementById("namingResultContainer");
    let diagHtml = "";
    if (data.existing_brand_diagnosis) {
      const d = data.existing_brand_diagnosis;
      diagHtml = `
        <div class="verdict-hero-card">
          <div class="verdict-top-meta">
            <span class="status-pill ${d.valid ? "good" : "warn"}">現有商號「${esc(d.name)}」體檢：${d.total_score} 分</span>
            <span class="spread-caption">核心筆畫 ${esc(d.strokes_breakdown)} 畫（${esc(d.core_81.rating)}）</span>
          </div>
          <h2>現有商號八術吉凶直斷</h2>
          <ul class="action-list">${d.plain_diagnosis.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        </div>`;
    }

    const renderCorpCard = (item, rankLabel, isTop) => {
      const corps = item.auspicious_corp_matches
        .slice(0, 2)
        .map((m) => `${m.full_name}（${m.total_strokes}畫大吉）`)
        .join("、");
      const orgs = item.auspicious_org_matches
        .slice(0, 2)
        .map((m) => `${m.full_name}（${m.total_strokes}畫大吉）`)
        .join("、");
      const meanings = item.chars.map((c) => `『${esc(c.char)}』（${c.kangxi_strokes}畫${esc(c.wuxing)}）：${esc(c.meaning)}`).join("<br/>");
      return `
        <article class="name-master-card ${isTop ? "top-rank" : ""}">
          <div class="nm-head">
            <div>
              <div class="pos-kicker">${esc(rankLabel)}</div>
              <div class="nm-title">${esc(item.name)}</div>
            </div>
            <span class="nm-score">${item.total_score} 分</span>
          </div>
          <div class="nm-meta-tags">
            <span class="mini-badge">核心 ${esc(item.strokes_breakdown)} 畫大吉</span>
            <span class="mini-badge">五行 ${esc(item.wuxing_combo)}</span>
            <span class="mini-badge">本卦《${esc(item.hexagram.ben_gua.name)}》→《${esc(item.hexagram.bian_gua.name)}》</span>
            <span class="mini-badge">英文碼 ${esc(item.digital_english.recommended_abbr)}</span>
          </div>
          <p class="plain-body">${meanings}</p>
          <div class="sharp-quote">
            法定全銜雙吉：${esc(corps)}
            ${orgs ? `<br/>組織會盟雙吉：${esc(orgs)}` : ""}
          </div>
        </article>`;
    };

    const topHtml = data.top5_primary.map((x, i) => renderCorpCard(x, `八術共同認可首選 TOP ${i + 1}`, true)).join("");
    const bakHtml = data.top5_backup.map((x, i) => renderCorpCard(x, `高分零撞字備選 #${i + 1}`, false)).join("");

    box.innerHTML = `
      ${renderBaziMiniStrip(data.founder_bazi)}
      ${diagHtml}
      <div class="action-box" style="margin-bottom:18px">
        <h3>產業與負責人合參結果（${esc(data.industry.name)}・主補 ${esc(data.merged_primary_wx.join("＋"))}）</h3>
        <p class="plain-body">全字庫交叉窮舉 ${data.total_tested} 組雙字商號，嚴格通過八關零否決共 ${data.total_passed_all_8_schools} 組，以下為零撞字最優前十強。</p>
      </div>
      <h3 style="font-family:var(--font-serif);margin:0 0 12px">前五名八術共同認可首選字號</h3>
      <div class="name-cards-grid">${topHtml}</div>
      <h3 style="font-family:var(--font-serif);margin:0 0 12px">五組高分備選字號</h3>
      <div class="name-cards-grid">${bakHtml}</div>
      <p class="compliance-note">以上企業與組織命名建議是提醒與建議，不是定論。</p>
    `;
  }

  async function runNaming() {
    const box = document.getElementById("namingResultContainer");
    box.innerHTML = `<div class="ritual-empty-state"><h2>正在排算零誤差四柱並執行八術窮舉驗算...</h2></div>`;

    const commonDates = {
      year: Number(document.getElementById("nmYear").value),
      month: Number(document.getElementById("nmMonth").value),
      day: Number(document.getElementById("nmDay").value),
      hour: Number(document.getElementById("nmHour").value),
      minute: Number(document.getElementById("nmMinute").value),
      city: document.getElementById("nmCity").value,
    };

    if (state.namingMode === "baby" || state.namingMode === "adult_rename") {
      const res = await apiPost("/api/naming/personal", {
        ...commonDates,
        mode: state.namingMode,
        surname: document.getElementById("nmSurname").value,
        gender: document.getElementById("nmGender").value,
        current_full_name: state.namingMode === "adult_rename" ? document.getElementById("nmCurrentName").value : "",
        father_year: state.namingMode === "baby" ? document.getElementById("nmFatherYear").value : null,
        mother_year: state.namingMode === "baby" ? document.getElementById("nmMotherYear").value : null,
        fixed_char: state.namingMode === "baby" ? document.getElementById("nmFixedChar").value : "",
        fixed_pos: Number(document.getElementById("nmFixedPos").value),
      });
      if (res.ok) {
        renderPersonalNamingResult(res.data);
        scrollResultOnMobile("namingResultContainer");
      }
    } else {
      const res = await apiPost("/api/naming/company", {
        ...commonDates,
        industry: document.getElementById("nmIndustry").value,
        preferred_suffix: document.getElementById("nmSuffix").value,
        gender: document.getElementById("nmFounderGender").value,
        grey_mode: state.namingMode === "grey_corp_org",
        existing_brand: document.getElementById("nmExistingBrand").value,
      });
      if (res.ok) {
        renderCompanyNamingResult(res.data);
        scrollResultOnMobile("namingResultContainer");
      }
    }
  }

  /* ==================== 大廳四：四柱零誤差排盤與十二角色 SOP 鏈 ==================== */
  async function runBaziSop(isPreload = false) {
    const box = document.getElementById("baziSopResultContainer");
    box.innerHTML = `<div class="ritual-empty-state"><h2>正在執行 Swiss Ephemeris 視太陽黃經核驗與十二角色存檔鏈檢查...</h2></div>`;

    const res = await apiPost("/api/bazi-sop", {
      year: Number(document.getElementById("bzYear").value),
      month: Number(document.getElementById("bzMonth").value),
      day: Number(document.getElementById("bzDay").value),
      hour: Number(document.getElementById("bzHour").value),
      minute: Number(document.getElementById("bzMinute").value),
      gender: document.getElementById("bzGender").value,
      city: document.getElementById("bzCity").value,
      target_book_line: document.getElementById("bzBookLine").value,
      core_question: document.getElementById("bzQuestion").value,
      skip_journal: Boolean(isPreload),
    });
    if (!res.ok) return;
    const d = res.data;
    const bz = d.client_bazi;

    const auditRows = bz.zero_error_audit_checks
      .map((a) => `<li><strong>[${esc(a.status)}] ${esc(a.check)}：</strong>${esc(a.detail)}</li>`)
      .join("");

    const dayunTags = bz.dayun_8_steps
      .map((dy) => `<span class="mini-badge">${dy.start_age}歲 ${esc(dy.ganzhi)}（${esc(dy.stem_ten_god)}）</span>`)
      .join("");

    const cpRows = d.checkpoint_chain
      .map(
        (c) => `
        <div class="sop-step-row">
          <div class="cp-code">${esc(c.checkpoint)} · ${esc(c.role_id)}</div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:2px">
              <span class="win-pill">${esc(c.window || "標準產線")}</span>
              <strong>${esc(c.title)}</strong>
            </div>
            <div style="font-size:0.78rem;color:var(--text-muted)">存檔：${esc(c.file_out)} ｜ 承接上一步指紋：<code>${esc(c.prev_sha256)}</code></div>
          </div>
          <span class="hash-pill">SHA ${esc(c.current_sha256.slice(0, 10))}</span>
        </div>`
      )
      .join("");

    const tw = d.two_window_isolation || null;
    const twHtml = tw
      ? `
      <div class="action-box">
        <h3>雙窗物理隔離審核規範（寫命書視窗 A ↔ 獨立審核新視窗 B）</h3>
        <p class="plain-body" style="margin-bottom:8px"><strong>核心隔離鐵律：</strong>${esc(tw.principle)}</p>
        <p class="plain-body" style="margin-bottom:8px"><strong>第五節根本做法（單一真值鎖）：</strong>${esc(tw.fundamental_rule)}</p>
        <div class="nm-meta-tags" style="margin-top:8px">
          ${(tw.three_verdicts || []).map((v) => `<span class="mini-badge">${esc(v)}</span>`).join("")}
        </div>
      </div>`
      : "";

    const rules17 = d.rules_17_checklist || [];
    const rulesHtml = rules17.length
      ? `
      <div class="action-box">
        <h3>《命書審核清單・給老師版 v1》全 17 條責任歸屬與退件分級總表（零跳過逐條檢查）</h3>
        <p class="plain-body">大問題（第 0、1、2、3、4、6、7、8、13、14、15 條）只要有一條有問題即退回重寫並一次列完；小問題（第 5、9、10、11、12、16 條）逐筆記錄修正。</p>
        <div class="rules-17-grid">
          ${rules17
            .map(
              (r) => `
            <div class="rule-17-card">
              <div class="rule-17-top">
                <strong style="font-family:var(--font-serif)">${esc(r.rule_no)}・${esc(r.title)}</strong>
                <span class="status-pill ${r.severity === "大問題" ? "warn" : "caution"}">${esc(r.severity)}</span>
              </div>
              <div class="pos-kicker">責任追責角色：${esc(r.owner_roles)}</div>
              <p class="plain-body" style="font-size:0.84rem">${esc(r.summary)}</p>
            </div>`
            )
            .join("")}
        </div>
      </div>`
      : "";

    box.innerHTML = `
      ${renderBaziMiniStrip(bz)}
      <div class="action-box">
        <h3>五重天文曆法零誤差核驗清單（台灣時間 UTC+8・防止排錯年柱月柱與早晚子時）</h3>
        <ul class="action-list">${auditRows}</ul>
        <div style="margin-top:12px">
          <div class="pos-kicker">${esc(bz.dayun_summary)}</div>
          <div class="nm-meta-tags" style="margin-top:6px">${dayunTags}</div>
        </div>
      </div>

      <div class="verdict-hero-card">
        <div class="verdict-top-meta">
          <span class="status-pill good">獨立審核視窗 B・全 17 條通過放行</span>
          <span class="spread-caption">轉譯目標：${esc(d.target_book_line)}</span>
        </div>
        <h2>總裁秘書與雙窗獨立審核簽核報告</h2>
        <p class="plain-body"><strong>獨立 17 條審核官（R10）：</strong>${esc(d.supervisor_summary.qa_director)}</p>
        <p class="plain-body"><strong>督促修正總主管（R11）：</strong>${esc(d.supervisor_summary.remediation_director)}</p>
        <p class="verdict-direct-text" style="margin-top:8px"><strong>總裁執行秘書呈報（R12）：</strong>${esc(d.supervisor_summary.executive_secretary)}</p>
      </div>

      ${twHtml}
      ${rulesHtml}

      <div class="action-box">
        <h3>全公司十二職能 × 雙窗隔離步步存檔防斷鏈追蹤表（CP01–CP11）</h3>
        <div class="sop-chain-list">${cpRows}</div>
        <p class="compliance-note">以上命理排盤與系統分析是提醒與建議，不是定論。</p>
      </div>
    `;
    if (!isPreload) scrollResultOnMobile("baziSopResultContainer");
  }

  /* ==================== 大廳五：問事與命名紀錄簿 ==================== */
  async function loadJournal() {
    const box = document.getElementById("journalListContainer");
    const res = await apiGet("/api/journal");
    if (!res.ok || !res.items.length) {
      box.innerHTML = `<div class="ritual-empty-state"><h2>尚無封存紀錄</h2><p>完成任一占卜或命名後，系統將自動為你留存完整結論。</p></div>`;
      return;
    }
    box.innerHTML = res.items
      .map(
        (it) => `
        <article class="journal-item">
          <div class="verdict-top-meta">
            <span class="status-pill good">${esc(it.category)}</span>
            <span class="spread-caption">${esc(it.created_at)}</span>
          </div>
          <h3 style="margin:0 0 6px;font-family:var(--font-serif)">${esc(it.title)}</h3>
          <p class="plain-body">${esc(it.verdict)}</p>
        </article>`
      )
      .join("");
  }

  /* ==================== 初始化與事件綁定 ==================== */
  async function bootstrap() {
    initCelestialCanvas();

    updateTrialCountdownUI(null);

    // 載入伺服器選單設定與七日免碼試用時鐘
    try {
      const meta = await apiGet("/api/meta");
      if (meta.ok) {
        if (meta.trial_policy) {
          updateTrialCountdownUI(meta.trial_policy);
        }
        state.mentors = meta.mentors;
        const cityOpts = meta.cities
          .map((c) => `<option value="${esc(c)}" ${c.includes("台灣通用") ? "selected" : ""}>${esc(c)}</option>`)
          .join("");
        document.getElementById("nmCity").innerHTML = cityOpts;
        document.getElementById("bzCity").innerHTML = meta.cities
          .map((c) => `<option value="${esc(c)}" ${c.includes("雲林") ? "selected" : ""}>${esc(c)}</option>`)
          .join("");

        document.getElementById("nmIndustry").innerHTML = meta.industries
          .map((ind) => `<option value="${esc(ind.name)}">${esc(ind.name)}（主屬${esc(ind.industry_wx)}）</option>`)
          .join("");

        document.getElementById("nmSuffix").innerHTML = meta.company_suffixes
          .map((s) => `<option value="${esc(s.suffix)}" ${s.suffix === "有限公司" ? "selected" : ""}>${esc(s.suffix)}（+${s.strokes}畫）</option>`)
          .join("");
      }
    } catch (_) {}

    // 頂部背景意境切換
    document.querySelectorAll(".bg-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.bgMode;
        state.bgMode = mode;
        document.querySelectorAll(".bg-pill").forEach((b) => b.classList.toggle("active", b === btn));
        if (mode === "xuan-paper") {
          document.documentElement.setAttribute("data-theme", "light");
          document.documentElement.setAttribute("data-bg", "xuan-paper");
        } else {
          document.documentElement.setAttribute("data-theme", "dark");
          document.documentElement.setAttribute("data-bg", mode);
        }
      });
    });

    // 五大廳切換
    document.querySelectorAll(".hall-tab").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    // 塔羅導師切換
    document.querySelectorAll("#tarotMentorRow .mentor-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.tarotMentor = chip.dataset.mentor;
        document.querySelectorAll("#tarotMentorRow .mentor-chip").forEach((c) => c.classList.toggle("active", c === chip));
        updateMentorBanner(state.tarotMentor);
      });
    });

    // 易經導師切換
    document.querySelectorAll("#yijingMentorRow .mentor-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.yijingMentor = chip.dataset.mentor;
        document.querySelectorAll("#yijingMentorRow .mentor-chip").forEach((c) => c.classList.toggle("active", c === chip));
        updateMentorBanner(state.yijingMentor);
      });
    });

    // 範例問題膠囊
    document.querySelectorAll(".prompt-pill:not(.yj-pill)").forEach((p) => {
      p.addEventListener("click", () => {
        document.getElementById("tarotQuestionInput").value = p.dataset.q;
      });
    });
    document.querySelectorAll(".yj-pill").forEach((p) => {
      p.addEventListener("click", () => {
        document.getElementById("yijingQuestionInput").value = p.dataset.q;
      });
    });

    // 塔羅抽牌按鈕
    document.getElementById("tarotShuffleDrawBtn").addEventListener("click", () => executeTarotReading(null));
    document.getElementById("tarotManualFanBtn").addEventListener("click", openManualFan);

    // 易經起卦模式切換
    document.querySelectorAll("#yijingMethodTabs .seg-btn").forEach((b) => {
      b.addEventListener("click", () => {
        state.yijingMethod = b.dataset.method;
        document.querySelectorAll("#yijingMethodTabs .seg-btn").forEach((x) => x.classList.toggle("active", x === b));
        document.getElementById("coinThrowBox").classList.toggle("hidden", state.yijingMethod !== "liuyao_coins");
        document.getElementById("meihuaNumBox").classList.toggle("hidden", state.yijingMethod !== "meihua_numbers");
      });
    });

    // 親手逐爻擲銅錢
    document.getElementById("throwOnceBtn").addEventListener("click", () => {
      const coins = document.querySelectorAll("#threeCoinsVisual .bronze-coin");
      const faces = [0, 1, 2].map(() => (Math.random() < 0.5 ? 3 : 2));
      coins.forEach((el, idx) => {
        el.classList.remove("spinning");
        void el.offsetWidth;
        el.classList.add("spinning");
        el.querySelector("span").textContent = faces[idx] === 3 ? "乾隆通寶" : "滿文雲紋";
      });
      const sum = faces[0] + faces[1] + faces[2];
      state.coinThrows.push(sum);
      const step = state.coinThrows.length;
      const names = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
      const vMap = { 6: "老陰×", 7: "少陽⚊", 8: "少陰⚋", 9: "老陽○" };
      document.getElementById("coinThrowsProgress").textContent =
        "已擲：" + state.coinThrows.map((v, i) => `${names[i]}(${vMap[v]})`).join(" → ");
      if (step < 6) {
        document.getElementById("throwOnceBtn").textContent = `逐爻親擲（第 ${step + 1} 爻）`;
      } else {
        submitYijing(state.coinThrows, null);
      }
    });

    document.getElementById("castAllCoinsBtn").addEventListener("click", () => submitYijing(null, null));
    document.getElementById("castMeihuaBtn").addEventListener("click", () => {
      const n1 = Number(document.getElementById("mhNum1").value) || 38;
      const n2 = Number(document.getElementById("mhNum2").value) || 62;
      const n3 = Number(document.getElementById("mhNum3").value) || 15;
      submitYijing(null, [n1, n2, n3]);
    });

    // 姓名學四場景切換與執行
    document.querySelectorAll(".scenario-card").forEach((c) => {
      c.addEventListener("click", () => setNamingScenario(c.dataset.nmode));
    });
    document.getElementById("runNamingBtn").addEventListener("click", runNaming);

    // 四柱與 SOP 執行
    document.getElementById("runBaziSopBtn").addEventListener("click", () => runBaziSop(false));
    document.getElementById("refreshJournalBtn").addEventListener("click", loadJournal);

    // 七日免驗證碼試用與手機一鍵分享視窗
    const modal = document.getElementById("gateModal");
    const closeM = () => modal.classList.add("hidden");
    document.getElementById("openGateBtn").addEventListener("click", () => {
      populateShareModal();
      const toast = document.getElementById("shareFeedbackMsg");
      if (toast) toast.classList.add("hidden");
      modal.classList.remove("hidden");
    });
    document.getElementById("closeGateBtn").addEventListener("click", closeM);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeM();
    });
    document.getElementById("copyTrialLinkBtn").addEventListener("click", copyInviteToClipboard);
    document.getElementById("nativeShareTrialBtn").addEventListener("click", async () => {
      const shareUrl = getCleanShareUrl();
      const shareData = {
        title: "玄樞閣｜七日免驗證碼手機試用版",
        text: "不用驗證碼、手機點開即可直接試用（效期一週至 2026-11-30 23:59）：秘境塔羅直斷、太極易經六爻、八術姓名學與雙窗17條SOP",
        url: shareUrl,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          showShareFeedback("已開啟系統原生分享選單。");
          return;
        } catch (err) {
          if (err && err.name === "AbortError") return;
        }
      }
      await copyInviteToClipboard();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeM();
    });

    // 預先載入大廳四之示範核驗結果（不重複寫入紀錄簿），切換過去即刻可見完整排盤與SOP鏈
    runBaziSop(true);
  }

  document.addEventListener("DOMContentLoaded", bootstrap);
})();
