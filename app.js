/**
 * SkyCast - 실시간 날씨 웹 애플리케이션
 * 완전 무료 & API 키 불필요 (Open-Meteo API + OpenStreetMap Nominatim Geocoding)
 * 지역명 오타 감지 및 스마트 원클릭 교정 알고리즘
 */

// WMO 날씨 해석 코드 매핑 테이블
const WMO_WEATHER_MAP = {
  0: { label: '맑음', dayEmoji: '☀️', nightEmoji: '🌙', theme: 'theme-clear', desc: '하늘이 매우 맑고 청명합니다' },
  1: { label: '대체로 맑음', dayEmoji: '🌤️', nightEmoji: '🌤️', theme: 'theme-clear', desc: '구름이 조금 있으나 화창합니다' },
  2: { label: '구름 조금', dayEmoji: '⛅', nightEmoji: '⛅', theme: 'theme-clouds', desc: '군데군데 구름이 지나갑니다' },
  3: { label: '흐림', dayEmoji: '☁️', nightEmoji: '☁️', theme: 'theme-clouds', desc: '하늘 전체에 구름이 가득합니다' },
  45: { label: '안개', dayEmoji: '🌫️', nightEmoji: '🌫️', theme: 'theme-clouds', desc: '가시거리가 짧으니 운전에 유의하세요' },
  48: { label: '짙은 안개(성에)', dayEmoji: '🌫️', nightEmoji: '🌫️', theme: 'theme-clouds', desc: '안개가 짙고 습도가 높습니다' },
  51: { label: '약한 이슬비', dayEmoji: '🌦️', nightEmoji: '🌦️', theme: 'theme-rain', desc: '가랑비가 흩뿌립니다' },
  53: { label: '이슬비', dayEmoji: '🌦️', nightEmoji: '🌦️', theme: 'theme-rain', desc: '촉촉한 이슬비가 내리고 있습니다' },
  55: { label: '강한 이슬비', dayEmoji: '🌧️', nightEmoji: '🌧️', theme: 'theme-rain', desc: '굵은 이슬비가 지속됩니다' },
  56: { label: '약한 빙우', dayEmoji: '🌨️', nightEmoji: '🌨️', theme: 'theme-snow', desc: '얼어붙는 비가 내립니다' },
  57: { label: '강한 빙우', dayEmoji: '🌨️', nightEmoji: '🌨️', theme: 'theme-snow', desc: '빙판길에 각별히 유의하세요' },
  61: { label: '약한 비', dayEmoji: '🌦️', nightEmoji: '🌧️', theme: 'theme-rain', desc: '가벼운 비가 내리고 있습니다' },
  63: { label: '보통 비', dayEmoji: '🌧️', nightEmoji: '🌧️', theme: 'theme-rain', desc: '우산을 꼭 챙겨 외출하세요' },
  65: { label: '강한 비', dayEmoji: '🌧️', nightEmoji: '🌧️', theme: 'theme-rain', desc: '많은 비가 쏟아지고 있습니다' },
  66: { label: '얼어붙는 약한 비', dayEmoji: '🌨️', nightEmoji: '🌨️', theme: 'theme-snow', desc: '차가운 어는 비가 내립니다' },
  67: { label: '얼어붙는 강한 비', dayEmoji: '🌨️', nightEmoji: '🌨️', theme: 'theme-snow', desc: '강한 빙우가 내리고 있습니다' },
  71: { label: '약한 눈', dayEmoji: '🌨️', nightEmoji: '🌨️', theme: 'theme-snow', desc: '송이눈이 조금씩 내립니다' },
  73: { label: '보통 눈', dayEmoji: '❄️', nightEmoji: '❄️', theme: 'theme-snow', desc: '소복이 눈이 쌓이고 있습니다' },
  75: { label: '폭설 / 강한 눈', dayEmoji: '❄️', nightEmoji: '❄️', theme: 'theme-snow', desc: '많은 눈이 내리고 있습니다' },
  77: { label: '싸락눈', dayEmoji: '🌨️', nightEmoji: '🌨️', theme: 'theme-snow', desc: '싸락눈이 알갱이로 떨어집니다' },
  80: { label: '약한 소나기', dayEmoji: '🌦️', nightEmoji: '🌦️', theme: 'theme-rain', desc: '잠시 스쳐 지나가는 비입니다' },
  81: { label: '소나기', dayEmoji: '🌧️', nightEmoji: '🌧️', theme: 'theme-rain', desc: '갑작스러운 소나기에 주의하세요' },
  82: { label: '강한 소나기', dayEmoji: '⛈️', nightEmoji: '⛈️', theme: 'theme-rain', desc: '세찬 소나기가 집중되고 있습니다' },
  85: { label: '약한 눈소나기', dayEmoji: '🌨️', nightEmoji: '🌨️', theme: 'theme-snow', desc: '잠시 눈발이 흩날립니다' },
  86: { label: '강한 눈소나기', dayEmoji: '🌨️', nightEmoji: '🌨️', theme: 'theme-snow', desc: '강한 눈보라에 유의하세요' },
  95: { label: '천둥번개 / 뇌우', dayEmoji: '⛈️', nightEmoji: '⛈️', theme: 'theme-thunder', desc: '천둥과 번개를 동반하고 있습니다' },
  96: { label: '우박 동반 약한 뇌우', dayEmoji: '⛈️', nightEmoji: '⛈️', theme: 'theme-thunder', desc: '우박과 번개에 주의하세요' },
  99: { label: '우박 동반 강한 뇌우', dayEmoji: '⛈️', nightEmoji: '⛈️', theme: 'theme-thunder', desc: '안전한 실내에 머무르세요' }
};

