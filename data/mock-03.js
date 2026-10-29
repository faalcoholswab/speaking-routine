/* 모의고사 3 — data/mock-03.js
   추출 방식: 영상 프레임 캡처 + 화면 판독 + 자동 자막
   ※ 원본 주소는 추출 후 폐기. 파일에 남기지 않는다. */
window.MOCK_EXAMS = window.MOCK_EXAMS || [];
window.MOCK_EXAMS.push({
  "id": "mock-03",
  "rights": "confirmed",
  "title": "모의고사 3",
  "subtitle": "26년 10월 최신 기출 반영 모의고사 20",
    "durationSeconds": 903,
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
          "text": "Welcome to Oakdale Park. Our walking tour is a great way to explore the beauty of nature. As you follow the trail, pay attention to the sounds of nature around you. Along the way, you can enjoy beautiful trees, wild animals, and colorful flowers. Please stay on the trail and take your time enjoying the natural surroundings."
        },
        {
          "no": 2,
          "type": "read-aloud",
          "prepSeconds": 45,
          "responseSeconds": 45,
          "text": "Thank you for attending today's conference. I'm here today to talk about traffic congestion in our city. We have plans to expand bus services, promote carpooling programs, and increase the number of bike lanes. These changes will help reduce traffic congestion and make it easier for people to get around the city."
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
          "image": "mock-03/p2-q3.webp",
          "keyElements": [
            "two women sitting across a long table",
            "one woman in a yellow sweater",
            "one woman in a light blue shirt with a badge",
            "a monitor in the background",
            "a plate of cookies and a salad container",
            "bare white walls"
          ]
        },
        {
          "no": 4,
          "type": "picture-description",
          "prepSeconds": 45,
          "responseSeconds": 30,
          "image": "mock-03/p2-q4.webp",
          "keyElements": [
            "three people in a library",
            "tall bookshelves full of books",
            "a woman with a black tote bag",
            "a woman holding a laptop",
            "a man holding a green folder",
            "wooden floor"
          ]
        }
      ]
    },
    {
      "part": 3,
      "label": "Respond to Questions",
      "directions": "In this part of the test, you will answer three questions. You will have 3 seconds to prepare after you hear each question. You will have 15 seconds to respond to questions 5 and 6, and 30 seconds to respond to question 7.",
      "cues": { "prep": "", "start": "" },
      "context": "Imagine that a magazine is conducting an interview. You have agreed to participate in the interview and answer some questions about listening to music.",
      "questions": [
        {
          "no": 5,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "Do you usually listen to music in the morning or at night? Choose one of the options provided and explain why you chose it."
        },
        {
          "no": 6,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "Which is more enjoyable for you? Listening to music by yourself or listening to music with others? Choose one of the options provided and explain why you chose it."
        },
        {
          "no": 7,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 30,
          "prompt": "Which type of music do you think is best for a party and why? Pop music, classical music, or jazz music?"
        }
      ]
    },
    {
      "part": 4,
      "label": "Respond Using Information",
      "directions": "In this part of the test, you will answer three questions based on the information provided. You will have 45 seconds to read the information before the questions begin. You will have 3 seconds to prepare and 15 seconds to respond to questions 8 and 9. You will hear question 10 two times. You will have 3 seconds to prepare and 30 seconds to respond to question 10.",
      "cues": { "prep": "", "start": "" },
      "readingSeconds": 45,
      "tableImage": "mock-03/p4-table.webp",
      "table": [
        ["Time", "Task"],
        ["10:00 - 10:30 A.M.", "Review Weekly Sales Report"],
        ["10:30 - 11:30 A.M.", "Meeting: Service Improvement"],
        ["11:30 A.M. - 12:30 P.M.", "Lunch: Department Managers"],
        ["1:00 - 2:00 P.M.", "Analyze Customer Feedback"],
        ["2:30 - 3:30 P.M.", "Staff Training Session"],
        ["4:00 - 5:00 P.M.", "Meeting: Service Strategies (moved to July 24)"],
        ["5:00 - 5:30 P.M.", "Meeting: Customer Feedback Insights"]
      ],
      "context": "Steven Chiu, Customer Service Manager — Schedule for July 21",
      "questions": [
        {
          "no": 8,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "What is the first thing on my schedule and what time does it start?",
          "answerKey": "The first item is 'Review Weekly Sales Report' from 10:00 to 10:30 a.m."
        },
        {
          "no": 9,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "I believe I have a meeting about service strategies. Can you tell me what time it will be?",
          "answerKey": "That meeting was scheduled for 4:00 to 5:00 p.m., but it has been moved to July 24, so it is not on your July 21 schedule."
        },
        {
          "no": 10,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 30,
          "heardTwice": true,
          "prompt": "Could you tell me everything on my schedule related to customer feedback?",
          "answerKey": "There are two items. From 1:00 to 2:00 p.m. you analyze customer feedback, and from 5:00 to 5:30 p.m. you have a meeting on customer feedback insights."
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
          "prompt": "Do you agree or disagree with the following statement? It has become more difficult for parents to raise their children because of smartphones. Give reasons or examples to support your opinion."
        }
      ]
    }
  ]
});
