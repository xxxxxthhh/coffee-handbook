/* 全书唯一真值源：Part / 章节顺序与标题。
   目录页、导航链、附录页全部由此推导（QUALITY.md 第 4 条：能程序推导的一律推导）。
   任何页面禁止写死章节数、条目数。 */

export const PARTS = [
  { n: '0', en: 'Prologue',     zh: '导读',   blurb: '一杯咖啡的风味由哪几层决定' },
  { n: '1', en: 'Extraction',   zh: '萃取',   blurb: '全书的物理心脏：溶解发生了什么' },
  { n: '2', en: 'Roasting',     zh: '烘焙',   blurb: '风味是在火里被写好的' },
  { n: '3', en: 'Water',        zh: '水',     blurb: '被低估最狠的变量' },
  { n: '4', en: 'Sensory',      zh: '感官',   blurb: '校准你的舌头这台仪器' },
  { n: '5', en: 'Brew Methods', zh: '冲煮方法学', blurb: '不同器具其实是不同的萃取模型' }
];

/* lab: 章节交互实验的模块名（对应 assets/labs/<lab>.js），全部章节均有交互 */
export const CHAPTERS = [
  { id:'0.1', part:'0', slug:'0-1-four-layers',              en:'Four Layers of Flavor',        zh:'风味的四层来源',           blurb:'品种与产地 → 处理法 → 烘焙 → 冲煮：每一层锁死什么、留给下游什么', lab:'0-1-four-layers' },
  { id:'0.2', part:'0', slug:'0-2-how-to-read',              en:'How to Read This Book',        zh:'这本书怎么读：先猜、再玩、后懂', blurb:'通识线五要素为什么是这个顺序',                      lab:'0-2-how-to-read' },
  { id:'0.3', part:'0', slug:'0-3-where-myths-come-from',    en:'Where the Myths Come From',    zh:'「玄学」的来源',           blurb:'变量耦合 + 感官偏差：本书要拆开的两团乱麻',           lab:'0-3-where-myths-come-from' },

  { id:'1.1', part:'1', slug:'1-1-dissolution-order',        en:'The Order of Dissolution',     zh:'溶解的顺序',               blurb:'酸、糖、苦味物质溶出速率不同——萃取不足偏酸、过萃偏苦的机制源头', lab:'1-1-dissolution-order' },
  { id:'1.2', part:'1', slug:'1-2-six-variables',            en:'Six Brewing Variables',        zh:'六大冲煮变量',             blurb:'研磨度、水温、时间、粉水比、搅动、水质：每个旋钮把萃取率推向哪边', lab:'1-2-six-variables' },
  { id:'1.3', part:'1', slug:'1-3-control-chart',            en:'Strength vs Extraction',       zh:'萃取率与浓度',             blurb:'冲煮控制图：一张图管住所有变量，九宫格诊断',            lab:'1-3-control-chart' },
  { id:'1.4', part:'1', slug:'1-4-espresso-pressure',        en:'Extraction Under Pressure',    zh:'压力下的萃取：意式浓缩',    blurb:'为什么极浓却常常萃取不足：通道效应与均匀度',            lab:'1-4-espresso-pressure' },

  { id:'2.1', part:'2', slug:'2-1-roast-chemistry',          en:'The Chemistry of Roasting',    zh:'烘焙中的化学',             blurb:'美拉德反应与焦糖化、一爆二爆的物理、发展度',            lab:'2-1-roast-chemistry' },
  { id:'2.2', part:'2', slug:'2-2-roast-level-flavor',       en:'Roast Level and Flavor',       zh:'烘焙度与风味走向',         blurb:'用酸质换苦甜，以及烘焙度如何搬动最佳萃取率区间',        lab:'2-2-roast-level-flavor' },
  { id:'2.3', part:'2', slug:'2-3-degassing',                en:'Degassing and Rest',           zh:'养豆与排气',               blurb:'CO₂ 排气如何搅乱萃取稳定性，不同冲煮法的赏味窗口',      lab:'2-3-degassing' },

  { id:'3.1', part:'3', slug:'3-1-minerals',                 en:'What Minerals Do',             zh:'矿物质的角色',             blurb:'硬度是萃取的「手」，碱度是酸质的「缓冲垫」',            lab:'3-1-minerals' },
  { id:'3.2', part:'3', slug:'3-2-water-recipes',            en:'Building Your Water',          zh:'配水实践',                 blurb:'从纯净水自配冲煮水：母液、稀释与可复算的浓度',          lab:'3-2-water-recipes' },

  { id:'4.1', part:'4', slug:'4-1-flavor-wheel',             en:'The Flavor Wheel',             zh:'风味轮与描述词校准',       blurb:'描述词是坐标系不是玄学：如何建立自己的参照样本',        lab:'4-1-flavor-wheel' },
  { id:'4.2', part:'4', slug:'4-2-cupping',                  en:'Cupping Protocol',             zh:'杯测方法',                 blurb:'标准化流程为什么长那样：一个控制变量的感官实验设计',    lab:'4-2-cupping' },
  { id:'4.3', part:'4', slug:'4-3-sensory-bias',             en:'Systematic Error in Your Palate', zh:'味觉这台仪器的系统误差', blurb:'温度、期望、顺序：三种可预测的偏移',                    lab:'4-3-sensory-bias' },

  { id:'5.1', part:'5', slug:'5-1-percolation-vs-immersion', en:'Percolation vs Immersion',     zh:'渗滤 vs 浸泡',             blurb:'两种萃取模型的数学差异与风味后果',                      lab:'5-1-percolation-vs-immersion' },
  { id:'5.2', part:'5', slug:'5-2-cold-brew',                en:'Cold Brew',                    zh:'冷萃与时间换温度',         blurb:'低温长时的选择性萃取：温度换来的不只是速度',            lab:'5-2-cold-brew' },
  { id:'5.3', part:'5', slug:'5-3-devices-as-frozen-parameters', en:'Devices as Frozen Parameters', zh:'器具是参数的固化',     blurb:'每种器具本质上是把哪些变量锁死、把哪些交给你',          lab:'5-3-devices-as-frozen-parameters' }
];

/* 生成页（由 tools/build.mjs 产出，不可手改） */
export const APPENDICES = [
  { file:'glossary.html',  letter:'A', zh:'术语表',       en:'Glossary' },
  { file:'diagnosis.html', letter:'B', zh:'冲煮诊断卡',   en:'Brewing Diagnosis Card' },
  { file:'tooling.html',   letter:'C', zh:'器具与仪器速查', en:'Tooling Quick Reference' }
];

export const BOOK = {
  zh: '咖啡风味科学手册',
  en: 'Coffee & Flavor Science Handbook',
  lede: '把「玄学参数」还原成可解释的物理化学机制——每章一个可交互实验，拖动变量看风味往哪边走。'
};
