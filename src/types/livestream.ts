/**
 * Livestream-related types: reports, config, equipment. Align with Supabase settings/live_reports.
 */
export interface LiveReportPayload {
  userEmail: string;
  topic: string;
  userName?: string;
  platform: string;
  timestamp?: string;
  startTime?: string;
  endTime?: string;
  /** KPIs */
  views?: string | number;
  pcu?: string | number;
  likes?: string | number;
  comments?: string | number;
  newFollowers?: string | number;
  productClicks?: string | number;
  orders?: string | number;
  revenue?: string | number;
  cvr?: string | number;
  gpm?: string | number;
  technicalIssues?: string;
  equipmentCheckOk?: boolean;
  equipmentNote?: string;
  note?: string;
  [key: string]: unknown;
}

export interface LiveStreamConfig {
  pictureProfile?: string;
  [key: string]: unknown;
}

export interface LiveStreamEquipmentItem {
  id: number;
  group?: string;
  brand?: string;
  gearList?: string;
  quantity?: number | string;
  serialNumber?: string;
  source?: string;
  status?: string;
  checked?: boolean;
}
