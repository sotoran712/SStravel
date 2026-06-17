# Honeymoon Atlas 2026

신혼여행 계획을 날짜별 일정, 항공권, 숙소, Google Maps 주소, 예산/사용 금액, 준비물, GitHub용 JSON/README 내보내기로 관리하는 정적 웹앱입니다.

## 실행

`index.html`을 브라우저에서 열면 바로 사용할 수 있습니다. GitHub Pages에 올릴 때는 이 폴더 전체를 저장소 루트나 `/docs` 폴더에 배치하면 됩니다.

## GitHub 데이터 흐름

- 앱은 `https://github.com/sotoran712/SStravel` 저장소의 `main` 브랜치와 `trip-data.json` 파일을 기본 연결값으로 사용합니다.
- 앱 안에서 `trip-data.json`을 다운로드해 저장소에 커밋하면 여행 계획을 JSON으로 버전 관리할 수 있습니다.
- 수정사항이 생기면 화면 우측 상단에 `저장하기` 버튼이 나타납니다.
- GitHub 패널의 `GitHub 토큰` 칸에 Fine-grained token을 입력하면 `저장하기` 버튼이 `trip-data.json`을 GitHub API로 직접 커밋하고, 저장 직후 GitHub에서 다시 읽어 현재 화면과 같은지 검증합니다. 토큰은 코드나 JSON에 저장하지 않고 현재 브라우저 탭의 sessionStorage에만 보관됩니다.
- 토큰을 연결하지 않은 상태에서는 `저장하기`가 GitHub에 커밋하지 않습니다. 파일로 저장하려면 `JSON` 버튼을 사용합니다.
- `README.md` 다운로드 또는 복사를 사용하면 GitHub 저장소 첫 화면에 보기 좋은 일정표를 만들 수 있습니다.
- 같은 폴더에 `trip-data.json`이 있으면 GitHub Pages에서 처음 열 때 자동으로 불러옵니다.

## 파일

- `index.html`: 앱 화면
- `styles.css`: 반응형 UI 스타일
- `app.js`: 로컬 저장, 일정/숙소/예산/GitHub 내보내기 로직
- `assets/honeymoon-planning-banner.png`: 생성형 이미지 배너
