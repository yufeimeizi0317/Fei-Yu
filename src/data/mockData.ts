import {
  Classroom,
  Student,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  EmailTemplate,
  EmailSettings,
  EmailLog,
  TimetablePeriod,
  TimetableSlot,
  UserAccount,
} from '../types';

export const INITIAL_CLASSES: Classroom[] = [
  {
    id: 'class-802',
    name: '八年仁班 (802)',
    grade: '國中二年級',
    academicYear: '114學年度',
    semester: '第一學期',
    teacherName: '林信宏 老師',
    schoolName: '市立大安國民中學',
    contactPhone: '02-2707-5215 #302',
    layoutRows: 5,
    layoutCols: 6,
  },
  {
    id: 'class-101',
    name: '高一甲班 (101)',
    grade: '高中一年級',
    academicYear: '114學年度',
    semester: '第一學期',
    teacherName: '王怡君 老師',
    schoolName: '市立大安高級中學',
    contactPhone: '02-2707-5215 #501',
    layoutRows: 6,
    layoutCols: 6,
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu-802-01',
    classId: 'class-802',
    seatNumber: 1,
    name: '陳冠宇',
    gender: 'male',
    studentId: '80201',
    parentName: '陳志明',
    parentEmail: 'chen.zm.802@gmail.com',
    studentEmail: 'guanyu.chen@school.edu.tw',
    parentPhone: '0912-345-671',
    notes: '熱心班長，理化科表現優異',
    seatRow: 0,
    seatCol: 0,
  },
  {
    id: 'stu-802-02',
    classId: 'class-802',
    seatNumber: 2,
    name: '林語晴',
    gender: 'female',
    studentId: '80202',
    parentName: '林文德',
    parentEmail: 'lin.wd.parent@gmail.com',
    studentEmail: 'yuching.lin@school.edu.tw',
    parentPhone: '0922-111-222',
    notes: '學藝股長，文筆佳',
    seatRow: 0,
    seatCol: 1,
  },
  {
    id: 'stu-802-03',
    classId: 'class-802',
    seatNumber: 3,
    name: '張家豪',
    gender: 'male',
    studentId: '80203',
    parentName: '張國良',
    parentEmail: 'chang.gl.family@gmail.com',
    studentEmail: 'jiahao.chang@school.edu.tw',
    parentPhone: '0933-444-555',
    notes: '籃球校隊，早自習有時晨練',
    seatRow: 0,
    seatCol: 2,
  },
  {
    id: 'stu-802-04',
    classId: 'class-802',
    seatNumber: 4,
    name: '黃郁婷',
    gender: 'female',
    studentId: '80204',
    parentName: '黃秀蘭',
    parentEmail: 'huang.sl.mama@gmail.com',
    studentEmail: 'yuting.huang@school.edu.tw',
    parentPhone: '0918-777-888',
    notes: '英文小老師，作業認真負責',
    seatRow: 0,
    seatCol: 3,
  },
  {
    id: 'stu-802-05',
    classId: 'class-802',
    seatNumber: 5,
    name: '吳柏翰',
    gender: 'male',
    studentId: '80205',
    parentName: '吳正華',
    parentEmail: 'wu.zh.work@gmail.com',
    studentEmail: 'bohan.wu@school.edu.tw',
    parentPhone: '0928-333-999',
    notes: '數學反應快，偶爾粗心',
    seatRow: 0,
    seatCol: 4,
  },
  {
    id: 'stu-802-06',
    classId: 'class-802',
    seatNumber: 6,
    name: '李欣怡',
    gender: 'female',
    studentId: '80206',
    parentName: '李清芬',
    parentEmail: 'lee.hsinyi.parent@gmail.com',
    studentEmail: 'xinyi.lee@school.edu.tw',
    parentPhone: '0935-888-123',
    notes: '風紀股長，細心自律',
    seatRow: 0,
    seatCol: 5,
  },
  {
    id: 'stu-802-07',
    classId: 'class-802',
    seatNumber: 7,
    name: '蔡宗翰',
    gender: 'male',
    studentId: '80207',
    parentName: '蔡榮發',
    parentEmail: 'tsai.rf.home@gmail.com',
    studentEmail: 'zonghan.tsai@school.edu.tw',
    parentPhone: '0966-222-333',
    notes: '近期常熬夜，需多關心精神狀況',
    seatRow: 1,
    seatCol: 0,
  },
  {
    id: 'stu-802-08',
    classId: 'class-802',
    seatNumber: 8,
    name: '楊雅婷',
    gender: 'female',
    studentId: '80208',
    parentName: '楊美玲',
    parentEmail: 'yang.ml.parent@gmail.com',
    studentEmail: 'yating.yang@school.edu.tw',
    parentPhone: '0910-654-321',
    notes: '熱愛閱讀，圖書股長',
    seatRow: 1,
    seatCol: 1,
  },
  {
    id: 'stu-802-09',
    classId: 'class-802',
    seatNumber: 9,
    name: '許博涵',
    gender: 'male',
    studentId: '80209',
    parentName: '許建銘',
    parentEmail: 'hsu.jm.office@gmail.com',
    studentEmail: 'bohan.hsu@school.edu.tw',
    parentPhone: '0921-789-012',
    notes: '科技資訊小天才',
    seatRow: 1,
    seatCol: 2,
  },
  {
    id: 'stu-802-10',
    classId: 'class-802',
    seatNumber: 10,
    name: '鄭羽涵',
    gender: 'female',
    studentId: '80210',
    parentName: '鄭義雄',
    parentEmail: 'cheng.yh.parent@gmail.com',
    studentEmail: 'yuhan.cheng@school.edu.tw',
    parentPhone: '0972-345-678',
    notes: '音樂造詣佳，合唱團部員',
    seatRow: 1,
    seatCol: 3,
  },
  {
    id: 'stu-802-11',
    classId: 'class-802',
    seatNumber: 11,
    name: '郭俊逸',
    gender: 'male',
    studentId: '80211',
    parentName: '郭文雄',
    parentEmail: 'kuo.wx.parent@gmail.com',
    studentEmail: 'junyi.kuo@school.edu.tw',
    parentPhone: '0919-456-789',
    notes: '體育股長，樂觀積極',
    seatRow: 1,
    seatCol: 4,
  },
  {
    id: 'stu-802-12',
    classId: 'class-802',
    seatNumber: 12,
    name: '謝采潔',
    gender: 'female',
    studentId: '80212',
    parentName: '謝麗萍',
    parentEmail: 'hsieh.lp.parent@gmail.com',
    studentEmail: 'caijie.hsieh@school.edu.tw',
    parentPhone: '0953-678-901',
    notes: '繪畫特長，美術比賽常勝軍',
    seatRow: 1,
    seatCol: 5,
  },
  {
    id: 'stu-802-13',
    classId: 'class-802',
    seatNumber: 13,
    name: '劉育辰',
    gender: 'male',
    studentId: '80213',
    parentName: '劉永和',
    parentEmail: 'liu.yh.family@gmail.com',
    studentEmail: 'yuchen.liu@school.edu.tw',
    parentPhone: '0926-890-123',
    notes: '偶爾缺交數學習作，需追蹤',
    seatRow: 2,
    seatCol: 0,
  },
  {
    id: 'stu-802-14',
    classId: 'class-802',
    seatNumber: 14,
    name: '曾子瑄',
    gender: 'female',
    studentId: '80214',
    parentName: '曾明達',
    parentEmail: 'tseng.md.parent@gmail.com',
    studentEmail: 'zixuan.tseng@school.edu.tw',
    parentPhone: '0937-901-234',
    notes: '副班長，負責任心強',
    seatRow: 2,
    seatCol: 1,
  },
  {
    id: 'stu-802-15',
    classId: 'class-802',
    seatNumber: 15,
    name: '洪睿祥',
    gender: 'male',
    studentId: '80215',
    parentName: '洪清吉',
    parentEmail: 'hung.cj.home@gmail.com',
    studentEmail: 'ruixiang.hung@school.edu.tw',
    parentPhone: '0988-012-345',
    notes: '喜愛科學探究實驗',
    seatRow: 2,
    seatCol: 2,
  },
  {
    id: 'stu-802-16',
    classId: 'class-802',
    seatNumber: 16,
    name: '邱沛萱',
    gender: 'female',
    studentId: '80216',
    parentName: '邱志偉',
    parentEmail: 'chiu.cw.parent@gmail.com',
    studentEmail: 'peixuan.chiu@school.edu.tw',
    parentPhone: '0911-123-789',
    notes: '衛生股長，環境維護認真',
    seatRow: 2,
    seatCol: 3,
  },
  {
    id: 'stu-802-17',
    classId: 'class-802',
    seatNumber: 17,
    name: '廖庭宇',
    gender: 'male',
    studentId: '80217',
    parentName: '廖坤成',
    parentEmail: 'liao.kc.parent@gmail.com',
    studentEmail: 'tingyu.liao@school.edu.tw',
    parentPhone: '0929-234-567',
    notes: '排球隊，近期因腸胃型感冒休假',
    seatRow: 2,
    seatCol: 4,
  },
  {
    id: 'stu-802-18',
    classId: 'class-802',
    seatNumber: 18,
    name: '賴玟均',
    gender: 'female',
    studentId: '80218',
    parentName: '賴世榮',
    parentEmail: 'lai.sr.home@gmail.com',
    studentEmail: 'wenjun.lai@school.edu.tw',
    parentPhone: '0960-345-678',
    notes: '數學小老師，成績名列前茅',
    seatRow: 2,
    seatCol: 5,
  },
  {
    id: 'stu-802-19',
    classId: 'class-802',
    seatNumber: 19,
    name: '周宇恆',
    gender: 'male',
    studentId: '80219',
    parentName: '周德華',
    parentEmail: 'chou.th.parent@gmail.com',
    studentEmail: 'yuheng.chou@school.edu.tw',
    parentPhone: '0975-456-789',
    notes: '轉學生，適應狀況良好',
    seatRow: 3,
    seatCol: 0,
  },
  {
    id: 'stu-802-20',
    classId: 'class-802',
    seatNumber: 20,
    name: '葉芷安',
    gender: 'female',
    studentId: '80220',
    parentName: '葉秀珠',
    parentEmail: 'yeh.sc.mama@gmail.com',
    studentEmail: 'zhian.yeh@school.edu.tw',
    parentPhone: '0982-567-890',
    notes: '國文表達能力優異',
    seatRow: 3,
    seatCol: 1,
  },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'hw-01',
    classId: 'class-802',
    subject: '國文',
    title: '第三課《木蘭詩》段落賞析與習作 p.28-32',
    dueDate: '2026-09-24',
    maxScore: 100,
    description: '完成習作第28至32頁，並在聯絡簿附錄寫下150字閱讀賞析心得。',
    status: 'active',
    createdAt: '2026-09-21',
  },
  {
    id: 'hw-02',
    classId: 'class-802',
    subject: '數學',
    title: '第二章〈一元二次方程式的解法〉習作綜合練習',
    dueDate: '2026-09-23',
    maxScore: 100,
    description: '完成數學課本習題與習作第 45-48 頁，計算過程需完整呈現。',
    status: 'active',
    createdAt: '2026-09-20',
  },
  {
    id: 'hw-03',
    classId: 'class-802',
    subject: '英文',
    title: 'Unit 3 Grammar Review & Reading Journal',
    dueDate: '2026-09-22',
    maxScore: 100,
    description: 'Complete workbook Unit 3 Review test and write 5 past-tense sentences.',
    status: 'reviewing',
    createdAt: '2026-09-18',
  },
  {
    id: 'hw-04',
    classId: 'class-802',
    subject: '自然',
    title: '理化：酸鹼中和與氧化還原實驗預習單',
    dueDate: '2026-09-25',
    maxScore: 100,
    description: '閱讀實驗手冊步驟 3-1，預先填寫假說與安全注意事項表格。',
    status: 'active',
    createdAt: '2026-09-22',
  },
  {
    id: 'hw-05',
    classId: 'class-802',
    subject: '社會',
    title: '歷史：臺灣清領時期經濟與貿易發展探究小卡',
    dueDate: '2026-09-19',
    maxScore: 100,
    description: '整理三大通商口岸與樟腦、茶葉、糖對外貿易分析簡報小卡。',
    status: 'closed',
    createdAt: '2026-09-15',
  },
];

