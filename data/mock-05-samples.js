/* 2025 하반기 실제 수험자 답변 — mock-05
   답변·판정·지적 글자는 capture/2025h2/mock-05-samples.draft.json에서 바꾸지 않고 옮겼다.
   작업용 필드(segment, sourceFrames, videoId, examId, wordCount, at)는 넣지 않는다. */
window.MOCK_SAMPLES = window.MOCK_SAMPLES || {};
window.MOCK_SAMPLES['mock-05'] = {
  "note": "2025 하반기 정기시험 실제 수험자 답변과 해설 요약",
  "questions": {
    "1": [
      {
        "level": "IH",
        "itemScore": "(Medium)",
        "text": "Welcome to today’s meeting of the board of directors for Gussman Incorporated. Our management team will begin by giving project updates, which will take about forty-five minutes. After that, I’ll introduce our new employees, propose budget adjustments, and explain future work. At noon, we will take a break for lunch.",
        "textSource": "screen",
        "captionSuspect": [
          "자막 'Gosman' — 화면은 'Gussman'",
          "자막 'gument incorporated' — 화면은 'Incorporated'",
          "자막 'for Gussman' 구간이 'for Gosman'으로 표기"
        ],
        "points": [
          {
            "category": "pron",
            "quote": "meeting",
            "note": "모음이 두 개인 단어는 길게 발음해야 한다고 지적하며 'meeting'을 예로 듦",
            "source": "해설"
          },
          {
            "category": "pron",
            "quote": "directors",
            "note": "'directors'를 미국식으로 발음하라고 지적(다이렉터 아님)",
            "source": "해설"
          },
          {
            "category": "inton",
            "quote": "project updates",
            "note": "'project'에 강세를 진하게, 'updates'는 up에 강세",
            "source": "해설"
          },
          {
            "category": "pron",
            "quote": "I will introduce / it will",
            "note": "'I will introduce'를 'it will'로 읽은 오독을 ETS 코멘트로 소개",
            "source": "ETS"
          },
          {
            "category": "pron",
            "quote": "employees",
            "note": "'employees'의 강세 위치와 모음 길이를 ETS가 표시했다고 설명",
            "source": "ETS"
          }
        ]
      },
      {
        "level": "AL",
        "itemScore": "(High)",
        "text": "Welcome to today’s meeting of the board of directors for Gussman Incorporated. Our management team will begin by giving project updates, which will take about forty-five minutes. After that, I’ll introduce our new employees, propose budget adjustments, and explain future work. At noon, we will take a break for lunch.",
        "textSource": "screen",
        "captionSuspect": [
          "자막이 같은 지문을 'radi', 'spitting up'처럼 오인한 구간이 있어 화면 글자를 우선했다"
        ],
        "points": [
          {
            "category": "inton",
            "quote": "project updates",
            "note": "'project', 'updates'의 강세가 앞 답변보다 불명확했다고 지적",
            "source": "해설"
          },
          {
            "category": "cohesion",
            "quote": "highly intelligible",
            "note": "강세 실수에도 하이가 나온 이유는 끊기지 않는 전체 플로우라고 설명, ETS 코멘트는 'highly intelligible'",
            "source": "ETS"
          },
          {
            "category": "other",
            "quote": "flow",
            "note": "강세 오류보다 전체 플로우가 점수에 크게 작용한다는 결론",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AM",
        "itemScore": "(High)",
        "text": "Welcome to today’s meeting of the board of directors for Gussman Incorporated. Our management team will begin by giving project updates, which will take about forty-five minutes. After that, I’ll introduce our new employees, propose budget adjustments, and explain future work. At noon, we will take a break for lunch.",
        "textSource": "screen",
        "captionSuspect": [
          "자막 'for gment incorporated' — 화면은 'Gussman Incorporated'"
        ],
        "points": [
          {
            "category": "inton",
            "quote": "Welcome to today’s meeting of the board of directors for Gussman Incorporated.",
            "note": "첫 문장의 인토네이션과 강세가 매우 좋다고 칭찬",
            "source": "해설"
          },
          {
            "category": "other",
            "quote": "highly intelligible throughout",
            "note": "ETS 코멘트는 전반적으로 'highly intelligible throughout', 사실상 만점이라는 설명",
            "source": "ETS"
          },
          {
            "category": "other",
            "quote": "flow",
            "note": "강세와 플로우가 완벽에 가까워 따라 읽기 연습을 권장",
            "source": "해설"
          }
        ]
      }
    ],
    "2": [
      {
        "level": "IH",
        "itemScore": "(Medium)",
        "text": "Thank you for listening to this traffic report on Channel Seventeen Radio. If you were planning to drive downtown today, you may want to reconsider. There are longer delays than usual due to an event at the convention center. Instead, consider speeding up your commute to the city center by taking the bus, bicycling, or riding the train.",
        "textSource": "screen",
        "captionSuspect": [
          "자막 'traffic report to on channel 17 radio' — 화면은 'on Channel Seventeen Radio'",
          "자막 'spitting up your com' — 화면은 'speeding up your commute'",
          "자막 'There are delays than usual' — 화면은 'There are longer delays than usual'"
        ],
        "points": [
          {
            "category": "pron",
            "quote": "report",
            "note": "'report'의 강세는 뒤에 온다고 지적",
            "source": "해설"
          },
          {
            "category": "cohesion",
            "quote": "self-correction",
            "note": "ETS 코멘트에 self-correction이 있었다고 언급",
            "source": "ETS"
          },
          {
            "category": "inton",
            "quote": "commute to the city center",
            "note": "'commute to the city center'를 중간에서 끊어 읽었다고 지적",
            "source": "ETS"
          },
          {
            "category": "other",
            "quote": "to the city center by taking",
            "note": "끊어 읽기는 전치사 앞에서 해야 한다는 원칙 설명",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AL",
        "itemScore": "(Medium)",
        "text": "Thank you for listening to this traffic report on Channel Seventeen Radio. If you were planning to drive downtown today, you may want to reconsider. There are longer delays than usual due to an event at the convention center. Instead, consider speeding up your commute to the city center by taking the bus, bicycling, or riding the train.",
        "textSource": "screen",
        "captionSuspect": [
          "자막 'drive down today' — 화면은 'drive downtown today'",
          "자막 'spitted commute' — 화면은 'speeding up your commute'",
          "자막 'taking the busing' — 화면은 'taking the bus'"
        ],
        "points": [
          {
            "category": "inton",
            "quote": "Thank you for listening to this traffic report",
            "note": "'Thank you for listening' 끝을 내려 문장이 끝난 것처럼 들렸다고 ETS 인토네이션 지적을 소개",
            "source": "ETS"
          },
          {
            "category": "inton",
            "quote": "if you were planning to drive downtown today",
            "note": "'if you were planning to drive downtown today'가 chop처럼 끊겼다고 지적",
            "source": "ETS"
          },
          {
            "category": "other",
            "quote": "flow",
            "note": "단어 강세와 길이 차이가 없어 플로우가 단조롭다고 설명",
            "source": "해설"
          },
          {
            "category": "pron",
            "quote": "usually",
            "note": "'usually'를 'usual'처럼 짧게 발음했다고 지적",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AM",
        "itemScore": "(High)",
        "text": "Thank you for listening to this traffic report on Channel Seventeen Radio. If you were planning to drive downtown today, you may want to reconsider. There are longer delays than usual due to an event at the convention center. Instead, consider speeding up your commute to the city center by taking the bus, bicycling, or riding the train.",
        "textSource": "screen",
        "captionSuspect": [
          "자막 'this traffic.' — 문장이 잘려 'report'가 빠짐"
        ],
        "points": [
          {
            "category": "pron",
            "quote": "highly intelligible throughout",
            "note": "ETS 코멘트는 'highly intelligible throughout', 지적이 없다고 설명",
            "source": "ETS"
          },
          {
            "category": "other",
            "quote": "Thank you for listening to this traffic",
            "note": "첫 문장부터 유창하게 이어져 지적할 부분이 없다고 칭찬",
            "source": "해설"
          }
        ]
      }
    ],
    "3": [
      {
        "level": "IH",
        "itemScore": "(High)",
        "text": "I think this picture was taken in the hotel fronts. In front of the, uh, middle of the picture a woman wearing a red T-shirts is talking on a phone. Next to her, a man wearing a glasses is is standing next to her, while holding his bag. On the right side of the picture, a woman with curly hair is also talking on a phone.",
        "textSource": "screen",
        "captionSuspect": [
          "자막 'on a pond' — 화면은 'on a phone'",
          "자막 'holding his back' — 화면은 'holding his bag'",
          "자막 'a man wearing a glasses standing' — 화면은 'is is standing'(반복 보존)"
        ],
        "points": [
          {
            "category": "pron",
            "quote": "phone",
            "note": "'phone'의 오바음을 길게 유지해야 한다고 지적(fun 아님), ETS가 특별히 집었다고 설명",
            "source": "ETS"
          },
          {
            "category": "grammar",
            "quote": "a glasses",
            "note": "'a glasses'의 단수/복수 오류를 ETS가 지적했다고 설명",
            "source": "ETS"
          },
          {
            "category": "content",
            "quote": "in the hotel fronts",
            "note": "'hotel fronts'처럼 장소를 구체적으로 밝힌 점을 칭찬",
            "source": "해설"
          },
          {
            "category": "pron",
            "quote": "holding",
            "note": "'holding'의 오바음 유지 연습 권장",
            "source": "해설"
          },
          {
            "category": "pron",
            "quote": "woman",
            "note": "'woman'을 '우먼'이 아니라 /wʊmən/으로 발음",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AL",
        "itemScore": "(High)",
        "text": "In this picture there are three people who are doing their things at the front desk. And on the left side there is a man who is holding a backpack and books. And in the middle side there is a woman who has a curly hair is talking talking on the phone. And also on the right side there is a woman who is also calling as well. Overall, it seems...",
        "textSource": "screen",
        "captionSuspect": [
          "이 답변 구간의 자막이 거의 남지 않았다(자막 공백). 화면 글자만 사용했다."
        ],
        "points": [
          {
            "category": "vocab",
            "quote": "doing their things at the front desk",
            "note": "'three people who are doing their things at the front desk'의 호텔 어휘를 칭찬",
            "source": "해설"
          },
          {
            "category": "cohesion",
            "quote": "in the middle side",
            "note": "'in the middle side' — middle에는 side를 쓰지 않는다고 ETS가 지적",
            "source": "ETS"
          },
          {
            "category": "grammar",
            "quote": "has a curly hair",
            "note": "'who has a curly hair' — hair는 불가산이라 a를 붙이지 않는다고 ETS가 지적",
            "source": "ETS"
          },
          {
            "category": "grammar",
            "quote": "is talking",
            "note": "'who has a curly hair is talking'에서 동사 is가 중복된다고 설명",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AM",
        "itemScore": "(High)",
        "text": "I think this picture was taken at a hotel. On the left side of the picture a man wearing a navy [gardigan] is holding a book with his left hand and holding a bag on his right, with his right hand. In the middle of the picture, a woman with long curly hair is making a phone call. On the right side of picture a woman with a white [gardigan] is also making a phone call. I think they are checking in.",
        "textSource": "screen",
        "captionSuspect": [
          "자막 'guardan' — 화면은 '[gardigan]'",
          "자막 'longly hair' — 화면은 'long curly hair'"
        ],
        "points": [
          {
            "category": "pron",
            "quote": "[gardigan]",
            "note": "'cardigan'을 화면에 '[gardigan]'으로 적었고 발음도 가디건/카디건 문제라고 ETS가 표시",
            "source": "ETS"
          },
          {
            "category": "other",
            "quote": "flow",
            "note": "플로우와 자신감이 좋아 사소한 발음 실수가 감점으로 이어지지 않았다고 설명",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "on his right with his right hand",
            "note": "'on his right with his right hand'로 스스로 고친 자기수정을 칭찬",
            "source": "해설"
          },
          {
            "category": "content",
            "quote": "I think they are checking in",
            "note": "마무리 'I think they are checking in'으로 정황을 요약한 점을 칭찬",
            "source": "해설"
          }
        ]
      }
    ],
    "4": [
      {
        "level": "IH",
        "itemScore": "(High)",
        "text": "I think this picture was taken in a workplace. In the middle of the picture, two woman are cop- copy something. Umm, a woman wearing a black T-shirts is holding a yellow envelope. On the left side of the picture, I can see a trash can and copy machine. In the background of of the picture I can see some room for...",
        "textSource": "screen",
        "captionSuspect": [
          "자막 'work place' — 화면은 'workplace'",
          "자막 'two woman are copy something' — 화면은 'cop- copy something'(자기수정 보존)",
          "자막에 'yellow envelope'의 envelope가 빠짐"
        ],
        "points": [
          {
            "category": "vocab",
            "quote": "in a workplace",
            "note": "'in a workplace'보다 office/coffee room처럼 구체적인 장소가 낫다고 제안",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "two woman are copy",
            "note": "'two woman are cop- copy'에서 복수 women과 be+ing를 지적",
            "source": "해설"
          },
          {
            "category": "vocab",
            "quote": "copy something",
            "note": "눈에 보이는 것을 'something'으로 뭉뚱그리지 말고 papers/documents로 말하라고 지적",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "a black T-shirts",
            "note": "'a black T-shirts' 단수/복수를 ETS가 지적했다고 설명",
            "source": "ETS"
          },
          {
            "category": "pron",
            "quote": "copy machine",
            "note": "'copy machine'이 'coffee machine'처럼 들린다고 지적",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AL",
        "itemScore": "(High)",
        "text": "In this picture there are two people who are doing their own work at the office. On the right side, there is a woman who is putting papers, uh, who is bending her bag and putting some papers into the copy machine. And in the middle of the picture I can see a woman who is put a paper into a yellow envelope. Overall, it seems very busy.",
        "textSource": "screen",
        "captionSuspect": [
          "화면 'bending her bag' vs 자막 'who is her back' — 실제 발음은 back이었을 것으로 해설이 추정, 화면 글자 유지",
          "자막 'into yellow envelopes' — 화면은 'a yellow envelope'"
        ],
        "points": [
          {
            "category": "pron",
            "quote": "bending her bag",
            "note": "'bending her bag' — 실제로는 back이었을 가능성이 높고 bag의 끝소리가 부드러워 섞였다고 ETS가 지적",
            "source": "ETS"
          },
          {
            "category": "grammar",
            "quote": "who is putting papers, uh, who is bending",
            "note": "'who is putting papers' 뒤에 'who is'가 다시 들어간 be+ing 중복을 지적",
            "source": "해설"
          },
          {
            "category": "vocab",
            "quote": "people",
            "note": "women이 불안하면 people로 대체해도 된다고 조언",
            "source": "해설"
          },
          {
            "category": "pron",
            "quote": "overall",
            "note": "'overall'을 'over all'로 나누지 말고 붙여 발음",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "it seems very busy",
            "note": "'seems like very busy'가 아니라 seems + 형용사라고 설명",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AM",
        "itemScore": "(High)",
        "text": "I think this picture was taken in an office. In the middle of the picture, two women with blond hair is working beside a printer. The woman on the right side is refilling the sheets for the printer, and the woman on the left side is putting the papers into a separate bag. It looks like they are working on some documents.",
        "textSource": "screen",
        "captionSuspect": [
          "이 답변 구간의 자막이 'onillingets' 등으로 심하게 깨져 화면 글자만 사용했다."
        ],
        "points": [
          {
            "category": "grammar",
            "quote": "two women with blond hair is working",
            "note": "'two women with blond hair is working' — 복수 주어에 be동사가 is로 일치하지 않는다고 ETS가 지적",
            "source": "ETS"
          },
          {
            "category": "vocab",
            "quote": "printer",
            "note": "'printer'보다 copy machine/copier가 이 사진의 기기에 더 정확하다고 지적",
            "source": "해설"
          },
          {
            "category": "vocab",
            "quote": "working on",
            "note": "'working on'보다 copying some documents처럼 더 구체적인 어휘를 권장",
            "source": "해설"
          }
        ]
      }
    ],
    "5": [
      {
        "level": "IH",
        "itemScore": "(High)",
        "text": "The last time I gave someone a gift was a month ago, and I give some, I gave some candles for my friends as a birthday gift.",
        "textSource": "screen",
        "captionSuspect": [],
        "points": [
          {
            "category": "content",
            "quote": "The last time I gave someone a gift was a month ago.",
            "note": "언제인지 묻는 첫 질문에 정확히 답했다.",
            "source": "해설"
          },
          {
            "category": "cohesion",
            "quote": "I give some, I gave some",
            "note": "실수한 뒤 스스로 고쳐 말한 것을 강하게 긍정 평가. I mean을 쓰면 더 자연스럽다.",
            "source": "해설"
          },
          {
            "category": "content",
            "quote": "I gave some candles for my friends as a birthday gift.",
            "note": "왜 줬는지(why)에 대한 답이 명확하지 않다. because로 이유를 붙이는 편이 낫다.",
            "source": "해설"
          },
          {
            "category": "other",
            "quote": "ETS 측에서 이거에 대해서 문제를 삼거나 그러진 않았어요",
            "note": "ETS 측이 이 답변을 문제 삼지는 않았다고 강사가 언급.",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AL",
        "itemScore": "(High)",
        "text": "The last time I gave someone a gift was last month, and I gave it for her birthday gift.",
        "textSource": "screen",
        "captionSuspect": [],
        "points": [
          {
            "category": "content",
            "quote": "The last time I gave someone a gift was last month",
            "note": "IH 답변과 큰 차이가 없고, 질문에 모두 답했다.",
            "source": "해설"
          },
          {
            "category": "length",
            "quote": "단지 이분이 한 6초 정도 남으셨어요",
            "note": "15초 중 약 6초를 남겼다. 한 문장이라도 더 붙이는 습관이 필요하다.",
            "source": "해설"
          },
          {
            "category": "other",
            "quote": "I gave it for her birthday gift",
            "note": "분량을 채우는 방법으로 느낌 문장, 예시, 육하원칙(어디서 샀는지) 추가를 제안.",
            "source": "해설"
          },
          {
            "category": "content",
            "quote": "무엇을 줬는지는 안 물어봤기 때문에",
            "note": "무엇을 줬는지 묻지 않았지만 디테일을 덧붙이면 답변이 좋아진다.",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AM",
        "itemScore": "(High)",
        "text": "The last time I gave someone a gift was about a week ago. And I gave the gift for a friend because it was his birthday. And I gave him a perfume.",
        "textSource": "screen",
        "captionSuspect": [
          "And I gave him a perfume.",
          "And I gave the gift to a friend / for a friend"
        ],
        "points": [
          {
            "category": "content",
            "quote": "And I gave him a perfume.",
            "note": "묻지 않은 디테일(선물 품목)을 스스로 넣은 점을 좋게 평가.",
            "source": "해설"
          },
          {
            "category": "vocab",
            "quote": "for a friend",
            "note": "경험을 말할 때는 a friend보다 my friend로 특정해야 자연스럽다. 화면에서도 이 부분에 빨간 밑줄이 그어져 있다.",
            "source": "해설"
          },
          {
            "category": "other",
            "quote": "ETS 커멘트 측에서도 뭐 아 그냥 굿네요 정도입니다",
            "note": "ETS 코멘트는 'good' 수준이었다고 강사가 전한다.",
            "source": "ETS"
          }
        ]
      }
    ],
    "6": [
      {
        "level": "IH",
        "itemScore": "(High)",
        "text": "I usually buy gifts on online. It's because it's more cheaper than buy it, it's more cheaper than going to a store to buy gifts.",
        "textSource": "screen",
        "captionSuspect": [
          "I usually buy gifts on online."
        ],
        "points": [
          {
            "category": "grammar",
            "quote": "more cheaper",
            "note": "비교급을 겹쳐 쓴 오류. 채점관이 듣자마자 표시하는 부분이라고 설명.",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "on online",
            "note": "online은 부사라 전치사 on을 붙이지 않는다. on the internet과 구분.",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "more cheaper than going to a store to buy gifts",
            "note": "비교 대상(going to a store)을 넣은 점은 좋았다.",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AL",
        "itemScore": "(High)",
        "text": "Um, I usually buy gifts online because actually, uh, it's cheaper online rather than buying it go to the store.",
        "textSource": "screen",
        "captionSuspect": [],
        "points": [
          {
            "category": "grammar",
            "quote": "rather than buying it go to the store",
            "note": "비교급 없이 rather than을 쓰면 어색하다. 비교급이면 than을 써야 한다는 지적.",
            "source": "ETS"
          },
          {
            "category": "grammar",
            "quote": "rather than buying it go to the store",
            "note": "rather than 뒤에는 buying이 아니라 to give/to go처럼 병렬 구조가 맞다.",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AM",
        "itemScore": "(High)",
        "text": "I usually buy gifts online because it is more convenient. And I can see the vari-, there are many varieties of gifts that I can choose from.",
        "textSource": "screen",
        "captionSuspect": [
          "And I can see the vari-, there are many varieties of gifts that I can choose from."
        ],
        "points": [
          {
            "category": "vocab",
            "quote": "convenient",
            "note": "convenient를 써서 이유를 한 단어로 압축했다.",
            "source": "해설"
          },
          {
            "category": "vocab",
            "quote": "that I can choose from",
            "note": "choose from(많은 것 중에서 고르다)을 정확히 썼다.",
            "source": "해설"
          }
        ]
      }
    ],
    "7": [
      {
        "level": "IH",
        "itemScore": "(High)",
        "text": "I I prefer to give some candy. It's because todays, uh these days a book a cost of a book is too expensive. I can't afford to buy some expensive things, expensive books. It's because I'm a students, so I my budget it too tight.",
        "textSource": "screen",
        "captionSuspect": [
          "I I prefer to give some candy."
        ],
        "points": [
          {
            "category": "content",
            "quote": "I can't afford to buy some expensive things, expensive books.",
            "note": "30초 답변을 끝까지 채웠고, 마지막 문항 답변으로는 잘했다고 평가.",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "a cost of a book",
            "note": "가격을 말할 때는 a cost가 아니라 the cost가 맞다.",
            "source": "해설"
          },
          {
            "category": "pron",
            "quote": "I can't afford",
            "note": "부정 조동사는 can't에 강세를 둬야 한다. can afford로 들리면 의미가 뒤집힌다.",
            "source": "해설"
          },
          {
            "category": "vocab",
            "quote": "todays, uh these days",
            "note": "today / these days 표현을 자연스럽게 쓰라고 제안.",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AL",
        "itemScore": "(High)",
        "text": "Um, for me I think it's better to give some candy rather than giving a book. The reason I think like this is that, actually, um, I, the candy is really sweet so it can relieves relieve someone's stress. And I think candy is cheaper than a book so I can save my money as well.",
        "textSource": "screen",
        "captionSuspect": [
          "so it can relieves relieve someone's stress"
        ],
        "points": [
          {
            "category": "content",
            "quote": "Um, for me I think it's better to give some candy",
            "note": "내용이 좋고, 시작을 자연스럽게 여는 방식을 긍정 평가.",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "rather than giving a book",
            "note": "rather than 뒤에 giving이 아니라 to give가 와야 병렬이 맞는다.",
            "source": "해설"
          },
          {
            "category": "vocab",
            "quote": "someone's stress",
            "note": "someone's stress는 부자연스럽다. relieve stress 또는 people's stress가 맞다.",
            "source": "해설"
          },
          {
            "category": "pron",
            "quote": "relieves relieve",
            "note": "relieves를 relieve로 스스로 고친 점은 좋다.",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AM",
        "itemScore": "(High)",
        "text": "I would prefer to give a book to someone because it is more memorable and meaningful than a candy. Therefore, the person who receive my present will remember my...my intentions. Also, candies are unhealthy for...for someone's teeth and their health, so I think books are meaningful than candies, as a gift",
        "textSource": "screen",
        "captionSuspect": [],
        "points": [
          {
            "category": "grammar",
            "quote": "I would prefer to give a book",
            "note": "문제의 조동사 would를 살려 I would prefer로 답한 점을 좋게 평가.",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "the person who receive my present",
            "note": "주어가 3인칭 단수이므로 receive가 아니라 receives여야 한다.",
            "source": "ETS"
          },
          {
            "category": "vocab",
            "quote": "my intentions",
            "note": "intentions보다 the meaning 계열 표현이 문제에 더 맞는다.",
            "source": "해설"
          },
          {
            "category": "vocab",
            "quote": "someone's teeth",
            "note": "someone's teeth는 특정인만 가리켜 어색하다. people's teeth가 맞다.",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "books are meaningful than candies",
            "note": "than이 있으므로 more meaningful이 되어야 한다.",
            "source": "해설"
          }
        ]
      }
    ],
    "8": [
      {
        "level": "IH",
        "itemScore": "(Medium)",
        "text": "The moving showing on a Butterfly's Crossing is is scheduled on June 18 from 9 to 8 p.m.",
        "textSource": "screen",
        "captionSuspect": [],
        "points": [
          {
            "category": "info",
            "quote": "from 9 to 8 p.m.",
            "note": "날짜는 맞게 말했지만 시작 시간을 6시 대신 9시로 말해 정보 전달이 틀렸다. 이것이 Medium 판정의 핵심 이유.",
            "source": "해설"
          },
          {
            "category": "pron",
            "quote": "The moving showing on a Butterfly's Crossing",
            "note": "movie showing을 moving showing으로 발음했다.",
            "source": "해설"
          },
          {
            "category": "info",
            "quote": "정보 틀리면 그냥 무조건 감점이에요",
            "note": "정보가 틀리면 영어 실력과 무관하게 감점된다는 점을 강조.",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AL",
        "itemScore": "(High)",
        "text": "The event for movie showing is on June [eighdeenth], and it will start at 6 p.m. to 8 p.m. and this is about a [Birdfly's] Crossing.",
        "textSource": "screen",
        "captionSuspect": [
          "and it will start at 6 p.m. to 8 p.m."
        ],
        "points": [
          {
            "category": "info",
            "quote": "it will start at 6 p.m. to 8 p.m.",
            "note": "날짜·시간·영화 제목이 모두 정확해 High. 발음 표시가 있어도 정보가 맞으면 등급이 떨어지지 않는다.",
            "source": "해설"
          },
          {
            "category": "pron",
            "quote": "[eighdeenth]",
            "note": "화면에 [eighdeenth]로 표시된 발음 지적. eighteen의 t를 굴려 들린 부분.",
            "source": "ETS"
          },
          {
            "category": "pron",
            "quote": "[Birdfly's] Crossing",
            "note": "Butterfly도 [Birdfly's]로 표시됐다. 다만 발음 지적만으로 Medium이 되지는 않았다.",
            "source": "ETS"
          }
        ]
      },
      {
        "level": "AM",
        "itemScore": "(High)",
        "text": "The movie showing will be held on June 18th, and the movie that will be showed is \"A Butterfly's Crossing.\"",
        "textSource": "screen",
        "captionSuspect": [],
        "points": [
          {
            "category": "content",
            "quote": "The movie showing will be held on June 18th",
            "note": "완벽한 답변으로 이 답변을 따라 말해 보라고 권했다.",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "the movie that will be showed is",
            "note": "the movie that will be showed처럼 복합 문장도 자신 있게 말했다.",
            "source": "해설"
          },
          {
            "category": "pron",
            "quote": "A Butterfly's Crossing.",
            "note": "June 18th와 Butterfly's Crossing 발음을 정확히 했다.",
            "source": "해설"
          }
        ]
      }
    ],
    "9": [
      {
        "level": "IH",
        "itemScore": "(High)",
        "text": "I'm sorry but you have the wrong information. The community food festival is is going to on June 22 from 11 to 8:30 p.m.",
        "textSource": "screen",
        "captionSuspect": [],
        "points": [
          {
            "category": "content",
            "quote": "I'm sorry but you have the wrong information.",
            "note": "상대의 착각을 정중히 바로잡는 첫 문장이 좋다.",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "is is going to on June 22",
            "note": "is going to on이 아니라 is going to be on이 되어야 100% 답변이었다.",
            "source": "해설"
          },
          {
            "category": "info",
            "quote": "22 second이죠. 날짜는 서수로",
            "note": "날짜는 서수(22nd)로 읽어야 한다.",
            "source": "해설"
          },
          {
            "category": "length",
            "quote": "from 11 to 8:30 p.m.",
            "note": "질문이 시간을 묻지 않았지만 시간까지 넣은 점은 문제되지 않았다.",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AL",
        "itemScore": "(High)",
        "text": "No, I think you have, I'm afraid that you have the wrong information. Actually, Community Food foster, festival is on June 22nd so keep this information in mind.",
        "textSource": "screen",
        "captionSuspect": [
          "Community Food foster, festival"
        ],
        "points": [
          {
            "category": "content",
            "quote": "festival is on June 22nd",
            "note": "날짜를 서수로 정확히 읽었고, 앞서 배운 패턴을 되살려 말했다.",
            "source": "해설"
          },
          {
            "category": "cohesion",
            "quote": "잘못 말해도 다시 고치면 된다",
            "note": "말이 꼬여도 다시 고치면 큰 감점이 아니라는 점을 이 답변으로 설명.",
            "source": "해설"
          },
          {
            "category": "vocab",
            "quote": "so keep this information in mind",
            "note": "keep this information in mind 같은 정형 표현을 외워 두길 권했다.",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AM",
        "itemScore": "(High)",
        "text": "I'm sorry but there seems to be a misunderstanding. The community food festival will be held on June 22nd, not the 28th. And it will be held from 11 a.m. to 8:30 p.m.",
        "textSource": "screen",
        "captionSuspect": [],
        "points": [
          {
            "category": "content",
            "quote": "not the 28th",
            "note": "not the 28th로 잘못된 정보를 바로 붙여 주는 방식을 강하게 권장.",
            "source": "해설"
          },
          {
            "category": "other",
            "quote": "시간이 빠졌어도 전혀 점수에는 연관이 없었을 것이다",
            "note": "시간까지 말했지만 시간을 묻는 질문이 아니어서 감점 요소는 아니었다.",
            "source": "해설"
          }
        ]
      }
    ],
    "10": [
      {
        "level": "IH",
        "itemScore": "(High)",
        "text": "There are two scheduled events. First, demonstration on Caring for Fruits Trees is scheduled on June 3 from 10 to noon. Second, Planting Native Glasses is going to on June 14 from twe- 2:30 to 4 p.m.",
        "textSource": "screen",
        "captionSuspect": [
          "from twe- 2:30 to 4 p.m."
        ],
        "points": [
          {
            "category": "info",
            "quote": "scheduled on June 3 from 10 to noon",
            "note": "두 demonstration의 날짜와 시간을 모두 전달해 High.",
            "source": "해설"
          },
          {
            "category": "pron",
            "quote": "Planting Native Glasses",
            "note": "native grasses를 glasses로 발음했다.",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "is going to on June 14",
            "note": "is going to on June 14는 be on이 맞지만, 전달이 됐으므로 High.",
            "source": "해설"
          },
          {
            "category": "info",
            "quote": "디테일이라고 딱 언급하는 순간에",
            "note": "'모든 디테일'을 묻는 질문이면 그 단어가 포함된 줄 전체를 빠짐없이 말해야 한다.",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AL",
        "itemScore": "(High)",
        "text": "Of course, there are two demonstra- demonstrations scheduled in June. First one is demonstration for caring for fruit trees and it will start at 10 a.m. to noon and it is on June 3rd. Second one is demonstration for planting native grasses, and it is on June 14th and it will start at 2:30 to 4 p.m.",
        "textSource": "screen",
        "captionSuspect": [
          "there are two demonstra- demonstrations"
        ],
        "points": [
          {
            "category": "other",
            "quote": "Of course, there are two demonstrations scheduled in June.",
            "note": "거의 흠잡을 곳이 없는 답변으로 High.",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "demonstration for caring for fruit trees",
            "note": "demonstration for caring for fruit trees에서 for보다 on이 알맞다. 다만 어색한 정도라 감점은 없었다.",
            "source": "해설"
          },
          {
            "category": "other",
            "quote": "ETS 커멘트 측에서도 딱히 막 이렇게 집어 주거나 이런 부분은 없었습니다",
            "note": "ETS 코멘트에서 따로 집어낸 부분은 없었다.",
            "source": "ETS"
          }
        ]
      },
      {
        "level": "AM",
        "itemScore": "(High)",
        "text": "There are two demonstrations scheduled during the...during the event. First, there will be demonstration about caring for fruit trees on June 3rd, that will be held from 10 a.m. to noon. And after that, there will be a demonstration about planting native grasses on June 14th. It will be held from 2:30 to 4 p.m.",
        "textSource": "screen",
        "captionSuspect": [],
        "points": [
          {
            "category": "other",
            "quote": "와, 이분 진짜 영어 잘한다",
            "note": "영어를 잘한다는 느낌이 드는 답변으로 High.",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "demonstration about caring for fruit trees",
            "note": "demonstration about보다 on이 정석이다. about은 범위가 넓어지는 뉘앙스.",
            "source": "해설"
          },
          {
            "category": "other",
            "quote": "ETS 채정관 측에서 뭔가 커멘트를 달진 않았지만",
            "note": "ETS 채점관 코멘트는 따로 없었다고 강사가 밝혔다.",
            "source": "ETS"
          }
        ]
      }
    ],
    "11": [
      {
        "level": "IH",
        "itemScore": "(Medium)",
        "text": "I think so- teachers assign homework each day is better. Most of all, students are not mature enough. In my case, when I was high school students, my teacher rarely assigned my homework so I delay- I delayed it every day my homework. So, for that reason. So, my I I could not get a good grades at school. Most, the, also according to the recents reports the majority of successful education in Korea say that, uh,  assigning assigning homework each day is better the more can provide more positive effective for stud....",
        "textSource": "screen",
        "captionSuspect": [
          "자막 'I think so teachers' — 화면은 'I think so- teachers'(자기수정 보존)",
          "자막 'successful education' — 화면은 'successful education in Korea'"
        ],
        "points": [
          {
            "category": "length",
            "quote": "60 seconds",
            "note": "60초 내내 공백 없이 영어로 이어서 말했다고 평가",
            "source": "해설"
          },
          {
            "category": "content",
            "quote": "I think so- teachers assign homework each day is better",
            "note": "의견을 첫 문장에서 명확히 밝힌 점을 칭찬",
            "source": "해설"
          },
          {
            "category": "content",
            "quote": "students are not mature enough",
            "note": "'students are not mature enough' 뒤에 왜 그런지 근거가 부족하다고 지적",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "when I was high school students",
            "note": "'when I was high school students'는 'when I was in high school'로 말해야 한다고 지적",
            "source": "해설"
          },
          {
            "category": "other",
            "quote": "according to the recents reports",
            "note": "'according to the recents reports' 같은 패턴 암기는 앞 문법 실력과 안 맞아 플러스가 되지 않는다고 조언",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AL",
        "itemScore": "(Medium)",
        "text": "Um, I think, uh, it’s better to assign rar- rarely homework to students. The reason I think like this is that, um actually students have a lot of schoolwork to do these days, and it makes them so stressed out. From my personal experience, when I was a middle school student, uh, I was I had so many work to do from school and academy as well. And, at the time I was so stressed out so I need to relieve my stress. So, I was really hard I was I spent really hard time to finish my schoolwork and homework from academy. So I think a teacher need to give less homework to student.",
        "textSource": "screen",
        "captionSuspect": [
          "구간 자막 대부분이 한국어 해설과 겹쳐 영어 답변 인식이 거의 없었다. 화면 글자만 사용했다."
        ],
        "points": [
          {
            "category": "grammar",
            "quote": "assign rarely homework to students",
            "note": "'It’s better to assign rarely homework to students'의 어순·문법 오류로 첫 문장이 불명확했다고 지적",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "students have a lot of schoolwork",
            "note": "주어-동사 일치와 시제를 지적('I need to' → 과거)",
            "source": "해설"
          },
          {
            "category": "vocab",
            "quote": "so many work",
            "note": "work는 불가산이라 'so many work' 대신 much work를 써야 한다고 ETS 코멘트를 소개",
            "source": "ETS"
          },
          {
            "category": "grammar",
            "quote": "I was really hard",
            "note": "'I was really hard'는 '힘들었다'가 아니라 '딱딱했다'는 뜻이라고 ETS 지적을 설명",
            "source": "ETS"
          },
          {
            "category": "grammar",
            "quote": "a teacher need to give less homework",
            "note": "일반적인 진술이므로 'a teacher need'가 아니라 teachers로 복수형을 써야 한다고 지적",
            "source": "해설"
          }
        ]
      },
      {
        "level": "AM",
        "itemScore": "(High)",
        "text": "I think teachers who assign homework each day are better... because it will encourage students to study and work hard after class because they have to do their homeworks. Therefore, they can get good grades. For example, when I was in high school my homeroom teacher gave us homework every day. First, me and my classmates didn’t really like it because we had to study all day, but gradually, my performances got better because I studied and solved the problems that were given by the teacher. So it became really useful...for me. So therefore, I think giving...homework each day is much better for the class overall because it can...make students work harder.",
        "textSource": "screen",
        "captionSuspect": [
          "이 구간 자막이 'onillingets'처럼 깨져 영어 답변 인식이 거의 없었다. 화면 글자만 사용했다."
        ],
        "points": [
          {
            "category": "vocab",
            "quote": "encourage",
            "note": "make 대신 'encourage'를 쓴 어휘력을 칭찬",
            "source": "해설"
          },
          {
            "category": "cohesion",
            "quote": "because",
            "note": "'because'를 연속으로 두 번 써 문장 연결이 단조롭다고 ETS가 지적(as a result 등 변형 권장)",
            "source": "ETS"
          },
          {
            "category": "cohesion",
            "quote": "at first",
            "note": "반전이 있으므로 'First'가 아니라 'at first'가 맞다고 지적",
            "source": "해설"
          },
          {
            "category": "grammar",
            "quote": "me and my classmates",
            "note": "'me and my classmates'는 'my classmates and I'로 말해야 한다고 지적",
            "source": "해설"
          },
          {
            "category": "cohesion",
            "quote": "So",
            "note": "'So'를 반복 사용한 점을 ETS 코멘트로 소개",
            "source": "ETS"
          }
        ]
      }
    ]
  }
};
