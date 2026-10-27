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
  email: "nithinekambaram@gmail.com",
  whatsapp: "916302276072",

  /* ---------- Background music ----------
     The site uses a gentle original instrumental loop made in the browser. */

  /* ---------- Live counter starts here ---------- */
  firstSaw: "2024-07-15T10:00:00+05:30",

  /* ---------- Background music file ----------
     Drop your audio file into the "media" folder, then set the filename here.
     Supported: mp3 / ogg / wav / m4a
     Leave as "" to use the built-in synthesised music.                       */
  bgmFile: "bgm.mp3",

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
      media: [{ file: "ch1-first-sight.jpg.jpg", caption: "where it all began" }]
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
      media: [{ file: "ch2-classes.jpg.jpg", caption: "every single class" }]
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
      media: [{ file: "ch3-first-photo.jpg.jpg", caption: "finally, a name" }]
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
        { file: "ch4-iskcon.jpg.jpg", caption: "orange & white" },
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
        { file: "ch5-asha-tea.jpg.jpg", caption: "one more tea, please" },
        { file: "ch5-video.mp4.mp4", caption: "us" }
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
      media: [{ file: "ch7-goodbye.jpg.jpg", caption: "" }]
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
        { file: "ch8-reunion.jpg.jpg", caption: "hello again" },
        { file: "ch8-video.mp4.MOV", caption: "Hyderabad days" }
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
      media: [{ file: "ch9-visit.jpg.jpg", caption: "worth every journey" }]
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
        { file: "ch10-my-birthday.jpg.jpg", caption: "the best first wish" },
        { file: "ch10-cake.jpg.jpg", caption: "the cake" },
        { file: "ch10-video.mp4.mp4", caption: "12:00 AM" }
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
      media: [{ file: "IMG20260724164947.jpg", caption: "soon, every day" },
        { file: "ch11-video.mp4.mp4", caption: "coming home" }
      ]
    }
  ],

  /* ---------- Intermission reel (middle of the movie) ---------- */
  reel: [
    "reel-01.jpg.mp4", "reel-02.jpg.mp4", "reel-03.jpg.mp4",
    "reel-04.jpg.jpg", "reel-05.jpg.jpg", "reel-06.jpg.MOV"
  ],

  /* ---------- Her birthday ---------- */
  birthdayPhoto: { file: "IMG-20260628-WA0108.jpg", caption: "the birthday girl" },
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
  ],

  /* ---------- Our Gallery ----------
     Add photo filenames (inside the "gallery" folder) here.
     Optionally add a caption:
       "photo.jpg"                              or
       { file: "photo.jpg", caption: "caption" }
     Supported: jpg / jpeg / png / webp / gif
     Leave the array empty to hide the gallery section.             */
  gallery: [
    "IMG-20250316-WA0004.jpg",
    "IMG-20250629-WA0002.jpg",
    "IMG-20250629-WA0006.jpg",
    "IMG-20250629-WA0022.jpg",
    "IMG-20260729-WA0004_Original.JPG",
    "IMG-20260729-WA0009_Original.JPG",
    "IMG-20260729-WA0028_Original.JPG",
    "IMG20250307170031.jpg",
    "IMG20250315212720.jpg",
    "IMG20250628150508.jpg",
    "IMG20250628150509.jpg",
    "Snapchat-1211462437.jpg",
    "Snapchat-1389014999.jpg",
    "Snapchat-1576949318.jpg",
    "Snapchat-1723982872.jpg",
    "Snapchat-1723993784.jpg",
    "Snapchat-1778220124.jpg",
    "Snapchat-1815410216.jpg",
    "Snapchat-2046498130.jpg",
    "Snapchat-2093307892.jpg",
    "Snapchat-379566628.jpg",
    "Snapchat-386007320.jpg",
    "Snapchat-549535806.jpg",
    "Snapchat-855398904.jpg",
    "Snapchat-891332826.jpg",
    "Snapchat-959490935.jpg"
  ]
};