// 한국 및 세계 주요 도시 즉시 매핑 사전
const QUICK_CITY_MAP = {
  '서울': { name: '서울특별시', lat: 37.5665, lon: 126.9780, country: 'KR' },
  '서울시': { name: '서울특별시', lat: 37.5665, lon: 126.9780, country: 'KR' },
  '부산': { name: '부산광역시', lat: 35.1796, lon: 129.0756, country: 'KR' },
  '부산시': { name: '부산광역시', lat: 35.1796, lon: 129.0756, country: 'KR' },
  '제주': { name: '제주특별자치도', lat: 33.4996, lon: 126.5312, country: 'KR' },
  '제주시': { name: '제주시', lat: 33.4996, lon: 126.5312, country: 'KR' },
  '제주도': { name: '제주특별자치도', lat: 33.4996, lon: 126.5312, country: 'KR' },
  '인천': { name: '인천광역시', lat: 37.4563, lon: 126.7052, country: 'KR' },
  '대구': { name: '대구광역시', lat: 35.8714, lon: 128.6014, country: 'KR' },
  '대전': { name: '대전광역시', lat: 36.3504, lon: 127.3845, country: 'KR' },
  '광주': { name: '광주광역시', lat: 35.1595, lon: 126.8526, country: 'KR' },
  '울산': { name: '울산광역시', lat: 35.5384, lon: 129.3114, country: 'KR' },
  '세종': { name: '세종특별자치시', lat: 36.4800, lon: 127.2890, country: 'KR' },
  '수원': { name: '수원시', lat: 37.2636, lon: 127.0286, country: 'KR' },
  '성남': { name: '성남시', lat: 37.4200, lon: 127.1265, country: 'KR' },
  '고양': { name: '고양시', lat: 37.6584, lon: 126.8320, country: 'KR' },
  '용인': { name: '용인시', lat: 37.2410, lon: 127.1775, country: 'KR' },
  '청주': { name: '청주시', lat: 36.6424, lon: 127.4890, country: 'KR' },
  '전주': { name: '전주시', lat: 35.8242, lon: 127.1480, country: 'KR' },
  '천안': { name: '천안시', lat: 36.8151, lon: 127.1139, country: 'KR' },
  '김제': { name: '김제시', lat: 35.8036, lon: 126.8808, country: 'KR' },
  '나주': { name: '나주시', lat: 35.0160, lon: 126.7108, country: 'KR' },
  '아산': { name: '아산시', lat: 36.7898, lon: 127.0019, country: 'KR' },
  '군산': { name: '군산시', lat: 35.9676, lon: 126.7366, country: 'KR' },
  '익산': { name: '익산시', lat: 35.9483, lon: 126.9576, country: 'KR' },
  '포항': { name: '포항시', lat: 36.0190, lon: 129.3435, country: 'KR' },
  '창원': { name: '창원시', lat: 35.2280, lon: 128.6811, country: 'KR' },
  '도쿄': { name: '도쿄 (Tokyo)', lat: 35.6895, lon: 139.6917, country: 'JP' },
  '오사카': { name: '오사카 (Osaka)', lat: 34.6937, lon: 135.5023, country: 'JP' },
  '뉴욕': { name: '뉴욕 (New York)', lat: 40.7128, lon: -74.0060, country: 'US' },
  '런던': { name: '런던 (London)', lat: 51.5074, lon: -0.1278, country: 'GB' },
  '파리': { name: '파리 (Paris)', lat: 48.8566, lon: 2.3522, country: 'FR' },
  '베이징': { name: '베이징 (Beijing)', lat: 39.9042, lon: 116.4074, country: 'CN' }
};

