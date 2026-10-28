(() => {
  'use strict';

  const TAGS = {
    th: {
      label: 'TH',
      tip: '혀끝을 윗니 끝에 가볍게 대고 바람을 내보내요. "쓰·더"로 끊거나 끝에 "으" 모음을 넣지 마세요.',
    },
    rl: {
      label: 'R·L',
      tip: 'R은 혀끝이 입천장에 닿지 않게 당기고, L은 윗니 뒤 잇몸에 붙여요. 자음 뒤 "으" 첨가를 피해요.',
    },
    fv: {
      label: 'F·V',
      tip: '윗니를 아랫입술에 살짝 대고 마찰음을 내요(V는 성대 울림). "ㅍ·ㅂ" 파열음으로 바꾸지 마세요.',
    },
    stress: {
      label: '강세',
      tip: '강세 음절을 길고 높게 살리고 나머지 음절은 짧고 약하게 줄여야 토익스피킹 전달력 점수가 올라가요.',
    },
    link: {
      label: '연음',
      tip: '기능어(전치사·대명사·관사)는 힘을 빼고 앞 단어 끝 자음에 붙여 한 호흡으로 이어 말해요.',
    },
  };

  // [tag, ipa, word-specific TOEIC Speaking note, korean chunk candidates ('|' separated), priority]
  const WORDS = {
    // 복합어 강세 (단일 토큰 처리)
    'work-life': ['stress', '/ˈwɜːrk laɪf/', '복합 수식어는 앞 요소 WORK에 주강세를 두고 r과 끝 f 마찰을 한 단위로 이어 읽어요.', '웍라이프|웍 라이프', 36],
    'self-discipline': ['stress', '/ˌself ˈdɪsəplɪn/', 'self-DIS-ci-pline — DIS-에 주강세를 두고 뒤 음절은 약하게 줄여요.', '셀프 디서플린|셀프디서플린', 36],
    'self-esteem': ['stress', '/ˌself ɪˈstiːm/', 'self-es-TEEM — 마지막 음절(-TEEM)에 긴 주강세를 실어요.', '셀프 이스팀|셀프이스팀', 36],
    'self-help': ['stress', '/ˌself ˈhelp/', 'self-HELP — 뒤 요소 HELP에 강세를 두고 끝 lp 자음군을 짧게 닫아요.', '셀프헬프|셀프 헬프', 35],
    'high-quality': ['stress', '/ˌhaɪ ˈkwɑːləti/', 'high-QUAL-i-ty — 명사 앞 복합 수식어로 QUAL-을 또렷이 살리고 끝 -ity는 흘려요.', '하이 퀄러티|하이퀄러티', 36],
    'face-to-face': ['stress', '/ˌfeɪs tə ˈfeɪs/', '가운데 to는 /tə/로 약화하고 두 번째 FACE에 주강세를 두어 한 덩어리로 읽어요.', '페이스 투 페이스|페이스투페이스', 36],
    'to-do': ['stress', '/tə ˈduː/', '앞의 to는 /tə/로 약화하고 DO에 강세를 길게 실어요.', '투두', 34],
    'e-books': ['stress', '/ˈiː bʊks/', '첫 음절 E-에 주강세를 길게 두고 끝 ks를 가볍게 끊어요.', '이북스', 34],

    // 묵음·발음 함정 (ETS 명료성 감점 단골)
    island: ['rl', '/ˈaɪlənd/', '가운데 s는 묵음이에요("아이슬랜드" 주의). 1음절 AI-에 강세를 두고 l을 살려요.', '아일랜드', 36],
    honest: ['stress', '/ˈɑːnɪst/', '첫 글자 h는 묵음이에요. 모음 /ɑː/로 바로 시작해 1음절에 강세를 두어요.', '아너스트|아니스트', 36],
    calm: ['rl', '/kɑːm/', '가운데 l은 묵음이에요. 혀끝을 올리지 말고 /kɑːm/으로 길게 열어 발음해요.', '캄', 35],
    walk: ['rl', '/wɔːk/', '가운데 l은 묵음이에요. 입을 둥글게 열어 /wɔːk/로 읽고 work(/wɜːrk/)와 모음을 구분해요.', '웍', 35],
    walking: ['rl', '/ˈwɔːkɪŋ/', '가운데 l은 묵음이에요. 혀를 말지 말고 턱을 내려 /ˈwɔːkɪŋ/으로 읽어 working(/ˈwɜːrkɪŋ/)과 구분해요.', '워킹', 35],
    often: ['stress', '/ˈɔːfn/', 't는 묵음(/ˈɔːfn/)으로 가볍게 넘기고 1음절에 강세를 두어요.', '오픈', 34],
    listen: ['rl', '/ˈlɪsn/', 't는 묵음이에요("리스튼" 주의). 첫 음절 L을 살려 2음절로 가볍게 끊어요.', '리쓴|리슨', 34],
    listening: ['rl', '/ˈlɪsnɪŋ/', '가운데 t는 묵음이에요. 1음절 강세로 /ˈlɪsnɪŋ/처럼 매끄럽게 이어요.', '리쓰닝|리스닝', 34],
    vegetables: ['fv', '/ˈvedʒtəblz/', '4음절("베지터블")이 아닌 3박(/ˈvedʒ·tə·blz/)으로 가운데 모음을 줄여 읽어요.', '베쥐터블즈', 36],
    business: ['stress', '/ˈbɪznəs/', '가운데 i는 소리 내지 않고 2음절(/ˈbɪz·nəs/)로 압축해 첫 음절을 살려요.', '비즈니스', 34],

    // 토익스피킹 핵심 다음절 강세 어휘 (Word Stress)
    communication: ['stress', '/kəˌmjuːnɪˈkeɪʃn/', 'com·mu·ni·CA·tion — 4음절(-CA-)에 주강세! 앞 kə-는 짧게 약화해요.', '커뮤니케이션', 36],
    communicating: ['stress', '/kəˈmjuːnɪkeɪtɪŋ/', 'com·MU·ni·cat·ing — 2음절(-MU-)에 주강세를 두고 평탄하게 읽지 마세요.', '커뮤니케이팅', 36],
    responsibility: ['stress', '/rɪˌspɑːnsəˈbɪləti/', 're·spon·si·BIL·i·ty — 4음절(-BIL-)에 주강세를 두어 핵심 어휘를 부각해요.', '리스판서빌러티', 36],
    opportunities: ['stress', '/ˌɑːpərˈtuːnətiz/', 'op·por·TU·ni·ties — 3음절(-TU-)을 길고 높게 강조하고 끝 z를 살려요.', '아퍼튜니티즈', 36],
    productivity: ['stress', '/ˌproʊdʌkˈtɪvəti/', 'pro·duc·TIV·i·ty — 3음절(-TIV-)에 주강세를 두고 끝 -ity는 약하게 줄여요.', '프러덕티비티', 36],
    productive: ['stress', '/prəˈdʌktɪv/', 'pro·DUC·tive — 1음절은 /prə/로 줄이고 2음절(-DUC-)에 강세를 실어요.', '프러덕티브', 35],
    environment: ['fv', '/ɪnˈvaɪrənmənt/', 'en·VI·ron·ment — 2음절(-VI-) 강세와 v 마찰을 함께 살려 읽어요.', '인바이런먼트', 36],
    transportation: ['stress', '/ˌtrænspərˈteɪʃn/', 'trans·por·TA·tion — 3음절(-TA-) 주강세, 앞 tr 자음군에 모음을 넣지 마세요.', '트랜스포테이션', 36],
    technology: ['stress', '/tekˈnɑːlədʒi/', 'tech·NOL·o·gy — 1음절이 아닌 2음절(-NOL-)에 주강세를 두어요.', '테크날러지|테크날러쥐', 36],
    convenient: ['fv', '/kənˈviːniənt/', 'con·VEN·ient — 1음절을 /kən/으로 줄이고 2음절(-VEN-)의 v와 긴 iː를 살려요.', '컨비니언트', 36],
    advantages: ['stress', '/ədˈvæntɪdʒɪz/', 'ad·VAN·ta·ges — 1음절을 /əd/로 약화하고 2음절(-VAN-)에 강세를 실어요.', '어드밴티지즈', 36],
    disadvantages: ['stress', '/ˌdɪsədˈvæntɪdʒɪz/', 'dis·ad·VAN·ta·ges — 3음절(-VAN-)에 주강세를 두어 대비 의미를 살려요.', '디스어드밴티지즈', 36],
    information: ['stress', '/ˌɪnfərˈmeɪʃn/', 'in·for·MA·tion — 3음절(-MA-)에 주강세를 두고 가운데 -for-는 /fər/로 줄여요.', '인포메이션', 36],
    presentation: ['stress', '/ˌpriːzenˈteɪʃn/', 'pres·en·TA·tion — 3음절(-TA-)에 주강세를 두어 명료하게 전달해요.', '프레젠테이션', 36],
    flexibility: ['stress', '/ˌfleksəˈbɪləti/', 'flex·i·BIL·i·ty — 3음절(-BIL-)에 주강세, 앞 fl 자음군을 붙여 읽어요.', '플렉서빌리티', 36],
    traditional: ['stress', '/trəˈdɪʃənl/', 'tra·DI·tion·al — 1음절을 /trə/로 약화하고 2음절(-DI-)에 강세를 두어요.', '트래디셔널', 36],
    efficient: ['fv', '/ɪˈfɪʃnt/', 'ef·FI·cient — 2음절(-FI-)에 강세를 두고 윗니로 f 마찰음을 내요.', '이피션트', 36],
    effective: ['fv', '/ɪˈfektɪv/', 'ef·FEC·tive — 2음절(-FEC-) 강세와 f·v 순치 마찰음을 또렷이 구분해요.', '이펙티브', 36],
    essential: ['stress', '/ɪˈsenʃl/', 'es·SEN·tial — 2음절(-SEN-)에 강세를 실어 핵심 주장을 강조해요.', '이센셜', 35],
    facilities: ['fv', '/fəˈsɪlətiz/', 'fa·CIL·i·ties — 1음절 /fə/는 약하게, 2음절(-CIL-)에 주강세를 두어요.', '퍼실러티즈', 35],
    definitely: ['fv', '/ˈdefɪnətli/', 'DEF·i·nite·ly — 1음절에 강세를 두고 뒤 음절은 빠르게 줄여 읽어요.', '데피니틀리', 35],
    personally: ['stress', '/ˈpɜːrsənəli/', 'PER·son·al·ly — 1음절 강세 후 끝을 살짝 올려(↗) 의견 도입을 알려요.', '퍼스널리', 35],
    conclusion: ['stress', '/kənˈkluːʒn/', 'con·CLU·sion — 2음절(-CLU-)에 긴 강세를 두고 ʒ 유성 마찰을 부드럽게 내요.', '컨클루전', 35],
    however: ['stress', '/haʊˈevər/', 'how·EV·er — 2음절(-EV-)에 강세를 두고 뒤에 짧은 쉼을 두어 전환을 알려요.', '하우에버', 34],
    important: ['stress', '/ɪmˈpɔːrtnt/', 'im·POR·tant — 2음절(-POR-)에 강세를 실어 핵심 근거를 드러내요.', '임포턴트|임포턴', 35],
    importantly: ['stress', '/ɪmˈpɔːrtntli/', 'im·POR·tant·ly — 2음절(-POR-)에 강세를 두고 강조 부사로 또렷이 읽어요.', '임포턴틀리', 35],
    experience: ['stress', '/ɪkˈspɪriəns/', 'ex·PE·ri·ence — 2음절(-PE-) 강세, sp 자음군 사이에 모음을 넣지 마세요.', '익스피리언스', 35],
    experienced: ['stress', '/ɪkˈspɪriənst/', 'ex·PE·ri·enced — 2음절(-PE-) 강세, 끝 nst 자음군은 가볍게 닫아요.', '익스피리언스트', 35],
    employees: ['stress', '/ɪmˈplɔɪiːz/', 'em·PLOY·ees — 2음절(-PLOY-)에 강세를 두고 끝 유성 /z/를 살려요.', '엠플로이이즈', 35],
    employee: ['stress', '/ɪmˈplɔɪiː/', 'em·PLOY·ee — 1음절이 아닌 2음절(-PLOY-)에 강세를 두어요.', '엠플로이', 35],
    different: ['stress', '/ˈdɪfrənt/', 'DIF·fer·ent — 3음절 또박또박 대신 2박 느낌(/ˈdɪf·rənt/)으로 압축해 읽어요.', '디퍼런트', 34],
    difference: ['stress', '/ˈdɪfrəns/', 'DIF·fer·ence — 1음절 강세 후 가운데 모음을 줄여 /ˈdɪf·rəns/로 이어요.', '디퍼런스', 34],
    interesting: ['stress', '/ˈɪntrəstɪŋ/', 'IN·ter·est·ing — 1음절에 강세를 두고 가운데를 줄여 /ˈɪn·trə·stɪŋ/으로 읽어요.', '인터레스팅', 35],
    especially: ['stress', '/ɪˈspeʃəli/', 'e·SPE·cial·ly — 2음절(-SPE-)에 강세를 두어 부연 포인트를 살려요.', '이스페셜리', 34],
    individual: ['stress', '/ˌɪndɪˈvɪdʒuəl/', 'in·di·VID·u·al — 3음절(-VID-)에 주강세를 두고 v와 dʒ를 살려요.', '인디비주얼', 35],
    individuals: ['stress', '/ˌɪndɪˈvɪdʒuəlz/', 'in·di·VID·u·als — 3음절(-VID-)에 주강세를 두고 끝 z를 울려요.', '인디비주얼즈', 35],
    cooperate: ['stress', '/koʊˈɑːpəreɪt/', 'co·OP·er·ate — 2음절(-OP-)에 강세를 두고 모음 사이를 부드럽게 이어요.', '코아퍼레잇', 35],
    concentrate: ['stress', '/ˈkɑːnsntreɪt/', 'CON·cen·trate — 1음절에 주강세를 두고 tr 자음군을 붙여서 발음해요.', '칸센트레잇', 34],
    intelligence: ['stress', '/ɪnˈtelɪdʒəns/', 'in·TEL·li·gence — 2음절(-TEL-)에 강세를 두고 l과 dʒ를 명료하게 내요.', '인텔리전스', 34],
    distractions: ['stress', '/dɪˈstrækʃnz/', 'dis·TRAC·tions — 2음절(-TRAC-) 강세, str 자음군에 모음을 끼우지 마세요.', '디스트랙션즈', 35],
    commuting: ['stress', '/kəˈmjuːtɪŋ/', 'com·MUT·ing — 첫 음절을 /kə/로 약화하고 2음절(-MUT-)에 강세를 두어요.', '커뮤팅', 34],
    utilities: ['stress', '/juːˈtɪlətiz/', 'u·TIL·i·ties — 2음절(-TIL-)에 주강세를 두고 끝 z로 마무리해요.', '유틸리티즈', 34],
    organized: ['stress', '/ˈɔːrɡənaɪzd/', 'OR·gan·ized — 1음절에 강세를 두고 r과 끝 zd를 매끄럽게 닫아요.', '오거나이즈드', 33],
    produce: ['stress', '/prəˈduːs/', '동사 pro·DUCE는 2음절(-DUCE)에 강세를 두어요(명사 PRO·duce와 구분).', '프러듀스', 35],
    project: ['stress', '/ˈprɑːdʒekt/', '명사 PROJ·ect는 1음절(PROJ-)에 강세를 두어요(동사 pro·JECT와 구분).', '프라젝트', 35],
    projects: ['stress', '/ˈprɑːdʒekts/', '명사 PROJ·ects는 1음절(PROJ-)에 강세를 두고 끝 cts를 가볍게 닫아요.', '프라젝츠', 35],
    survey: ['fv', '/ˈsɜːrveɪ/', '명사 SUR·vey는 1음절(SUR-)에 강세를 두고 r과 v 마찰을 살려요.', '서베이', 35],
    hotel: ['stress', '/hoʊˈtel/', 'ho·TEL — 평탄하게 읽지 말고 2음절(-TEL)에 강세를 실어요.', '호텔', 34],
    support: ['stress', '/səˈpɔːrt/', 'sup·PORT — 1음절을 /sə/로 약화하고 2음절(-PORT)에 강세를 두어요.', '서포트', 33],
    compare: ['stress', '/kəmˈper/', 'com·PARE — 1음절을 /kəm/으로 줄이고 2음절(-PARE)에 강세를 두어요.', '컴페어', 33],
    adapt: ['stress', '/əˈdæpt/', 'a·DAPT — 1음절을 /ə/로 약화하고 2음절(-DAPT)에 강세를 실어요.', '어댑투|어댑트', 33],
    reduce: ['stress', '/rɪˈduːs/', 're·DUCE — 2음절(-DUCE)에 긴 강세를 두고 r로 부드럽게 시작해요.', '리듀스', 32],
    reduces: ['stress', '/rɪˈduːsɪz/', 're·DU·ces — 2음절(-DU-)에 강세를 두고 끝 -ɪz를 가볍게 붙여요.', '리듀시즈', 32],
    usually: ['stress', '/ˈjuːʒuəli/', 'U·su·al·ly — 1음절에 강세를 두고 ʒ 소리와 l을 부드럽게 이어 읽어요.', '유쥬얼리|유주얼리', 32],
    customer: ['stress', '/ˈkʌstəmər/', 'CUS·tom·er — 1음절에 강세를 두고 뒤 모음은 /ə/로 약하게 줄여요.', '커스터머', 32],
    customers: ['stress', '/ˈkʌstəmərz/', 'CUS·tom·ers — 1음절에 강세를 두고 끝 rz를 울려 마무리해요.', '커스터머즈', 32],
    companies: ['stress', '/ˈkʌmpəniz/', 'COM·pa·nies — 1음절에 강세를 두고 가운데 -pa-는 /pə/로 짧게 줄여요.', '컴퍼니즈', 31],
    company: ['stress', '/ˈkʌmpəni/', 'COM·pa·ny — 1음절에 강세를 두고 뒤 음절은 가볍게 낮춰요.', '컴퍼니', 30],
    social: ['stress', '/ˈsoʊʃl/', 'SO·cial — 1음절 이중모음 /oʊ/에 강세를 두고 끝 -cial은 짧게 닫아요.', '소셜', 30],
    public: ['stress', '/ˈpʌblɪk/', 'PUB·lic — 1음절 강세, bl 자음군 사이에 모음을 넣지 마세요.', '퍼블릭', 31],
    online: ['stress', '/ˌɑːnˈlaɪn/', 'on·LINE — 구절 끝에서는 2음절(-LINE)에 강세를 두고 n과 l을 이어요.', '온라인|샤판라인', 30],
    weekend: ['stress', '/ˈwiːkend/', 'WEEK·end — 1음절 긴 /iː/에 강세를 두어 또렷이 발음해요.', '위켄드', 29],
    weekends: ['stress', '/ˈwiːkendz/', 'WEEK·ends — 1음절 강세, 끝 ndz를 유성음으로 부드럽게 닫아요.', '위켄즈', 29],
    smartwatch: ['stress', '/ˈsmɑːrtwɑːtʃ/', 'SMART·watch — 1음절에 주강세를 두고 sm·rt·tʃ 자음군을 이어요.', '스마트왓치', 32],
    smartphone: ['stress', '/ˈsmɑːrtfoʊn/', 'SMART·phone — 1음절 주강세, ph는 /f/ 순치 마찰음으로 내요.', '스마트폰', 31],
    smartphones: ['stress', '/ˈsmɑːrtfoʊnz/', 'SMART·phones — 1음절 주강세, f 마찰과 끝 nz 울림을 살려요.', '스마트폰즈', 31],
    difficult: ['stress', '/ˈdɪfɪkəlt/', 'DIF·fi·cult — 1음절에 강세를 두고 f 마찰과 끝 lt를 짧게 닫아요.', '디피컬트', 32],
    summers: ['stress', '/ˈsʌmərz/', 'SUM·mers — 1음절 강세 후 끝 rz를 부드럽게 울려요.', '써머즈', 29],
    better: ['stress', '/ˈbetər/', 'BET·ter — 1음절 강세, 미국식 플랩 t로 부드럽게 연결해요.', '베러', 28],
    every: ['fv', '/ˈevri/', 'EV·ery — "에브리" 3음절 대신 2박(/ˈev·ri/)으로 v 뒤 바로 r을 붙여요.', '에브리', 31],
    everything: ['th', '/ˈevriθɪŋ/', 'EV·ery·thing — 1음절 강세, v·r 연결과 무성 th + 코소리 ŋ을 살려요.', '에브리띵', 33],
    skills: ['stress', '/skɪlz/', 'sk 자음군에 "으"를 넣지 말고 끝 lz를 한 음절로 닫아요.', '스킬즈', 28],
    enjoy: ['stress', '/ɪnˈdʒɔɪ/', 'en·JOY — 2음절(-JOY)에 강세를 실어 호감 어조를 자연스럽게 살려요.', '인조이', 29],
    read: ['rl', '/riːd/', '현재·원형 read는 긴 모음 /riːd/로 발음하고 첫 r에서 입술을 살짝 둥글려요.', '리드', 27],
    movies: ['fv', '/ˈmuːviz/', 'MO·vies — 1음절 긴 /uː/ 강세 후 v와 끝 유성 z를 울려요.', '무비즈', 28],
    movie: ['fv', '/ˈmuːvi/', 'MO·vie — 1음절 긴 /uː/에 강세를 두고 v 성대를 울려요.', '무비', 27],
    watch: ['stress', '/wɑːtʃ/', '내용어 동사 watch는 입술을 둥글려 w로 시작하고 끝 tʃ를 짧게 끊어요.', '왓치', 25],

    // TH (/θ/, /ð/)
    throughout: ['th', '/θruːˈaʊt/', 'through·OUT — thr 자음군에 모음을 넣지 말고 2음절(-OUT)에 강세를 실어요.', '쓰루아웃', 36],
    through: ['th', '/θruː/', '혀끝을 내민 무성 th에서 바로 r로 넘어가 한 음절(/θruː/)로 읽어요.', '쓰루', 34],
    healthy: ['th', '/ˈhelθi/', 'HEALTH·y — 1음절 l 뒤 무성 th를 바람으로 내보내요("헬씨"보다 부드럽게).', '헬씨', 33],
    healthier: ['th', '/ˈhelθiər/', 'HEALTH·i·er — 1음절 강세, l 뒤 무성 th 마찰을 유지해요.', '헬씨어', 34],
    health: ['th', '/helθ/', '끝 무성 th에서 혀끝을 윗니 끝에 대고 바람만 내보내 마무리해요.', '헬쓰', 33],
    growth: ['th', '/ɡroʊθ/', 'gr 자음군으로 시작해 끝 무성 th 마찰로 한 음절에 닫아요.', '그로쓰', 34],
    months: ['th', '/mʌnθs/', '끝 ths 자음군을 "먼쓰스"로 늘리지 말고 /mʌnθs/(또는 /mʌnts/)로 짧게 닫아요.', '먼쓰', 34],
    month: ['th', '/mʌnθ/', '끝 무성 th 뒤에 "으" 모음을 붙이지 말고 바람으로 끝내요.', '먼쓰', 32],
    theater: ['th', '/ˈθiːətər/', 'THE·a·ter — 무성 th로 시작해 1음절에 강세를 두어요.', '띠어터', 34],
    atmosphere: ['th', '/ˈætməsfɪr/', 'AT·mos·phere — 1음절 강세, ph는 /f/ 마찰음으로 읽고 끝 r을 살려요.', '앳모스피어', 34],
    therefore: ['th', '/ˈðerfɔːr/', 'THERE·fore — 유성 ð로 시작해 1음절에 강세를 두고 뒤에 짧은 쉼을 주세요.', '데어포어', 34],
    together: ['th', '/təˈɡeðər/', 'to·GETH·er — 1음절을 /tə/로 줄이고 2음절(-GETH-)과 유성 ð를 살려요.', '투게더', 33],
    weather: ['th', '/ˈweðər/', 'WEATH·er — 1음절 강세, 가운데 유성 ð를 이 사이로 부드럽게 울려요.', '웨더', 32],
    another: ['th', '/əˈnʌðər/', 'a·NOTH·er — 2음절(-NOTH-) 강세와 가운데 유성 ð 울림을 살려요.', '어나더', 31],
    rather: ['th', '/ˈræðər/', 'RATH·er — r로 시작해 1음절 강세, 가운데 유성 ð를 부드럽게 울려요.', '래더', 32],
    something: ['th', '/ˈsʌmθɪŋ/', 'SOME·thing — 1음절 강세, 무성 th 뒤 ng(/ŋ/)를 코로 울려요.', '썸띵', 31],
    anything: ['th', '/ˈeniθɪŋ/', 'AN·y·thing — 1음절 강세, 무성 th와 끝 코소리 /ŋ/을 흘리지 마세요.', '애니띵', 31],
    nothing: ['th', '/ˈnʌθɪŋ/', 'NOTH·ing — 1음절 강세, 무성 th 뒤 /ŋ/으로 깔끔히 닫아요.', '낫띵', 31],
    three: ['th', '/θriː/', '무성 th에서 혀를 뺀 즉시 r로 이어 한 음절(/θriː/)로 발음해요.', '쓰리', 31],
    think: ['th', '/θɪŋk/', '무성 th로 바람을 내보낸 뒤 ŋk를 한 음절로 짧게 닫아요.', '띵크|띵', 28],
    thought: ['th', '/θɔːt/', '무성 th로 시작해 모음 /ɔː/를 충분히 열고 끝 t는 막아 닫아요.', '톳', 30],
    thanks: ['th', '/θæŋks/', '무성 th와 끝 ŋks 자음군에 모음을 끼우지 말고 한 음절로 읽어요.', '쌩스', 31],
    things: ['th', '/θɪŋz/', '무성 th로 시작해 코소리 ŋ 뒤 유성 /z/로 울려 닫아요.', '띵즈', 29],
    thing: ['th', '/θɪŋ/', '무성 th로 시작해 끝 ng(/ŋ/) 코소리로 마무리해요.', '띵', 28],
    both: ['th', '/boʊθ/', '이중모음 /oʊ/ 뒤 끝 무성 th를 바람만으로 닫아요.', '보쓰', 30],
    other: ['th', '/ˈʌðər/', '1음절 강세 후 가운데 유성 ð를 부드럽게 울리고 끝 r로 이어요.', '아더', 28],
    others: ['th', '/ˈʌðərz/', '가운데 유성 ð와 끝 rz 유성 자음군을 부드럽게 이어요.', '아더즈|위디아더즈', 29],
    this: ['th', '/ðɪs/', '기능어 지시어는 과하게 세우지 말고 유성 ð로 가볍게 이어 읽어요.', '디스', 14],
    that: ['th', '/ðæt/', '접속사·지시사 that은 유성 ð로 가볍게 시작하고 절 연결 시 약화해요.', '댓', 14],
    with: ['th', '/wɪð/', '기능어 with는 강세를 빼고 끝 th 뒤 "으" 모음 없이 뒷단어로 바로 이어요.', '위드|위더|위디|윋', 14],
    they: ['th', '/ðeɪ/', '대명사 they는 유성 ð로 부드럽게 시작해 동사보다 약하게 읽어요.', '데이', 14],
    their: ['th', '/ðer/', '소유격 their는 유성 ð로 가볍게 시작하고 뒤 명사에 강세를 양보해요.', '데어', 14],
    there: ['th', '/ðer/', '유도부사 there는 약하게 흘리고 뒤 본동사·명사를 강조해요.', '데어라|데어', 14],
    than: ['th', '/ðæn/', '비교 접속사 than은 /ðən/처럼 힘을 빼고 앞뒤 비교 내용어를 살려요.', '댄|대넌', 14],
    these: ['th', '/ðiːz/', '유성 ð로 시작해 끝 유성 /z/까지 한 음절로 이어요.', '디즈', 16],
    though: ['th', '/ðoʊ/', '유성 ð로 시작해 이중모음 /oʊ/로 부드럽게 넘겨요.', '도우', 16],

    // R · L (/r/, /l/)
    prefer: ['rl', '/prɪˈfɜːr/', 'pre·FER — 2음절(-FER)에 주강세! pr·f·r 세 음가를 모두 또렷이 살려요.', '프리퍼', 35],
    really: ['rl', '/ˈriːəli/', 'REAL·ly — 첫 음절 r(입천장 비접촉)과 두 번째 l(윗니 뒤 접촉)을 확실히 구분해요.', '릴리|리얼리', 33],
    world: ['rl', '/wɜːrld/', 'r에서 바로 l(윗니 뒤 접촉)로 옮겨 한 음절로 닫아요("월드" 2음절화 주의).', '월드', 35],
    girl: ['rl', '/ɡɜːrl/', 'r 뒤 혀끝을 윗니 뒤에 붙여 l로 마무리해요.', '걸', 34],
    already: ['rl', '/ɔːlˈredi/', 'al·READ·y — l에서 바로 r로 혀를 당기며 2음절(-READ-)에 강세를 두어요.', '올레디', 34],
    early: ['rl', '/ˈɜːrli/', 'EAR·ly — 1음절 R모음(/ɜːr/)에서 혀끝을 윗니 뒤로 올려 l로 이어요.', '얼리', 33],
    regularly: ['rl', '/ˈreɡjələrli/', 'REG·u·lar·ly — 1음절 강세, r과 l이 교차하므로 가운데 음절을 가볍게 줄여요.', '레귤럴리', 35],
    regular: ['rl', '/ˈreɡjələr/', 'REG·u·lar — 1음절에 강세를 두고 r 시작과 중간 l을 구분해요.', '레귤러', 33],
    clearly: ['rl', '/ˈklɪrli/', 'CLEAR·ly — cl 자음군으로 시작해 r 뒤 l로 매끄럽게 전환해요.', '클리얼리', 34],
    rarely: ['rl', '/ˈrerli/', 'RARE·ly — 첫 r과 중간 r 뒤 l에서 혀끝을 윗니 뒤에 정확히 붙여요.', '레얼리', 34],
    relatives: ['rl', '/ˈrelətɪvz/', 'REL·a·tives — 첫 r과 중간 l을 구분하고 끝 vz를 울려 닫아요.', '렐러티브즈', 34],
    relieve: ['rl', '/rɪˈliːv/', 're·LIEVE — 2음절(-LIEVE) 강세, 첫 r과 두 번째 l·끝 v를 구분해요.', '릴리브', 34],
    relax: ['rl', '/rɪˈlæks/', 're·LAX — 2음절(-LAX)에 강세를 두고 첫 r과 두 번째 l을 구분해요.', '릴랙스', 33],
    problems: ['rl', '/ˈprɑːbləmz/', 'PROB·lems — pr과 bl 자음군에 모음을 넣지 말고 1음절에 강세를 두어요.', '프라블럼즈', 33],
    problem: ['rl', '/ˈprɑːbləm/', 'PROB·lem — pr과 bl 자음군을 빠르게 붙이고 1음절을 강조해요.', '프라블럼', 33],
    several: ['rl', '/ˈsevrəl/', 'SEV·er·al — 1음절 강세 후 2박 느낌(/ˈsev·rəl/)으로 v·r·l을 이어요.', '세버럴', 33],
    flexible: ['rl', '/ˈfleksəbl/', 'FLEX·i·ble — fl 자음군에 모음을 끼우지 말고 1음절에 강세를 실어요.', '플렉서블', 34],
    coworkers: ['rl', '/ˈkoʊwɜːrkərz/', 'CO·work·ers — 1음절 주강세, 두 번 나오는 r모음과 끝 z를 살려요.', '코워커즈', 33],
    coworker: ['rl', '/ˈkoʊwɜːrkər/', 'CO·work·er — 1음절 주강세, 가운데와 끝 r을 부드럽게 굴려요.', '코워커', 33],
    workplace: ['rl', '/ˈwɜːrkpleɪs/', 'WORK·place — 복합 명사 1음절(WORK-)에 주강세를 두고 pl 자음군을 붙여요.', '웍플레이스', 33],
    working: ['rl', '/ˈwɜːrkɪŋ/', 'WORK·ing — 1음절 R모음(/ɜːr/)에 강세를 두고 끝 ng를 코로 울려요.', '워킹', 30],
    worked: ['rl', '/wɜːrkt/', '끝 -ed는 무성 /t/로 발음해 /wɜːrkt/ 한 음절로 닫아요("워키드" 주의).', '웍탯|웍트', 33],
    work: ['rl', '/wɜːrk/', '입천장에 혀가 닿지 않는 /ɜːr/ 뒤 k를 막아 1음절로 끊어요("워크" 주의).', '웍', 26],
    workers: ['rl', '/ˈwɜːrkərz/', 'WORK·ers — 1음절 강세, r모음 두 곳과 끝 유성 z를 이어요.', '워커즈', 30],
    travel: ['rl', '/ˈtrævl/', 'TRAV·el — tr 자음군에 "으"를 넣지 말고 v 울림 뒤 l로 닫아요.', '트래블', 32],
    traveling: ['rl', '/ˈtrævəlɪŋ/', 'TRAV·el·ing — 1음절 강세, tr·v·l 세 음가를 매끄럽게 이어요.', '트래블링', 33],
    learn: ['rl', '/lɜːrn/', '첫 L(윗니 뒤 접촉)에서 R(/ɜːr/, 혀 당김)로 혀 위치를 한 음절 안에 바꿔요.', '런', 32],
    learning: ['rl', '/ˈlɜːrnɪŋ/', 'LEARN·ing — 첫 L에서 R로 바로 당기며 1음절에 강세를 두어요.', '러닝', 32],
    learned: ['rl', '/lɜːrnd/', '첫 L과 중간 R 뒤 nd를 한 음절로 부드럽게 닫아요.', '런드|런더', 32],
    library: ['rl', '/ˈlaɪbreri/', 'LI·brar·y — 첫 L 뒤 br·r 자음군을 구분하며 1음절에 강세를 두어요.', '라이브러리', 34],
    before: ['rl', '/bɪˈfɔːr/', 'be·FORE — 2음절(-FORE)에 강세를 두고 f 마찰과 끝 r을 살려요.', '비포어|비포', 29],
    career: ['rl', '/kəˈrɪr/', 'ca·REER — 1음절을 /kə/로 약화하고 2음절(-REER)에 강세를 두어요.', '커리어', 34],
    leader: ['rl', '/ˈliːdər/', 'LEAD·er — 첫 L을 또렷이 붙이고 끝 -er는 약하게 굴려요.', '리더', 30],
    leaders: ['rl', '/ˈliːdərz/', 'LEAD·ers — 1음절 L 강세 후 끝 rz를 부드럽게 울려요.', '리더즈', 30],
    worry: ['rl', '/ˈwɜːri/', 'WOR·ry — 입술을 둥글린 w에서 바로 /ɜːr/ 강세로 넘어가요.', '워리', 30],
    worries: ['rl', '/ˈwɜːriz/', 'WOR·ries — 1음절 /ɜːr/ 강세 후 끝 유성 z로 마무리해요.', '워리즈', 31],
    family: ['rl', '/ˈfæməli/', 'FAM·i·ly — 1음절 f 마찰에 강세를 두고 가운데 모음을 줄여 /ˈfæm·li/처럼 읽어요.', '패밀리', 31],
    gardening: ['rl', '/ˈɡɑːrdnɪŋ/', 'GAR·den·ing — 1음절 /ɑːr/ 강세 후 가운데를 줄여 2~3박으로 매끄럽게 이어요.', '가드닝', 32],
    marketing: ['rl', '/ˈmɑːrkɪtɪŋ/', 'MAR·ket·ing — 1음절 /ɑːr/에 주강세를 두고 뒤 음절은 가볍게 낮춰요.', '마케팅', 31],
    preparing: ['rl', '/prɪˈperɪŋ/', 'pre·PAR·ing — 1음절을 /prɪ/로 줄이고 2음절(-PAR-)에 강세와 r을 살려요.', '프리페어링', 33],
    reports: ['rl', '/rɪˈpɔːrts/', 're·PORTS — 2음절(-PORTS)에 강세를 두고 r과 끝 rts 자음군을 한 번에 닫아요.', '리포츠', 32],
    clients: ['rl', '/ˈklaɪənts/', 'CLI·ents — cl 자음군에 모음을 끼우지 말고 1음절 이중모음에 강세를 두어요.', '클라이언츠', 31],
    neighborhood: ['rl', '/ˈneɪbərhʊd/', 'NEIGH·bor·hood — 1음절에 주강세를 두고 가운데 r을 부드럽게 이어요.', '네이버후드', 31],
    helps: ['rl', '/helps/', '끝 lps 자음군 사이에 모음을 넣지 말고 한 음절로 가볍게 닫아요.', '헬프스', 27],
    helped: ['rl', '/helpt/', '끝 -ed는 무성 /t/로 발음해 lpt를 한 호흡에 짧게 닫아요.', '헬프트', 30],
    help: ['rl', '/help/', '끝 l에서 윗니 뒤를 짚은 뒤 p를 터뜨리지 않고 입술만 닫아요.', '헬프', 25],
    cold: ['rl', '/koʊld/', '이중모음 /oʊ/ 뒤 ld를 한 음절로 부드럽게 닫아요.', '콜드', 26],
    always: ['rl', '/ˈɔːlweɪz/', 'AL·ways — 1음절 l에서 입술을 둥글려 w로 잇고 끝 유성 z를 울려요.', '올웨이즈', 29],
    near: ['rl', '/nɪr/', '끝 r에서 혀끝이 입천장에 닿지 않게 당기며 마무리해요.', '니어', 25],
    nearby: ['rl', '/ˌnɪrˈbaɪ/', '문장 끝 부사 near·BY는 2음절(-BY)에 강세를 실어 마무리해요.', '니어바이', 30],
    first: ['rl', '/fɜːrst/', 'f 마찰로 시작해 /ɜːr/과 끝 st 자음군을 한 음절로 닫아요.', '퍼스트', 28],
    less: ['rl', '/les/', '첫 L에서 혀끝을 윗니 뒤에 확실히 붙였다 떼며 발음해요.', '레스', 25],
    years: ['rl', '/jɪrz/', '"이어즈" 3음절 대신 반모음 /j/로 시작해 한 음절(/jɪrz/)로 압축해요.', '이어즈', 29],
    try: ['rl', '/traɪ/', 'tr 자음군을 "트라이" 3음절로 쪼개지 말고 한 번에 /traɪ/로 빼요.', '트라이', 27],
    trying: ['rl', '/ˈtraɪɪŋ/', 'TRY·ing — tr 자음군에 모음을 넣지 말고 1음절에 강세를 두어요.', '트라잉', 28],
    started: ['rl', '/ˈstɑːrtɪd/', 'START·ed — st 자음군과 /ɑːr/ 강세를 살리고 미국식 플랩 t로 부드럽게 이어요.', '스타티드|스타티더', 29],
    like: ['rl', '/laɪk/', '첫 L을 윗니 뒤에 붙였다 떼고 끝 k는 짧게 막아 닫아요.', '라익|라이킷|라이커바웃', 23],
    lot: ['rl', '/lɑːt/', '입을 세로로 열어 /ɑː/를 내고 끝 t는 터뜨리지 않고 닫아요.', '랏|라러브|얼라러브', 23],

    // F · V (/f/, /v/)
    favorite: ['fv', '/ˈfeɪvrət/', 'FA·vor·ite — 1음절 강세, f와 v 마찰을 살리며 2박 느낌(/ˈfeɪv·rət/)으로 읽어요.', '페이버릿', 33],
    improve: ['fv', '/ɪmˈpruːv/', 'im·PROVE — 2음절(-PROVE)에 긴 강세를 두고 끝 v 성대를 울려 닫아요.', '임프루브', 33],
    believe: ['fv', '/bɪˈliːv/', 'be·LIEVE — 2음절(-LIEVE)에 강세를 실어 확신 있는 어조와 끝 v 울림을 살려요.', '빌리브', 33],
    motivated: ['fv', '/ˈmoʊtɪveɪtɪd/', 'MO·ti·vat·ed — 1음절에 주강세를 두고 가운데 v 성대 울림을 살려요.', '모티베이티드', 33],
    motivates: ['fv', '/ˈmoʊtɪveɪts/', 'MO·ti·vates — 1음절 주강세와 가운데 v 마찰을 또렷이 살려요.', '모티베이츠', 33],
    involves: ['fv', '/ɪnˈvɑːlvz/', 'in·VOLVES — 2음절(-VOLVES)에 강세를 두고 두 번 나오는 v와 끝 lvz를 울려요.', '인볼브즈', 34],
    active: ['fv', '/ˈæktɪv/', 'AC·tive — 1음절에 강세를 두고 끝 v 성대를 짧게 울려 닫아요.', '액티브', 31],
    reviews: ['fv', '/rɪˈvjuːz/', 're·VIEWS — 2음절(-VIEWS) 강세, 첫 r과 v·끝 유성 z를 모두 살려요.', '리뷰즈', 33],
    review: ['fv', '/rɪˈvjuː/', 're·VIEW — 2음절(-VIEW)에 강세를 두고 첫 r과 v 마찰을 구분해요.', '리뷰', 32],
    service: ['fv', '/ˈsɜːrvɪs/', 'SER·vice — 1음절 /ɜːr/ 강세 뒤 v 마찰과 끝 무성 s를 이어요.', '서비스', 32],
    services: ['fv', '/ˈsɜːrvɪsɪz/', 'SER·vi·ces — 1음절 /ɜːr/ 강세와 가운데 v 성대 울림을 살려요.', '서비시즈', 32],
    enough: ['fv', '/ɪˈnʌf/', 'e·NOUGH — 2음절(-NOUGH) 강세, 끝 gh는 /f/ 바람 소리로 마무리해요.', '이너프', 32],
    office: ['fv', '/ˈɔːfɪs/', 'OF·fice — 1음절에 강세를 두고 윗니를 아랫입술에 대 f 마찰을 내요.', '오피스|노피스', 30],
    offer: ['fv', '/ˈɔːfər/', 'OF·fer — 1음절 강세, f 마찰 뒤 끝 -er를 부드럽게 굴려요.', '오퍼', 30],
    offers: ['fv', '/ˈɔːfərz/', 'OF·fers — 1음절 강세, f 마찰과 끝 rz 유성 울림을 이어요.', '오퍼즈', 30],
    value: ['fv', '/ˈvæljuː/', 'VAL·ue — 1음절 v 유성 마찰로 시작해 l과 /juː/를 매끄럽게 이어요.', '밸류', 31],
    five: ['fv', '/faɪv/', '첫 무성 f와 끝 유성 v의 성대 울림 차이를 한 음절 안에서 구분해요.', '파이브', 31],
    friends: ['fv', '/frendz/', 'fr 자음군에 "으"를 넣지 말고 끝 ndz를 한 음절로 닫아요.', '프렌즈', 29],
    friend: ['fv', '/frend/', 'fr 자음군을 한 번에 빼고 끝 nd를 짧게 닫아요.', '프렌드|프렌더브', 28],
    lived: ['fv', '/lɪvd/', '끝 -ed는 유성 /d/로 바로 붙여 /lɪvd/ 한 음절로 읽어요("리브드" 주의).', '리브드|리브', 31],
    living: ['fv', '/ˈlɪvɪŋ/', 'LIV·ing — 첫 L과 가운데 V 유성 마찰을 또렷이 구분해요.', '리빙', 29],
    leave: ['fv', '/liːv/', '긴 모음 /iː/로 live(/lɪv/)와 구별하고 끝 v 성대를 울려 닫아요.', '리브', 31],
    love: ['fv', '/lʌv/', '끝 v는 입술을 닫는 "ㅂ"이 아니라 아랫입술 마찰 유성음으로 끝내요.', '러브', 27],
    give: ['fv', '/ɡɪv/', '끝 v 성대를 살짝 울려 마무리하고 "기브으"처럼 늘리지 마세요.', '기브|기뷰', 27],
    gives: ['fv', '/ɡɪvz/', '끝 vz 유성 자음군을 모음 첨가 없이 한 음절로 이어요.', '기브즈|기브쥬', 28],
    save: ['fv', '/seɪv/', '이중모음 /eɪ/ 뒤 끝 v 성대를 울려 닫아요.', '세이브', 28],
    saves: ['fv', '/seɪvz/', '끝 vz를 성대 울림으로 이어 한 음절에 마무리해요.', '세이브즈', 29],
    food: ['fv', '/fuːd/', '윗니로 아랫입술을 스치는 f 뒤에 긴 /uː/를 내고 끝 d는 닫아요.', '푸드', 27],
    feel: ['fv', '/fiːl/', '무성 f 마찰 뒤에 긴 /iː/를 내고 끝 l에서 혀끝을 윗니 뒤에 붙여요.', '필', 27],
    life: ['fv', '/laɪf/', '첫 L과 끝 무성 F 마찰을 한 음절 안에서 정확히 구분해요.', '라이프', 28],
    very: ['fv', '/ˈveri/', '윗니를 아랫입술에 대 v 유성 마찰로 시작해 바로 r로 넘겨요.', '베리', 24],
    have: ['fv', '/hæv/', '본동사 have는 끝 v를 가볍게 울리고, 뒤에 to가 오면 /hæf tə/로 이어요.', '해브|해버|해투', 20],
  };

  const STOP = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'if', 'so', 'as', 'of', 'to', 'in', 'on', 'at', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'am', 'do', 'does', 'did', 'has', 'had', 'have',
    'i', 'you', 'he', 'she', 'it', 'we', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
    'its', 'our', 'their', 'this', 'that', 'these', 'those', 'not', 'no', 'yes', 'can', 'could',
    'will', 'would', 'should', 'may', 'might', 'must', 'just', 'too', 'very', 'also', 'then',
  ]);

  // [ipa of 2nd word, linked pronunciation tip, korean chunk candidates]
  const LINK_MAP = {
    'working out': ['/aʊt/', '"working out"은 -ing 끝 코소리에 out을 부드럽게 이어 한 덩어리로 말해요.', '아웃|워킹아웃'],
    'eat out': ['/aʊt/', '"eat out"은 앞 t를 플랩(ㄹ)처럼 부드럽게 굴려 "이라웃"처럼 연결해요.', '이라웃|아웃'],
    'going out': ['/aʊt/', '"going out"은 두 단어를 끊지 말고 자연스럽게 이어 말해요.', '아웃|고잉 아웃'],
    'find out': ['/aʊt/', '"find out"은 d를 뒤 모음에 붙여 한 호흡으로 이어 말해요.', '아웃|파인다웃'],
    'fill out': ['/aʊt/', '"fill out"은 끝 l을 뒤 모음 aʊ에 바로 연결해요.', '아웃|필아웃'],
    'keep in': ['/ɪn/', '"keep in"은 p를 터뜨리지 않고 바로 in에 붙여 "킵인"처럼 이어요.', '킵인|인'],
    'live in': ['/ɪn/', '"live in"은 끝 v를 뒤 모음 ɪ에 연결해 부드럽게 이어 읽어요.', '이너|리빈|인'],
    'lived in': ['/ɪn/', '"lived in"은 끝 d를 뒤 모음 ɪ에 붙여 "리브딘"처럼 한 덩어리로 말해요.', '딘|리브딘'],
    'invest in': ['/ɪn/', '"invest in"은 끝 t를 뒤 모음 ɪ에 붙여 끊김 없이 연결해요.', '인베스트 인'],
    'lot of': ['/əv/', '"lot of"는 of를 /əv/로 약화하고 앞 t를 굴려 "라러브"처럼 가볍게 이어요.', '얼라러브|라러브'],
    'lots of': ['/əv/', '"lots of"는 ts와 약화된 of(/əv/)를 붙여 한 박자로 넘겨요.', '랏처브'],
    'part of': ['/əv/', '"part of"는 of를 /əv/로 줄이고 앞 t를 부드럽게 굴려 "파러브"로 이어요.', '파러브|파럽'],
    'because of': ['/əv/', '"because of"는 끝 /z/ 소리에 약화된 /əv/를 붙여 "비코저브"로 이어요.', '비코저브'],
    'instead of': ['/əv/', '"instead of"는 끝 d와 약화된 /əv/를 이어 "인스테더브"로 한 번에 읽어요.', '인스테더브'],
    'ahead of': ['/əv/', '"ahead of"는 끝 d와 약화된 /əv/를 붙여 "어헤더브"로 매끄럽게 이어요.', '어헤더브'],
    'first of': ['/əv/', '"first of"는 t를 뒤 약모음 /əv/에 붙여 한 호흡으로 이어 읽어요.', '퍼스트 오브'],
    'one of': ['/əv/', '"one of"는 끝 n을 약화된 /əv/에 붙여 "워너브"로 가볍게 넘겨요.', '워너브'],
    'top of': ['/əv/', '"top of"는 끝 p를 약화된 /əv/에 붙여 "타퍼브"로 이어 읽어요.', '타퍼브'],
    'plenty of': ['/əv/', '"plenty of"는 of에 강세를 주지 말고 /əv/로 가볍게 흘려 붙여요.', '플렌티어브'],
    'lack of': ['/əv/', '"lack of"는 끝 k를 약화된 /əv/에 붙여 "래커브"로 이어요.', '래커브'],
    'cup of': ['/əv/', '"cup of"는 끝 p를 약화된 /əv/에 붙여 "커퍼브"로 가볍게 넘겨요.', '커퍼브'],
    'kind of': ['/əv/', '"kind of"는 d를 약화된 /əv/에 붙여 한 덩어리로 줄여 읽어요.', '카인더브'],
    'make it': ['/ɪt/', '"make it"은 대명사 it에 강세를 빼고 k를 붙여 "메이킷"으로 이어요.', '메이킷'],
    'makes it': ['/ɪt/', '"makes it"은 끝 s에 약한 it을 바로 붙여 한 호흡으로 넘겨요.', '메익스 잇'],
    'made it': ['/ɪt/', '"made it"은 끝 d를 약한 it에 붙여 "메이딧"으로 부드럽게 이어요.', '메이딧'],
    'like it': ['/ɪt/', '"like it"은 끝 k를 대명사 it에 붙여 "라이킷"으로 가볍게 닫아요.', '라이킷'],
    'worth it': ['/ɪt/', '"worth it"은 무성 th 뒤에 약한 it을 바로 이어 한 덩어리로 말해요.', '워쓰 잇'],
    'pick it': ['/ɪt/', '"pick it"은 끝 k를 it에 붙여 한 박자로 가볍게 이어요.', '피킷'],
    'take it': ['/ɪt/', '"take it"은 끝 k를 it에 붙여 끊지 않고 이어 말해요.', '테이킷'],
    'check it': ['/ɪt/', '"check it"은 끝 k를 it에 붙여 가볍게 연결해요.', '체킷'],
    'focus on': ['/ɑːn/', '"focus on"은 끝 s를 뒤 모음에 붙여 "포커썬"처럼 자연스럽게 이어요.', '포커썬|포커스 온'],
    'spend on': ['/ɑːn/', '"spend on"은 끝 d를 on에 붙여 "스펜던"처럼 매끄럽게 연결해요.', '스펜던'],
    'take on': ['/ɑːn/', '"take on"은 끝 k를 on에 붙여 "테이컨"처럼 한 덩어리로 이어요.', '테이컨'],
    'depend on': ['/ɑːn/', '"depend on"은 끝 d를 on에 붙여 끊김 없이 이어 말해요.', '디펜던'],
    'work on': ['/ɑːn/', '"work on"은 끝 k를 on에 붙여 한 호흡으로 이어 말해요.', '워컨'],
    'went up': ['/ʌp/', '"went up"은 nt 뒤 모음 ʌ를 부드럽게 이어 "웬텁"처럼 발음해요.', '웬텁'],
    'picked up': ['/ʌp/', '"picked up"은 무성 /t/ 소리를 up에 붙여 "픽텁"으로 한 번에 넘겨요.', '픽텁'],
    'sum up': ['/ʌp/', '"To sum up"은 끝 m을 up에 붙여 "써멉"으로 매끄럽게 이어요.', '써멉'],
    'wake up': ['/ʌp/', '"wake up"은 끝 k를 up에 붙여 한 덩어리로 말해요.', '웨이컵'],
    'get up': ['/ʌp/', '"get up"은 t를 플랩처럼 부드럽게 굴려 이어 말해요.', '게럽'],
    'set up': ['/ʌp/', '"set up"은 t를 부드럽게 굴려 한 호흡으로 이어 말해요.', '세럽'],
    'sign up': ['/ʌp/', '"sign up"은 끝 n을 up에 바로 붙여 이어 말해요.', '사이넙'],
    'with others': ['/ˈʌðərz/', '"with others"는 끝 th와 뒤 모음을 이어 한 호흡으로 부드럽게 넘겨요.', '위디아더즈|위드 아더즈'],
    'each other': ['/ˈʌðər/', '"each other"는 끝 tʃ를 뒤 모음 ʌ에 붙여 한 단어처럼 이어요.', '이취 아더|이치 아더'],
    'get along': ['/əˈlɔːŋ/', '"get along"은 앞 t를 플랩(ㄹ)처럼 굴려 "게럴롱"으로 매끄럽게 이어요.', '게럴롱'],
    'good at': ['/æt/', '"good at"은 끝 d를 약화된 at(/ət/)에 붙여 가볍게 이어요.', '구댓'],
    'look at': ['/æt/', '"look at"은 끝 k를 약화된 at(/ət/)에 붙여 이어 말해요.', '루캣'],
  };

  const LIVE_NOUNS = new Set([
    'concert', 'concerts', 'music', 'show', 'shows', 'performance', 'performances', 'broadcast', 'event', 'events', 'stream',
  ]);
  const LIVES_DETERMINERS = new Set(['our', 'their', 'my', 'your', 'his', 'her', 'its', 'daily', 'human', 'many']);
  const USE_DETERMINERS = new Set(['their', 'the', 'a', 'an', 'my', 'our', 'your', 'his', 'her', 'its', 'good']);
  const CLOSE_NOUNS = new Set(['friend', 'friends', 'family', 'relatives', 'coworker', 'coworkers', 'attention', 'contact', 'to']);

  const DISCOURSE_RE = /^(In my opinion|In my view|From my point of view|As far as I'm concerned|Personally|Generally speaking|To be honest|First of all|Secondly|On top of that|In addition|For example|For instance|Take [^,]+, for example|On the other hand|Of course|However|As a result|Because of this[^,]*|In conclusion|All things considered|To sum up|Therefore|So, overall|For these reasons)\b/i;
  const FRONTED_CLAUSE_RE = /^(When|If|Before|After|While|Even though|Although|Without|During|Once|According to|Thanks to|In my free time|On rainy days|On holidays|Last month|A few years ago)\b[^,]*,/i;
  const COMPARE_RE = /\b(prefer\b|rather than\b|more [a-z-]+ than\b|[a-z]{3,}er than\b|as [a-z-]+ as\b|outweigh\b|instead of\b)/i;
  const REASON_RE = /\b(because|so I|so we|so workers|that's why|this is because|this is the main reason)\b/i;
  const LIST_RE = /,\s+[A-Za-z-]+,\s+and\b/;

  function syllables(word) {
    return (word.replace(/e$/i, '').match(/[aeiouy]+/gi) || [1]).length;
  }

  function tokensOf(text) {
    return [...text.matchAll(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g)].map((match) => match[0]);
  }

  function resolveKo(koSpec, pron) {
    if (!koSpec) return '';
    const candidates = String(koSpec).split('|').filter(Boolean);
    if (!candidates.length) return '';
    if (!pron) return candidates[0];
    for (let i = 0; i < candidates.length; i += 1) {
      if (pron.includes(candidates[i])) return candidates[i];
    }
    return '';
  }

  function resolveHomograph(tokens, index) {
    const key = tokens[index].toLowerCase();
    const prev = index > 0 ? tokens[index - 1].toLowerCase() : '';
    const next = index + 1 < tokens.length ? tokens[index + 1].toLowerCase() : '';

    if (key === 'live') {
      if (LIVE_NOUNS.has(next) || ((prev === 'a' || prev === 'the') && next && !STOP.has(next))) {
        return ['fv', '/laɪv/', '명사를 꾸미는 형용사 live는 /laɪv/(라이브)로 읽어요. 동사 /lɪv/(리브)와 혼동하면 의미 전달 감점 요인이 돼요.', '라이브', 38];
      }
      return ['fv', '/lɪv/', '동사 live는 짧은 /ɪ/ 뒤 끝 v 성대를 울려 닫아요. "리브으"처럼 모음을 늘리지 마세요.', '리브|리빈', 28];
    }

    if (key === 'lives') {
      if (LIVES_DETERMINERS.has(prev) || next === 'more' || next === 'easier' || next === 'with') {
        return ['fv', '/laɪvz/', 'life의 복수 명사는 /laɪvz/(라이브즈)예요. 동사 /lɪvz/와 혼동되지 않게 이중모음 /aɪ/와 끝 vz를 살려요.', '라이브즈', 36];
      }
      return ['fv', '/lɪvz/', '3인칭 동사 lives는 짧은 /ɪ/와 끝 유성 vz를 한 음절로 닫아요.', '리브즈', 28];
    }

    if (key === 'use') {
      if (next === 'of' || USE_DETERMINERS.has(prev)) {
        return ['stress', '/juːs/', '명사 use는 끝이 무성음 /s/예요(use of → /juːs əv/). 동사 /juːz/와 끝소리를 구분해요.', '유저브|유스', 35];
      }
      return null;
    }

    if (key === 'close') {
      if (CLOSE_NOUNS.has(next)) {
        return ['rl', '/kloʊs/', '형용사 close(친한·가까운)는 cl 자음군을 붙이고 끝을 무성 /s/로 끊어요(동사 /kloʊz/와 구분).', '클로스', 35];
      }
      return null;
    }

    return null;
  }

  function approxIpa(word) {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    const map = clean
      .replace(/tion$/g, 'ʃən')
      .replace(/sion$/g, 'ʒən')
      .replace(/th/g, 'θ')
      .replace(/sh/g, 'ʃ')
      .replace(/ch/g, 'tʃ')
      .replace(/ph/g, 'f')
      .replace(/ng/g, 'ŋ');
    return `/${syllables(clean) >= 2 ? 'ˈ' : ''}${map || clean}/`;
  }

  function ruleTag(word) {
    if (word.length < 3 || STOP.has(word)) return '';
    if (word.includes('th')) return 'th';
    if (/[rl]/.test(word)) return 'rl';
    if (/[fv]/.test(word)) return 'fv';
    if (syllables(word) >= 3 || word.includes('-')) return 'stress';
    return '';
  }

  function chunkSegment(segment) {
    const clean = segment.trim();
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length < 8) return clean;

    const rules = [
      {
        re: /\b(because of|because|instead of|rather than|such as|even if|so that|than|when|while|before|after|until|since|where|which|that|why|but|so)\b/gi,
        minLeft: 3,
        minRight: 2,
      },
      { re: /\b(and|or)\b/gi, minLeft: 4, minRight: 3 },
      { re: /\b(gives|helps|makes|outweigh|cannot|can|should|would|is|are)\b/gi, minLeft: 4, minRight: 4 },
      {
        re: /\b(in order to|at least|once a|twice a|three times|every few|about|during|through|without|between|near|along|from|with|for|by|on|at|in)\b/gi,
        minLeft: 4,
        minRight: 3,
      },
      { re: /\bto\s+[a-z]{3,}\b/gi, minLeft: 4, minRight: 3 },
    ];

    for (let r = 0; r < rules.length; r += 1) {
      const { re, minLeft, minRight } = rules[r];
      let match;
      while ((match = re.exec(clean)) !== null) {
        if (match.index === 0) continue;
        const left = clean.slice(0, match.index).trim();
        const right = clean.slice(match.index).trim();
        const leftWords = left.split(/\s+/).filter(Boolean).length;
        const rightWords = right.split(/\s+/).filter(Boolean).length;
        if (leftWords >= minLeft && rightWords >= minRight) {
          const leftChunked = leftWords >= 10 ? chunkSegment(left) : left;
          const rightChunked = rightWords >= 10 ? chunkSegment(right) : right;
          return `${leftChunked} / ${rightChunked}`;
        }
      }
    }

    return clean;
  }

  function buildFlow(sentence) {
    const en = sentence && typeof sentence.en === 'string' ? sentence.en.trim() : '';
    if (!en) return null;

    const id = sentence && typeof sentence.id === 'string' ? sentence.id : '';
    const partBadge = /^p5-/i.test(id)
      ? 'Part 5 (Q11 · 60초 의견)'
      : /^p3-/i.test(id)
        ? 'Part 3 (Q5–7 · 15–30초 응답)'
        : 'TS 억양·호흡';

    const withSemi = en.replace(/;\s+/g, ';↘ / ');
    const commaParts = withSemi.split(/,\s+/);
    const joined = commaParts
      .map((part, idx) => {
        const subParts = part.split(' / ').map(chunkSegment).join(' / ');
        return idx < commaParts.length - 1 ? `${subParts},↗` : subParts;
      })
      .join(' / ')
      .replace(/([.!])(?:\s*)$/, '$1↘')
      .replace(/(\?)(?:\s*)$/, '$1↗');

    let tip = '의미 덩어리(/)마다 호흡을 묶어 내용어(명사·동사·형용사)는 길고 또렷하게, 기능어는 약하게 줄여 끝을 내려요(↘).';
    if (LIST_RE.test(en)) {
      tip = '나열 구문은 앞 항목 끝을 살짝 올리고(↗) 마지막 and 뒤 항목에서 확실히 내려(↘) 완결감을 주세요.';
    } else if (DISCOURSE_RE.test(en)) {
      tip = '담화 표지 끝을 살짝 올린 뒤(↗) 반 박자 쉬고(/), 핵심 주장 내용어에 강세를 실어 문장 끝은 내려 맺어요(↘).';
    } else if (FRONTED_CLAUSE_RE.test(en)) {
      tip = '앞 절 끝을 살짝 올려(↗) 말이 이어짐을 알리고, 쉼표에서 끊어 주절 핵심어를 또렷하게 살려 내려요(↘).';
    } else if (COMPARE_RE.test(en)) {
      tip = '비교·선호 구문은 대비되는 두 핵심 내용어에 강세를 나누어 실어 주고, than·to·as는 약하게 흘려요(↘).';
    } else if (REASON_RE.test(en)) {
      tip = '이유·결과 연결어 앞에서 짧게 호흡을 나누고(/), 뒤따르는 핵심 근거 어휘를 강조해 끝을 내려요(↘).';
    }

    return { partBadge, chunked: joined, tip };
  }

  function pickDiverse(content, limit) {
    if (content.length <= limit) return content.slice();
    const chosen = [content[0]];
    const usedTags = new Set([content[0].tag]);

    for (let i = 1; i < content.length && chosen.length < limit; i += 1) {
      if (!usedTags.has(content[i].tag) && content[i].priority >= 26) {
        chosen.push(content[i]);
        usedTags.add(content[i].tag);
      }
    }
    for (let i = 1; i < content.length && chosen.length < limit; i += 1) {
      if (!chosen.includes(content[i])) chosen.push(content[i]);
    }
    return chosen;
  }

  function build(sentence) {
    const en = sentence && typeof sentence.en === 'string' ? sentence.en : '';
    if (!en) return { points: [], flow: null };

    const pron = sentence && typeof sentence.pron === 'string' ? sentence.pron : '';
    const tokens = tokensOf(en);
    const seen = new Set();
    const content = [];
    const links = [];

    tokens.forEach((raw, index) => {
      const key = raw.toLowerCase();
      if (seen.has(key)) return;
      const entry = resolveHomograph(tokens, index) || WORDS[key];
      if (entry) {
        seen.add(key);
        content.push({
          word: raw,
          key,
          tag: entry[0],
          ipa: entry[1],
          note: entry[2] || '',
          ko: resolveKo(entry[3] || '', pron),
          priority: entry[4] || 30,
          index,
        });
      }
    });

    for (let i = 1; i < tokens.length; i += 1) {
      const prevRaw = tokens[i - 1];
      const word = tokens[i];
      const pair = `${prevRaw.toLowerCase()} ${word.toLowerCase()}`;
      const spec = LINK_MAP[pair];
      if (!spec) continue;
      if (seen.has(word.toLowerCase())) continue;
      seen.add(word.toLowerCase());
      links.push({
        word,
        key: word.toLowerCase(),
        tag: 'link',
        ipa: spec[0],
        note: spec[1] || `"${prevRaw} ${word}"는 앞 단어 끝 자음을 뒤 모음에 붙여 한 덩어리로 말해요.`,
        ko: resolveKo(spec[2] || '', pron),
        priority: 18,
        index: i,
      });
    }

    content.sort((a, b) => b.priority - a.priority || b.word.length - a.word.length || a.index - b.index);

    const maxPoints = tokens.length >= 12 ? 3 : 2;
    const contentCap = links.length && maxPoints === 3 ? 2 : (links.length && content.length > 1 ? 1 : maxPoints);
    const picked = pickDiverse(content, contentCap);
    if (picked.length < maxPoints && links.length) picked.push(links[0]);
    for (let i = 0; i < content.length && picked.length < Math.min(2, maxPoints); i += 1) {
      if (!picked.includes(content[i]) && content[i].priority >= 28) picked.push(content[i]);
    }

    if (!picked.length) {
      const candidates = tokens
        .map((word, index) => ({ word, index, tag: ruleTag(word.toLowerCase()) }))
        .filter((item) => item.tag)
        .sort((a, b) => b.word.length - a.word.length);
      if (candidates.length) {
        const fallback = candidates[0];
        picked.push({
          word: fallback.word,
          tag: fallback.tag,
          ipa: approxIpa(fallback.word),
          note: '',
          ko: '',
          index: fallback.index,
        });
      } else if (tokens.length) {
        const longest = tokens
          .map((word, index) => ({ word, index }))
          .sort((a, b) => b.word.length - a.word.length || a.index - b.index)[0];
        picked.push({
          word: longest.word,
          tag: 'stress',
          ipa: approxIpa(longest.word),
          note: '',
          ko: '',
          index: longest.index,
        });
      }
    }

    picked.sort((a, b) => a.index - b.index);

    const points = picked.map((point, index) => ({
      word: point.word,
      ipa: point.ipa || approxIpa(point.word),
      tag: point.tag,
      tip: point.note || TAGS[point.tag].tip,
      ko: point.ko || '',
      num: index + 1,
      index: point.index,
    }));

    return { points, flow: buildFlow(sentence) };
  }

  window.PRON_GUIDE = { build, TAGS };
})();
