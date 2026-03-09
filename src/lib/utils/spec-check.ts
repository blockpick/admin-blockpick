/**
 * 정합성 검증 유틸 - spec-data와 실제 프로젝트 구조 간 일치 여부 확인
 *
 * 실행 방법:
 *   npx ts-node --project tsconfig.json src/lib/utils/spec-check.ts
 *
 * 검증 항목:
 *   1. manifest의 각 화면 route가 src/app/ 디렉토리에 page.tsx로 존재하는지
 *   2. 각 화면의 screenDesign 파일이 docs/screen-design/에 존재하는지
 *   3. 각 화면의 functionalSpec 파일이 docs/functional-spec/에 존재하는지
 *   4. specDataFile이 실제로 spec-data/에 존재하는지
 */

import * as fs from 'fs';
import * as path from 'path';

// 프로젝트 루트 경로 (이 파일 기준 3단계 상위)
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

interface ScreenEntry {
  id: string;
  name: string;
  route: string;
  screenDesign: string;
  functionalSpec: string;
  specDataFile: string;
}

interface Manifest {
  version: string;
  generatedAt: string;
  project: string;
  screens: ScreenEntry[];
}

interface CheckResult {
  screen: string;
  id: string;
  pass: boolean;
  failures: string[];
}

/** route 문자열을 src/app 경로로 변환 (콤마 구분 복수 route 처리) */
function routeToPagePaths(route: string): string[] {
  return route.split(',').map((r) => {
    const trimmed = r.trim();
    // /login → src/app/login/page.tsx
    // /games/[id]/products → src/app/games/[id]/products/page.tsx
    const relative = trimmed === '/' ? '' : trimmed;
    return path.join(PROJECT_ROOT, 'src/app', relative, 'page.tsx');
  });
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function checkScreen(screen: ScreenEntry): CheckResult {
  const failures: string[] = [];

  // 1. route → page.tsx 존재 여부
  const pagePaths = routeToPagePaths(screen.route);
  const anyPageExists = pagePaths.some(fileExists);
  if (!anyPageExists) {
    failures.push(
      `route '${screen.route}' 에 해당하는 page.tsx 없음\n  경로 확인: ${pagePaths.join(', ')}`
    );
  }

  // 2. screenDesign 파일 존재 여부
  const screenDesignPath = path.join(PROJECT_ROOT, screen.screenDesign);
  if (!fileExists(screenDesignPath)) {
    failures.push(`screenDesign 파일 없음: ${screen.screenDesign}`);
  }

  // 3. functionalSpec 파일 존재 여부
  const functionalSpecPath = path.join(PROJECT_ROOT, screen.functionalSpec);
  if (!fileExists(functionalSpecPath)) {
    failures.push(`functionalSpec 파일 없음: ${screen.functionalSpec}`);
  }

  // 4. specDataFile 존재 여부
  const specDataPath = path.join(PROJECT_ROOT, screen.specDataFile);
  if (!fileExists(specDataPath)) {
    failures.push(`specDataFile 없음: ${screen.specDataFile}`);
  }

  return {
    screen: screen.name,
    id: screen.id,
    pass: failures.length === 0,
    failures,
  };
}

function run() {
  console.log('='.repeat(60));
  console.log('  BlockPick Admin - Spec 정합성 검증');
  console.log('='.repeat(60));
  console.log(`  프로젝트 루트: ${PROJECT_ROOT}`);
  console.log('');

  // manifest 로드
  const manifestPath = path.join(PROJECT_ROOT, 'spec-data/_manifest.json');
  if (!fileExists(manifestPath)) {
    console.error(`[오류] manifest 파일 없음: ${manifestPath}`);
    process.exit(1);
  }

  const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  console.log(
    `  버전: ${manifest.version}  |  생성일: ${manifest.generatedAt}  |  화면 수: ${manifest.screens.length}`
  );
  console.log('');

  const results: CheckResult[] = manifest.screens.map(checkScreen);

  // 결과 출력
  let passCount = 0;
  let failCount = 0;

  for (const result of results) {
    if (result.pass) {
      console.log(`  [PASS] ${result.id} - ${result.screen}`);
      passCount++;
    } else {
      console.log(`  [FAIL] ${result.id} - ${result.screen}`);
      for (const failure of result.failures) {
        console.log(`         - ${failure}`);
      }
      failCount++;
    }
  }

  console.log('');
  console.log('-'.repeat(60));
  console.log(
    `  결과: ${passCount} PASS / ${failCount} FAIL / ${results.length} 전체`
  );

  if (failCount === 0) {
    console.log('  모든 화면 정합성 검증 통과.');
  } else {
    console.log(`  ${failCount}개 화면에서 불일치가 발견되었습니다.`);
  }

  console.log('='.repeat(60));

  // FAIL 있으면 비정상 종료
  if (failCount > 0) process.exit(1);
}

run();
