import type { MutableRefObject } from 'react';

// 화면설계서 모드 타입
export type SpecMode = 'crm' | 'spec';

// 컴포넌트 수정 상태
export type SpecItemStatus = 'original' | 'modified' | 'added';

// 패널 탭
export type SpecPanelTab = 'ui' | 'states' | 'api';

// spec-data JSON의 API 항목
export interface SpecApi {
  method: string;
  path: string;
  description: string;
}

// spec-data JSON의 컴포넌트 항목
export interface SpecComponent {
  id: string;
  name: string;
  type: string;
  description: string;
  uiIndex: number;
}

// spec-data JSON 화면 전체
export interface SpecScreen {
  id: string;
  name: string;
  route: string;
  description: string;
  accessRole: string;
  layout: string;
  screenDesign: string;
  functionalSpec: string;
  sourceFile: string;
  components: SpecComponent[];
  apis: SpecApi[];
  hooks: string[];
  states: string[];
}

// 수정 항목
export interface SpecEdit {
  componentId: string;
  description: string;
  editedAt: string;
  status: 'modified' | 'added';
  name?: string;
  type?: string;
  uiIndex?: number;
  cssSelector?: string;
}

// _edits.json 파일 구조
export interface SpecEditsFile {
  edits: Record<string, Record<string, SpecEdit>>;
  lastUpdated: string;
}

// React Context 값
export interface SpecContextValue {
  mode: SpecMode;
  setMode: (mode: SpecMode) => void;
  screenData: SpecScreen | null;
  isLoading: boolean;
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  edits: Record<string, SpecEdit>;
  updateEdit: (componentId: string, description: string) => void;
  updateUiIndex: (componentId: string, uiIndex: number) => void;
  addComponent: (name: string, type: string, description: string, cssSelector?: string) => void;
  removeEdit: (componentId: string) => void;
  saveEdits: () => Promise<void>;
  isSaving: boolean;
  getItemStatus: (componentId: string) => SpecItemStatus;
  // 피그마 스타일 인터랙션
  hoveredItemId: string | null;
  setHoveredItemId: (id: string | null) => void;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  componentRefs: MutableRefObject<Map<string, HTMLDivElement>>;
  panelItemRefs: MutableRefObject<Map<string, HTMLDivElement>>;
  // 엘리먼트 피커
  pickerActive: boolean;
  setPickerActive: (active: boolean) => void;
}