// 대한민국 모든 시/군 및 세계 주요 도시 정식 명칭 목록 (오타가 아닌 실제 유효 도시)
const VALID_CITIES = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '수원', '성남', '의정부', '안양', '부천', '광명', '평택', '동두천', '안산', '고양', '과천', '구리', '남양주', '오산', '시흥', '군포', '의왕', '하남', '용인', '파주', '이천', '안성', '김포', '화성', '광주', '양주', '포천', '여주', '연천', '가평', '양평',
  '춘천', '원주', '강릉', '동해', '태백', '속초', '삼척', '홍천', '횡성', '영월', '평창', '정선', '철원', '화천', '양구', '인제', '고성', '양양',
  '청주', '충주', '제천', '보은', '옥천', '영동', '증평', '진천', '괴산', '음성', '단양',
  '천안', '공주', '보령', '아산', '서산', '논산', '계룡', '당진', '금산', '부여', '서천', '청양', '홍성', '예산', '태안',
  '전주', '군산', '익산', '정읍', '남원', '김제', '완주', '진안', '무주', '장수', '임실', '순창', '고창', '부안',
  '목포', '여수', '순천', '나주', '광양', '담양', '곡성', '구례', '고흥', '보성', '화순', '장흥', '강진', '해남', '영암', '무안', '함평', '영광', '장성', '완도', '진도', '신안',
  '포항', '경주', '김천', '안동', '구미', '영주', '영천', '상주', '문경', '경산', '군위', '의성', '청송', '영양', '영덕', '청도', '고령', '성주', '칠곡', '예천', '봉화', '울진', '울릉',
  '창원', '진주', '통영', '사천', '김해', '밀양', '거제', '양산', '의령', '함안', '창녕', '고성', '남해', '하동', '산청', '함양', '거창', '합천',
  '제주', '제주시', '서귀포', '서귀포시',
  '도쿄', '오사카', '후쿠오카', '삿포로', '교토', '뉴욕', '로스앤젤레스', '샌프란시스코', '시카고',
  '런던', '파리', '베를린', '로마', '마드리드', '베이징', '상하이', '방콕', '싱가포르', '시드니', '타이베이', '홍콩', '하노이', '다낭'
];

// 자주 발생하는 명백한 오타 사전
const COMMON_TYPOS = {
  '도코': '도쿄',
  '됴쿄': '도쿄',
  '도쿄오': '도쿄',
  '도꾜': '도쿄',
  '처나': '천안',
  '천안ㄴ': '천안',
  '서을': '서울',
  '소울': '서울',
  '설': '서울',
  '서율': '서울',
  '서우': '서울',
  '부선': '부산',
  '부산ㄴ': '부산',
  '부싼': '부산',
  '붓산': '부산',
  '제주도오': '제주도',
  '제주우': '제주',
  '쩨주': '제주',
  '뉴역': '뉴욕',
  '느욕': '뉴욕',
  '뉴욬': '뉴욕',
  '오사코': '오사카',
  '오싸카': '오사카',
  '오사가': '오사카',
  '후쿠오코': '후쿠오카',
  '파래': '파리',
  '페리': '파리',
  '패리': '파리',
  '배이징': '베이징',
  '런던ㄴ': '런던',
  '대군': '대구',
  '인천시이': '인천',
  '일천': '인천',
  '광주우': '광주',
  '울산시이': '울산',
  '수원시이': '수원',
  '용인시이': '용인',
  '창원시이': '창원'
};

// DOM 요소 캐싱
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const clearBtn = document.getElementById('clear-btn');
const searchBtn = document.getElementById('search-btn');
const geoBtn = document.getElementById('geo-btn');
const statusMessage = document.getElementById('status-message');
const statusIcon = document.getElementById('status-icon');
const statusTitle = document.getElementById('status-title');
const statusDesc = document.getElementById('status-desc');
const statusClose = document.getElementById('status-close');
const weatherCard = document.getElementById('weather-card');
const emptyState = document.getElementById('empty-state');
const chipsContainer = document.getElementById('chips-container');
const refreshBtn = document.getElementById('refresh-btn');
const ambientEffectsEl = document.getElementById('weather-ambient-effects');