// Helper to seed submissions
export const generateInitialSubmissions = (): AssignmentSubmission[] => {
  const submissions: AssignmentSubmission[] = [];

  INITIAL_STUDENTS.forEach((student, index) => {
    // hw-01 (Due 09-24)
    if (index === 6 || index === 12 || index === 18) {
      submissions.push({
        id: `sub-hw1-${student.id}`,
        assignmentId: 'hw-01',
        studentId: student.id,
        status: 'missing',
        notes: '尚未繳交，請儘速補交',
      });
    } else if (index === 2) {
      submissions.push({
        id: `sub-hw1-${student.id}`,
        assignmentId: 'hw-01',
        studentId: student.id,
        status: 'needs_correction',
        score: 75,
        scoreGrade: '乙上',
        feedback: '第30頁問答題未寫完整，請訂正後重交',
        submittedAt: '2026-09-23 08:20',
      });
    } else {
      submissions.push({
        id: `sub-hw1-${student.id}`,
        assignmentId: 'hw-01',
        studentId: student.id,
        status: 'submitted',
        score: 90 + (index % 10),
        scoreGrade: '甲上',
        submittedAt: '2026-09-23 07:45',
      });
    }

    // hw-02 (Due 09-23 - Today!)
    if (index === 6 || index === 12) {
      submissions.push({
        id: `sub-hw2-${student.id}`,
        assignmentId: 'hw-02',
        studentId: student.id,
        status: 'missing',
        notes: '今日應交未交，需電話或信件通知催繳',
      });
    } else if (index === 16) {
      submissions.push({
        id: `sub-hw2-${student.id}`,
        assignmentId: 'hw-02',
        studentId: student.id,
        status: 'exempt',
        notes: '病假中，約定下週一返校補交',
      });
    } else if (index === 8) {
      submissions.push({
        id: `sub-hw2-${student.id}`,
        assignmentId: 'hw-02',
        studentId: student.id,
        status: 'late',
        score: 82,
        scoreGrade: '甲',
        submittedAt: '2026-09-23 13:10',
        feedback: '午休補交，計算正確',
      });
    } else {
      submissions.push({
        id: `sub-hw2-${student.id}`,
        assignmentId: 'hw-02',
        studentId: student.id,
        status: 'submitted',
        score: 85 + (index % 15),
        scoreGrade: index % 2 === 0 ? '優' : '甲上',
        submittedAt: '2026-09-23 07:50',
      });
    }

    // hw-03 (Due 09-22 - Reviewing)
    if (index === 12) {
      submissions.push({
        id: `sub-hw3-${student.id}`,
        assignmentId: 'hw-03',
        studentId: student.id,
        status: 'missing',
        notes: '連續缺交英文習作',
      });
    } else if (index === 6) {
      submissions.push({
        id: `sub-hw3-${student.id}`,
        assignmentId: 'hw-03',
        studentId: student.id,
        status: 'resubmitted',
        score: 80,
        scoreGrade: '甲',
        submittedAt: '2026-09-23 10:15',
        feedback: '已補交並訂正完成',
      });
    } else {
      submissions.push({
        id: `sub-hw3-${student.id}`,
        assignmentId: 'hw-03',
        studentId: student.id,
        status: 'submitted',
        score: 88 + (index % 12),
        scoreGrade: '甲上',
        submittedAt: '2026-09-22 08:00',
      });
    }

    // hw-04 & hw-05 basic fill
    submissions.push({
      id: `sub-hw4-${student.id}`,
      assignmentId: 'hw-04',
      studentId: student.id,
      status: index < 14 ? 'submitted' : 'missing',
      score: index < 14 ? 90 : undefined,
    });

    submissions.push({
      id: `sub-hw5-${student.id}`,
      assignmentId: 'hw-05',
      studentId: student.id,
      status: 'submitted',
      score: 92,
      scoreGrade: '優',
    });
  });

  return submissions;
};

