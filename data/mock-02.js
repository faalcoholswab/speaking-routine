/* 모의고사 2 — data/mock-02.js
   추출 방식: 영상 프레임 캡처 + 화면 판독 + 자동 자막
   ※ 원본 주소는 추출 후 폐기. 파일에 남기지 않는다. */
window.MOCK_EXAMS = window.MOCK_EXAMS || [];
window.MOCK_EXAMS.push({
  "id": "mock-02",
  "title": "모의고사 2",
  "subtitle": "출제예상 모의고사 29회",
    "durationSeconds": 888,
  "parts": [
    {
      "part": 1,
      "label": "Read a Text Aloud",
      "directions": "In this part of the test, you will read aloud the text on the screen. You will have 45 seconds to prepare. Then you will have 45 seconds to read the text aloud.",
      "cues": { "prep": "Begin preparing now.", "start": "Begin reading aloud now." },
      "questions": [
        {
          "no": 1,
          "type": "read-aloud",
          "prepSeconds": 45,
          "responseSeconds": 45,
          "text": "Welcome to Sunnybrook Farm. Before we start the tour, let's go over the schedule. We'll begin by exploring the grounds where we grow apples, strawberries, and pumpkins. After that, we'll visit the farm animals. The tour will end at the country market, which offers various local products. There is plenty to see, so please follow me."
        },
        {
          "no": 2,
          "type": "read-aloud",
          "prepSeconds": 45,
          "responseSeconds": 45,
          "text": "According to a recent announcement from the city, the Crestview Art Institute is seeking dedicated volunteers. The museum will open a new sculpture garden next autumn and especially needs people with knowledge of planting and caring for trees, flowers, and other plants. Anyone interested should visit the institute's official website for more details."
        }
      ]
    },
    {
      "part": 2,
      "label": "Describe a Picture",
      "directions": "In this part of the test, you will describe the picture on your screen in as much detail as you can. You will have 45 seconds to prepare your response. Then you will have 30 seconds to speak about the picture.",
      "cues": { "prep": "Begin preparing now.", "start": "Begin speaking now." },
      "questions": [
        {
          "no": 3,
          "type": "picture-description",
          "prepSeconds": 45,
          "responseSeconds": 30,
          "image": "mock-02/p2-q3.webp",
          "keyElements": [
            "a man and a girl on a green sofa",
            "a small dog jumping up",
            "wrapped presents stacked on a table",
            "large windows",
            "wooden herringbone floor",
            "a dining table with chairs"
          ]
        },
        {
          "no": 4,
          "type": "picture-description",
          "prepSeconds": 45,
          "responseSeconds": 30,
          "image": "mock-02/p2-q4.webp",
          "keyElements": [
            "a supermarket checkout",
            "a cashier in a blue vest",
            "a woman in a hijab holding a card",
            "a man in a blue beanie bagging a pineapple",
            "snacks on the conveyor belt",
            "a shopping cart"
          ]
        }
      ]
    },
    {
      "part": 3,
      "label": "Respond to Questions",
      "directions": "In this part of the test, you will answer three questions. You will have 3 seconds to prepare after you hear each question. You will have 15 seconds to respond to questions 5 and 6, and 30 seconds to respond to question 7.",
      "cues": { "prep": "", "start": "" },
      "context": "Imagine that a home lifestyle magazine is conducting a survey and you have agreed to participate in a telephone interview about your cleaning habits.",
      "questions": [
        {
          "no": 5,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "Who usually cleans your home? Does that person do it alone?"
        },
        {
          "no": 6,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "Do you prefer cleaning alone or with others? Why?"
        },
        {
          "no": 7,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 30,
          "prompt": "Where do you usually get information when buying cleaning products? Online reviews, advertisements, or recommendations from friends?"
        }
      ]
    },
    {
      "part": 4,
      "label": "Respond Using Information",
      "directions": "In this part of the test, you will answer three questions based on the information provided. You will have 45 seconds to read the information before the questions begin. You will have 3 seconds to prepare and 15 seconds to respond to questions 8 and 9. You will hear question 10 two times. You will have 3 seconds to prepare and 30 seconds to respond to question 10.",
      "cues": { "prep": "", "start": "" },
      "readingSeconds": 45,
      "tableImage": "mock-02/p4-table.webp",
      "table": [
        ["Time", "Topic", "Location"],
        ["10:00 - 10:30 a.m.", "Live AI Ambient Sound Performance", "Cyber Stage"],
        ["10:30 - 11:30 a.m.", "Seminar: Eco Smart Home Tech", "Tech Pavilion"],
        ["11:30 - 12:30 p.m.", "Workshop: Upcycling Electronic Waste", "Maker Studio"],
        ["12:30 - 1:30 p.m.", "Vegan Food Tech & Lunch", "Smart Lounge"],
        ["1:30 - 2:30 p.m.", "Seminar: Smart Space Design Tips", "Glass Lab"],
        ["2:30 - 3:30 p.m.", "Live Talk Show with Green Startups", "Startup Hall"],
        ["3:30 - 4:00 p.m.", "Grand Closing & Awards", "Cyber Stage"]
      ],
      "context": "Future Green Tech Expo — Saturday, May 24 · Digital Innovation Park. Shuttle bus runs between Central Station and the Festival Site.",
      "questions": [
        {
          "no": 8,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "Could you tell me when the Expo will be held and what time the first session starts?",
          "answerKey": "It is on Saturday, May 24 at Digital Innovation Park. The first session starts at 10:00 a.m. — a Live AI Ambient Sound Performance at the Cyber Stage."
        },
        {
          "no": 9,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "I'll be getting off at Green City Central Station, but I'm not sure how to get to the Expo. Do I need to take a taxi or a bus?",
          "answerKey": "You don't need a taxi. A shuttle bus runs between Central Station and the Festival Site."
        },
        {
          "no": 10,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 30,
          "heardTwice": true,
          "prompt": "I heard there are seminars that offer advice for smart homes and space design. Could you tell me all the details of the scheduled seminars?",
          "answerKey": "There are two seminars. 'Eco Smart Home Tech' is from 10:30 to 11:30 a.m. at the Tech Pavilion, and 'Smart Space Design Tips' is from 1:30 to 2:30 p.m. at the Glass Lab."
        }
      ]
    },
    {
      "part": 5,
      "label": "Express an Opinion",
      "directions": "In this part of the test, you will give your opinion about a specific topic. Be sure to say as much as you can in the time allowed. You will have 45 seconds to prepare. Then you will have 60 seconds to speak.",
      "cues": { "prep": "Begin preparing now.", "start": "Begin speaking now." },
      "questions": [
        {
          "no": 11,
          "type": "opinion",
          "prepSeconds": 45,
          "responseSeconds": 60,
          "prompt": "Do you agree or disagree with the following statement? Hard work and practice are more important than natural talent for becoming a good cook. Give reasons or examples to support your opinion."
        }
      ]
    }
  ]
});