// 날씨 카드 데이터 요소
const locationNameEl = document.getElementById('location-name');
const countryBadgeEl = document.getElementById('country-badge');
const localTimeEl = document.getElementById('local-time');
const dayNightIconEl = document.getElementById('day-night-icon');
const dayNightTextEl = document.getElementById('day-night-text');
const weatherIconEl = document.getElementById('weather-icon');
const weatherTextEl = document.getElementById('weather-text');
const weatherDescEl = document.getElementById('weather-desc');
const currentTempEl = document.getElementById('current-temp');
const minTempEl = document.getElementById('min-temp');
const maxTempEl = document.getElementById('max-temp');
const metricMaxTempEl = document.getElementById('metric-max-temp');
const metricMinTempEl = document.getElementById('metric-min-temp');
const apparentTempEl = document.getElementById('apparent-temp');
const humidityValEl = document.getElementById('humidity-val');
const windValEl = document.getElementById('wind-val');
const precipValEl = document.getElementById('precip-val');

// 현재 마지막으로 조회한 위치 캐싱
let lastFetchedLocation = null;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  // 기본 화면으로 서울 날씨 자동 조회
  fetchWeatherByCity('서울');
});

function setupEventListeners() {
  // 폼 제출 (검색)
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideStatusMessage(); // 다음 검색 시작 시 이전 안내 메시지 즉시 삭제
    const query = cityInput.value.trim();
    if (!query) {
      showStatusMessage('warning', '지역명을 입력해 주세요', '검색하실 지역 이름을 입력란에 적어주세요. (예: 서울, 도쿄, 뉴욕)');
      return;
    }
    fetchWeatherByCity(query);
  });

  // 검색창에 새 글자를 입력할 때 이전 안내 메시지 즉시 제거
  cityInput.addEventListener('input', () => {
    hideStatusMessage(); // 사용자가 타이핑하기 시작하면 이전 안내창 즉시 숨김
    clearBtn.hidden = !cityInput.value.trim();
  });

  // 검색창 클릭/포커스 시에도 이전 안내 메시지 닫기
  cityInput.addEventListener('focus', () => {
    hideStatusMessage();
  });

  // 인풋 지우기 버튼
  clearBtn.addEventListener('click', () => {
    cityInput.value = '';
    clearBtn.hidden = true;
    hideStatusMessage();
    cityInput.focus();
  });

  // 상태 알림 닫기 버튼
  statusClose.addEventListener('click', () => {
    hideStatusMessage();
  });

  // 상태 알림 내의 추천 버튼 클릭 (이벤트 위임)
  statusDesc.addEventListener('click', (e) => {
    const suggestionBtn = e.target.closest('.suggestion-btn');
    if (suggestionBtn) {
      const targetCity = suggestionBtn.dataset.city;
      if (targetCity) {
        hideStatusMessage(); // 안내창 닫기
        cityInput.value = targetCity;
        clearBtn.hidden = false;
        fetchWeatherByCity(targetCity);
      }
      return;
    }

    const forceBtn = e.target.closest('.force-search-btn');
    if (forceBtn) {
      const rawCity = forceBtn.dataset.city;
      if (rawCity) {
        hideStatusMessage();
        fetchWeatherByCity(rawCity, true);
      }
    }
  });

  // 인기 도시 칩 클릭
  chipsContainer.addEventListener('click', (e) => {
    const chip = e.target.closest('.city-chip');
    if (!chip) return;
    const city = chip.dataset.city;
    if (city) {
      hideStatusMessage(); // 다음 검색 시 이전 안내창 즉시 제거
      cityInput.value = city;
      clearBtn.hidden = false;
      fetchWeatherByCity(city);
    }
  });

  // 현재 내 위치 날씨 조회 버튼
  geoBtn.addEventListener('click', () => {
    hideStatusMessage(); // 이전 안내창 즉시 제거
    fetchWeatherByCurrentLocation();
  });

  // 새로고침 버튼
  refreshBtn.addEventListener('click', () => {
    if (lastFetchedLocation) {
      hideStatusMessage();
      fetchWeatherByCoordinates(
        lastFetchedLocation.latitude,
        lastFetchedLocation.longitude,
        lastFetchedLocation.name,
        lastFetchedLocation.countryCode
      );
    }
  });
}

/**
 * 상태 메시지(알림 배너) 표시 (오타 안내 및 추천 지원)
 */