// Seed Attendance Records for past 3 days including today (2026-09-23)
export const generateInitialAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const dates = ['2026-09-21', '2026-09-22', '2026-09-23'];

  dates.forEach((date) => {
    INITIAL_STUDENTS.forEach((student) => {
      let status: any = 'present';
      let lateMinutes: number | undefined = undefined;
      let remark: string | undefined = undefined;

      if (date === '2026-09-23') {
        // Today's realistic scenario
        if (student.seatNumber === 7) {
          status = 'absent';
          remark = '早自習未到，家長未接電話，需寄發即時通知';
        } else if (student.seatNumber === 17) {
          status = 'sick_leave';
          remark = '流感發燒，家長已於Line群請假，附就醫收據';
        } else if (student.seatNumber === 3) {
          status = 'late';
          lateMinutes = 20;
          remark = '校隊晨練延遲進教室';
        } else if (student.seatNumber === 13) {
          status = 'late';
          lateMinutes = 15;
          remark = '公車脫班遲到';
        }
      } else if (date === '2026-09-22') {
        if (student.seatNumber === 17) {
          status = 'sick_leave';
          remark = '身體不適就診';
        } else if (student.seatNumber === 11) {
          status = 'official_leave';
          remark = '代表學校參加全市體育賽事';
        }
      } else if (date === '2026-09-21') {
        if (student.seatNumber === 5) {
          status = 'personal_leave';
          remark = '家中有事已事先遞交假單';
        }
      }

      records.push({
        id: `att-${date}-${student.id}`,
        classId: 'class-802',
        studentId: student.id,
        date,
        session: '早自習',
        status,
        lateMinutes,
        remark,
        recordedAt: `${date} 07:55:00`,
      });
    });
  });

  return records;
};

