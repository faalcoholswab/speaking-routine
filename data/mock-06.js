/* mock-06 — YouTube 모의고사
   문항·표 글자는 capture/mock-06/ 초안에서 바꾸지 않고 옮겼다.
   출처 주소는 이 파일에 남기지 않는다. */
window.MOCK_EXAMS = window.MOCK_EXAMS || [];
window.MOCK_EXAMS.push({
  "id": "mock-06",
  "rights": "confirmed",
  "title": "모의고사 6",
  "subtitle": "최신 모의고사1",
  "durationSeconds": 3143,
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
          "text": "You're listening to Channel 40 traffic report. There are delays on Route 14, Livingston Street, and Applewood Avenue this morning. In addition, commuters should be aware that work continues on power lines throughout the area. This may cause some brief road closures. Before you drive home from work this evening, tune in again for an update on local road conditions.",
          "prompt": "Read the text aloud."
        },
        {
          "no": 2,
          "type": "read-aloud",
          "prepSeconds": 45,
          "responseSeconds": 45,
          "text": "Welcome to today's tour of the historic Miltonwood Hall. This house was designed and built more than two centuries ago by Davis Miltonwood, a famous architect. Throughout the tour, I'll point out and explain many interesting details about the design. After the tour, feel free to explore the outdoor gardens, relax by the fountain, or visit the gift shop.",
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
          "image": "mock-06/p2-q3.webp",
          "keyElements": [
            "a restaurant with diners",
            "a waiter serving a plate of food",
            "a waiter in a white shirt and a dark vest",
            "a smiling man in a dark sweater",
            "a woman with long dark hair",
            "glasses of red wine on the table",
            "a small vase of flowers",
            "a table number card"
          ]
        },
        {
          "no": 4,
          "type": "picture-description",
          "prepSeconds": 45,
          "responseSeconds": 30,
          "prompt": "Describe the picture in as much detail as you can.",
          "image": "mock-06/p2-q4.webp",
          "keyElements": [
            "an elevator",
            "a woman holding the elevator door open",
            "a woman with blond hair in a white blouse",
            "a woman holding a black folder",
            "a man in a dark suit jacket",
            "a man holding a coffee cup",
            "both people smiling",
            "a floor display showing 5"
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
      "context": "Imagine that a lifestyle magazine company is doing research in your area. You have agreed to participate in a telephone interview about holiday traditions.",
      "questions": [
        {
          "no": 5,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "When was the last time you spent a traditional holiday with someone, and who was it?"
        },
        {
          "no": 6,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "Do you prefer to stay at home or visit your family on traditional holidays? Why?"
        },
        {
          "no": 7,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 30,
          "prompt": "Which of the following do you usually do with your family on traditional holidays, and why? - Cooking and eating traditional food - Going on a vacation - Playing games together"
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
      "context": "Apex Global Group Interview Schedule — March 12, 2026, Meeting Room A (3rd Floor)",
      "readingSeconds": 45,
      "tableImage": "mock-06/p4-table.webp",
      "table": [
        [
          "Time",
          "Candidate",
          "Department",
          "Experience"
        ],
        [
          "09:00 AM",
          "James Miller",
          "Sales",
          "7 years"
        ],
        [
          "09:30 AM",
          "Sarah Wilson",
          "Marketing",
          "3 years"
        ],
        [
          "10:00 AM",
          "Michael Thompson",
          "Marketing",
          "2 years"
        ],
        [
          "10:30 AM",
          "John Doe (Moved to March 16)",
          "HR",
          "5 years"
        ],
        [
          "11:00 AM",
          "Emily Davis",
          "Design",
          "10 years"
        ],
        [
          "11:30 AM",
          "Brian Cho",
          "IT",
          "4 years"
        ]
      ],
      "questions": [
        {
          "no": 8,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "Hi, I'm going to be one of the interviewers today, so I have a few questions about the schedule before we start. What time is the last interview scheduled, and who is the candidate?",
          "answerKey": "The last interview is scheduled for 11:30 AM, and the candidate is Brian Cho."
        },
        {
          "no": 9,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "I heard that the interview with John at 10:30 AM is on the schedule for March 12th. Can you confirm that for me?",
          "answerKey": "No, the 10:30 AM interview with John Doe has been moved to March 16."
        },
        {
          "no": 10,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 30,
          "prompt": "I'm looking for candidates who have six years of experience or more. Could you tell me all the members who have at least six years of experience?",
          "answerKey": "Two candidates have six or more years of experience: James Miller from Sales with 7 years at 9:00 AM, and Emily Davis from Design with 10 years at 11:00 AM.",
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
          "prompt": "Do you agree or disagree with the following statement, People need to have some boring time occasionally. Give specific reasons or examples to support your opinion."
        }
      ]
    }
  ]
});
