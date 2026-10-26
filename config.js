/* =====================================================================
   CONFIG — the ONLY file you need to edit, Nithin.
   Text, dates, photo/video names, theme, passcode and contact details.
   ===================================================================== */

window.CONFIG = {

  her: "Aswitha",
  me:  "Nithin",

  /* ---------- Template ----------
     "cinema"  → black & champagne gold, rose glow   (default)
     "krishna" → midnight blue & saffron (the ISKCON day)
     "blush"   → soft pink & cream, light and dreamy                       */
  theme: "cinema",

  /* ---------- Birthday lock ----------
     Before this moment the link shows a countdown.
     Add ?preview to the link to skip it while testing.                   */
  birthday: "2026-10-28T00:00:00+05:30",
  lockUntilBirthday: true,

  /* ---------- Movie ticket (secret code) ----------                      */
  passcode: "15072024",
  passcodeHint: "Hint: the day I first saw you (DDMMYYYY)",

  /* ---------- Her reply ----------
     At the end she can write back to you. It is emailed to you through
     formsubmit.co (first use sends you an "Activate" email — click it!).
     WhatsApp is the backup. Set replyBox: false to hide this completely. */
  replyBox: true,
  email: "your-email@gmail.com",
  whatsapp: "919999999999",

  /* ---------- Music (optional) ---------- */
  music: "media/our-song.mp3",

  /* ---------- Live counter starts here ---------- */
  firstSaw: "2024-07-15T10:00:00+05:30",

  /* ---------- The story ----------
     media: file names inside the "media" folder, either
       "photo.jpg"                         or
       { file: "photo.jpg", caption: "handwritten caption" }
     Photos: jpg/jpeg/png/webp/gif   Videos: mp4/webm/mov                  */
  chapters: [
    {
      date: "15 · 07 · 2024",
      place: "Besant Technologies, Bengaluru",
      title: "The Girl in the Blue T-shirt",
      text: [
        "The first time I saw you, you were standing in the training institute — blue T-shirt, white jeans, a brown hoodie, and your hair tied back.",
        "No effort, just naturally beautiful. I fell for you that very day, and I have never forgotten that picture of you."
      ],
      media: [{ file: "ch1-first-sight.jpg", caption: "where it all began" }]
    },
    {
      date: "July – August 2024",
      place: "Every single class",
      title: "Classes, Just for You",
      text: [
        "Days passed. I kept going to class — honestly, mostly to see you.",
        "July ended. August ended. One morning I promised myself: today, I will finally talk to her.",
        "And that same day, you disappeared."
      ],
      media: [{ file: "ch2-classes.jpg", caption: "every single class" }]
    },
    {
      date: "Autumn 2024",
      place: "Searching the whole city",
      title: "The Girl Without a Name",
      text: [
        "I searched the whole institute. You weren't anywhere — you had left Bengaluru, and I didn't even know your name.",
        "So I became friends with Vamsi and Vinod, because they knew Pushpalatha, who knew you. Slowly I found your name… and then, for the first time, your photo.",
        "And then you came back to Bengaluru. From that day, I was the happiest person alive."
      ],
      media: [{ file: "ch3-first-photo.jpg", caption: "finally, a name" }]
    },
    {
      date: "08 · 10 · 2024",
      place: "ISKCON Temple, Bengaluru",
      title: "In Front of Krishna",
      text: [
        "Our batch went to the ISKCON temple, and I saw the most beautiful version of you — in orange and white.",
        "We spent time together in front of Lord Krishna. I truly believe that day was His doing. I fell for you even harder, and our journey began."
      ],
      media: [
        { file: "ch4-iskcon.jpg", caption: "orange & white" },
        { file: "ch4-iskcon-2.jpg", caption: "Krishna's plan" }
      ]
    },
    {
      date: "Every evening",
      place: "Asha Tea Stall",
      title: "Tea at Asha",
      text: [
        "I never had the habit of drinking tea. For you, I started drinking it every single day — just for one more chance to meet you.",
        "We talked, we shared everything. The batch slowly drifted apart, but the two of us stayed strong."
      ],
      media: [
        { file: "ch5-asha-tea.jpg", caption: "one more tea, please" },
        { file: "ch5-video.mp4", caption: "us" }
      ]
    },
    {
      date: "24 · 07 · 2025",
      place: "Bengaluru → Hyderabad",
      title: "The First Goodbye",
      text: [
        "You got your job and left Bengaluru for Hyderabad. I was stuck in Bengaluru, missing you more than I can write.",
        "So I did the only thing that made sense — I followed you."
      ],
      media: [{ file: "ch7-goodbye.jpg", caption: "" }]
    },
    {
      date: "20 · 09 · 2025",
      place: "Hyderabad",
      title: "I Saw You Again",
      text: [
        "I stood in front of you again, and I was the happiest person in the world.",
        "I lived in Hyderabad for you — a small job, texting you, meeting you whenever I could. The best version of me is the one that was with you."
      ],
      media: [
        { file: "ch8-reunion.jpg", caption: "hello again" },
        { file: "ch8-video.mp4", caption: "Hyderabad days" }
      ],
      gap: { from: "2025-07-24T00:00:00+05:30", to: "2025-09-20T00:00:00+05:30", label: "How long I waited to see you again" }
    },
    {
      date: "17 · 05 · 2026",
      place: "Hyderabad → Bengaluru",
      title: "The Longest Night",
      text: [
        "Destiny played again. Your project took you back to Bengaluru.",
        "That night I cried until morning. My mind went blank — I couldn't picture Hyderabad without you.",
        "Since then I come to Bengaluru every month just to see you. The moment I see your smile, every problem I have disappears."
      ],
      media: [{ file: "ch9-visit.jpg", caption: "worth every journey" }]
    },
    {
      date: "28 · 06 · 2026 · 12:00 AM",
      place: "My 26th birthday",
      title: "My First Wish",
      text: [
        "Midnight. A small cake, a small candle — and you.",
        "You were the first person to wish me. I heard your voice say “Happy birthday, Nithin,” and I made my wish: every birthday of my life, the first wish should be yours."
      ],
      media: [
        { file: "ch10-my-birthday.jpg", caption: "the best first wish" },
        { file: "ch10-cake.jpg", caption: "the cake" },
        { file: "ch10-video.mp4", caption: "12:00 AM" }
      ]
    },
    {
      date: "Now",
      place: "Coming home to Bengaluru",
      title: "Closing the Distance",
      text: [
        "I'm changing my job to Bengaluru. No more counting days between visits.",
        "You are my biggest supporter, and the reason I keep smiling."
      ],
      media: [{ file: "ch11-us.jpg", caption: "soon, every day" },
        { file: "ch11-video.mp4", caption: "coming home" }
      ]
    }
  ],

  /* ---------- Intermission reel (middle of the movie) ---------- */
  reel: [
    "reel-01.jpg", "reel-02.jpg", "reel-03.jpg",
    "reel-04.jpg", "reel-05.mp4", "reel-06.jpg"
  ],

  /* ---------- Her birthday ---------- */
  birthdayPhoto: { file: "her-birthday.jpg", caption: "the birthday girl" },
  birthdayNote:
    "On my birthday, you gave me my first wish. Tonight, I want to be the first to give you yours. Happy birthday, Aswitha — thank you for being my biggest supporter, my calm, and my favourite smile.",

  /* ---------- The ending ----------
     chat: messages from you, shown in a chat window (she appears "typing…")
     last: the final line on screen                                        */
  endingChat: [
    "Happy birthday, Aswitha 🎂",
    "I love you in 1,000,000,000 ways",
    "I'm still waiting for your reply ❤️"
  ],
  endingLast: "…and I'll keep waiting, as long as it takes.",

  /* ---------- End credits ---------- */
  credits: [
    ["The Heroine", "Aswitha"],
    ["The Boy Who Waited", "Nithin"],
    ["Directed by", "Lord Krishna"],
    ["Tea Supplied by", "Asha Tea Stall"],
    ["Special Thanks", "Vamsi · Vinod · Pushpalatha"],
    ["Filmed on Location", "Bengaluru · Hyderabad · Bengaluru"],
    ["Where It All Began", "Besant Technologies"]
  ]
};