export const INITIAL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-absence',
    name: '學生出缺席即時警示通知',
    type: 'absence_alert',
    subject: '【{學校名稱} 出勤即時通知】{學生姓名} ({座號}號) 於 {日期} 出席狀況通知',
    body: `親愛的 {學生姓名} 同學：

我是 {班級名稱} 的班導師 {導師姓名}。

向您通知，您（座號：{座號}號）於今天（{日期}）之出勤紀錄為：【{出缺席狀態}】{備註說明}。

為確保在校出勤紀錄完整，若有因病或臨時事故未能到校，請記得向學務處或導師補辦請假程序。

{學校名稱} {班級名稱}
導師：{導師姓名}
聯絡電話：{聯絡電話}
發信時間：{發信時間}`,
    description: '當學生曠課、未請假缺席或遲到時，一鍵寄送的即時出勤通知信。',
  },
  {
    id: 'tpl-homework',
    name: '作業缺交催繳與學習追蹤通知',
    type: 'homework_reminder',
    subject: '【{學校名稱} 課業叮嚀】{班級名稱} {學生姓名} 作業缺繳催繳清單通知',
    body: `親愛的 {學生姓名} 同學：

我是班導師 {導師姓名}。經今日作業盤點統計，你目前尚有下列作業未完成繳交或需訂正：

【待繳交/待訂正作業清單】
{缺交作業清單}

作業是課堂學習的重要延伸與評量依據。請利用課後時間認真補齊或訂正，並於次日早自習統一繳交至各科小老師處。

若在學習過程中遇到課業困難，歡迎隨時向導師或任課老師尋求個別輔導協助。

{學校名稱} {班級名稱}
導師：{導師姓名}
聯絡電話：{聯絡電話}`,
    description: '針對有未繳交、遲交或待訂正作業的學生，自動彙整缺交清單發送提醒。',
  },
  {
    id: 'tpl-weekly',
    name: '每週班級學習與出勤綜合週報',
    type: 'weekly_summary',
    subject: '【學習通訊】{班級名稱} {學生姓名} 本週在校學習與出缺席週報',
    body: `親愛的 {學生姓名} 同學：

本週校園學習生活已告一段落，導師特為你整理（座號：{座號}號）本週在校的整體表現概況：

📌 【本週出勤總結】
出席狀態：{出缺席狀態}

📚 【本週各科作業完成狀況】
{缺交作業清單}

週末假期請適度放鬆身心，並留意作息規律。下週即將展開新的單元課程，讓我們一起繼續加油！

祝 週末愉快！

{學校名稱} {班級名稱}
導師：{導師姓名}
聯絡電話：{聯絡電話}`,
    description: '適合週五發送，統整本週學生出席率及作業繳交狀況的綜合週報。',
  },
];

export const INITIAL_EMAIL_SETTINGS: EmailSettings = {
  senderName: '林信宏 老師 (802導師)',
  senderEmail: 'teacher.lin@daan.tp.edu.tw',
  schoolName: '市立大安國民中學',
  phone: '02-2707-5215 #302',
  autoBccSelf: true,
  deliveryMode: 'simulated_batch',
};

export const INITIAL_EMAIL_LOGS: EmailLog[] = [
  {
    id: 'log-1',
    classId: 'class-802',
    studentId: 'stu-802-07',
    studentName: '蔡宗翰',
    seatNumber: 7,
    recipientName: '蔡榮發',
    recipientEmail: 'tsai.rf.home@gmail.com',
    subject: '【市立大安國民中學 學生出勤即時通知】蔡宗翰 (7號) 於 2026-09-23 出席異常提醒',
    body: '蔡宗翰同學今日早自習未到校且尚未請假，已寄發即時通知並留存紀錄。',
    notificationType: 'absence_alert',
    status: 'sent',
    timestamp: '2026-09-23 08:35:12',
  },
  {
    id: 'log-2',
    classId: 'class-802',
    studentId: 'stu-802-13',
    studentName: '劉育辰',
    seatNumber: 13,
    recipientName: '劉永和',
    recipientEmail: 'liu.yh.family@gmail.com',
    subject: '【市立大安國民中學 學習叮嚀】八年仁班 劉育辰 作業缺繳催繳清單通知',
    body: '待繳作業：第二章〈一元二次方程式的解法〉習作綜合練習、第三課《木蘭詩》段落賞析。',
    notificationType: 'homework_reminder',
    status: 'sent',
    timestamp: '2026-09-23 12:40:05',
  },
];

