export type ContactSubject =
  | 'general'
  | 'order'
  | 'custom'
  | 'product'
  | 'returns'
  | 'wholesale';

export interface ContactInquiry {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: ContactSubject;
  message: string;
  submittedAt: Date;
}

export interface ContactSubjectOption {
  value: ContactSubject;
  label: string;
}
