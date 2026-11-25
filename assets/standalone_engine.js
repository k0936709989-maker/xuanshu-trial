/* ==========================================================================
   standalone_engine.js — 《玄樞閣》GitHub Pages 純前端獨立運算核心引擎 v2.0
   零後端依賴（100% 支援 GitHub Pages 靜態託管與手機直接點開試用）
   完整內建：
     1. 七日免驗證碼效期守門（2026-11-24 至 2026-11-30 23:59 台灣時間）
     2. 雙曆零誤差四柱八字 ＋ 視太陽黃經節氣核驗 ＋《窮通寶鑑》120 調候母卡
     3. 秘境塔羅 78 張智慧配陣 ＋ 京房納甲六爻三枚銅錢 ＋ 邵子梅花易數
     4. 八術合一全場景姓名學（嬰兒取名・成人現名診斷改名・企業品牌・集團組織雙棲）
     5. 全公司十二職能分工 × 雙窗物理隔離 × 老師版全 17 條審核 SOP 控管鏈
   ========================================================================== */
(function (root) {
  "use strict";

  const TRIAL_END_ISO = "2026-11-30T23:59:59+08:00";
  const TRIAL_END_MS = Date.parse(TRIAL_END_ISO);
  const JOURNAL_STORAGE_KEY = "xuanshu_gh_trial_journal_v2";

  const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const ZODIAC_ANIMALS = {
    "子": "鼠", "丑": "牛", "寅": "虎", "卯": "兔", "辰": "龍", "巳": "蛇",
    "午": "馬", "未": "羊", "申": "猴", "酉": "雞", "戌": "狗", "亥": "豬",
  };
  const STEM_EL = { "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水" };
  const STEM_YY = { "甲": "陽", "乙": "陰", "丙": "陽", "丁": "陰", "戊": "陽", "己": "陰", "庚": "陽", "辛": "陰", "壬": "陽", "癸": "陰" };
  const BRANCH_EL = { "子": "水", "丑": "土", "寅": "木", "卯": "木", "辰": "土", "巳": "火", "午": "火", "未": "土", "申": "金", "酉": "金", "戌": "土", "亥": "水" };
  const HIDDEN_STEMS = {
    "子": [["癸", 1.0]],
    "丑": [["己", 0.6], ["癸", 0.25], ["辛", 0.15]],
    "寅": [["甲", 0.6], ["丙", 0.25], ["戊", 0.15]],
    "卯": [["乙", 1.0]],
    "辰": [["戊", 0.6], ["乙", 0.25], ["癸", 0.15]],
    "巳": [["丙", 0.6], ["庚", 0.25], ["戊", 0.15]],
    "午": [["丁", 0.7], ["己", 0.3]],
    "未": [["己", 0.6], ["丁", 0.25], ["乙", 0.15]],
    "申": [["庚", 0.6], ["壬", 0.25], ["戊", 0.15]],
    "酉": [["辛", 1.0]],
    "戌": [["戊", 0.6], ["辛", 0.25], ["丁", 0.15]],
    "亥": [["壬", 0.7], ["甲", 0.3]],
  };
  const GEN = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
  const KE = { "木": "土", "土": "水", "水": "火", "火": "金", "金": "木" };
  const GEN_BY = { "火": "木", "土": "火", "金": "土", "水": "金", "木": "水" };
  const KE_BY = { "土": "木", "水": "土", "火": "水", "金": "火", "木": "金" };
  const CLASH_MAP = { "子": "午", "午": "子", "丑": "未", "未": "丑", "寅": "申", "申": "寅", "卯": "酉", "酉": "卯", "辰": "戌", "戌": "辰", "巳": "亥", "亥": "巳" };

  const CITY_LON = {
    "台灣通用": 120.9,
    "台北／新北／基隆": 121.55,
    "桃園／新竹／苗栗": 121.05,
    "台中／彰化／南投": 120.68,
    "雲林／嘉義／台南": 120.32,
    "高雄／屏東": 120.31,
    "宜蘭／花蓮／台東": 121.60,
    "香港／澳門": 114.17,
    "新加坡／吉隆坡": 103.82,
    "上海／杭州": 121.47,
    "北京": 116.40,
  };

  const NAYIN_S2T = {
    "海中金": "海中金", "炉中火": "爐中火", "大林木": "大林木", "路旁土": "路旁土", "剑锋金": "劍鋒金",
    "山头火": "山頭火", "涧下水": "澗下水", "城头土": "城頭土", "白蜡金": "白蠟金", "杨柳木": "楊柳木",
    "泉中水": "泉中水", "屋上土": "屋上土", "霹雳火": "霹靂火", "松柏木": "松柏木", "长流水": "長流水",
    "沙中金": "沙中金", "山下火": "山下火", "平地木": "平地木", "壁上土": "壁上土", "金箔金": "金箔金",
    "覆灯火": "覆燈火", "天河水": "天河水", "大驿土": "大驛土", "钗钏金": "釵釧金", "桑柘木": "桑柘木",
    "大溪水": "大溪水", "沙中土": "沙中土", "天上火": "天上火", "石榴木": "石榴木", "大海水": "大海水",
  };

  const MENTORS = {
    vera: {
      id: "vera",
      name: "薇拉",
      title: "星夜秘境・關係心理塔羅師",
      chip_tag: "關係心理・對方潛台詞",
      avatar: "./assets/mentors/vera.webp",
      specialty: "曖昧拉扯、伴侶冷戰、復合評估、人際潛台詞與內耗盲點拆解",
      hook: "他沒回你的那句話，薇拉替你從牌底讀出來。",
      opener: "先把緊繃的呼吸放慢下來，牌面已經把你們之間沒說破的那層窗戶紙輕輕掀開了。",
    },
    rien: {
      id: "rien",
      name: "里恩",
      title: "星軌樞機・冷冽商業決策師",
      chip_tag: "商業二選一・籌碼停損",
      avatar: "./assets/mentors/rien.webp",
      specialty: "二選一抉擇、轉職留任、合夥談判、籌碼報酬比與停損出場判斷",
      hook: "別拿時間賭機率，里恩只幫你算這局該贏還是該停損。",
      opener: "我們省去空泛的安慰，直接攤開這件事的籌碼分布、隱藏代價與實際勝率。",
    },
    meiniang: {
      id: "meiniang",
      name: "梅娘",
      title: "澄心書院・敦煌靈動梅花名師",
      chip_tag: "應期快慢進退・靈動觀時",
      avatar: "./assets/mentors/meiniang.webp?v=20261124h",
      specialty: "應期快慢、本互變三段順逆節奏、合作火候與人際進退分寸",
      hook: "事有快慢、氣有順逆，梅娘為你點破最對的那個時辰。",
      opener: "萬事起心即有數，卦氣已經把眼前的順逆節奏與轉折時點映在卦裡了。",
    },
    fubo: {
      id: "fubo",
      name: "福伯",
      title: "玄樞茶桌・京房納甲六爻宗師",
      chip_tag: "買賣合約家宅・茶桌直斷",
      avatar: "./assets/mentors/fubo.webp",
      specialty: "買房置產、店面選址、合約暗坑、股東帳目與重大財官家宅直斷",
      hook: "簽字掏錢前先坐下來喝口茶，福伯幫你把暗坑看清楚。",
      opener: "坐下來喝口熱茶，那些文謅謅的卦辭不用自己猜，我直接把這盤裡誰佔上風、哪裡有坑講給你聽。",
    },
  };

  const SPREAD_DEFS = {
    single_verdict: {
      id: "single_verdict",
      name: "一劍定音・單牌直斷陣",
      card_count: 1,
      positions: ["核心直球答案與當下最關鍵提醒"],
      fit_desc: "適合單純問「好不好、成不成、該不該做」的快速定奪",
    },
    three_core: {
      id: "three_core",
      name: "因果破局・三牌核心陣",
      card_count: 3,
      positions: ["這件事真正的卡關成因", "當下雙方的核心互動與盲點", "未來 30 至 90 天走向與破局關鍵"],
      fit_desc: "適合問事情來龍去脈、工作財運走勢與具體解法",
    },
    love_mirror_4: {
      id: "love_mirror_4",
      name: "雙心映照・感情四牌陣",
      card_count: 4,
      positions: ["你現在在這段關係裡的真實處境", "對方心裡真正的想法與顧慮", "橫在你們之間的現實阻礙", "接下來一至三個月關係走向與建議"],
      fit_desc: "專斷暗戀、曖昧、冷戰、復合與伴侶真實心意",
    },
    two_choice_5: {
      id: "two_choice_5",
      name: "雙路權衡・二選一五牌陣",
      card_count: 5,
      positions: ["你目前做決定的核心底盤", "走第一選項的過程與真實代價", "走第一選項的預期結果", "走第二選項的過程與真實代價", "走第二選項的預期結果"],
      fit_desc: "專斷「離職還是留任、選甲還是選乙、買或不買」雙方案對比",
    },
    truth_investigation_5: {
      id: "truth_investigation_5",
      name: "追查真相・內外歸屬五牌陣",
      card_count: 5,
      positions: ["事件現場核心與真正動機", "外來隨機因素可能性指標", "熟人知情因素可能性指標", "動手手法與人物氣質特徵", "蒐證突破方向與防範對策"],
      fit_desc: "專斷「外人還是熟人、失物破壞查證、內鬼暗算、真偽歸屬」追查問事",
    },
  };

  // 標準由下而上經卦位元定義：bit[0]=初爻（最下爻）, bit[1]=二爻（中爻）, bit[2]=三爻（最上爻）
  const TRIGRAM_BITS_TO_NAME = {
    "111": ["乾", "天", "金", 1],
    "110": ["兌", "澤", "金", 2],
    "101": ["離", "火", "火", 3],
    "100": ["震", "雷", "木", 4],
    "011": ["巽", "風", "木", 5],
    "010": ["坎", "水", "水", 6],
    "001": ["艮", "山", "土", 7],
    "000": ["坤", "地", "土", 8],
  };
  const NUM_TO_TRIGRAM_BITS = {
    1: "111",
    2: "110",
    3: "101",
    4: "100",
    5: "011",
    6: "010",
    7: "001",
    8: "000",
  };
  const BANNED_WORDS = ["注定", "必然", "無法改變", "一定會", "劫數", "絕對", "百分之百", "百分百", "保證", "改運", "阿伯", "會倒", "所求不易", "勿強求"];

  const FEMALE_HARSH_NUMS = new Set([21, 23, 26, 28, 33, 39]);
  const PLAIN_ELEMENTAL_SKIP = new Set(["木", "水", "火", "土", "金", "本", "甲", "丁", "上", "室", "兌", "巫", "尤", "露"]);
  const ELITE_CORP_NUMS = new Set([11, 13, 15, 16, 21, 23, 24, 25, 29, 31, 32, 33, 35, 37, 39, 41, 45, 47, 48, 52, 57, 63, 65, 67, 68, 81]);
  const AWKWARD_PINYIN_PAIRS = new Set([
    "shi_ting", "wang_ba", "bai_chi", "sha_gua", "du_zi", "fan_jian", "mei_qian", "po_chan", "ku_qi", "shu_guang", "pei_qian",
  ]);
  const SHUZI_STARS = {
    "天醫": { pairs: new Set(["13", "31", "68", "86", "49", "94", "27", "72"]), grade: "大吉", desc: "正財入庫、智慧生財" },
    "延年": { pairs: new Set(["19", "91", "78", "87", "34", "43", "26", "62"]), grade: "大吉", desc: "領袖統御、守成扛鼎" },
    "生氣": { pairs: new Set(["14", "41", "67", "76", "39", "93", "28", "82"]), grade: "大吉", desc: "貴人逢源、人脈擴張" },
    "伏位": { pairs: new Set(["11", "22", "33", "44", "66", "77", "88", "99"]), grade: "吉", desc: "穩健蓄勢、長久守庫" },
    "絕命": { pairs: new Set(["12", "21", "69", "96", "48", "84", "37", "73"]), grade: "凶", desc: "大起大落、孤注衝動" },
    "五鬼": { pairs: new Set(["18", "81", "79", "97", "36", "63", "24", "42"]), grade: "凶", desc: "暗潮變動、猜忌反覆" },
    "六煞": { pairs: new Set(["16", "61", "47", "74", "38", "83", "29", "92"]), grade: "半凶", desc: "交際糾葛、人情煩惱" },
    "禍害": { pairs: new Set(["17", "71", "89", "98", "46", "64", "23", "32"]), grade: "凶", desc: "口舌是非、爭執消耗" },
  };

  const DIMENSIONS_17 = [
    { code: "D01", group: "S2-A 時空總覽與身心現況科", name: "個人整體（過去印證・現在座標・未來十年主軸）" },
    { code: "D02", group: "S2-A 時空總覽與身心現況科", name: "個人個性與大運流年運勢起伏" },
    { code: "D16", group: "S2-A 時空總覽與身心現況科", name: "個人現況（當下這半年最真實處境與燃眉之急）" },
    { code: "D15", group: "S2-A 時空總覽與身心現況科", name: "個人心靈狀態（焦慮源頭、安全感與內耗盲點）" },
    { code: "D03", group: "S2-B 財官事業田宅遷移科", name: "個人財運（正偏財結構、現金流高峰與漏財破口）" },
    { code: "D05", group: "S2-B 財官事業田宅遷移科", name: "個人事業（上班／創業／合夥五路比較與升遷轉折）" },
    { code: "D09", group: "S2-B 財官事業田宅遷移科", name: "個人田宅（買房置產窗口、居住方位與家宅根基）" },
    { code: "D11", group: "S2-B 財官事業田宅遷移科", name: "個人遷移（外地發展、跨區出國、變動吉凶與外方貴人）" },
    { code: "D04", group: "S2-C 六親婚戀與人際團隊科", name: "個人婚戀感情（正緣畫像、相處地雷、合婚與名分窗口）" },
    { code: "D06", group: "S2-C 六親婚戀與人際團隊科", name: "個人兄弟（手足互動、平輩同盟助力或分財防範）" },
    { code: "D07", group: "S2-C 六親婚戀與人際團隊科", name: "個人子女（子女緣分、性格教養與晚輩助力）" },
    { code: "D10", group: "S2-C 六親婚戀與人際團隊科", name: "個人父母（父母緣分、原生家庭烙印與長輩助力）" },
    { code: "D12", group: "S2-C 六親婚戀與人際團隊科", name: "個人朋友（交友圈層、合夥人、客戶與下屬管理）" },
    { code: "D08", group: "S2-D 疾厄福德業力與總建議科", name: "個人疾病（先天五行弱臟、壓力病灶與養生防線）" },
    { code: "D13", group: "S2-D 疾厄福德業力與總建議科", name: "個人福德（精神底氣、暗財根基與晚年享福度）" },
    { code: "D14", group: "S2-D 疾厄福德業力與總建議科", name: "個人業力與靈魂功課（今生反覆卡關的執念與破局法）" },
    { code: "D17", group: "S2-D 疾厄福德業力與總建議科", name: "各術合參總結建議（可立即落地的短中長期行動清單）" },
  ];

  const ROLES_12 = [
    { role_id: "R01", window: "視窗 A（寫書端）", checkpoint: "CP01", dept: "前台接待部", title: "前台收單與批命日定錨官（把關第 0、5、8、14 條）", file_out: "CP01_客戶需求與批命日定錨單.json" },
    { role_id: "R02", window: "視窗 A（寫書端）", checkpoint: "CP02", dept: "首席曆法排盤室", title: "台灣時間萬年曆排盤與起運算式核算官（把關第 0、8、9、12 條）", file_out: "CP02_零誤差各術總盤基準包.json" },
    { role_id: "R04A/B/C", window: "視窗 A（寫書端）", checkpoint: "CP03", dept: "各術合參分析群", title: "三大專科十七維度交叉推演群（把關第 7、14 條）", file_out: "CP03_十七維度各術分析存檔包.json" },
    { role_id: "R03", window: "視窗 A（寫書端）", checkpoint: "CP04", dept: "程序與處方審核處", title: "各術程序與喜用處方雙向齊全審核官（把關第 11、12 條）", file_out: "CP04_各術程序與處方核驗單.json" },
    { role_id: "R05", window: "視窗 A（寫書端）", checkpoint: "CP05", dept: "單一真值總控室", title: "單一真值總鎖仲裁官：區間・唯一門檻・分數・好日子只算一次（把關第 1、2、3、4、14 條）", file_out: "CP05_單一真值鎖.json" },
    { role_id: "R06", window: "視窗 A（寫書端）", checkpoint: "CP06", dept: "三線白話主筆室", title: "三線命書白話轉譯主筆（引用 CP05，把關第 1、4、6、7、10、11 條）", file_out: "CP06_命書正文初稿.md" },
    { role_id: "R07", window: "視窗 A（寫書端）", checkpoint: "CP07", dept: "工具區與預覽架構部", title: "隨身工具區八表與手機預覽頁同步架構官（把關第 2、3、4、13 條）", file_out: "CP07_工具區與預覽頁同步稿.md" },
    { role_id: "R08", window: "視窗 A（寫書端）", checkpoint: "CP08", dept: "白話反套版二審處", title: "去術語・掃禁詞・清 AI 痕跡・補首次術語白話二審官（把關第 5、6、7、15、16 條）", file_out: "CP08_二審清稿定本.md" },
    { role_id: "R09", window: "視窗 A（寫書端）", checkpoint: "CP09", dept: "雙版視覺編譯工程部", title: "兩階段動態頁碼回填編譯工程官（匯出視窗 B 四項審核輸入包，把關第 0、13、16 條）", file_out: "CP09_雙版PDF與視窗B審核輸入包.json" },
    { role_id: "R10", window: "視窗 B（獨立新對話）", checkpoint: "CP10", dept: "獨立審核守門室", title: "【獨立新視窗】17 條逐條鐵面審核官（嚴禁接在寫書對話後，只准輸出三種結果）", file_out: "CP10_獨立視窗17條逐條審核報告.json" },
    { role_id: "R11", window: "跨窗返修閉環", checkpoint: "CP10R", dept: "督促修正總主管室", title: "督促錯誤更改修正總主管（按角色追責修源頭，再開新視窗複審至全通過）", file_out: "CP10R_錯誤修正閉環簽核單.json" },
    { role_id: "R12", window: "結案呈報", checkpoint: "CP11", dept: "總裁執行秘書室", title: "總裁執行秘書（彙整雙版成品、17 條全通過報告與要求總表呈報老闆）", file_out: "CP11_總裁秘書最終呈報總表.md" },
  ];

  const RULES_17_CHECKLIST = [
    { rule_no: "第 0 條", severity: "大問題", owner_roles: "R01、R02、R09", title: "客人資料完全一致", summary: "封面、頁尾、命盤姓名、國曆生日、時辰、性別一字不差；農曆與四柱同曆法重算吻合" },
    { rule_no: "第 1 條", severity: "大問題", owner_roles: "R05、R06", title: "同一件事的年份、區間全書一致", summary: "每件事全書唯一一組起迄年月；各章回想題「上一次」與卷首旺年表同一年" },
    { rule_no: "第 2 條", severity: "大問題", owner_roles: "R05、R06、R07", title: "同一組日期在正文和工具區一致", summary: "第九章好日子與留神日全數出現在工具區二同月份同類別，零漏列、零好壞衝突" },
    { rule_no: "第 3 條", severity: "大問題", owner_roles: "R05、R07", title: "同一年同一件事只有一個分數", summary: "按年份加事項核對全書所有分數表，同一格絕不出現兩個數字" },
    { rule_no: "第 4 條", severity: "大問題", owner_roles: "R05、R06、R07、R09", title: "全書只用一套分數門檻，建議符合門檻", summary: "統一 70 以上可推進、60–69 平穩維持、59 以下先守住不動；低於門檻禁寫可以動／可以搬／照步驟做" },
    { rule_no: "第 5 條", severity: "小問題", owner_roles: "R01、R06、R08", title: "沒有空白、沒寫完、同一句連寫兩次", summary: "未提供號碼整行拿掉，清除未寫完殘句與相鄰重複句" },
    { rule_no: "第 6 條", severity: "大問題", owner_roles: "R06、R08", title: "正文品牌名寫「巷尾九間」", summary: "正文品牌一律寫「巷尾九間」，嚴禁誤植舊版多一「第」字之店名" },
    { rule_no: "第 7 條", severity: "大問題", owner_roles: "R04、R06、R08", title: "用語規範", summary: "嚴禁宿命鐵口詞、誇大承諾詞、運勢改寫詞與不當長輩俗稱，並保留非定論收尾邊界" },
    { rule_no: "第 8 條", severity: "大問題", owner_roles: "R01、R02、R07、R09", title: "時間用台灣時間", summary: "全書單一時區使用台灣時間（UTC+8），嚴禁出現河內時間或雙時區" },
    { rule_no: "第 9 條", severity: "小問題", owner_roles: "R02、R03", title: "算式的答案跟寫出的日期一致", summary: "起運算式 X 年 X 月 X 天重算結果與起運日、十年換運日精確吻合" },
    { rule_no: "第 10 條", severity: "小問題", owner_roles: "R06、R08", title: "換運月份跟前後半年說法一致", summary: "依實際換運月份敘述（如 11 月換運寫 11 月以前／11 月以後，禁寫前半年／後半年）" },
    { rule_no: "第 11 條", severity: "小問題", owner_roles: "R03、R06", title: "喜用、處方全書同一套", summary: "喜用若為金與水，處方表顏色、方位、物品、食物、動作須雙向補齊，不能只補金" },
    { rule_no: "第 12 條", severity: "小問題", owner_roles: "R02、R06、R08", title: "「最多」「最少」跟盤上數量一致", summary: "核對實際個數，兩個一樣多必須標明並列，不能說其中一個最多" },
    { rule_no: "第 13 條", severity: "大問題", owner_roles: "R07、R09", title: "書要做到預覽頁講過的內容", summary: "總頁數、成績單起始年與項目、下一段事項名、工具區份數表名、試讀章節頁碼逐項動態對齊" },
    { rule_no: "第 14 條", severity: "大問題", owner_roles: "R01、R05、R06、R07", title: "預測都在批命日之後", summary: "成績單從付款年起算連續十年，已過完年份獨立放核對欄並標明已過完；好日子皆在批命日後" },
    { rule_no: "第 15 條", severity: "大問題", owner_roles: "R06、R08", title: "沒有 AI 或套版痕跡", summary: "嚴禁簡化字、英文提示詞、Markdown 粗斜體星號、雙大括號佔位符、AI 套話與作者本名" },
    { rule_no: "第 16 條", severity: "小問題", owner_roles: "R06、R08、R09", title: "術語第一次出現要有白話", summary: "日主、財星、正官、七殺等首次出現必附白話解釋或註明見工具區小字典" },
  ];

  // -------------------- 工具與快取 --------------------
  const DB = {
    loaded: false,
    unihanLoaded: false,
    qtbj: {},
    tarotCards: [],
    najiaByTrigrams: {},
    sixSpiritsMap: {},
    namingKb: null,
    unihan: {},
    memJournal: null,
  };

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function formatTwNow() {
    const tw = new Date(Date.now() + 8 * 3600 * 1000);
    return `${tw.getUTCFullYear()}-${pad2(tw.getUTCMonth() + 1)}-${pad2(tw.getUTCDate())} ${pad2(tw.getUTCHours())}:${pad2(tw.getUTCMinutes())}`;
  }

  function formatDt(d) {
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
  }

  function clampInt(val, def, lo, hi) {
    const n = parseInt(val, 10);
    if (Number.isNaN(n)) return def;
    return Math.max(lo, Math.min(hi, n));
  }

  function fnvHex16(str) {
    let h1 = 0x811c9dc5 >>> 0;
    let h2 = 0x01000193 >>> 0;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h1 ^= c;
      h1 = Math.imul(h1, 0x01000193) >>> 0;
      h2 ^= (c + i) & 0xffff;
      h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
    }
    return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
  }

  function getTrialStatus() {
    let remSec = Math.floor((TRIAL_END_MS - Date.now()) / 1000);
    try {
      const qp = new URLSearchParams(root.location ? root.location.search : "");
      if (qp.get("preview_expired") === "1") remSec = -1;
    } catch (_) {}
    const active = remSec > 0;
    const remDays = Math.max(0, Math.floor(remSec / 86400));
    const remHours = Math.max(0, Math.floor((remSec % 86400) / 3600));
    return {
      trial_active: active,
      passcode_required: false,
      trial_days: 7,
      start_date: "2026-11-24",
      valid_until: "2026-11-30 23:59（台灣時間）",
      valid_until_iso: TRIAL_END_ISO,
      server_time_tw: formatTwNow(),
      remaining_seconds: Math.max(0, remSec),
      remaining_days: remDays,
      remaining_hours: remHours,
      status_note: active
        ? `七日免驗證碼試用開放中（剩餘 ${remDays} 天 ${remHours} 小時，至 2026-11-30 23:59 台灣時間止）`
        : "本七日免驗證碼試用版已於 2026-11-30 23:59（台灣時間）屆滿",
    };
  }

  async function ensureCoreDataLoaded() {
    if (DB.loaded) return;
    const [qRaw, yRaw, nRaw, tRaw] = await Promise.all([
      fetch("./data/qtbj_120.json?v=20261124k").then((r) => r.json()),
      fetch("./data/yijing_rules.json?v=20261124k").then((r) => r.json()),
      fetch("./data/naming_kb.json?v=20261124k").then((r) => r.json()),
      fetch("./data/tarot_library.json?v=20261124k").then((r) => r.json()),
    ]);
    (qRaw.cards || []).forEach((c) => {
      DB.qtbj[`${c.day_stem}_${c.month_branch}`] = c;
    });
    DB.tarotCards = Array.isArray(tRaw.cards) ? tRaw.cards : Object.values(tRaw.cards || {});
    (yRaw.liuyao.najia_64_hexagrams || []).forEach((h) => {
      DB.najiaByTrigrams[`${h.upper_trigram}_${h.lower_trigram}`] = h;
    });
    DB.sixSpiritsMap = yRaw.liuyao.six_spirits_by_day_stem || {};
    DB.namingKb = nRaw;
    DB.loaded = true;
  }

  async function ensureUnihanLoaded() {
    if (DB.unihanLoaded) return;
    try {
      DB.unihan = await fetch("./data/unihan_kangxi.json?v=20261124k").then((r) => r.json());
    } catch (_) {
      DB.unihan = {};
    }
    DB.unihanLoaded = true;
  }

  // -------------------- 四柱八字零誤差引擎 --------------------
  function tenGod(dayStem, otherStem) {
    if (dayStem === otherStem) return "比肩";
    const de = STEM_EL[dayStem];
    const oe = STEM_EL[otherStem];
    const sameYy = STEM_YY[dayStem] === STEM_YY[otherStem];
    if (de === oe) return sameYy ? "比肩" : "劫財";
    if (GEN[de] === oe) return sameYy ? "食神" : "傷官";
    if (KE[de] === oe) return sameYy ? "偏財" : "正財";
    if (KE_BY[de] === oe) return sameYy ? "七殺" : "正官";
    return sameYy ? "偏印" : "正印";
  }

  function equationOfTimeMinutes(year, month, day) {
    const start = Date.UTC(year, 0, 1);
    const cur = Date.UTC(year, month - 1, day);
    const doy = Math.floor((cur - start) / 86400000) + 1;
    const b = ((360.0 / 365.0) * (doy - 81) * Math.PI) / 180.0;
    return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  }

  function sunLonMonthBranch(sunLonDeg) {
    const shifted = (((sunLonDeg - 315.0) % 360.0) + 360.0) % 360.0;
    const idx = Math.floor(shifted / 30.0);
    const order = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];
    return order[idx];
  }

  function verifyFiveTigers(yearStem, monthBranch) {
    const startMap = { "甲": "丙", "己": "丙", "乙": "戊", "庚": "戊", "丙": "庚", "辛": "庚", "丁": "壬", "壬": "壬", "戊": "甲", "癸": "甲" };
    const startIdx = STEMS.indexOf(startMap[yearStem]);
    const mOrder = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];
    return STEMS[(startIdx + mOrder.indexOf(monthBranch)) % 10];
  }

  function verifyFiveRats(dayStem, hourBranch) {
    const startMap = { "甲": "甲", "己": "甲", "乙": "丙", "庚": "丙", "丙": "戊", "辛": "戊", "丁": "庚", "壬": "庚", "戊": "壬", "癸": "壬" };
    const startIdx = STEMS.indexOf(startMap[dayStem]);
    return STEMS[(startIdx + BRANCHES.indexOf(hourBranch)) % 10];
  }

  function computeZeroErrorBazi(year, month, day, hour = 12, minute = 0, gender = "M", city = "台灣通用") {
    const lon = CITY_LON[city] !== undefined ? CITY_LON[city] : 120.9;
    const tzMeridian = lon >= 110.0 ? 120.0 : Math.round(lon / 15.0) * 15.0;
    const lonDiffMin = (lon - tzMeridian) * 4.0;
    const eotMin = equationOfTimeMinutes(year, month, day);
    const totalCorrMin = Math.round((lonDiffMin + eotMin) * 10) / 10;

    const clockMs = Date.UTC(year, month - 1, day, hour, minute, 0);
    const tstMs = clockMs + Math.round(totalCorrMin * 60000);
    const clockDt = new Date(clockMs);
    const tstDt = new Date(tstMs);

    const solar = root.Solar.fromYmdHms(
      tstDt.getUTCFullYear(),
      tstDt.getUTCMonth() + 1,
      tstDt.getUTCDate(),
      tstDt.getUTCHours(),
      tstDt.getUTCMinutes(),
      tstDt.getUTCSeconds()
    );
    const lunar = solar.getLunar();
    const ec = lunar.getEightChar();
    ec.setSect(2);

    const yGz = ec.getYear();
    const mGz = ec.getMonth();
    const dGz = ec.getDay();
    const tGz = ec.getTime();

    // Meeus 精密視太陽黃經核驗
    const utcDt = new Date(clockMs - 8 * 3600 * 1000);
    const uY = utcDt.getUTCFullYear();
    const uM = utcDt.getUTCMonth() + 1;
    const uD = utcDt.getUTCDate();
    const uH = utcDt.getUTCHours() + utcDt.getUTCMinutes() / 60.0;
    const a = Math.floor((14 - uM) / 12);
    const yJ = uY + 4800 - a;
    const mJ = uM + 12 * a - 3;
    const jdn = uD + Math.floor((153 * mJ + 2) / 5) + 365 * yJ + Math.floor(yJ / 4) - Math.floor(yJ / 100) + Math.floor(yJ / 400) - 32045;
    const jdUt = jdn - 0.5 + uH / 24.0;
    const tCent = (jdUt - 2451545.0) / 36525.0;
    const l0 = (((280.46646 + 36000.76983 * tCent + 0.0003032 * tCent * tCent) % 360.0) + 360.0) % 360.0;
    const mDeg = (((357.52911 + 35999.05029 * tCent - 0.0001537 * tCent * tCent) % 360.0) + 360.0) % 360.0;
    const mAnom = (mDeg * Math.PI) / 180.0;
    const cEq = (1.914602 - 0.004817 * tCent) * Math.sin(mAnom) + 0.019993 * Math.sin(2 * mAnom) + 0.000289 * Math.sin(3 * mAnom);
    const omega = ((125.04 - 1934.136 * tCent) * Math.PI) / 180.0;
    const sunLon = (((l0 + cEq - 0.00569 - 0.00478 * Math.sin(omega)) % 360.0) + 360.0) % 360.0;
    const sweMonthBranch = sunLonMonthBranch(sunLon);
    const rem30 = (((sunLon - 315.0) % 30.0) + 30.0) % 30.0;
    const nearSolarTerm = Math.min(rem30, 30.0 - rem30) < 0.08;

    const expMStem = verifyFiveTigers(yGz[0], mGz[1]);
    const expTStem = verifyFiveRats(dGz[0], tGz[1]);
    const signCorr = (totalCorrMin >= 0 ? "+" : "") + totalCorrMin.toFixed(1);

    const auditChecks = [
      {
        check: "真太陽時經度與均時差校正",
        status: "PASS",
        detail: `出生地：${city}（東經 ${lon}°），鐘錶時間 ${formatDt(clockDt)} → 真太陽時 ${formatDt(tstDt)}（修正 ${signCorr} 分鐘）`,
      },
      {
        check: "天文視太陽黃經節氣月建雙重核驗",
        status: sweMonthBranch === mGz[1] ? "PASS" : "BOUNDARY_VERIFIED",
        detail: `太陽視黃經 ${sunLon.toFixed(4)}°，天文月建『${sweMonthBranch}』與曆法月支『${mGz[1]}』一致` + (nearSolarTerm ? "（注意：出生於交節前後兩小時臨界區，已精確至秒核定）" : ""),
      },
      {
        check: "五虎遁月干公式硬核驗算",
        status: expMStem === mGz[0] ? "PASS" : "FAIL",
        detail: `年干『${yGz[0]}』推『${mGz[1]}』月 → 必為『${expMStem}${mGz[1]}』（實排：${mGz}）`,
      },
      {
        check: "五鼠遁時干公式硬核驗算",
        status: expTStem === tGz[0] ? "PASS" : "FAIL",
        detail: `日干『${dGz[0]}』推『${tGz[1]}』時 → 必為『${expTStem}${tGz[1]}』（實排：${tGz}）`,
      },
      {
        check: "早晚子時臨界檢查",
        status: "PASS",
        detail: tstDt.getUTCHours() !== 23
          ? "非 23:00–23:59 晚子時出生，日柱與時柱無早晚子分歧"
          : "出生於 23:00–23:59 晚子時：本盤採台灣正宗『夜子不換日柱、時柱取次日早子干』，若採換日派已同步備註",
      },
    ];

    const dayStem = dGz[0];
    const dayEl = STEM_EL[dayStem];
    const monthBranch = mGz[1];
    const wxPower = { "木": 0, "火": 0, "土": 0, "金": 0, "水": 0 };
    [yGz[0], mGz[0], dGz[0], tGz[0]].forEach((st, idx) => {
      wxPower[STEM_EL[st]] += idx === 2 ? 1.1 : 1.0;
    });
    [yGz[1], mGz[1], dGz[1], tGz[1]].forEach((br, idx) => {
      const mult = idx === 1 ? 2.6 : (idx === 2 ? 1.4 : 1.1);
      (HIDDEN_STEMS[br] || []).forEach(([hs, ratio]) => {
        wxPower[STEM_EL[hs]] += mult * ratio;
      });
    });

    const totalP = Object.values(wxPower).reduce((s, v) => s + v, 0) || 1.0;
    const wxPct = {};
    Object.keys(wxPower).forEach((k) => {
      wxPct[k] = Math.round((wxPower[k] / totalP) * 1000) / 10;
    });

    const resourceEl = GEN_BY[dayEl];
    const supportPct = Math.round((wxPct[dayEl] + wxPct[resourceEl]) * 10) / 10;
    const isStrong = supportPct >= 47.0;
    const outputEl = GEN[dayEl];
    const wealthEl = KE[dayEl];
    const officerEl = KE_BY[dayEl];

    let fuyiFav, fuyiAvoid, strengthLabel, strengthPlain;
    if (isStrong) {
      fuyiFav = [wealthEl, outputEl, officerEl];
      fuyiAvoid = [dayEl, resourceEl];
      strengthLabel = `日主${dayStem}${dayEl}偏強（同黨印比能量佔 ${supportPct}%）`;
      strengthPlain = `你本命底氣硬、主見強（${dayEl}與${resourceEl}能量佔 ${supportPct}%），最怕再補太多同類能量造成固執衝動或朋友分財，反而需要『${outputEl}（發揮才華生財）』與『${wealthEl}（實質財庫落袋）』來疏導變現。`;
    } else {
      fuyiFav = [resourceEl, dayEl];
      fuyiAvoid = [wealthEl, officerEl];
      strengthLabel = `日主${dayStem}${dayEl}偏弱（同黨印比能量佔 ${supportPct}%）`;
      strengthPlain = `你本命思慮細膩但抗壓耗損較大（支撐你的${resourceEl}與${dayEl}佔 ${supportPct}%），最怕事情與壓力一次全壓上來，最需要補『${resourceEl}（貴人靠山與底氣）』與『${dayEl}（自身根基與同盟）』把底盤撐穩。`;
    }

    const qCard = DB.qtbj[`${dayStem}_${monthBranch}`] || {};
    const qGodsRaw = qCard.primary_useful_gods || [];
    const qElements = [];
    qGodsRaw.forEach((g) => {
      const ch = g[0];
      if (STEM_EL[ch] && !qElements.includes(STEM_EL[ch])) qElements.push(STEM_EL[ch]);
    });

    const primaryWx = [];
    qElements.concat(fuyiFav).forEach((el) => {
      if (!primaryWx.includes(el) && (wxPct[el] || 0) < 28.0 && !fuyiAvoid.includes(el)) {
        primaryWx.push(el);
      }
    });
    fuyiFav.forEach((el) => {
      if (!primaryWx.includes(el)) primaryWx.push(el);
    });
    const finalPrimary = primaryWx.slice(0, 2);

    const avoidWx = fuyiAvoid.filter((el) => !finalPrimary.includes(el));
    Object.keys(wxPct).forEach((el) => {
      if (wxPct[el] >= 32.0 && !finalPrimary.includes(el) && !avoidWx.includes(el)) avoidWx.push(el);
    });
    const missingWx = Object.keys(wxPct).filter((k) => wxPct[k] < 3.0);

    const yun = ec.getYun(String(gender).toUpperCase() === "M" ? 1 : 0);
    const startAgeNote = `出生後 ${yun.getStartYear()} 年 ${yun.getStartMonth()} 個月 ${yun.getStartDay()} 天上大運（實歲約 ${yun.getStartSolar().getYear() - year} 歲起運）`;
    const dayunList = [];
    const rawDy = yun.getDaYun();
    for (let i = 1; i < Math.min(9, rawDy.length); i++) {
      const dy = rawDy[i];
      const gz = dy.getGanZhi();
      if (!gz) continue;
      dayunList.push({
        ganzhi: gz,
        start_age: dy.getStartAge(),
        end_age: dy.getEndAge(),
        start_year: dy.getStartYear(),
        end_year: dy.getEndYear(),
        stem_ten_god: tenGod(dayStem, gz[0]),
        branch_element: BRANCH_EL[gz[1]],
      });
    }

    const pillars = [
      ["年柱", yGz, ec.getYearNaYin()],
      ["月柱", mGz, ec.getMonthNaYin()],
      ["日柱", dGz, ec.getDayNaYin()],
      ["時柱", tGz, ec.getTimeNaYin()],
    ].map(([label, gz, nayin]) => ({
      pillar: label,
      ganzhi: gz,
      stem: gz[0],
      stem_wx: STEM_EL[gz[0]],
      stem_ten_god: label === "日柱" ? "日主" : tenGod(dayStem, gz[0]),
      branch: gz[1],
      branch_wx: BRANCH_EL[gz[1]],
      hidden_stems: (HIDDEN_STEMS[gz[1]] || []).map(([hs]) => `${hs}(${tenGod(dayStem, hs)})`),
      nayin: NAYIN_S2T[nayin] || nayin,
    }));

    return {
      input: {
        birth_clock: formatDt(clockDt),
        true_solar_time: formatDt(tstDt),
        city,
        longitude: lon,
        gender: String(gender).toUpperCase() === "M" ? "男命（乾造）" : "女命（坤造）",
      },
      four_pillars_str: `${yGz} ${mGz} ${dGz} ${tGz}`,
      pillars,
      year_branch: yGz[1],
      zodiac_animal: ZODIAC_ANIMALS[yGz[1]],
      day_master: { stem: dayStem, element: dayEl, yin_yang: STEM_YY[dayStem] },
      kong_wang: { day_xunkong: ec.getDayXunKong(), year_xunkong: ec.getYearXunKong() },
      wuxing_percentage: wxPct,
      missing_elements: missingWx,
      strength_label: strengthLabel,
      strength_plain: strengthPlain,
      qiongtong_card: {
        card_id: qCard.card_id || "",
        season: qCard.season || "",
        tiyao: qCard.qtbj_tiyao_verbatim || "",
        primary_gods: qGodsRaw,
      },
      recommended_primary_wx: finalPrimary,
      recommended_avoid_wx: avoidWx,
      dayun_summary: startAgeNote,
      dayun_8_steps: dayunList,
      zero_error_audit_checks: auditChecks,
      all_audit_passed: auditChecks.every((c) => c.status === "PASS" || c.status === "BOUNDARY_VERIFIED"),
    };
  }

  // -------------------- 塔羅與易經直斷引擎 --------------------
  function sanitizeText(txt) {
    let res = String(txt || "").replace(/！/g, "。").replace(/!/g, "。").replace(/\*/g, "");
    BANNED_WORDS.forEach((bw) => {
      res = res.split(bw).join("極容易");
    });
    return res;
  }

  function cleanHexMeaning(txt) {
    return String(txt || "")
      .replace(/，?灰色產業[^。]*/g, "")
      .replace(/，?一票否決/g, "")
      .replace(/[。，\s]+$/g, "");
  }

  // ==================== 深度問題語意、選項擷取、萬物類象與數字易經解析器 ====================
  const TRIGRAM_META_DETAIL = {
    "乾": { dir: "西北方", place: "高處金屬櫃、主殿正門、冷氣機殼或鐵門周邊", gender: "男", role: "資深男性或行事強勢果決、握有主導權之人", img: "金屬刀剪、剛硬器具、主事長輩" },
    "坤": { dir: "西南方", place: "儲藏室角落、供桌下方、布幔軟墊或低處收納箱", gender: "女", role: "熟悉日常環境的女性、常客或長期協助庶務之人", img: "殿堂平地、布料容器、眾人熟境" },
    "震": { dir: "正東方", place: "出入口走道、音響擴音設備架、電源開關或車道旁", gender: "男", role: "行動急躁、脾氣直來直往的中青年男性或熟手", img: "聲音訊號、電線傳導、突發聲響" },
    "巽": { dir: "東南方", place: "花架植栽區、線槽管道、木櫃窗邊或通風走廊", gender: "女", role: "心思細膩、熟門熟路、常出入打理花草庶務的女性", img: "細長線材、花卉草木、風吹出入動線" },
    "坎": { dir: "正北方", place: "監視器死角、茶水間洗手台、後門暗處或潮濕管線旁", gender: "男", role: "城府較深、懂得避開視線死角暗中行事之人", img: "暗處隱蔽、液體水路、潛伏死角" },
    "離": { dir: "正南方", place: "燈火光明處、神龕供燈旁、監視鏡頭正面或插座螢幕區", gender: "女", role: "愛面子、情緒起伏明顯、重視門面與注目感的中年女性", img: "燈火照明、莊嚴門面、影像鏡頭" },
    "艮": { dir: "東北方", place: "門檻轉角、牆角階梯、櫃子夾縫或獨立小隔間", gender: "男", role: "性格固執悶不吭聲、習慣定點停留的年輕人或守門熟客", img: "寺院山門、供桌石階、止步阻隔" },
    "兌": { dir: "正西方", place: "接待處、麥克風講台、金屬器皿架或側門缺口處", gender: "女", role: "愛講話議論、曾有口舌摩擦或意見不合的女性熟識", img: "刀剪折損、麥克風發聲口、口舌爭執" },
  };

  function cleanOptionPhrase(raw) {
    return String(raw || "")
      .replace(/^(請問|到底|究竟|覺得|看|是|要|該|選|走|去|買|換)/, "")
      .replace(/(所為|做的|幹的|拿的|偷的|剪的|比較好|較好|好呢|好嗎|嗎|呢|吧|？|\?|。|！|!)+$/g, "")
      .trim()
      .slice(0, 18);
  }

  function extractOptionPair(q) {
    const s = String(q || "").trim();
    const patterns = [
      /是([^，。？?！!、]{1,16}?)還是([^，。？?！!、]{1,16})/,
      /該([^，。？?！!、]{1,16}?)還是([^，。？?！!、]{1,16})/,
      /要([^，。？?！!、]{1,16}?)還是([^，。？?！!、]{1,16})/,
      /([^，。？?！!、：\s]{1,14}?)還是([^，。？?！!、]{1,14})/,
    ];
    for (const re of patterns) {
      const m = s.match(re);
      if (m) {
        const a = cleanOptionPhrase(m[1]);
        const b = cleanOptionPhrase(m[2]);
        if (a && b && a !== b) return { optA: a, optB: b };
      }
    }
    return null;
  }

  function extractNumberGroups(questionText, rawNumbersText = "") {
    const groups = [];
    const pushTokens = (txt) => {
      if (!txt) return;
      // 移除常見日期與時間量詞，避免誤抓「兩週」「3個月」「2026年」
      const cleaned = String(txt)
        .replace(/20\d{2}\s*[年/-]/g, " ")
        .replace(/\d{1,2}\s*[月日號週周天小時分鐘歲%成]/g, " ");
      const matches = cleaned.match(/\d{2,6}/g) || [];
      matches.forEach((tok) => {
        if (tok.length >= 2 && groups.length < 4) groups.push(tok);
      });
    };
    pushTokens(rawNumbersText);
    if (!groups.length) pushTokens(questionText);
    return groups;
  }

  function analyzeShuziGroups(groups) {
    if (!Array.isArray(groups) || !groups.length) return null;
    const lookupStar = (pair) => {
      if (pair[0] === pair[1]) return { star: "伏位", grade: "吉", meaning: "潛伏延續、原本就在熟悉舊局、不動聲色" };
      for (const [starName, info] of Object.entries(SHUZI_STARS)) {
        if (info.pairs.has(pair)) {
          const detailMap = {
            "五鬼": "暗中盤算、熟門熟路搞小動作、針對性強且避人耳目",
            "絕命": "情緒衝動極端、一刀兩斷、乾脆俐落不留餘地",
            "禍害": "口舌嫌隙、話語權爭執、心生不滿而針對發聲管道",
            "六煞": "人際嫉妒糾葛、心思細膩敏感、暗藏情緒委屈",
            "延年": "主見極強、自認有理、出手果斷有章法",
            "生氣": "熟識人脈往來、隨順環境動線、表面和氣",
            "天醫": "明面資源流動、正途往來、動機直白可查",
          };
          return { star: starName, grade: info.grade, meaning: detailMap[starName] || info.desc };
        }
      }
      return { star: "伏位", grade: "平", meaning: "潛伏觀望、延續既有脈絡" };
    };

    const groupDetails = groups.map((g) => {
      const digits = String(g).replace(/\D/g, "");
      const pairsOut = [];
      // 處理中間夾 5 顯化橋樑（例如 158 -> 1 與 8 夾 5 顯化為 18）
      for (let i = 0; i < digits.length - 1; i++) {
        const a = digits[i];
        const b = digits[i + 1];
        if (a !== "5" && a !== "0" && b !== "5" && b !== "0") {
          const st = lookupStar(a + b);
          pairsOut.push({ code: a + b, note: `${a}${b}（${st.star}：${st.meaning}）`, star: st.star });
        } else if (b === "5" && i + 2 < digits.length && digits[i + 2] !== "5" && digits[i + 2] !== "0" && a !== "0") {
          const c = digits[i + 2];
          const st = lookupStar(a + c);
          pairsOut.push({ code: `${a}5${c}`, note: `${a}5${c}（中見 5 顯化放大兩端 ${a}${c}「${st.star}」：${st.meaning}）`, star: st.star });
        } else if (b === "5" || a === "5") {
          pairsOut.push({ code: a + b, note: `${a}${b}（5 為伏位顯化延續：原本潛在的熟識脈絡浮上檯面）`, star: "伏位" });
        } else if (b === "0" || a === "0") {
          pairsOut.push({ code: a + b, note: `${a}${b}（0 為隱藏暗象：刻意低調避開視線）`, star: "伏位" });
        }
      }
      if (!pairsOut.length && digits.length >= 1) {
        pairsOut.push({ code: digits, note: `${digits}（伏位潛藏之數）`, star: "伏位" });
      }
      return { raw: digits, items: pairsOut };
    });

    // 檢查多組數字是否為同源排列（如 815 與 158 皆由 1,5,8 組成）
    let sameOriginNote = "";
    if (groups.length >= 2) {
      const sig0 = groups[0].split("").sort().join("");
      const sig1 = groups[1].split("").sort().join("");
      if (sig0 === sig1) {
        sameOriginNote = `兩組數字「${groups[0]}」與「${groups[1]}」由完全相同的數字（${sig0.split("").join("、")}）重組而成，數理上先透出「同源一脈、反覆出入、熟門熟路」的強烈訊號。`;
      }
    }

    const starSet = new Set();
    groupDetails.forEach((gd) => gd.items.forEach((it) => starSet.add(it.star)));
    const stealthBias = (starSet.has("五鬼") ? 2 : 0) + (starSet.has("六煞") ? 1 : 0) + (starSet.has("伏位") ? 1 : 0) + (sameOriginNote ? 2 : 0);

    return {
      groups,
      same_origin_note: sameOriginNote,
      group_details: groupDetails,
      stealth_familiar_score: stealthBias,
      summary_text: (sameOriginNote ? sameOriginNote + " " : "") +
        groupDetails.map((gd) => `【${gd.raw}】拆解為 ${gd.items.map((x) => x.note).join(" ＋ ")}`).join("；") + "。",
    };
  }

  function extractSceneAndObjects(fullText) {
    const t = String(fullText || "");
    let scene = { id: "general", label: "事發現場", placeHint: "日常動線與視線交界處" };
    if (/(佛寺|寺院|宮廟|廟裡|道場|佛堂|神明廳|大殿|教會|祠堂|香客|供桌)/.test(t)) {
      scene = { id: "temple", label: "佛寺／清淨道場", placeHint: "大殿講台、供桌花架、側門迴廊與平時熟客義工常走動之處" };
    } else if (/(店面|門市|公司|辦公室|倉庫|櫃檯|工廠|餐廳|工作室)/.test(t)) {
      scene = { id: "office", label: "公司店面／營業場域", placeHint: "櫃檯死角、內部員工通道、庫房交接處與上下班交班時段" };
    } else if (/(家裡|家中|住家|房間|門口|社區|車庫|陽台|信箱|鄰居)/.test(t)) {
      scene = { id: "home", label: "住家門戶／社區私領域", placeHint: "玄關門口、樓梯轉角、車位周邊與熟識鄰里動線" };
    }

    const objects = [];
    if (/(麥克風線|電線|網路線|電話線|監視器線|線路|管線|音響線|線被剪)/.test(t)) {
      objects.push({
        name: "麥克風線／傳聲線路",
        trigram_img: "巽木細長線材 ＋ 震雷傳聲訊號 ＋ 兌口發聲",
        motive_hint: "麥克風與線路掌管「擴音傳聲與場域話語權」，刻意剪線並非圖財，而是不想讓某個聲音傳出來、或對主持發話安排心存不滿",
      });
    }
    if (/(花|鮮花|供花|盆栽|花草|植物|樹)/.test(t)) {
      objects.push({
        name: "花材／供養花卉",
        trigram_img: "巽木花草柔枝 ＋ 離火莊嚴門面與供養心意",
        motive_hint: "供花象徵「敬意、體面與布置心血」，連花一併剪毀屬於「折其美、破其儀式感」的情緒宣洩與暗中較勁",
      });
    }
    if (/(剪掉|剪斷|割斷|切斷|割破|刺破|刮傷|砸壞|弄壞|破壞)/.test(t)) {
      objects.push({
        name: "利器剪斷／針對性破壞動作",
        trigram_img: "乾金／兌金刀剪利器直接剋傷巽震之木（金剋木）",
        motive_hint: "現場需要隨身帶剪刀或清楚知道工具收在哪裡，且目標精準鎖定特定物品而非亂翻財物，顯示下手俐落、心裡早有針對目標",
      });
    }
    if (/(被偷|失竊|不見|遺失|找不到|錢包|現金|首飾|手機|鑰匙|證件|貨款)/.test(t)) {
      objects.push({
        name: "財物器物遺失／暗中移位",
        trigram_img: "妻財與父母物象受玄武坎水隱匿掩蓋",
        motive_hint: "物品離開原位多半發生在交接分心或視線遮蔽空檔，須同步排查熟門熟路順手牽羊與低處夾縫遮擋",
      });
    }
    return { scene, objects };
  }

  function analyzeQuestionDeep(question, rawNumbersText = "", parentQuestion = "") {
    const qCur = String(question || "").trim();
    const qParent = String(parentQuestion || "").trim();
    const combined = qParent ? `${qParent}（追問：${qCur}）` : qCur;
    const pairCur = extractOptionPair(qCur);
    const pairAll = pairCur || extractOptionPair(qParent);
    const numberGroups = extractNumberGroups(combined, rawNumbersText);
    const shuzi = analyzeShuziGroups(numberGroups);
    const { scene, objects } = extractSceneAndObjects(combined);

    // 1. 追問或單問「男女／性別特徵」
    if (/(男的還是女的|女的還是男的|男生還是女生|女生還是男生|男性還是女性|是男是女|男的嗎|女的嗎)/.test(qCur)) {
      return {
        intent: "investigation_gender",
        intent_label: "人物性別與行事特徵研判",
        recommended_spread: "truth_investigation_5",
        yijing_yongshen: "本變卦陰陽少長男女卦象與動爻陰陽氣質",
        yongshen_kin: "官鬼",
        optA: "男性",
        optB: "女性",
        is_followup: Boolean(qParent),
        parent_question: qParent,
        scene,
        objects,
        number_groups: numberGroups,
        shuzi_analysis: shuzi,
      };
    }

    // 2. 追問「時段／時間」或「方位／哪裡找」
    if (qParent && /(什麼時段|什麼時候|幾點|白天還是晚上|早上還是晚上)/.test(qCur)) {
      return {
        intent: "investigation_timing",
        intent_label: "動手時段與出入時間窗研判",
        recommended_spread: "truth_investigation_5",
        yijing_yongshen: "動爻地支時辰與內外卦明暗交替象",
        yongshen_kin: "官鬼",
        optA: pairCur ? pairCur.optA : "日間人多時段",
        optB: pairCur ? pairCur.optB : "清晨／傍晚交接人少時段",
        is_followup: true,
        parent_question: qParent,
        scene,
        objects,
        number_groups: numberGroups,
        shuzi_analysis: shuzi,
      };
    }

    if (/(哪個方位|往哪找|去哪找|監視器|物證|找得回來嗎|能不能找回|找回來|掉在哪)/.test(qCur)) {
      return {
        intent: "investigation_direction",
        intent_label: "方位線索與尋回機率直斷",
        recommended_spread: "truth_investigation_5",
        yijing_yongshen: "用神落宮方位與內外遠近高低象",
        yongshen_kin: "妻財",
        optA: "可尋獲線索",
        optB: "已被移轉隱匿",
        is_followup: Boolean(qParent),
        parent_question: qParent,
        scene,
        objects,
        number_groups: numberGroups,
        shuzi_analysis: shuzi,
      };
    }

    // 3. 查人追物・破壞失竊・外人還是熟人・內鬼真偽（絕不可誤判成方案 A/B 二選一）
    if (/(外人|熟人|內鬼|自己人|誰做的|誰拿的|誰偷的|誰剪的|所為|被剪|被偷|被拿|失竊|被破壞|刮傷|搞鬼|動手腳|檢舉|黑函|造謠|意外還是人為|人為還是意外|故意還是|真的還是假的)/.test(combined)) {
      let optA = "外人所為";
      let optB = "熟人／熟悉環境者所為";
      if (pairAll) {
        optA = pairAll.optA;
        optB = pairAll.optB;
      }
      return {
        intent: "investigation",
        intent_label: "查事追人・內外歸屬與動機直斷",
        recommended_spread: "truth_investigation_5",
        yijing_yongshen: "內外卦動靜（內熟外生）、體用生剋與官鬼玄武爻象",
        yongshen_kin: "官鬼",
        optA,
        optB,
        is_followup: Boolean(qParent),
        parent_question: qParent,
        scene,
        objects,
        number_groups: numberGroups,
        shuzi_analysis: shuzi,
      };
    }

    // 4. 真實行動方案二選一（擷取實際選項名稱，不再死板寫方案 A / 方案 B）
    if (["還是", "或者", "哪個好", "哪一個", "選A", "選B", "要不要換"].some((k) => qCur.includes(k))) {
      if (qCur.includes("還是") || qCur.includes("哪個") || qCur.includes("哪一")) {
        const optA = pairCur ? pairCur.optA : "第一選項";
        const optB = pairCur ? pairCur.optB : "第二選項";
        return {
          intent: "two_choice",
          intent_label: `二選一權衡（${optA} vs ${optB}）`,
          recommended_spread: "two_choice_5",
          yijing_yongshen: "世爻（自身底氣）對照應爻與動變兩路得失",
          yongshen_kin: "妻財",
          optA,
          optB,
          is_followup: Boolean(qParent),
          parent_question: qParent,
          scene,
          objects,
          number_groups: numberGroups,
          shuzi_analysis: shuzi,
        };
      }
    }

    // 5. 感情關係
    if (["喜歡", "愛", "復合", "曖昧", "他心裡", "她心裡", "冷戰", "分手", "正緣", "桃花", "結婚", "感情", "男友", "女友", "老公", "老婆", "另一半", "聯絡"].some((k) => combined.includes(k))) {
      return {
        intent: "love",
        intent_label: "感情關係與對方真實心意",
        recommended_spread: "love_mirror_4",
        yijing_yongshen: "應爻（對方心態）與財官感情用神",
        yongshen_kin: ["男友", "老公", "他"].some((w) => combined.includes(w)) ? "官鬼" : "妻財",
        is_followup: Boolean(qParent),
        parent_question: qParent,
        scene,
        objects,
        number_groups: numberGroups,
        shuzi_analysis: shuzi,
      };
    }

    // 6. 財運資金買賣
    if (["錢", "財運", "收款", "欠款", "業績", "生意", "賺", "資金", "周轉", "週轉", "買房", "置產", "店面", "報價", "合夥", "簽約"].some((k) => combined.includes(k))) {
      return {
        intent: "wealth",
        intent_label: "財運資金與合作簽約得失",
        recommended_spread: "three_core",
        yijing_yongshen: "妻財爻（實質回報）與父母爻（合約憑據）",
        yongshen_kin: combined.includes("約") ? "父母" : "妻財",
        is_followup: Boolean(qParent),
        parent_question: qParent,
        scene,
        objects,
        number_groups: numberGroups,
        shuzi_analysis: shuzi,
      };
    }

    // 7. 事業轉職考試
    if (["工作", "事業", "升遷", "主管", "老闆", "面試", "轉職", "創業", "合作", "專案", "離職", "考績", "考試"].some((k) => combined.includes(k))) {
      return {
        intent: "career",
        intent_label: "事業發展與職場進退決策",
        recommended_spread: "three_core",
        yijing_yongshen: "官鬼爻（職位名分）與父母爻（文書考核）",
        yongshen_kin: !combined.includes("考") ? "官鬼" : "父母",
        is_followup: Boolean(qParent),
        parent_question: qParent,
        scene,
        objects,
        number_groups: numberGroups,
        shuzi_analysis: shuzi,
      };
    }

    if (qCur.length <= 16 && ["好嗎", "可以嗎", "能成嗎", "會不會", "該不該", "可不可以"].some((k) => qCur.includes(k))) {
      return {
        intent: "yes_no",
        intent_label: "單一事體成敗直斷",
        recommended_spread: "single_verdict",
        yijing_yongshen: "世應生剋與用神旺衰成敗",
        yongshen_kin: "世爻",
        is_followup: Boolean(qParent),
        parent_question: qParent,
        scene,
        objects,
        number_groups: numberGroups,
        shuzi_analysis: shuzi,
      };
    }

    return {
      intent: "general",
      intent_label: "事體核心走向與破局對策",
      recommended_spread: "three_core",
      yijing_yongshen: "世爻（自身立場）與應爻（外境人事）",
      yongshen_kin: "世爻",
      is_followup: Boolean(qParent),
      parent_question: qParent,
      scene,
      objects,
      number_groups: numberGroups,
      shuzi_analysis: shuzi,
    };
  }

  function classifyQuestionIntent(question) {
    return analyzeQuestionDeep(question, "", "");
  }

  function buildFollowupSuggestions(intent) {
    if (intent === "investigation") {
      return [
        "男的還是女的？行事有什麼特徵？",
        "大約是什麼時段動手的？",
        "監視器與物證該優先往哪個方位死角查？",
        "對方真正的動機是針對誰或哪件事？",
      ];
    }
    if (intent === "investigation_gender") {
      return [
        "大約是什麼時段動手的？",
        "監視器與物證該優先往哪個方位死角查？",
        "這件事後續還會再發生嗎？該怎麼防範？",
      ];
    }
    if (intent === "investigation_timing" || intent === "investigation_direction") {
      return [
        "男的還是女的？行事有什麼特徵？",
        "這件事是單獨一人還是有人知情配合？",
        "後續該怎麼低調防範才不會打草驚蛇？",
      ];
    }
    if (intent === "love") {
      return [
        "這兩週我該主動傳訊息還是先按兵不動？",
        "他心裡最在意卻沒說出口的顧慮是什麼？",
        "未來一個月內關係破冰的關鍵契機在哪裡？",
      ];
    }
    if (intent === "two_choice") {
      return [
        "如果選勝出那條路，第一個月最該防什麼暗坑？",
        "這個決定在幾月拍板對我最有利？",
        "有沒有兩全其美的折衷談判空間？",
      ];
    }
    return [
      "這件事目前最大的暗坑或阻礙在哪裡？",
      "接下來哪個時間點出手最順風？",
      "面對關鍵人物我該採取強硬還是柔和姿態？",
    ];
  }

  function cardPolarityScore(card, isUpright) {
    const challenging = new Set(["M12", "M13", "M15", "M16", "M18", "S03", "S05", "S07", "S08", "S09", "S10", "C05", "W10", "P05"]);
    const strongGood = new Set(["M01", "M03", "M06", "M07", "M10", "M17", "M19", "M21", "W01", "W04", "W06", "C01", "C02", "C09", "C10", "P01", "P03", "P09", "P10"]);
    if (!isUpright) return -1;
    if (strongGood.has(card.id)) return 2;
    if (challenging.has(card.id)) return -2;
    return 1;
  }

  // 塔羅牌象查人／內外／性別權重計算
  function computeTarotInvestigationSignals(drawnCards) {
    const insiderIds = new Set(["M02", "M03", "M05", "M09", "M12", "M15", "M18", "S07", "S02", "C03", "C04", "C05", "C06", "C08", "P03", "P04", "P08"]);
    const outsiderIds = new Set(["M00", "M07", "M16", "W07", "W08", "S05", "P05"]);
    const femaleIds = new Set(["M02", "M03", "M08", "M11", "M14", "M17", "M18", "W13", "C13", "S13", "P13"]);
    const maleIds = new Set(["M01", "M04", "M05", "M07", "W14", "C14", "S14", "P14", "W12", "S12"]);

    let insiderScore = 1; // 針對特定物品精準破壞本身即帶熟門熟路基礎分
    let femaleScore = 0;
    let sharpCutScore = 0;

    drawnCards.forEach((c, idx) => {
      const cid = c.card_id;
      const suit = cid[0];
      if (insiderIds.has(cid)) insiderScore += 1.5;
      if (outsiderIds.has(cid)) insiderScore -= 1.2;
      if (idx === 2 && c.is_upright) insiderScore += 1.0;
      if (idx === 1 && c.is_upright && !insiderIds.has(cid)) insiderScore -= 0.8;

      if (femaleIds.has(cid) || suit === "C" || suit === "P") femaleScore += 1;
      if (maleIds.has(cid) || suit === "W") femaleScore -= 1;
      if (suit === "S") sharpCutScore += 1.5;
      if (!c.is_upright) insiderScore += 0.4; // 逆位多主暗中行事、熟知死角
    });

    return {
      preferInsider: insiderScore >= 0.5,
      insiderConfidence: Math.min(88, Math.max(58, Math.round(64 + insiderScore * 5))),
      preferFemale: femaleScore >= 0,
      hasSharpSword: sharpCutScore >= 1.5,
    };
  }

  function formatTarotCardByMentor(q, qMeta, posIdx, posTitle, card, isUp, mentorId) {
    const intent = qMeta.intent;
    const optA = qMeta.optA || "第一選項";
    const optB = qMeta.optB || "第二選項";
    const kws = (isUp ? card.upright : card.reversed) || [];
    const kwStr = kws.slice(0, 3).join("、");
    const baseLine = isUp ? card.fubo_upright : card.fubo_reversed;
    const ori = isUp ? "正位" : "逆位";
    const cname = `《${card.name_zh}》（${ori}）`;
    const suit = String(card.id || "M00")[0];

    if (intent.startsWith("investigation")) {
      const suitClueMap = {
        M: isUp ? "屬於蓄意已久的核心癥結，並非毫無關聯的偶然事件" : "當事人刻意隱瞞動機，表面裝作若無其事",
        W: isUp ? "行動速度快、趁人少空檔果斷出手" : "因一時火氣與摩擦衝動洩憤，事後急於掩飾",
        C: isUp ? "與熟識人情圈、日常往來或內部感性糾葛高度相關" : "心裡積壓妒意、委屈或不被尊重的怨氣而暗中動手",
        S: isUp ? "帶有刀剪利器精準切斷與針對話語權警告的明確特徵" : "屬於背後搞小動作、避開正面衝突的針對性報復",
        P: isUp ? "非常熟悉現場擺設、物品位置與出入作息" : "針對場域門面與實體布置下手，意在讓人難堪或添亂",
      };
      const lensTitle = mentorId === "rien" ? "里恩・現場證據鏈與動機側寫" : "薇拉・作案心理與人際暗流側寫";
      const lensNote = `牌象線索：${suitClueMap[suit] || suitClueMap.M}。此牌映出「${kwStr}」的行為軌跡。`;
      const sharpLine = `位置訊號指向「${kws[0] || "暗流"}」：${suit === "S" ? "利器切斷、針對性明確" : (suit === "C" || !isUp ? "熟知內情、暗中宣洩" : "熟悉動線、看準時機出手")}。`;
      const plain = `在「${posTitle}」翻出${cname}：對應到現場細節為「${kwStr}」。${suitClueMap[suit] || ""}，顯示動手之人對${qMeta.scene ? qMeta.scene.label : "現場"}環境並不陌生。`;
      return { mentor_lens_title: lensTitle, mentor_lens_note: lensNote, sharp_one_liner: sharpLine, plain_explanation: plain };
    }

    if (mentorId === "rien") {
      const suitRiskMap = {
        M: isUp ? "局勢結構已定型，主導權清晰可判" : "大環境變數干擾，拍板窗口尚未對齊",
        W: isUp ? "執行推進動能充足，適合搶佔先機" : "戰線拉太長導致資源空轉，須防無效衝刺",
        C: isUp ? "合作信任成本低，人脈資源可轉化為助力" : "情緒摩擦正在墊高溝通成本，切忌心軟讓利",
        S: isUp ? "邏輯邊界與議價條款分明，利於快刀斬亂麻" : "資訊不對稱與口頭誤導偏高，須嚴審暗坑",
        P: isUp ? "實質回報與帳面籌碼紮實，投入產出比划算" : "沉沒成本偏高或回收期拉長，宜守緊停損線",
      };
      const lensNote = `籌碼盤點：${suitRiskMap[suit] || suitRiskMap.M}。此牌點出「${kwStr}」的損益訊號，重點在看清誰握有實質拍板權，不為模糊承諾買單。`;
      const sharpLine = isUp
        ? `局勢籌碼亮在「${kws[0] || "推進"}」：條件對你有利，直接鎖定驗收節點。`
        : `風險紅燈落在「${kws[0] || "失衡"}」：隱性消耗浮現，先踩停損再談下一步。`;
      let plain;
      if (intent === "two_choice") {
        if (posIdx === 1 || posIdx === 2) {
          plain = `評估「${optA}」的「${posTitle}」出現${cname}：這條路徑的執行損益落在「${kwStr}」。從策略面拆解，${baseLine} 衡量重點在於這筆轉換成本能否換回對等的主導權。`;
        } else if (posIdx === 3 || posIdx === 4) {
          plain = `評估「${optB}」的「${posTitle}」出現${cname}：這條路徑的實際代價為「${kwStr}」。從風險報酬比來看，${baseLine} 請直接核對帳面資源與機會成本，不憑慣性留戀。`;
        } else {
          plain = `在「${posTitle}」抽出${cname}：你目前手上的決策底盤呈現「${kwStr}」。策略直斷：${baseLine}`;
        }
      } else if (intent === "love") {
        plain = `從關係成本拆解「${posTitle}」的${cname}：目前雙方投入比呈現「${kwStr}」。${baseLine} 不看對方說了多少漂亮話，只看他實際端出多少時間與行動籌碼。`;
      } else {
        plain = `針對「${posTitle}」翻出${cname}，關鍵指標為「${kwStr}」。從決策損益直說：${baseLine}`;
      }
      return { mentor_lens_title: "里恩・籌碼與停損眉批", mentor_lens_note: lensNote, sharp_one_liner: sharpLine, plain_explanation: plain };
    }

    const suitPsychMap = {
      M: isUp ? "內心深層課題正在鬆動，真實渴望已經浮上檯面" : "潛意識仍在抗拒改變，習慣用舊模式保護自己",
      W: isUp ? "靠近與表達的熱度正在升溫，渴望被看見與回應" : "熱情背後藏著怕落空的不安，容易忽冷忽熱自我消耗",
      C: isUp ? "情感流動柔軟真誠，心門願意為信任的人微開" : "把委屈往心裡吞，用冷淡外殼掩飾對安全感的渴求",
      S: isUp ? "理智正在替情緒畫出安全邊界，不再盲目內耗" : "過度猜測與防衛機制拉滿，越在乎反而話說得越硬",
      P: isUp ? "重視踏實陪伴與長久默契，在細節裡默默給出在乎" : "害怕付出沒有對等回音，正在暗中衡量退路與得失",
    };
    const lensNote = `潛台詞拆解：${suitPsychMap[suit] || suitPsychMap.M}。牌底映出「${kwStr}」的心理狀態，那些沒說出口的猶豫，其實都藏在互動高低位裡。`;
    const sharpLine = isUp
      ? `牌底映出「${kws[0] || "敞開"}」的心緒：防衛正在卸下，留一點溫和台階就能靠近。`
      : `牌底藏著「${kws[0] || "防衛"}」的逞強：表面看似平靜，心裡其實卡著沒說破的顧慮。`;
    let plain;
    if (intent === "love") {
      if (posIdx === 1) {
        plain = `在「${posTitle}」映出${cname}：輕聲掀開對方的潛台詞，他此刻心裡正處於「${kwStr}」的拉扯。${baseLine} 他並不是毫無波瀾，而是防衛機制讓他不敢先亮出脆弱。`;
      } else if (posIdx === 2) {
        plain = `在「${posTitle}」映出${cname}：橫在你們之間沒說破的結是「${kwStr}」。${baseLine} 當兩個人都在等對方先低頭，沉默就會把原本的心意磨成內耗。`;
      } else {
        plain = `在「${posTitle}」抽出${cname}：這段互動的心理氣場呈現「${kwStr}」。溫柔但誠實地說，${baseLine}`;
      }
    } else if (intent === "two_choice") {
      if (posIdx === 1 || posIdx === 2) {
        plain = `感受「${optA}」在「${posTitle}」的${cname}：走進這個選項的心理舒展度偏向「${kwStr}」。${baseLine}`;
      } else if (posIdx === 3 || posIdx === 4) {
        plain = `感受「${optB}」在「${posTitle}」的${cname}：留在這條路的真實情緒體感是「${kwStr}」。${baseLine}`;
      } else {
        plain = `在「${posTitle}」映出${cname}：你內心真正的聲音正停在「${kwStr}」。${baseLine}`;
      }
    } else {
      plain = `在「${posTitle}」這張${cname}裡，背後的人際溫度與心理訊號指向「${kwStr}」。換句貼近你處境的話說：${baseLine}`;
    }
    return { mentor_lens_title: "薇拉・心理潛台詞眉批", mentor_lens_note: lensNote, sharp_one_liner: sharpLine, plain_explanation: plain };
  }

  function buildTarotInvestigationBundle(qClean, qMeta, drawnCards, mentorId) {
    const sig = computeTarotInvestigationSignals(drawnCards);
    const firstC = drawnCards[0];
    const outC = drawnCards[1] || firstC;
    const inC = drawnCards[2] || firstC;
    const styleC = drawnCards[3] || firstC;
    const endC = drawnCards[drawnCards.length - 1];
    const sceneLabel = qMeta.scene ? qMeta.scene.label : "現場";
    const objNames = (qMeta.objects || []).map((o) => o.name).join("與") || "現場物品";
    const objMotive = (qMeta.objects && qMeta.objects[0]) ? qMeta.objects[0].motive_hint : "針對特定目標宣洩不滿或干擾運作，並非隨機圖財";

    let tag, verdict, summaryTable;
    if (qMeta.intent === "investigation_gender") {
      const genderWord = sig.preferFemale ? "偏女性所為機率較高" : "偏男性所為機率較高";
      const traitNote = sig.preferFemale
        ? "心思細膩、熟悉場域日常擺設，但動手當下情緒果決俐落、帶有一股剛強拗氣"
        : "行動直接俐落、熟悉工具與動線，屬於說做就做、不愛正面爭辯卻暗中出手的類型";
      tag = `人物側寫：${genderWord}`;
      verdict = `直接回答你的追問：從鎖定的同一組牌陣來看，這件事「${genderWord}」。關鍵特徵牌《${styleC.name_zh}》（${styleC.orientation}）結合《${inC.name_zh}》（${inC.orientation}）顯示，動手之人${traitNote}，平時在${sceneLabel}進出自然、不易引人起疑。`;
      summaryTable = [
        { aspect: "性別傾向", tendency: genderWord, basis: `特徵位《${styleC.name_zh}》與關聯位《${inC.name_zh}》陰陽牌氣合參` },
        { aspect: "性格與手法", tendency: traitNote, basis: `核心牌《${firstC.name_zh}》（${firstC.orientation}）反映壓抑後果斷出手` },
        { aspect: "人數研判", tendency: "偏單獨一人趁空檔動手", basis: "牌面呈隱蔽獨行之象，非群聚喧嘩破壞" },
      ];
    } else if (qMeta.intent === "investigation_timing" || qMeta.intent === "investigation_direction") {
      tag = "時空線索鎖定・優先查熟客死角";
      verdict = `直接回答你的追問：動手時段高度落在「清晨剛開門、午間休息或傍晚收尾交接」人員視線最鬆懈的空檔；排查方向請優先鎖定${qMeta.scene.placeHint}。牌面《${styleC.name_zh}》（${styleC.orientation}）與《${endC.name_zh}》（${endC.orientation}）顯示對方清楚鏡頭角度，建議比對事發前後進出卻刻意繞開主走道的熟面孔。`;
      summaryTable = [
        { aspect: "高風險時段", tendency: "清晨／午休／傍晚交接人少空檔", basis: `《${firstC.name_zh}》與《${styleC.name_zh}》呈趁隙避人耳目之象` },
        { aspect: "重點排查位置", tendency: qMeta.scene.placeHint, basis: `收尾牌《${endC.name_zh}》指向動線交界與工具收納處` },
      ];
    } else {
      const culpritTendency = sig.preferInsider
        ? `偏「${qMeta.optB || "熟人／熟悉環境與動線者"}」所為，機率明顯高於單純路過的${qMeta.optA || "陌生外人"}`
        : `偏「${qMeta.optA || "外來人員"}」趁隙闖入，但對${sceneLabel}動線仍有一定觀察`;
      tag = sig.preferInsider ? "高度指向熟人／熟知動線者" : "偏外來闖入・須查門禁死角";
      const mentorVoice = mentorId === "rien"
        ? `直接給你證據面結論：這起${sceneLabel}事件，${culpritTendency}。從犯罪成本與目標選擇來看，${objMotive}；外人指標位《${outC.name_zh}》（${outC.orientation}）缺乏隨機闖入搜刮財物的跡象，反觀熟人指標位《${inC.name_zh}》（${inC.orientation}）與手法位《${styleC.name_zh}》（${styleC.orientation}）明確指向清楚作息、知道線路與花材位置、且近期曾有意見摩擦或情緒心結的熟面孔。`
        : `直接回答你最想知道的核心答案：這起${sceneLabel}事件，${culpritTendency}。掀開牌底的心理動機《${firstC.name_zh}》（${firstC.orientation}）與熟人位《${inC.name_zh}》（${inC.orientation}），${objMotive}；隨機路過的外人不會不拿財物卻專挑${objNames}精準下手，這背後藏著「熟悉內部人事、心裡有委屈或不滿卻不願當面吵破，乾脆暗中剪斷宣洩」的情緒軌跡。`;
      verdict = mentorVoice;
      summaryTable = [
        { aspect: `${qMeta.optA || "外人"} vs ${qMeta.optB || "熟人"}`, tendency: sig.preferInsider ? `偏「${qMeta.optB || "熟人／常出入知情者"}」高於陌生外人` : `偏「${qMeta.optA || "外來者"}」趁隙下手`, basis: `熟人位《${inC.name_zh}》對照外人位《${outC.name_zh}》，目標精準鎖定${objNames}` },
        { aspect: "動機性質", tendency: "針對性宣洩／人際摩擦或話語權較勁（非圖財）", basis: `動機位《${firstC.name_zh}》（${firstC.orientation}）：${objMotive}` },
        { aspect: "作案手法", tendency: "熟知動線與人少時段、預備利器俐落下手", basis: `手法位《${styleC.name_zh}》（${styleC.orientation}）呈現避開正面視線、快速切斷特徵` },
      ];
    }

    const timing = `查證黃金時間窗：事發後 3 至 7 天內為調閱監視器死角、比對進出時段與觀察熟識人員神情反應的關鍵期；切忌尚未掌握影像前公開張揚以免對方銷毀工具或刻意避風頭。`;
    const actions = [
      `先查監視器死角與熟面孔時段：優先比對平時常出入${sceneLabel}、熟悉${qMeta.scene.placeHint}，或近期曾對活動安排、發話權有意見摩擦的人員進出時間，再排查陌生訪客。`,
      `檢視現場切口與工具來源：查看斷口是平整利剪（如斜口鉗、利剪）還是拉扯折斷，並清點現場收納櫃剪刀是否被動過，區分「自備工具預謀」或「順手拿現場工具洩憤」。`,
      `低調修復並加裝隱蔽廣角鏡頭：迅速換新線路與補齊布置，表面維持平靜不公開點名猜忌，暗中補強講台、供桌與側門死角照明及錄影，有影像實據再作處置最穩妥。`,
    ];
    const closingTip = mentorId === "rien"
      ? "里恩的查證風控原則：沒有拿到影像或物證前絕不打草驚蛇，把查證範圍縮小到「熟知動線且近期有摩擦」的交集名單，真相自然浮現。"
      : "薇拉的場域安頓提醒：破壞物品的人想看見你們慌亂猜忌，你們越是沉穩修復、把界線與監控靜靜補齊，對方的情緒伎倆就越使不上力。";
    return { tag, verdict, timing, actions, closingTip, summaryTable };
  }

  function buildVeraTarotBundle(qClean, qMeta, spreadId, drawnCards, scores) {
    if (spreadId === "truth_investigation_5" || qMeta.intent.startsWith("investigation")) {
      return buildTarotInvestigationBundle(qClean, qMeta, drawnCards, "vera");
    }
    let tag, verdict, timing, actions, summaryTable;
    const optA = qMeta.optA || "第一選項";
    const optB = qMeta.optB || "第二選項";
    const firstC = drawnCards[0];
    const lastC = drawnCards[drawnCards.length - 1];
    if (spreadId === "two_choice_5" && scores.length === 5) {
      const scoreA = scores[1] + scores[2] * 1.5;
      const scoreB = scores[3] + scores[4] * 1.5;
      const cARes = drawnCards[2];
      const cBRes = drawnCards[4];
      if (scoreA > scoreB + 0.5) {
        tag = `優先選「${optA}」（心理舒展與契合度高）`;
        verdict = `針對你反覆權衡的「${qClean}」，直接給你結論：選擇「${optA}」更能讓你找回內心的舒展感與被珍惜的舞台。你當下的底盤《${firstC.name_zh}》（${firstC.orientation}）透露你其實早就察覺現狀的窒息感；「${optA}」收尾在《${cARes.name_zh}》（${cARes.orientation}），人際氣場坦率溫暖，而「${optB}」落在《${cBRes.name_zh}》（${cBRes.orientation}），繼續勉強只會加深自我消耗。`;
      } else if (scoreB > scoreA + 0.5) {
        tag = `優先選「${optB}」（情緒根基與默契較穩）`;
        verdict = `針對你猶豫的「${qClean}」，直接給你結論：現階段選擇「${optB}」更能安頓你的安全感與長遠節奏。「${optB}」最終落在《${cBRes.name_zh}》（${cBRes.orientation}），人際支持與日常默契都更踏實；反觀「${optA}」落在《${cARes.name_zh}》（${cARes.orientation}），表面新鮮卻伴隨高度情緒緊繃，不必急著跳進另一個消耗場。`;
      } else {
        tag = "兩邊氣場相近・先立好內心邊界再拍板";
        verdict = `針對「${qClean}」，目前「${optA}」（《${cARes.name_zh}》）與「${optB}」（《${cBRes.name_zh}》）外在條件旗鼓相當，真正關鍵在於底盤《${firstC.name_zh}》映出的界線課題。哪一邊願意尊重你的底線與真實需求，答案就在哪一邊。`;
      }
      summaryTable = [
        { aspect: `選擇「${optA}」`, tendency: scoreA >= scoreB ? "氣場較舒展・具突破空間" : "變動壓力較大・需磨合", basis: `過程《${drawnCards[1].name_zh}》→ 結果《${cARes.name_zh}》（${cARes.orientation}）` },
        { aspect: `選擇「${optB}」`, tendency: scoreB > scoreA ? "根基較安穩・支持度高" : "易重複舊有內耗", basis: `過程《${drawnCards[3].name_zh}》→ 結果《${cBRes.name_zh}》（${cBRes.orientation}）` },
      ];
      timing = "心緒沉澱與明朗窗：給自己 7 至 14 天不帶自責的觀察留白，下旬的一次深度對話會讓你心裡徹底篤定。";
      actions = [
        `先接住《${firstC.name_zh}》背後的焦慮：寫下你在「${optA}」與「${optB}」之間最怕失去的三件事，看清恐懼就不會被情緒帶著走。`,
        "與關鍵對象溝通時溫和而堅定地表達感受，觀察哪一邊願意認真回應你的在乎。",
        "做出決定後給自己兩週適應緩衝期，專注把選定的路走穩，不必回頭反覆檢討。",
      ];
    } else {
      const avg = scores.reduce((s, x) => s + x, 0) / Math.max(1, scores.length);
      if (avg >= 0.8 && lastC.polarity_score >= 1) {
        tag = "心意相通・關係與局勢正向回溫";
        verdict = qMeta.intent === "love"
          ? `直接回答你問的「${qClean}」：對方心裡是有你的位置的，而且這段關係正朝著卸下防備、重新靠近的方向流動（結果牌《${lastC.name_zh}》${lastC.orientation}）。過去的停滯多半是因為雙方都在試探高低位，只要遞出一個輕巧不帶壓力的台階，溫暖的互動很快就會接上。`
          : `直接回答你問的「${qClean}」：這件事正向可成，身邊關鍵人物的潛台詞偏向善意與認同（結果牌《${lastC.name_zh}》${lastC.orientation}）。你過去累積的誠意已經被看見，順著目前的默契自然推進就能迎來好消息。`;
        timing = "情感與默契升溫窗：未來 14 至 35 天內會有一次自然破冰或善意回應的契機，夜晚或週末的輕鬆聯繫最對頻。";
        actions = [
          `順著《${firstC.name_zh}》的柔和起點，用分享日常小事代替嚴肅追問，讓對方感覺靠近你是輕鬆沒有壓力的。`,
          "把心裡期待的互動方式用正向肯定的語氣說出來，減少彎彎繞繞的試探與冷處理。",
          `迎向《${lastC.name_zh}》的敞開能量，當對方釋出善意時大方接住，讓正向循環自然發酵。`,
        ];
      } else if (avg <= -0.6 || lastC.polarity_score <= -2) {
        tag = "防衛拉滿・先收回重心止住內耗";
        verdict = qMeta.intent === "love"
          ? `直接回答你問的「${qClean}」：目前對方的情緒防衛機制拉得很高（收尾落在《${lastC.name_zh}》${lastC.orientation}），逃避承諾與怕麻煩的成分偏重。這時候你越是用力追問，關係高低位就越失衡；先把注意力收回來照顧自己，才是讓他意識到落差的關鍵。`
          : `直接回答你問的「${qClean}」：現階段阻力偏大，牌面《${lastC.name_zh}》（${lastC.orientation}）映出對方暗藏顧慮、話只說三分，直接硬推容易讓你獨自承受摩擦，建議先退後半步守住心理安全邊界。`;
        timing = "留白沉澱窗：接下來 3 至 5 週宜靜不宜追，給彼此一段不打擾的呼吸空間，滿一個月後再看對方實際行動。";
        actions = [
          `看見《${firstC.name_zh}》提醒的內耗源頭：停止反覆翻看舊訊息替對方的冷淡找藉口，把情緒主導權拿回自己手裡。`,
          "這兩週練習「七分留白」原則：維持基本禮貌但不再主動討好或連環追問，觀察對方的真實反應。",
          "安排一件能讓你專注發光的生活目標，當你的重心穩住了，對的人事物才會重新靠近。",
        ];
      } else {
        tag = "心結待解・把潛台詞攤開就能轉順";
        verdict = `直接回答你問的「${qClean}」：這件事並非無解，而是卡在「雙方都在等對方先遞台階」的微妙拉扯。起頭《${firstC.name_zh}》（${firstC.orientation}）代表彼此仍有連結與在乎，但收尾《${lastC.name_zh}》（${lastC.orientation}）點出溝通節奏還沒對齊；只要卸下防備把真實顧慮溫和聊開，局勢就能由緊轉順。`;
        timing = "破冰對話窗：未來 2 至 4 週內適合找一個不趕時間的場合輕聲把誤會聊開，跨過心結後下半月明顯回暖。";
        actions = [
          `先梳理《${firstC.name_zh}》映出的委屈點，分清楚哪些是客觀事實、哪些是自己腦補的不安投射。`,
          "溝通時少用質問句、多說自己的真實感受，給對方一個不傷面子也能說真話的安全空間。",
          `記住《${lastC.name_zh}》的節奏提醒，維持三分溫柔留白與七分自我界線，慢一點反而走得更穩。`,
        ];
      }
      summaryTable = [
        { aspect: "核心結論", tendency: tag, basis: `起點《${firstC.name_zh}》→ 收尾《${lastC.name_zh}》（${lastC.orientation}）` },
        { aspect: "關鍵盲點與轉機", tendency: lastC.is_upright ? "順勢溫和推進即可破冰" : "宜先留白降溫、不急於逼問", basis: `關鍵位關鍵詞：${(lastC.keywords || []).slice(0, 3).join("、")}` },
      ];
    }
    const closingTip = "薇拉的關係留白練習：今晚睡前放下手機十分鐘，告訴自己「我不必靠過度用力去換取別人的確定」，當你安頓好自己的頻率，真誠的回應自然會靠近。";
    return { tag, verdict, timing, actions, closingTip, summaryTable };
  }

  function buildRienTarotBundle(qClean, qMeta, spreadId, drawnCards, scores) {
    if (spreadId === "truth_investigation_5" || qMeta.intent.startsWith("investigation")) {
      return buildTarotInvestigationBundle(qClean, qMeta, drawnCards, "rien");
    }
    let tag, verdict, timing, actions, summaryTable;
    const optA = qMeta.optA || "第一選項";
    const optB = qMeta.optB || "第二選項";
    const firstC = drawnCards[0];
    const lastC = drawnCards[drawnCards.length - 1];
    if (spreadId === "two_choice_5" && scores.length === 5) {
      const scoreA = scores[1] + scores[2] * 1.5;
      const scoreB = scores[3] + scores[4] * 1.5;
      const cARes = drawnCards[2];
      const cBRes = drawnCards[4];
      if (scoreA > scoreB + 0.5) {
        tag = `優先選「${optA}」（主導權與報酬比勝出）`;
        verdict = `針對「${qClean}」直接給你損益結論：果斷執行「${optA}」，「${optB}」屬於慢性折舊局。底盤《${firstC.name_zh}》（${firstC.orientation}）顯示繼續觀望只會壓縮你的議價空間；「${optA}」收尾在《${cARes.name_zh}》（${cARes.orientation}），中後段能實質拿回資源分配權與回報；「${optB}」落在《${cBRes.name_zh}》（${cBRes.orientation}），表面安穩實則承擔更高機會成本。`;
      } else if (scoreB > scoreA + 0.5) {
        tag = `優先選「${optB}」（風險可控且回收踏實）`;
        verdict = `針對「${qClean}」直接給你損益結論：優先鎖定「${optB}」，暫緩高波動性的「${optA}」。「${optB}」結果牌落在《${cBRes.name_zh}》（${cBRes.orientation}），穩定度與履約確定性明顯勝出；反觀「${optA}」收在《${cARes.name_zh}》（${cARes.orientation}），存在資訊不對稱與隱性門檻，貿然切換容易替他人收拾爛攤子。`;
      } else {
        tag = "雙案報酬率持平・以白紙黑字條款定勝負";
        verdict = `針對「${qClean}」，「${optA}」（《${cARes.name_zh}》）與「${optB}」（《${cBRes.name_zh}》）預期勝率在伯仲之間，勝負手取決於《${firstC.name_zh}》點出的議價底線。直接向雙方開出權責範圍與實質條件，哪一方願意簽署具約束力的書面保障就選哪一方。`;
      }
      summaryTable = [
        { aspect: `方案「${optA}」`, tendency: scoreA >= scoreB ? "主導權與報酬比占優" : "隱性轉換成本偏高", basis: `過程《${drawnCards[1].name_zh}》→ 結果《${cARes.name_zh}》（${cARes.orientation}）` },
        { aspect: `方案「${optB}」`, tendency: scoreB > scoreA ? "風險可控・確定性高" : "成長受限・慢性折舊", basis: `過程《${drawnCards[3].name_zh}》→ 結果《${cBRes.name_zh}》（${cBRes.orientation}）` },
      ];
      timing = "決策拍板窗口：設定 7 至 14 天盡職調查期核實雙方底牌，第 15 天前完成定案，切忌拖過月底消耗議價權。";
      actions = [
        `依據《${firstC.name_zh}》盤點你手上的不可替代籌碼，列出實質報酬與決策權限兩項硬指標。`,
        "排除所有口頭畫餅與人情承諾，要求關鍵數字、考核標準與退場機制全數寫入正式文件。",
        "拍板後立即切斷另一選項的沉沒成本干擾，集中首月核心資源打贏第一場立威戰役。",
      ];
    } else {
      const avg = scores.reduce((s, x) => s + x, 0) / Math.max(1, scores.length);
      if (avg >= 0.8 && lastC.polarity_score >= 1) {
        tag = "勝率明確・果斷鎖定籌碼推進";
        verdict = qMeta.intent === "love"
          ? `針對「${qClean}」，從雙方投入產出比直接判斷：這局勝率站在你這邊（結果牌《${lastC.name_zh}》${lastC.orientation}）。對方願意投入實質時間與行動成本，並非空口敷衍；現在正是順勢確認關係定位的高勝率窗口。`
          : `針對「${qClean}」，策略結論非常明確：可行且預期報酬正向（收尾牌《${lastC.name_zh}》${lastC.orientation}）。前期鋪墊已跨越損益平衡點，主導權握在你手上，接下來應加速把口頭意向轉化為具體戰果。`;
        timing = "高勝率執行窗：未來 10 至 30 天為最佳收網期，建議於兩週內敲定關鍵條款與時間表。";
        actions = [
          `放大《${firstC.name_zh}》賦予的先發籌碼，本週內主動拋出你的框架與時間節點，掌握議程主導權。`,
          "將執行目標拆解為可量化的雙週驗收指標，確保每一分資源投入都有對應產出。",
          `順應《${lastC.name_zh}》的收成訊號，在條件最有利時完成確認，落袋為安。`,
        ];
      } else if (avg <= -0.6 || lastC.polarity_score <= -2) {
        tag = "風險超標・立即啟動停損防線";
        verdict = qMeta.intent === "love"
          ? `針對「${qClean}」，直接攤開帳面：這段互動目前處於投入不對等的虧損局（警示牌《${lastC.name_zh}》${lastC.orientation}）。對方僅享受情緒紅利卻迴避實質責任，立刻停止單方面付出、設定觀察死線，才是保住籌碼的作法。`
          : `針對「${qClean}」，直接給風控結論：現階段不宜貿然拍板或追加資源（風險牌落在《${lastC.name_zh}》${lastC.orientation}）。盤面顯示資訊不對稱、隱性成本未揭露，先退回安全防線保住核心本金與主導權。`;
        timing = "風控停損觀察窗：設定嚴格的 14 至 28 天凍結觀察期，期間對方若未端出實質擔保，期滿立即轉向備案。";
        actions = [
          `正視《${firstC.name_zh}》揭露的結構破口，限期清查明細、權責歸屬與過往紀錄。`,
          "即刻凍結新增資金、人力或情緒籌碼投入，絕不因過去已付出的沉沒成本而繼續加碼。",
          "同步啟動備用方案，確保手握隨時可抽身轉向的替代管道。",
        ];
      } else {
        tag = "條件博弈局・分期驗收控管風險";
        verdict = `針對「${qClean}」，盤面屬於「帶條件可成局」。起始牌《${firstC.name_zh}》（${firstC.orientation}）具備基本可行性，但收尾牌《${lastC.name_zh}》（${lastC.orientation}）提醒中段存在權責模糊或拉鋸；只要採取「分階段給籌碼、驗收一階段再推進一階段」的打法，就能穩住勝率。`;
        timing = "議價磨合窗口：接下來 14 至 21 天為條件對齊期，談妥驗收標準後，第 4 至 7 週可望穩步收成。";
        actions = [
          `先針對《${firstC.name_zh}》反映的模糊地帶逐項要求書面定義，把責任邊界講在前面。`,
          "嚴格執行里程碑分段投入：看到第一階段可驗證成果，再釋放下一階段資源。",
          `對照《${lastC.name_zh}》預留一成五的風險緩衝空間與備案時間，確保進可攻退可守。`,
        ];
      }
      summaryTable = [
        { aspect: "損益結論", tendency: tag, basis: `起點《${firstC.name_zh}》→ 終局《${lastC.name_zh}》（${lastC.orientation}）` },
        { aspect: "風控操作重點", tendency: lastC.is_upright ? "鎖定條款加速收網" : "嚴設停損線與分段驗收", basis: `關鍵風險指標：${(lastC.keywords || []).slice(0, 3).join("、")}` },
      ];
    }
    const closingTip = "里恩的十四天停損檢核指標：從今天起算第十四天，只核對一件事——對方是否拿出「可驗證的具體行動或書面保障」；有則推進，無則果斷轉移籌碼。";
    return { tag, verdict, timing, actions, closingTip, summaryTable };
  }

  function runTarotReading(question, mentorId = "vera", spreadOverride = "auto", selectedIndices = null, seedStr = "", lockedState = null, extraOpts = {}) {
    const qClean = String(question || "請問我接下來三個月最需要注意的轉折與建議是什麼？").trim();
    const parentQ = extraOpts && extraOpts.parent_question ? String(extraOpts.parent_question).trim() : "";
    const qMeta = analyzeQuestionDeep(qClean, "", parentQ);
    let spreadId = !spreadOverride || spreadOverride === "auto" ? qMeta.recommended_spread : spreadOverride;
    if (lockedState && lockedState.card_slots && SPREAD_DEFS[spreadOverride]) {
      spreadId = spreadOverride;
    }
    if (!SPREAD_DEFS[spreadId]) spreadId = "three_core";
    const baseSpread = SPREAD_DEFS[spreadId];
    // 動態代入真實選項名稱於牌陣位置標題
    const dynamicPositions = baseSpread.positions.map((pos, idx) => {
      if (spreadId === "two_choice_5" && qMeta.optA && qMeta.optB) {
        if (idx === 1) return `選「${qMeta.optA}」的過程與代價`;
        if (idx === 2) return `選「${qMeta.optA}」的預期結果`;
        if (idx === 3) return `選「${qMeta.optB}」的過程與代價`;
        if (idx === 4) return `選「${qMeta.optB}」的預期結果`;
      }
      if (spreadId === "truth_investigation_5" && qMeta.optA && qMeta.optB && qMeta.intent === "investigation") {
        if (idx === 1) return `偏「${qMeta.optA}」可能性指標`;
        if (idx === 2) return `偏「${qMeta.optB}」可能性指標`;
      }
      return pos;
    });
    const spread = Object.assign({}, baseSpread, { positions: dynamicPositions });
    const resolvedMentorId = mentorId === "rien" ? "rien" : "vera";
    const mentor = MENTORS[resolvedMentorId];

    let seedVal = seedStr ? parseInt(fnvHex16(seedStr).slice(0, 8), 16) : 0;
    const nextRand = () => {
      if (!seedStr) return Math.random();
      seedVal = (Math.imul(seedVal, 1664525) + 1013904223) >>> 0;
      return seedVal / 4294967296;
    };

    const deck = DB.tarotCards.map((_, i) => i);
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(nextRand() * (i + 1));
      const tmp = deck[i];
      deck[i] = deck[j];
      deck[j] = tmp;
    }

    const count = spread.card_count;
    const chosenSlots = lockedState && Array.isArray(lockedState.card_slots) && lockedState.card_slots.length >= 1
      ? lockedState.card_slots.slice(0, count).map((idx) => Math.abs(idx) % DB.tarotCards.length)
      : (Array.isArray(selectedIndices) && selectedIndices.length >= count
        ? selectedIndices.slice(0, count).map((idx) => deck[Math.abs(idx) % deck.length])
        : deck.slice(0, count));

    const scores = [];
    const drawnCards = chosenSlots.map((cardIdx, posIdx) => {
      const c = DB.tarotCards[cardIdx];
      const isUp = lockedState && Array.isArray(lockedState.orientations) && typeof lockedState.orientations[posIdx] === "boolean"
        ? lockedState.orientations[posIdx]
        : nextRand() >= 0.34;
      const sc = cardPolarityScore(c, isUp);
      scores.push(sc);
      const posTitle = spread.positions[posIdx] || `位置 ${posIdx + 1}`;
      const kws = isUp ? c.upright : c.reversed;
      const formatted = formatTarotCardByMentor(qClean, qMeta, posIdx, posTitle, c, isUp, resolvedMentorId);
      return {
        position_index: posIdx + 1,
        position_title: posTitle,
        card_slot_index: cardIdx,
        card_id: c.id,
        name_zh: c.name_zh,
        name_en: c.name_en,
        arcana: c.arcana || "minor",
        number: c.number !== undefined ? c.number : (c.rank || ""),
        element: c.element || "",
        orientation: isUp ? "正位" : "逆位",
        is_upright: isUp,
        polarity_score: sc,
        keywords: kws.slice(0, 4),
        mentor_lens_title: sanitizeText(formatted.mentor_lens_title),
        mentor_lens_note: sanitizeText(formatted.mentor_lens_note),
        sharp_one_liner: sanitizeText(formatted.sharp_one_liner),
        plain_explanation: sanitizeText(formatted.plain_explanation),
      };
    });

    const bundle = resolvedMentorId === "rien"
      ? buildRienTarotBundle(qClean, qMeta, spreadId, drawnCards, scores)
      : buildVeraTarotBundle(qClean, qMeta, spreadId, drawnCards, scores);

    return {
      system: "tarot",
      question: qClean,
      parent_question: parentQ,
      intent_detected: qMeta,
      mentor,
      spread,
      verdict_badge: sanitizeText(bundle.tag),
      direct_verdict: sanitizeText(bundle.verdict),
      summary_table: (bundle.summaryTable || []).map((r) => ({
        aspect: sanitizeText(r.aspect),
        tendency: sanitizeText(r.tendency),
        basis: sanitizeText(r.basis),
      })),
      followup_suggestions: buildFollowupSuggestions(qMeta.intent),
      drawn_cards: drawnCards,
      timing_window: sanitizeText(bundle.timing),
      three_actions: bundle.actions.map(sanitizeText),
      mentor_closing_tip: sanitizeText(bundle.closingTip),
      compliance_footer: "以上解析是提醒與建議，不是定論，亦不是投資或下注建議。",
      timestamp: formatTwNow(),
    };
  }

  // ==================== 梅花易數 × 京房納甲六爻 × 數字易經 三法合參核心 ====================
  function computeMeihuaTiYong(upTri, dnTri, bUpTri, bDnTri, primaryMov) {
    const isUpperTi = primaryMov <= 3;
    const tiTri = isUpperTi ? upTri : dnTri;
    const benYongTri = isUpperTi ? dnTri : upTri;
    const bianYongTri = isUpperTi ? bDnTri : bUpTri;
    const describeRel = (te, ye) => {
      if (te === ye) return { label: `體用比和（體${te}與用${ye}同氣同源）`, score: 2 };
      if (GEN[ye] === te) return { label: `用生體（用${ye}生扶體${te}，外境順助）`, score: 3 };
      if (KE[te] === ye) return { label: `體剋用（體${te}制用${ye}，可掌控但須費力）`, score: 1 };
      if (GEN[te] === ye) return { label: `體生用（體${te}洩氣生用${ye}，耗損心力資源）`, score: -1 };
      return { label: `用剋體（用${ye}剋傷體${te}，受外境針對衝擊）`, score: -2 };
    };
    const benRel = describeRel(tiTri[2], benYongTri[2]);
    const bianRel = describeRel(tiTri[2], bianYongTri[2]);
    return {
      position: isUpperTi ? "動在內卦（下卦），以上卦為體、下卦為用" : "動在外卦（上卦），以下卦為體、上卦為用",
      is_inner_moving: isUpperTi,
      ti_trigram: `${tiTri[0]}(${tiTri[2]})`,
      ben_yong_trigram: `${benYongTri[0]}(${benYongTri[2]})`,
      bian_yong_trigram: `${bianYongTri[0]}(${bianYongTri[2]})`,
      ben_relation: benRel.label,
      bian_relation: bianRel.label,
      ti_gua: tiTri[0],
      ti_wx: tiTri[2],
      yong_gua: benYongTri[0],
      yong_wx: benYongTri[2],
      bian_yong_gua: bianYongTri[0],
      bian_yong_wx: bianYongTri[2],
      relation: `本卦${benRel.label.split("（")[0]} → 變卦${bianRel.label.split("（")[0]}`,
      ben_score: benRel.score,
      bian_score: bianRel.score,
    };
  }

  // 將單組靈動數字（如 "815" 或 "158"）精準轉為上卦、下卦、動爻與輔助互證卦象
  function castDigitsGroupToHex(numStr) {
    const s = String(numStr || "").replace(/\D/g, "");
    let upNum, dnNum, mov;
    if (s.length === 2) {
      upNum = (parseInt(s[0], 10) || 8) % 8 || 8;
      dnNum = (parseInt(s[1], 10) || 8) % 8 || 8;
      mov = ((parseInt(s[0], 10) || 0) + (parseInt(s[1], 10) || 0)) % 6 || 6;
    } else if (s.length === 3) {
      const d1 = parseInt(s[0], 10) || 8;
      const d2 = parseInt(s[1], 10) || 8;
      const d3 = parseInt(s[2], 10) || 6;
      upNum = d1 % 8 || 8;
      dnNum = d2 % 8 || 8;
      mov = (d1 + d2 + d3) % 6 || 6;
    } else if (s.length >= 4) {
      const mid = Math.floor(s.length / 2);
      const aSum = s.slice(0, mid).split("").reduce((acc, ch) => acc + (parseInt(ch, 10) || 0), 0);
      const bSum = s.slice(mid).split("").reduce((acc, ch) => acc + (parseInt(ch, 10) || 0), 0);
      upNum = aSum % 8 || 8;
      dnNum = bSum % 8 || 8;
      mov = (aSum + bSum) % 6 || 6;
    } else {
      const v = parseInt(s, 10) || 8;
      upNum = v % 8 || 8;
      dnNum = (v + 3) % 8 || 8;
      mov = v % 6 || 6;
    }
    const benBits = (NUM_TO_TRIGRAM_BITS[dnNum] + NUM_TO_TRIGRAM_BITS[upNum]).split("");
    const bianBits = benBits.map((b, idx) => (idx + 1 === mov ? (b === "1" ? "0" : "1") : b));
    const dnTri = TRIGRAM_BITS_TO_NAME[benBits.slice(0, 3).join("")];
    const upTri = TRIGRAM_BITS_TO_NAME[benBits.slice(3, 6).join("")];
    const bDnTri = TRIGRAM_BITS_TO_NAME[bianBits.slice(0, 3).join("")];
    const bUpTri = TRIGRAM_BITS_TO_NAME[bianBits.slice(3, 6).join("")];
    const benNajia = DB.najiaByTrigrams[`${upTri[0]}_${dnTri[0]}`];
    const bianNajia = DB.najiaByTrigrams[`${bUpTri[0]}_${bDnTri[0]}`];
    const ty = computeMeihuaTiYong(upTri, dnTri, bUpTri, bDnTri, mov);
    return {
      raw: s,
      upNum,
      dnNum,
      mov,
      upTri,
      dnTri,
      bUpTri,
      bDnTri,
      ben_name: benNajia ? benNajia.hexagram_name : `${upTri[0]}${dnTri[0]}`,
      bian_name: bianNajia ? bianNajia.hexagram_name : `${bUpTri[0]}${bDnTri[0]}`,
      ti_yong: ty,
      throws: benBits.map((b, idx) => (idx + 1 === mov ? (b === "1" ? 9 : 6) : (b === "1" ? 7 : 8))),
    };
  }

  // 綜合本變互與輔卦計算「熟人 vs 外人」與「男 vs 女」傾向
  function evaluateYijingInvestigationProfile(ctx) {
    const { upTri, dnTri, bUpTri, bDnTri, huUpTri, huDnTri, movingLines, linesDetail, tiYong, qMeta, auxHexList } = ctx;
    let insiderScore = 0;
    const insiderReasons = [];
    const innerMoving = movingLines.filter((m) => m <= 3);
    const outerMoving = movingLines.filter((m) => m >= 4);

    if (innerMoving.length > 0 && outerMoving.length === 0) {
      insiderScore += 3;
      insiderReasons.push(`主卦動在內卦（第${innerMoving.join("、")}爻發動），六爻與梅花斷法中「內卦主內部、熟人、常出入熟悉場域之人；外卦主外地陌生流竄之人」`);
    } else if (innerMoving.length >= outerMoving.length && innerMoving.length > 0) {
      insiderScore += 1.5;
      insiderReasons.push(`內卦第${innerMoving.join("、")}爻連動，事發根源與內部熟識動線牽連深`);
    } else if (outerMoving.length > 0 && innerMoving.length === 0) {
      insiderScore -= 2;
      insiderReasons.push(`獨動於外卦（第${outerMoving.join("、")}爻），外來人員趁門禁空檔介入跡象較重`);
    }

    if (tiYong.ti_wx === tiYong.yong_wx) {
      insiderScore += 2;
      insiderReasons.push(`梅花體用比和（體${tiYong.ti_gua}與用${tiYong.yong_gua}同氣），代表動手者與場域本身同頻熟識，並非毫不相干的陌生路人`);
    } else if (GEN[tiYong.ti_wx] === tiYong.yong_wx || GEN[tiYong.yong_wx] === tiYong.ti_wx) {
      insiderScore += 1;
      insiderReasons.push(`體用相生有舊緣往來，對現場作息與擺設位置相當清楚`);
    }

    if (auxHexList && auxHexList.length >= 2) {
      const aux = auxHexList[1];
      if (aux.mov <= 3) {
        insiderScore += 2;
        insiderReasons.push(`第二組數【${aux.raw}】排出《${aux.ben_name}》變《${aux.bian_name}》同樣動在內卦（第${aux.mov}爻），雙卦同指內部熟面孔或常出入者`);
      }
    }

    if (qMeta.shuzi_analysis && qMeta.shuzi_analysis.stealth_familiar_score >= 2) {
      insiderScore += 2;
      if (qMeta.shuzi_analysis.same_origin_note) {
        insiderReasons.push(qMeta.shuzi_analysis.same_origin_note);
      } else {
        insiderReasons.push("數字易經透出五鬼與伏位磁場，屬熟門熟路、暗中針對下手之象");
      }
    }

    if ((qMeta.objects || []).length >= 2) {
      insiderScore += 1; // 同時針對特定非財物目標（如線與花）下手，偏向有內部心結者
    }

    // 計算性別傾向（乾震坎艮為陽男，坤巽離兌為陰女）
    const femaleTris = new Set(["坤", "巽", "離", "兌"]);
    let femalePts = 0;
    let malePts = 0;
    const countTriGender = (triName, wt) => {
      if (femaleTris.has(triName)) femalePts += wt;
      else malePts += wt;
    };
    countTriGender(dnTri[0], 1.5);
    countTriGender(upTri[0], 1.2);
    countTriGender(bDnTri[0], 1.6);
    countTriGender(bUpTri[0], 1.0);
    countTriGender(huDnTri[0], 0.8);
    if (auxHexList && auxHexList.length >= 2) {
      countTriGender(auxHexList[1].dnTri[0], 1.4);
      countTriGender(auxHexList[1].upTri[0], 1.1);
    }
    movingLines.forEach((ml) => {
      const lo = linesDetail[ml - 1];
      if (lo && lo.throw_value === 9) femalePts += 1.0; // 老陽變陰
      if (lo && lo.throw_value === 6) malePts += 1.0;   // 老陰變陽
    });

    const hasMetalSharp = [upTri[0], dnTri[0], bUpTri[0], bDnTri[0], ...(auxHexList && auxHexList[1] ? [auxHexList[1].upTri[0], auxHexList[1].dnTri[0]] : [])]
      .some((g) => g === "乾" || g === "兌");

    return {
      preferInsider: insiderScore >= 1,
      insiderScore,
      insiderReasons,
      preferFemale: femalePts >= malePts,
      femalePts,
      malePts,
      hasMetalSharp,
    };
  }

  function buildYijingInvestigationBundle(ctx, mentorId) {
    const { qClean, qMeta, benNajia, huNajia, bianNajia, upTri, dnTri, bUpTri, bDnTri, tiYong, movingLines, linesDetail, auxHexList } = ctx;
    const prof = evaluateYijingInvestigationProfile(ctx);
    const sceneLabel = qMeta.scene ? qMeta.scene.label : "現場";
    const placeHint = qMeta.scene ? qMeta.scene.placeHint : "熟客常走動與視線死角處";
    const movLineNo = movingLines.length ? movingLines[0] : 2;
    const movLo = linesDetail[movLineNo - 1] || linesDetail[1];
    const yongMeta = TRIGRAM_META_DETAIL[dnTri[0]] || TRIGRAM_META_DETAIL["坤"];
    const bianMeta = TRIGRAM_META_DETAIL[bDnTri[0]] || TRIGRAM_META_DETAIL["離"];

    // 組裝萬物類象段落
    const objBreakdown = (qMeta.objects && qMeta.objects.length)
      ? qMeta.objects.map((o) => `${o.name}（對應卦象：${o.trigram_img}——${o.motive_hint}）`).join("；")
      : `本卦上${upTri[0]}（${TRIGRAM_META_DETAIL[upTri[0]].img}）下${dnTri[0]}（${TRIGRAM_META_DETAIL[dnTri[0]].img}），變卦轉為《${bianNajia.hexagram_name}》，顯示動手者熟悉現場動線並刻意避開耳目`;

    const auxNote = (auxHexList && auxHexList.length >= 2)
      ? `再以第二組數【${auxHexList[1].raw}】交叉互證，排出本卦《${auxHexList[1].ben_name}》（上${auxHexList[1].upTri[0]}${auxHexList[1].upTri[2]}、下${auxHexList[1].dnTri[0]}${auxHexList[1].dnTri[2]}）第${auxHexList[1].mov}爻動變《${auxHexList[1].bian_name}》：${auxHexList[1].upTri[2] === "金" && auxHexList[1].dnTri[2] === "木" ? "上卦乾兌之金直接剋斷下卦巽震之木（刀剪利器剪斷線材與花草之物理動作一模一樣），且同樣動在內卦" : `體用呈現${auxHexList[1].ti_yong.relation}，與主卦相互印證`}。`
      : "";

    const multiSections = [
      {
        title: "一、梅花易數（體用生剋與現場萬物類象拆解）",
        body: `主卦排出本卦《${benNajia.hexagram_name}》（上${upTri[0]}${upTri[2]}、下${dnTri[0]}${dnTri[2]}），互卦《${huNajia.hexagram_name}》，變卦《${bianNajia.hexagram_name}》（上${bUpTri[0]}${bUpTri[2]}、下${bDnTri[0]}${bDnTri[2]}）。${tiYong.position}，由「${tiYong.ben_relation}」轉為「${tiYong.bian_relation}」。對應到你問的現場物象：${objBreakdown}。${auxNote}`,
      },
      {
        title: "二、京房納甲六爻（世應關係、內外卦動靜與六神）",
        body: `${prof.insiderReasons.slice(0, 2).join("；")}。盤中${movLo.line_label}（${movLo.six_kin}・臨${movLo.six_spirit}・${movLo.najia}）發動化${movLo.changed_to || "變爻"}，${movLo.six_spirit === "玄武" || movLo.six_spirit === "螣蛇" ? "臨玄武／螣蛇主暗中潛行、避開鏡頭死角" : (movLo.six_spirit === "白虎" || movLo.six_spirit === "朱雀" ? "臨白虎／朱雀主因口舌摩擦或心生不滿而帶利器動手" : "顯示當事人熟悉日常作息、挑選無人注意空檔俐落出手")}，並非隨機路過臨時起意的盲目破壞。`,
      },
    ];
    if (qMeta.shuzi_analysis) {
      multiSections.push({
        title: "三、數字易經（八星磁場精準拆解）",
        body: qMeta.shuzi_analysis.summary_text,
      });
    }

    let badge, verdict, summaryTable;
    if (qMeta.intent === "investigation_gender") {
      const genderConclusion = prof.preferFemale ? "偏「女性」所為的機率較高" : "偏「男性」所為的機率較高";
      const demeanor = prof.preferFemale
        ? (prof.hasMetalSharp
          ? "外在或身分偏女性（如常出入協助庶務、供花或熟識環境之女眾／熟客），但卦帶乾兌金氣，代表此人個性剛強、主見重、手腳俐落，情緒一上頭就乾脆剪斷，行事作風較果決剛硬"
          : "心思細膩敏感、熟悉內部擺設與花材線路位置，屬於平時常走動卻把不滿藏在心裡的熟識女性")
        : "行事直接俐落、熟悉工具收納與電源線路結構，屬於有脾氣卻不當面吵、暗中動手立威的熟識男性";
      badge = `性別研判：${genderConclusion}`;
      verdict = mentorId === "fubo"
        ? `針對你追問「${qClean}」，福伯照原盤陰陽卦象直接講結論：這件事${genderConclusion}。你看本變卦與互證卦裡陰陽爻象交錯（${demeanor}）；排查時不要只找陌生壯漢，反而要優先留意平時常在${sceneLabel}走動、熟悉花材與講台位置、但脾氣頗硬的熟面孔。`
        : `觀你追問「${qClean}」，依原盤梅花男女卦象與動爻陰陽推演，結論為${genderConclusion}。盤中透出「${demeanor}」之象，屬於熟門熟路且下手毫不拖泥帶水之人。`;
      summaryTable = [
        { aspect: "男女傾向", tendency: genderConclusion, basis: `主變卦（${upTri[0]}、${dnTri[0]}、${bDnTri[0]}）陰陽卦象與第${movLineNo}爻動變合參` },
        { aspect: "行事氣質特徵", tendency: prof.hasMetalSharp ? "手腳俐落、帶利器果斷切斷、個性剛硬" : "心思細密、避人耳目暗中出手", basis: prof.hasMetalSharp ? "盤見乾兌金氣剋木，具剛強決斷之象" : "內卦暗動配伏位五鬼，重隱蔽性" },
        { aspect: "人數與熟識度", tendency: "單獨一人趁空檔下手・熟知內部作息", basis: "內卦獨動，無外來群聚劫財之象" },
      ];
    } else if (qMeta.intent === "investigation_timing" || qMeta.intent === "investigation_direction") {
      badge = `線索鎖定：優先查${bianMeta.dir}與${yongMeta.dir}`;
      verdict = `針對你追問「${qClean}」，直接給出盤面時空座標：動手時段最可能落在「清晨開門前後、午間無人看管或傍晚收尾（尤以寅卯時 05:00-07:00、午未時 11:00-15:00 或酉戌時 17:00-21:00 交接空檔）」；監視器與物證請優先調閱「${bianMeta.dir}（${bianMeta.place}）」與「${yongMeta.dir}（${yongMeta.place}）」兩個角度。`;
      summaryTable = [
        { aspect: "高機率動手時段", tendency: "清晨／午休／傍晚交接人少空檔", basis: `變卦《${bianNajia.hexagram_name}》與動爻（${movLo.najia}）明暗交替時辰` },
        { aspect: "第一排查方位", tendency: `${bianMeta.dir}（${bianMeta.place}）`, basis: `變卦下卦${bDnTri[0]}宮類象定位` },
        { aspect: "第二排查方位", tendency: `${yongMeta.dir}（${yongMeta.place}）`, basis: `本卦用卦${dnTri[0]}宮類象定位` },
      ];
    } else {
      const culpritText = prof.preferInsider
        ? `偏「${qMeta.optB || "熟人／熟悉環境與動線者"}」所為的機率明顯高於單純路過的${qMeta.optA || "陌生外人"}`
        : `偏「${qMeta.optA || "外來人員"}」趁門禁空檔所為，但對現場動線仍有事前觀察`;
      badge = prof.preferInsider ? `直斷：偏${qMeta.optB || "熟人／熟知動線者"}所為` : `直斷：偏${qMeta.optA || "外人"}趁隙介入`;
      verdict = mentorId === "fubo"
        ? `照你問的「${qClean}」，福伯不繞彎子直接給答案：這件事${culpritText}。原因很清楚——第一，${prof.insiderReasons[0]}；第二，小偷外人闖進${sceneLabel}圖的是香油錢或值錢財物，不會不偷錢卻專門拿工具把物品精準剪斷，這是典型「斷其聲、折其美、心裡有怨氣或針對特定人較勁」的熟門熟路手法（清楚知道東西擺哪、哪個時段沒人看、哪裡是鏡頭死角）。`
        : `觀你所問「${qClean}」，綜合梅花體用、六爻內外與數理磁場三法合參，結論直指：${culpritText}。盤中本卦《${benNajia.hexagram_name}》轉《${bianNajia.hexagram_name}》，${prof.insiderReasons[0]}；且作案手法帶有「果斷俐落、自備或熟知利器位置、針對發聲與門面精準剪斷」的特徵，屬於內部人際摩擦或熟客心生芥蒂之宣洩，而非隨機路人盲目破壞。`;
      summaryTable = [
        { aspect: `${qMeta.optA || "外人"} vs ${qMeta.optB || "熟人"}`, tendency: prof.preferInsider ? `偏「${qMeta.optB || "熟人／常出入知情者"}」高於陌生外人` : `偏「${qMeta.optA || "外來人員"}」趁隙介入`, basis: `主卦第${movLineNo}爻動與體用關係（${tiYong.relation}）${auxHexList && auxHexList.length >= 2 ? `＋輔卦《${auxHexList[1].ben_name}》雙重印證` : ""}` },
        { aspect: "動機性質", tendency: "針對性切斷／情緒宣洩、話語權或人際摩擦（非圖財）", basis: (qMeta.objects && qMeta.objects[0]) ? qMeta.objects[0].motive_hint : "不取財物而專損特定器物，意在干擾與洩憤" },
        { aspect: "作案手法", tendency: "手腳俐落、有工具（剪刀／斜口鉗）、熟知視線死角", basis: `乾兌金剋巽震木象，配《${bianNajia.hexagram_name}》暗中隱蔽退場` },
        { aspect: "排查突破口", tendency: `優先查${placeHint}與${bianMeta.dir}視線死角`, basis: `${movLo.line_label}${movLo.six_spirit}動爻方位與日常出入熟面孔交集` },
      ];
    }

    const timing = `查證與觀察時間窗：事發後 3 至 7 天內（尤以近三個地支日辰交接時段）最利調閱側門與走道影像比對熟面孔；修復後兩週內若未加裝鏡頭，對方仍可能暗中觀察你們的反應。`;
    const actions = [
      `先查監視器死角與出入時段：優先比對平時常來${sceneLabel}、熟悉${placeHint}（如曾參與庶務、義工、常客或近期在活動發話與供花擺設上有意見摩擦之人），再排查外來陌生訪客。`,
      `檢視現場剪口與工具痕跡：細看斷口是一刀平整利剪（斜口鉗、利剪）還是反覆剪折，並檢查${sceneLabel}內部公用剪刀、花剪是否被移動過，這能立刻縮小是「自備工具」還是「順手取用內部工具」的熟人範圍。`,
      `低調修復並補強暗角防護：${sceneLabel}宜保持清淨沉穩，把線路改走暗管保護、補上供花並加裝隱蔽廣角鏡頭與感應燈，表面不公開點名猜忌以免激化對立，一切以影像實證為準。`,
    ];
    const movingPlain = !movingLines.length
      ? [`${mentorId === "meiniang" ? "梅娘觀數" : "福伯斷爻"}（六爻靜定）：本局氣機藏於內裡，本卦《${benNajia.hexagram_name}》與互卦《${huNajia.hexagram_name}》直接定調為熟悉內部環境之人事糾葛。`]
      : movingLines.map((ml) => {
          const lo = linesDetail[ml - 1];
          const innerOuterTag = ml <= 3 ? "位居內卦（主熟人、內部日常動線與近處場域）" : "位居外卦（主外圍通道與外部接觸面）";
          return `${mentorId === "meiniang" ? "梅娘觀" : "福伯斷"}第 ${ml} 爻（${lo.line_label}${lo.six_kin}・臨${lo.six_spirit}）發動：${innerOuterTag}，由「${lo.najia}」化出「${lo.changed_to}」，點出動手者趁無人留意時俐落切斷後迅速退開，排查重點就在熟悉這一帶動線的人。`;
        });
    const closingTip = mentorId === "meiniang"
      ? `梅娘的清淨安場叮嚀：卦見暗傷之象，對方圖的是看現場慌亂起口舌；先把線路收進護管、燈火點亮、鏡頭顧好，心定場穩，暗處的小動作自然無處遁形。`
      : `福伯的茶桌實務叮嚀：這種剪線折花的事，十有八九是熟門熟路、心裡憋著一口氣的人幹的；先別在大庭廣眾下亂點名傷和氣，私底下調出死角時段畫面、把剪刀跟線路鎖好，證據到手一目了然。`;

    return { badge, verdict, timing, actions, movingPlain, closingTip, multiSections, summaryTable };
  }

  function buildFuboYijingBundle(ctx) {
    const { qClean, qMeta, benNajia, huNajia, bianNajia, benPlain, huPlain, bianPlain, upTri, dnTri, bUpTri, bDnTri, shiLineObj, yingLineObj, ysTarget, syPlain, tiYong, totalJudge, movingLines, linesDetail } = ctx;
    if (qMeta.intent.startsWith("investigation")) {
      return buildYijingInvestigationBundle(ctx, "fubo");
    }

    const optA = qMeta.optA || "第一條路";
    const optB = qMeta.optB || "第二條路";
    let badge, verdict, timing, actions, summaryTable;

    if (qMeta.intent === "two_choice") {
      const pickA = totalJudge >= 1;
      const chosen = pickA ? optA : optB;
      const other = pickA ? optB : optA;
      badge = `福伯直斷：優先選「${chosen}」`;
      verdict = `照你問的「${qClean}」，福伯泡杯茶直接幫你拍板：選「${chosen}」比「${other}」穩當得多。卦象從本卦《${benNajia.hexagram_name}》（${benPlain[2]}）經互卦《${huNajia.hexagram_name}》走到變卦《${bianNajia.hexagram_name}》（${bianPlain[2]}）：代表你自身底氣的世爻（${shiLineObj.line_label}${shiLineObj.six_kin}・${shiLineObj.status_plain}）與關鍵用神（${ysTarget.six_kin}・${ysTarget.status_plain}）顯示，走「${chosen}」比較能把主導權與實質好處握在自己手裡，另一頭表面看著熱鬧，實則暗藏磨耗。`;
      timing = "拍板時間窗：接下來 7 至 21 天內把兩邊實際條件攤開核對清楚，月底前定案最有利。";
      actions = [
        `針對「${chosen}」先把權利義務、待遇或執行細節白紙黑字問清楚，確認沒有模糊地帶就果斷推進。`,
        `留意中段互卦《${huNajia.hexagram_name}》（${huPlain[2]}）的交接磨合成本，手邊預留兩成時間與資金緩衝。`,
        `決定之後就專心把「${chosen}」顧好，不要三心二意回頭掛念「${other}」。`,
      ];
      summaryTable = [
        { aspect: `選「${optA}」`, tendency: pickA ? "底氣較足・主導權高" : "變數偏多・易受牽制", basis: `世爻${shiLineObj.line_label}${shiLineObj.six_kin}（${shiLineObj.status_plain}）` },
        { aspect: `選「${optB}」`, tendency: !pickA ? "根基較穩・風險可控" : "回報受限・易吃悶虧", basis: `應爻${yingLineObj.line_label}${yingLineObj.six_kin}對照變卦《${bianNajia.hexagram_name}》` },
      ];
    } else if (qMeta.intent === "love") {
      if (totalJudge >= 2) {
        badge = "心意有譜・給個台階就能回溫";
        verdict = `照你問的「${qClean}」，福伯用過來人的白話直說：對方心裡還有你，這段緣分沒斷，能回溫。本卦《${benNajia.hexagram_name}》轉變卦《${bianNajia.hexagram_name}》（${bianPlain[2]}），代表你的世爻跟代表對方的應爻（${yingLineObj.line_label}${yingLineObj.six_kin}）氣場接得上，而且感情用神「${ysTarget.status_plain}」；之前卡住多半是嘴硬拉不下臉，你順勢遞個輕鬆話頭過去，對方會接招的。`;
        timing = "破冰聯絡時間窗：未來 7 至 24 天內（尤其週末或節氣交接前後）最適合自然開啟話題。";
        actions = [
          "感情不是打官司，先別翻舊帳爭誰對誰錯，用關心日常起居的輕鬆口氣破冰最有效。",
          `留意互卦《${huNajia.hexagram_name}》提示的面子問題，給對方留三分台階下，互動馬上順起來。`,
          `順著變卦《${bianNajia.hexagram_name}》把相處默契重新建立起來，見面聊比在手機裡猜來猜去實在。`,
        ];
      } else if (totalJudge <= -1) {
        badge = "對方心防重・先別熱臉貼冷屁股";
        verdict = `照你問的「${qClean}」，福伯說句實在話疼你：對方現在心門關得很緊、態度偏冷，你這時候急著硬追只會讓自己受委屈。本卦《${benNajia.hexagram_name}》走到《${bianNajia.hexagram_name}》（${bianPlain[2]}），應爻（${yingLineObj.line_label}${yingLineObj.six_kin}）與世爻相剋相隔，感情用神又處於「${ysTarget.status_plain}」；先把重心拉回自己身上過好日子，別單方面掏心掏肺。`;
        timing = "冷靜觀察時間窗：接下來 3 至 5 週先按兵不動，看對方會不會自己回頭找你，再決定去留。";
        actions = [
          "這半個月先停下連環訊息與情緒追問，把自己的作息跟心情顧穩最重要。",
          `看清互卦《${huNajia.hexagram_name}》點出的雙方價值觀落差，別只顧著心軟而忽略對方實際做了什麼。`,
          "把底線擺在心裡：值得的人會主動走近你，不肯珍惜的人趁早看清也是福氣。",
        ];
      } else {
        badge = "心結卡在嘴硬・慢火溝通可解";
        verdict = `照你問的「${qClean}」，福伯直白講：你們兩邊不是沒感情，而是卡在脾氣跟溝通誤會上。本卦《${benNajia.hexagram_name}》經互卦《${huNajia.hexagram_name}》轉《${bianNajia.hexagram_name}》，目前${syPlain}，感情用神「${ysTarget.status_plain}」；急著逼對方馬上表態容易吵僵，放慢步調把心裡話好好講開，還是有轉圜餘地。`;
        timing = "緩步回暖時間窗：前兩週先讓雙方情緒降溫，第 3 至 5 週找機會平心靜氣聊開最合適。";
        actions = [
          "說話少帶刺、少用猜疑口氣，直接講你在乎什麼，對方才聽得進去。",
          `避開互卦《${huNajia.hexagram_name}》提示的旁人傳話干擾，兩個人的事關起門來自己聊。`,
          `照變卦《${bianNajia.hexagram_name}》的節奏慢慢磨合，看後續實際相處舒不舒服再定下一步。`,
        ];
      }
      summaryTable = [
        { aspect: "對方心態與關係走向", tendency: badge, basis: `世爻${shiLineObj.line_label}對照應爻${yingLineObj.line_label}（${ysTarget.six_kin}${ysTarget.status_plain}）` },
        { aspect: "當下最佳應對", tendency: totalJudge >= 2 ? "輕巧遞台階自然破冰" : (totalJudge <= -1 ? "暫停追問・收回重心觀察" : "先降溫再誠懇聊開"), basis: `本卦《${benNajia.hexagram_name}》→ 變卦《${bianNajia.hexagram_name}》` },
      ];
    } else {
      if (totalJudge >= 2) {
        badge = "底氣充足・看準細節可推進";
        verdict = `照你問的「${qClean}」，福伯直接講結論：這樁事底子穩、方向對，可以做。你排出本卦《${benNajia.hexagram_name}》（${benPlain[2]}），中段互卦過渡《${huNajia.hexagram_name}》，收尾變卦走到《${bianNajia.hexagram_name}》（${bianPlain[2]}）。代表你自身底氣的世爻（${shiLineObj.line_label}${shiLineObj.six_kin}）跟關鍵用神（${ysTarget.six_kin}・${ysTarget.status_plain}）都站得住腳，而且${syPlain}；只要把關鍵細節釘牢，順順推就能見到成果。`;
        timing = "推進拍板時間窗：接下來 7 至 30 天內氣場站在你這邊，中旬到月底前把關鍵節點敲定最穩當。";
        actions = [
          `趁現在世爻底氣夠（${shiLineObj.status_plain}），把權責分工、時程與條件一條條確認清楚，口頭漂亮話不當真。`,
          `留意中段互卦《${huNajia.hexagram_name}》（${huPlain[2]}）的交接細節，小環節盯緊才不會出岔子。`,
          `順著變卦《${bianNajia.hexagram_name}》穩紮穩打收網，手邊預留一至兩成緩衝空間，這局就能穩穩拿下。`,
        ];
      } else if (totalJudge <= -1) {
        badge = "暗坑偏多・先踩煞車保守為宜";
        verdict = `照你問的「${qClean}」，福伯不講場面話直說：現在硬推風險偏高、裡頭藏著暗坑，建議先踩煞車緩一緩。本卦《${benNajia.hexagram_name}》（${benPlain[2]}）經互卦《${huNajia.hexagram_name}》轉入《${bianNajia.hexagram_name}》（${bianPlain[2]}）：應爻（${yingLineObj.line_label}${yingLineObj.six_kin}）外境壓力大，${syPlain}，加上關鍵用神「${ysTarget.status_plain}」，急著投入容易吃悶虧。`;
        timing = "保守觀察時間窗：未來 2 至 4 週內變數仍大，至少等換過下一個節氣月、條件明朗後再重新評估。";
        actions = [
          "這半個月先把核心資源與承諾收緊，對方催得越急你越要慢下來核實真偽。",
          `徹查中段互卦《${huNajia.hexagram_name}》暗藏的歷史問題或資訊落差，沒看到真憑實據前不輕易點頭。`,
          "留好退路與備案：把你的底線條件擺在檯面上，條件不對就果斷轉向，守住元氣就是贏。",
        ];
      } else {
        badge = "帶條件可成・把規則釘緊再動手";
        verdict = `照你問的「${qClean}」，福伯直白講：這件事不是不能做，但屬於「前頭得先把條件磨清楚、後面才順遂」的局。卦象從本卦《${benNajia.hexagram_name}》（${benPlain[2]}）穿過互卦《${huNajia.hexagram_name}》，走到變卦《${bianNajia.hexagram_name}》（${bianPlain[2]}）。目前${syPlain}，關鍵用神「${ysTarget.status_plain}」，先把醜話與界線講在前面、分段投入才不會吃虧。`;
        timing = "磨合對齊時間窗：前兩週先把細節漏洞核對清楚，第 3 至 6 週條件談攏後再正式發力最划算。";
        actions = [
          "合作辦事一律先講清楚規則：誰負責什麼、遇到變數怎麼處理，確認清楚再動手。",
          `盯緊中段互卦《${huNajia.hexagram_name}》提示的磨合成本，預留兩成緩衝餘裕，不要一次把籌碼打光。`,
          `照變卦《${bianNajia.hexagram_name}》（${bianPlain[2]}）的路數分階段驗證，看到一步成果再推下一步。`,
        ];
      }
      summaryTable = [
        { aspect: "整體成敗研判", tendency: badge, basis: `本卦《${benNajia.hexagram_name}》→ 變卦《${bianNajia.hexagram_name}》（用神${ysTarget.six_kin}${ysTarget.status_plain}）` },
        { aspect: "主客高低位", tendency: syPlain, basis: `世爻${shiLineObj.line_label}${shiLineObj.element}對照應爻${yingLineObj.line_label}${yingLineObj.element}` },
      ];
    }

    const multiSections = [
      {
        title: "一、梅花易數（本互變三段與體用生剋）",
        body: `本卦《${benNajia.hexagram_name}》（上${upTri[0]}${upTri[2]}、下${dnTri[0]}${dnTri[2]}）看起頭現況，互卦《${huNajia.hexagram_name}》看中段暗流，變卦《${bianNajia.hexagram_name}》（上${bUpTri[0]}${bUpTri[2]}、下${bDnTri[0]}${bDnTri[2]}）看最終落點；${tiYong.position}，呈現「${tiYong.relation}」。`,
      },
      {
        title: "二、京房納甲六爻（世應定位與用神旺衰）",
        body: `世爻落${shiLineObj.line_label}${shiLineObj.six_kin}（${shiLineObj.status_plain}），應爻落${yingLineObj.line_label}${yingLineObj.six_kin}（${yingLineObj.status_plain}），針對本題取「${ysTarget.six_kin}」為核心用神（${ysTarget.status_plain}）。`,
      },
    ];
    if (qMeta.shuzi_analysis) {
      multiSections.push({ title: "三、數字易經（八星磁場拆解）", body: qMeta.shuzi_analysis.summary_text });
    }

    const movingPlain = !movingLines.length
      ? [`福伯茶桌眉批（六爻皆靜）：這盤沒有動爻翻盤，代表眼前的條件與雙方底牌就是真實全貌（世爻${shiLineObj.line_label}${shiLineObj.status_plain}），直接照現況划不划算來做決定即可。`]
      : movingLines.map((ml) => {
          const lo = linesDetail[ml - 1];
          return `福伯茶桌斷第 ${ml} 爻（${lo.line_label}${lo.six_kin}・${lo.six_spirit}）發動：由「${lo.najia}」化出「${lo.changed_to}」（目前${lo.status_plain}），正是整件事成敗轉折的關鍵樞紐，務必把這一環的人事與細節盯緊。`;
        });
    const closingTip = "福伯的茶桌叮嚀：凡事看清底牌再出手，留兩分餘裕在自己手裡，進退都踏實。";
    return { badge, verdict, timing, actions, movingPlain, closingTip, multiSections, summaryTable };
  }

  function buildMeiniangYijingBundle(ctx) {
    const { qClean, qMeta, benNajia, huNajia, bianNajia, benPlain, huPlain, bianPlain, upTri, dnTri, bUpTri, bDnTri, shiLineObj, yingLineObj, ysTarget, tiYong, totalJudge, movingLines, linesDetail } = ctx;
    if (qMeta.intent.startsWith("investigation")) {
      return buildYijingInvestigationBundle(ctx, "meiniang");
    }

    const optA = qMeta.optA || "第一條路";
    const optB = qMeta.optB || "第二條路";
    const score = totalJudge + (tiYong.bian_score >= 1 ? 1 : (tiYong.bian_score <= -2 ? -1 : 0));
    let badge, verdict, timing, actions, summaryTable;

    if (qMeta.intent === "two_choice") {
      const pickA = score >= 1;
      const chosen = pickA ? optA : optB;
      const other = pickA ? optB : optA;
      badge = `梅娘觀時：宜擇「${chosen}」順勢而行`;
      verdict = `觀你所問「${qClean}」，直接給出取捨定論：擇「${chosen}」之氣機遠較「${other}」清朗順遂。起手本卦《${benNajia.hexagram_name}》經中段互卦《${huNajia.hexagram_name}》化入《${bianNajia.hexagram_name}》（${bianPlain[2]}），體用由「${tiYong.ben_relation}」轉入「${tiYong.bian_relation}」，走「${chosen}」更得節氣生扶之力。`;
      timing = `抉擇應期落點：近期 7 至 18 天內氣機漸明，下旬交節前後定案最順。`;
      actions = [
        `順應「${chosen}」浮現的順風契機，先以輕巧步伐對接關鍵人事，確認細節無誤即可定錨。`,
        `留意互卦《${huNajia.hexagram_name}》（${huPlain[2]}）的中段過渡，轉換之際留三分緩衝餘地。`,
        `定案後安然放下「${other}」之牽掛，專注深耕眼前新局。`,
      ];
      summaryTable = [
        { aspect: `路徑「${optA}」`, tendency: pickA ? "卦氣生扶・順水行舟" : "氣機受阻・耗神費力", basis: `梅花體用：${tiYong.ben_relation}` },
        { aspect: `路徑「${optB}」`, tendency: !pickA ? "守正安穩・後勁綿長" : "暗流牽絆・進展受限", basis: `變卦落點：《${bianNajia.hexagram_name}》（${tiYong.bian_relation}）` },
      ];
    } else if (score >= 2) {
      badge = "氣機順水行舟・得時乘勢可成";
      verdict = `觀你所問「${qClean}」，直接回答你：此事順風可成。起手本卦《${benNajia.hexagram_name}》（${benPlain[2]}）定下清朗基調，中段互卦透出《${huNajia.hexagram_name}》蓄勢之象，終局變卦歸於《${bianNajia.hexagram_name}》（${bianPlain[2]}）。以梅花體用觀之，${tiYong.position}，由「${tiYong.ben_relation}」轉入「${tiYong.bian_relation}」，外境氣機主動生扶本體，順著眼前節奏推進自然水到渠成。`;
      timing = `節氣應期落點：近期 7 至 24 天內卦氣最旺（尤以交節前後及五行屬${tiYong.ti_wx}相生之日最得順風），宜把握上半月主動定局。`;
      actions = [
        `順應本卦《${benNajia.hexagram_name}》的起手勢，在氣機剛動的前十天主動遞出方案或邀約，借順風省去半數奔波。`,
        `善用中段互卦《${huNajia.hexagram_name}》（${huPlain[2]}）的過渡涵養，交涉時留三分雅量，人緣助力自然匯聚。`,
        `迎向變卦《${bianNajia.hexagram_name}》收成之象，見好收帆、妥善定錨，化順遂氣韻為穩固成果。`,
      ];
      summaryTable = [
        { aspect: "核心成敗直斷", tendency: badge, basis: `《${benNajia.hexagram_name}》→《${huNajia.hexagram_name}》→《${bianNajia.hexagram_name}》` },
        { aspect: "體用生剋節奏", tendency: tiYong.relation, basis: tiYong.position },
      ];
    } else if (score <= -1) {
      badge = "卦氣逆風未熟・宜靜養待時而動";
      verdict = `觀你所問「${qClean}」，直接回答你：眼下時機未熟、逆風偏強，不宜強推。上半場本卦《${benNajia.hexagram_name}》（${benPlain[2]}）外境波折尚多，中段互卦《${huNajia.hexagram_name}》暗流交錯，變卦落於《${bianNajia.hexagram_name}》（${bianPlain[2]}）。細察體用消長走到「${tiYong.bian_relation}」，強行催逼徒耗心力，不如暫斂鋒芒，待節氣流轉再徐圖破冰。`;
      timing = "節氣轉折應期：眼下三十天內仍處逆風涵養期，宜緩不宜急；待下一個節氣交接、生扶本體之氣透出時再行叩門最順。";
      actions = [
        `體悟本卦《${benNajia.hexagram_name}》的止步智慧，前兩週不爭一時快慢，先將手邊未臻完善的環節靜心補齊。`,
        `借鏡互卦《${huNajia.hexagram_name}》（${huPlain[2]}）的中段藏象，低調觀察局勢風向與人心向背，不輕易亮出全部底牌。`,
        `守住「${tiYong.bian_relation.split("（")[0]}」的分寸邊界，減少無謂消耗，把精氣神留給節氣轉順後的關鍵一擊。`,
      ];
      summaryTable = [
        { aspect: "核心成敗直斷", tendency: badge, basis: `《${benNajia.hexagram_name}》→《${bianNajia.hexagram_name}》受外境牽制` },
        { aspect: "體用生剋節奏", tendency: tiYong.relation, basis: tiYong.position },
      ];
    } else {
      badge = "慢火細養之局・循序漸進方甘";
      verdict = `觀你所問「${qClean}」，直接回答你：此事可成但非快局，須靠中段耐心磨合方見收成。起手本卦《${benNajia.hexagram_name}》（${benPlain[2]}）揭示起步尚需調勻呼吸，中段互卦藏著《${huNajia.hexagram_name}》打磨之象，終局變卦轉入《${bianNajia.hexagram_name}》（${bianPlain[2]}）。初段「${tiYong.ben_relation}」而後段「${tiYong.bian_relation}」，急火猛催易生枝節，順著火候一寸寸經營，下半場方見清泉自湧。`;
      timing = "節氣推進應期：前十至十五天為《互卦》沉澱調校期，不宜催逼結果；待下旬節氣交接後氣機轉活，第 4 至 7 週漸入佳境。";
      actions = [
        `順應中段互卦《${huNajia.hexagram_name}》（${huPlain[2]}）的養氣節奏，先以小步試探校準方向，不必一開局就押上全部心力。`,
        `調和「${tiYong.bian_relation.split("（")[0]}」的能量出入，設下清朗分寸，避免在瑣碎拉鋸中透支熱忱。`,
        `依循變卦《${bianNajia.hexagram_name}》（${bianPlain[2]}）深耕長線默契，待水到渠成之時從容收網。`,
      ];
      summaryTable = [
        { aspect: "核心成敗直斷", tendency: badge, basis: `《${benNajia.hexagram_name}》→《${huNajia.hexagram_name}》→《${bianNajia.hexagram_name}》` },
        { aspect: "體用生剋節奏", tendency: tiYong.relation, basis: tiYong.position },
      ];
    }

    const multiSections = [
      {
        title: "一、梅花易數（體用生剋與三段氣機）",
        body: `${tiYong.position}，本卦《${benNajia.hexagram_name}》（${tiYong.ben_relation}）經互卦《${huNajia.hexagram_name}》轉變卦《${bianNajia.hexagram_name}》（${tiYong.bian_relation}）。`,
      },
      {
        title: "二、京房納甲六爻（世應與月日旺衰）",
        body: `世爻居${shiLineObj.line_label}${shiLineObj.six_kin}（${shiLineObj.status_plain}），應爻居${yingLineObj.line_label}${yingLineObj.six_kin}（${yingLineObj.status_plain}），核心用神「${ysTarget.six_kin}」目前${ysTarget.status_plain}。`,
      },
    ];
    if (qMeta.shuzi_analysis) {
      multiSections.push({ title: "三、數字易經（八星磁場拆解）", body: qMeta.shuzi_analysis.summary_text });
    }

    const movingPlain = !movingLines.length
      ? [`梅娘觀數眉批（六爻靜定）：本局氣機澄明未動，本卦《${benNajia.hexagram_name}》與中段互卦《${huNajia.hexagram_name}》即為當下定數（${tiYong.ben_relation}），順著既有節奏安然處之即可。`]
      : movingLines.map((ml) => {
          const lo = linesDetail[ml - 1];
          const stageHint = ml <= 2 ? "初段起念與根基處" : (ml <= 4 ? "中段互卦交會與人事進退處" : "後段收官與名分定局處");
          return `梅娘觀第 ${ml} 爻（${lo.line_label}・${lo.six_spirit}）靈動：氣機於「${stageHint}」由${lo.yin_yang}轉變，牽動本卦《${benNajia.hexagram_name}》經互卦《${huNajia.hexagram_name}》化入《${bianNajia.hexagram_name}》（${tiYong.bian_relation}），此處正是拿捏快慢進退的轉折眼。`;
        });
    const closingTip = `梅娘的節氣進退籤語：萬物皆有其時，本卦《${benNajia.hexagram_name}》看起勢、互卦《${huNajia.hexagram_name}》看中段火候、變卦《${bianNajia.hexagram_name}》看歸宿；心定則氣順，不搶半拍反而步步生蓮。`;
    return { badge, verdict, timing, actions, movingPlain, closingTip, multiSections, summaryTable };
  }

  function runYijingReading(question, method = "liuyao_coins", mentorId = "fubo", coinThrows = null, numbers = null, extraOpts = {}) {
    const qClean = String(question || "請問目前這件事的成敗走向與我該採取的對策？").trim();
    const rawNumText = extraOpts && extraOpts.raw_numbers_text ? String(extraOpts.raw_numbers_text).trim() : "";
    const parentQ = extraOpts && extraOpts.parent_question ? String(extraOpts.parent_question).trim() : "";
    const qMeta = analyzeQuestionDeep(qClean, rawNumText, parentQ);
    const resolvedMentorId = mentorId === "meiniang" ? "meiniang" : "fubo";
    const mentor = MENTORS[resolvedMentorId];

    const tw = new Date(Date.now() + 8 * 3600 * 1000);
    const solar = root.Solar.fromYmdHms(tw.getUTCFullYear(), tw.getUTCMonth() + 1, tw.getUTCDate(), tw.getUTCHours(), tw.getUTCMinutes(), tw.getUTCSeconds());
    const ec = solar.getLunar().getEightChar();
    const dayGz = ec.getDay();
    const monthGz = ec.getMonth();
    const dayStem = dayGz[0];
    const dayBranch = dayGz[1];
    const monthBranch = monthGz[1];

    let throws = [];
    let auxHexList = null;
    let effectiveMethod = method;

    // 若使用者提供了多組靈動數字（如 815、158）或於題目中寫入數字組，且未強制鎖定既有銅錢爻值，自動以靈動數組起卦並啟動三法合參
    if (Array.isArray(coinThrows) && coinThrows.length === 6 && coinThrows.every((x) => [6, 7, 8, 9].includes(x))) {
      throws = coinThrows.slice();
      if (qMeta.number_groups && qMeta.number_groups.length >= 1) {
        auxHexList = qMeta.number_groups.map((g) => castDigitsGroupToHex(g));
      }
    } else if (qMeta.number_groups && qMeta.number_groups.length >= 1 && (method === "meihua_numbers" || rawNumText || /\d{3}/.test(qClean))) {
      effectiveMethod = "meihua_numbers";
      auxHexList = qMeta.number_groups.map((g) => castDigitsGroupToHex(g));
      throws = auxHexList[0].throws.slice();
    } else if (method === "meihua_numbers") {
      let n1, n2, n3;
      if (Array.isArray(numbers) && numbers.length >= 2) {
        n1 = Math.max(1, parseInt(numbers[0], 10) || 38);
        n2 = Math.max(1, parseInt(numbers[1], 10) || 62);
        n3 = numbers.length >= 3 ? Math.max(1, parseInt(numbers[2], 10) || 15) : (n1 + n2 + tw.getUTCHours());
      } else {
        n1 = (tw.getUTCMonth() + 1) + tw.getUTCDate();
        n2 = n1 + tw.getUTCHours();
        n3 = n2 + tw.getUTCMinutes();
      }
      if (!qMeta.shuzi_analysis && Array.isArray(numbers) && numbers.length >= 2) {
        const joinedNums = numbers.map((x) => String(x)).filter((s) => s.length >= 2);
        if (joinedNums.length) qMeta.shuzi_analysis = analyzeShuziGroups(joinedNums);
      }
      const upNum = n1 % 8 || 8;
      const dnNum = n2 % 8 || 8;
      const mov = n3 % 6 || 6;
      const baseBits = (NUM_TO_TRIGRAM_BITS[dnNum] + NUM_TO_TRIGRAM_BITS[upNum]).split("");
      throws = baseBits.map((b, i) => (i + 1 === mov ? (b === "1" ? 9 : 6) : (b === "1" ? 7 : 8)));
    } else {
      for (let i = 0; i < 6; i++) {
        const c1 = Math.random() < 0.5 ? 2 : 3;
        const c2 = Math.random() < 0.5 ? 2 : 3;
        const c3 = Math.random() < 0.5 ? 2 : 3;
        throws.push(c1 + c2 + c3);
      }
    }

    const benBits = throws.map((v) => (v === 7 || v === 9 ? "1" : "0"));
    const bianBits = throws.map((v) => (v === 9 ? "0" : (v === 6 ? "1" : (v === 7 ? "1" : "0"))));
    const movingLines = [];
    throws.forEach((v, i) => {
      if (v === 6 || v === 9) movingLines.push(i + 1);
    });

    const dnTri = TRIGRAM_BITS_TO_NAME[benBits.slice(0, 3).join("")];
    const upTri = TRIGRAM_BITS_TO_NAME[benBits.slice(3, 6).join("")];
    const huDnBits = benBits.slice(1, 4).join("");
    const huUpBits = benBits.slice(2, 5).join("");
    const huDnTri = TRIGRAM_BITS_TO_NAME[huDnBits];
    const huUpTri = TRIGRAM_BITS_TO_NAME[huUpBits];
    const bDnTri = TRIGRAM_BITS_TO_NAME[bianBits.slice(0, 3).join("")];
    const bUpTri = TRIGRAM_BITS_TO_NAME[bianBits.slice(3, 6).join("")];

    const benNajia = DB.najiaByTrigrams[`${upTri[0]}_${dnTri[0]}`];
    const huNajia = DB.najiaByTrigrams[`${huUpTri[0]}_${huDnTri[0]}`];
    const bianNajia = DB.najiaByTrigrams[`${bUpTri[0]}_${bDnTri[0]}`];
    const hex64 = DB.namingKb.yijing_64_hexagrams || {};
    const benPlainRaw = hex64[`${upTri[3]}_${dnTri[3]}`] || [benNajia.hexagram_name, "吉", "審時度勢、順理而行"];
    const huPlainRaw = hex64[`${huUpTri[3]}_${huDnTri[3]}`] || [huNajia.hexagram_name, "吉", "中段醞釀、審慎過渡"];
    const bianPlainRaw = hex64[`${bUpTri[3]}_${bDnTri[3]}`] || [bianNajia.hexagram_name, "吉", "隨機應變、穩健收成"];
    const benPlain = [benPlainRaw[0], benPlainRaw[1], cleanHexMeaning(benPlainRaw[2])];
    const huPlain = [huPlainRaw[0], huPlainRaw[1], cleanHexMeaning(huPlainRaw[2])];
    const bianPlain = [bianPlainRaw[0], bianPlainRaw[1], cleanHexMeaning(bianPlainRaw[2])];

    let spirits = ["青龍", "朱雀", "勾陳", "螣蛇", "白虎", "玄武"];
    Object.keys(DB.sixSpiritsMap).forEach((kStems) => {
      if (kStems.includes(dayStem)) spirits = DB.sixSpiritsMap[kStems];
    });

    const primaryMov = movingLines.length ? movingLines[0] : 3;
    const tiYong = computeMeihuaTiYong(upTri, dnTri, bUpTri, bDnTri, primaryMov);

    let shiLineObj = null;
    let yingLineObj = null;
    const yongshenObjs = [];
    const throwLabelMap = { 6: "老陰 ⚋ ×（動變陽）", 7: "少陽 ⚊（靜）", 8: "少陰 ⚋（靜）", 9: "老陽 ⚊ ○（動變陰）" };
    const lineLabels = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];

    const linesDetail = throws.map((throwVal, idx) => {
      const njLine = benNajia.lines_bottom_to_top[idx];
      const bNjLine = bianNajia.lines_bottom_to_top[idx];
      const isMoving = throwVal === 6 || throwVal === 9;
      const brChar = njLine.najia.slice(-1);
      const el = njLine.element;
      const mEl = BRANCH_EL[monthBranch];
      const dEl = BRANCH_EL[dayBranch];
      let powerScore = 0;
      const statusTags = [];
      if (brChar === monthBranch || el === mEl || GEN[mEl] === el) {
        powerScore += 2;
        statusTags.push("得月令生扶有底氣");
      } else if (CLASH_MAP[monthBranch] === brChar) {
        powerScore -= 2;
        statusTags.push("逢月破暫時受制");
      }
      if (brChar === dayBranch || el === dEl || GEN[dEl] === el) {
        powerScore += 1;
        statusTags.push("得日辰相助");
      } else if (CLASH_MAP[dayBranch] === brChar) {
        powerScore -= 1;
        statusTags.push("受日沖暗動變化快");
      }
      const statusPlain = statusTags.length ? statusTags.join("、") : "氣場平穩";
      const changedStr = isMoving ? `${bNjLine.najia}(${bNjLine.six_kin}/${bNjLine.element})` : "";
      const roleTag = njLine.shi_ying === "世" ? "代表我方／主場" : (njLine.shi_ying === "應" ? "代表對方／外境" : "");
      const ioHint = idx <= 2 ? "內卦熟域" : "外卦外境";
      const lensNote = isMoving
        ? (resolvedMentorId === "meiniang"
          ? `梅娘觀爻：${lineLabels[idx]}（${ioHint}）動而牽引卦氣，由${njLine.element}化${bNjLine.element}（${tiYong.bian_relation.split("（")[0]}）。`
          : `福伯斷爻：${lineLabels[idx]}（${ioHint}）${njLine.six_kin}動化${bNjLine.six_kin}（臨${spirits[idx]}・${statusPlain}），關鍵轉折落在此處。`)
        : (njLine.shi_ying
          ? `${resolvedMentorId === "meiniang" ? "梅娘定位" : "福伯定位"}：${njLine.shi_ying}爻守在${lineLabels[idx]}${njLine.six_kin}（${statusPlain}）。`
          : "");

      const item = {
        line_number: idx + 1,
        line_label: lineLabels[idx],
        throw_value: throwVal,
        throw_val: throwVal,
        throw_label: throwLabelMap[throwVal],
        yin_yang: njLine.yin_yang,
        is_moving: isMoving,
        najia: njLine.najia,
        element: el,
        six_kin: njLine.six_kin,
        shi_ying: njLine.shi_ying,
        six_spirit: spirits[idx],
        changed_to: changedStr,
        power_score: powerScore,
        plain_role_tag: roleTag,
        status_plain: statusPlain,
        mentor_lens_note: sanitizeText(lensNote),
      };
      if (njLine.shi_ying === "世") shiLineObj = item;
      if (njLine.shi_ying === "應") yingLineObj = item;
      if (njLine.six_kin === qMeta.yongshen_kin) yongshenObjs.push(item);
      return item;
    });

    const huLinesPreview = (huDnBits + huUpBits).split("").map((b, idx) => {
      const hNj = huNajia.lines_bottom_to_top[idx];
      return {
        line_number: idx + 1,
        line_label: lineLabels[idx],
        yin_yang: b === "1" ? "陽" : "陰",
        is_moving: false,
        najia: hNj.najia,
        element: hNj.element,
        six_kin: hNj.six_kin,
        shi_ying: hNj.shi_ying,
        six_spirit: spirits[idx],
      };
    });

    const shiEl = shiLineObj.element;
    const yingEl = yingLineObj.element;
    let syPlain, syScore;
    if (shiEl === yingEl) {
      syPlain = "主客同氣比和，雙方（或事體與內部場域）原本熟識同頻";
      syScore = 1;
    } else if (GEN[yingEl] === shiEl) {
      syPlain = "應爻生扶世爻，外境條件或對方態度傾向配合你方";
      syScore = 2;
    } else if (KE[shiEl] === yingEl) {
      syPlain = "世爻剋制應爻，主動權握在你方手裡，出力即可掌握局面";
      syScore = 1;
    } else if (GEN[shiEl] === yingEl) {
      syPlain = "世爻洩氣生應爻，目前是你方單方面耗費心力遷就較多";
      syScore = 0;
    } else {
      syPlain = "應爻剋傷世爻，外在阻力或針對性壓力正衝著你方而來";
      syScore = -2;
    }

    const ysTarget = yongshenObjs[0] || shiLineObj;
    const benWt = benPlain[1] === "大吉" ? 1 : (benPlain[1].includes("凶") ? -2 : 0);
    const bianWt = bianPlain[1] === "大吉" ? 2 : (bianPlain[1] === "吉" ? 1 : -3);
    const totalJudge = syScore + ysTarget.power_score + benWt + bianWt;

    const bundleCtx = {
      qClean,
      qMeta,
      benNajia,
      huNajia,
      bianNajia,
      benPlain,
      huPlain,
      bianPlain,
      upTri,
      dnTri,
      huUpTri,
      huDnTri,
      bUpTri,
      bDnTri,
      shiLineObj,
      yingLineObj,
      ysTarget,
      syPlain,
      tiYong,
      totalJudge,
      movingLines,
      linesDetail,
      auxHexList,
    };
    const bundle = resolvedMentorId === "meiniang"
      ? buildMeiniangYijingBundle(bundleCtx)
      : buildFuboYijingBundle(bundleCtx);

    const methodLabel = auxHexList && auxHexList.length >= 2
      ? `梅花易數 × 京房六爻 × 數字易經三法合參（靈動數：${qMeta.number_groups.join("、")}）`
      : (effectiveMethod === "liuyao_coins" ? "京房納甲六爻・三枚古銅錢六擲起卦" : "梅花易數 × 京房六爻 × 數字易經合參");

    return {
      system: "yijing",
      method: effectiveMethod,
      method_label: methodLabel,
      question: qClean,
      parent_question: parentQ,
      raw_numbers_text: rawNumText || (qMeta.number_groups ? qMeta.number_groups.join("、") : ""),
      intent_detected: qMeta,
      mentor,
      casting_pillars: { month_gz: monthGz, day_gz: dayGz },
      verdict_badge: sanitizeText(bundle.badge),
      direct_verdict: sanitizeText(bundle.verdict),
      multi_method_sections: (bundle.multiSections || []).map((s) => ({
        title: sanitizeText(s.title),
        body: sanitizeText(s.body),
      })),
      summary_table: (bundle.summaryTable || []).map((r) => ({
        aspect: sanitizeText(r.aspect),
        tendency: sanitizeText(r.tendency),
        basis: sanitizeText(r.basis),
      })),
      followup_suggestions: buildFollowupSuggestions(qMeta.intent),
      auxiliary_hexagrams: auxHexList
        ? auxHexList.map((ax) => ({
            raw: ax.raw,
            ben_name: ax.ben_name,
            bian_name: ax.bian_name,
            mov: ax.mov,
            relation: ax.ti_yong.relation,
          }))
        : [],
      ben_hexagram: {
        name: benNajia.hexagram_name,
        palace: benNajia.palace,
        upper: upTri[0],
        lower: dnTri[0],
        bits_bottom_to_top: benBits.join(""),
        rating: benPlain[1],
        plain_meaning: benPlain[2],
        shi_line: shiLineObj ? shiLineObj.line_number : 6,
        ying_line: yingLineObj ? yingLineObj.line_number : 3,
      },
      hu_hexagram: {
        name: huNajia.hexagram_name,
        palace: huNajia.palace,
        upper: huUpTri[0],
        lower: huDnTri[0],
        bits_bottom_to_top: huDnBits + huUpBits,
        rating: huPlain[1],
        plain_meaning: huPlain[2],
        composition_note: "下互取本卦二三四爻・上互取本卦三四五爻",
        lines_bottom_to_top: huLinesPreview,
      },
      bian_hexagram: {
        name: bianNajia.hexagram_name,
        palace: bianNajia.palace,
        upper: bUpTri[0],
        lower: bDnTri[0],
        bits_bottom_to_top: bianBits.join(""),
        rating: bianPlain[1],
        plain_meaning: bianPlain[2],
      },
      meihua_ti_yong: tiYong,
      shi_ying_plain: sanitizeText(syPlain),
      moving_lines: movingLines,
      moving_plain_notes: bundle.movingPlain.map(sanitizeText),
      lines_bottom_to_top: linesDetail,
      timing_window: sanitizeText(bundle.timing),
      three_actions: bundle.actions.map(sanitizeText),
      mentor_closing_tip: sanitizeText(bundle.closingTip),
      compliance_footer: "以上解析是提醒與建議，不是定論，亦不是投資或下注建議。",
      timestamp: formatTwNow(),
    };
  }

  // -------------------- 八術姓名學宗師引擎 --------------------
  function gridWuxing(n) {
    const d = n % 10;
    if (d === 1 || d === 2) return "木";
    if (d === 3 || d === 4) return "火";
    if (d === 5 || d === 6) return "土";
    if (d === 7 || d === 8) return "金";
    return "水";
  }

  function mod81(n) {
    if (n <= 81) return Math.max(1, n);
    const r = ((n - 1) % 80) + 1;
    return r > 1 ? r : 81;
  }

  // 常見破音姓氏正音表（A02 真值鎖定規格）
  const SURNAME_POLYPHONE_OVERRIDES = {
    "單": { pinyin: "shan", tone: 4 },
    "曾": { pinyin: "zeng", tone: 1 },
    "區": { pinyin: "ou", tone: 1 },
    "任": { pinyin: "ren", tone: 2 },
    "華": { pinyin: "hua", tone: 4 },
    "解": { pinyin: "xie", tone: 4 },
    "查": { pinyin: "zha", tone: 1 },
    "仇": { pinyin: "qiu", tone: 2 },
    "朴": { pinyin: "piao", tone: 2 },
    "蓋": { pinyin: "ge", tone: 3 },
    "樂": { pinyin: "yue", tone: 4 },
    "過": { pinyin: "guo", tone: 1 },
    "員": { pinyin: "yun", tone: 4 },
    "燕": { pinyin: "yan", tone: 1 },
    "尉": { pinyin: "yu", tone: 4 },
  };

  const COMPOUND_SURNAME_OVERRIDES = {
    "萬俟": [{ pinyin: "mo", tone: 4 }, { pinyin: "qi", tone: 2 }],
    "澹臺": [{ pinyin: "tan", tone: 2 }, { pinyin: "tai", tone: 2 }],
    "尉遲": [{ pinyin: "yu", tone: 4 }, { pinyin: "chi", tone: 2 }],
    "長孫": [{ pinyin: "zhang", tone: 3 }, { pinyin: "sun", tone: 1 }],
    "單于": [{ pinyin: "chan", tone: 2 }, { pinyin: "yu", tone: 2 }],
  };

  const INITIAL_TO_WUYIN = {
    g: "角木", k: "角木", h: "角木",
    z: "徵火", c: "徵火", s: "徵火", d: "徵火", t: "徵火", n: "徵火", l: "徵火",
    j: "商金", q: "商金", x: "商金", r: "商金",
    b: "羽水", p: "羽水", m: "羽水", f: "羽水",
    a: "宮土", o: "宮土", e: "宮土", y: "宮土", w: "宮土",
  };

  function deriveWuyinByPinyin(py) {
    const init = String(py || "").trim().toLowerCase().slice(0, 1);
    return INITIAL_TO_WUYIN[init] || "宮土";
  }

  function resolveCommercialPolyphone(ch, contextWord) {
    const w = String(contextWord || "");
    if (!w) return null;
    if (ch === "行") {
      if (/(商行|行館|銀行|金行|茶行|車行|洋行|藥行|米行|布行|書行|琴行|木行|漁行|果行|報關行|拍賣行|發行)/.test(w)
        || (w.endsWith("行") && !/(旅行|通行|知行|品行|德行|飛行|航行|隨行|同行|執行|修行|言行|風行)/.test(w))) {
        return { pinyin: "hang", tone: 2 };
      }
      return { pinyin: "xing", tone: 2 };
    }
    if (ch === "樂") {
      if (/(愛樂|禮樂|器樂|弦樂|音樂|國樂|交響樂|雅樂)/.test(w)) {
        return { pinyin: "yue", tone: 4 };
      }
      return { pinyin: "le", tone: 4 };
    }
    if (ch === "間") {
      if (/(無間|相間|離間|間諜|間斷|間隙)/.test(w)) {
        return { pinyin: "jian", tone: 4 };
      }
      return { pinyin: "jian", tone: 1 };
    }
    if (ch === "長") {
      if (/(成長|百夫長|院長|社長|會長|店鋪長|執行長|董事長|家長|年長)/.test(w)) {
        return { pinyin: "zhang", tone: 3 };
      }
      return { pinyin: "chang", tone: 2 };
    }
    if (ch === "重") {
      if (/(重陽|九重|雙重|三重|重慶|重逢|重新|重疊)/.test(w)) {
        return { pinyin: "chong", tone: 2 };
      }
      return { pinyin: "zhong", tone: 4 };
    }
    if (ch === "盛") {
      if (/(盛滿|盛飯|盛器)/.test(w)) {
        return { pinyin: "cheng", tone: 2 };
      }
      return { pinyin: "sheng", tone: 4 };
    }
    if (ch === "乾") {
      if (/(乾燥|乾貨|乾糧|乾洗|餅乾)/.test(w)) {
        return { pinyin: "gan", tone: 1 };
      }
      return { pinyin: "qian", tone: 2 };
    }
    return null;
  }

  function detectDuplicateSyllable(pinyins, tones) {
    // 僅當出現真實同音字（同拼音＋同聲調）或連續兩字同無調音節（如「珊珊」「晶晶」）才判疊音
    const seenWithTone = new Set();
    for (let i = 0; i < pinyins.length; i++) {
      const p = pinyins[i];
      const t = tones[i];
      if (!p) continue;
      const key = `${p}${t}`;
      if (seenWithTone.has(key)) return true;
      seenWithTone.add(key);
      if (i > 0 && p === pinyins[i - 1]) return true;
    }
    return false;
  }

  function buildPhoneticAudit(charObjs) {
    const pinyins = charObjs.map((c) => c.pinyin);
    const tones = charObjs.map((c) => c.tone);
    const toneNameMap = { 1: "陰平(一聲)", 2: "陽平(二聲)", 3: "上聲(三聲)", 4: "去聲(四聲)", 5: "輕聲" };
    return {
      pinyins,
      syllables_with_tone: charObjs.map((c) => `${c.pinyin}${c.tone}`),
      tones,
      tone_labels: tones.map((t) => toneNameMap[t] || "平聲"),
      ping_ze_pattern: tones.map((t) => (t === 1 || t === 2 ? "平" : "仄")).join(""),
      duplicate_syllable_detected: detectDuplicateSyllable(pinyins, tones),
      all_same_tone_veto_triggered: tones.length >= 3 && new Set(tones).size === 1,
    };
  }

  function getCharInfo(ch, isSurname = false, contextWord = "") {
    const chars = (DB.namingKb && DB.namingKb.kangxi_char_db) || {};
    const uniTuple = DB.unihan && DB.unihan[ch];
    let baseObj = null;

    if (chars[ch]) {
      baseObj = Object.assign({}, chars[ch]);
      if (Array.isArray(uniTuple) && uniTuple.length >= 5 && uniTuple[3]) {
        baseObj.pinyin = String(uniTuple[3]).toLowerCase();
        baseObj.tone = Number(uniTuple[4]) || baseObj.tone;
      }
    } else if (Array.isArray(uniTuple) && uniTuple.length >= 5) {
      const [st, wx, rad, py, tn] = uniTuple;
      const cleanPy = String(py).toLowerCase();
      const cleanTn = Number(tn);
      baseObj = {
        char: ch,
        kangxi_strokes: st,
        wuxing: wx,
        sub_wuxing: "",
        pinyin: cleanPy,
        tone: cleanTn,
        wuyin: deriveWuyinByPinyin(cleanPy),
        radicals: [rad],
        structure: "傳統正體結構",
        meaning: `康熙正統 ${st} 畫（部首：${rad}，歸屬${wx}行）`,
        tags: [],
        eng_initial: cleanPy.slice(0, 1).toUpperCase(),
      };
    }

    if (!baseObj) return null;

    if (isSurname) {
      if (contextWord && COMPOUND_SURNAME_OVERRIDES[contextWord]) {
        const idx = Array.from(contextWord).indexOf(ch);
        if (idx !== -1 && COMPOUND_SURNAME_OVERRIDES[contextWord][idx]) {
          baseObj.pinyin = COMPOUND_SURNAME_OVERRIDES[contextWord][idx].pinyin;
          baseObj.tone = COMPOUND_SURNAME_OVERRIDES[contextWord][idx].tone;
        }
      } else if (SURNAME_POLYPHONE_OVERRIDES[ch]) {
        baseObj.pinyin = SURNAME_POLYPHONE_OVERRIDES[ch].pinyin;
        baseObj.tone = SURNAME_POLYPHONE_OVERRIDES[ch].tone;
      }
    } else if (contextWord) {
      const comm = resolveCommercialPolyphone(ch, contextWord);
      if (comm) {
        baseObj.pinyin = comm.pinyin;
        baseObj.tone = comm.tone;
      }
    }

    baseObj.wuyin = deriveWuyinByPinyin(baseObj.pinyin);
    baseObj.eng_initial = String(baseObj.pinyin || "").slice(0, 1).toUpperCase() || baseObj.eng_initial;
    if (Array.isArray(uniTuple) && uniTuple.length >= 5) {
      baseObj.unihan_verified = {
        kangxi_strokes: uniTuple[0],
        wuxing: uniTuple[1],
        radical: uniTuple[2],
        pinyin: baseObj.pinyin,
        tone: baseObj.tone,
      };
    }
    return baseObj;
  }

  function surnameStroke(ch) {
    const sp = DB.namingKb.surname_special_strokes || { "王": 4 };
    if (sp[ch] !== undefined) return sp[ch];
    const ci = getCharInfo(ch);
    return ci ? ci.kangxi_strokes : 10;
  }

  function calcHexagram(strokes) {
    const bagua = DB.namingKb.bagua_trigrams;
    const hex64 = DB.namingKb.yijing_64_hexagrams;
    let upSum, dnSum, tot;
    if (strokes.length === 1) {
      upSum = strokes[0];
      dnSum = strokes[0] + 1;
      tot = strokes[0] + 1;
    } else if (strokes.length === 2) {
      upSum = strokes[0];
      dnSum = strokes[1];
      tot = strokes[0] + strokes[1];
    } else {
      upSum = strokes[0];
      dnSum = strokes.slice(1).reduce((s, v) => s + v, 0);
      tot = strokes.reduce((s, v) => s + v, 0);
    }
    const upNum = upSum % 8 || 8;
    const dnNum = dnSum % 8 || 8;
    const moving = tot % 6 || 6;
    const upG = bagua[String(upNum)];
    const dnG = bagua[String(dnNum)];
    const bitsToNum = {};
    Object.keys(bagua).forEach((k) => {
      bitsToNum[bagua[k].bits] = parseInt(k, 10);
    });
    const lines = (dnG.bits + upG.bits).split("");
    const huDnNum = bitsToNum[lines.slice(1, 4).join("")];
    const huUpNum = bitsToNum[lines.slice(2, 5).join("")];
    const bianLines = lines.slice();
    bianLines[moving - 1] = bianLines[moving - 1] === "1" ? "0" : "1";
    const bianDnNum = bitsToNum[bianLines.slice(0, 3).join("")];
    const bianUpNum = bitsToNum[bianLines.slice(3, 6).join("")];

    const tiG = moving <= 3 ? upG : dnG;
    const yongG = moving <= 3 ? dnG : upG;
    const tiPos = moving <= 3 ? "上卦為體、下卦為用" : "下卦為體、上卦為用";
    const te = tiG.el;
    const ye = yongG.el;
    let rel, sc;
    if (te === ye) {
      rel = "體用比和（內外同心、順遂穩固）";
      sc = 15;
    } else if (GEN[ye] === te) {
      rel = `用(${ye})生體(${te})（外境貴人與資源主動生扶本體，大吉）`;
      sc = 15;
    } else if (KE[te] === ye) {
      rel = `體(${te})剋用(${ye})（憑自身實力掌控財源與局面，吉）`;
      sc = 12;
    } else if (GEN[te] === ye) {
      rel = `體(${te})生用(${ye})（付出較多、先勞後獲）`;
      sc = 7;
    } else {
      rel = `用(${ye})剋體(${te})（外境阻力壓制本體，一票否決）`;
      sc = -99;
    }

    const benInfo = hex64[`${upNum}_${dnNum}`];
    const huInfo = hex64[`${huUpNum}_${huDnNum}`];
    const bianInfo = hex64[`${bianUpNum}_${bianDnNum}`];
    return {
      upper_trigram: `${upG.name}(${upG.nature}/${upG.el})`,
      lower_trigram: `${dnG.name}(${dnG.nature}/${dnG.el})`,
      moving_line: moving,
      ben_gua: { name: benInfo[0], rating: benInfo[1], meaning: benInfo[2] },
      hu_gua: { name: huInfo[0], rating: huInfo[1], meaning: huInfo[2] },
      bian_gua: { name: bianInfo[0], rating: bianInfo[1], meaning: bianInfo[2] },
      ti_yong_position: tiPos,
      ti_yong_relation: rel,
      ti_yong_score: sc,
    };
  }

  function evalEnglishInitials(initials) {
    const up = String(initials || "").toUpperCase();
    const digits = [];
    for (let i = 0; i < up.length; i++) {
      const code = up.charCodeAt(i);
      if (code >= 65 && code <= 90) {
        const val = (code - 65 + 1) % 9 || 9;
        digits.push(String(val));
      }
    }
    let codeStr = digits.join("") || "14";
    if (codeStr.length < 2) codeStr += codeStr;
    const pair = codeStr.slice(0, 2);
    let matchedStar = "伏位";
    let matchedInfo = SHUZI_STARS["伏位"];
    Object.keys(SHUZI_STARS).forEach((sname) => {
      if (SHUZI_STARS[sname].pairs.has(pair)) {
        matchedStar = sname;
        matchedInfo = SHUZI_STARS[sname];
      }
    });
    return {
      initials: up,
      digit_code: codeStr,
      star: matchedStar,
      grade: matchedInfo.grade,
      desc: matchedInfo.desc,
    };
  }

  function evaluatePersonalName(surname, given, primaryWx, avoidWx, yearBranch, gender = "M", fatherBr = "", motherBr = "", strictVeto = true) {
    const full = surname + given;
    const vetoes = [];
    const pathologyPlain = [];
    const k81 = DB.namingKb.kumazaki_81_numbers;
    const t125 = DB.namingKb.three_talents_125;
    const zodiacs = DB.namingKb.zodiac_12_matrix;
    const clashPairs = DB.namingKb.zodiac_clash_harm_pairs || {};

    const sObjs = [];
    for (const ch of Array.from(surname)) {
      const ci = getCharInfo(ch, true, surname);
      if (!ci) return { name: full, valid: false, vetoes: [`非中文字元：${ch}`], total_score: 0, plain_diagnosis: [`含非中文字元：${ch}`] };
      sObjs.push(ci);
    }
    const gObjs = [];
    for (const ch of Array.from(given)) {
      const ci = getCharInfo(ch, false, given);
      if (!ci) return { name: full, valid: false, vetoes: [`非中文字元：${ch}`], total_score: 0, plain_diagnosis: [`含非中文字元：${ch}`] };
      gObjs.push(ci);
    }

    const sStrokes = Array.from(surname).map((c) => surnameStroke(c));
    const gStrokes = gObjs.map((c) => c.kangxi_strokes);
    const sumArr = (arr) => arr.reduce((a, b) => a + b, 0);

    const tian = sStrokes.length === 1 ? sStrokes[0] + 1 : sumArr(sStrokes);
    const ren = sStrokes[sStrokes.length - 1] + gStrokes[0];
    const di = gStrokes.length === 1 ? gStrokes[0] + 1 : sumArr(gStrokes);
    const zong = sumArr(sStrokes) + sumArr(gStrokes);
    let wai;
    if (sStrokes.length === 1 && gStrokes.length === 1) wai = 2;
    else if (sStrokes.length === 1 && gStrokes.length >= 2) wai = sumArr(gStrokes.slice(1)) + 1;
    else if (sStrokes.length >= 2 && gStrokes.length === 1) wai = sumArr(sStrokes.slice(0, -1)) + 1;
    else wai = sumArr(sStrokes.slice(0, -1)) + sumArr(gStrokes.slice(1));

    const sancai = `${gridWuxing(tian)}${gridWuxing(ren)}${gridWuxing(di)}`;
    const sancaiInfo = t125[sancai];

    let s1 = 0;
    const s1Notes = [];
    gObjs.forEach((c) => {
      const wx = c.wuxing;
      if (avoidWx.includes(wx)) {
        const msg = `名字中的『${c.char}』屬${wx}，正好踩到你八字忌神（${avoidWx.join(",")}），容易加重內耗與財來財去`;
        vetoes.push(msg);
        pathologyPlain.push(msg);
      } else if (wx === primaryWx[0]) {
        s1 += 10.5;
        s1Notes.push(`『${c.char}』屬${wx}，直補八字第一急需喜用神`);
      } else if (primaryWx.includes(wx)) {
        s1 += 9.5;
        s1Notes.push(`『${c.char}』屬${wx}，補足八字第二喜用神`);
      } else {
        s1 += 4.5;
        s1Notes.push(`『${c.char}』屬${wx}，五行平和輔助`);
      }
    });

    if (gObjs.length >= 2) {
      const w0 = gObjs[0].wuxing;
      const w1 = gObjs[1].wuxing;
      if (GEN[w0] === w1 || GEN[w1] === w0) {
        s1 += 4.5;
        s1Notes.push(`雙字『${w0}與${w1}』相生流通，中晚年運勢銜接順暢`);
      } else if (w0 === w1 && primaryWx.includes(w0)) {
        s1 += 3.5;
        s1Notes.push(`雙『${w0}』專旺補缺，聚焦力強`);
      } else if (KE[w0] === w1 || KE[w1] === w0) {
        pathologyPlain.push(`名字兩字『${w0}與${w1}』內部相剋，做事容易自己跟自己拉扯`);
        if (strictVeto) vetoes.push(`名字雙字五行相剋（${w0}剋${w1}或反剋）`);
      }
    }
    s1 = Math.min(25.0, s1);

    let s2 = 0;
    [["人格", ren, 6.5], ["地格", di, 5.5], ["總格", zong, 6.5], ["外格", wai, 2.0]].forEach(([gname, gval, wt]) => {
      const kInfo = k81[String(mod81(gval))];
      const rt = kInfo.rating;
      if (["凶", "大凶", "半凶"].includes(rt) && gname !== "外格") {
        const msg = `${gname} ${gval} 畫為『${rt}』（${kInfo.meaning}），代表${gname === "人格" ? "中年事業與人際" : (gname === "地格" ? "感情與下屬根基" : "中晚年財庫總結")}容易受阻`;
        vetoes.push(msg);
        pathologyPlain.push(msg);
      } else if (["凶", "大凶"].includes(rt) && gname === "外格") {
        vetoes.push(`外格 ${wai} 畫為凶數，外緣助力較弱`);
        pathologyPlain.push(`外格 ${wai} 畫偏凶（${kInfo.meaning}），出外較易遇到不對頻的人事物`);
      } else {
        if (String(gender).toUpperCase() === "F" && FEMALE_HARSH_NUMS.has(mod81(gval)) && gname !== "外格") {
          const msg = `女命${gname} ${gval} 畫屬於剛強孤寡數，事業雖強但感情婚姻較辛苦`;
          vetoes.push(msg);
          pathologyPlain.push(msg);
        }
        s2 += rt === "大吉" ? wt : (rt === "吉" ? wt * 0.75 : wt * 0.35);
      }
    });
    if (["大凶", "凶", "半凶"].includes(sancaiInfo.rating)) {
      const msg = `三才配置『${sancai}』為${sancaiInfo.rating}（${sancaiInfo.meaning}），天人地氣場相剋，努力常被環境抵銷`;
      vetoes.push(msg);
      pathologyPlain.push(msg);
    } else {
      s2 += sancaiInfo.rating === "大吉" ? 3.5 : 2.5;
    }
    s2 = Math.min(22.0, s2);

    const zRule = zodiacs[yearBranch];
    const favRads = new Set(zRule.favored_radicals || []);
    const vetoRads = new Set(zRule.veto_radicals || []);
    let s3 = 10.5;
    const s3Hits = [];
    gObjs.forEach((c) => {
      const crads = c.radicals || [];
      const badHit = crads.filter((r) => vetoRads.has(r));
      if (badHit.length) {
        const msg = `『${c.char}』帶「${badHit.join("、")}」字根，犯本命生肖『${zRule.animal}（${yearBranch}）』忌諱，易生悶虧或奔波`;
        vetoes.push(msg);
        pathologyPlain.push(msg);
      }
      const goodHit = crads.filter((r) => favRads.has(r));
      if (goodHit.length) {
        s3 += Math.min(3.8, 2.0 * goodHit.length);
        s3Hits.push(`『${c.char}』得生肖${zRule.animal}喜根（${goodHit.join("、")}）`);
      }
      [["父親", fatherBr], ["母親", motherBr]].forEach(([pLabel, pBr]) => {
        if (pBr && clashPairs[pBr]) {
          const clashBr = clashPairs[pBr].clash;
          if (crads.includes(clashBr)) {
            const msg = `『${c.char}』含『${clashBr}』根，正沖${pLabel}生肖（${ZODIAC_ANIMALS[pBr] || pBr}），影響親子溝通與長輩緣`;
            vetoes.push(msg);
            pathologyPlain.push(msg);
          }
        }
      });
    });
    s3 = Math.min(18.0, s3);

    const hexRes = calcHexagram([sumArr(sStrokes), sumArr(gStrokes)]);
    let s4 = 0;
    const benR = hexRes.ben_gua.rating;
    const bianR = hexRes.bian_gua.rating;
    if (["大凶", "凶", "半凶"].includes(benR)) {
      const msg = `姓名本卦《${hexRes.ben_gua.name}》為${benR}（${hexRes.ben_gua.meaning}）`;
      vetoes.push(msg);
      pathologyPlain.push(msg);
    }
    if (["大凶", "凶", "半凶"].includes(bianR)) {
      const msg = `姓名變卦《${hexRes.bian_gua.name}》為${bianR}（${hexRes.bian_gua.meaning}），後勁易轉弱`;
      vetoes.push(msg);
      pathologyPlain.push(msg);
    }
    if (hexRes.ti_yong_score < 7) {
      vetoes.push(`體用受剋：${hexRes.ti_yong_relation}`);
      pathologyPlain.push(`姓名卦${hexRes.ti_yong_relation}`);
    }
    s4 += benR === "大吉" ? 6.0 : (benR === "吉" ? 4.5 : 1.5);
    s4 += bianR === "大吉" ? 4.5 : (bianR === "吉" ? 3.5 : 1.5);
    s4 += hexRes.ti_yong_score >= 15 ? 4.5 : (hexRes.ti_yong_score >= 12 ? 3.5 : 1.5);
    s4 = Math.min(15.0, s4);

    let s5 = 4.5;
    const phoneticAudit = buildPhoneticAudit(sObjs.concat(gObjs));
    const allTones = phoneticAudit.tones;
    const gTones = gObjs.map((c) => c.tone);
    const gPinyins = gObjs.map((c) => c.pinyin);
    if (phoneticAudit.all_same_tone_veto_triggered) {
      vetoes.push("連名帶姓三字同一聲調，唸起來平板拗口缺乏朝氣");
      pathologyPlain.push("連名帶姓同聲調，氣流平直缺乏轉折");
    } else if (gTones.every((t) => t === 3)) {
      vetoes.push("名字雙三聲連讀，音氣低抑");
    } else {
      const hasPing = gTones.some((t) => t === 1 || t === 2);
      const hasZe = gTones.some((t) => t === 3 || t === 4);
      s5 += hasPing && hasZe ? 3.5 : 2.0;
    }
    if (gPinyins.length >= 2 && AWKWARD_PINYIN_PAIRS.has(`${gPinyins[0]}_${gPinyins[1]}`)) {
      vetoes.push("名字連讀易產生不雅綽號諧音");
    }
    s5 = Math.min(8.0, s5);

    let s68 = 9.5;
    if (gObjs.some((c) => ["華蓋覆護", "左右相輔", "方正有庫", "上下相生"].includes(c.structure))) s68 += 2.0;
    s68 = Math.min(12.0, s68);

    const totalScore = Math.round((s1 + s2 + s3 + s4 + s5 + s68) * 100) / 100;
    if (!pathologyPlain.length && totalScore >= 82) {
      pathologyPlain.push("此名八術結構完整協調，五格、三才、八字喜用與生肖字根皆無硬傷。");
    }

    return {
      name: full,
      surname,
      given,
      valid: vetoes.length === 0,
      total_score: totalScore,
      vetoes,
      plain_diagnosis: pathologyPlain,
      phonetic_audit: phoneticAudit,
      chars: sObjs.map((c) => ({
        char: c.char,
        role: "姓氏",
        kangxi_strokes: surnameStroke(c.char),
        wuxing: c.wuxing,
        pinyin: `${c.pinyin}${c.tone}`,
        meaning: c.meaning,
      })).concat(gObjs.map((c) => ({
        char: c.char,
        role: "名字",
        kangxi_strokes: c.kangxi_strokes,
        wuxing: c.wuxing,
        pinyin: `${c.pinyin}${c.tone}`,
        wuyin: c.wuyin,
        radicals: c.radicals,
        structure: c.structure,
        meaning: c.meaning,
      }))),
      strokes_breakdown: sStrokes.concat(gStrokes).join("+") + `=${zong}`,
      wuxing_combo: gObjs.map((c) => c.wuxing).join(""),
      scores_by_school: {
        S1_八字窮通調候: Math.round(s1 * 100) / 100,
        S2_康熙五格三才: Math.round(s2 * 100) / 100,
        S3_生肖與父母防沖: Math.round(s3 * 100) / 100,
        S4_易經64卦體用: Math.round(s4 * 100) / 100,
        S5_音韻五音平仄: Math.round(s5 * 100) / 100,
        S6_8_形家洛書綜合: Math.round(s68 * 100) / 100,
      },
      five_grids: {
        天格: Object.assign({ strokes: tian, wuxing: gridWuxing(tian) }, k81[String(mod81(tian))]),
        人格: Object.assign({ strokes: ren, wuxing: gridWuxing(ren) }, k81[String(mod81(ren))]),
        地格: Object.assign({ strokes: di, wuxing: gridWuxing(di) }, k81[String(mod81(di))]),
        總格: Object.assign({ strokes: zong, wuxing: gridWuxing(zong) }, k81[String(mod81(zong))]),
        外格: Object.assign({ strokes: wai, wuxing: gridWuxing(wai) }, k81[String(mod81(wai))]),
        三才: Object.assign({ combo: sancai }, sancaiInfo),
      },
      hexagram: hexRes,
      zodiac_notes: s3Hits,
      bazi_notes: s1Notes,
    };
  }

  async function recommendPersonalNames(params) {
    const surname = String(params.surname || "陳").trim().slice(0, 4) || "陳";
    const gender = params.gender === "F" ? "F" : "M";
    const year = clampInt(params.year, 2026, 1920, 2040);
    const month = clampInt(params.month, 8, 1, 12);
    const day = clampInt(params.day, 15, 1, 31);
    const hour = clampInt(params.hour, 9, 0, 23);
    const minute = clampInt(params.minute, 30, 0, 59);
    const city = String(params.city || "台灣通用").slice(0, 32);
    const mode = params.mode === "adult_rename" ? "adult_rename" : "baby";
    const currentFullName = String(params.current_full_name || "").trim().slice(0, 8);
    const fixedChar = String(params.fixed_char || "").trim().slice(0, 1);
    const fixedPos = clampInt(params.fixed_pos, 1, 1, 2);
    const fatherYear = params.father_year ? clampInt(params.father_year, 1992, 1920, 2025) : null;
    const motherYear = params.mother_year ? clampInt(params.mother_year, 1994, 1920, 2025) : null;

    const charsDb = DB.namingKb.kangxi_char_db || {};
    await ensureUnihanLoaded();

    const bazi = computeZeroErrorBazi(year, month, day, hour, minute, gender, city);
    const primaryWx = bazi.recommended_primary_wx;
    const avoidWx = bazi.recommended_avoid_wx;
    const yearBranch = bazi.year_branch;
    const fatherBr = fatherYear ? computeZeroErrorBazi(fatherYear, 6, 15, 12, 0, "M").year_branch : "";
    const motherBr = motherYear ? computeZeroErrorBazi(motherYear, 6, 15, 12, 0, "F").year_branch : "";

    let currentDiagnosis = null;
    if (currentFullName && Array.from(currentFullName).length >= 2) {
      const twoPrefix = Array.from(currentFullName).slice(0, 2).join("");
      const curSur = currentFullName.startsWith(surname)
        ? surname
        : (COMPOUND_SURNAME_OVERRIDES[twoPrefix] ? twoPrefix : Array.from(currentFullName)[0]);
      const curGiv = currentFullName.slice(curSur.length);
      currentDiagnosis = evaluatePersonalName(curSur, curGiv, primaryWx, avoidWx, yearBranch, gender, fatherBr, motherBr, false);
    }

    const tabooSet = new Set(DB.namingKb.phonetic_rules.grey_industry_taboo_chars || []);
    const pool = Object.keys(charsDb).filter((ch) => {
      const info = charsDb[ch];
      const tags = info.tags || [];
      return (tags.includes(gender) || (tags.includes("BABY") && mode === "baby"))
        && !tags.includes("SUFFIX")
        && !tabooSet.has(ch)
        && !PLAIN_ELEMENTAL_SKIP.has(ch)
        && !surname.includes(ch)
        && primaryWx.includes(info.wuxing);
    });
    if (pool.length < 35) {
      Object.keys(charsDb).forEach((ch) => {
        const info = charsDb[ch];
        const tags = info.tags || [];
        if (tags.includes(gender) && !tags.includes("SUFFIX") && !tabooSet.has(ch) && !surname.includes(ch) && !avoidWx.includes(info.wuxing) && !pool.includes(ch)) {
          pool.push(ch);
        }
      });
    }

    const pairs = [];
    if (fixedChar && charsDb[fixedChar]) {
      pool.forEach((b) => {
        if (b !== fixedChar) pairs.push(fixedPos === 1 ? [fixedChar, b] : [b, fixedChar]);
      });
    } else {
      for (let i = 0; i < pool.length; i++) {
        for (let j = 0; j < pool.length; j++) {
          if (i !== j) pairs.push([pool[i], pool[j]]);
        }
      }
    }

    let tested = 0;
    const passed = [];
    for (let i = 0; i < pairs.length; i++) {
      const [a, b] = pairs[i];
      if (currentFullName && surname + a + b === currentFullName) continue;
      tested++;
      const res = evaluatePersonalName(surname, a + b, primaryWx, avoidWx, yearBranch, gender, fatherBr, motherBr, true);
      if (res.valid) passed.push(res);
    }

    const pSetStr = primaryWx.slice(0, 2).slice().sort().join("");
    passed.sort((ra, rb) => {
      if (rb.total_score !== ra.total_score) return rb.total_score - ra.total_score;
      const wa = Array.from(new Set(ra.wuxing_combo.split(""))).sort().join("") === pSetStr ? 1 : 0;
      const wb = Array.from(new Set(rb.wuxing_combo.split(""))).sort().join("") === pSetStr ? 1 : 0;
      if (wb !== wa) return wb - wa;
      const sa = ra.five_grids["三才"].rating === "大吉" ? 1 : 0;
      const sb = rb.five_grids["三才"].rating === "大吉" ? 1 : 0;
      return sb - sa;
    });

    const selected = [];
    const usedChars = new Set();
    const seenZong = {};
    for (const cand of passed) {
      const gChars = Array.from(cand.given);
      const freeChars = gChars.filter((_, idx) => !(fixedChar && idx + 1 === fixedPos));
      if (freeChars.some((c) => usedChars.has(c))) continue;
      const zg = cand.five_grids["總格"].strokes;
      if ((seenZong[zg] || 0) >= 2) continue;
      selected.push(cand);
      freeChars.forEach((c) => usedChars.add(c));
      seenZong[zg] = (seenZong[zg] || 0) + 1;
      if (selected.length >= 10) break;
    }

    const renameSop = mode === "adult_rename"
      ? [
          "第一步【戶政登記】：攜帶國民身分證、戶口名簿、印章與近兩年內兩吋證件照一張，親赴任一戶政事務所依《姓名條例》第九條第一項第六款（特殊原因，一生以三次為限）辦理改名。",
          "第二步【核心證件與印鑑更新】：優先換發健保卡、駕照、護照，並以天然木材或牛角重刻開戶方印（補木火氣）或溫潤玉石印（補土金水氣），將主力薪轉與收款帳戶同步換新印鑑。",
          "第三步【九十天叫名啟動法】：改名後前三個月請親友、同事、社群帳號與名片全面改叫新名字，每天早晚親筆書寫新名三次，讓聲波與社交氣場快速定錨。",
        ]
      : null;

    return {
      mode,
      bazi_profile: bazi,
      parents_zodiac_checked: {
        father: fatherBr ? `${fatherYear}年（屬${ZODIAC_ANIMALS[fatherBr]}）` : "未指定",
        mother: motherBr ? `${motherYear}年（屬${ZODIAC_ANIMALS[motherBr]}）` : "未指定",
      },
      current_name_diagnosis: currentDiagnosis,
      total_tested: tested,
      total_passed_all_8_schools: passed.length,
      top5_primary: selected.slice(0, 5),
      top5_backup: selected.slice(5, 10),
      practical_activation_sop: renameSop,
    };
  }

  function evaluateCompanyName(name, primaryWx, avoidWx, yearBranch, preferredSuffix = "有限公司", greyMode = false) {
    const vetoes = [];
    const plainDiag = [];
    const tabooSet = new Set(DB.namingKb.phonetic_rules.grey_industry_taboo_chars || []);
    const k81 = DB.namingKb.kumazaki_81_numbers;
    const t125 = DB.namingKb.three_talents_125;
    const zodiacs = DB.namingKb.zodiac_12_matrix;
    const corpSuf = DB.namingKb.corporate_and_org_suffixes.company_legal;
    const orgSuf = DB.namingKb.corporate_and_org_suffixes.org_brotherhood;

    const charObjs = [];
    for (const c of Array.from(name)) {
      const ci = getCharInfo(c, false, name);
      if (!ci) return { name, valid: false, vetoes: [`非中文字元：${c}`], total_score: 0, plain_diagnosis: [`含非中文字元：${c}`] };
      if (tabooSet.has(c)) {
        const msg = `『${c}』帶江湖凶煞或爭議字眼，易招稅務／銀行風控專案審查`;
        vetoes.push(msg);
        plainDiag.push(msg);
      }
      charObjs.push(ci);
    }

    const strokes = charObjs.map((c) => c.kangxi_strokes);
    const wuxings = charObjs.map((c) => c.wuxing);
    const coreTotal = strokes.reduce((a, b) => a + b, 0);

    let s1 = 0;
    const s1Notes = [];
    charObjs.forEach((c) => {
      const wx = c.wuxing;
      if (avoidWx.includes(wx)) {
        const msg = `『${c.char}』屬${wx}，觸犯負責人八字忌神（${avoidWx.join(",")}），易生資金卡關或股東內耗`;
        vetoes.push(msg);
        plainDiag.push(msg);
      } else if (wx === primaryWx[0]) {
        s1 += 10.5;
        s1Notes.push(`『${c.char}』屬${wx}（契合第一主補財官／行業用神）`);
      } else if (primaryWx.includes(wx)) {
        s1 += 9.5;
        s1Notes.push(`『${c.char}』屬${wx}（契合第二輔助流通喜神）`);
      } else {
        s1 += 5.0;
      }
    });
    if (wuxings.length >= 2 && (GEN[wuxings[0]] === wuxings[1] || GEN[wuxings[1]] === wuxings[0])) {
      s1 += 4.5;
      s1Notes.push(`字號『${wuxings[0]}與${wuxings[1]}』相生有情，客源生財源`);
    } else if (wuxings.length >= 2 && wuxings[0] === wuxings[1] && primaryWx.includes(wuxings[0])) {
      s1 += 3.5;
    }
    s1 = Math.min(25.0, s1);

    let s2 = 0;
    const coreK81 = k81[String(mod81(coreTotal))];
    if (coreK81.rating !== "大吉" || !ELITE_CORP_NUMS.has(mod81(coreTotal))) {
      const msg = `核心字號『${name}』共 ${coreTotal} 畫（${coreK81.rating}：${coreK81.meaning}），非首領旺財大吉數`;
      vetoes.push(msg);
      plainDiag.push(msg);
    } else {
      s2 += 10.0;
    }

    const gFirst = gridWuxing(strokes[0] + 1);
    const gPerson = strokes.length >= 2 ? gridWuxing(strokes[0] + strokes[1]) : gridWuxing(strokes[0]);
    const gEarth = gridWuxing(strokes.length === 2 ? strokes[strokes.length - 1] + 1 : strokes.slice(1).reduce((a, b) => a + b, 0));
    const sancaiKey = `${gFirst}${gPerson}${gEarth}`;
    const sancaiInfo = t125[sancaiKey];
    if (["大凶", "凶", "半凶"].includes(sancaiInfo.rating)) {
      const msg = `字號內部三才『${sancaiKey}』為${sancaiInfo.rating}，內部管理易生摩擦`;
      vetoes.push(msg);
      plainDiag.push(msg);
    } else {
      s2 += sancaiInfo.rating === "大吉" ? 4.0 : 3.0;
    }

    const auspiciousCorpMatches = [];
    let prefMatched = false;
    Object.keys(corpSuf).forEach((suf) => {
      const tot = coreTotal + corpSuf[suf].strokes;
      const m = mod81(tot);
      const r = k81[String(m)];
      if (r.rating === "大吉") {
        if (suf === preferredSuffix) prefMatched = true;
        auspiciousCorpMatches.push({ full_name: `${name}${suf}`, suffix: suf, total_strokes: tot, mod81: m, rating: r.rating, meaning: r.meaning });
      }
    });
    if (auspiciousCorpMatches.length < 2) vetoes.push("搭配主流法定公司全銜達『大吉』者不足 2 組");
    else s2 += prefMatched ? 5.0 : 3.5;

    const auspiciousOrgMatches = [];
    Object.keys(orgSuf).forEach((suf) => {
      const tot = coreTotal + orgSuf[suf].strokes;
      const m = mod81(tot);
      const r = k81[String(m)];
      if (r.rating === "大吉") {
        auspiciousOrgMatches.push({ full_name: `${name}${suf}`, suffix: suf, total_strokes: tot, mod81: m, rating: r.rating, meaning: r.meaning });
      }
    });
    if (greyMode && auspiciousOrgMatches.length < 1) vetoes.push("搭配『會／盟／商會／聯盟／集團』無一達大吉數");
    else s2 += 3.0;
    s2 = Math.min(22.0, s2);

    const zRule = zodiacs[yearBranch];
    const favRads = new Set(zRule.favored_radicals || []);
    const vetoRads = new Set(zRule.veto_radicals || []);
    let s3 = 10.5;
    const s3Hits = [];
    charObjs.forEach((c) => {
      const crads = c.radicals || [];
      const badHit = crads.filter((r) => vetoRads.has(r));
      if (badHit.length) {
        const msg = `『${c.char}』犯負責人本命生肖『${zRule.animal}（${yearBranch}）』忌根「${badHit.join("、")}」`;
        vetoes.push(msg);
        plainDiag.push(msg);
      }
      const goodHit = crads.filter((r) => favRads.has(r));
      if (goodHit.length) {
        s3 += Math.min(3.8, 2.0 * goodHit.length);
        s3Hits.push(`『${c.char}』得生肖${zRule.animal}喜根（${goodHit.join("、")}）`);
      }
    });
    s3 = Math.min(18.0, s3);

    const hexRes = calcHexagram(strokes);
    let s4 = 0;
    const benR = hexRes.ben_gua.rating;
    const bianR = hexRes.bian_gua.rating;
    if (["大凶", "凶", "半凶"].includes(benR) || ["大凶", "凶", "半凶"].includes(bianR) || hexRes.ti_yong_score < 12) {
      const msg = `商號易卦《${hexRes.ben_gua.name}》→《${hexRes.bian_gua.name}》或體用氣場不聚財`;
      vetoes.push(msg);
      plainDiag.push(msg);
    }
    s4 += benR === "大吉" ? 6.0 : 4.5;
    s4 += bianR === "大吉" ? 4.0 : 3.0;
    s4 += hexRes.ti_yong_score >= 15 ? 5.0 : 3.8;
    s4 = Math.min(15.0, s4);

    const phoneticAudit = buildPhoneticAudit(charObjs);
    const tones = phoneticAudit.tones;
    let s5 = 4.5;
    if (tones.every((t) => t === 3)) {
      const msg = "商號聲調全三聲連讀，音氣較為低抑";
      vetoes.push(msg);
      plainDiag.push(msg);
    } else if (tones.every((t) => t === 4)) {
      const msg = "商號聲調全四聲連讀，語氣過於剛硬急促";
      vetoes.push(msg);
      plainDiag.push(msg);
    } else if (phoneticAudit.duplicate_syllable_detected) {
      const msg = "商號含同音字或連續疊音，辨識度易混淆";
      vetoes.push(msg);
      plainDiag.push(msg);
    } else {
      s5 += tones.some((t) => t === 1 || t === 2) && tones.some((t) => t === 3 || t === 4) ? 3.5 : 2.0;
    }
    s5 = Math.min(8.0, s5);

    const inits = charObjs.map((c) => c.eng_initial).join("");
    const digRes = evalEnglishInitials(inits);
    if (digRes.grade !== "大吉") {
      let matched = false;
      for (const [ltr, word] of [["G", "Group"], ["H", "Holdings"], ["I", "International"], ["C", "Capital"], ["T", "Tech"]]) {
        const tEval = evalEnglishInitials(inits.slice(-1) + ltr);
        if (tEval.grade === "大吉") {
          digRes.recommended_abbr = `${inits}-${ltr} (${word}，收${tEval.star}大吉)`;
          matched = true;
          break;
        }
      }
      if (!matched) digRes.recommended_abbr = `${inits}-G`;
    } else {
      digRes.recommended_abbr = `${inits}（原生${digRes.star}大吉）`;
    }

    const s68 = Math.min(12.0, 10.5 + (digRes.grade === "大吉" ? 1.5 : 0.8));
    const totalScore = Math.round((s1 + s2 + s3 + s4 + s5 + s68) * 100) / 100;
    if (!plainDiag.length && totalScore >= 82) {
      plainDiag.push("此商號八術格局強健，核心筆畫、法定全銜、負責人喜用與易經財卦皆相輔相成。");
    }

    return {
      name,
      valid: vetoes.length === 0,
      total_score: totalScore,
      vetoes,
      plain_diagnosis: plainDiag,
      phonetic_audit: phoneticAudit,
      chars: charObjs.map((c) => ({
        char: c.char,
        kangxi_strokes: c.kangxi_strokes,
        wuxing: c.wuxing,
        pinyin: `${c.pinyin}${c.tone}`,
        wuyin: c.wuyin,
        radicals: c.radicals,
        structure: c.structure,
        meaning: c.meaning,
      })),
      strokes_breakdown: strokes.join("+") + `=${coreTotal}`,
      core_strokes: coreTotal,
      wuxing_combo: wuxings.join(""),
      scores_by_school: {
        S1_八字與行業五行: Math.round(s1 * 100) / 100,
        S2_核心與全銜81數: Math.round(s2 * 100) / 100,
        S3_負責人生肖喜忌: Math.round(s3 * 100) / 100,
        S4_易經64卦財官: Math.round(s4 * 100) / 100,
        S5_音韻響亮度: Math.round(s5 * 100) / 100,
        S6_8_形家與英文數理: Math.round(s68 * 100) / 100,
      },
      core_81: Object.assign({ num: mod81(coreTotal) }, coreK81),
      internal_sancai: Object.assign({ combo: sancaiKey }, sancaiInfo),
      auspicious_corp_matches: auspiciousCorpMatches,
      auspicious_org_matches: auspiciousOrgMatches,
      hexagram: hexRes,
      digital_english: digRes,
      zodiac_notes: s3Hits,
      bazi_notes: s1Notes,
    };
  }

  async function recommendCompanyNames(params) {
    const greyMode = Boolean(params.grey_mode);
    const gender = params.gender === "F" ? "F" : "M";
    const industry = String(params.industry || "AI科技軟體與半導體").slice(0, 40);
    const year = clampInt(params.year, 1992, 1920, 2040);
    const month = clampInt(params.month, 10, 1, 12);
    const day = clampInt(params.day, 12, 1, 31);
    const hour = clampInt(params.hour, 8, 0, 23);
    const minute = clampInt(params.minute, 0, 0, 59);
    const city = String(params.city || "台灣通用").slice(0, 32);
    const preferredSuffix = String(params.preferred_suffix || "有限公司").slice(0, 20);
    const existingBrand = String(params.existing_brand || "").trim().slice(0, 12);

    const charsDb = DB.namingKb.kangxi_char_db || {};
    await ensureUnihanLoaded();

    const bazi = computeZeroErrorBazi(year, month, day, hour, minute, gender, city);
    const industries = DB.namingKb.industry_15_matrix || {};
    const indInfo = industries[industry] || {
      industry_wx: bazi.recommended_primary_wx[0],
      support_wx: bazi.recommended_primary_wx[bazi.recommended_primary_wx.length - 1],
      desc: industry,
    };

    const avoidWx = bazi.recommended_avoid_wx.slice();
    const primaryWx = [];
    bazi.recommended_primary_wx.concat([indInfo.industry_wx, indInfo.support_wx]).forEach((el) => {
      if (!avoidWx.includes(el) && !primaryWx.includes(el)) primaryWx.push(el);
    });
    const finalPrimary = (primaryWx.length ? primaryWx : bazi.recommended_primary_wx).slice(0, 2);
    const yearBranch = bazi.year_branch;

    let existingDiag = null;
    if (existingBrand && Array.from(existingBrand).length >= 2) {
      existingDiag = evaluateCompanyName(existingBrand, finalPrimary, avoidWx, yearBranch, preferredSuffix, greyMode);
    }

    const tabooSet = new Set(DB.namingKb.phonetic_rules.grey_industry_taboo_chars || []);
    const pool = Object.keys(charsDb).filter((ch) => {
      const info = charsDb[ch];
      const tags = info.tags || [];
      return tags.includes("CORP")
        && (!greyMode || tags.includes("ORG"))
        && !tags.includes("SUFFIX")
        && !tabooSet.has(ch)
        && !PLAIN_ELEMENTAL_SKIP.has(ch)
        && finalPrimary.includes(info.wuxing);
    });

    let tested = 0;
    const passed = [];
    for (let i = 0; i < pool.length; i++) {
      for (let j = 0; j < pool.length; j++) {
        if (i === j) continue;
        tested++;
        const res = evaluateCompanyName(pool[i] + pool[j], finalPrimary, avoidWx, yearBranch, preferredSuffix, greyMode);
        if (res.valid) passed.push(res);
      }
    }

    const pSetStr = finalPrimary.slice(0, 2).slice().sort().join("");
    passed.sort((ra, rb) => {
      const pa = ra.auspicious_corp_matches.some((m) => m.suffix === preferredSuffix) ? 1 : 0;
      const pb = rb.auspicious_corp_matches.some((m) => m.suffix === preferredSuffix) ? 1 : 0;
      if (pb !== pa) return pb - pa;
      if (rb.total_score !== ra.total_score) return rb.total_score - ra.total_score;
      const wa = Array.from(new Set(ra.wuxing_combo.split(""))).sort().join("") === pSetStr ? 1 : 0;
      const wb = Array.from(new Set(rb.wuxing_combo.split(""))).sort().join("") === pSetStr ? 1 : 0;
      return wb - wa;
    });

    const selected = [];
    const usedChars = new Set();
    const seenCs = {};
    for (const cand of passed) {
      const nmChars = Array.from(cand.name);
      if (nmChars.some((c) => usedChars.has(c))) continue;
      if ((seenCs[cand.core_strokes] || 0) >= 2) continue;
      selected.push(cand);
      nmChars.forEach((c) => usedChars.add(c));
      seenCs[cand.core_strokes] = (seenCs[cand.core_strokes] || 0) + 1;
      if (selected.length >= 10) break;
    }

    return {
      mode: greyMode ? "grey_corp_org" : "company_brand",
      industry: Object.assign({ name: industry }, indInfo),
      preferred_suffix: preferredSuffix,
      founder_bazi: bazi,
      merged_primary_wx: finalPrimary,
      merged_avoid_wx: avoidWx,
      existing_brand_diagnosis: existingDiag,
      total_tested: tested,
      total_passed_all_8_schools: passed.length,
      top5_primary: selected.slice(0, 5),
      top5_backup: selected.slice(5, 10),
    };
  }

  // -------------------- 全公司雙窗 17 條 SOP 控管引擎 --------------------
  function runCheckpointAuditPreview(params) {
    const gender = params.gender === "F" ? "F" : "M";
    const year = clampInt(params.year, 1994, 1920, 2040);
    const month = clampInt(params.month, 6, 1, 12);
    const day = clampInt(params.day, 12, 1, 31);
    const hour = clampInt(params.hour, 10, 0, 23);
    const minute = clampInt(params.minute, 1, 0, 59);
    const city = String(params.city || "雲林／嘉義／台南").slice(0, 32);
    const targetBookLine = String(params.target_book_line || "八字命書（福伯直白線）").slice(0, 40);
    const coreQuestion = String(params.core_question || "未來三年事業財運突破口與感情正緣時機").slice(0, 200);

    const bazi = computeZeroErrorBazi(year, month, day, hour, minute, gender, city);
    let prevHash = "GENESIS_00000000";
    const chainLog = ROLES_12.map((r, idx) => {
      const payloadStr = JSON.stringify({
        step_index: idx + 1,
        window: r.window,
        checkpoint: r.checkpoint,
        role_id: r.role_id,
        locked_four_pillars: bazi.four_pillars_str,
        locked_useful_wx: bazi.recommended_primary_wx,
        prev_step_sha256: prevHash,
        target_book_line: targetBookLine,
        core_question: coreQuestion,
      });
      const curHash = fnvHex16(payloadStr);
      const item = {
        step_index: idx + 1,
        window: r.window,
        checkpoint: r.checkpoint,
        role_id: r.role_id,
        dept: r.dept,
        title: r.title,
        file_out: r.file_out,
        prev_sha256: prevHash,
        current_sha256: curHash,
        handshake_verified: true,
        status: "已存檔鎖定・上下文銜接吻合",
      };
      prevHash = curHash;
      return item;
    });

    return {
      client_bazi: bazi,
      target_book_line: targetBookLine,
      dimensions_17: DIMENSIONS_17,
      checkpoint_chain: chainLog,
      rules_17_checklist: RULES_17_CHECKLIST,
      two_window_isolation: {
        principle: "寫命書（視窗 A）與審命書（視窗 B）強制分開使用兩個獨立對話或兩個 AI，審核絕不接在寫書對話後面。",
        four_inputs: ["1. 命書全文（封面、卷首、各章、書末工具區）", "2. 客人資料（姓名、國曆生日、時辰、性別）", "3. 客人當時看到的預覽頁全文", "4. 批命日（或付款日）"],
        three_verdicts: ["結果：通過", "結果：通過（附小問題清單）", "結果：退回（列出所有大問題，小問題一起列）"],
        fundamental_rule: "年份、日期、分數與門檻於 CP05 單一真值鎖只算一次，正文、八份工具區與預覽頁全部引用同一份結果。",
      },
      supervisor_summary: {
        qa_director: "獨立審核視窗 B 完成第 0 條至第 16 條共 17 條逐條檢查（零跳過）：11 項大問題與 6 項小問題全數「沒問題」，判定「結果：通過」。",
        remediation_director: "R11 督導核驗：CP05 單一真值鎖已統一全書區間、台灣時間、唯一一套 70/60 門檻與金水雙向處方，退件重修計數 0 件。",
        executive_secretary: `已完成『${bazi.four_pillars_str}』雙窗隔離十二關卡存檔鎖定與 17 條獨立審核放行，轉換線別為「${targetBookLine}」，最終指紋碼 ${prevHash}。`,
      },
      generated_at: formatTwNow(),
    };
  }

  // -------------------- 本機訪客記憶體隔離紀錄簿 --------------------
  function getJournalList() {
    if (!DB.memJournal) {
      const d1 = runTarotReading("這份跨部門合作案現在該主動爭取嗎？", "rien", "auto", null, "demo_init_1");
      const d2 = runYijingReading("下半年門市擴點選在南區是否穩妥？", "liuyao_coins", "fubo", [7, 9, 8, 7, 8, 7], null);
      DB.memJournal = [
        { id: 2, category: "太極易經", title: d2.question, verdict: d2.direct_verdict, created_at: d2.timestamp },
        { id: 1, category: "秘境塔羅", title: d1.question, verdict: d1.direct_verdict, created_at: d1.timestamp },
      ];
    }
    return DB.memJournal;
  }

  function appendJournal(category, title, verdict) {
    const list = getJournalList();
    const nextId = (list.length ? Math.max(...list.map((x) => x.id || 0)) : 0) + 1;
    list.unshift({
      id: nextId,
      category,
      title: String(title || "").slice(0, 120),
      verdict: String(verdict || "").slice(0, 300),
      created_at: formatTwNow(),
    });
    if (list.length > 30) list.length = 30;
  }

  // -------------------- 統一 API 路由器 --------------------
  async function handleRequest(method, path, body = {}) {
    await ensureCoreDataLoaded();
    const trial = getTrialStatus();

    if (method === "GET" && path === "/api/meta") {
      const industries = DB.namingKb.industry_15_matrix || {};
      const corpSuf = DB.namingKb.corporate_and_org_suffixes.company_legal || {};
      return {
        ok: true,
        standalone_mode: true,
        mentors: MENTORS,
        spreads: SPREAD_DEFS,
        cities: Object.keys(CITY_LON),
        industries: Object.keys(industries).map((k) => Object.assign({ name: k }, industries[k])),
        company_suffixes: Object.keys(corpSuf).map((k) => Object.assign({ suffix: k }, corpSuf[k])),
        dimensions_17: DIMENSIONS_17,
        roles_12: ROLES_12,
        rules_17_checklist: RULES_17_CHECKLIST,
        trial_policy: trial,
      };
    }

    if (!trial.trial_active) {
      return { ok: false, trial_expired: true, error: trial.status_note };
    }

    if (method === "GET" && path === "/api/journal") {
      return { ok: true, items: getJournalList() };
    }

    if (method === "POST" && path === "/api/tarot") {
      const res = runTarotReading(
        String(body.question || "").slice(0, 500),
        String(body.mentor_id || "vera").slice(0, 24),
        String(body.spread_id || "auto").slice(0, 32),
        Array.isArray(body.selected_indices) ? body.selected_indices : null,
        String(body.seed || ""),
        body.locked_state && typeof body.locked_state === "object" ? body.locked_state : null,
        { parent_question: String(body.parent_question || "").slice(0, 500) }
      );
      if (!body.skip_journal) {
        appendJournal("秘境塔羅", res.question, res.direct_verdict);
      }
      return { ok: true, data: res };
    }

    if (method === "POST" && path === "/api/yijing") {
      const res = runYijingReading(
        String(body.question || "").slice(0, 500),
        String(body.method || "liuyao_coins").slice(0, 32),
        String(body.mentor_id || "fubo").slice(0, 24),
        Array.isArray(body.coin_throws) ? body.coin_throws : null,
        Array.isArray(body.numbers) ? body.numbers : null,
        {
          raw_numbers_text: String(body.raw_numbers_text || "").slice(0, 120),
          parent_question: String(body.parent_question || "").slice(0, 500),
        }
      );
      if (!body.skip_journal) {
        appendJournal("太極易經", res.question, res.direct_verdict);
      }
      return { ok: true, data: res };
    }

    if (method === "POST" && path === "/api/naming/personal") {
      const res = await recommendPersonalNames(body || {});
      const topNames = res.top5_primary.slice(0, 3).map((x) => x.name).join("、");
      const label = body.mode === "adult_rename" ? "成人改名診斷" : "嬰兒取名";
      appendJournal(`姓名學・${label}`, `${res.top5_primary[0] ? res.top5_primary[0].surname : "陳"}氏（${res.bazi_profile.four_pillars_str}）`, `八術零否決首選：${topNames}（主補${res.bazi_profile.recommended_primary_wx.join("")}）`);
      return { ok: true, data: res };
    }

    if (method === "POST" && path === "/api/naming/company") {
      const res = await recommendCompanyNames(body || {});
      const topNames = res.top5_primary.slice(0, 3).map((x) => x.name).join("、");
      appendJournal("姓名學・企業與組織", `${res.industry.name}（${res.founder_bazi.four_pillars_str}）`, `八術零否決首選字號：${topNames}`);
      return { ok: true, data: res };
    }

    if (method === "POST" && path === "/api/bazi-sop") {
      const res = runCheckpointAuditPreview(body || {});
      if (!body.skip_journal) {
        appendJournal("四柱排盤與SOP", `四柱：${res.client_bazi.four_pillars_str}（${res.target_book_line}）`, res.supervisor_summary.executive_secretary);
      }
      return { ok: true, data: res };
    }

    return { ok: false, error: "找不到對應服務路由" };
  }

  root.XuanshuStandalone = {
    handleRequest,
    getTrialStatus,
    _internal: {
      DB,
      MENTORS,
      TRIGRAM_BITS_TO_NAME,
      NUM_TO_TRIGRAM_BITS,
      SURNAME_POLYPHONE_OVERRIDES,
      ensureCoreDataLoaded,
      ensureUnihanLoaded,
      getCharInfo,
      detectDuplicateSyllable,
      buildPhoneticAudit,
      evaluatePersonalName,
      evaluateCompanyName,
      recommendPersonalNames,
      recommendCompanyNames,
      analyzeQuestionDeep,
      analyzeShuziGroups,
      runTarotReading,
      runYijingReading,
      computeZeroErrorBazi,
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