export const DEFAULT_PERIODS: TimetablePeriod[] = [
  { periodNumber: 0, name: '早自習', startTime: '07:50', endTime: '08:20' },
  { periodNumber: 1, name: '第一節', startTime: '08:30', endTime: '09:15' },
  { periodNumber: 2, name: '第二節', startTime: '09:25', endTime: '10:10' },
  { periodNumber: 3, name: '第三節', startTime: '10:20', endTime: '11:05' },
  { periodNumber: 4, name: '第四節', startTime: '11:15', endTime: '12:00' },
  { periodNumber: 99, name: '午餐午休', startTime: '12:00', endTime: '13:10', isBreak: true },
  { periodNumber: 5, name: '第五節', startTime: '13:20', endTime: '14:05' },
  { periodNumber: 6, name: '第六節', startTime: '14:15', endTime: '15:00' },
  { periodNumber: 7, name: '第七節', startTime: '15:10', endTime: '15:55' },
  { periodNumber: 8, name: '課後輔導', startTime: '16:05', endTime: '16:50' },
];

export const INITIAL_TIMETABLE_SLOTS: TimetableSlot[] = [
  // 週一 (dayOfWeek: 1)
  { id: 'tt-1-0', classId: 'class-802', dayOfWeek: 1, periodNumber: 0, subject: '晨讀 / 導師時間', teacher: '林信宏 導師', room: '本班教室', color: 'indigo' },
  { id: 'tt-1-1', classId: 'class-802', dayOfWeek: 1, periodNumber: 1, subject: '國文', teacher: '林信宏 導師', room: '本班教室', color: 'blue', note: '帶第三課課本與習作' },
  { id: 'tt-1-2', classId: 'class-802', dayOfWeek: 1, periodNumber: 2, subject: '數學', teacher: '陳建宏 老師', room: '本班教室', color: 'emerald', note: '隨堂小考方程式' },
  { id: 'tt-1-3', classId: 'class-802', dayOfWeek: 1, periodNumber: 3, subject: '英語', teacher: 'Sarah Chen 老師', room: '本班教室', color: 'purple', note: '預習 Unit 2 單字' },
  { id: 'tt-1-4', classId: 'class-802', dayOfWeek: 1, periodNumber: 4, subject: '理化', teacher: '張明達 老師', room: '理化實驗室A', color: 'amber', note: '請至科教大樓 3F' },
  { id: 'tt-1-5', classId: 'class-802', dayOfWeek: 1, periodNumber: 5, subject: '歷史', teacher: '周家興 老師', room: '本班教室', color: 'orange' },
  { id: 'tt-1-6', classId: 'class-802', dayOfWeek: 1, periodNumber: 6, subject: '體育', teacher: '王大維 老師', room: '操場 / 體育館', color: 'rose', note: '全班換著運動服裝' },
  { id: 'tt-1-7', classId: 'class-802', dayOfWeek: 1, periodNumber: 7, subject: '班會', teacher: '林信宏 導師', room: '本班教室', color: 'indigo', note: '討論校慶進場主題' },
  { id: 'tt-1-8', classId: 'class-802', dayOfWeek: 1, periodNumber: 8, subject: '學藝輔導 (數學)', teacher: '陳建宏 老師', room: '本班教室', color: 'slate' },

  // 週二 (dayOfWeek: 2)
  { id: 'tt-2-0', classId: 'class-802', dayOfWeek: 2, periodNumber: 0, subject: '英聽晨考', teacher: 'Sarah Chen 老師', room: '本班教室', color: 'purple' },
  { id: 'tt-2-1', classId: 'class-802', dayOfWeek: 2, periodNumber: 1, subject: '理化', teacher: '張明達 老師', room: '本班教室', color: 'amber' },
  { id: 'tt-2-2', classId: 'class-802', dayOfWeek: 2, periodNumber: 2, subject: '國文', teacher: '林信宏 導師', room: '本班教室', color: 'blue' },
  { id: 'tt-2-3', classId: 'class-802', dayOfWeek: 2, periodNumber: 3, subject: '地理', teacher: '黃淑玲 老師', room: '本班教室', color: 'cyan' },
  { id: 'tt-2-4', classId: 'class-802', dayOfWeek: 2, periodNumber: 4, subject: '公民', teacher: '蔡佩君 老師', room: '本班教室', color: 'teal' },
  { id: 'tt-2-5', classId: 'class-802', dayOfWeek: 2, periodNumber: 5, subject: '音樂', teacher: '李雅慧 老師', room: '藝能館 音樂教室2', color: 'fuchsia', note: '帶中音直笛與樂譜' },
  { id: 'tt-2-6', classId: 'class-802', dayOfWeek: 2, periodNumber: 6, subject: '數學', teacher: '陳建宏 老師', room: '本班教室', color: 'emerald' },
  { id: 'tt-2-7', classId: 'class-802', dayOfWeek: 2, periodNumber: 7, subject: '童軍', teacher: '劉育華 老師', room: '童軍專科教室', color: 'lime', note: '繩結考照練習' },
  { id: 'tt-2-8', classId: 'class-802', dayOfWeek: 2, periodNumber: 8, subject: '自習 / 個別輔導', teacher: '林信宏 導師', room: '本班教室', color: 'slate' },

  // 週三 (dayOfWeek: 3)
  { id: 'tt-3-0', classId: 'class-802', dayOfWeek: 3, periodNumber: 0, subject: '國文成語檢測', teacher: '林信宏 導師', room: '本班教室', color: 'blue' },
  { id: 'tt-3-1', classId: 'class-802', dayOfWeek: 3, periodNumber: 1, subject: '數學', teacher: '陳建宏 老師', room: '本班教室', color: 'emerald' },
  { id: 'tt-3-2', classId: 'class-802', dayOfWeek: 3, periodNumber: 2, subject: '英語', teacher: 'Sarah Chen 老師', room: '本班教室', color: 'purple' },
  { id: 'tt-3-3', classId: 'class-802', dayOfWeek: 3, periodNumber: 3, subject: '視覺藝術', teacher: '高玉珍 老師', room: '美育大樓 美術教室', color: 'emerald', note: '自備水彩與畫筆' },
  { id: 'tt-3-4', classId: 'class-802', dayOfWeek: 3, periodNumber: 4, subject: '視覺藝術', teacher: '高玉珍 老師', room: '美育大樓 美術教室', color: 'emerald' },
  { id: 'tt-3-5', classId: 'class-802', dayOfWeek: 3, periodNumber: 5, subject: '體育', teacher: '王大維 老師', room: '操場 / 籃球場', color: 'rose' },
  { id: 'tt-3-6', classId: 'class-802', dayOfWeek: 3, periodNumber: 6, subject: '國文', teacher: '林信宏 導師', room: '本班教室', color: 'blue' },
  { id: 'tt-3-7', classId: 'class-802', dayOfWeek: 3, periodNumber: 7, subject: '社團活動', teacher: '各社團指導老師', room: '全校各活動場地', color: 'violet', note: '依個人選填社團就位' },
  { id: 'tt-3-8', classId: 'class-802', dayOfWeek: 3, periodNumber: 8, subject: '學藝輔導 (英語)', teacher: 'Sarah Chen 老師', room: '本班教室', color: 'slate' },

  // 週四 (dayOfWeek: 4)
  { id: 'tt-4-0', classId: 'class-802', dayOfWeek: 4, periodNumber: 0, subject: '數學計算晨考', teacher: '陳建宏 老師', room: '本班教室', color: 'emerald' },
  { id: 'tt-4-1', classId: 'class-802', dayOfWeek: 4, periodNumber: 1, subject: '理化實驗', teacher: '張明達 老師', room: '理化實驗室A', color: 'amber', note: '必備實驗衣與護目鏡' },
  { id: 'tt-4-2', classId: 'class-802', dayOfWeek: 4, periodNumber: 2, subject: '理化實驗', teacher: '張明達 老師', room: '理化實驗室A', color: 'amber' },
  { id: 'tt-4-3', classId: 'class-802', dayOfWeek: 4, periodNumber: 3, subject: '國文', teacher: '林信宏 導師', room: '本班教室', color: 'blue' },
  { id: 'tt-4-4', classId: 'class-802', dayOfWeek: 4, periodNumber: 4, subject: '數學', teacher: '陳建宏 老師', room: '本班教室', color: 'emerald' },
  { id: 'tt-4-5', classId: 'class-802', dayOfWeek: 4, periodNumber: 5, subject: '生活科技', teacher: '趙志強 老師', room: '生科創客工坊', color: 'sky', note: '木工車床操作' },
  { id: 'tt-4-6', classId: 'class-802', dayOfWeek: 4, periodNumber: 6, subject: '資訊科技', teacher: '趙志強 老師', room: '電腦教室二', color: 'sky', note: 'Python 程式設計' },
  { id: 'tt-4-7', classId: 'class-802', dayOfWeek: 4, periodNumber: 7, subject: '歷史', teacher: '周家興 老師', room: '本班教室', color: 'orange' },
  { id: 'tt-4-8', classId: 'class-802', dayOfWeek: 4, periodNumber: 8, subject: '自習 / 課後作業', teacher: '林信宏 導師', room: '本班教室', color: 'slate' },

  // 週五 (dayOfWeek: 5)
  { id: 'tt-5-0', classId: 'class-802', dayOfWeek: 5, periodNumber: 0, subject: '整潔大掃除 / 晨會', teacher: '林信宏 導師', room: '本班教室', color: 'indigo' },
  { id: 'tt-5-1', classId: 'class-802', dayOfWeek: 5, periodNumber: 1, subject: '英語', teacher: 'Sarah Chen 老師', room: '本班教室', color: 'purple' },
  { id: 'tt-5-2', classId: 'class-802', dayOfWeek: 5, periodNumber: 2, subject: '國文', teacher: '林信宏 導師', room: '本班教室', color: 'blue' },
  { id: 'tt-5-3', classId: 'class-802', dayOfWeek: 5, periodNumber: 3, subject: '數學', teacher: '陳建宏 老師', room: '本班教室', color: 'emerald' },
  { id: 'tt-5-4', classId: 'class-802', dayOfWeek: 5, periodNumber: 4, subject: '家政', teacher: '李佩玲 老師', room: '家政烹飪教室', color: 'pink', note: '著圍裙及頭巾' },
  { id: 'tt-5-5', classId: 'class-802', dayOfWeek: 5, periodNumber: 5, subject: '家政', teacher: '李佩玲 老師', room: '家政烹飪教室', color: 'pink' },
  { id: 'tt-5-6', classId: 'class-802', dayOfWeek: 5, periodNumber: 6, subject: '地理', teacher: '黃淑玲 老師', room: '本班教室', color: 'cyan' },
  { id: 'tt-5-7', classId: 'class-802', dayOfWeek: 5, periodNumber: 7, subject: '彈性學習 / 自主探究', teacher: '林信宏 導師', room: '本班教室', color: 'indigo' },
  { id: 'tt-5-8', classId: 'class-802', dayOfWeek: 5, periodNumber: 8, subject: '週末放學清點', teacher: '林信宏 導師', room: '本班教室', color: 'slate' },
];