function showStatusMessage(type = 'error', title = '안내', descHtml = '') {
  statusMessage.hidden = false;
  statusMessage.className = `status-message ${type === 'info' ? 'info' : type === 'warning' ? 'warning' : type === 'typo' ? 'typo-alert' : ''}`;
  
  if (type === 'info') {
    statusIcon.textContent = 'ℹ️';
  } else if (type === 'warning') {
    statusIcon.textContent = '⚠️';
  } else if (type === 'typo') {
    statusIcon.textContent = '💡';
    cityInput.classList.add('input-error');
    searchForm.classList.remove('shake');
    void searchForm.offsetWidth;
    searchForm.classList.add('shake');
  } else {
    statusIcon.textContent = '❌';
    cityInput.classList.add('input-error');
    searchForm.classList.remove('shake');
    void searchForm.offsetWidth;
    searchForm.classList.add('shake');
  }

  statusTitle.textContent = title;
  statusDesc.innerHTML = descHtml || '<div>지역명을 다시 확인해 주세요.</div>';
}

/**
 * 상태 메시지 완전 숨기기 및 초기화
 */
function hideStatusMessage() {
  if (statusMessage) {
    statusMessage.hidden = true;
  }
  if (cityInput) {
    cityInput.classList.remove('input-error');
  }
  if (searchForm) {
    searchForm.classList.remove('shake');
  }
}

/**
 * 검색/로딩 UI 상태 토글
 */
function setLoading(isLoading) {
  const btnText = searchBtn.querySelector('.btn-text');
  const btnSpinner = searchBtn.querySelector('.btn-spinner');

  if (isLoading) {
    searchBtn.disabled = true;
    geoBtn.disabled = true;
    btnText.textContent = '조회 중...';
    btnSpinner.hidden = false;
  } else {
    searchBtn.disabled = false;
    geoBtn.disabled = false;
    btnText.textContent = '날씨 검색';
    btnSpinner.hidden = true;
  }
}

/**
 * 한글 자모(초성/중성/종성) 분해 알고리즘
 */
function decomposeHangul(str) {
  const CHOSUNG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const JUNGSUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  const JONGSUNG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

  let result = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const charIndex = code - 0xAC00;
      const c = Math.floor(charIndex / 588);
      const v = Math.floor((charIndex % 588) / 28);
      const t = charIndex % 28;
      result += CHOSUNG[c] + JUNGSUNG[v] + (JONGSUNG[t] || '');
    } else {
      result += str[i].toLowerCase();
    }
  }
  return result;
}

/**
 * 두 문자열 간의 레벤슈타인 편집 거리 계산
 */
function getLevenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 대체
          matrix[i][j - 1] + 1,     // 삽입
          matrix[i - 1][j] + 1      // 삭제
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * 오타가 났을 때 가장 유사한 추천 도시를 탐색
 * 예: '처나' -> '천안', '도코' -> '도쿄', '서을' -> '서울', '부선' -> '부산'
 */
function findClosestCitySuggestion(query) {
  // 1순위: 오타 매핑 사전
  if (COMMON_TYPOS[query]) {
    return COMMON_TYPOS[query];
  }

  // 2순위: 한글 자모 Levenshtein 거리 측정
  const decQuery = decomposeHangul(query);
  let bestCity = null;
  let bestScore = 0;

  for (const city of VALID_CITIES) {
    if (city === query) continue;
    const decCity = decomposeHangul(city);
    const dist = getLevenshteinDistance(decQuery, decCity);
    const maxLen = Math.max(decQuery.length, decCity.length);
    const similarity = 1 - (dist / maxLen);

    // 자모 유사도 0.60 이상이거나 편집 거리가 1~2 이내인 경우
    if (similarity > bestScore && (similarity >= 0.60 || dist <= 2)) {
      bestScore = similarity;
      bestCity = city;
    }
  }

  return bestCity;
}

/**
 * 도시/지역 검색 파이프라인
 * @param {string} query 검색어
 * @param {boolean} forceSearch 오타 사전 검사를 건너뛰고 강제 검색할지 여부
 */
