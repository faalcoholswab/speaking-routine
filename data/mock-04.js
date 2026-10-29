/* mock-04 — YouTube 모의고사
   문항·표 글자는 capture/mock-04/ 초안에서 바꾸지 않고 옮겼다.
   출처 주소는 이 파일에 남기지 않는다. */
window.MOCK_EXAMS = window.MOCK_EXAMS || [];
window.MOCK_EXAMS.push({
  "id": "mock-04",
  "rights": "confirmed",
  "title": "모의고사 4",
  "subtitle": "26년 극최신 모의고사#28",
  "durationSeconds": 920,
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
          "text": "I'm honored to introduce Adrian Benton, one of the most exciting artists working today. Mr. Benton is known for combining color, shape, and light into stunning works of art. He'll talk about his latest project. Without further delay, please welcome Mr. Adrian Benton to the stage.",
          "prompt": "Read the text aloud."
        },
        {
          "no": 2,
          "type": "read-aloud",
          "prepSeconds": 45,
          "responseSeconds": 45,
          "text": "In local news, the Grandview Hotel chain will open a new hotel in Summerfield. Construction on the largest hotel in the area is planned to begin this summer. The hotel will offer conference rooms, two restaurants, and exercise facilities.",
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
          "image": "mock-04/p2-q3.webp",
          "keyElements": [
            "a rainy street with shops",
            "a delivery man in a yellow vest holding a box",
            "a man on a motorbike holding a black umbrella",
            "cardboard boxes on the motorbike",
            "a man looking at his phone under an umbrella",
            "parked motorcycles",
            "people riding scooters in the background",
            "store signs in the background"
          ]
        },
        {
          "no": 4,
          "type": "picture-description",
          "prepSeconds": 45,
          "responseSeconds": 30,
          "prompt": "Describe the picture in as much detail as you can.",
          "image": "mock-04/p2-q4.webp",
          "keyElements": [
            "a man and a woman in a library",
            "a woman holding an open book",
            "a woman in a green cardigan",
            "a man in a denim jacket",
            "a camera hanging in front of him",
            "the man pointing at the book",
            "tall bookshelves full of books",
            "a large window with trees outside"
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
      "context": "Imagine a cooking magazine is conducting research in your area. You have agreed to participate in a telephone interview about cooking outdoors.",
      "questions": [
        {
          "no": 5,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "Do you enjoy cooking outdoors? Why or why not?"
        },
        {
          "no": 6,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "What is the most delicious food you have cooked outdoors, and when was the last time you had it?"
        },
        {
          "no": 7,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 30,
          "prompt": "Which do you think is easier, cooking indoors or cooking outdoors?"
        }
      ]
    },
    {
      "part": 4,
      "label": "Respond Using Information",
      "directions": "In this part of the test, you will answer three questions based on the information provided. You will have 45 seconds to read the information before the questions begin. You will have 3 seconds to prepare and 15 seconds to respond to questions 8 and 9. You will hear question 10 two times. You will have 3 seconds to prepare and 30 seconds to respond to question 10.",
      "cues": {
        "prep": "",
        "start": ""
      },
      "context": "Swimming Coaches Association 25th Annual Conference — Saturday, August 15",
      "readingSeconds": 45,
      "tableImage": "mock-04/p4-table.webp",
      "table": [
        [
          "Time",
          "Session",
          "Presenter"
        ],
        [
          "8:00 A.M. - 9:00 A.M.",
          "Registration.",
          "—"
        ],
        [
          "9:00 A.M. - 11:00 A.M.",
          "Opening Session",
          "Michael Turner"
        ],
        [
          "12:00 P.M. 1:00 P.M.",
          "Lunch with Henry Patton, Swim Champion",
          "Canceled"
        ],
        [
          "1:00 P.M. - 3:00 P.M.",
          "Discussion: Teaching Beginning Swimmers",
          "Laura Davis"
        ],
        [
          "3:00 P.M. - 4:00 P.M.",
          "Swimming Safety and Injury Prevention",
          "Jennifer Brown"
        ],
        [
          "4:00 P.M. - 6:00 P.M.",
          "Workshop: Training Exercises for Beginners",
          "Robert Miller"
        ]
      ],
      "questions": [
        {
          "no": 8,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "I'm planning to attend the Swimming Coaches Association annual conference. I haven't received the schedule yet, so I'd like to ask you a few questions. What date will the conference be held? And what time does registration begin?",
          "answerKey": "The conference is on Saturday, August 15. Registration begins at 8:00 A.M. and runs until 9:00 A.M."
        },
        {
          "no": 9,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "I understand that we'll have lunch with Henry Patton. Could you confirm that for me?",
          "answerKey": "No. The lunch with Henry Patton, the swim champion, is from 12:00 to 1:00 P.M., but it has been canceled."
        },
        {
          "no": 10,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 30,
          "prompt": "I teach beginning swimmers. Could you give me all the information about the sessions that specifically deal with beginners?",
          "answerKey": "There are two sessions for beginners. 'Discussion: Teaching Beginning Swimmers' is from 1:00 to 3:00 P.M. with Laura Davis, and 'Workshop: Training Exercises for Beginners' is from 4:00 to 6:00 P.M. with Robert Miller.",
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
          "prompt": "Do you think it is possible for students to do well on their schoolwork if they don't start working on it until right before the deadline? Why or why not?"
        }
      ]
    }
  ]
});
