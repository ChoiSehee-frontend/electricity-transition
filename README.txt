전력 전환 데이터 시각화 — 최종 제출 안내

1. ZIP을 모두 풀고 index.html을 Chrome 또는 Edge에서 엽니다.
   인터넷·설치 없이 작동합니다. HTML만 따로 이동하지 마세요.
2. Part A: index.html / Part B: story.html / 보고서: report.html
3. 국가 버튼을 열어 드롭다운 안에서 한글·영문 검색 → 국가 선택.
   기간·단위·유형·정렬을 바꾸고 국가 이름을 선택하면 차트가 연결됩니다.
   점·막대 클릭(또는 Enter/Space)으로 그래프 위 검은 툴팁 고정, 다시 클릭·닫기·Escape로 해제.
   조건 변경 시 고정 값은 해제됩니다. 초기화로 기본 상태를 복원합니다.
4. Part B는 세계의 두 차트와 국가별 세 유형을 고정된 범위로 제시합니다.
   마우스 조작 없이 핵심 수치와 설명을 읽을 수 있습니다.
5. prepared_data.csv: 2000–2024, 88개 국가·지역 + 세계, 2,225행.
   기본 비교는 양 끝 연도 모두 0인 3개를 숨겨 85개입니다.
   codebook.csv: 원자료 변수 정의 / audit.json: 품질·제외 기록.
   preprocessing.py: 재현 코드. 실행에는 Python·pandas가 필요합니다.
   실행 예: python preprocessing.py 원본CSV경로 원본코드북경로 출력폴더
   시각화 열람에는 Python이 필요하지 않습니다.
6. Part B SVG는 해당 버튼, PDF는 브라우저 인쇄로 저장할 수 있습니다.

온라인 게시 (가산점 검토 대상):
Part A https://electricty-transition-visualizaiton.netlify.app/
Part B https://electricty-transition-visualizaiton.netlify.app/story
보고서 https://electricty-transition-visualizaiton.netlify.app/report