async function fetchWeatherByCity(query, forceSearch = false) {
  const cleanQuery = query.trim();
  setLoading(true);
  
  // 검색 시작 시 이전 안내 메시지와 이전 카드를 완전히 새로고침(클리어)
  hideStatusMessage();
  weatherCard.hidden = true;
  emptyState.hidden = true;

  try {
    // 1단계: 정확히 일치하는 내장 대표 도시 확인 (즉각 로드)
    if (QUICK_CITY_MAP[cleanQuery]) {
      const match = QUICK_CITY_MAP[cleanQuery];
      await fetchWeatherByCoordinates(match.lat, match.lon, match.name, match.country);
      return;
    }

    // 2단계: 실제 유효한 도시인지 확인 (천안, 김제 등은 오타가 아님!)
    const isKnownRealCity = VALID_CITIES.includes(cleanQuery) || 
                            VALID_CITIES.includes(cleanQuery.replace(/(시|군|구)$/, ''));

    // 3단계: [오타 감지 엔진]
    // 실제 도시가 아닌 경우에 '처나'(천안), '도코'(도쿄), '서을'(서울) 등 오타 검출!
    if (!forceSearch && !isKnownRealCity) {
      const suggestion = findClosestCitySuggestion(cleanQuery);
      if (suggestion) {
        weatherCard.hidden = true;
        emptyState.hidden = false;

        const descHtml = `
          <div>입력하신 '<strong>${cleanQuery}</strong>'에 오타가 있나요?</div>
          <div class="status-suggestion-box">
            <span class="status-suggestion-text">혹시 <strong>"${suggestion}"</strong>(을)를 찾으셨나요?</span>
            <button type="button" class="suggestion-btn" data-city="${suggestion}">
              👉 "${suggestion}" 날씨 바로보기
            </button>
            <button type="button" class="force-search-btn" data-city="${cleanQuery}">
              '${cleanQuery}' 그대로 검색
            </button>
          </div>
        `;
        showStatusMessage('typo', '지역명 오타 감지 안내', descHtml);
        return; // 오타 감지 시 엉뚱한 해외 지명을 검색하지 않고 안내창 표시 후 중단
      }
    }

    // 4단계: Open-Meteo Geocoding API 검색
    let geoResult = null;
    try {
      const openMeteoGeoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=3&language=ko&format=json`;
      const omRes = await fetch(openMeteoGeoUrl);
      if (omRes.ok) {
        const omData = await omRes.json();
        if (omData.results && omData.results.length > 0) {
          const first = omData.results[0];
          geoResult = {
            name: first.name + (first.admin1 ? ` (${first.admin1})` : ''),
            lat: first.latitude,
            lon: first.longitude,
            country: first.country_code || first.country || 'WTR'
          };
        }
      }
    } catch (e) {
      console.warn('Open-Meteo Geocoding 건너뜀:', e);
    }

    // 5단계: 일치 항목이 없으면 OpenStreetMap Nominatim 폴백 검색
    if (!geoResult) {
      try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery)}&format=json&limit=1&accept-language=ko`;
        const nomRes = await fetch(nominatimUrl, {
          headers: { 'Accept': 'application/json' }
        });
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          if (nomData && nomData.length > 0) {
            const first = nomData[0];
            const displayNameParts = first.display_name.split(',').map(s => s.trim());
            const shortName = displayNameParts.length > 2 
              ? `${displayNameParts[0]}, ${displayNameParts[1]}` 
              : displayNameParts[0];
            
            geoResult = {
              name: shortName,
              lat: parseFloat(first.lat),
              lon: parseFloat(first.lon),
              country: displayNameParts[displayNameParts.length - 1] || 'KR'
            };
          }
        }
      } catch (e) {
        console.warn('Nominatim Geocoding 실패:', e);
      }
    }

    // 6단계: 지오코딩으로도 찾을 수 없는 경우 (진짜 존재하지 않는 지역/오타)
    if (!geoResult) {
      weatherCard.hidden = true;
      emptyState.hidden = false;

      const postSuggestion = findClosestCitySuggestion(cleanQuery);
      if (postSuggestion) {
        const descHtml = `
          <div>입력하신 '<strong>${cleanQuery}</strong>'에 오타가 있나요?</div>
          <div class="status-suggestion-box">
            <span class="status-suggestion-text">혹시 <strong>"${postSuggestion}"</strong>(을)를 찾으셨나요?</span>
            <button type="button" class="suggestion-btn" data-city="${postSuggestion}">
              👉 "${postSuggestion}" 날씨 바로보기
            </button>
          </div>
        `;
        showStatusMessage('typo', '지역명 오타 감지 안내', descHtml);
      } else {
        const descHtml = `
          <div>입력하신 '<strong>${cleanQuery}</strong>'에 해당하는 지역을 찾지 못했습니다.</div>
          <div style="margin-top: 6px; font-size: 0.85rem; opacity: 0.85;">
            지역명의 철자나 오타가 없는지 확인해 보세요. (예: 서울, 천안, 김제, 도쿄, 뉴욕 등)
          </div>
        `;
        showStatusMessage('typo', '지역명 확인 및 오타 안내', descHtml);
      }
      return;
    }

    // 정상적으로 유효한 좌표를 얻은 경우 날씨 정보 조회
    hideStatusMessage();
    await fetchWeatherByCoordinates(geoResult.lat, geoResult.lon, geoResult.name, geoResult.country);

  } catch (error) {
    console.error('날씨 데이터 조회 에러:', error);
    weatherCard.hidden = true;
    showStatusMessage(
      'error',
      '날씨 데이터를 가져오지 못했습니다',
      `<div>${error.message || '네트워크 연결 상태를 확인하고 잠시 후 다시 시도해 주세요.'}</div>`
    );
  } finally {
    setLoading(false);
  }
}

