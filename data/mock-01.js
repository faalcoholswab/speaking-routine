/* 모의고사 1 — data/mock-01.js
   추출 방식: 영상 프레임 캡처 + 화면 텍스트 판독 (음성 추출 없음)
   ※ 원본 주소는 추출 후 폐기. 파일에 남기지 않는다. */
window.MOCK_EXAMS = window.MOCK_EXAMS || [];
window.MOCK_EXAMS.push({
  "id": "mock-01",
  "rights": "confirmed",
  "title": "모의고사 1",
  "subtitle": "2026년 10월 최신 기출 유형 실전 연습",
    "durationSeconds": 881,
  "parts": [
    {
      "part": 1,
      "label": "Read a Text Aloud",
      "directions": "In this part of the test, you will read aloud the text on the screen. You will have 45 seconds to prepare. Then you will have 45 seconds to read the text aloud.",
      "cues": {
        "prep": "Begin preparing now.",
        "start": "Begin reading aloud now."
      },
      "questions": [
        {
          "no": 1,
          "type": "read-aloud",
          "prepSeconds": 45,
          "responseSeconds": 45,
          "text": "Hello, everyone. It's a pleasure to speak at today's community forum. As a transportation reporter for City Radio, I've learned how traffic updates affect our daily routines. Reliable reports help commuters choose their routes, avoid delays, and arrive at their destinations on time. That's why providing clear and accurate information is so important.",
          "prompt": "Read the text aloud."
        },
        {
          "no": 2,
          "type": "read-aloud",
          "prepSeconds": 45,
          "responseSeconds": 45,
          "text": "Welcome to our guided walking tour of the Riverside District, one of the town's favorite neighborhoods. Along the way, you'll discover historic buildings, colorful murals, and a lively shopping street. If you need assistance or would like to learn more about a particular location, please ask your tour guide. We hope you have a wonderful visit.",
          "prompt": "Read the text aloud."
        }
      ]
    },
    {
      "part": 2,
      "label": "Describe a Picture",
      "directions": "In this part of the test, you will describe the picture on your screen in as much detail as you can. You will have 45 seconds to prepare your response. Then you will have 30 seconds to speak about the picture.",
      "cues": {
        "prep": "Begin preparing now.",
        "start": "Begin speaking now."
      },
      "questions": [
        {
          "no": 3,
          "type": "picture-description",
          "prepSeconds": 45,
          "responseSeconds": 30,
          "prompt": "Describe the picture in as much detail as you can.",
          "image": "mock-01/p2-q3.webp",
          "keyElements": [
            "three business people",
            "modern office lounge",
            "one man standing with a tablet",
            "one man seated and gesturing",
            "one woman holding a cup",
            "laptop on a round table",
            "plant on the table",
            "large windows"
          ]
        },
        {
          "no": 4,
          "type": "picture-description",
          "prepSeconds": 45,
          "responseSeconds": 30,
          "prompt": "Describe the picture in as much detail as you can.",
          "image": "mock-01/p2-q4.webp",
          "keyElements": [
            "two people in an office hallway",
            "man opening a filing cabinet",
            "woman watering a large plant",
            "brick wall",
            "wooden floor",
            "glass door at the end of the hall"
          ]
        }
      ]
    },
    {
      "part": 3,
      "label": "Respond to Questions",
      "directions": "In this part of the test, you will answer three questions. You will have 3 seconds to prepare after you hear each question. You will have 15 seconds to respond to questions 5 and 6, and 30 seconds to respond to question 7.",
      "cues": {
        "prep": "",
        "start": ""
      },
      "context": "Imagine that a local magazine is doing research in your area. You have agreed to participate in a telephone interview about cooking.",
      "questions": [
        {
          "no": 5,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "When was the last time you cooked a meal at home? And do you prefer cooking by yourself or with someone else?"
        },
        {
          "no": 6,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "If you could make a special dinner for a family member or friend, who would you choose to cook for? Why?"
        },
        {
          "no": 7,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 30,
          "prompt": "If you were choosing a meal to cook, which factor would matter more to you? How healthy the meal is or how easy the meal is to prepare? Choose one of the options provided and explain why you chose it."
        }
      ]
    },
    {
      "part": 4,
      "label": "Respond Using Information",
      "directions": "In this part of the test, you will answer three questions based on the information provided. You will have 45 seconds to read the information before the questions begin. You will have 3 seconds to prepare after you hear each question. You will have 15 seconds to respond to questions 8 and 9, and 30 seconds to respond to question 10.",
      "cues": {
        "prep": "",
        "start": ""
      },
      "context": "Photography & Media Festival — Westbridge Arts Center",
      "readingSeconds": 45,
      "tableImage": "mock-01/p4-table.webp",
      "table": [
        [
          "Date",
          "Time",
          "Program",
          "Speaker / Leader"
        ],
        [
          "Apr 14",
          "9:00 a.m.",
          "Talk: A Brief History of Photography",
          "Maya Chen"
        ],
        [
          "",
          "10:30 a.m.",
          "Exhibition Tour: City in Focus",
          "—"
        ],
        [
          "",
          "1:30 p.m.",
          "Talk: Photography in Everyday Life",
          "Oliver Reed"
        ],
        [
          "",
          "3:15 p.m.",
          "Panel: The Future of Visual Media",
          "Nina Brooks"
        ],
        [
          "Apr 15",
          "9:30 a.m.",
          "Talk: Wildlife Photography",
          "Daniel Park"
        ],
        [
          "",
          "11:00 a.m.",
          "Workshop: Taking Better Portraits",
          "Emma Lewis"
        ],
        [
          "",
          "2:00 p.m.",
          "Discussion: Famous Photojournalists",
          "Sofia Martin"
        ],
        [
          "",
          "3:30 p.m.",
          "Workshop: Editing Digital Photos",
          "Ryan Cooper"
        ]
      ],
      "questions": [
        {
          "no": 8,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "Where is the festival being held and what is the opening talk about?",
          "answerKey": "It is being held at the Westbridge Arts Center. The opening talk is 'A Brief History of Photography' by Maya Chen at 9:00 a.m. on April 14."
        },
        {
          "no": 9,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "Someone told me that the festival lasts for one day. Could you confirm that for me?",
          "answerKey": "No, it lasts for two days: April 14 and April 15."
        },
        {
          "no": 10,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 30,
          "prompt": "I would especially like to attend the hands-on workshops. Could you give me all the details about the workshops scheduled for the event?",
          "answerKey": "There are two workshops on April 15: 'Taking Better Portraits' at 11:00 a.m. with Emma Lewis, and 'Editing Digital Photos' at 3:30 p.m. with Ryan Cooper.",
          "heardTwice": true
        }
      ]
    },
    {
      "part": 5,
      "label": "Express an Opinion",
      "directions": "In this part of the test, you will give your opinion about a specific topic. Be sure to say as much as you can in the time allowed. You will have 45 seconds to prepare. Then you will have 60 seconds to speak.",
      "cues": {
        "prep": "Begin preparing now.",
        "start": "Begin speaking now."
      },
      "questions": [
        {
          "no": 11,
          "type": "opinion",
          "prepSeconds": 45,
          "responseSeconds": 60,
          "prompt": "Do you think companies should allow employees to listen to music while working? Why or why not? Give reasons or examples to support your opinion."
        }
      ]
    }
  ]
});