export const USER_ROLES_INFO = {
  homeroom_teacher: {
    label: '班級導師',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: '負責全班點名出勤、作業統整、個別發信通報與班級總覽。',
  },
  subject_teacher: {
    label: '科任老師',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: '專科教學、單節課堂點名、專科作業盤點與課堂抽問。',
  },
  admin: {
    label: '行政 / 主任',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    description: '全校跨班級檢視、全校出缺席監控、系統備份與學生總冊。',
  },
  class_officer: {
    label: '課務幹部 / 股長',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
    description: '協助班級現場 QR Code 掃描報到、課堂缺席登記與作業收繳收齊。',
  },
};

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-lin',
    name: '林信宏 導師',
    email: 'lin.hh@daan.tp.edu.tw',
    role: 'homeroom_teacher',
    title: '八年仁班 導師 (國文專任)',
    schoolName: '市立大安國民中學',
    avatarColor: 'indigo',
    assignedClassIds: ['class-802'],
    subject: '國文',
    lastLoginAt: '2026-09-23 07:45',
    createdAt: '2026-08-30',
  },
  {
    id: 'user-sarah',
    name: 'Sarah Chen 老師',
    email: 'sarah.chen@daan.tp.edu.tw',
    role: 'subject_teacher',
    title: '國中英語科 專任教師',
    schoolName: '市立大安國民中學',
    avatarColor: 'purple',
    assignedClassIds: ['class-802', 'class-801'],
    subject: '英語',
    lastLoginAt: '2026-09-23 08:30',
    createdAt: '2026-08-30',
  },
  {
    id: 'user-chen',
    name: '陳建宏 老師',
    email: 'jh.chen@daan.tp.edu.tw',
    role: 'subject_teacher',
    title: '數學科 教師 / 領域召集人',
    schoolName: '市立大安國民中學',
    avatarColor: 'emerald',
    assignedClassIds: ['class-802', 'class-801'],
    subject: '數學',
    lastLoginAt: '2026-09-22 16:10',
    createdAt: '2026-08-30',
  },
  {
    id: 'user-dean',
    name: '張明達 主任',
    email: 'dean.chang@daan.tp.edu.tw',
    role: 'admin',
    title: '學務處 主任兼理化專任',
    schoolName: '市立大安國民中學',
    avatarColor: 'amber',
    assignedClassIds: ['*'],
    subject: '理化',
    lastLoginAt: '2026-09-23 07:30',
    createdAt: '2026-08-25',
  },
  {
    id: 'user-officer',
    name: '林冠宇 (班長)',
    email: 'student.kuanyu@daan.tp.edu.tw',
    role: 'class_officer',
    title: '八年仁班 班長兼課務幹部',
    schoolName: '市立大安國民中學',
    avatarColor: 'sky',
    assignedClassIds: ['class-802'],
    lastLoginAt: '2026-09-23 07:50',
    createdAt: '2026-09-01',
  },
];