/**
 * 사용자 기기의 Geolocation을 이용한 현재 위치 날씨 조회
 */
function fetchWeatherByCurrentLocation() {
  if (!navigator.geolocation) {
    showStatusMessage('warning', '위치 서비스 미지원', '<div>사용 중인 브라우저에서 위치 정보 기능을 지원하지 않습니다.</div>');
    return;
  }

  setLoading(true);
  hideStatusMessage();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        await fetchWeatherByCoordinates(latitude, longitude, '내 현재 위치', 'GPS');
      } catch (err) {
        showStatusMessage('error', '날씨 조회 실패', '<div>현재 위치의 날씨 정보를 가져오는 도중 오류가 발생했습니다.</div>');
      } finally {
        setLoading(false);
      }
    },
    (geoError) => {
      setLoading(false);
      let errorMsg = '위치 정보를 가져올 수 없습니다.';
      if (geoError.code === geoError.PERMISSION_DENIED) {
        errorMsg = '위치 정보 접근 권한이 허용되지 않았습니다. 브라우저 설정에서 위치 권한을 확인해 주세요.';
      } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
        errorMsg = '현재 위치 정보를 확인할 수 없습니다.';
      } else if (geoError.code === geoError.TIMEOUT) {
        errorMsg = '위치 요청 시간이 초과되었습니다.';
      }
      showStatusMessage('warning', '위치 권한 안내', `<div>${errorMsg}</div>`);
    },
    { timeout: 10000, enableHighAccuracy: false }
  );
}

/**
 * 위도/경도를 통해 Open-Meteo 실시간 기상 데이터 조회
 */
async function fetchWeatherByCoordinates(lat, lon, locationName, countryCode) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

  const weatherResponse = await fetch(weatherUrl);
  if (!weatherResponse.ok) {
    throw new Error(`기상 데이터 서버 응답 오류 (HTTP ${weatherResponse.status})`);
  }

  const weatherData = await weatherResponse.json();

  if (!weatherData.current) {
    throw new Error('유효한 기상 데이터가 존재하지 않습니다.');
  }

  // 최근 조회 정보 업데이트
  lastFetchedLocation = {
    latitude: lat,
    longitude: lon,
    name: locationName,
    countryCode: countryCode
  };

  renderWeather(weatherData, locationName, countryCode);
}

/**
 * 날씨 데이터를 DOM에 렌더링하고 시각적 테마 적용
 */
