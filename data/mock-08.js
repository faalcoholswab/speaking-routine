/* mock-08 — YouTube 모의고사
   문항·표 글자는 capture/mock-08/ 초안에서 바꾸지 않고 옮겼다.
   출처 주소는 이 파일에 남기지 않는다. */
window.MOCK_EXAMS = window.MOCK_EXAMS || [];
window.MOCK_EXAMS.push({
  "id": "mock-08",
  "rights": "confirmed",
  "title": "모의고사 8",
  "subtitle": "여름 방학 빈출 모의고사 3탄",
  "durationSeconds": 900,
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
          "text": "Welcome to the Heritage Art Museum, everyone. I'd like to review a few essential guidelines. Please confirm that your heavy coats, large backpacks, and umbrellas are safely stored in the lockers. Midway through the tour, complimentary brochures and postcards will be provided to all visitors. If you require any help during your visit, please feel free to approach any of our museum guides.",
          "prompt": "Read the text aloud."
        },
        {
          "no": 2,
          "type": "read-aloud",
          "prepSeconds": 45,
          "responseSeconds": 45,
          "text": "The main topic of today's briefing is our proposal for extended weekend operating hours. Thanks to the planning team, we now have a clearer understanding of what community members expect from us. We collected this data by conducting user interviews, reviewing suggestion boxes, and analyzing facility usage rates. My teammate, David Miller, will present the specific details.",
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
          "image": "mock-08/p2-q3.webp",
          "keyElements": [
            "an airport departures area",
            "a man with sunglasses and a backpack",
            "a man in a white sweater",
            "a man lifting a black suitcase",
            "a woman with blond hair in a striped sweater",
            "a woman holding a silver suitcase",
            "a black car with the trunk open",
            "a luggage cart"
          ]
        },
        {
          "no": 4,
          "type": "picture-description",
          "prepSeconds": 45,
          "responseSeconds": 30,
          "prompt": "Describe the picture in as much detail as you can.",
          "image": "mock-08/p2-q4.webp",
          "keyElements": [
            "a laboratory",
            "two people in white lab coats",
            "a man looking into a microscope",
            "blue gloves",
            "a woman talking on the phone",
            "a computer screen with images",
            "test tubes on the desk",
            "shelves with bottles"
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
      "context": "Imagine that a U.S. marketing company is conducting a survey. You have agreed to participate in an interview about traveling by train.",
      "questions": [
        {
          "no": 5,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "When was the last time you took a train, and who did you travel with?"
        },
        {
          "no": 6,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "Do you usually book your train tickets online or buy them directly at the station? Why?"
        },
        {
          "no": 7,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 30,
          "prompt": "Do you think it is a good idea to subscribe to online notifications regarding train delays? Why or why not?"
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
      "context": "IT & Software Department Job Applicant Interview Schedule — Date: October 12 — Location: Conference Room B",
      "readingSeconds": 45,
      "tableImage": "mock-08/p4-table.webp",
      "table": [
        [
          "Time",
          "Applicant",
          "Position",
          "Previous Company"
        ],
        [
          "9:00 - 9:30 am",
          "Sarah Jenkins",
          "UX Designer",
          "Tech Innovators"
        ],
        [
          "9:30 - 10:00 am",
          "Michael Chang",
          "System Analyst",
          "NextGen Data"
        ],
        [
          "10:00 - 10:30 am",
          "Jessica Alba",
          "Frontend Developer",
          "Cloud Tech Solutions"
        ],
        [
          "10:30 - 11:00 am",
          "David Ross",
          "Project Manager (canceled)",
          "Apex Systems"
        ],
        [
          "11:00 - 11:30 am",
          "Brian Miller",
          "Database Admin",
          "Tech Innovators"
        ],
        [
          "11:30 - 12:00 pm",
          "Amanda Hayes",
          "QA Engineer",
          "NextGen Data"
        ]
      ],
      "questions": [
        {
          "no": 8,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "Hello. I'm a member of the hiring committee and I seem to have misplaced today's interview schedule. Could you answer a few questions about it? Where will the interviews take place and what time does the last interview end?",
          "answerKey": "The interviews will take place in Conference Room B, and the last interview ends at 12:00 pm."
        },
        {
          "no": 9,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "I was told that there is an interview for the project manager position at 10:30 a.m. Is that correct?",
          "answerKey": "No. The 10:30 interview with David Ross for the Project Manager position has been canceled."
        },
        {
          "no": 10,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 30,
          "prompt": "I know several applicants used to work at Tech Innovators. Could you give me all the details about the interviews for those candidates?",
          "answerKey": "Two applicants used to work at Tech Innovators: Sarah Jenkins, a UX Designer, from 9:00 to 9:30 am, and Brian Miller, a Database Admin, from 11:00 to 11:30 am.",
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
          "prompt": "Would you rather take a single extended vacation once a year or take several short trips over the year? Give specific reasons or examples to support your opinion."
        }
      ]
    }
  ]
});
