export const AppealStatus = {
  1: 'Gözləmədə',
  2: 'Açıq',
  3: 'Müsahibə',
  4: 'İmtina',
  5: 'İşə qəbul',
  6: 'Uyğun deyil',
};

export const AppealRoutesStatus = {
  wait: [1],
  new: [2],
  interview: [3],
  result: [4, 5, 6],
};

export const AppealOriginTypes = {
  vacancy: 'vacancies',
  announcement: 'announcements',
};

export const AppealStatusData = [
  { id: 1, name: AppealStatus[1] },
  { id: 2, name: AppealStatus[2] },
  { id: 3, name: AppealStatus[3] },
  { id: 4, name: AppealStatus[4] },
  { id: 5, name: AppealStatus[5] },
  { id: 6, name: AppealStatus[6] },
];

export const GenderStatus = {
  1: 'Kişi',
  2: 'Qadın',
};

export const GenderStatusData = [
  { id: 1, name: 'Kişi' },
  { id: 2, name: 'Qadın' },
];

export const FamilyStatus = {
  1: 'Evli',
  2: 'Subay',
};

// for select options
export const FamilyStatusData = [
  { id: 1, name: 'Evli' },
  { id: 2, name: 'Subay' },
];

export const EducationStatus = {
  1: 'Orta',
  2: 'Orta xüsusi',
  3: 'Orta texniki',
  4: 'Natamam ali',
  5: 'Ali',
  6: 'Elmi',
};

export const EducationStatusData = [
  { id: 1, name: EducationStatus[1] },
  { id: 2, name: EducationStatus[2] },
  { id: 3, name: EducationStatus[3] },
  { id: 4, name: EducationStatus[4] },
  { id: 5, name: EducationStatus[5] },
  { id: 6, name: EducationStatus[6] },
];

export const ExperienceStatus = {
  1: '1 ilə qədər',
  2: '1 ildən çox',
  3: '3 il',
  4: '3 ildən çox',
  5: '5 il',
  6: '5 ildən çox',
};

export const ExperienceStatusData = [
  { id: 1, name: ExperienceStatus[1] },
  { id: 2, name: ExperienceStatus[2] },
  { id: 3, name: ExperienceStatus[3] },
  { id: 4, name: ExperienceStatus[4] },
  { id: 5, name: ExperienceStatus[5] },
  { id: 6, name: ExperienceStatus[6] },
];

export const WorkGraphicStatus = {
  1: 'Tam iş günü',
  2: 'Sərbəst qrafik',
  3: 'Qismən məşğulluq',
  4: 'Freelance',
};

export const WorkGraphicStatusData = [
  { id: 1, name: WorkGraphicStatus[1] },
  { id: 2, name: WorkGraphicStatus[2] },
  { id: 3, name: WorkGraphicStatus[3] },
  { id: 4, name: WorkGraphicStatus[4] },
];

// Appeal History status
export const HistoryOperatorStatus = {
  PERSON: 1,
  PROVIDER: 2,
};

export const AppealHistoryStatus = {
  VACANCY_REQUEST: 'vacancy_request',
  INTERVIEW_CREATE: 'interview_create',
  INTERVIEW_EDIT: 'interview_edit',
  INTERVIEW_AGREE: 'interview_agree',
  VACANCY_REJECT: 'interview_reject',
  VACANCY_RESULT: 'interview_result',
};

export const AppealHistoryStatusData = {
  vacancy_request: 'Müraciət etdi.',
  interview_create: 'Müsahibəyə dəvət etdi.',
  interview_edit: 'Müsahibə dəyişdirildi.',
  interview_agree: 'Müsahibəyə razılaşdı.',
  interview_reject: 'İmtina edildi.',
  interview_result: 'Müsahibə nəticəsi.',
};

//  Təkrar intervyu not ready
export const InterviewResultOptions = [
  {
    id: 5,
    name: 'İşə qəbul edildi',
  },
  {
    id: 6,
    name: 'Uyğun deyil',
  },
];

export const languagesPossessionData = {
  1: 'ana dili',
  2: 'yaxşı',
  3: 'orta',
  4: 'kafi',
};
