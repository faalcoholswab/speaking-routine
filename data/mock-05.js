/* 2025 하반기 실제기출 — mock-05
   문항·표 글자는 capture/2025h2/mock-05.draft.js에서 바꾸지 않고 옮겼다.
   작업용 필드(*Source, draftNotes, keyElementsCandidate, intro)는 넣지 않는다.
   출처 주소는 이 파일에 남기지 않는다. */
window.MOCK_EXAMS = window.MOCK_EXAMS || [];
window.MOCK_EXAMS.push({
  "id": "mock-05",
  "rights": "confirmed",
  "title": "2025 하반기 실제기출",
  "subtitle": "2025년 하반기 실제기출",
  "durationSeconds": 708,
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
          "text": "Welcome to today’s meeting of the board of directors for Gussman Incorporated. Our management team will begin by giving project updates, which will take about forty-five minutes. After that, I’ll introduce our new employees, propose budget adjustments, and explain future work. At noon, we will take a break for lunch.",
          "prompt": "Read the text aloud."
        },
        {
          "no": 2,
          "type": "read-aloud",
          "prepSeconds": 45,
          "responseSeconds": 45,
          "text": "Thank you for listening to this traffic report on Channel Seventeen Radio. If you were planning to drive downtown today, you may want to reconsider. There are longer delays than usual due to an event at the convention center. Instead, consider speeding up your commute to the city center by taking the bus, bicycling, or riding the train.",
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
          "image": "mock-05/p2-q3.webp",
          "keyElements": [
            "a hotel front desk",
            "three people",
            "a man with glasses holding a backpack",
            "books in his hand",
            "a woman with curly hair talking on the phone",
            "a woman wearing red",
            "a receptionist behind the counter",
            "chairs in the background"
          ]
        },
        {
          "no": 4,
          "type": "picture-description",
          "prepSeconds": 45,
          "responseSeconds": 30,
          "prompt": "Describe the picture in as much detail as you can.",
          "image": "mock-05/p2-q4.webp",
          "keyElements": [
            "two women in an office",
            "a large copy machine",
            "a woman bending over to load paper",
            "a paper tray pulled out",
            "a woman holding a yellow envelope",
            "a stack of yellow envelopes",
            "a blue trash can",
            "glass walls in the background"
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
      "context": "Imagine that a marketing firm is conducting research in your area. You have agreed to participate in a telephone interview about giving gifts.",
      "questions": [
        {
          "no": 5,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "When was the last time you gave someone a gift, and why did you give that person a gift?"
        },
        {
          "no": 6,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "Do you usually go to a store to buy gifts, or buy gifts online? Choose one of the options provided and explain why you chose it."
        },
        {
          "no": 7,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 30,
          "prompt": "Which type of gift would you prefer to give: some candy or a book? Choose one of the options provided and explain why you chose it."
        }
      ]
    },
    {
      "part": 4,
      "label": "Respond Using Information",
      "directions": "In this part of the test, you will answer three questions based on the information provided. You will have 45 seconds to read the information before the questions begin. You will have 3 seconds to prepare after you hear each question. You will have 15 seconds to respond to questions 8 and 9, and 30 seconds to respond to question 10. You will hear question 10 two times.",
      "cues": {
        "prep": "",
        "start": ""
      },
      "context": "Nelsonville Nature Center — Hours: 7:00 A.M.–9:00 P.M. Daily — June Event Schedule",
      "readingSeconds": 45,
      "tableImage": "mock-05/p4-table.webp",
      "table": [
        [
          "Date",
          "Time",
          "Event"
        ],
        [
          "June 3",
          "10:00 A.M.–noon",
          "Demonstration: Caring for Fruit Trees"
        ],
        [
          "June 7",
          "5:30–9:00 P.M.",
          "Music Performance: The Royal Rose Band"
        ],
        [
          "June 14",
          "2:30–4:00 P.M.",
          "Demonstration: Planting Native Grasses"
        ],
        [
          "June 18",
          "6:00–8:00 P.M.",
          "Movie Showing: A Butterfly's Crossing"
        ],
        [
          "June 22",
          "11:00 A.M.–8:30 P.M.",
          "Community Food Festival"
        ],
        [
          "June 25",
          "Noon–1:30 P.M.",
          "Music Performance: Ellison String Quartet"
        ]
      ],
      "questions": [
        {
          "no": 8,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "On what date will there be a movie showing, and which movie will it be?",
          "answerKey": "June 18; A Butterfly's Crossing."
        },
        {
          "no": 9,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "My kids and I want to attend the community food festival. That's on June twenty-eighth, right?",
          "answerKey": "No. The Community Food Festival is on June 22, not June 28."
        },
        {
          "no": 10,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 30,
          "prompt": "I'm really interested in the demonstrations you offer. Can you give me all the details of the demonstrations scheduled in June?",
          "answerKey": "Two demonstrations: June 3, 10:00 A.M.–noon, Caring for Fruit Trees; June 14, 2:30–4:00 P.M., Planting Native Grasses.",
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
          "prompt": "Some teachers assign homework each day. Other teachers rarely assign homework. Which do you think is better, and why? Give reasons or examples to support your opinion."
        }
      ]
    }
  ]
});
