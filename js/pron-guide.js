(() => {
  'use strict';

  const TAGS = {
    th: {
      label: 'TH',
      tip: '혀끝을 윗니 끝에 가볍게 대고 바람을 내보내요. 혀를 내밀기 어려우면 ㄷ·ㄸ에 가깝게 내도 점수 차이는 작으니, 멈칫하지 말고 자연스럽게 이어 말하는 쪽을 택해요.',
    },
    rl: {
      label: 'R·L',
      tip: 'L은 혀끝을 윗니 뒤 잇몸에 붙이고, R은 혀끝이 어디에도 닿지 않게 뒤로 당기며 입술을 계란형으로 모아요. 자음 뒤 "으" 첨가를 피해요.',
    },
    fv: {
      label: 'F·V',
      tip: '윗니를 아랫입술에 살짝 대고 마찰음을 내요(V는 성대 울림, PH도 F 소리예요). "ㅍ·ㅂ" 파열음으로 바꾸지 마세요.',
    },
    jz: {
      label: 'J·Z',
      tip: 'J는 입술을 앞으로 오므려 "쥐"처럼, Z는 입을 옆으로 벌린 채 진동을 내요. 둘을 같은 "ㅈ"으로 내지 않게 구분해요.',
    },
    stress: {
      label: '강세',
      tip: '강세 음절을 길고 높게 살리고 나머지 음절은 짧고 약하게 줄여요. 문장에서는 숫자·고유명사·not 같은 부정어·-ly 부사를 또렷하게 살리고 기능어는 가볍게 넘겨요.',
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
    reports: ['rl', '/rɪˈpɔːrts/', 're·PORTS — report도 reports도 앞 re-는 약하게, 뒤 -PORT-에 강세를 둬요. r을 살리고 복수형 끝 rts 자음군은 한 번에 닫아요.', '리포츠', 32],
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

    // J · Z (/dʒ/, /z/) — J는 입술을 오므리고 Z는 입을 옆으로 벌려요. 어말 -ge는 모음 없이 짧게 흐려요.
    jazz: ['jz', '/dʒæz/', '앞 J는 입술을 오므려 "쥐"처럼, 끝 Z는 입을 옆으로 벌려 진동을 내요. 같은 "ㅈ" 두 번이 아니에요.', '재즈|쟤즈', 34],
    museum: ['jz', '/mjuˈziːəm/', 'mu·SE·um — 가운데 s는 /z/ 소리예요. 입을 옆으로 벌려 진동을 내고 2음절(-SE-)에 강세를 둬요.', '뮤지엄', 34],
    busy: ['jz', '/ˈbɪzi/', '가운데 s는 /z/예요. 입을 옆으로 벌린 채 진동을 내고, 입술을 오므리는 J와 구분해요.', '비지', 30],
    easy: ['jz', '/ˈiːzi/', '가운데 s는 /z/예요. 입을 옆으로 벌린 채 진동을 내고, 입술을 오므리는 J와 구분해요.', '이지', 29],
    job: ['jz', '/dʒɑːb/', '첫 J는 입술을 앞으로 오므려 내요. 입을 옆으로 벌리는 Z와 다른 소리예요.', '잡|좝', 28],
    manager: ['jz', '/ˈmænɪdʒər/', 'MAN·a·ger — 1음절 강세, 가운데 g는 입술을 오므린 J(/dʒ/)로 내요.', '매니저|매니져', 31],
    college: ['jz', '/ˈkɑːlɪdʒ/', '끝 -ge는 입술을 오므린 J 소리로 짧게 끝내요. 끝 "지" 모음을 또렷이 내지 말고 흐려요.', '칼리지|컬리지|칼리쥐', 32],
    large: ['jz', '/lɑːrdʒ/', 'L에서 R로 혀를 앞에서 뒤로 당기고, 끝 -ge는 입을 모은 채 모음 없이 짧게 흐려요("라지" 주의).', '라지|라쥐', 32],
    advantage: ['jz', '/ədˈvæntɪdʒ/', 'ad·VAN·tage — 2음절(-VAN-) 강세, 끝 -ge는 입을 모은 채 모음 없이 짧게 흐려요.', '어드밴티지', 34],
    change: ['jz', '/tʃeɪndʒ/', '끝 -nge는 입을 모은 J 소리로 짧게 끝내요. 끝 "이" 모음을 세게 내지 마세요.', '체인지', 30],

    // 단어 강세 — 품사·접미사에 따라 강세 자리가 바뀌는 단어
    purchase: ['stress', '/ˈpɜːrtʃəs/', 'PUR·chase — 1음절(PUR-)에 강세를 두고 뒤 -chase는 "체이스"가 아니라 약한 /tʃəs/로 줄여요.', '퍼처스|퍼쳐스', 35],
    representative: ['stress', '/ˌreprɪˈzentətɪv/', 'rep·re·SEN·ta·tive — 1차 강세는 -SEN-, 2차 강세는 rep-. 나머지 음절은 짧게 흘려요.', '레프리젠터티브|레프리젠터티브즈', 35],
    report: ['rl', '/rɪˈpɔːrt/', 're·PORT — 앞 re-는 약하게, 뒤 -PORT에 강세를 두고 r을 살려요.', '리포트', 32],
    update: ['stress', '/ˈʌpdeɪt/', '명사 UP·date는 앞 음절에 강세를 둬요(형용사 updated는 뒤 -DAT-에 강세).', '업데이트', 33],
    updates: ['stress', '/ˈʌpdeɪts/', '명사 UP·dates — 앞 음절에 강세를 두고 끝 ts를 짧게 닫아요.', '업데이츠', 33],
    updated: ['stress', '/ʌpˈdeɪtɪd/', 'up·DAT·ed — 형용사로 쓰면 뒤 -DAT-에 강세를 둬요(명사 UP·date와 반대).', '업데이티드|업데이릿', 33],
    italy: ['stress', '/ˈɪtəli/', 'IT·a·ly — 1음절에 강세. Italian(i·TAL·ian)은 2음절로 강세가 옮겨 가요.', '이털리|이탈리', 33],
    italian: ['stress', '/ɪˈtæliən/', 'i·TAL·ian — 2음절(-TAL-)에 강세를 둬요(Italy는 1음절 강세).', '이탤리언|이태리언', 33],
    economy: ['stress', '/ɪˈkɑːnəmi/', 'e·CON·o·my — 2음절(-CON-)에 강세. economic은 3음절(-NOM-)로 강세가 옮겨 가요.', '이카너미|이코노미', 34],
    economic: ['stress', '/ˌekəˈnɑːmɪk/', 'ec·o·NOM·ic — 3음절(-NOM-)에 강세를 둬요(economy는 2음절 강세).', '에커나믹|이코노믹', 34],
    economical: ['stress', '/ˌekəˈnɑːmɪkl/', 'ec·o·NOM·i·cal — -NOM-에 강세를 두고 끝 -cal은 짧게 흘려요.', '에커나미컬|이코노미컬', 34],
    renovation: ['stress', '/ˌrenəˈveɪʃn/', 'ren·o·VA·tion — -ation의 A가 들어 있는 음절(-VA-)에 주강세를 둬요.', '레노베이션|레너베이션', 35],
    demonstration: ['stress', '/ˌdemənˈstreɪʃn/', 'dem·on·STRA·tion — -ation의 A가 들어 있는 음절(-STRA-)에 주강세를 둬요.', '데먼스트레이션|데몬스트레이션', 35],
    imagination: ['stress', '/ɪˌmædʒɪˈneɪʃn/', 'i·mag·i·NA·tion — -ation의 A가 들어 있는 음절(-NA-)에 주강세를 둬요.', '이매지네이션', 35],
    washington: ['stress', '/ˈwɑːʃɪŋtən/', 'WASH·ing·ton — -ton은 o를 또렷이 내지 않고 약한 /tən/으로, 강세는 첫 음절이에요.', '워싱턴', 33],
    huntington: ['stress', '/ˈhʌntɪŋtən/', 'HUNT·ing·ton — -ton은 약한 /tən/, 강세는 첫 음절이에요.', '헌팅턴', 33],
    general: ['rl', '/ˈdʒenrəl/', 'GEN·er·al — 1음절에 강세를 두고 끝 -eral은 /rəl/로 줄여 r에서 l로 혀를 옮겨 짧게 닫아요.', '제너럴|제너럴리', 32],
    natural: ['rl', '/ˈnætʃrəl/', 'NAT·u·ral — 1음절 강세, 끝 -ural은 /rəl/로 줄여 r에서 l로 혀를 옮겨요.', '내추럴|내처럴', 32],

    // Part 2·4 답변에 자주 나오는 단어
    blond: ['rl', '/blɑːnd/', 'bl을 모음 없이 붙여 시작하고 R처럼 굵은 소리로 입을 세로로 열어 /ɑː/를 내요.', '블론드|블란드', 31],
    wearing: ['rl', '/ˈwerɪŋ/', 'WEAR·ing — r을 살려 "웨어링"으로, "웰링"처럼 l로 바꾸지 마세요.', '웨어링', 31],
    clothes: ['th', '/kloʊðz/', 'th를 약하게 넘겨 close(/kloʊz/)처럼 말해도 괜찮아요. 끝 z 울림만 살려요.', '클로즈|클로우즈', 30],
    uniform: ['stress', '/ˈjuːnɪfɔːrm/', 'U·ni·form — 1음절(YOU-)에 강세, 끝 -form은 f 마찰과 r을 살려요. 시험 전에 몇 번 소리 내 봐요.', '유니폼', 32],
    ladder: ['rl', '/ˈlædər/', 'LAD·der — 첫 L을 붙이고 가운데 dd는 굴리듯 약하게, 끝 -er는 r로 닫아요.', '래더', 30],
    pizza: ['stress', '/ˈpiːtsə/', 'PIZ·za — 가운데 zz는 /ts/예요. "피자"보다 받침을 넣은 "핏자"에 가깝게, 1음절에 강세를 둬요.', '핏자|피자', 30],
    hall: ['rl', '/hɔːl/', '입을 둥글게 열어 /ɔː/를 길게 내고 끝 l을 살려요("홀"처럼 짧게 닫지 마세요).', '허얼|홀', 30],
    dollars: ['rl', '/ˈdɑːlərz/', 'DOL·lars — 1음절 강세, 끝 -rs의 z 울림을 살려 복수임을 들려줘요.', '달러즈|달러스', 31],
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
    'would say': ['/seɪ/', '"I would say"는 "I’d say"로 줄여 한 호흡으로 말해요. 빠르게는 "아쎄"에 가깝게 들릴 수 있지만, 억지로 줄이기보다 뜻이 또렷하게 들리도록 자연스럽게 이어요.', '아쎄|아이드 세이|아이드 세'],
    'it will': ['/wɪl/', '"it will"은 t를 또박또박 끊지 말고 굴려 "이릴"처럼 will에 붙여요(It will be held → 이릴 비 헬드).', '이릴|잇 윌'],
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

  // ── 끊어 읽기·억양 규칙(책 #1~#8) ────────────────────────────────
  // 규칙을 적용한 결과는 원문에서 공백 하나를 " / "로 바꾸고 화살표만 덧붙인 것이다.
  // 화살표를 지우고 " / "를 " "로 되돌리면 원문과 글자 단위로 같아야 한다.
  const ABBREVIATIONS = new Set([
    'mr', 'mrs', 'ms', 'dr', 'prof', 'st', 'jr', 'sr', 'vs', 'etc', 'inc', 'ltd', 'co',
    'no', 'fig', 'approx', 'a.m', 'p.m', 'e.g', 'i.e', 'u.s',
  ]);

  const WH_WORDS = new Set(['what', 'where', 'when', 'who', 'whom', 'whose', 'why', 'how', 'which']);

  const AUX_WORDS = new Set([
    'is', 'are', 'was', 'were', 'am', 'be', 'been', 'being', 'do', 'does', 'did',
    'have', 'has', 'had', 'will', 'would', 'can', 'could', 'should', 'may', 'might',
    'must', 'shall', 'cannot',
  ]);

  const SUBJECT_WORDS = new Set([
    'i', 'we', 'you', 'he', 'she', 'they', 'it', 'people', 'everyone', 'someone',
    'anyone', 'nobody', 'somebody', 'there', 'this', 'that', 'these', 'those',
  ]);

  const DETERMINERS = new Set([
    'the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her',
    'its', 'our', 'their', 'some', 'any', 'many', 'much', 'more', 'less', 'most',
    'all', 'each', 'every', 'no', 'another', 'both', 'few', 'several', 'such', 'own',
  ]);

  const ADVERBS = new Set([
    'especially', 'also', 'then', 'now', 'often', 'usually', 'really', 'still', 'just',
    'mostly', 'never', 'always', 'only', 'even', 'actually', 'generally', 'personally',
    'sometimes', 'recently', 'already', 'almost', 'quite', 'rather', 'soon', 'later',
    'probably', 'definitely', 'certainly', 'simply', 'together',
  ]);

  // 불규칙 과거형(주어+동사·정동사 판별용)
  const IRREGULAR_PAST = new Set([
    'went', 'made', 'took', 'gave', 'came', 'saw', 'got', 'said', 'found', 'knew',
    'thought', 'told', 'became', 'began', 'brought', 'built', 'bought', 'held', 'kept',
    'left', 'led', 'met', 'paid', 'ran', 'rose', 'sold', 'sent', 'sat', 'spent',
    'stood', 'understood', 'won', 'wrote', 'spoke', 'chose', 'grew', 'fell', 'felt',
    'heard', 'lost', 'meant', 'slept', 'wore', 'ate', 'drank', 'drove', 'rode', 'taught',
    'caught', 'threw', 'flew', 'showed',
  ]);

  const VERB_BASE = new Set([
    'accept', 'add', 'affect', 'agree', 'allow', 'apply', 'arrive', 'ask',
    'attend', 'avoid', 'balance', 'become', 'begin', 'believe', 'belong', 'bicycle',
    'book', 'boost',
    'borrow', 'break', 'bring', 'build', 'buy', 'call', 'carry', 'catch', 'cause',
    'change', 'check', 'choose', 'clean', 'close', 'come', 'communicate', 'compare',
    'complete', 'concentrate', 'consider', 'continue', 'control', 'cook', 'cooperate',
    'cover', 'create', 'cut', 'deal', 'decide', 'deliver', 'depend', 'develop', 'die',
    'discover', 'discuss', 'draw', 'drink', 'drive', 'earn', 'eat', 'encourage',
    'enjoy', 'enter', 'exercise', 'expect', 'explain', 'explore', 'express', 'fall',
    'feel', 'fill', 'find', 'finish', 'fit', 'fix', 'focus', 'follow', 'forget',
    'gain', 'get', 'give', 'go', 'grow', 'handle', 'happen', 'hear', 'help', 'hold',
    'hope', 'imagine', 'improve', 'include', 'increase', 'introduce', 'invest', 'join',
    'keep', 'know', 'lead', 'learn', 'leave', 'let', 'limit', 'listen', 'live', 'look',
    'lose', 'love', 'maintain', 'make', 'manage', 'matter', 'mean', 'meet', 'move',
    'need', 'offer', 'open', 'order', 'organize', 'pay', 'perform', 'pick', 'plan',
    'play', 'practice', 'prefer', 'prepare', 'present', 'prevent', 'produce',
    'promote', 'protect', 'provide', 'publish', 'put', 'reach', 'read', 'receive',
    'reconsider', 'recycle', 'recommend', 'reduce', 'relax', 'remain', 'remember',
    'remove', 'repeat', 'replace', 'reply', 'report', 'require', 'respond', 'rest',
    'return', 'ride', 'rise', 'run', 'save', 'say', 'see', 'seek', 'seem', 'sell',
    'send', 'serve', 'set', 'share', 'shop', 'show', 'sit', 'sleep', 'solve', 'spend',
    'speak', 'start', 'stay', 'stop', 'study', 'succeed', 'suggest', 'support', 'take',
    'talk', 'teach', 'tell', 'tend', 'think', 'throw', 'track', 'train', 'travel',
    'try', 'turn', 'understand', 'use', 'visit', 'wait', 'wake', 'walk',
    'want', 'watch', 'wear', 'welcome', 'win', 'wish', 'work', 'worry', 'write',
  ]);

  const CONJ_WORDS = new Set(['and', 'but', 'or', 'so', 'yet', 'nor']);
  const CLAUSE_MARKERS = new Set([
    'because', 'although', 'though', 'while', 'if', 'unless', 'since', 'until', 'till',
    'whenever', 'whereas',
  ]);
  const RELATIVE_WORDS = new Set(['who', 'whom', 'whose', 'which', 'that', 'when', 'where', 'why', 'how']);

  // 지시어 "that + 명사"를 만드는 타동사(규칙 5): I like that book …
  const DEMONSTRATIVE_VERBS = new Set([
    'like', 'likes', 'liked', 'love', 'loves', 'loved', 'enjoy', 'enjoys', 'enjoyed',
    'read', 'reads', 'buy', 'buys', 'bought', 'want', 'wants', 'wanted', 'need',
    'needs', 'needed', 'see', 'saw', 'seen', 'watch', 'watched', 'have', 'has', 'had',
    'prefer', 'prefers', 'preferred', 'choose', 'chose', 'chosen', 'found', 'find',
    'keep', 'kept', 'remember', 'remembered', 'recommend', 'recommended',
  ]);

  // "the statement that …"처럼 내용 명사 뒤 that절은 보충절로 본다(규칙 11 팁).
  const CONTENT_NOUNS = new Set([
    'statement', 'fact', 'idea', 'belief', 'reason', 'possibility', 'news',
    'feeling', 'opinion', 'thought', 'claim', 'evidence', 'proof', 'chance',
  ]);

  const PREPOSITIONS = new Set([
    'in', 'on', 'at', 'with', 'for', 'from', 'during', 'after', 'before', 'through',
    'without', 'between', 'among', 'about', 'along', 'across', 'near', 'under', 'over',
    'into', 'around', 'despite', 'toward', 'against', 'within', 'beyond', 'by',
  ]);

  // 붙어 다니는 짝은 전치사 앞에서 끊지 않는다(규칙 7).
  const FIXED_PAIRS = new Set([
    'interested in', 'succeed in', 'believe in', 'result in', 'engage in', 'arrive in',
    'depend on', 'depends on', 'rely on', 'focus on', 'work on', 'spend on', 'based on',
    'look forward to', 'looking forward to', 'due to', 'thanks to', 'according to',
    'because of', 'instead of', 'in order to', 'as well as', 'good at', 'deal with',
    'take care of', 'pay attention to', 'a lot of', 'lots of', 'kind of', 'part of',
    'one of', 'some of', 'most of', 'all of', 'at least', 'on time', 'in time',
    'by the time', 'in addition to', 'as a result of', 'on behalf of', 'in front of',
    'close to', 'next to', 'similar to', 'compared to', 'related to', 'different from',
    'far from', 'worried about', 'excited about', 'think about', 'talk about',
    'ask for', 'wait for', 'looking for', 'prepare for', 'known for', 'known as',
    'famous for', 'responsible for', 'access to', 'key to', 'respond to', 'listen to',
    'lead to', 'contribute to', 'belong to', 'refer to', 'apply for', 'care about',
    'caring for', 'looking at', 'worried about', 'talk with', 'meet with', 'agree with',
    'like to', 'want to', 'need to', 'have to', 'going to', 'try to', 'plan to',
    'hope to', 'love to', 'used to', 'able to', 'seem to', 'learn to', 'help to',
    'prefer to', 'would like to', 'decide to', 'begin to', 'manage to',
    'not to', 'how to', 'work for', 'try on', 'them on', 'it on', 'me on',
    'work from', 'working from', 'come from', 'comes from',
    'learn about', 'more about', 'good for',
    // 동사+전치사 고정 짝(규칙 7) — 활용형은 wordStems가 표제형으로 되돌린다.
    'forget about', 'worry about', 'hear about', 'look at', 'look for', 'pay for',
    'care for', 'talk to', 'speak to', 'write about', 'read about', 'know about',
    'ask about', 'hear from', 'suffer from', 'benefit from', 'protect from',
    'prevent from', 'differ from', 'recover from', 'apologize for', 'thank for',
    'search for', 'hope for', 'stand for', 'account for', 'call for', 'look after',
    'look into', 'run into', 'come across', 'get over', 'go through', 'cope with',
    'disagree with', 'comply with', 'concentrate on', 'count on', 'decide on',
    'comment on', 'reflect on', 'insist on', 'participate in', 'take part in',
    'specialize in', 'invest in',
  ]);

  // to 뒤에 오면 전치사로 보는 명사(규칙 6).
  const NOUN_AFTER_TO = new Set([
    'work', 'school', 'bed', 'church', 'lunch', 'dinner', 'breakfast', 'home', 'town',
    'downtown', 'college', 'university', 'korea', 'seoul', 'jeju', 'japan', 'europe',
    'me', 'him', 'her', 'us', 'them', 'you', 'it', 'one', 'two', 'three',
  ]);

  const TIP_TEXT = {
    list: '나열 구문은 앞 항목 끝을 살짝 올려요(↗). Part 1 낭독은 마지막 항목에서 내려(↘) 맺고, 대화체 답변은 꼭 내리지 않아도 돼요.',
    listContinue: '나열은 앞 항목 끝을 살짝 올리고(↗) 마지막 항목이 문장 중간에서 이어지면 그 끝은 올리지 않고 유지(→)한 뒤 다음 말로 이어 가요.',
    relative: '관계사(who·which·that·where·how) 앞의 /는 호흡을 나눌 수 있는 예시예요. 관계절을 한 덩어리로 이어 읽는 연습을 해요.',
    complement: 'that이 관계사가 아니라 접속사로 절을 시작할 때 앞의 /는 호흡 예시예요. that절은 한 덩어리로 이어 읽어 봐요.',
    infinitive: 'to부정사 앞의 /는 호흡 예시예요. to 뒤 동사구를 한 덩어리로 읽는 연습을 해요.',
    clause: '접속사로 두 절(주어+동사)이 이어질 때의 /는 호흡 예시예요. 반드시 그 위치에서 쉴 필요는 없어요.',
    verbphrase: '동사구를 and·or로 나란히 이을 때는 끊지 않고 한 호흡으로 이어 읽어요(주어는 한 번만 말해요).',
    comma: '도입어·부사구 뒤 쉼표는 살짝 올려(↗) 말이 이어진다는 느낌을 줘요. /는 호흡 예시일 뿐, 꼭 쉬어야 하는 위치는 아니에요.',
    prep: '긴 덩어리의 전치사 앞 /는 호흡 예시일 뿐, 끊어야 하는 원칙은 아니에요. 붙어 다니는 짝은 이어 읽는 연습을 해요(interested in, depend on).',
  };
  const TIP_ORDER = ['listContinue', 'list', 'relative', 'complement', 'infinitive', 'clause', 'verbphrase', 'comma', 'prep'];
  const DEFAULT_TIP = '숫자·고유명사·부정어·-ly 부사는 또렷하게, 기능어는 가볍게 말해요. /는 호흡을 나눠 볼 수 있는 예시예요.';

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

  function baseWord(lower) {
    return lower.replace(/['’](s|ll|ve|re|d|m)$/i, '');
  }

  // 활용형(-ed/-s/-es/-ing)을 벗긴 표제형까지 돌려준다.
  // 고정 짝 조회용: 활용형(-s·-ed·-ing)과 불규칙 과거형을 표제형까지 되돌린다(규칙 7).
  const IRREGULAR_BASES = {
    has: 'have', does: 'do', did: 'do', done: 'do', went: 'go', gone: 'go',
    saw: 'see', seen: 'see', took: 'take', taken: 'take', gave: 'give', given: 'give',
    wrote: 'write', written: 'write', spoke: 'speak', spoken: 'speak',
    broke: 'break', broken: 'break', chose: 'choose', chosen: 'choose',
    drove: 'drive', driven: 'drive', ate: 'eat', eaten: 'eat', fell: 'fall',
    fallen: 'fall', knew: 'know', known: 'know', grew: 'grow', grown: 'grow',
    threw: 'throw', thrown: 'throw', flew: 'fly', flown: 'fly', drew: 'draw',
    drawn: 'draw', began: 'begin', begun: 'begin', drank: 'drink', drunk: 'drink',
    sang: 'sing', sung: 'sing', swam: 'swim', swum: 'swim', rose: 'rise',
    risen: 'rise', led: 'lead', fed: 'feed', fled: 'flee', sought: 'seek',
    fought: 'fight', thought: 'think', brought: 'bring', bought: 'buy',
    caught: 'catch', taught: 'teach', built: 'build', lent: 'lend', sent: 'send',
    spent: 'spend', bent: 'bend', meant: 'mean', dealt: 'deal', heard: 'hear',
    paid: 'pay', laid: 'lay', said: 'say', made: 'make', had: 'have',
    hid: 'hide', hidden: 'hide', bit: 'bite', bitten: 'bite', beat: 'beat',
    beaten: 'beat', became: 'become', came: 'come', ran: 'run', sat: 'sit',
    stood: 'stand', understood: 'understand', wore: 'wear', worn: 'wear',
    won: 'win', lost: 'lose', left: 'leave', felt: 'feel', kept: 'keep',
    slept: 'sleep', met: 'meet', told: 'tell', sold: 'sell', held: 'hold',
    got: 'get', gotten: 'get', forgot: 'forget', forgotten: 'forget',
    froze: 'freeze', frozen: 'freeze', stole: 'steal', stolen: 'steal',
    woke: 'wake', woken: 'wake',
  };

  function wordStems(lower, rich = false) {
    const forms = new Set([lower]);
    if (rich && IRREGULAR_BASES[lower]) forms.add(IRREGULAR_BASES[lower]);
    // studies → study, worried → worry
    if (rich && /ies$/.test(lower)) forms.add(`${lower.slice(0, -3)}y`);
    if (rich && /ied$/.test(lower)) forms.add(`${lower.slice(0, -3)}y`);
    if (/ing$/.test(lower)) {
      const stem = lower.slice(0, -3);
      forms.add(stem);
      forms.add(`${stem}e`);
      // forgetting → forget, stopping → stop
      if (rich && /([bcdfghjklmnpqrstvwxz])\1$/.test(stem)) forms.add(stem.slice(0, -1));
    }
    if (/ed$/.test(lower)) {
      const stem = lower.slice(0, -2);
      forms.add(stem);
      forms.add(lower.slice(0, -1));
      // stopped → stop, planned → plan
      if (rich && /([bcdfghjklmnpqrstvwxz])\1$/.test(stem)) forms.add(stem.slice(0, -1));
    }
    if (/es$/.test(lower)) forms.add(lower.slice(0, -2));
    if (/s$/.test(lower)) forms.add(lower.slice(0, -1));
    return forms;
  }

  function isFixedPair(prev, next) {
    // 전치사 짝은 불규칙·중복자음·y→i 활용형까지 표제형으로 맞춘다.
    const rich = PREPOSITIONS.has(next);
    for (const a of wordStems(prev, rich)) {
      for (const b of wordStems(next, false)) {
        if (FIXED_PAIRS.has(`${a} ${b}`)) return true;
      }
    }
    return false;
  }

  // 정동사(현재·과거·3인칭)만. -ing·원형은 PP 뒤 정동사 판정에서 뺀다.
  function isFiniteForm(lower) {
    if (AUX_WORDS.has(lower)) return true;
    if (/ed$/.test(lower)) return true;
    if (/s$/.test(lower) && isVerbForm(lower)) return true;
    return IRREGULAR_PAST.has(lower);
  }

  function isVerbForm(lower) {
    if (AUX_WORDS.has(lower) || VERB_BASE.has(lower) || IRREGULAR_PAST.has(lower)) return true;
    if (/ed$/.test(lower)) return true;
    if (/ing$/.test(lower)) {
      const stem = lower.slice(0, -3);
      return VERB_BASE.has(stem) || VERB_BASE.has(`${stem}e`);
    }
    if (/s$/.test(lower)) return VERB_BASE.has(lower.slice(0, -1));
    return false;
  }

  function tokenize(text) {
    const re = /[A-Za-z]+(?:['’-][A-Za-z]+)*|\d+(?:[.:]\d+)*|[^\sA-Za-z0-9]/g;
    const tokens = [];
    let match;
    while ((match = re.exec(text)) !== null) {
      tokens.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        isWord: /[A-Za-z0-9]/.test(match[0].charAt(0)),
      });
    }
    return tokens;
  }

  function isAbbreviationDot(text, dotIndex) {
    const before = text.slice(Math.max(0, dotIndex - 12), dotIndex);
    const word = (before.match(/([A-Za-z][A-Za-z.]*)$/) || [])[1];
    if (!word) return false;
    if (/^[A-Z]$/.test(word)) return true;
    return ABBREVIATIONS.has(word.toLowerCase().replace(/\.+$/, ''));
  }

  // 문장 단위로 먼저 나눈다(규칙 1). 마침표·물음표·느낌표 뒤 공백에서 자른다.
  function splitSentences(text) {
    const out = [];
    const re = /([.!?]+)(["'”’)\]]*)(\s+|$)/g;
    let start = 0;
    let match;
    while ((match = re.exec(text)) !== null) {
      const end = match.index + match[1].length + match[2].length;
      if (match[1] === '.' && isAbbreviationDot(text, match.index)) continue;
      out.push({ text: text.slice(start, end), punct: match[1], gap: match[3] });
      start = end + match[3].length;
    }
    if (start < text.length) out.push({ text: text.slice(start).trim(), punct: '', gap: '' });
    return out;
  }

  function endArrow(sentenceText) {
    const text = sentenceText.trimEnd();
    const match = text.match(/([.!?])["'”’)\]]*$/);
    if (!match) return '';
    if (match[1] !== '?') return '↘';
    const first = (text.match(/^[A-Za-z]+/) || [''])[0].toLowerCase();
    // 규칙 8: 의문사 의문문은 내림, 예/아니요 의문문은 올림
    return WH_WORDS.has(first) ? '↘' : '↗';
  }

  function isClauseStart(words, start) {
    let i = start;
    while (i < words.length && ADVERBS.has(words[i].base)) i += 1;
    if (i >= words.length) return false;
    const word = words[i].base;
    if (AUX_WORDS.has(word) || isVerbForm(word)) return true;
    if (SUBJECT_WORDS.has(word) || DETERMINERS.has(word)) {
      for (let j = i + 1; j < Math.min(i + 5, words.length); j += 1) {
        const next = words[j].base;
        if (AUX_WORDS.has(next) || isVerbForm(next)) return true;
      }
      return false;
    }
    // 명사 주어 + 동사
    if (words[i + 1] && isVerbForm(words[i + 1].base)) return true;
    return false;
  }

  function hasVerbBefore(words, limit) {
    for (let i = Math.max(0, limit - 10); i < limit; i += 1) {
      if (AUX_WORDS.has(words[i].base) || isVerbForm(words[i].base)) return true;
    }
    return false;
  }

  // 접속사 오른쪽에 주어가 드러나 있는지(절) 아니면 동사구 병렬인지.
  function hasExplicitSubject(words, start) {
    let i = start;
    while (i < words.length && ADVERBS.has(words[i].base)) i += 1;
    if (i >= words.length) return false;
    const word = words[i].base;
    if (SUBJECT_WORDS.has(word) || DETERMINERS.has(word)) {
      for (let j = i + 1; j < Math.min(i + 5, words.length); j += 1) {
        if (AUX_WORDS.has(words[j].base) || isVerbForm(words[j].base)) return true;
      }
      return false;
    }
    if (AUX_WORDS.has(word) || CONJ_WORDS.has(word) || RELATIVE_WORDS.has(word) || CLAUSE_MARKERS.has(word)) return false;
    if (isVerbForm(word)) return false;
    return Boolean(words[i + 1] && isVerbForm(words[i + 1].base));
  }

  // 지시어 "that book"은 관계사가 아니다(규칙 5).
  function relativeFollows(words, index, total) {
    const word = words[index].base;
    const next = words[index + 1];
    if (!next) return false;
    if (word === 'that') {
      const first = next.base;
      const prev = index > 0 ? words[index - 1].base : '';
      // like·read·buy 같은 타동사 뒤 "that + 명사"는 지시어다.
      if (DEMONSTRATIVE_VERBS.has(prev) && !AUX_WORDS.has(first) && !SUBJECT_WORDS.has(first) && !DETERMINERS.has(first)) {
        return false;
      }
      if (AUX_WORDS.has(first) || DETERMINERS.has(first) || SUBJECT_WORDS.has(first)) return true;
      if (isVerbForm(first) && words[index + 2] && !PREPOSITIONS.has(words[index + 2].base)) return true;
      for (let j = index + 1; j < Math.min(index + 9, total); j += 1) {
        if (CONJ_WORDS.has(words[j].base) || RELATIVE_WORDS.has(words[j].base)) break;
        if (AUX_WORDS.has(words[j].base)) return true;
        if (isVerbForm(words[j].base) && !(j > 0 && words[j - 1].base === 'to')) return j > index + 1;
      }
      return false;
    }
    if (word === 'how') {
      // how to + 동사 (부정사의 how절)
      if (next.base === 'to' && words[index + 2] && isVerbForm(words[index + 2].base)) return true;
      for (let j = index + 1; j < Math.min(index + 6, total); j += 1) {
        if (AUX_WORDS.has(words[j].base)) return j > index + 1;
        if (SUBJECT_WORDS.has(words[j].base) && words[j + 1] && isVerbForm(words[j + 1].base)) return true;
        if (VERB_BASE.has(words[j].base)) return false;
      }
      return false;
    }
    return isClauseStart(words, index + 1);
  }

  // that절이 보충절이면 'complement', 관계절이면 'relative' 팁을 쓴다(규칙 11).
  function thatClauseKind(words, index) {
    const prev = index > 0 ? words[index - 1] : null;
    if (!prev) return 'relative';
    if (AUX_WORDS.has(prev.base) || isVerbForm(prev.base)) return 'complement';
    return CONTENT_NOUNS.has(prev.base) ? 'complement' : 'relative';
  }

  function itemCategory(item) {
    let i = 0;
    while (i < item.length && (item[i].base === 'and' || item[i].base === 'or')) i += 1;
    if (i >= item.length) return 'empty';
    // "Actually," 처럼 부사만 있는 항목은 나열의 항목(명사·동사구)이 아니라 도입어다. np로 두면 뒤 항목과 짝지어 나열로 오인한다.
    if (item.every((entry) => ADVERBS.has(entry.base))) return 'adv';
    const word = item[i].base;
    if (SUBJECT_WORDS.has(word) || AUX_WORDS.has(word)) return 'clause';
    if (CONJ_WORDS.has(word) || CLAUSE_MARKERS.has(word) || RELATIVE_WORDS.has(word)) return 'clause';
    if (DETERMINERS.has(word)) {
      for (let j = i + 1; j < Math.min(i + 9, item.length); j += 1) {
        if (AUX_WORDS.has(item[j].base) || isVerbForm(item[j].base)) return 'clause';
      }
      return 'np';
    }
    if (isVerbForm(word)) return 'vp';
    if (PREPOSITIONS.has(word)) return 'pp';
    if (item[i + 1] && isVerbForm(item[i + 1].base)) return 'clause';
    return 'np';
  }

  // ", and/or ..." 로 끝나는 마지막 항목이 나열 항목인지 절인지 가른다(규칙 3·4).
  function terminatorCategory(item) {
    let i = 0;
    while (i < item.length && (item[i].base === 'and' || item[i].base === 'or')) i += 1;
    while (i < item.length && ADVERBS.has(item[i].base)) i += 1;
    if (i >= item.length) return 'empty';
    const word = item[i].base;
    const next = item[i + 1] ? item[i + 1].base : '';
    if (SUBJECT_WORDS.has(word) || AUX_WORDS.has(word) || CLAUSE_MARKERS.has(word) || RELATIVE_WORDS.has(word)) return 'clause';
    if (DETERMINERS.has(word)) {
      for (let j = i + 1; j < Math.min(i + 9, item.length); j += 1) {
        if (AUX_WORDS.has(item[j].base) || isVerbForm(item[j].base)) return 'clause';
      }
      return 'np';
    }
    if (isVerbForm(word)) {
      if (!next) return 'clause';
      if (DETERMINERS.has(next) || SUBJECT_WORDS.has(next)) return 'clause';
      return 'vp';
    }
    if (next && isVerbForm(next)) return 'clause';
    return 'np';
  }

  // 한 문장을 끊어 읽기(/)·억양(↗ → ↘) 표시가 붙은 문자열로 만든다.
  function chunkedSentence(source) {
    const tokens = tokenize(source);
    const words = [];
    const wordPos = new Map();
    tokens.forEach((token, index) => {
      if (!token.isWord) return;
      wordPos.set(index, words.length);
      words.push({
        raw: token.text,
        lower: token.text.toLowerCase(),
        base: baseWord(token.text.toLowerCase()),
        tokenIndex: index,
      });
    });

    const total = words.length;
    const structures = [];
    const marks = new Map();
    if (!total) return { text: source.trim(), structures };

    const gapIsSpace = (tokenIndex) => {
      if (tokenIndex <= 0) return false;
      return source.slice(tokens[tokenIndex - 1].end, tokens[tokenIndex].start) === ' ';
    };

    const PRONOUN_OBJECTS = new Set(['me', 'him', 'her', 'us', 'them', 'it', 'you']);
    const isNounish = (word) => !AUX_WORDS.has(word.base)
      && !isVerbForm(word.base)
      && !PREPOSITIONS.has(word.base)
      && !ADVERBS.has(word.base)
      && !CONJ_WORDS.has(word.base)
      && !RELATIVE_WORDS.has(word.base)
      && !CLAUSE_MARKERS.has(word.base)
      && word.base !== 'to';

    // 2) 쉼표는 말이 이어진다는 뜻으로 살짝 올린다.
    const commaTokens = [];
    tokens.forEach((token, index) => { if (token.text === ',') commaTokens.push(index); });
    const items = [];
    let cursorToken = -1;
    for (const commaToken of commaTokens) {
      items.push(words.filter((word) => word.tokenIndex > cursorToken && word.tokenIndex < commaToken));
      cursorToken = commaToken;
    }
    items.push(words.filter((word) => word.tokenIndex > cursorToken));

    const pairMatch = [];
    for (let k = 0; k + 1 < items.length; k += 1) {
      const left = itemCategory(items[k]);
      const right = itemCategory(items[k + 1]);
      pairMatch.push(left !== 'empty' && left === right && (left === 'np' || left === 'vp'));
    }
    const startsWithConj = (item) => Boolean(item && item.length && (item[0].base === 'and' || item[0].base === 'or'));
    const listComma = commaTokens.map((_, k) => {
      if (pairMatch[k]) return true;
      // 마지막 항목이 ", and/or ..." 로 이어지면 나열로 본다(절이면 제외).
      if (startsWithConj(items[k + 1]) && items[k] && items[k].length && items[k].length <= 8) {
        const category = terminatorCategory(items[k + 1]);
        if (category === 'np' || category === 'vp') return true;
      }
      // 짧은 항목이 이어지면 앞 쉼표도 나열로 본다: "A, B, and C"
      return Boolean(pairMatch[k + 1]) && items[k + 1].length > 0 && items[k + 1].length <= 4;
    });
    // 짧은 항목이 이어지는 한 앞쪽 쉼표도 나열로 확장한다.
    for (let k = commaTokens.length - 2; k >= 0; k -= 1) {
      if (listComma[k] || !listComma[k + 1]) continue;
      const item = items[k + 1];
      if (!item || !item.length || item.length > 6) continue;
      const category = itemCategory(item);
      if (category === 'np' || category === 'vp') listComma[k] = true;
    }

    let listZone = -1;
    commaTokens.forEach((commaToken, k) => {
      marks.set(commaToken, '↗');
      if (listComma[k] && listZone < 0) {
        const after = items[k + 1];
        if (after && after.length) listZone = wordPos.get(after[0].tokenIndex);
      }
    });

    // 3) 나열 마지막 항목이 문장 중간에서 이어지면 그 항목 끝에 → 를 붙인다.
    let lastListComma = -1;
    let listContinues = false;
    listComma.forEach((flag, k) => { if (flag) lastListComma = k; });
    if (lastListComma >= 0) {
      const tail = items[lastListComma + 1];
      if (tail && tail.length > 1 && (tail[0].base === 'and' || tail[0].base === 'or') && terminatorCategory(tail) === 'np') {
        let endAt = 0;
        for (let t = 1; t < tail.length; t += 1) {
          if (!DETERMINERS.has(tail[t].base) && !isNounish(tail[t])) break;
          endAt = t;
        }
        const nextWord = tail[endAt + 1];
        const boundary = nextWord
          && (PREPOSITIONS.has(nextWord.base) || RELATIVE_WORDS.has(nextWord.base) || CLAUSE_MARKERS.has(nextWord.base));
        const endWord = tail[endAt];
        if (endAt > 0 && boundary && endWord && !marks.has(endWord.tokenIndex)) {
          marks.set(endWord.tokenIndex, '→');
          listContinues = true;
        }
      }
    }

    // 문장 부호(;)는 유지(→)하고 그 뒤에서 한 번 쉰다.
    const candidates = [];
    tokens.forEach((token, index) => {
      if (token.text !== ';') return;
      marks.set(index, '→');
      const nextPos = wordPos.get(index + 1);
      if (Number.isInteger(nextPos)) candidates.push({ pos: nextPos, priority: 0, kind: 'comma' });
    });

    // 4~6) 접속사·관계사·to부정사에서 끊는다.
    for (let i = 1; i < total; i += 1) {
      const word = words[i];
      // "or when ..."처럼 접속사 뒤에 접속부사가 오면 접속사 앞에서 끊는다.
      const anchor = (i > 1 && CONJ_WORDS.has(words[i - 1].base)) ? i - 1 : i;
      if (CONJ_WORDS.has(word.base)) {
        // 책 규칙: 두 절(주어+동사)을 나눌 때만. 동사구·부정사·동명사 병렬은 끊지 않는다.
        if (hasVerbBefore(words, i) && isClauseStart(words, i + 1)) {
          if (hasExplicitSubject(words, i + 1)) {
            candidates.push({ pos: i, priority: 3, kind: 'clause' });
          } else if (!structures.includes('verbphrase')) {
            structures.push('verbphrase');
          }
        }
      } else if (RELATIVE_WORDS.has(word.base)) {
        if (relativeFollows(words, i, total)) {
          const kind = word.base === 'that' ? thatClauseKind(words, i) : 'relative';
          candidates.push({ pos: anchor, priority: 2, kind });
        }
      } else if (CLAUSE_MARKERS.has(word.base)) {
        if (isClauseStart(words, i + 1)) candidates.push({ pos: anchor, priority: 3, kind: 'clause' });
      } else if (word.base === 'to' && i + 1 < total) {
        const next = words[i + 1];
        const prev = words[i - 1].base;
        const isNoun = NOUN_AFTER_TO.has(next.base)
          || DETERMINERS.has(next.base)
          || /^\d/.test(next.raw)
          || (/^[A-Z]/.test(next.raw) && next.raw !== next.raw.toLowerCase());
        // like to·have to처럼 붙어 다니는 짝은 끊지 않는다.
        if (!isNoun && !isFixedPair(prev, 'to') && isVerbForm(next.base)) {
          candidates.push({ pos: i, priority: 4, kind: 'infinitive' });
        }
      }
      if (PREPOSITIONS.has(word.base)) candidates.push({ pos: i, priority: 9, kind: 'prep' });
    }

    // 1) 쉼표: 나열이 아니면 그 뒤에서 쉰다. 뒤에 읽을 말이 충분할 때만.
    commaTokens.forEach((commaToken, k) => {
      if (listComma[k]) return;
      const nextPos = wordPos.get(commaToken + 1);
      if (!Number.isInteger(nextPos)) return;
      if (total - nextPos < 4) return;
      candidates.push({ pos: nextPos, priority: 1, kind: 'comma' });
    });

    const accepted = [];
    const boundaryBefore = (pos) => {
      let max = 0;
      for (const value of accepted) if (value < pos && value > max) max = value;
      return max;
    };
    const boundaryAfter = (pos) => {
      let min = total;
      for (const value of accepted) if (value > pos && value < min) min = value;
      return min;
    };
    const place = (pos, kind) => {
      if (pos <= 0 || pos >= total) return false;
      if (!gapIsSpace(words[pos].tokenIndex)) return false;
      if (listZone >= 0 && pos >= listZone) return false;
      if (CONJ_WORDS.has(words[pos - 1].base)) return false;
      const minLeft = kind === 'infinitive' ? 4 : 3;
      if (pos - boundaryBefore(pos) < minLeft) return false;
      if (boundaryAfter(pos) - pos < 3) return false;
      accepted.push(pos);
      accepted.sort((a, b) => a - b);
      if (!structures.includes(kind)) structures.push(kind);
      return true;
    };

    candidates
      .filter((candidate) => candidate.priority < 9)
      .sort((a, b) => a.priority - b.priority || a.pos - b.pos)
      .forEach((candidate) => place(candidate.pos, candidate.kind));

    // 7) 전치사 끊기는 마지막 수단: 다른 규칙으로 못 끊은 긴 덩어리에서만.
    for (let pass = 0; pass < 2; pass += 1) {
      const split = accepted.slice();
      const bounds = [0, ...split, total];
      let changed = false;
      for (let b = 0; b + 1 < bounds.length; b += 1) {
        const from = bounds[b];
        const to = bounds[b + 1];
        if (to - from < 10) continue;
        const midpoint = (from + to) / 2;
        let best = -1;
        for (let i = from + 3; i <= to - 3; i += 1) {
          if (!PREPOSITIONS.has(words[i].base)) continue;
          if (listZone >= 0 && i >= listZone) continue;
          if (isFixedPair(words[i - 1].base, words[i].base)) continue;
          if (words[i + 1] && isFixedPair(words[i].base, words[i + 1].base)) continue;
          if (PRONOUN_OBJECTS.has(words[i - 1].base) || words[i - 1].base === 'than') continue;
          if (!gapIsSpace(words[i].tokenIndex)) continue;
          // 전치사구 뒤에 정동사가 오면 그 전치사구는 앞 명사를 수식한다 → 끊지 않는다.
          let verbAt = -1;
          let coordinated = false;
          for (let j = i + 1; j <= Math.min(i + 8, to - 1); j += 1) {
            if (CONJ_WORDS.has(words[j].base)) { coordinated = true; break; }
            if (RELATIVE_WORDS.has(words[j].base)) break;
            // 문장 첫 단어가 아닌 대문자 단어(고유명사)는 -ed 정동사로 보지 않는다.
            if (/^[A-Z]/.test(words[j].raw)) continue;
            if (isFiniteForm(words[j].base) && !(j > 0 && words[j - 1].base === 'to')) { verbAt = j; break; }
          }
          if (verbAt > i + 1) continue;
          // 전치사구가 and·or로 이어지는 병렬 속에 있으면 끊지 않는다.
          if (coordinated) continue;
          // 전치사구가 다른 명사구 속에 끼어 있으면(명사 3개 연속) 끊지 않는다.
          let nounRun = 0;
          for (let j = i + 1; j < to && nounRun < 3; j += 1) {
            if (DETERMINERS.has(words[j].base)) continue;
            if (!isNounish(words[j])) break;
            nounRun += 1;
          }
          if (nounRun >= 3 && i + 4 < to) continue;
          if (best < 0 || Math.abs(i - midpoint) < Math.abs(best - midpoint)) best = i;
        }
        if (best > 0) {
          accepted.push(best);
          accepted.sort((x, y) => x - y);
          if (!structures.includes('prep')) structures.push('prep');
          changed = true;
        }
      }
      if (!changed) break;
    }

    // 3) 나열: 나열 안에서는 /로 끊지 않고 마지막 항목이 이어지면 → 로 둔다.
    if (listComma.some(Boolean)) {
      const kind = listContinues ? 'listContinue' : 'list';
      if (!structures.includes(kind)) structures.push(kind);
    }

    const breaks = new Set(accepted.map((pos) => words[pos].tokenIndex));
    let text = '';
    let previousEnd = 0;
    tokens.forEach((token, index) => {
      const gap = source.slice(previousEnd, token.start);
      const isBreak = breaks.has(index) && gap === ' ';
      text += isBreak ? ' / ' : gap;
      text += token.text;
      previousEnd = token.end;
      const mark = marks.get(index);
      if (mark) text += mark;
    });
    text += source.slice(previousEnd);

    return { text: text.trim(), structures };
  }

  function buildFlow(sentence) {
    const en = sentence && typeof sentence.en === 'string' ? sentence.en.trim() : '';
    if (!en) return null;

    const id = sentence && typeof sentence.id === 'string' ? sentence.id : '';
    const isPassage = !id;
    const partBadge = isPassage ? 'Part 1 (지문 낭독)' : PART_BADGES[id.split('-')[0].toLowerCase()] || 'TS 억양·호흡';
    const note = isPassage
      ? '끊는 위치(/)는 채점 항목이 아니에요. 단어마다 끊지만 않으면 숨이 찰 때 쉬어도 괜찮아요. Part 1 낭독의 평서문 끝은 내려(↘) 맺어요.'
      : '끊는 위치(/)는 채점 항목이 아니에요. 단어마다 끊지만 말고 자연스럽게 이어요. 대화하듯 말하는 답변은 문장 끝을 꼭 내리지 않아도 돼요.';

    const sentences = splitSentences(en);
    const structures = [];
    let chunked = '';
    sentences.forEach((part, index) => {
      const result = chunkedSentence(part.text);
      if (index > 0) {
        const gap = sentences[index - 1].gap;
        chunked += gap === ' ' ? ' / ' : gap;
      }
      chunked += result.text + (isPassage ? endArrow(part.text) : '');
      result.structures.forEach((kind) => {
        if (!structures.includes(kind)) structures.push(kind);
      });
    });

    // 11) 실제로 끊은 구조에 맞는 팁만 보여 준다.
    const first = TIP_ORDER.find((kind) => structures.includes(kind));
    const tip = first ? TIP_TEXT[first] : DEFAULT_TIP;

    return { partBadge, chunked, tip, note };
  }

  const PART_BADGES = {
    p2: 'Part 2 (Q3–4 · 30초 사진 묘사)',
    p3: 'Part 3 (Q5–7 · 15–30초 응답)',
    p4: 'Part 4 (Q8–10 · 표 보고 답하기)',
    p5: 'Part 5 (Q11 · 60초 의견)',
  };

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

  function pickSentencePoints(content, links, tokens, maxPoints) {
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

    return picked;
  }

  // Part 1 지문: 사전 항목 → 태그 다양성 → 나머지 → 규칙 기반 후보 순으로 5개를 채운다.
  function pickPassagePoints(content, links, tokens, limit) {
    const chosen = [];
    const used = new Set();
    const add = (item) => {
      if (!item || chosen.length >= limit) return;
      const key = item.word.toLowerCase();
      if (used.has(key)) return;
      used.add(key);
      chosen.push(item);
    };

    const byTag = new Map();
    for (const item of content) if (!byTag.has(item.tag)) byTag.set(item.tag, item);
    for (const item of byTag.values()) add(item);
    for (const item of content) add(item);
    for (const link of links) add(link);

    if (chosen.length < limit) {
      const candidates = tokens
        .map((word, index) => ({ word, index, tag: ruleTag(word.toLowerCase()) }))
        .filter((item) => item.tag && !used.has(item.word.toLowerCase()))
        .sort((a, b) => b.word.length - a.word.length || a.index - b.index);
      for (const item of candidates) {
        add({ word: item.word, tag: item.tag, ipa: approxIpa(item.word), note: '', ko: '', index: item.index });
      }
    }

    return chosen;
  }

  function build(sentence) {
    const en = sentence && typeof sentence.en === 'string' ? sentence.en : '';
    if (!en) return { points: [], flow: null };

    const pron = sentence && typeof sentence.pron === 'string' ? sentence.pron : '';
    // Part 1 지문은 id 없이 { en }만 넘어온다(js/mock.js:1442). 지문만 발음 포인트 5개.
    const isPassage = !(sentence && typeof sentence.id === 'string' && sentence.id);
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

    const maxPoints = isPassage ? 5 : (tokens.length >= 12 ? 3 : 2);
    const picked = isPassage
      ? pickPassagePoints(content, links, tokens, maxPoints)
      : pickSentencePoints(content, links, tokens, maxPoints);

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

  const MARKS_LEGEND = '/ 끊어 읽기 · ↗ 올림 · → 유지 · ↘ 내림';

  window.PRON_GUIDE = { build, TAGS, MARKS_LEGEND };
})();