// 幹部類別資訊
export const CADRE_CATEGORIES_INFO: Record<
  CadreCategory,
  { label: string; color: string; bg: string; text: string; border: string }
> = {
  core_admin: { label: '核心行政', color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  academic: { label: '學藝事務', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  discipline: { label: '常規紀律', color: 'rose', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  health_service: { label: '衛生服務', color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  activities: { label: '體育活動', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  subject_assistant: { label: '各科小老師', color: 'purple', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

// 待辦任務類別資訊
export const TASK_CATEGORIES_INFO: Record<
  TaskCategory,
  { label: string; color: string; bg: string; text: string; border: string }
> = {
  homeroom: { label: '班級常規', color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  academic: { label: '教務學業', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  student_affairs: { label: '學務活動', color: 'rose', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  general_affairs: { label: '總務班費', color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  activity: { label: '競賽展演', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  counseling: { label: '輔導諮商', color: 'violet', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  other: { label: '其他代辦', color: 'slate', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

// 任務優先等級資訊
export const TASK_PRIORITY_INFO: Record<
  TaskPriority,
  { label: string; color: string; badgeClass: string }
> = {
  urgent: { label: '特急件', color: 'rose', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-black' },
  high: { label: '高優先', color: 'amber', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold' },
  normal: { label: '普通', color: 'blue', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 font-medium' },
  low: { label: '低優先', color: 'slate', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 font-normal' },
};

// 八年仁班 初始幹部編制
export const INITIAL_CADRES: ClassCadre[] = [
  {
    id: 'cadre-1',
    classId: 'class-802',
    roleName: '班長',
    category: 'core_admin',
    studentId: 'stu-802-01',
    dutyDescription: '綜理全班事務、擔任師生溝通橋樑、主持班會與升旗整隊',
    status: 'active',
    appointedDate: '2026-09-01',
    notes: '熱心負責，具領導特質',
  },
  {
    id: 'cadre-2',
    classId: 'class-802',
    roleName: '副班長',
    category: 'core_admin',
    studentId: 'stu-802-14',
    dutyDescription: '協助班長、每日出缺席點名冊彙整、自習巡視與秩序登記',
    status: 'active',
    appointedDate: '2026-09-01',
  },
  {
    id: 'cadre-3',
    classId: 'class-802',
    roleName: '學藝股長',
    category: 'academic',
    studentId: 'stu-802-02',
    dutyDescription: '書寫每日聯絡簿與黑板課表、催繳與分發各科作業、教室壁報美化',
    status: 'active',
    appointedDate: '2026-09-01',
    notes: '字跡工整，與各科小老師密切聯繫',
  },
  {
    id: 'cadre-4',
    classId: 'class-802',
    roleName: '風紀股長',
    category: 'discipline',
    studentId: 'stu-802-05',
    dutyDescription: '早自習、午休與自習課堂秩序維持、違規喧嘩記點回報',
    status: 'active',
    appointedDate: '2026-09-01',
  },
  {
    id: 'cadre-5',
    classId: 'class-802',
    roleName: '衛生股長',
    category: 'health_service',
    studentId: 'stu-802-09',
    dutyDescription: '督導外掃區與教室責任區整潔、資源回收分類、打掃用具請領',
    status: 'active',
    appointedDate: '2026-09-01',
  },
  {
    id: 'cadre-6',
    classId: 'class-802',
    roleName: '體育股長',
    category: 'activities',
    studentId: 'stu-802-11',
    dutyDescription: '體育課帶操集合、借還體育器材球具、校慶運動會報名聯絡',
    status: 'active',
    appointedDate: '2026-09-01',
  },
  {
    id: 'cadre-7',
    classId: 'class-802',
    roleName: '總務股長',
    category: 'core_admin',
    studentId: 'stu-802-08',
    dutyDescription: '班費收支記帳與保管、各項代辦書籍費收取、公物損壞報修',
    status: 'active',
    appointedDate: '2026-09-01',
  },
  {
    id: 'cadre-8',
    classId: 'class-802',
    roleName: '資訊股長',
    category: 'academic',
    studentId: 'stu-802-04',
    dutyDescription: '智慧觸控黑板開關、投影機音響連線、電腦教室設備盤點',
    status: 'active',
    appointedDate: '2026-09-01',
  },
  {
    id: 'cadre-9',
    classId: 'class-802',
    roleName: '輔導股長',
    category: 'core_admin',
    studentId: 'stu-802-10',
    dutyDescription: '傳達輔導室文宣活動、心理測驗發放、同儕情緒關懷橋樑',
    status: 'active',
    appointedDate: '2026-09-01',
  },
  {
    id: 'cadre-10',
    classId: 'class-802',
    roleName: '國文小老師',
    category: 'subject_assistant',
    studentId: 'stu-802-06',
    dutyDescription: '協助導師收發國文習作、登記生字成語晨考成績、課堂引導',
    status: 'active',
    appointedDate: '2026-09-01',
  },
  {
    id: 'cadre-11',
    classId: 'class-802',
    roleName: '數學小老師',
    category: 'subject_assistant',
    studentId: 'stu-802-15',
    dutyDescription: '協助陳建宏老師收發數學考卷、計算課堂疑難題整理',
    status: 'active',
    appointedDate: '2026-09-01',
  },
  {
    id: 'cadre-12',
    classId: 'class-802',
    roleName: '英文小老師',
    category: 'subject_assistant',
    studentId: 'stu-802-16',
    dutyDescription: '播放空中英語早自習廣播、收發英文閱讀單字本',
    status: 'active',
    appointedDate: '2026-09-01',
  },
];

// 八年仁班 初始待辦任務清單
export const INITIAL_TASKS: ClassTask[] = [
  {
    id: 'task-1',
    classId: 'class-802',
    title: '收回校外教學（九族文化村）家長同意書與用餐調查',
    description: '需回收全班 25 份同意書，請核對家長簽名、葷素統計及特殊疾病欄位，放學前交至學務處訓育組。',
    dueDate: '2026-09-24',
    dueTime: '16:00',
    priority: 'urgent',
    category: 'student_affairs',
    status: 'in_progress',
    assignedCadreRole: '班長',
    assignedStudentId: 'stu-802-01',
    createdAt: '2026-09-22 09:00',
    isImportant: true,
  },
  {
    id: 'task-2',
    classId: 'class-802',
    title: '催收並彙整第二次定期評量數學習作與第三課國文段落賞析',
    description: '第二節下課前於作業盤點系統清點完畢，尚未繳交名單直接寄發家長通知信。',
    dueDate: '2026-09-23',
    dueTime: '12:00',
    priority: 'high',
    category: 'academic',
    status: 'pending',
    assignedCadreRole: '學藝股長',
    assignedStudentId: 'stu-802-02',
    createdAt: '2026-09-23 07:45',
    isImportant: true,
  },
  {
    id: 'task-3',
    classId: 'class-802',
    title: '彙整本學期第一次班費收支明細表並公告家長聯絡群',
    description: '核對文具耗材、班級圖書角借閱書架購置費用（共 4,200 元），產出收支表給家長代表審核。',
    dueDate: '2026-09-25',
    dueTime: '17:00',
    priority: 'normal',
    category: 'general_affairs',
    status: 'pending',
    assignedCadreRole: '總務股長',
    assignedStudentId: 'stu-802-08',
    createdAt: '2026-09-21 14:00',
  },
  {
    id: 'task-4',
    classId: 'class-802',
    title: '安排下週外掃區（落葉堆肥區）責任輪替名冊與工具盤點',
    description: '竹掃把尚缺 3 把需向總務處請領，雨後落葉清理分配至第三組與第五組。',
    dueDate: '2026-09-25',
    dueTime: '15:30',
    priority: 'normal',
    category: 'homeroom',
    status: 'in_progress',
    assignedCadreRole: '衛生股長',
    assignedStudentId: 'stu-802-09',
    createdAt: '2026-09-22 16:30',
  },
  {
    id: 'task-5',
    classId: 'class-802',
    title: '校慶創意進場道具主題徵選與口號初稿彙整',
    description: '利用第七節班會課進行小組表決，決議主題後由學藝與壁報股長擬定採購材料預算。',
    dueDate: '2026-09-26',
    dueTime: '16:00',
    priority: 'normal',
    category: 'activity',
    status: 'pending',
    assignedCadreRole: '副班長',
    assignedStudentId: 'stu-802-14',
    createdAt: '2026-09-23 08:15',
  },
  {
    id: 'task-6',
    classId: 'class-802',
    title: '輔導室個別晤談意願調查表回收與保密封袋遞送',
    description: '全班已全數繳回，彌封後已親送輔導室張老師簽收。',
    dueDate: '2026-09-22',
    dueTime: '12:00',
    priority: 'normal',
    category: 'counseling',
    status: 'completed',
    assignedCadreRole: '輔導股長',
    assignedStudentId: 'stu-802-10',
    completedAt: '2026-09-22 11:30',
    createdAt: '2026-09-20 10:00',
  },
];