function renderWeather(data, locationName, countryCode) {
  const current = data.current;
  const daily = data.daily || {};
  const isDay = current.is_day === 1;
  const weatherCode = current.weather_code ?? 0;

  // WMO 날씨 코드 매핑
  const weatherInfo = WMO_WEATHER_MAP[weatherCode] || {
    label: '기타',
    dayEmoji: '🌡️',
    nightEmoji: '🌡️',
    theme: 'theme-clouds',
    desc: '현재 날씨 상태 정보'
  };

  // 배경 테마 적용 (야간일 때 맑음이면 night 테마 적용)
  let activeTheme = weatherInfo.theme;
  if (!isDay && activeTheme === 'theme-clear') {
    activeTheme = 'theme-night';
  }
  applyTheme(activeTheme, isDay);

  // 위치 및 국가/지역 배지
  locationNameEl.textContent = locationName;
  countryBadgeEl.textContent = countryCode ? countryCode.toUpperCase() : 'WTR';
  
  // 날짜/시간 포맷
  const now = new Date();
  const timeString = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} 기준`;
  localTimeEl.textContent = timeString;

  // 주간/야간 배지
  dayNightIconEl.textContent = isDay ? '☀️' : '🌙';
  dayNightTextEl.textContent = isDay ? '주간' : '야간';

  // 날씨 아이콘 및 상태 텍스트
  const emoji = isDay ? weatherInfo.dayEmoji : weatherInfo.nightEmoji;
  weatherIconEl.textContent = emoji;
  weatherTextEl.textContent = weatherInfo.label;
  weatherDescEl.textContent = weatherInfo.desc;

  // 현재 기온 (반올림)
  currentTempEl.textContent = Math.round(current.temperature_2m);

  // 오늘의 최고 기온 및 최저 기온 계산
  const maxTemp = (daily.temperature_2m_max && daily.temperature_2m_max.length > 0)
    ? Math.round(daily.temperature_2m_max[0])
    : Math.round(current.temperature_2m + 2);
  const minTemp = (daily.temperature_2m_min && daily.temperature_2m_min.length > 0)
    ? Math.round(daily.temperature_2m_min[0])
    : Math.round(current.temperature_2m - 2);

  // 1) 메인 기온 영역의 캡슐 배지에 최고/최저 기온 표시
  maxTempEl.textContent = `${maxTemp}°C`;
  minTempEl.textContent = `${minTemp}°C`;

  // 2) 상세 지표 그리드의 최고/최저 기온 전용 카드에 표시
  if (metricMaxTempEl) metricMaxTempEl.textContent = `${maxTemp}°C`;
  if (metricMinTempEl) metricMinTempEl.textContent = `${minTemp}°C`;

  // 상세 기상 지표
  apparentTempEl.textContent = `${Math.round(current.apparent_temperature * 10) / 10}°C`;
  humidityValEl.textContent = `${current.relative_humidity_2m}%`;
  windValEl.textContent = `${current.wind_speed_10m} m/s`;
  precipValEl.textContent = `${current.precipitation} mm`;

  // UI 상태 노출 (날씨 카드 표시 및 안내창 완전 삭제)
  hideStatusMessage();
  emptyState.hidden = true;
  weatherCard.hidden = false;
}

/**
 * 바디 테마 클래스 교체 및 배경 분위기 이펙트 적용
 */
function applyTheme(themeClass, isDay = true) {
  document.body.className = '';
  document.body.classList.add(themeClass);
  renderAtmosphericEffects(themeClass, isDay);
}

/**
 * 날씨 상태에 맞춘 배경 분위기 파티클 생성
 */
function renderAtmosphericEffects(theme, isDay) {
  if (!ambientEffectsEl) return;
  ambientEffectsEl.innerHTML = ''; // 기존 파티클 정리

  if (theme === 'theme-rain' || theme === 'theme-thunder') {
    const dropCount = theme === 'theme-thunder' ? 45 : 30;
    for (let i = 0; i < dropCount; i++) {
      const drop = document.createElement('div');
      drop.className = 'ambient-raindrop';
      drop.style.left = `${Math.random() * 100}vw`;
      drop.style.top = `${Math.random() * -20}vh`;
      drop.style.animationDuration = `${0.6 + Math.random() * 0.5}s`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      drop.style.opacity = `${0.3 + Math.random() * 0.5}`;
      drop.style.height = `${16 + Math.random() * 16}px`;
      ambientEffectsEl.appendChild(drop);
    }
  } else if (theme === 'theme-snow') {
    const flakeCount = 28;
    const snowIcons = ['❄', '❅', '•', '❆'];
    for (let i = 0; i < flakeCount; i++) {
      const flake = document.createElement('div');
      flake.className = 'ambient-snowflake';
      flake.textContent = snowIcons[Math.floor(Math.random() * snowIcons.length)];
      flake.style.left = `${Math.random() * 100}vw`;
      flake.style.top = `${Math.random() * -15}vh`;
      flake.style.fontSize = `${10 + Math.random() * 18}px`;
      flake.style.animationDuration = `${3.5 + Math.random() * 4}s`;
      flake.style.animationDelay = `${Math.random() * 4}s`;
      flake.style.opacity = `${0.4 + Math.random() * 0.5}`;
      ambientEffectsEl.appendChild(flake);
    }
  } else if (theme === 'theme-night') {
    const starCount = 35;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'ambient-star';
      star.style.left = `${Math.random() * 100}vw`;
      star.style.top = `${Math.random() * 85}vh`;
      const size = 1.5 + Math.random() * 2.5;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.animationDuration = `${1.2 + Math.random() * 2.5}s`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      ambientEffectsEl.appendChild(star);
    }
  } else if (theme === 'theme-clear' && isDay) {
    const sunAura = document.createElement('div');
    sunAura.className = 'ambient-sun-aura';
    ambientEffectsEl.appendChild(sunAura);
  }
}
