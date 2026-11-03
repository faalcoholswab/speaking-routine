/* mock-07 — YouTube 모의고사
   문항·표 글자는 capture/mock-07/ 초안에서 바꾸지 않고 옮겼다.
   출처 주소는 이 파일에 남기지 않는다. */
window.MOCK_EXAMS = window.MOCK_EXAMS || [];
window.MOCK_EXAMS.push({
  "id": "mock-07",
  "rights": "confirmed",
  "title": "모의고사 7",
  "subtitle": "최신 모의고사2",
  "durationSeconds": 905,
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
          "text": "Starting this autumn, Oakwood Cultural Society will host monthly lectures delivered by famous authors. Key themes include enhancing writing techniques, managing personal finances wisely, and practicing healthy lifestyle choices. If you are interested in attending, please sign up with the volunteer at the information counter.",
          "prompt": "Read the text aloud."
        },
        {
          "no": 2,
          "type": "read-aloud",
          "prepSeconds": 45,
          "responseSeconds": 45,
          "text": "Welcome to the opening of the new Riverside Fitness Center. We are delighted to showcase our modern facilities, most of which will open early next week. Members can take advantage of complimentary fitness assessments, spacious locker rooms, and group exercise classes. Furthermore, guests can use the indoor swimming pool throughout the day.",
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
          "image": "mock-07/p2-q3.webp",
          "keyElements": [
            "a walkway along a river",
            "a man in a red hat and a dark coat",
            "a man walking a dog on a leash",
            "a brown and white dog",
            "a woman in a white dress carrying a tote bag",
            "green benches and trees",
            "boats on the river",
            "buildings in the background"
          ]
        },
        {
          "no": 4,
          "type": "picture-description",
          "prepSeconds": 45,
          "responseSeconds": 30,
          "prompt": "Describe the picture in as much detail as you can.",
          "image": "mock-07/p2-q4.webp",
          "keyElements": [
            "an outdoor market",
            "fruit and vegetable stands",
            "a woman in a black shirt picking fruit",
            "a white tote bag",
            "price signs on the fruit",
            "many people walking through the market",
            "a woman with a brown shoulder bag",
            "a wooden crate"
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
      "context": "Imagine that a Canadian marketing company is conducting a survey about spending time outdoors. You have agreed to participate in an interview about outdoor activities.",
      "questions": [
        {
          "no": 5,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "Do you spend more time outside these days compared to when you were younger? Why or why not?"
        },
        {
          "no": 6,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "What is the name of the nearest park from your house, and how many times a week do you visit there?"
        },
        {
          "no": 7,
          "type": "interview",
          "prepSeconds": 3,
          "responseSeconds": 30,
          "prompt": "Which of the following activities do you prefer to do in your free time outside? Choose one of the options and explain why. - Relaxing in a local park - Going on a camping trip - Running outdoors"
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
      "context": "Blue Ridge Kayak Park, Kayaking Routes — Opening hours: 7 AM to 7 PM — Entrance Fee: $10 — *Keep in mind to always wear a life jacket.",
      "readingSeconds": 45,
      "tableImage": "mock-07/p4-table.webp",
      "table": [
        [
          "Route",
          "Distance",
          "Level"
        ],
        [
          "Wildwood Route",
          "14 km",
          "Advanced"
        ],
        [
          "Summit Route",
          "11.5 km",
          "Advanced"
        ],
        [
          "Echo Canyon Route",
          "8.5 km",
          "Intermediate"
        ],
        [
          "Crystal Lake Route",
          "7 km",
          "Intermediate"
        ],
        [
          "Maple Forest Route",
          "4.5 km",
          "Basic"
        ],
        [
          "Sunset Ridge Route",
          "3 km",
          "Basic"
        ]
      ],
      "questions": [
        {
          "no": 8,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "Hi, I'm calling to get some information about Blue Ridge Kayak Park. I found your kayaking route schedule online, but I have a few questions before I go. What are the opening hours of the park and how much does it cost to enter?",
          "answerKey": "The park is open from 7 AM to 7 PM, and the entrance fee is $10."
        },
        {
          "no": 9,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 15,
          "prompt": "I was told that the Echo Canyon route is 12 km long. Is this true?",
          "answerKey": "No. The Echo Canyon Route is 8.5 km long, not 12 km."
        },
        {
          "no": 10,
          "type": "information-response",
          "prepSeconds": 3,
          "responseSeconds": 30,
          "prompt": "I'm an experienced kayaker looking for a challenge. Could you tell me all the details about advanced routes?",
          "answerKey": "There are two advanced routes: the Wildwood Route, which is 14 km, and the Summit Route, which is 11.5 km.",
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
          "prompt": "Do you agree or disagree with the following statement? Practice can help you become a successful speaker. Give specific reasons or examples to support your opinion."
        }
      ]
    }
  ]
});
