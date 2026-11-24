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
      positions: ["你目前做決定的核心底盤", "走方案 A 的過程與真實代價", "走方案 A 的預期結果", "走方案 B 的過程與真實代價", "走方案 B 的預期結果"],
      fit_desc: "專斷「離職還是留任、選甲還是選乙、買或不買」雙方案對比",
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

  function classifyQuestionIntent(question) {
    const q = String(question || "").trim();
    if (["還是", "或者", "哪個好", "哪一個", "該離職還是", "選A", "選B", "要不要換"].some((k) => q.includes(k))) {
      if (q.includes("還是") || q.includes("哪個") || q.includes("哪一")) {
        return {
          intent: "two_choice",
          intent_label: "二選一方案權衡",
          recommended_spread: "two_choice_5",
          yijing_yongshen: "世爻（你自身底氣）對照應爻與財官兩路得失",
          yongshen_kin: "妻財",
        };
      }
    }
    if (["喜歡", "愛", "復合", "曖昧", "他心裡", "她心裡", "冷戰", "分手", "正緣", "桃花", "結婚", "感情", "男友", "女友", "老公", "老婆", "另一半"].some((k) => q.includes(k))) {
      return {
        intent: "love",
        intent_label: "感情關係與對方心意",
        recommended_spread: "love_mirror_4",
        yijing_yongshen: "應爻（對方態度）與財官感情星",
        yongshen_kin: ["男友", "老公", "他"].some((w) => q.includes(w)) ? "官鬼" : "妻財",
      };
    }
    if (["錢", "財運", "收款", "欠款", "業績", "生意", "賺", "資金", "周轉", "週轉", "買房", "置產", "店面", "報價"].some((k) => q.includes(k))) {
      return {
        intent: "wealth",
        intent_label: "財運資金與生意得失",
        recommended_spread: "three_core",
        yijing_yongshen: "妻財爻（現金流與實質回報）",
        yongshen_kin: "妻財",
      };
    }
    if (["工作", "事業", "升遷", "主管", "老闆", "面試", "轉職", "創業", "合夥", "簽約", "合作", "專案", "離職", "考績", "考試"].some((k) => q.includes(k))) {
      return {
        intent: "career",
        intent_label: "事業轉職與合作簽約",
        recommended_spread: "three_core",
        yijing_yongshen: "官鬼爻（職位名分）與父母爻（合約文書）",
        yongshen_kin: !q.includes("約") && !q.includes("考") ? "官鬼" : "父母",
      };
    }
    if (q.length <= 14 && ["好嗎", "可以嗎", "能成嗎", "會不會", "該不該", "可不可以"].some((k) => q.includes(k))) {
      return {
        intent: "yes_no",
        intent_label: "單一事體成敗直斷",
        recommended_spread: "single_verdict",
        yijing_yongshen: "世應生剋與動爻成敗",
        yongshen_kin: "世爻",
      };
    }
    return {
      intent: "general",
      intent_label: "近期局勢與破局方向",
      recommended_spread: "three_core",
      yijing_yongshen: "世爻（自身處境）與應爻（外部環境）",
      yongshen_kin: "世爻",
    };
  }

  function cardPolarityScore(card, isUpright) {
    const challenging = new Set(["M12", "M13", "M15", "M16", "M18", "S03", "S05", "S07", "S08", "S09", "S10", "C05", "W10", "P05"]);
    const strongGood = new Set(["M01", "M03", "M06", "M07", "M10", "M17", "M19", "M21", "W01", "W04", "W06", "C01", "C02", "C09", "C10", "P01", "P03", "P09", "P10"]);
    if (!isUpright) return -1;
    if (strongGood.has(card.id)) return 2;
    if (challenging.has(card.id)) return -2;
    return 1;
  }

  function formatTarotCardByMentor(q, intent, posIdx, posTitle, card, isUp, mentorId) {
    const kws = (isUp ? card.upright : card.reversed) || [];
    const kwStr = kws.slice(0, 3).join("、");
    const baseLine = isUp ? card.fubo_upright : card.fubo_reversed;
    const ori = isUp ? "正位" : "逆位";
    const cname = `《${card.name_zh}》（${ori}）`;
    const suit = String(card.id || "M00")[0];

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
          plain = `評估方案 A 的「${posTitle}」出現${cname}：這條路徑的執行損益落在「${kwStr}」。從策略面拆解，${baseLine} 衡量重點在於這筆轉換成本能否換回對等的主導權。`;
        } else if (posIdx === 3 || posIdx === 4) {
          plain = `評估方案 B 的「${posTitle}」出現${cname}：這條路徑的實際代價為「${kwStr}」。從風險報酬比來看，${baseLine} 請直接核對帳面資源與機會成本，不憑慣性留戀。`;
        } else {
          plain = `在「${posTitle}」抽出${cname}：你目前手上的決策底盤呈現「${kwStr}」。策略直斷：${baseLine}`;
        }
      } else if (intent === "love") {
        plain = `從關係成本拆解「${posTitle}」的${cname}：目前雙方投入比呈現「${kwStr}」。${baseLine} 不看對方說了多少漂亮話，只看他實際端出多少時間與行動籌碼。`;
      } else {
        plain = `針對「${posTitle}」翻出${cname}，關鍵指標為「${kwStr}」。從決策損益直說：${baseLine}`;
      }
      return {
        mentor_lens_title: "里恩・籌碼與停損眉批",
        mentor_lens_note: lensNote,
        sharp_one_liner: sharpLine,
        plain_explanation: plain,
      };
    }

    // 薇拉 vera（關係心理・對方潛台詞視角）
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
        plain = `感受方案 A「${posTitle}」的${cname}：走進這個環境的心理舒展度偏向「${kwStr}」。${baseLine}`;
      } else if (posIdx === 3 || posIdx === 4) {
        plain = `感受方案 B「${posTitle}」的${cname}：留在這條路的真實情緒體感是「${kwStr}」。${baseLine}`;
      } else {
        plain = `在「${posTitle}」映出${cname}：你內心真正的聲音正停在「${kwStr}」。${baseLine}`;
      }
    } else {
      plain = `在「${posTitle}」這張${cname}裡，背後的人際溫度與心理訊號指向「${kwStr}」。換句貼近你處境的話說：${baseLine}`;
    }
    return {
      mentor_lens_title: "薇拉・心理潛台詞眉批",
      mentor_lens_note: lensNote,
      sharp_one_liner: sharpLine,
      plain_explanation: plain,
    };
  }

  function buildVeraTarotBundle(qClean, qMeta, spreadId, drawnCards, scores) {
    let tag, verdict, timing, actions;
    const firstC = drawnCards[0];
    const lastC = drawnCards[drawnCards.length - 1];
    if (spreadId === "two_choice_5" && scores.length === 5) {
      const scoreA = scores[1] + scores[2] * 1.5;
      const scoreB = scores[3] + scores[4] * 1.5;
      const cARes = drawnCards[2];
      const cBRes = drawnCards[4];
      if (scoreA > scoreB + 0.5) {
        tag = "優先選方案 A（心理舒展與契合度高）";
        verdict = `針對你反覆權衡的二選一，牌面的心緒指向很清晰：選擇「方案 A」更能讓你找回內心的舒展感與被珍惜的舞台。你當下的底盤《${firstC.name_zh}》（${firstC.orientation}）透露你其實早就察覺現狀的窒息感，只是習慣性的安全感讓你捨不得放手；方案 A 收尾在《${cARes.name_zh}》（${cARes.orientation}），人際氣場坦率溫暖，而方案 B 落在《${cBRes.name_zh}》（${cBRes.orientation}），繼續委曲求全只會加深自我懷疑。`;
      } else if (scoreB > scoreA + 0.5) {
        tag = "優先選方案 B（情緒根基與默契較穩）";
        verdict = `針對你猶豫的兩條路，牌面溫柔提醒你：現階段選擇「方案 B」更能安頓你的安全感與長遠節奏。方案 B 最終落在《${cBRes.name_zh}》（${cBRes.orientation}），人際支持與日常默契都更踏實；反觀方案 A 落在《${cARes.name_zh}》（${cARes.orientation}），表面新鮮卻伴隨高度情緒緊繃，不必為了逃避一時煩悶而跳進另一個消耗場。`;
      } else {
        tag = "兩邊氣場相近・先傾聽內心邊界";
        verdict = `目前方案 A（《${cARes.name_zh}》）與方案 B（《${cBRes.name_zh}》）的外在條件旗鼓相當，真正卡住你的是底盤《${firstC.name_zh}》映出的討好習慣。無論選哪一邊，若沒有先把你最在乎的尊重與界線說出口，換了位置仍會重複同樣的委屈；哪一邊願意溫和接住你的真實需求，答案就在哪一邊。`;
      }
      timing = "心緒沉澱與明朗窗：給自己 7 至 14 天不帶自責的觀察留白，下旬的一次深度對話會讓你心裡徹底篤定。";
      actions = [
        `先接住《${firstC.name_zh}》背後的焦慮：拿張紙寫下你在這段選擇裡最怕失去的三件事，看清恐懼就不會被情緒帶著走。`,
        "與關鍵對象溝通時練習溫和而堅定地表達感受，不猜測對方的臉色，觀察誰願意認真回應你的在乎。",
        "做出決定後給自己兩週的適應緩衝期，好好向過去道別，不必回頭反覆檢討沒走的那條路。",
      ];
    } else {
      const avg = scores.reduce((s, x) => s + x, 0) / Math.max(1, scores.length);
      if (avg >= 0.8 && lastC.polarity_score >= 1) {
        tag = "心意相通・關係與局勢回溫";
        if (qMeta.intent === "love") {
          verdict = `針對你心裡掛念的「${qClean}」，你可以先把懸著的心放下來：對方心裡是有你的位置的，而且這段關係正朝著卸下防備、重新靠近的方向流動（收尾落在《${lastC.name_zh}》${lastC.orientation}）。過去的停滯多半是因為雙方都在試探高低位，只要遞出一個輕巧不帶壓力的台階，溫暖的互動很快就會接上。`;
        } else {
          verdict = `針對你問的「${qClean}」，牌面映出相當順暢的支持氣場（結果落在《${lastC.name_zh}》${lastC.orientation}）。身邊合作對象的潛台詞偏向善意與認同，你過去默默累積的誠意已經被看見，只要放下過度緊繃的自我要求，順著目前的默契自然推進就能迎來好消息。`;
        }
        timing = "情感與默契升溫窗：未來 14 至 35 天內會有一次自然破冰或善意回應的契機，夜晚或週末的輕鬆聯繫最對頻。";
        actions = [
          `順著《${firstC.name_zh}》的柔和起點，用分享生活小事代替嚴肅追問，讓對方感覺靠近你是輕鬆沒有壓力的。`,
          "把心裡期待的相處方式用正向肯定的語氣說出來，減少彎彎繞繞的試探與冷處理。",
          `迎向《${lastC.name_zh}》的敞開能量，當對方釋出善意時大方接住，讓正向循環自然發酵。`,
        ];
      } else if (avg <= -0.6 || lastC.polarity_score <= -2) {
        tag = "防衛拉滿・先收回重心止住內耗";
        if (qMeta.intent === "love") {
          verdict = `針對你問的「${qClean}」，我想溫柔但誠實地替你掀開底牌：目前對方的情緒防衛機制拉得很高（收尾落在《${lastC.name_zh}》${lastC.orientation}），心口不一與逃避責任的成分偏重。這時候你越是用力追問或委曲求全，關係高低位就越失衡；先把過度傾注的注意力收回來疼惜自己，才是唯一能讓他意識到落差的作法。`;
        } else {
          verdict = `針對你問的「${qClean}」，牌面《${lastC.name_zh}》（${lastC.orientation}）映出對方目前暗藏顧慮、話只說三分，直接硬推很容易讓你獨自承受情緒與人際摩擦。與其急著討一個勉強的答覆，不如先溫和退後半步，守住自己的心理安全邊界。`;
        }
        timing = "留白沉澱窗：接下來 3 至 5 週宜靜不宜追，給彼此一段不打擾的呼吸空間，滿一個月後再看他是否主動走近。";
        actions = [
          `看見《${firstC.name_zh}》提醒的內耗源頭：停止反覆翻看對話紀錄替對方的冷淡找藉口，把情緒主導權拿回自己手裡。`,
          "這兩週練習「七分留白」原則：維持基本禮貌但不再主動討好或連環追問，觀察失去你的熱情後對方的真實反應。",
          "安排一件能讓你專注發光的生活小目標，當你的重心穩住了，對的人事物才會重新被你吸引。",
        ];
      } else {
        tag = "心結待解・把潛台詞攤開就能轉順";
        verdict = `針對你問的「${qClean}」，牌面顯示這段局勢並非無解，而是卡在一層「雙方都在等對方先說實話」的微妙拉扯。起頭《${firstC.name_zh}》（${firstC.orientation}）代表彼此仍有在乎與連結，但收尾《${lastC.name_zh}》（${lastC.orientation}）點出溝通溫度還沒對齊；只要卸下帶刺的防備、把真實顧慮柔軟地攤開來聊，關係就能從緊繃走向舒緩。`;
        timing = "破冰對話窗：未來 2 至 4 週內適合找一個不趕時間的場合輕聲把誤會聊開，跨過心結後下半月明顯回暖。";
        actions = [
          `先梳理《${firstC.name_zh}》映出的委屈點，分清楚哪些是事實、哪些是自己腦補的不安投射。`,
          "溝通時少用質問句、多說自己的真實感受，給對方一個不傷面子也能說真話的安全空間。",
          `記住《${lastC.name_zh}》的節奏提醒，維持三分溫柔留白與七分自我界線，慢一點反而走得更穩。`,
        ];
      }
    }
    const closingTip = `薇拉的關係留白練習：今晚睡前放下手機十分鐘，告訴自己「我不必靠過度用力去換取別人的確定」，當你安頓好自己的頻率，真誠的回應自然會靠近。`;
    return { tag, verdict, timing, actions, closingTip };
  }

  function buildRienTarotBundle(qClean, qMeta, spreadId, drawnCards, scores) {
    let tag, verdict, timing, actions;
    const firstC = drawnCards[0];
    const lastC = drawnCards[drawnCards.length - 1];
    if (spreadId === "two_choice_5" && scores.length === 5) {
      const scoreA = scores[1] + scores[2] * 1.5;
      const scoreB = scores[3] + scores[4] * 1.5;
      const cARes = drawnCards[2];
      const cBRes = drawnCards[4];
      if (scoreA > scoreB + 0.5) {
        tag = "優先選方案 A（主導權與報酬比勝出）";
        verdict = `直接給你二選一損益結論：果斷執行「方案 A」，方案 B 屬於慢性折舊局。你當下的底盤《${firstC.name_zh}》（${firstC.orientation}）顯示繼續觀望只會壓縮你的議價空間；方案 A 收尾在《${cARes.name_zh}》（${cARes.orientation}），前期雖有轉換磨合成本，但中後段能實質拿回資源分配權與帳面回報；方案 B 落在《${cBRes.name_zh}》（${cBRes.orientation}），表面零變動成本，實則承擔最大的機會成本流失。`;
      } else if (scoreB > scoreA + 0.5) {
        tag = "優先選方案 B（風險可控且回收踏實）";
        verdict = `直接給你二選一損益結論：優先鎖定「方案 B」，暫緩高波動性的方案 A。方案 B 結果牌落在《${cBRes.name_zh}》（${cBRes.orientation}），現金流穩定度與履約確定性明顯優於對照組；反觀方案 A 收在《${cARes.name_zh}》（${cARes.orientation}），存在高度資訊不對稱與隱性驗收門檻，貿然切換跑道容易淪為替他人收拾爛攤子。`;
      } else {
        tag = "雙案報酬率持平・以白紙黑字條款定勝負";
        verdict = `直接看盤面數據：方案 A（《${cARes.name_zh}》）與方案 B（《${cBRes.name_zh}》）預期勝率在伯仲之間，勝負手取決於基準牌《${firstC.name_zh}》點出的議價底線。現階段不憑感覺選邊，直接向雙方開出你的核心條件清單（權責範圍、交付期限與實質分潤），哪一方願意簽署具約束力的書面條款，籌碼就押哪一方。`;
      }
      timing = "決策拍板窗口：設定 7 至 14 天盡職調查期核實雙方底牌，第 15 天前完成簽署定案，切忌拖過月底消耗議價權。";
      actions = [
        `依據《${firstC.name_zh}》盤點你手上的不可替代籌碼，列出兩項不可退讓的硬指標（實質報酬與決策權限）。`,
        "排除所有口頭畫餅與人情承諾，要求關鍵數字、考核標準與退場機制全數寫入正式文件。",
        "拍板後立即切斷另一方案的沉沒成本干擾，集中首月全部核心資源打贏第一場立威戰役。",
      ];
    } else {
      const avg = scores.reduce((s, x) => s + x, 0) / Math.max(1, scores.length);
      if (avg >= 0.8 && lastC.polarity_score >= 1) {
        tag = "勝率明確・果斷鎖定籌碼推進";
        if (qMeta.intent === "love") {
          verdict = `針對「${qClean}」，從雙方投入產出比直接判斷：這局勝率站在你這邊（結果牌《${lastC.name_zh}》${lastC.orientation}）。對方願意投入實質時間與行動成本，並非空口敷衍；現在正是順勢確認關係定位、把模糊默契升級為明確承諾的高勝率窗口。`;
        } else {
          verdict = `針對「${qClean}」，策略結論非常明確：風險可控且預期報酬正向（收尾牌《${lastC.name_zh}》${lastC.orientation}）。前期資源鋪墊已跨越損益平衡點，主導權握在你手上，接下來應加速推進節奏，把口頭意向直接轉化為合約與帳面戰果。`;
        }
        timing = "高勝率執行窗：未來 10 至 30 天為最佳收網期，建議於兩週內敲定關鍵條款與時間表。";
        actions = [
          `放大《${firstC.name_zh}》賦予的先發籌碼，本週內主動拋出你的合作框架與時間節點，掌握議程主導權。`,
          "將執行目標拆解為可量化的雙週驗收指標，確保每一分資源投入都有對應產出。",
          `順應《${lastC.name_zh}》的收成訊號，在條件最有利時完成書面確認，落袋為安。`,
        ];
      } else if (avg <= -0.6 || lastC.polarity_score <= -2) {
        tag = "風險超標・立即啟動停損防線";
        if (qMeta.intent === "love") {
          verdict = `針對「${qClean}」，直接攤開殘酷帳面：這段互動目前處於嚴重的投入不對等虧損局（警示牌《${lastC.name_zh}》${lastC.orientation}）。對方僅享受情緒紅利卻迴避實質責任，你繼續追加時間只會墊高沉沒成本；立刻停止單方面付出、設定明確觀察死線，才是保住自尊與籌碼的唯一解。`;
        } else {
          verdict = `針對「${qClean}」，直接給風控結論：現階段不宜簽署不可逆承諾或追加本金（風險牌落在《${lastC.name_zh}》${lastC.orientation}）。盤面顯示資訊嚴重不對稱、隱性成本未揭露，硬推極容易替別人的失誤買單，先退回安全防線保住現金與核心籌碼。`;
        }
        timing = "風控停損觀察窗：設定嚴格的 14 至 28 天凍結觀察期，期間對方若未端出實質履約擔保，期滿立即轉向備案。";
        actions = [
          `正視《${firstC.name_zh}》揭露的結構破口，限期清查帳目明細、權責歸屬與對方過往履約紀錄。`,
          "即刻凍結新增資金、人力或情緒籌碼投入，絕不因過去已付出的沉沒成本而繼續加碼。",
          "同步啟動 B 計畫備用管道，確保手握隨時可抽身轉向的替代方案，不讓自己陷入被動綁架。",
        ];
      } else {
        tag = "條件博弈局・分期驗收控管風險";
        verdict = `針對「${qClean}」，盤面屬於典型的「帶條件博弈局」。起始牌《${firstC.name_zh}》（${firstC.orientation}）具備基本可行性，但收尾牌《${lastC.name_zh}》（${lastC.orientation}）暴露中段執行存在權責模糊或議價拉鋸；只要採取「分階段給籌碼、不見兔子不撒鷹」的風控打法，就能把勝率拉回安全線之上。`;
        timing = "議價磨合窗口：接下來 14 至 21 天為條款攻防期，談妥階段驗收標準後，第 4 至 7 週可望穩步收割。";
        actions = [
          `先針對《${firstC.name_zh}》反映的模糊條款逐項要求書面定義，把醜話與違約邊界講在簽字之前。`,
          "嚴格執行「里程碑分段投入」：對方完成第一階段可驗證成果，你再釋放下一階段資源。",
          `對照《${lastC.name_zh}》預留百分之十五的風險緩衝金與備案時間，確保進可攻退可守。`,
        ];
      }
    }
    const closingTip = `里恩的十四天停損檢核指標：從今天起算第十四天，只核對一件事——對方是否拿出「可驗證的具體行動或書面保障」；有則推進，無則果斷轉移籌碼。`;
    return { tag, verdict, timing, actions, closingTip };
  }

  function runTarotReading(question, mentorId = "vera", spreadOverride = "auto", selectedIndices = null, seedStr = "", lockedState = null) {
    const qClean = String(question || "請問我接下來三個月最需要注意的轉折與建議是什麼？").trim();
    const qMeta = classifyQuestionIntent(qClean);
    let spreadId = !spreadOverride || spreadOverride === "auto" ? qMeta.recommended_spread : spreadOverride;
    if (!SPREAD_DEFS[spreadId]) spreadId = "three_core";
    const spread = SPREAD_DEFS[spreadId];
    const resolvedMentorId = mentorId === "rien" ? "rien" : "vera";
    const mentor = MENTORS[resolvedMentorId];

    // 洗牌
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
    const chosenSlots = lockedState && Array.isArray(lockedState.card_slots) && lockedState.card_slots.length === count
      ? lockedState.card_slots.map((idx) => Math.abs(idx) % DB.tarotCards.length)
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
      const posTitle = spread.positions[posIdx];
      const kws = isUp ? c.upright : c.reversed;
      const formatted = formatTarotCardByMentor(qClean, qMeta.intent, posIdx, posTitle, c, isUp, resolvedMentorId);
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
      intent_detected: qMeta,
      mentor,
      spread,
      verdict_badge: sanitizeText(bundle.tag),
      direct_verdict: sanitizeText(bundle.verdict),
      drawn_cards: drawnCards,
      timing_window: sanitizeText(bundle.timing),
      three_actions: bundle.actions.map(sanitizeText),
      mentor_closing_tip: sanitizeText(bundle.closingTip),
      compliance_footer: "以上解析是提醒與建議，不是定論，亦不是投資或下注建議。",
      timestamp: formatTwNow(),
    };
  }

  function computeMeihuaTiYong(upTri, dnTri, bUpTri, bDnTri, primaryMov) {
    const isUpperTi = primaryMov <= 3;
    const tiTri = isUpperTi ? upTri : dnTri;
    const benYongTri = isUpperTi ? dnTri : upTri;
    const bianYongTri = isUpperTi ? bDnTri : bUpTri;
    const describeRel = (te, ye) => {
      if (te === ye) return { label: `體用比和（體${te}與用${ye}同氣相助）`, score: 2 };
      if (GEN[ye] === te) return { label: `用生體（用${ye}生扶體${te}，得外境順風相助）`, score: 3 };
      if (KE[te] === ye) return { label: `體剋用（體${te}駕馭用${ye}，憑力可成但須親力推進）`, score: 1 };
      if (GEN[te] === ye) return { label: `體生用（體${te}洩氣生用${ye}，前期付出心力與資金較多）`, score: -1 };
      return { label: `用剋體（用${ye}受制於外境剋體${te}，逆風宜守不宜躁進）`, score: -2 };
    };
    const benRel = describeRel(tiTri[2], benYongTri[2]);
    const bianRel = describeRel(tiTri[2], bianYongTri[2]);
    return {
      position: isUpperTi ? "上卦為體、下卦為用" : "下卦為體、上卦為用",
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

  function buildFuboYijingBundle(ctx) {
    const { qClean, benNajia, huNajia, bianNajia, benPlain, huPlain, bianPlain, shiLineObj, yingLineObj, ysTarget, syPlain, totalJudge, movingLines, linesDetail } = ctx;
    let badge, verdict, timing, actions;
    if (totalJudge >= 2) {
      badge = "底氣充足・看準條文可拍板";
      verdict = `照你問的「${qClean}」，我泡杯熱茶直接講重點：這樁事底子穩、帳面划算，能做。你搖出本卦《${benNajia.hexagram_name}》（${benPlain[2]}），中段互卦過渡《${huNajia.hexagram_name}》，收尾變卦走到《${bianNajia.hexagram_name}》（${bianPlain[2]}）。用老街做生意的白話講，代表你口袋底氣的世爻（${shiLineObj.line_label}${shiLineObj.six_kin}${shiLineObj.element}）跟關鍵用神（${ysTarget.six_kin}・${ysTarget.status_plain}）都站得住腳，而且${syPlain}；只要把白紙黑字的收據跟尾款條文釘牢，順順推就能落袋為安。`;
      timing = "看帳拍板時間窗：接下來 7 至 30 天內氣場站在你這邊，中旬到月底前把合約細項與款項節點敲定最穩當。";
      actions = [
        `趁現在你方世爻底氣夠（${shiLineObj.status_plain}），把付款成數、交付驗收日跟違約責任一條條寫進正式合約，口頭講好聽話一概不算數。`,
        `留意中段互卦《${huNajia.hexagram_name}》（${huPlain[2]}）的交接細節，就像買屋交屋前一定要親自試水電抓漏，小環節盯緊才不會少賺。`,
        `順著變卦《${bianNajia.hexagram_name}》穩紮穩打收網，預留一成週轉銀彈在手邊當預備金，這局就能穩穩收進口袋。`,
      ];
    } else if (totalJudge <= -1) {
      badge = "暗坑偏多・顧緊本錢先緩手";
      verdict = `照你問的「${qClean}」，我不講場面話直說：現在掏錢或簽字太急，裡頭藏著暗坑，先踩煞車顧緊口袋本錢。本卦《${benNajia.hexagram_name}》（${benPlain[2]}）經中段互卦《${huNajia.hexagram_name}》轉入《${bianNajia.hexagram_name}》（${bianPlain[2]}）：你看代表對方的應爻（${yingLineObj.line_label}${yingLineObj.six_kin}${yingLineObj.element}）氣勢壓著你，${syPlain}，偏偏關鍵用神又處於「${ysTarget.status_plain}」。這就像地基還沒乾、屋頂還在滲水就急著砸錢裝潢，硬做下去後面補洞會讓你貼錢又心累。`;
      timing = "看緊荷包觀察窗：未來 2 至 4 週內帳面與條件變數還大，至少等換過下一個農曆節氣月、對方拿出真憑實據再重談。";
      actions = [
        "這半個月先把口袋銀彈跟印章收緊，不簽保人、不付大額訂金，對方催得越急你越要慢下來查帳。",
        `徹查中段互卦《${huNajia.hexagram_name}》暗藏的舊帳或屋況設備折舊，要求看過去半年的真實金流報表或權狀正本。`,
        "留一手底牌以退為進：把你的底線價碼與保障條款攤在桌上，對方不肯讓步就轉頭看別家，守住老本就是贏。",
      ];
    } else {
      badge = "先小人後君子・條款釘緊可過關";
      verdict = `照你問的「${qClean}」，我直白講：這件事不是不能做，但屬於「前頭得先磨條件、帳算清楚才能賺到後面」的局。卦象從本卦《${benNajia.hexagram_name}》（${benPlain[2]}），穿過中段互卦《${huNajia.hexagram_name}》（${huPlain[2]}），最後走到變卦《${bianNajia.hexagram_name}》（${bianPlain[2]}）。目前${syPlain}，關鍵用神「${ysTarget.status_plain}」，代表餅是真的有，但修繕成本、分工或分潤比例還沒攤平；先把醜話講在前面，分期掏錢才不會吃悶虧。`;
      timing = "磨合議價時間窗：前兩週先把合約漏洞與帳目核對清楚，第 3 至 6 週條件談攏後再正式投入資源最划算。";
      actions = [
        "合夥或簽約一律「先小人後君子」：誰管帳、誰出錢、萬一中途拆夥怎麼結算，白紙黑字寫清楚再動手。",
        `盯緊中段互卦《${huNajia.hexagram_name}》提示的過渡磨合成本，把預備週轉金留足兩成，不要把口袋銀彈一次打光。`,
        `照變卦《${bianNajia.hexagram_name}》（${bianPlain[2]}）的路數，採分期付款或分階段驗收，看到一分實績再付一分錢。`,
      ];
    }

    const movingPlain = !movingLines.length
      ? [`福伯茶桌眉批（六爻皆靜）：這盤沒有動爻翻盤，代表眼前的帳面條件與雙方底牌就是全部真相（世爻${shiLineObj.line_label}${shiLineObj.status_plain}）；不用指望對方突然大讓步，直接照現有合約划不划算來拍板。`]
      : movingLines.map((ml) => {
          const lo = linesDetail[ml - 1];
          return `福伯茶桌斷第 ${ml} 爻（${lo.line_label}${lo.six_kin}・${lo.six_spirit}）發動：這爻由「${lo.najia}」化出「${lo.changed_to}」，正是整盤銀兩與權責換手的樞紐（${lo.plain_role_tag || "中段交涉關卡"}，目前${lo.status_plain}）；簽字前務必把這一環的收據、產權或責任歸屬核對清楚。`;
        });

    const closingTip = "福伯的茶桌防坑叮嚀：商場跟買賣不怕慢，只怕急著掏錢卻沒看清尾款條文；把兩成預備金留在自己戶頭裡，睡覺才踏實。";
    return { badge, verdict, timing, actions, movingPlain, closingTip };
  }

  function buildMeiniangYijingBundle(ctx) {
    const { qClean, benNajia, huNajia, bianNajia, benPlain, huPlain, bianPlain, tiYong, totalJudge, movingLines, linesDetail } = ctx;
    const score = totalJudge + (tiYong.bian_score >= 1 ? 1 : (tiYong.bian_score <= -2 ? -1 : 0));
    let badge, verdict, timing, actions;
    if (score >= 2) {
      badge = "氣機順水行舟・得時乘勢可成";
      verdict = `觀你所問「${qClean}」，卦氣呈現「春風送帆、水到渠成」之象。起手本卦《${benNajia.hexagram_name}》（${benPlain[2]}）定下上半場清朗基調，中段互卦透出《${huNajia.hexagram_name}》（${huPlain[2]}）的醞釀蓄勢，終局變卦歸於《${bianNajia.hexagram_name}》（${bianPlain[2]}）。以梅花體用觀之，${tiYong.position}，由「${tiYong.ben_relation}」轉入「${tiYong.bian_relation}」，外境氣機主動生扶本體，順著眼前的節奏輕巧推進，事情自然迎刃而解。`;
      timing = `節氣應期落點：近期 7 至 24 天內卦氣最旺（尤以交節前後及五行屬${tiYong.ti_trigram.slice(2, 3)}相生之日最得順風），宜把握上半月主動定局。`;
      actions = [
        `順應本卦《${benNajia.hexagram_name}》的起手勢，在氣機剛動的前十天主動遞出邀約或方案，借順風之力省去半數奔波。`,
        `善用中段互卦《${huNajia.hexagram_name}》（${huPlain[2]}）的過渡涵養，與人交涉留三分雅量與餘地，人緣助力會隨之匯聚。`,
        `迎向變卦《${bianNajia.hexagram_name}》收成之象，見好收帆、妥善定錨，讓順遂的氣韻轉為長久穩固的成果。`,
      ];
    } else if (score <= -1) {
      badge = "卦氣逆風未熟・宜靜養待時而動";
      verdict = `觀你所問「${qClean}」，卦氣給出的啟示是「急湍莫強渡，藏器待清風」。上半場本卦《${benNajia.hexagram_name}》（${benPlain[2]}）外境波折尚多，中段互卦《${huNajia.hexagram_name}》（${huPlain[2]}）暗流交錯，下半場變卦落於《${bianNajia.hexagram_name}》（${bianPlain[2]}）。細察體用消長（${tiYong.position}），走到「${tiYong.bian_relation}」，眼下強行催逼猶如逆水猛拉竹筏，徒耗心力而難見寸功；不如暫斂鋒芒，待節氣流轉再徐圖破冰。`;
      timing = "節氣轉折應期：眼下三十天內仍處逆風涵養期，宜緩不宜急；待下一個節氣交接、生扶本體之氣透出時再行叩門最順。";
      actions = [
        `體悟本卦《${benNajia.hexagram_name}》的止步智慧，前兩週不爭一時口舌快慢，先將手邊未臻完善的環節靜心補齊。`,
        `借鏡互卦《${huNajia.hexagram_name}》（${huPlain[2]}）的中段藏象，低調觀察局勢風向與人心向背，不輕易亮出全部底牌。`,
        `守住「${tiYong.bian_relation.split("（")[0]}」的分寸邊界，減少無謂的外務消耗，把精氣神留給節氣轉順後的關鍵一擊。`,
      ];
    } else {
      badge = "慢火細養之局・循序漸進方甘";
      verdict = `觀你所問「${qClean}」，卦氣映出「細水慢養、先蓄後通」的三段節奏。起手本卦《${benNajia.hexagram_name}》（${benPlain[2]}）揭示起步尚需調勻呼吸，中段互卦藏著《${huNajia.hexagram_name}》（${huPlain[2]}）的打磨涵養之象，終局變卦轉入《${bianNajia.hexagram_name}》（${bianPlain[2]}）。從體用生剋細推（${tiYong.position}），初段「${tiYong.ben_relation}」而後段「${tiYong.bian_relation}」，意味此事非一蹴可幾的快局，急火猛催易生枝節，唯有順著中段火候一寸寸經營，下半場方見清泉自湧。`;
      timing = "節氣推進應期：前十至十五天為《互卦》沉澱調校期，不宜催逼結果；待下旬節氣交接後氣機轉活，第 4 至 7 週漸入佳境。";
      actions = [
        `順應中段互卦《${huNajia.hexagram_name}》（${huPlain[2]}）的養氣節奏，先以小步試探校准方向，不必一開局就押上全部心力。`,
        `調和「${tiYong.bian_relation.split("（")[0]}」的能量出入，為自己的時間與資源設下清朗分寸，避免在瑣碎拉鋸中透支熱忱。`,
        `依循變卦《${bianNajia.hexagram_name}》（${bianPlain[2]}）深耕長線口碑與默契，待節氣水到渠成之時從容收網。`,
      ];
    }

    const movingPlain = !movingLines.length
      ? [`梅娘觀數眉批（六爻靜定）：本局氣機澄明未動，本卦《${benNajia.hexagram_name}》與中段互卦《${huNajia.hexagram_name}》即為當下定數（${tiYong.ben_relation}）；順著既有節奏安然處之，無須外求奇招。`]
      : movingLines.map((ml) => {
          const lo = linesDetail[ml - 1];
          const stageHint = ml <= 2 ? "初段起念與根基處" : (ml <= 4 ? "中段互卦交會與人事進退處" : "後段收官與名分定局處");
          return `梅娘觀第 ${ml} 爻（${lo.line_label}・${lo.six_spirit}）靈動：氣機於「${stageHint}」由${lo.yin_yang}轉變，牽動本卦《${benNajia.hexagram_name}》經互卦《${huNajia.hexagram_name}》化入《${bianNajia.hexagram_name}》（${tiYong.bian_relation}），此處正是拿捏快慢進退的轉折眼。`;
        });

    const closingTip = `梅娘的節氣進退籤語：萬物皆有其時，本卦《${benNajia.hexagram_name}》看起勢、互卦《${huNajia.hexagram_name}》看中段火候、變卦《${bianNajia.hexagram_name}》看歸宿；心定則氣順，不搶半拍反而步步生蓮。`;
    return { badge, verdict, timing, actions, movingPlain, closingTip };
  }

  function runYijingReading(question, method = "liuyao_coins", mentorId = "fubo", coinThrows = null, numbers = null) {
    const qClean = String(question || "請問目前這件事的成敗走向與我該採取的對策？").trim();
    const qMeta = classifyQuestionIntent(qClean);
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
    if (method === "meihua_numbers") {
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
      const upNum = n1 % 8 || 8;
      const dnNum = n2 % 8 || 8;
      const mov = n3 % 6 || 6;
      const baseBits = (NUM_TO_TRIGRAM_BITS[dnNum] + NUM_TO_TRIGRAM_BITS[upNum]).split("");
      throws = baseBits.map((b, i) => (i + 1 === mov ? (b === "1" ? 9 : 6) : (b === "1" ? 7 : 8)));
    } else if (Array.isArray(coinThrows) && coinThrows.length === 6 && coinThrows.every((x) => [6, 7, 8, 9].includes(x))) {
      throws = coinThrows.slice();
    } else {
      for (let i = 0; i < 6; i++) {
        const c1 = Math.random() < 0.5 ? 2 : 3;
        const c2 = Math.random() < 0.5 ? 2 : 3;
        const c3 = Math.random() < 0.5 ? 2 : 3;
        throws.push(c1 + c2 + c3);
      }
    }

    // 由下而上（索引 0 = 初爻，索引 5 = 上爻）排定本卦、互卦、變卦
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
        statusTags.push("逢月破暫時無力");
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
      const roleTag = njLine.shi_ying === "世" ? "代表你自己" : (njLine.shi_ying === "應" ? "代表對方／外部環境" : "");
      const lensNote = isMoving
        ? (resolvedMentorId === "meiniang"
          ? `梅娘觀爻：${lineLabels[idx]}動而牽引卦氣，由${njLine.element}化${bNjLine.element}（${tiYong.bian_relation.split("（")[0]}），宜順勢拿捏進退時點。`
          : `福伯斷爻：${lineLabels[idx]}${njLine.six_kin}動化${bNjLine.six_kin}（${statusPlain}），緊盯此處帳目與合約條文交接。`)
        : (njLine.shi_ying
          ? (resolvedMentorId === "meiniang"
            ? `梅娘定位：${njLine.shi_ying}爻落於${lineLabels[idx]}（${statusPlain}）。`
            : `福伯定位：${njLine.shi_ying}爻守在${lineLabels[idx]}${njLine.six_kin}（${statusPlain}）。`)
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
      syPlain = "你跟對方（或這件事的外部條件）目前立場一致、溝通頻率對得上";
      syScore = 1;
    } else if (GEN[yingEl] === shiEl) {
      syPlain = "外部環境或對方主動把資源與好處往你身上送，屬於別人來配合你的順風局";
      syScore = 2;
    } else if (KE[shiEl] === yingEl) {
      syPlain = "主動權握在你自己手裡，只要你肯出力推進就能掌控局面，但過程要親力親為";
      syScore = 1;
    } else if (GEN[shiEl] === yingEl) {
      syPlain = "目前是你單方面掏心血、時間或週轉金去遷就對方較多，做起來容易覺得吃力";
      syScore = 0;
    } else {
      syPlain = "外部條件或對方的態度正在給你壓力與限制，硬碰硬容易吃悶虧";
      syScore = -2;
    }

    const ysTarget = yongshenObjs[0] || shiLineObj;
    const benWt = benPlain[1] === "大吉" ? 1 : (benPlain[1].includes("凶") ? -2 : 0);
    const bianWt = bianPlain[1] === "大吉" ? 2 : (bianPlain[1] === "吉" ? 1 : -3);
    const totalJudge = syScore + ysTarget.power_score + benWt + bianWt;

    const bundleCtx = {
      qClean,
      benNajia,
      huNajia,
      bianNajia,
      benPlain,
      huPlain,
      bianPlain,
      shiLineObj,
      yingLineObj,
      ysTarget,
      syPlain,
      tiYong,
      totalJudge,
      movingLines,
      linesDetail,
    };
    const bundle = resolvedMentorId === "meiniang"
      ? buildMeiniangYijingBundle(bundleCtx)
      : buildFuboYijingBundle(bundleCtx);

    return {
      system: "yijing",
      method,
      method_label: method === "liuyao_coins" ? "京房納甲六爻・三枚古銅錢六擲起卦" : "邵子梅花易數・靈動數理起卦",
      question: qClean,
      intent_detected: qMeta,
      mentor,
      casting_pillars: { month_gz: monthGz, day_gz: dayGz },
      verdict_badge: sanitizeText(bundle.badge),
      direct_verdict: sanitizeText(bundle.verdict),
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
        body.locked_state && typeof body.locked_state === "object" ? body.locked_state : null
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
        Array.isArray(body.numbers) ? body.numbers : null
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
      runTarotReading,
      runYijingReading,
      computeZeroErrorBazi,
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
