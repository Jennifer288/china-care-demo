export type Localized = { en: string; zh: string };
export const tx = (en: string, zh: string): Localized => ({ en, zh });
export const hospitalPhoto =
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=85";
export const heroPhoto =
  "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1600&q=85";
export const hospitalNames = [
  tx("Qilu Hospital of Shandong University", "山东大学齐鲁医院"),
  tx("Peking Union Medical College Hospital", "北京协和医院"),
  tx("West China Hospital, Sichuan University", "四川大学华西医院"),
  tx("Zhongshan Hospital, Fudan University", "复旦大学附属中山医院"),
  tx(
    "The First Affiliated Hospital, Zhejiang University",
    "浙江大学医学院附属第一医院",
  ),
  tx("Xiangya Hospital, Central South University", "中南大学湘雅医院"),
];
export const specialties = [
  {
    id: "cardiology",
    name: tx("Cardiology", "心血管"),
    icon: "heart",
    description: tx(
      "Explore specialist assessment for heart and vascular conditions.",
      "了解心脏与血管疾病的专科评估。",
    ),
    condition: tx("Heart Disease", "心脏疾病"),
  },
  {
    id: "oncology",
    name: tx("Oncology", "肿瘤科"),
    icon: "ribbon",
    description: tx(
      "Understand options for multidisciplinary cancer care.",
      "了解肿瘤多学科诊疗选择。",
    ),
    condition: tx("Cancer Care", "肿瘤诊疗"),
  },
  {
    id: "neurosurgery",
    name: tx("Neurosurgery", "神经外科"),
    icon: "brain",
    description: tx(
      "Find pathways for complex brain and spine conditions.",
      "探索复杂脑部与脊柱疾病的就医路径。",
    ),
    condition: tx("Brain & Spine", "脑与脊柱"),
  },
  {
    id: "orthopedics",
    name: tx("Orthopedics", "骨科"),
    icon: "bone",
    description: tx(
      "Connect with care for mobility, joints and musculoskeletal health.",
      "对接关节、运动与肌肉骨骼健康相关医疗资源。",
    ),
    condition: tx("Bone & Joint Health", "骨与关节健康"),
  },
  {
    id: "minimally-invasive",
    name: tx("Minimally Invasive Surgery", "微创手术"),
    icon: "activity",
    description: tx(
      "Learn about approaches that may use smaller incisions.",
      "了解可能采用较小切口的手术方式。",
    ),
    condition: tx("Minimally Invasive Procedures", "微创诊疗"),
  },
  {
    id: "robotic-surgery",
    name: tx("Robotic Surgery", "机器人手术"),
    icon: "scan",
    description: tx(
      "Explore technology-assisted surgical care where clinically appropriate.",
      "了解适用于特定临床情况的技术辅助手术。",
    ),
    condition: tx("Robot-assisted Procedures", "机器人辅助手术"),
  },
  {
    id: "traditional-medicine",
    name: tx("Traditional Chinese Medicine", "中医"),
    icon: "leaf",
    description: tx(
      "Discuss complementary care with qualified practitioners.",
      "与合格执业医师讨论辅助照护选择。",
    ),
    condition: tx("Integrative Care", "综合健康照护"),
  },
  {
    id: "health-screening",
    name: tx("Health Screening", "健康筛查"),
    icon: "shield",
    description: tx(
      "Plan an individualized preventive health assessment.",
      "安排个体化预防健康评估。",
    ),
    condition: tx("Preventive Health", "预防保健"),
  },
  {
    id: "womens-health",
    name: tx("Women's Health", "女性健康"),
    icon: "activity",
    description: tx(
      "Explore specialist assessment for planned gynecological care, depending on your condition.",
      "根据病情了解计划性妇科诊疗的专科评估。",
    ),
    condition: tx("Women's Health", "女性健康"),
  },
  {
    id: "advanced-diagnostics",
    name: tx("Advanced Diagnostics", "先进诊断检查"),
    icon: "scan",
    description: tx(
      "Discuss specialist-led imaging, pathology and diagnostic review where clinically appropriate.",
      "在临床适宜时，由专科医生评估影像、病理及诊断复核需求。",
    ),
    condition: tx("Diagnostic Review", "诊断复核"),
  },
];
export const hospitals = hospitalNames.map((name, i) => ({
  id: ["qilu", "pumch", "west-china", "zhongshan", "zhejiang-first", "xiangya"][
    i
  ],
  name,
  city: [
    tx("Jinan", "济南"),
    tx("Beijing", "北京"),
    tx("Chengdu", "成都"),
    tx("Shanghai", "上海"),
    tx("Hangzhou", "杭州"),
    tx("Changsha", "长沙"),
  ][i],
  image: [
    hospitalPhoto,
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80",
  ][i % 3],
  specialties: [
    specialties[i % 4],
    specialties[(i + 1) % 4],
    specialties[(i + 2) % 4],
  ],
  description: tx(
    "An illustrative directory profile for exploring hospital and specialty options. Services, availability and international patient arrangements must be confirmed directly with the institution.",
    "此演示目录用于了解医院及专科选择。服务内容、接诊情况及国际患者安排需直接向医院确认。",
  ),
}));
export const doctors = Array.from({ length: 12 }, (_, i) => ({
  id: `specialist-${i + 1}`,
  name: tx(
    `Dr. ${["Alex Chen", "Morgan Lin", "Jamie Wang", "Taylor Liu", "Sam Zhou", "Jordan Xu", "Robin Wu", "Casey Li", "Avery Sun", "Riley Yang", "Cameron Zhao", "Drew Huang"][i]}`,
    `${["陈安", "林睿", "王嘉", "刘宁", "周远", "徐朗", "吴晴", "李辰", "孙悠", "杨禾", "赵明", "黄乔"][i]} 医师`,
  ),
  hospital: hospitals[Math.floor(i / 2)],
  specialty: specialties[i % 8],
  image: `https://images.unsplash.com/${["photo-1612349317150-e413f6a5b16d", "photo-1594824476967-48c8b964273f", "photo-1622253692010-333f2da6031d"][i % 3]}?auto=format&fit=crop&w=600&q=80`,
  title: tx("Illustrative specialist", "演示专科医师"),
  languages: tx("English · Mandarin (demo)", "英语 · 普通话（演示）"),
}));
export const journey = [
  tx("Submit Medical Records", "提交病历"),
  tx("Case Preparation", "病历整理"),
  tx("Hospital / Specialist Matching & Review", "医院 / 专家匹配与评估"),
  tx("Treatment Feasibility", "治疗可行性"),
  tx("Treatment Plan & Estimated Cost", "诊疗方案与预估费用"),
  tx("Patient Decision", "患者自主决定"),
  tx("Patient Arranges Visa & Travel", "患者自行安排签证与行程"),
  tx("Arrival in China", "抵达中国"),
  tx("Airport Pickup Coordination", "机场接送协调"),
  tx("Hospital Visit & Interpretation", "医院就诊与口译"),
  tx("Treatment / Hospitalization", "治疗 / 住院"),
  tx("Recovery Support", "恢复阶段支持"),
  tx("Return Home & Follow-up", "回国与后续随访"),
];
export const journeyDetails = [
  tx(
    "Share existing records with separate consent before planning travel.",
    "规划旅行前，通过独立授权提交现有病历。",
  ),
  tx(
    "Coordinate record organization, translation and any missing information.",
    "协调病历整理、翻译及缺失资料补充。",
  ),
  tx(
    "Match relevant resources to clinical needs; the institution reviews the case.",
    "按临床需求匹配相关资源，由医疗机构评估病例。",
  ),
  tx(
    "Licensed physicians and institutions determine medical suitability, including whether further care in China is appropriate.",
    "持牌医师和医疗机构判断医疗适宜性，包括是否适合进一步来华诊疗。",
  ),
  tx(
    "The institution provides next-step treatment information, timing and estimated costs, subject to assessment.",
    "医疗机构在评估后提供下一步诊疗信息、时间安排及预估费用。",
  ),
  tx(
    "Review your options and ask questions. You decide whether to proceed.",
    "了解选择并提出问题，再由您决定是否继续。",
  ),
  tx(
    "Follow official Chinese visa requirements. Hospital documents may be provided when available and applicable.",
    "遵循中国官方签证要求。医院相关材料仅在可提供且适用时提供。",
  ),
  tx(
    "Confirm arrival arrangements, accommodation check-in and communication support.",
    "确认抵达安排、住宿入住及沟通支持。",
  ),
  tx(
    "Coordinate airport pickup and provide local transportation guidance.",
    "协调机场接送并提供本地交通指引。",
  ),
  tx(
    "Coordinate registration, navigation, appointments and medical interpretation.",
    "协调挂号、就诊引导、预约及医疗口译。",
  ),
  tx(
    "Hospitals provide clinical care; the platform coordinates inpatient arrangements and family communication.",
    "医院提供临床照护，平台协调住院事务及家属沟通。",
  ),
  tx(
    "Follow the treating team’s discharge and recovery instructions; coordinate practical support and follow-up preparation.",
    "遵循接诊团队的出院和康复指导，协调事务支持及随访准备。",
  ),
  tx(
    "Organize documents and coordinate remote follow-up, hospital communication and future visits. Doctors provide medical advice.",
    "整理资料并协调远程随访、医院沟通及后续就诊。医疗建议由医生提供。",
  ),
];
export const advantages = [
  [
    tx("Strong clinical experience", "丰富的临床经验"),
    tx(
      "China’s large tertiary hospitals often manage substantial volumes of complex cases. Relevant specialist experience should be confirmed for your condition.",
      "中国大型三级医院通常接诊较多复杂病例；应根据您的病情确认专科医生的相关临床经验。",
    ),
  ],
  [
    tx("Advanced medical technology", "先进的医疗技术"),
    tx(
      "Depending on the hospital and condition, options may include robotic and minimally invasive surgery, advanced imaging, interventional medicine, precision treatment and modern surgical systems.",
      "视医院与病情而定，可能涉及机器人及微创手术、先进影像、介入医学、精准治疗及现代手术系统。",
    ),
  ],
  [
    tx("Leading hospitals", "优质的医院资源"),
    tx(
      "Large tertiary hospitals may bring multiple disciplines together for complex case assessment. Confirm the relevant departments and multidisciplinary arrangements.",
      "大型三级医院可汇集多个学科进行复杂病例评估，具体科室及多学科协作安排需确认。",
    ),
  ],
  [
    tx("Coordinated medical access", "协调就医安排"),
    tx(
      "Appointments and evaluations may be coordinated more efficiently, depending on availability.",
      "根据接诊情况，预约与评估可能得到更高效的协调。",
    ),
  ],
  [
    tx("Transparent cost planning", "透明的费用规划"),
    tx(
      "Costs may be competitive depending on treatment. Request an individualized, estimated cost breakdown.",
      "部分项目可能具有费用优势，具体取决于治疗。可申请个体化的预估费用明细。",
    ),
  ],
  [
    tx("Support beyond the hospital", "贯穿全程的支持"),
    tx(
      "From interpretation and hospital navigation to accommodation and family support.",
      "涵盖口译、医院引导、住宿协助及家属支持。",
    ),
  ],
];
